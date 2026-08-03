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
  caseShareCalculation,
  dentistProfileForUser,
  filterPatientsForDentist,
  filterPatientsForActiveShift,
  formatCurrency,
  initials,
  mobileNumber,
  netAmount,
  patientArray,
  patientDepartmentLabel,
  patientName,
  regNo,
} from "../utils/patientHelpers";

const PAGE_COPY = {
  patients: {
    title: "Case List",
    eyebrow: "Dentist",
    description: "Cases linked with the selected dentist.",
  },
  summary: {
    title: "Summary of Cases",
    eyebrow: "Dentist",
    description: "Summary table ready for the detailed format.",
  },
  salary: {
    title: "Salary Based Cases",
    eyebrow: "Dentist",
    description: "Salary based case list.",
  },
  percentage: {
    title: "Percentage Cases",
    eyebrow: "Dentist",
    description: "Percentage based case list with 15% share.",
  },
  referral: {
    title: "Referral Cases",
    eyebrow: "Dentist",
    description: "Referral based case list.",
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
      completed: patientSummaries.filter(({ summary }) => summary.isCompletedCase).length,
      toBeAppointed: patientSummaries.filter(({ summary }) => summary.isExpected).length,
      value: patients.reduce((sum, patient) => sum + netAmount(patient), 0),
      share: patients.reduce((sum, patient) => sum + caseShareCalculation(patient).share, 0),
    }),
    [patients, patientSummaries]
  );
  const isPercentageDentist = dentistProfile.shiftId === "evening" || mode === "percentage";

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
              New case
            </button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="metrics-grid">
          <div className="metric-card gold-bordered">
            <div className="metric-label">Cases</div>
            <div className="metric-value">{loading ? "..." : totals.patients}</div>
            <div className="metric-detail">Visible cases</div>
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
            <div className="metric-label">Expected Cases</div>
            <div className="metric-value">{loading ? "..." : totals.toBeAppointed}</div>
            <div className="metric-detail">Plans missing date/time</div>
          </div>
          <div className="metric-card gold-bordered">
            <div className="metric-label">Treatment Value</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.value)}</div>
            <div className="metric-detail">Invoice net amount</div>
          </div>
          <div className="metric-card gold-bordered">
            <div className="metric-label">15% Share</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.share)}</div>
            <div className="metric-detail">After 10% material and lab expenses</div>
          </div>
        </section>

        <section className="panel gold-bordered">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>Contact</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Net Amount</th>
                  <th>Total Expense</th>
                  <th>15% Share</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="9">Loading cases...</td>
                  </tr>
                )}
                {!loading && patients.length === 0 && (
                  <tr>
                    <td colSpan="9">No cases found.</td>
                  </tr>
                )}
                {patientSummaries.map(({ patient, summary }) => {
                  const share = caseShareCalculation(patient);

                  return (
                  <tr key={patient._id || regNo(patient)} className={isPercentageDentist ? "percentage-case-row" : ""}>
                    <td>
                      <div className="patient-cell">
                        <span className="patient-avatar">{initials(patientName(patient))}</span>
                        <strong>{patientName(patient)}</strong>
                        {isPercentageDentist && <small className="table-subtext">Percentage case</small>}
                      </div>
                    </td>
                    <td>
                      <span className="pill">{regNo(patient) || "-"}</span>
                    </td>
                    <td>{mobileNumber(patient)}</td>
                    <td>{patientDepartmentLabel(patient)}</td>
                    <td>
                      <span className={summary.category === "ongoing" ? "pill warning" : summary.isCompletedCase ? "pill success" : "pill"}>
                        {summary.category === "ongoing"
                          ? "On going"
                          : summary.isExpected
                            ? "Expected"
                            : "Completed"}
                      </span>
                    </td>
                    <td>{formatCurrency(netAmount(patient))}</td>
                    <td>{formatCurrency(share.totalExpense)}</td>
                    <td>
                      <span className="pill success">{formatCurrency(share.share)}</span>
                    </td>
                    <td>{formatCurrency(balanceDue(patient))}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default DentistWorkspace;
