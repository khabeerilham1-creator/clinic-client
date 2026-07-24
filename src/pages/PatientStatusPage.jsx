import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  appointmentArray,
  appointmentRequestParams,
  filterManualAppointmentsForUser,
  patientAppointmentSummary,
  standaloneManualAppointments,
} from "../utils/appointmentHelpers";
import {
  activeShiftId,
  balanceDue,
  filterPatientsForDentist,
  filterPatientsForActiveShift,
  formatCurrency,
  initials,
  mobileNumber,
  patientArray,
  patientName,
  regNo,
} from "../utils/patientHelpers";

function PatientStatusPage({ activePage, setActivePage, handleLogout, mode = "ongoing" }) {
  const [patients, setPatients] = useState([]);
  const [manualAppointments, setManualAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const role = sessionStorage.getItem("role") || user.role || "";
  const modeDetails = {
    ongoing: {
      title: "On Going Client",
      description: "Clients with appointment date and time.",
      empty: "No ongoing clients found.",
    },
    completed: {
      title: "Completed Client",
      description: "Clients whose visits are completed.",
      empty: "No completed client visits found.",
    },
    "to-be-appointed": {
      title: "To Be Appointed",
      description: "Clients whose planned sequence needs date or time.",
      empty: "No clients are waiting for appointment date/time.",
    },
  };
  const currentMode = modeDetails[mode] || modeDetails.ongoing;

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError("");

      try {
        const [patientsResponse, appointmentsResponse] = await Promise.all([
          api.get("/patients", {
            params: { limit: 1000, sort: "createdAt", order: -1, shift: activeShiftId() },
          }),
          api.get("/appointments", {
            params: appointmentRequestParams(),
          }),
        ]);
        const shiftedPatients = filterPatientsForActiveShift(patientArray(patientsResponse.data));
        const rolePatients = ["dentist", "doctor"].includes(role)
          ? filterPatientsForDentist(shiftedPatients, { ...user, role })
          : shiftedPatients;

        setPatients(rolePatients);
        setManualAppointments(filterManualAppointmentsForUser(appointmentArray(appointmentsResponse.data), user));
      } catch (requestError) {
        console.error(requestError);
        setPatients([]);
        setManualAppointments([]);
        setError("");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [role]);

  const visiblePatients = useMemo(
    () =>
      patients
        .map((patient) => ({
          patient,
          summary: patientAppointmentSummary(patient, manualAppointments),
        }))
        .filter(({ summary }) => summary.category === mode),
    [patients, manualAppointments, mode]
  );
  const manualRows = useMemo(
    () => standaloneManualAppointments(patients, manualAppointments, mode),
    [patients, manualAppointments, mode]
  );
  const totalRows = visiblePatients.length + manualRows.length;

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero">
          <div>
            <div className="eyebrow">Client status</div>
            <h1>{currentMode.title}</h1>
            <p>{totalRows} records found. {currentMode.description}</p>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="panel gold-bordered">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Reg No</th>
                  <th>Mobile</th>
                  <th>Appointments</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="5">Loading clients...</td>
                  </tr>
                )}
                {!loading && totalRows === 0 && (
                  <tr>
                    <td colSpan="5">{currentMode.empty}</td>
                  </tr>
                )}
                {visiblePatients.map(({ patient, summary }) => (
                  <tr key={patient._id || regNo(patient)}>
                    <td>
                      <div className="patient-cell">
                        <span className="patient-avatar">{initials(patientName(patient))}</span>
                        <strong>{patientName(patient)}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="pill">{regNo(patient) || "-"}</span>
                    </td>
                    <td>{mobileNumber(patient)}</td>
                    <td>
                      {mode === "to-be-appointed"
                        ? `${summary.missingCount} missing`
                        : mode === "completed"
                          ? `${summary.completedCount} done`
                          : `${summary.scheduledCount} scheduled`}
                    </td>
                    <td>{formatCurrency(balanceDue(patient))}</td>
                  </tr>
                ))}
                {manualRows.map((appointment) => (
                  <tr key={`manual-status-${appointment.id}`}>
                    <td>
                      <div className="patient-cell">
                        <span className="patient-avatar">{initials(appointment.clientName)}</span>
                        <div>
                          <strong>{appointment.clientName}</strong>
                          <small>{appointment.purpose}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="pill">Manual</span>
                    </td>
                    <td>{appointment.mobileNumber}</td>
                    <td>{mode === "completed" ? "1 done" : "1 scheduled"}</td>
                    <td>-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default PatientStatusPage;
