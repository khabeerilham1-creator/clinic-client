import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  activeShiftId,
  filterPatientsForActiveShift,
  formatDateDisplay,
  patientArray,
  patientName,
} from "../utils/patientHelpers";

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

function LabFollowUp({ activePage, setActivePage, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/patients", {
        params: { limit: 1000, sort: "createdAt", order: -1, shift: activeShiftId() },
      });
      setPatients(filterPatientsForActiveShift(patientArray(response.data)));
    } catch (requestError) {
      console.error(requestError);
      setPatients([]);
      setError("Lab follow up could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const rows = useMemo(() => {
    const query = normalizeText(search);

    return patients
      .flatMap((patient) =>
        (patient.labRecords || []).map((record) => ({
          ...record,
          patientName: patientName(patient),
        }))
      )
      .filter((row) => {
        if (!query) {
          return true;
        }

        return (
          normalizeText(row.patientName).includes(query) ||
          normalizeText(row.job || row.details).includes(query) ||
          normalizeText(row.shade).includes(query) ||
          normalizeText(row.status).includes(query)
        );
      })
      .sort((a, b) => String(b.date || b.sendingDate || "").localeCompare(String(a.date || a.sendingDate || "")));
  }, [patients, search]);

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero">
          <div>
            <div className="eyebrow">Receptionist</div>
            <h1>Lab Cases Follow Up</h1>
            <p>{rows.length} lab cases connected with registered clients.</p>
          </div>
          <div className="hero-actions no-print">
            <button className="btn" type="button" onClick={fetchPatients}>Refresh</button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="toolbar-panel no-print">
          <div className="search-field">
            <span>Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Patient, job, shade or status"
            />
          </div>
        </section>

        <section className="panel paper-sheet-panel">
          <div className="paper-table-title">Lab Cases Follow Up Sheet</div>
          <div className="data-table-wrap">
            <table className="data-table paper-follow-table">
              <thead>
                <tr>
                  <th>S No</th>
                  <th>Date</th>
                  <th>Patient Name</th>
                  <th>Job</th>
                  <th>Units</th>
                  <th>Shade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="7">Loading lab cases...</td>
                  </tr>
                )}
                {!loading && rows.length === 0 && (
                  Array.from({ length: 18 }, (_, index) => (
                    <tr key={`blank-${index}`}>
                      <td>{index + 1}</td>
                      <td />
                      <td />
                      <td />
                      <td />
                      <td />
                      <td />
                    </tr>
                  ))
                )}
                {!loading && rows.map((row, index) => (
                  <tr key={`${row.id || index}-${row.patientName}`}>
                    <td>{index + 1}</td>
                    <td>{formatDateDisplay(row.date || row.sendingDate)}</td>
                    <td>{row.patientName}</td>
                    <td>{row.job || row.details || "-"}</td>
                    <td>{row.units || "-"}</td>
                    <td>{row.shade || "-"}</td>
                    <td>{row.status || "Pending"}</td>
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

export default LabFollowUp;
