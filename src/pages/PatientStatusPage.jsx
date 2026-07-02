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
  patientArray,
  patientName,
  regNo,
  upcomingVisits,
} from "../utils/patientHelpers";

function PatientStatusPage({ activePage, setActivePage, handleLogout, mode = "ongoing" }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isOngoing = mode === "ongoing";
  const title = isOngoing ? "On Going Client" : "Completed Client";

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
        setPatients([]);
        setError("");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const visiblePatients = useMemo(
    () =>
      patients.filter((patient) =>
        isOngoing ? upcomingVisits(patient).length > 0 : upcomingVisits(patient).length === 0
      ),
    [patients, isOngoing]
  );

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero">
          <div>
            <div className="eyebrow">Client status</div>
            <h1>{title}</h1>
            <p>{visiblePatients.length} client records found.</p>
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
                {!loading && visiblePatients.length === 0 && (
                  <tr>
                    <td colSpan="5">No records found.</td>
                  </tr>
                )}
                {visiblePatients.map((patient) => (
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
                    <td>{upcomingVisits(patient).length}</td>
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
