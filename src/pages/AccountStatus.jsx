import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  balanceDue,
  bio,
  formatCurrency,
  initials,
  invoiceTotal,
  mobileNumber,
  patientArray,
  patientName,
  regNo,
} from "../utils/patientHelpers";

function AccountStatus({ activePage, setActivePage, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/patients", {
        params: { limit: 100, sort: "createdAt", order: -1 },
      });

      setPatients(patientArray(response.data));
    } catch (requestError) {
      console.error(requestError);
      setError("Account data could not be loaded. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients.filter((patient) => {
      if (!query) {
        return true;
      }

      return (
        patientName(patient).toLowerCase().includes(query) ||
        regNo(patient).toLowerCase().includes(query) ||
        mobileNumber(patient).toLowerCase().includes(query)
      );
    });
  }, [patients, search]);

  const totals = useMemo(() => {
    const totalAmount = filteredPatients.reduce((sum, patient) => sum + invoiceTotal(patient), 0);
    const dueAmount = filteredPatients.reduce((sum, patient) => sum + balanceDue(patient), 0);

    return {
      totalAmount,
      dueAmount,
      recoveredAmount: Math.max(totalAmount - dueAmount, 0),
    };
  }, [filteredPatients]);

  const handleEdit = (patient) => {
    localStorage.setItem("editPatient", JSON.stringify({ ...patient, isEditing: true }));
    setActivePage("patients");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      handleLogout={handleLogout}
    >
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Finance cockpit</div>
            <h1>Account Status</h1>
            <p>Track invoice totals, balances and payment attention points for every patient.</p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" onClick={handlePrint}>Print</button>
            <button className="btn" onClick={fetchPatients}>Refresh</button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="metrics-grid three">
          <div className="metric-card">
            <div className="metric-accent blue" />
            <div className="metric-label">Invoice value</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.totalAmount)}</div>
            <div className="metric-detail">All visible accounts</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent green" />
            <div className="metric-label">Recovered</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.recoveredAmount)}</div>
            <div className="metric-detail">After current balances</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent rose" />
            <div className="metric-label">Balance due</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.dueAmount)}</div>
            <div className="metric-detail">Needs follow-up</div>
          </div>
        </section>

        <section className="toolbar-panel no-print">
          <div className="search-field">
            <span>Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, reg no or mobile number"
            />
          </div>
        </section>

        {selectedPatient && (
          <section className="panel account-file">
            <div className="panel-heading">
              <div className="patient-cell large">
                <span className="patient-avatar">{initials(patientName(selectedPatient))}</span>
                <div>
                  <h2>{patientName(selectedPatient)}</h2>
                  <p>Reg No {regNo(selectedPatient) || "-"} | {mobileNumber(selectedPatient)}</p>
                </div>
              </div>

              <div className="row-actions no-print">
                <button className="btn" onClick={() => handleEdit(selectedPatient)}>Edit file</button>
                <button className="btn btn-dark" onClick={() => setSelectedPatient(null)}>Close</button>
              </div>
            </div>

            <div className="record-summary">
              <div>
                <span>Invoice</span>
                <strong>{formatCurrency(invoiceTotal(selectedPatient))}</strong>
              </div>
              <div>
                <span>Discount</span>
                <strong>{formatCurrency(selectedPatient.discount)}</strong>
              </div>
              <div>
                <span>Balance due</span>
                <strong>{formatCurrency(balanceDue(selectedPatient))}</strong>
              </div>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Treatment</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedPatient.invoice || []).length === 0 && (
                    <tr>
                      <td colSpan="4">No invoice items recorded.</td>
                    </tr>
                  )}

                  {(selectedPatient.invoice || []).map((item, index) => (
                    <tr key={`${item.details}-${index}`}>
                      <td>{item.details || "-"}</td>
                      <td>{item.qty || "-"}</td>
                      <td>{formatCurrency(item.rate)}</td>
                      <td>{formatCurrency(item.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="panel">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Reg No</th>
                  <th>Category</th>
                  <th>Invoice</th>
                  <th>Balance</th>
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6">Loading account status...</td>
                  </tr>
                )}

                {!loading && filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="6">No matching accounts found.</td>
                  </tr>
                )}

                {filteredPatients.map((patient) => (
                  <tr key={patient._id || regNo(patient)}>
                    <td>
                      <div className="patient-cell">
                        <span className="patient-avatar">{initials(patientName(patient))}</span>
                        <div>
                          <strong>{patientName(patient)}</strong>
                          <small>{mobileNumber(patient)}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="pill">{regNo(patient) || "-"}</span>
                    </td>
                    <td>{bio(patient).category || "-"}</td>
                    <td>{formatCurrency(invoiceTotal(patient))}</td>
                    <td>
                      <span className={balanceDue(patient) > 0 ? "pill warning" : "pill success"}>
                        {formatCurrency(balanceDue(patient))}
                      </span>
                    </td>
                    <td className="no-print">
                      <button className="btn btn-sm" onClick={() => setSelectedPatient(patient)}>
                        Open account
                      </button>
                    </td>
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

export default AccountStatus;
