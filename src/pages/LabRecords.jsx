import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  activeShift,
  activeShiftId,
  filterPatientsForActiveShift,
  formatCurrency,
  initials,
  mobileNumber,
  patientArray,
  patientName,
  regNo,
} from "../utils/patientHelpers";
import { CLINIC_NAME, DEFAULT_LABS, DOCTOR_NAME } from "../utils/clinicData";
import { playSectionSound } from "../utils/sound";

const LAB_STORAGE_KEY = "clinicLabs";
const LAB_STATUS_OPTIONS = ["Sent", "In progress", "Received", "Delivered"];

const todayInputValue = () => new Date().toISOString().split("T")[0];

const emptyForm = (patientId = "") => ({
  date: todayInputValue(),
  patientId,
  job: "",
  units: "",
  shade: "",
  status: "Sent",
  amount: "",
  paymentStatus: "unpaid",
});

const makeRecordId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `lab-${Date.now()}`;
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const uniqueLabs = (labs) => {
  const seen = new Set();

  return labs
    .map((lab) => String(lab || "").trim())
    .filter(Boolean)
    .filter((lab) => {
      const key = normalizeText(lab);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
};

const loadLabs = () => {
  if (typeof window === "undefined") {
    return DEFAULT_LABS;
  }

  try {
    const storedLabs = JSON.parse(localStorage.getItem(LAB_STORAGE_KEY) || "[]");
    return uniqueLabs([...DEFAULT_LABS, ...(Array.isArray(storedLabs) ? storedLabs : [])]);
  } catch (error) {
    return DEFAULT_LABS;
  }
};

const saveLabs = (labs) => {
  localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(uniqueLabs(labs)));
};

const labTitle = (labName) => `${labName} record`;

const recordDate = (record) => record.date || record.sendingDate || "";

const recordJob = (record) => record.job || record.details || "";

const recordUnits = (record) => record.units || "";

const recordShade = (record) => record.shade || "";

const recordStatus = (record) => record.status || (record.receivingDate ? "Received" : "Sent");

const recordPaymentStatus = (record) => record.paymentStatus || record.paidStatus || "unpaid";

const recordAmount = (record) => Number(record.amount || 0);

const detailsForAccount = (record) =>
  [
    recordJob(record) && `Job: ${recordJob(record)}`,
    recordUnits(record) && `Units: ${recordUnits(record)}`,
    recordShade(record) && `Shade: ${recordShade(record)}`,
    recordStatus(record) && `Status: ${recordStatus(record)}`,
  ]
    .filter(Boolean)
    .join(" | ");

const labExpenseFromRecord = (record) => ({
  id: `lab-expense-${record.id}`,
  labRecordId: record.id,
  labName: record.labName || "Lab",
  details: detailsForAccount(record),
  job: recordJob(record),
  units: recordUnits(record),
  shade: recordShade(record),
  caseStatus: recordStatus(record),
  date: recordDate(record) || todayInputValue(),
  amount: recordAmount(record),
  status: recordPaymentStatus(record),
});

const mergeLabExpense = (expenses, record) => {
  const nextExpense = labExpenseFromRecord(record);
  const existing = expenses || [];
  const index = existing.findIndex(
    (expense) => expense.labRecordId === record.id || expense.id === nextExpense.id
  );

  if (index === -1) {
    return [nextExpense, ...existing];
  }

  return existing.map((expense, expenseIndex) => (expenseIndex === index ? nextExpense : expense));
};

const removeLabExpense = (expenses, recordId) =>
  (expenses || []).filter(
    (expense) => expense.labRecordId !== recordId && expense.id !== `lab-expense-${recordId}`
  );

const statusClass = (status) => {
  const clean = normalizeText(status);

  if (clean.includes("received") || clean.includes("deliver")) {
    return "pill success";
  }

  if (clean.includes("progress")) {
    return "pill warning";
  }

  return "pill";
};

function LabRecords({ activePage, setActivePage, handleLogout }) {
  const shift = activeShift();
  const [labs, setLabs] = useState(loadLabs);
  const [activeLab, setActiveLab] = useState(() => loadLabs()[0] || DEFAULT_LABS[0]);
  const [newLabName, setNewLabName] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/patients", {
        params: { limit: 100, sort: "createdAt", order: -1, shift: activeShiftId() },
      });
      const list = filterPatientsForActiveShift(patientArray(response.data));

      setPatients(list);

      if (selectedPatient?._id) {
        const refreshedPatient = list.find((patient) => patient._id === selectedPatient._id);
        setSelectedPatient(refreshedPatient || null);
      }
    } catch (requestError) {
      console.error(requestError);
      setError("Lab records could not be loaded. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const query = normalizeText(patientSearch);

    return patients.filter((patient) => {
      if (!query) {
        return true;
      }

      return (
        normalizeText(patientName(patient)).includes(query) ||
        normalizeText(regNo(patient)).includes(query) ||
        normalizeText(mobileNumber(patient)).includes(query)
      );
    });
  }, [patients, patientSearch]);

  const activeLabRows = useMemo(
    () =>
      patients
        .flatMap((patient) =>
          (patient.labRecords || [])
            .filter((record) => normalizeText(record.labName) === normalizeText(activeLab))
            .map((record) => ({
              ...record,
              patient,
              patientName: patientName(patient),
              regNo: regNo(patient),
              mobileNumber: mobileNumber(patient),
            }))
        )
        .sort((a, b) => String(recordDate(b)).localeCompare(String(recordDate(a)))),
    [patients, activeLab]
  );

  const selectedPatientRows = useMemo(
    () =>
      activeLabRows.filter((record) => selectedPatient?._id && record.patient?._id === selectedPatient._id),
    [activeLabRows, selectedPatient]
  );

  const pendingCount = activeLabRows.filter((record) => {
    const cleanStatus = normalizeText(recordStatus(record));
    return !cleanStatus.includes("received") && !cleanStatus.includes("deliver");
  }).length;

  const unpaidAmount = activeLabRows
    .filter((record) => recordPaymentStatus(record) !== "paid")
    .reduce((sum, record) => sum + recordAmount(record), 0);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    playSectionSound(type === "danger" ? "warning" : "success");
    window.setTimeout(() => setMessage(null), 3600);
  };

  const updateLabs = (nextLabs) => {
    const cleanLabs = uniqueLabs(nextLabs);
    setLabs(cleanLabs);
    saveLabs(cleanLabs);
  };

  const handleAddLab = () => {
    const cleanName = newLabName.trim();

    if (!cleanName) {
      showMessage("Enter a lab name before adding.", "danger");
      return;
    }

    if (labs.some((lab) => normalizeText(lab) === normalizeText(cleanName))) {
      showMessage("This lab already exists.", "danger");
      return;
    }

    const nextLabs = [...labs, cleanName];
    updateLabs(nextLabs);
    setActiveLab(cleanName);
    setNewLabName("");
    playSectionSound("section");
  };

  const selectLab = (labName) => {
    setActiveLab(labName);
    setEditingId(null);
    setForm((current) => emptyForm(current.patientId));
    playSectionSound("section");
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patientName(patient));
    setForm((current) => ({ ...current, patientId: patient._id || "" }));
    playSectionSound("section");
  };

  const handlePatientSearch = (value) => {
    setPatientSearch(value);

    const matchingPatient = patients.find(
      (patient) =>
        normalizeText(patientName(patient)) === normalizeText(value) ||
        normalizeText(regNo(patient)) === normalizeText(value)
    );

    if (matchingPatient) {
      setSelectedPatient(matchingPatient);
      setForm((current) => ({ ...current, patientId: matchingPatient._id || "" }));
    } else {
      setSelectedPatient(null);
      setForm((current) => ({ ...current, patientId: "" }));
    }
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updatePatient = async (updatedPatient) => {
    await api.put(`/patients/${updatedPatient._id}`, updatedPatient);
    setSelectedPatient(updatedPatient);
    setPatients((current) =>
      current.map((patient) => (patient._id === updatedPatient._id ? updatedPatient : patient))
    );
  };

  const resetForm = (patientId = selectedPatient?._id || "") => {
    setEditingId(null);
    setForm(emptyForm(patientId));
  };

  const handleSubmit = async () => {
    const patient =
      selectedPatient || patients.find((item) => item._id && item._id === form.patientId);

    if (!patient?._id) {
      showMessage("Select a patient before saving a lab record.", "danger");
      return;
    }

    if (!recordJob(form).trim() && !Number(form.amount || 0)) {
      showMessage("Enter a job or amount before saving.", "danger");
      return;
    }

    const record = {
      id: editingId || makeRecordId(),
      labName: activeLab,
      date: form.date || todayInputValue(),
      job: form.job.trim(),
      units: form.units.trim(),
      shade: form.shade.trim(),
      status: form.status || "Sent",
      amount: Number(form.amount || 0),
      paymentStatus: form.paymentStatus || "unpaid",
      updatedAt: new Date().toISOString(),
    };

    const currentRecords = patient.labRecords || [];
    const nextRecords = editingId
      ? currentRecords.map((item) => (item.id === editingId ? record : item))
      : [record, ...currentRecords];

    const updatedPatient = {
      ...patient,
      labRecords: nextRecords,
      labExpenses: mergeLabExpense(patient.labExpenses || [], record),
    };

    setSaving(true);

    try {
      await updatePatient(updatedPatient);
      resetForm(patient._id);
      showMessage(editingId ? "Lab record updated and synced to patient account." : "Lab record saved and synced to patient account.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Lab record could not be saved. Please try again.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
    const patient = record.patient;

    setSelectedPatient(patient);
    setPatientSearch(patientName(patient));
    setEditingId(record.id);
    setForm({
      date: recordDate(record) || todayInputValue(),
      patientId: patient?._id || "",
      job: recordJob(record),
      units: recordUnits(record),
      shade: recordShade(record),
      status: recordStatus(record),
      amount: record.amount ?? "",
      paymentStatus: recordPaymentStatus(record),
    });
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete ${activeLab} record for ${record.patientName}?`)) {
      return;
    }

    const patient = record.patient;
    const updatedPatient = {
      ...patient,
      labRecords: (patient.labRecords || []).filter((item) => item.id !== record.id),
      labExpenses: removeLabExpense(patient.labExpenses || [], record.id),
    };

    try {
      await updatePatient(updatedPatient);
      resetForm(patient._id);
      showMessage("Lab record deleted from lab and patient account.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Lab record could not be deleted.", "danger");
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page printable-page lab-page">
        <section className="print-report-header">
          <strong>{CLINIC_NAME}</strong>
          <span>{shift?.label || DOCTOR_NAME}</span>
          <span>{labTitle(activeLab)} - {shift?.label || "All shifts"}</span>
        </section>

        <section className="page-hero">
          <div>
            <div className="eyebrow">Lab case register</div>
            <h1>{labTitle(activeLab)}</h1>
            <p>
              Select a lab, attach a patient, and sync charges to patient accounts.
            </p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" type="button" onClick={() => window.print()}>
              Print
            </button>
            <button className="btn" type="button" onClick={fetchPatients}>
              Refresh
            </button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}
        {message && <div className={`notice ${message.type === "danger" ? "danger" : ""}`}>{message.text}</div>}

        <section className="toolbar-panel lab-switcher no-print">
          <div className="segmented-control lab-tabs" aria-label="Lab records">
            {labs.map((lab) => (
              <button
                key={lab}
                type="button"
                className={normalizeText(activeLab) === normalizeText(lab) ? "active" : ""}
                onClick={() => selectLab(lab)}
              >
                {labTitle(lab)}
              </button>
            ))}
          </div>

          <div className="add-lab-form">
            <input
              value={newLabName}
              onChange={(event) => setNewLabName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddLab();
                }
              }}
              placeholder="Add lab name"
            />
            <button className="btn" type="button" onClick={handleAddLab}>
              Add lab
            </button>
          </div>
        </section>

        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-accent blue" />
            <div className="metric-label">Labs</div>
            <div className="metric-value">{labs.length}</div>
            <div className="metric-detail">Saved lab subsections</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent green" />
            <div className="metric-label">Active records</div>
            <div className="metric-value">{loading ? "..." : activeLabRows.length}</div>
            <div className="metric-detail">{activeLab}</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent gold" />
            <div className="metric-label">Pending</div>
            <div className="metric-value">{loading ? "..." : pendingCount}</div>
            <div className="metric-detail">Not received or delivered</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent rose" />
            <div className="metric-label">Unpaid</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(unpaidAmount)}</div>
            <div className="metric-detail">Lab account amount</div>
          </div>
        </section>

        <section className="lab-layout printable-report">
          <div className="panel patient-select-panel no-print">
            <div className="panel-heading">
              <div>
                <h2>Patient Search</h2>
                <p>Search by name, registration number, or mobile number.</p>
              </div>
            </div>

            <label className="search-field">
              <span>Patient Name</span>
              <input
                value={patientSearch}
                onChange={(event) => handlePatientSearch(event.target.value)}
                placeholder="Select patient for lab job"
              />
            </label>

            <div className="patient-select-list">
              {loading && <div className="empty-state compact">Loading patients...</div>}

              {!loading && filteredPatients.length === 0 && (
                <div className="empty-state compact">No matching patients found.</div>
              )}

              {filteredPatients.slice(0, 18).map((patient) => (
                <button
                  key={patient._id || regNo(patient)}
                  className={`patient-select-row${selectedPatient?._id === patient._id ? " active" : ""}`}
                  type="button"
                  onClick={() => selectPatient(patient)}
                >
                  <span className="patient-avatar">{initials(patientName(patient))}</span>
                  <span>
                    <strong>{patientName(patient)}</strong>
                    <small>Reg {regNo(patient) || "-"} | {mobileNumber(patient)}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel printable-report">
            <div className="panel-heading">
              <div>
                <h2>{labTitle(activeLab)}</h2>
                <p>
                  {selectedPatient
                    ? `Selected: ${patientName(selectedPatient)} | Reg ${regNo(selectedPatient) || "-"} | ${mobileNumber(selectedPatient)}`
                    : "Select a patient, enter lab job details, and save."}
                </p>
              </div>
              <span className="pill">{activeLabRows.length} records</span>
            </div>

            <div className="payment-panel lab-form no-print">
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => handleChange("date", event.target.value)}
                />
              </label>
              <label className="field lab-patient-field">
                <span>Patient Name</span>
                <input
                  value={patientSearch}
                  onChange={(event) => handlePatientSearch(event.target.value)}
                  placeholder="Search and select patient"
                />
              </label>
              <label className="field">
                <span>Job</span>
                <input
                  value={form.job}
                  onChange={(event) => handleChange("job", event.target.value)}
                  placeholder="Crown, bridge, aligner..."
                />
              </label>
              <label className="field">
                <span>Units</span>
                <input
                  value={form.units}
                  onChange={(event) => handleChange("units", event.target.value)}
                  placeholder="Units"
                />
              </label>
              <label className="field">
                <span>Shade</span>
                <input
                  value={form.shade}
                  onChange={(event) => handleChange("shade", event.target.value)}
                  placeholder="Shade"
                />
              </label>
              <label className="field">
                <span>Status</span>
                <select value={form.status} onChange={(event) => handleChange("status", event.target.value)}>
                  {LAB_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Amount</span>
                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(event) => handleChange("amount", event.target.value)}
                  placeholder="Amount"
                />
              </label>
              <label className="field">
                <span>Paid / Unpaid</span>
                <select
                  value={form.paymentStatus}
                  onChange={(event) => handleChange("paymentStatus", event.target.value)}
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </label>
              <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Save"}
              </button>
              {editingId && (
                <button className="btn" type="button" onClick={() => resetForm()}>
                  Cancel
                </button>
              )}
            </div>

            <div className="data-table-wrap">
              <table className="data-table lab-record-table">
                <thead>
                  <tr>
                    <th>S No</th>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Job</th>
                    <th>Units</th>
                    <th>Shade</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Paid / Unpaid</th>
                    <th className="no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="10">Loading lab records...</td>
                    </tr>
                  )}

                  {!loading && activeLabRows.length === 0 && (
                    <tr>
                      <td colSpan="10">No records saved for {activeLab} yet.</td>
                    </tr>
                  )}

                  {activeLabRows.map((record, index) => (
                    <tr key={record.id || `${record.regNo}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{recordDate(record) || "-"}</td>
                      <td>
                        <strong>{record.patientName}</strong>
                        <small>Reg {record.regNo || "-"} | {record.mobileNumber}</small>
                      </td>
                      <td>{recordJob(record) || "-"}</td>
                      <td>{recordUnits(record) || "-"}</td>
                      <td>{recordShade(record) || "-"}</td>
                      <td>
                        <span className={statusClass(recordStatus(record))}>{recordStatus(record)}</span>
                      </td>
                      <td>{formatCurrency(recordAmount(record))}</td>
                      <td>
                        <span className={recordPaymentStatus(record) === "paid" ? "pill success" : "pill warning"}>
                          {recordPaymentStatus(record) === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="row-actions no-print">
                        <button className="btn btn-sm" type="button" onClick={() => handleEdit(record)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(record)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {selectedPatient && (
          <section className="panel lab-recent-panel no-print">
            <div className="panel-heading">
              <div>
                <h2>Selected Patient Lab History</h2>
                <p>{patientName(selectedPatient)} has {selectedPatientRows.length} records in {activeLab}.</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

export default LabRecords;
