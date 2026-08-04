import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  appointmentArray,
  appointmentRequestParams,
  expectedAppointmentStatus,
  filterManualAppointmentsForUser,
  patientToBeAppointmentCase,
  patientAppointmentSummary,
} from "../utils/appointmentHelpers";
import { openPatientFile } from "../utils/clientNavigation";
import {
  activeShiftId,
  balanceDue,
  filterPatientsForDentist,
  filterPatientsForActiveShift,
  formatCurrency,
  initials,
  mobileNumber,
  patientArray,
  patientDepartmentLabel,
  patientName,
  regNo,
} from "../utils/patientHelpers";

function PatientStatusPage({ activePage, setActivePage, handleLogout, mode = "ongoing" }) {
  const [patients, setPatients] = useState([]);
  const [manualAppointments, setManualAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const role = sessionStorage.getItem("role") || user.role || "";
  const modeDetails = {
    ongoing: {
      title: "On Going Cases",
      description: "Cases with appointment date and time.",
      empty: "No ongoing cases found.",
    },
    "completed-cases": {
      title: "Completed Cases",
      description: "Cases whose last planned appointment is done.",
      empty: "No completed cases found.",
    },
    expected: {
      title: "Expected Cases",
      description: "Expected cases are checkup-only cases whose appointment is not confirmed.",
      empty: "No expected cases found.",
    },
    "to-be-appointment": {
      title: "To Be Appointment",
      description: "Expected cases marked as To Be Appointment.",
      empty: "No to-be-appointment cases found.",
    },
    "follow-up": {
      title: "Follow Up",
      description: "Only cases marked Follow Up Needed: Yes in Clinical Exam.",
      empty: "No follow-up cases found.",
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
        .filter(({ patient, summary }) => {
          if (mode === "follow-up") {
            return summary.isFollowUp;
          }

          if (mode === "to-be-appointment") {
            return patientToBeAppointmentCase(patient);
          }

          if (mode === "expected") {
            return summary.isExpected;
          }

          return summary.category === mode;
        }),
    [patients, manualAppointments, mode]
  );
  const totalRows = visiblePatients.length;
  const showExpectedStatus = mode === "expected" || mode === "to-be-appointment";
  const columnCount = showExpectedStatus ? 7 : 6;

  const updateExpectedStatus = async (patient, status) => {
    if (!patient?._id) {
      setMessage("Patient ID is missing.");
      return;
    }

    const payload = {
      ...patient,
      appointmentStatus: status,
      checkup: {
        ...(patient.checkup || {}),
        appointmentStatus: status,
      },
    };

    try {
      await api.put(`/patients/${patient._id}`, payload);
      setPatients((current) =>
        current.map((item) => (item._id === patient._id ? payload : item))
      );
      setMessage("Appointment status updated.");
    } catch (requestError) {
      console.error(requestError);
      setMessage("Appointment status could not be updated.");
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero">
          <div>
            <div className="eyebrow">Case status</div>
            <h1>{currentMode.title}</h1>
            <p>{totalRows} records found. {currentMode.description}</p>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}
        {message && <div className="notice">{message}</div>}

        <section className="panel gold-bordered">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Appointments</th>
                  {showExpectedStatus && <th>Status</th>}
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={columnCount}>Loading cases...</td>
                  </tr>
                )}
                {!loading && totalRows === 0 && (
                  <tr>
                    <td colSpan={columnCount}>{currentMode.empty}</td>
                  </tr>
                )}
                {visiblePatients.map(({ patient, summary }) => (
                  <tr key={patient._id || regNo(patient)}>
                    <td>
                      <div className="patient-cell">
                        <span className="patient-avatar">{initials(patientName(patient))}</span>
                        <button className="patient-link" type="button" onClick={() => openPatientFile(patient, setActivePage)}>
                          {patientName(patient)}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="pill">{regNo(patient) || "-"}</span>
                    </td>
                    <td>{patientDepartmentLabel(patient)}</td>
                    <td>{mobileNumber(patient)}</td>
                    <td>
                      {mode === "expected"
                        ? "Checkup done, appointment expected"
                        : mode === "to-be-appointment"
                          ? "To be appointed"
                        : mode === "follow-up"
                          ? "Follow up needed"
                        : mode === "completed-cases"
                          ? summary.phaseLabel || "The case has been successfully completed."
                          : `${summary.scheduledCount} scheduled`}
                    </td>
                    {showExpectedStatus && (
                      <td>
                        {mode === "expected" ? (
                          <div className="segmented-control compact-segmented">
                            {[
                              ["silent", "Silent"],
                              ["to-be-appointment", "To Be Appointment"],
                            ].map(([value, label]) => (
                              <button
                                key={value}
                                type="button"
                                className={expectedAppointmentStatus(patient) === value ? "active" : ""}
                                onClick={() => updateExpectedStatus(patient, value)}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="pill warning">To Be Appointment</span>
                        )}
                      </td>
                    )}
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

export default PatientStatusPage;
