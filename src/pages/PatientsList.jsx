import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import toothChart from "../assets/tooth-chart.png";
import { DEPARTMENT_OPTIONS } from "../utils/clinicData";
import {
  appointmentArray,
  appointmentRequestParams,
  filterManualAppointmentsForUser,
  patientAppointmentSummary,
} from "../utils/appointmentHelpers";
import { openPatientFile } from "../utils/clientNavigation";
import { printPatientFile } from "../utils/printPatientFile";
import { addActivityLog } from "../utils/activityLog";
import {
  activeShift,
  activeShiftId,
  balanceDue,
  bio,
  dateKey,
  discountAmount,
  filterPatientsForActiveShift,
  formatDateDisplay,
  formatCurrency,
  initials,
  invoiceTotal,
  matchesPeriod,
  mobileNumber,
  patientDepartmentId,
  patientDepartmentLabel,
  patientArray,
  patientName,
  patientRecordDate,
  paymentsTotal,
  plannedVisitStatus,
  regNo,
} from "../utils/patientHelpers";

function PatientsList({ activePage, setActivePage, handleLogout }) {
  const shift = activeShift();
  const role = sessionStorage.getItem("role") || "";
  const [patients, setPatients] = useState([]);
  const [manualAppointments, setManualAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [search, setSearch] = useState("");
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

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

      setPatients(filterPatientsForActiveShift(patientArray(patientsResponse.data)));
      setManualAppointments(filterManualAppointmentsForUser(appointmentArray(appointmentsResponse.data)));
      } catch (requestError) {
        console.error(requestError);
      setPatients([]);
      setManualAppointments([]);
      setError("");
      } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients
      .filter((patient) => {
        const patientBio = bio(patient);
        const matchesQuery =
          !query ||
          patientName(patient).toLowerCase().includes(query) ||
          regNo(patient).toLowerCase().includes(query) ||
          mobileNumber(patient).toLowerCase().includes(query);

        const matchesCategory =
          category === "all" ||
          normalizeCategoryKey(patientBio.category) === category;
        const matchesSelectedPeriod = matchesPeriod(patientRecordDate(patient), selectedMonth, selectedYear);

        return matchesQuery && matchesCategory && matchesSelectedPeriod;
      })
      .sort((a, b) => {
        const dateCompare = String(dateKey(patientRecordDate(b))).localeCompare(String(dateKey(patientRecordDate(a))));

        if (dateCompare) {
          return dateCompare;
        }

        return String(regNo(b)).localeCompare(String(regNo(a)), undefined, { numeric: true });
      });
  }, [patients, search, category, selectedMonth, selectedYear]);

  const recordYears = useMemo(() => {
    const years = patients
      .map((patient) => dateKey(patientRecordDate(patient)).slice(0, 4))
      .filter(Boolean);

    return Array.from(new Set([String(now.getFullYear()), ...years])).sort((a, b) => Number(b) - Number(a));
  }, [patients, now]);

  const selectedPeriodLabel = new Date(Number(selectedYear), Number(selectedMonth) - 1, 1).toLocaleDateString(
    "en-PK",
    { month: "long", year: "numeric" }
  );

  const totals = useMemo(() => {
    return {
      patients: filteredPatients.length,
      revenue: filteredPatients.reduce((sum, patient) => sum + invoiceTotal(patient), 0),
      due: filteredPatients.reduce((sum, patient) => sum + balanceDue(patient), 0),
    };
  }, [filteredPatients]);

  const handleDelete = async (patient) => {
    const name = patientName(patient);
    const confirmed = window.confirm(`Delete client record for ${name}?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/patients/${patient._id}`);
      setPatients((current) => current.filter((item) => item._id !== patient._id));
      setSelectedPatient(null);
      await addActivityLog("Deleted client", name, { regNo: regNo(patient) });
    } catch (requestError) {
      console.error(requestError);
      alert("Delete failed. Please try again.");
    }
  };

  const handleEdit = async (patient) => {
    localStorage.setItem("editPatient", JSON.stringify({ ...patient, isEditing: true }));
    await addActivityLog("Opened client edit", patientName(patient), { regNo: regNo(patient) });
    setActivePage("patients");
  };

  const handlePrint = (patient, mode) => {
    printPatientFile(patient, toothChart, mode);
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
            <div className="eyebrow">Client command file</div>
            <h1>{shift?.label ? `${shift.label} Client Records` : "Client Records"}</h1>
            <p>
              Search, audit, edit, print and manage {selectedPeriodLabel} records.
            </p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" onClick={() => setActivePage("patients")}>
              <span className="btn-icon">+</span>
              New Checkup
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
            {["all", ...CATEGORY_OPTIONS.map((option) => option.key)].map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item === "all"
                  ? "All"
                  : CATEGORY_OPTIONS.find((option) => option.key === item)?.label.replace("Category ", "Cat ")}
              </button>
            ))}
          </div>

          <div className="filter-controls">
            <label className="field inline-field">
              <span>Month</span>
              <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={String(index + 1)}>
                    {new Date(2026, index, 1).toLocaleDateString("en-PK", { month: "long" })}
                  </option>
                ))}
              </select>
            </label>
            <label className="field inline-field">
              <span>Year</span>
              <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                {recordYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="record-summary">
          <div>
            <span>REGISTERED CASES</span>
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
                  <th>Client</th>
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
                    <td colSpan="7">Loading client records...</td>
                  </tr>
                )}

                {!loading && filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="7">No matching clients found.</td>
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
                            <button
                              className="patient-link"
                              type="button"
                              onClick={() => openPatientFile(patient, setActivePage)}
                            >
                              {patientName(patient)}
                            </button>
                            <small>{patientBio.patientType || "Client"}</small>
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
                  <button className="btn" onClick={() => handlePrint(selectedPatient, "checkup")}>Checkup Sheet Print</button>
                  <button className="btn" onClick={() => handlePrint(selectedPatient, "invoice")}>Invoice Print</button>
                  <button className="btn" onClick={() => handlePrint(selectedPatient, "acknowledgement")}>Acknowledgement Print</button>
                  <button className="btn btn-dark" onClick={() => setSelectedPatient(null)}>Close</button>
                </div>
              </div>

              <div className="modal-grid">
                <div className="detail-card">
                  <h3>Bio Data</h3>
                  <dl>
                    <dt>Category</dt>
                    <dd>{bio(selectedPatient).category || "-"}</dd>
                    <dt>Client type</dt>
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
                    <dd>{formatCurrency(discountAmount(selectedPatient))}</dd>
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
                        <th>Time</th>
                        <th>Procedure</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedPatient.plannedSequence || []).length === 0 && (
                        <tr>
                          <td colSpan="5">No planned visits recorded.</td>
                        </tr>
                      )}

                      {(selectedPatient.plannedSequence || []).map((visit, index) => (
                        <tr key={`${visit.visitNo}-${index}`}>
                          <td>{visit.visitNo || index + 1}</td>
                          <td>{formatDateDisplay(visit.date) || "-"}</td>
                          <td>{visit.time || "-"}</td>
                          <td>{visit.procedure || visit.treatment || "-"}</td>
                          <td>
                            <span className={plannedVisitStatus(visit) === "Done" ? "pill success" : "pill"}>
                              {plannedVisitStatus(visit)}
                            </span>
                          </td>
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
