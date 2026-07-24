import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  appointmentArray,
  appointmentRequestParams,
  filterManualAppointmentsForUser,
  patientAppointmentSummary,
} from "../utils/appointmentHelpers";
import {
  activeShiftId,
  balanceDue,
  dentistProfileForUser,
  filterPatientsForDentist,
  filterPatientsForActiveShift,
  formatCurrency,
  initials,
  mobileNumber,
  netAmount,
  patientArray,
  patientName,
  regNo,
} from "../utils/patientHelpers";

const PAGE_COPY = {
  patients: {
    title: "Client List",
    eyebrow: "Dentist",
    description: "Clients linked with the selected dentist.",
  },
  summary: {
    title: "Summary of Clients",
    eyebrow: "Dentist",
    description: "Summary table ready for the detailed format.",
  },
  salary: {
    title: "Client List Salary Based",
    eyebrow: "Dentist",
    description: "Salary based client list.",
  },
  percentage: {
    title: "Client List Percentage Base",
    eyebrow: "Dentist",
    description: "Percentage based client list.",
  },
  referral: {
    title: "Client List Referral Based",
    eyebrow: "Dentist",
    description: "Referral based client list.",
  },
};

function DentistWorkspace({ activePage, setActivePage, handleLogout, mode = "patients" }) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const dentistProfile = dentistProfileForUser(user);
  const dentistName = dentistProfile.dentistName || user.name || "Dentist";
  const copy = PAGE_COPY[mode] || PAGE_COPY.patients;
  const [patients, setPatients] = useState([]);
  const [manualAppointments, setManualAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        const shiftPatients = filterPatientsForActiveShift(patientArray(patientsResponse.data));

        setPatients(filterPatientsForDentist(shiftPatients, user));
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
  }, []);

  const patientSummaries = useMemo(
    () => patients.map((patient) => ({ patient, summary: patientAppointmentSummary(patient, manualAppointments) })),
    [patients, manualAppointments]
  );

  const totals = useMemo(
    () => ({
      patients: patients.length,
      ongoing: patientSummaries.filter(({ summary }) => summary.category === "ongoing").length,
      completed: patientSummaries.filter(({ summary }) => summary.category === "completed").length,
      toBeAppointed: patientSummaries.filter(({ summary }) => summary.category === "to-be-appointed").length,
      value: patients.reduce((sum, patient) => sum + netAmount(patient), 0),
    }),
    [patients, patientSummaries]
  );

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero dentist-hero">
          <div>
            <div className="eyebrow">{copy.eyebrow}</div>
            <h1>{copy.title}</h1>
            <p>
              {dentistName}. {copy.description}
            </p>
          </div>
          <div className="hero-actions no-print">
            <button className="btn btn-primary" onClick={() => setActivePage("patients")}>
              New client
            </button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="metrics-grid">
          <div className="metric-card gold-bordered">
            <div className="metric-label">Clients</div>
            <div className="metric-value">{loading ? "..." : totals.patients}</div>
            <div className="metric-detail">Visible records</div>
          </div>
          <div className="metric-card gold-bordered">
            <div className="metric-label">On going</div>
            <div className="metric-value">{loading ? "..." : totals.ongoing}</div>
            <div className="metric-detail">With appointments</div>
          </div>
          <div className="metric-card gold-bordered">
            <div className="metric-label">Completed</div>
            <div className="metric-value">{loading ? "..." : totals.completed}</div>
            <div className="metric-detail">Visits completed</div>
          </div>
          <div className="metric-card gold-bordered">
            <div className="metric-label">To appoint</div>
            <div className="metric-value">{loading ? "..." : totals.toBeAppointed}</div>
            <div className="metric-detail">Plans missing date/time</div>
          </div>
          <div className="metric-card gold-bordered">
            <div className="metric-label">Treatment value</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.value)}</div>
            <div className="metric-detail">Invoice net amount</div>
          </div>
        </section>

        <section className="panel gold-bordered">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Reg No</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Net Amount</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6">Loading clients...</td>
                  </tr>
                )}
                {!loading && patients.length === 0 && (
                  <tr>
                    <td colSpan="6">No clients found.</td>
                  </tr>
                )}
                {patientSummaries.map(({ patient, summary }) => (
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
                      <span className={summary.category === "ongoing" ? "pill warning" : summary.category === "completed" ? "pill success" : "pill"}>
                        {summary.category === "ongoing"
                          ? "On going"
                          : summary.category === "to-be-appointed"
                            ? "To be appointed"
                            : "Completed"}
                      </span>
                    </td>
                    <td>{formatCurrency(netAmount(patient))}</td>
                    <td>{formatCurrency(balanceDue(patient))}</td>
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

export default DentistWorkspace;
