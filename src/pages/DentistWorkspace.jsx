import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  activeShiftId,
  balanceDue,
  filterPatientsForActiveShift,
  formatCurrency,
  initials,
  mobileNumber,
  netAmount,
  patientArray,
  patientName,
  regNo,
  upcomingVisits,
} from "../utils/patientHelpers";

const PAGE_COPY = {
  patients: {
    title: "Patient List",
    eyebrow: "Dentist",
    description: "Patients linked with the selected dentist.",
  },
  summary: {
    title: "Summary of Patients",
    eyebrow: "Dentist",
    description: "Summary table ready for the detailed format.",
  },
  salary: {
    title: "Patient List Salary Based",
    eyebrow: "Dentist",
    description: "Salary based patient list.",
  },
  percentage: {
    title: "Patient List Percentage Base",
    eyebrow: "Dentist",
    description: "Percentage based patient list.",
  },
  referral: {
    title: "Patient List Referral Based",
    eyebrow: "Dentist",
    description: "Referral based patient list.",
  },
};

function DentistWorkspace({ activePage, setActivePage, handleLogout, mode = "patients" }) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const dentistName = user.dentistName || user.name || "Dentist";
  const copy = PAGE_COPY[mode] || PAGE_COPY.patients;
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/patients", {
          params: { limit: 500, sort: "createdAt", order: -1, shift: activeShiftId() },
        });

        setPatients(filterPatientsForActiveShift(patientArray(response.data)));
      } catch (requestError) {
        console.error(requestError);
        setError("Dentist patients could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const totals = useMemo(
    () => ({
      patients: patients.length,
      ongoing: patients.filter((patient) => upcomingVisits(patient).length > 0).length,
      completed: patients.filter((patient) => upcomingVisits(patient).length === 0).length,
      value: patients.reduce((sum, patient) => sum + netAmount(patient), 0),
    }),
    [patients]
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
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="metrics-grid">
          <div className="metric-card gold-bordered">
            <div className="metric-label">Patients</div>
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
            <div className="metric-detail">No appointment pending</div>
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
                  <th>Patient</th>
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
                    <td colSpan="6">Loading patients...</td>
                  </tr>
                )}
                {!loading && patients.length === 0 && (
                  <tr>
                    <td colSpan="6">No patients found.</td>
                  </tr>
                )}
                {patients.map((patient) => (
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
                      <span className={upcomingVisits(patient).length > 0 ? "pill warning" : "pill success"}>
                        {upcomingVisits(patient).length > 0 ? "On going" : "Completed"}
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
