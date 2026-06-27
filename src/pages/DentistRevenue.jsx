import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  activeShiftId,
  balanceDue,
  filterPatientsForActiveShift,
  formatCurrency,
  invoiceGroups,
  netAmount,
  patientArray,
  patientName,
  paymentsTotal,
  regNo,
} from "../utils/patientHelpers";
import { CLINIC_NAME, DOCTOR_NAME } from "../utils/clinicData";
import { playSectionSound } from "../utils/sound";

const DENTIST_STORAGE_KEY = "dentistRevenueDentists";
const DEFAULT_DENTISTS = ["Dentist 1"];

const todayInputValue = () => new Date().toISOString().split("T")[0];

const emptyForm = () => ({
  doctorName: "",
  patientId: "",
  patientSearch: "",
  expenses: [{ id: "expense-1", description: "Lab charges", amount: "" }],
  sessions: [{ id: "session-1", label: "Session 1", amount: "", status: "unpaid" }],
});

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const revenueArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.records)) {
    return payload.records;
  }

  return [];
};

const loadDentists = () => {
  if (typeof window === "undefined") {
    return DEFAULT_DENTISTS;
  }

  try {
    const stored = JSON.parse(localStorage.getItem(DENTIST_STORAGE_KEY) || "[]");
    const names = [...DEFAULT_DENTISTS, ...(Array.isArray(stored) ? stored : [])]
      .map((name) => String(name || "").trim())
      .filter(Boolean);
    return Array.from(new Set(names));
  } catch (error) {
    return DEFAULT_DENTISTS;
  }
};

const saveDentists = (dentists) => {
  localStorage.setItem(DENTIST_STORAGE_KEY, JSON.stringify(dentists));
};

const makeId = (prefix) => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
};

const numberValue = (value) => Number(value || 0);

const expenseTotal = (expenses = []) =>
  expenses.reduce((sum, expense) => sum + numberValue(expense.amount), 0);

const sessionPaidTotal = (sessions = []) =>
  sessions
    .filter((session) => session.status === "paid")
    .reduce((sum, session) => sum + numberValue(session.amount), 0);

const invoiceDetails = (patient) =>
  invoiceGroups(patient)
    .flatMap((invoice) => invoice.items || [])
    .map((item) => normalizeText(item.details))
    .filter(Boolean);

const suggestedExpenses = (patient) => {
  const details = invoiceDetails(patient);
  const hasImplant = details.some((detail) => detail.includes("implant"));
  const hasBoneGrafting = details.some(
    (detail) => detail.includes("bone") || detail.includes("graft")
  );
  const labTotal = (patient?.labExpenses || []).reduce(
    (sum, item) => sum + numberValue(item.amount),
    0
  );
  const rows = [
    {
      id: makeId("expense"),
      description: "Lab charges",
      amount: labTotal || "",
    },
  ];

  if (hasImplant) {
    rows.push({
      id: makeId("expense"),
      description: "Implants charges",
      amount: "",
    });
  }

  if (hasBoneGrafting) {
    rows.push({
      id: makeId("expense"),
      description: "Bone grafting",
      amount: "",
    });
  }

  return rows;
};

const decorateRecord = (record, patients) => {
  const patient = patients.find((item) => item._id === record.patientId);
  const total = numberValue(record.totalAmount || record.patientTotal || netAmount(patient));
  const expenses = expenseTotal(record.expenses);
  const remainingAfterExpenses = Math.max(total - expenses, 0);

  return {
    ...record,
    patientName: record.patientName || (patient ? patientName(patient) : ""),
    patientTotal: numberValue(record.patientTotal || netAmount(patient)),
    patientPaid: numberValue(record.patientPaid || paymentsTotal(patient)),
    patientBalance: numberValue(record.patientBalance || balanceDue(patient)),
    totalAmount: total,
    expenseTotal: expenses,
    remainingAmount: numberValue(record.patientBalance || balanceDue(patient)),
    share25: numberValue(record.share25 || remainingAfterExpenses * 0.25),
  };
};

function DentistRevenue({ activePage, setActivePage, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [dentists, setDentists] = useState(loadDentists);
  const [activeDentist, setActiveDentist] = useState(() => loadDentists()[0] || "Dentist 1");
  const [newDentistName, setNewDentistName] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient._id === form.patientId) || null,
    [patients, form.patientId]
  );

  const activeRecords = useMemo(
    () =>
      records
        .filter((record) => normalizeText(record.dentistName) === normalizeText(activeDentist))
        .map((record) => decorateRecord(record, patients))
        .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))),
    [records, activeDentist, patients]
  );

  const totals = useMemo(() => {
    const totalAmount = activeRecords.reduce((sum, record) => sum + numberValue(record.totalAmount), 0);
    const expenses = activeRecords.reduce((sum, record) => sum + numberValue(record.expenseTotal), 0);
    const remaining = activeRecords.reduce((sum, record) => sum + numberValue(record.patientBalance), 0);

    return {
      count: activeRecords.length,
      totalAmount,
      expenses,
      remaining,
      share25: Math.max(totalAmount - expenses, 0) * 0.25,
    };
  }, [activeRecords]);

  const currentExpenseTotal = expenseTotal(form.expenses);
  const currentPatientTotal = selectedPatient ? netAmount(selectedPatient) : 0;
  const currentPatientPaid = selectedPatient ? paymentsTotal(selectedPatient) : 0;
  const currentPatientBalance = selectedPatient ? balanceDue(selectedPatient) : 0;
  const currentAfterExpenses = Math.max(currentPatientTotal - currentExpenseTotal, 0);
  const currentShare25 = currentAfterExpenses * 0.25;

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    playSectionSound(type === "danger" ? "warning" : "success");
    window.setTimeout(() => setMessage(null), 3200);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsResponse, revenueResponse] = await Promise.all([
        api.get("/patients", {
          params: { limit: 100, sort: "createdAt", order: -1, shift: activeShiftId() },
        }),
        api.get("/dentist-revenue", { params: { limit: 500 } }),
      ]);

      const patientList = filterPatientsForActiveShift(patientArray(patientsResponse.data));
      const recordList = revenueArray(revenueResponse.data);
      const nextDentists = Array.from(
        new Set([
          ...dentists,
          ...recordList.map((record) => record.dentistName).filter(Boolean),
        ])
      );

      setPatients(patientList);
      setRecords(recordList);
      setDentists(nextDentists);
      saveDentists(nextDentists);
    } catch (requestError) {
      console.error(requestError);
      setError("Dentist revenue details could not be loaded. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const selectPatient = (patient) => {
    setForm((current) => ({
      ...current,
      patientId: patient._id || "",
      patientSearch: `${patientName(patient)}${regNo(patient) ? ` - ${regNo(patient)}` : ""}`,
      expenses: suggestedExpenses(patient),
    }));
    playSectionSound("section");
  };

  const handlePatientSearch = (value) => {
    const matchingPatient = patients.find((patient) => {
      const label = `${patientName(patient)} - ${regNo(patient)}`;
      return (
        normalizeText(label) === normalizeText(value) ||
        normalizeText(patientName(patient)) === normalizeText(value) ||
        normalizeText(regNo(patient)) === normalizeText(value)
      );
    });

    setForm((current) => ({
      ...current,
      patientSearch: value,
      patientId: matchingPatient?._id || "",
      expenses: matchingPatient ? suggestedExpenses(matchingPatient) : current.expenses,
    }));
  };

  const updateExpense = (id, field, value) => {
    setForm((current) => ({
      ...current,
      expenses: current.expenses.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      ),
    }));
  };

  const addExpense = () => {
    setForm((current) => ({
      ...current,
      expenses: [...current.expenses, { id: makeId("expense"), description: "", amount: "" }],
    }));
  };

  const deleteExpense = (id) => {
    setForm((current) => ({
      ...current,
      expenses:
        current.expenses.length === 1
          ? [{ id: makeId("expense"), description: "Lab charges", amount: "" }]
          : current.expenses.filter((expense) => expense.id !== id),
    }));
  };

  const updateSession = (id, field, value) => {
    setForm((current) => ({
      ...current,
      sessions: current.sessions.map((session) =>
        session.id === id ? { ...session, [field]: value } : session
      ),
    }));
  };

  const addSession = () => {
    setForm((current) => ({
      ...current,
      sessions: [
        ...current.sessions,
        {
          id: makeId("session"),
          label: `Session ${current.sessions.length + 1}`,
          amount: "",
          status: "unpaid",
        },
      ],
    }));
  };

  const deleteSession = (id) => {
    setForm((current) => ({
      ...current,
      sessions:
        current.sessions.length === 1
          ? [{ id: makeId("session"), label: "Session 1", amount: "", status: "unpaid" }]
          : current.sessions.filter((session) => session.id !== id),
    }));
  };

  const handleAddDentist = () => {
    const cleanName = newDentistName.trim();

    if (!cleanName) {
      return;
    }

    if (dentists.some((dentist) => normalizeText(dentist) === normalizeText(cleanName))) {
      setActiveDentist(cleanName);
      setNewDentistName("");
      return;
    }

    const nextDentists = [...dentists, cleanName];
    setDentists(nextDentists);
    saveDentists(nextDentists);
    setActiveDentist(cleanName);
    setNewDentistName("");
    resetForm();
    playSectionSound("success");
  };

  const handleSave = async () => {
    if (!selectedPatient?._id) {
      showMessage("Select a patient before saving dentist revenue.", "danger");
      return;
    }

    const payload = {
      dentistName: activeDentist,
      doctorName: form.doctorName || activeDentist,
      patientId: selectedPatient._id,
      patientName: patientName(selectedPatient),
      patientTotal: currentPatientTotal,
      patientPaid: currentPatientPaid,
      patientBalance: currentPatientBalance,
      totalAmount: currentPatientTotal,
      expenses: form.expenses.map((expense) => ({
        ...expense,
        amount: numberValue(expense.amount),
      })),
      expenseTotal: currentExpenseTotal,
      remainingAmount: currentPatientBalance,
      share25: currentShare25,
      sessions: form.sessions.map((session, index) => ({
        ...session,
        label: session.label || `Session ${index + 1}`,
        amount: numberValue(session.amount),
        status: session.status || "unpaid",
      })),
      updatedAt: new Date().toISOString(),
    };

    setSaving(true);

    try {
      if (editingId) {
        const response = await api.put(`/dentist-revenue/${editingId}`, payload);
        const savedRecord = response.data.record || { ...payload, _id: editingId };
        setRecords((current) =>
          current.map((record) => (record._id === editingId ? savedRecord : record))
        );
        showMessage("Dentist revenue updated.");
      } else {
        const response = await api.post("/dentist-revenue", payload);
        setRecords((current) => [response.data.record, ...current]);
        showMessage("Dentist revenue saved.");
      }

      resetForm();
    } catch (requestError) {
      console.error(requestError);
      showMessage("Dentist revenue could not be saved.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
    setActiveDentist(record.dentistName || "Dentist 1");
    setEditingId(record._id);
    setForm({
      doctorName: record.doctorName || record.dentistName || "",
      patientId: record.patientId || "",
      patientSearch: record.patientName || "",
      expenses:
        (record.expenses || []).length > 0
          ? record.expenses
          : [{ id: makeId("expense"), description: "Lab charges", amount: "" }],
      sessions:
        (record.sessions || []).length > 0
          ? record.sessions
          : [{ id: makeId("session"), label: "Session 1", amount: "", status: "unpaid" }],
    });
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete dentist revenue record for ${record.patientName}?`)) {
      return;
    }

    try {
      await api.delete(`/dentist-revenue/${record._id}`);
      setRecords((current) => current.filter((item) => item._id !== record._id));
      showMessage("Dentist revenue deleted.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Dentist revenue could not be deleted.", "danger");
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page printable-page revenue-page">
        <section className="print-report-header">
          <strong>{CLINIC_NAME}</strong>
          <span>{DOCTOR_NAME}</span>
          <span>Dentist Revenue Details - {activeDentist}</span>
        </section>

        <section className="page-hero">
          <div>
            <div className="eyebrow">Dentist revenue details</div>
            <h1>{activeDentist}</h1>
            <p>Track patient amount, expense deductions, 25% share and session status.</p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" type="button" onClick={() => window.print()}>
              Print
            </button>
            <button className="btn" type="button" onClick={fetchData}>
              Refresh
            </button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}
        {message && <div className={`notice ${message.type === "danger" ? "danger" : ""}`}>{message.text}</div>}

        <section className="toolbar-panel no-print">
          <div className="segmented-control lab-tabs" aria-label="Dentist subsections">
            {dentists.map((dentist) => (
              <button
                key={dentist}
                type="button"
                className={normalizeText(activeDentist) === normalizeText(dentist) ? "active" : ""}
                onClick={() => {
                  setActiveDentist(dentist);
                  resetForm();
                  playSectionSound("section");
                }}
              >
                {dentist}
              </button>
            ))}
          </div>

          <div className="add-lab-form">
            <input
              value={newDentistName}
              onChange={(event) => setNewDentistName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddDentist();
                }
              }}
              placeholder="Add dentist subsection"
            />
            <button className="btn" type="button" onClick={handleAddDentist}>
              Add dentist
            </button>
          </div>
        </section>

        <section className="metrics-grid printable-report">
          <div className="metric-card">
            <div className="metric-accent blue" />
            <div className="metric-label">Records</div>
            <div className="metric-value">{loading ? "..." : totals.count}</div>
            <div className="metric-detail">{activeDentist}</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent green" />
            <div className="metric-label">Total amount</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.totalAmount)}</div>
            <div className="metric-detail">Patient net total</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent rose" />
            <div className="metric-label">Expenses</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.expenses)}</div>
            <div className="metric-detail">Lab, implant and grafting</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent gold" />
            <div className="metric-label">25%</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.share25)}</div>
            <div className="metric-detail">After expenses</div>
          </div>
        </section>

        <section className="panel no-print">
          <div className="panel-heading">
            <div>
              <h2>{editingId ? "Update Revenue Detail" : "Add Revenue Detail"}</h2>
              <p>Select the patient, confirm expenses and add session payments.</p>
            </div>
          </div>

          <datalist id="revenue-patient-list">
            {patients.map((patient) => (
              <option key={patient._id || regNo(patient)} value={`${patientName(patient)} - ${regNo(patient)}`} />
            ))}
          </datalist>

          <div className="payment-panel revenue-form">
            <label className="field">
              <span>Doctor Name</span>
              <input
                value={form.doctorName}
                onChange={(event) => updateForm("doctorName", event.target.value)}
                placeholder={activeDentist}
              />
            </label>
            <label className="field revenue-patient-field">
              <span>Patient Name</span>
              <input
                list="revenue-patient-list"
                value={form.patientSearch}
                onChange={(event) => handlePatientSearch(event.target.value)}
                placeholder="Select patient"
              />
            </label>
            <button className="btn btn-primary" type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            {editingId && (
              <button className="btn" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>

          {form.patientSearch && !selectedPatient && (
            <div className="notice warning">Choose an exact patient from the list before saving.</div>
          )}

          <div className="patient-select-list revenue-patient-list">
            {patients.slice(0, 12).map((patient) => (
              <button
                key={patient._id || regNo(patient)}
                type="button"
                className={`patient-select-row${selectedPatient?._id === patient._id ? " active" : ""}`}
                onClick={() => selectPatient(patient)}
              >
                <span className="patient-avatar">{patientName(patient).slice(0, 2).toUpperCase()}</span>
                <span>
                  <strong>{patientName(patient)}</strong>
                  <small>Reg {regNo(patient) || "-"} | {formatCurrency(netAmount(patient))}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="record-summary">
            <div>
              <span>Patient Total Amount</span>
              <strong>{formatCurrency(currentPatientTotal)}</strong>
            </div>
            <div>
              <span>Paid</span>
              <strong>{formatCurrency(currentPatientPaid)}</strong>
            </div>
            <div>
              <span>Balance</span>
              <strong>{formatCurrency(currentPatientBalance)}</strong>
            </div>
          </div>

          <div className="revenue-detail-grid">
            <div className="detail-card">
              <div className="panel-heading">
                <div>
                  <h3>Expenses</h3>
                </div>
                <button className="btn btn-sm" type="button" onClick={addExpense}>
                  Add expense
                </button>
              </div>

              <div className="expense-lines">
                {form.expenses.map((expense) => (
                  <div className="expense-line" key={expense.id}>
                    <input
                      value={expense.description}
                      onChange={(event) => updateExpense(expense.id, "description", event.target.value)}
                      placeholder="Lab charges, implants charges, bone grafting..."
                    />
                    <input
                      type="number"
                      min="0"
                      value={expense.amount}
                      onChange={(event) => updateExpense(expense.id, "amount", event.target.value)}
                      placeholder="Amount"
                    />
                    <button className="btn btn-sm btn-danger" type="button" onClick={() => deleteExpense(expense.id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-card">
              <h3>Calculation</h3>
              <div className="ledger-total-grid">
                <div>
                  <span>Total Amount</span>
                  <strong>{formatCurrency(currentPatientTotal)}</strong>
                </div>
                <div>
                  <span>Expenses</span>
                  <strong>{formatCurrency(currentExpenseTotal)}</strong>
                </div>
                <div>
                  <span>Remaining Amount</span>
                  <strong>{formatCurrency(currentPatientBalance)}</strong>
                </div>
                <div>
                  <span>25% After Expenses</span>
                  <strong>{formatCurrency(currentShare25)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="panel-heading">
              <div>
                <h3>Sessions</h3>
              </div>
              <button className="btn btn-sm" type="button" onClick={addSession}>
                Add session
              </button>
            </div>

            <div className="session-grid">
              {form.sessions.map((session) => (
                <div className="session-row" key={session.id}>
                  <input
                    value={session.label}
                    onChange={(event) => updateSession(session.id, "label", event.target.value)}
                    placeholder="Session 1"
                  />
                  <input
                    type="number"
                    min="0"
                    value={session.amount}
                    onChange={(event) => updateSession(session.id, "amount", event.target.value)}
                    placeholder="Amount"
                  />
                  <select
                    value={session.status}
                    onChange={(event) => updateSession(session.id, "status", event.target.value)}
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                  <button className="btn btn-sm btn-danger" type="button" onClick={() => deleteSession(session.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel printable-report">
          <div className="panel-heading">
            <div>
              <h2>{activeDentist} Revenue Ledger</h2>
              <p>Total, paid, balance, expenses and 25% after expenses.</p>
            </div>
          </div>

          <div className="data-table-wrap">
            <table className="data-table revenue-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Expenses</th>
                  <th>25%</th>
                  <th>Sessions</th>
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="9">Loading dentist revenue...</td>
                  </tr>
                )}

                {!loading && activeRecords.length === 0 && (
                  <tr>
                    <td colSpan="9">No dentist revenue records found.</td>
                  </tr>
                )}

                {activeRecords.map((record) => (
                  <tr key={record._id}>
                    <td>{record.doctorName || record.dentistName}</td>
                    <td>{record.patientName || "-"}</td>
                    <td>{formatCurrency(record.patientTotal)}</td>
                    <td>{formatCurrency(record.patientPaid)}</td>
                    <td>{formatCurrency(record.patientBalance)}</td>
                    <td>
                      <strong>{formatCurrency(record.expenseTotal)}</strong>
                      {(record.expenses || []).map((expense) => (
                        <small key={expense.id || expense.description}>
                          {expense.description}: {formatCurrency(expense.amount)}
                        </small>
                      ))}
                    </td>
                    <td>{formatCurrency(record.share25)}</td>
                    <td>
                      <strong>{formatCurrency(sessionPaidTotal(record.sessions))} paid</strong>
                      {(record.sessions || []).map((session) => (
                        <small key={session.id || session.label}>
                          {session.label}: {formatCurrency(session.amount)} ({session.status})
                        </small>
                      ))}
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
        </section>
      </div>
    </Layout>
  );
}

export default DentistRevenue;
