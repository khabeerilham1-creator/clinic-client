import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import toothChart from "../assets/tooth-chart.png";
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

function PatientsList({ activePage, setActivePage, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
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
      setError("Patients could not be loaded. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const patientBio = bio(patient);
      const matchesQuery =
        !query ||
        patientName(patient).toLowerCase().includes(query) ||
        regNo(patient).toLowerCase().includes(query) ||
        mobileNumber(patient).toLowerCase().includes(query);

      const matchesCategory =
        category === "all" ||
        String(patientBio.category || "").toLowerCase() === category;

      return matchesQuery && matchesCategory;
    });
  }, [patients, search, category]);

  const totals = useMemo(() => {
    return {
      patients: filteredPatients.length,
      revenue: filteredPatients.reduce((sum, patient) => sum + invoiceTotal(patient), 0),
      due: filteredPatients.reduce((sum, patient) => sum + balanceDue(patient), 0),
    };
  }, [filteredPatients]);

  const handleDelete = async (patient) => {
    const name = patientName(patient);
    const confirmed = window.confirm(`Delete patient record for ${name}?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/patients/${patient._id}`);
      setPatients((current) => current.filter((item) => item._id !== patient._id));
      setSelectedPatient(null);
    } catch (requestError) {
      console.error(requestError);
      alert("Delete failed. Please try again.");
    }
  };

  const handleEdit = (patient) => {
    localStorage.setItem("editPatient", JSON.stringify({ ...patient, isEditing: true }));
    setActivePage("patients");
  };

  const handlePrint = (patient) => {
    const printWindow = window.open("", "", "width=1200,height=900");
    const invoice = patient?.invoice || [];
    const planned = patient?.plannedSequence || [];
    const patientBio = bio(patient);
    const total = invoiceTotal(patient);
    const discount = Number(patient?.discount || 0);
    const net = Math.max(total - discount, 0);
    const toothImage = window.location.origin + toothChart;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HDC Dental Patient File</title>
          <style>
            *{box-sizing:border-box}
            body{font-family:Arial,sans-serif;color:#111827;margin:0;padding:36px;background:#fff}
            .header{border-bottom:3px solid #0f2747;padding-bottom:18px;margin-bottom:24px}
            .brand{font-size:30px;font-weight:800;color:#0f2747}
            .meta{color:#64748b;font-size:13px;margin-top:4px}
            .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 28px;margin:18px 0}
            .row{border-bottom:1px solid #e5e7eb;padding:8px 0;font-size:14px}
            .row b{display:inline-block;min-width:120px;color:#334155}
            h2{font-size:17px;color:#0f2747;margin:28px 0 12px;text-transform:uppercase;letter-spacing:.08em}
            table{width:100%;border-collapse:collapse;margin-bottom:18px}
            th{background:#f1f5f9;color:#0f2747;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.05em}
            th,td{border:1px solid #cbd5e1;padding:9px 10px;font-size:13px}
            .right{text-align:right}
            .totals{width:360px;margin-left:auto}
            .totals td{font-weight:700}
            .chart{max-width:760px;width:100%;display:block;margin:8px auto 18px}
            .signature{display:flex;justify-content:space-between;margin-top:48px}
            .sig{border-top:1px solid #111827;width:220px;text-align:center;padding-top:8px;font-size:12px}
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">HDC Dental Clinic</div>
            <div class="meta">Premium patient file generated ${new Date().toLocaleDateString("en-PK")}</div>
          </div>

          <h2>Bio Data</h2>
          <div class="grid">
            <div class="row"><b>Reg No</b>${regNo(patient) || "-"}</div>
            <div class="row"><b>Date</b>${patientBio.date || "-"}</div>
            <div class="row"><b>Name</b>${patientName(patient)}</div>
            <div class="row"><b>Mobile</b>${mobileNumber(patient)}</div>
            <div class="row"><b>Category</b>${patientBio.category || "-"}</div>
            <div class="row"><b>Patient Type</b>${patientBio.patientType || "-"}</div>
            <div class="row"><b>Age</b>${patientBio.age || "-"}</div>
            <div class="row"><b>Address</b>${patientBio.address || "-"}</div>
          </div>

          <h2>Dental Chart</h2>
          <img class="chart" src="${toothImage}" alt="Tooth chart" />

          <h2>Planned Sequence</h2>
          <table>
            <tr><th>Visit</th><th>Date</th><th>Procedure</th></tr>
            ${
              planned.length
                ? planned
                    .map(
                      (visit) =>
                        `<tr><td>${visit.visitNo || ""}</td><td>${visit.date || ""}</td><td>${
                          visit.procedure || visit.treatment || ""
                        }</td></tr>`
                    )
                    .join("")
                : `<tr><td colspan="3">No planned visits recorded.</td></tr>`
            }
          </table>

          <h2>Invoice</h2>
          <table>
            <tr><th>Item</th><th>Qty</th><th>Rate</th><th class="right">Cost</th></tr>
            ${
              invoice.length
                ? invoice
                    .map(
                      (item) =>
                        `<tr><td>${item.details || ""}</td><td>${item.qty || ""}</td><td>${
                          item.rate || ""
                        }</td><td class="right">${formatCurrency(item.cost)}</td></tr>`
                    )
                    .join("")
                : `<tr><td colspan="4">No invoice items recorded.</td></tr>`
            }
          </table>

          <table class="totals">
            <tr><td>Total</td><td class="right">${formatCurrency(total)}</td></tr>
            <tr><td>Discount</td><td class="right">${formatCurrency(discount)}</td></tr>
            <tr><td>Net Amount</td><td class="right">${formatCurrency(net)}</td></tr>
          </table>

          <div class="signature">
            <div class="sig">Patient Signature</div>
            <div class="sig">Doctor Signature</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
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
            <div className="eyebrow">Patient command file</div>
            <h1>Patient Records</h1>
            <p>Search, audit, edit, print and manage every dental record from one premium view.</p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" onClick={() => setActivePage("patients")}>
              <span className="btn-icon">+</span>
              New patient
            </button>
            <button className="btn" onClick={fetchPatients}>Refresh</button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="toolbar-panel">
          <div className="search-field">
            <span>Search</span>
            <input
              type="text"
              placeholder="Name, reg no or mobile number"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="segmented-control" aria-label="Filter by category">
            {["all", "elite", "mediocre"].map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item === "all" ? "All" : item}
              </button>
            ))}
          </div>
        </section>

        <section className="record-summary">
          <div>
            <span>Visible records</span>
            <strong>{loading ? "..." : totals.patients}</strong>
          </div>
          <div>
            <span>Invoice value</span>
            <strong>{loading ? "..." : formatCurrency(totals.revenue)}</strong>
          </div>
          <div>
            <span>Balance due</span>
            <strong>{loading ? "..." : formatCurrency(totals.due)}</strong>
          </div>
        </section>

        <section className="panel">
          <div className="data-table-wrap">
            <table className="data-table patient-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Reg No</th>
                  <th>Mobile</th>
                  <th>Category</th>
                  <th>Invoice</th>
                  <th>Due</th>
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="7">Loading patient records...</td>
                  </tr>
                )}

                {!loading && filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="7">No matching patients found.</td>
                  </tr>
                )}

                {filteredPatients.map((patient) => {
                  const patientBio = bio(patient);

                  return (
                    <tr key={patient._id || regNo(patient)}>
                      <td>
                        <div className="patient-cell">
                          <span className="patient-avatar">{initials(patientName(patient))}</span>
                          <div>
                            <strong>{patientName(patient)}</strong>
                            <small>{patientBio.patientType || "Patient"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="pill">{regNo(patient) || "-"}</span>
                      </td>
                      <td>{mobileNumber(patient)}</td>
                      <td>{patientBio.category || "-"}</td>
                      <td>{formatCurrency(invoiceTotal(patient))}</td>
                      <td>
                        <span className={balanceDue(patient) > 0 ? "pill warning" : "pill success"}>
                          {formatCurrency(balanceDue(patient))}
                        </span>
                      </td>
                      <td className="row-actions no-print">
                        <button className="btn btn-sm" onClick={() => setSelectedPatient(patient)}>
                          View
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(patient)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {selectedPatient && (
          <div className="modal-backdrop no-print">
            <section className="patient-modal">
              <div className="modal-header">
                <div className="patient-cell large">
                  <span className="patient-avatar">{initials(patientName(selectedPatient))}</span>
                  <div>
                    <h2>{patientName(selectedPatient)}</h2>
                    <p>Reg No {regNo(selectedPatient) || "-"} | {mobileNumber(selectedPatient)}</p>
                  </div>
                </div>

                <div className="row-actions">
                  <button className="btn" onClick={() => handleEdit(selectedPatient)}>Edit</button>
                  <button className="btn" onClick={() => handlePrint(selectedPatient)}>Print</button>
                  <button className="btn btn-dark" onClick={() => setSelectedPatient(null)}>Close</button>
                </div>
              </div>

              <div className="modal-grid">
                <div className="detail-card">
                  <h3>Bio Data</h3>
                  <dl>
                    <dt>Category</dt>
                    <dd>{bio(selectedPatient).category || "-"}</dd>
                    <dt>Patient type</dt>
                    <dd>{bio(selectedPatient).patientType || "-"}</dd>
                    <dt>Age</dt>
                    <dd>{bio(selectedPatient).age || "-"}</dd>
                    <dt>Email</dt>
                    <dd>{bio(selectedPatient).email || "-"}</dd>
                    <dt>Address</dt>
                    <dd>{bio(selectedPatient).address || "-"}</dd>
                  </dl>
                </div>

                <div className="detail-card">
                  <h3>Account</h3>
                  <dl>
                    <dt>Total invoice</dt>
                    <dd>{formatCurrency(invoiceTotal(selectedPatient))}</dd>
                    <dt>Discount</dt>
                    <dd>{formatCurrency(selectedPatient.discount)}</dd>
                    <dt>Balance due</dt>
                    <dd>{formatCurrency(balanceDue(selectedPatient))}</dd>
                  </dl>
                </div>
              </div>

              <div className="detail-card">
                <h3>Planned Sequence</h3>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Visit</th>
                        <th>Date</th>
                        <th>Procedure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedPatient.plannedSequence || []).length === 0 && (
                        <tr>
                          <td colSpan="3">No planned visits recorded.</td>
                        </tr>
                      )}

                      {(selectedPatient.plannedSequence || []).map((visit, index) => (
                        <tr key={`${visit.visitNo}-${index}`}>
                          <td>{visit.visitNo || index + 1}</td>
                          <td>{visit.date || "-"}</td>
                          <td>{visit.procedure || visit.treatment || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="detail-card">
                <h3>Invoice</h3>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Details</th>
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
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default PatientsList;
