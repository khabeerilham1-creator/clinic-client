import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  activeShift,
  activeShiftId,
  filterPatientsForActiveShift,
  formatCurrency,
  formatDateDisplay,
  initials,
  mobileNumber,
  patientArray,
  patientName,
  regNo,
} from "../utils/patientHelpers";
import { CLINIC_NAME, DEFAULT_LABS, DOCTOR_NAME } from "../utils/clinicData";
import { playSectionSound } from "../utils/sound";

const LAB_STORAGE_KEY = "clinicLabs";

const todayInputValue = () => new Date().toISOString().split("T")[0];

const emptyForm = (patientId = "") => ({
  date: todayInputValue(),
  patientId,
  job: "",
  units: "",
  shade: "",
  costPerUnit: "",
});

const emptyPaymentForm = () => ({
  date: todayInputValue(),
  amount: "",
  method: "",
  note: "",
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

const paymentArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.payments)) {
    return payload.payments;
  }

  return [];
};

const recordDate = (record) => record.date || record.sendingDate || "";
const recordJob = (record) => record.job || record.details || "";
const recordUnits = (record) => Number(record.units || 0);
const recordShade = (record) => record.shade || "";
const recordCostPerUnit = (record) => {
  const explicitCost = Number(record.costPerUnit || record.cost_per_unit || 0);

  if (explicitCost) {
    return explicitCost;
  }

  const units = recordUnits(record);
  const total = Number(record.totalAmount || record.amount || 0);

  return units ? total / units : total;
};
const recordTotalAmount = (record) => {
  const explicitTotal = Number(record.totalAmount || record.total_amount || record.amount || 0);

  if (explicitTotal) {
    return explicitTotal;
  }

  return recordUnits(record) * recordCostPerUnit(record);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function LabRecords({ activePage, setActivePage, handleLogout }) {
  const shift = activeShift();
  const [labs, setLabs] = useState(loadLabs);
  const [activeLab, setActiveLab] = useState(() => loadLabs()[0] || DEFAULT_LABS[0]);
  const [newLabName, setNewLabName] = useState("");
  const [patients, setPatients] = useState([]);
  const [labPayments, setLabPayments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [editingId, setEditingId] = useState(null);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsResponse, paymentsResponse] = await Promise.all([
        api.get("/patients", {
          params: { limit: 100, sort: "createdAt", order: -1, shift: activeShiftId() },
        }),
        api.get("/lab-payments", { params: { limit: 1000 } }),
      ]);
      const list = filterPatientsForActiveShift(patientArray(patientsResponse.data));

      setPatients(list);
      setLabPayments(paymentArray(paymentsResponse.data));

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

  const activeLabPayments = useMemo(
    () =>
      labPayments
        .filter((payment) => normalizeText(payment.labName) === normalizeText(activeLab))
        .sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))),
    [labPayments, activeLab]
  );

  const ledgerTotals = useMemo(() => {
    const totalBill = activeLabRows.reduce((sum, record) => sum + recordTotalAmount(record), 0);
    const paid = activeLabPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return {
      totalBill,
      paid,
      remaining: Math.max(totalBill - paid, 0),
    };
  }, [activeLabRows, activeLabPayments]);

  const selectedPatientRows = useMemo(
    () =>
      activeLabRows.filter((record) => selectedPatient?._id && record.patient?._id === selectedPatient._id),
    [activeLabRows, selectedPatient]
  );

  const currentTotalAmount = Number(form.units || 0) * Number(form.costPerUnit || 0);

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
    setEditingPaymentId(null);
    setPaymentForm(emptyPaymentForm());
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
        normalizeText(regNo(patient)) === normalizeText(value) ||
        normalizeText(`${patientName(patient)} - ${regNo(patient)}`) === normalizeText(value)
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
      showMessage("Select a patient before saving a lab case.", "danger");
      return;
    }

    if (!form.job.trim() && !currentTotalAmount) {
      showMessage("Enter job or amount before saving.", "danger");
      return;
    }

    const record = {
      id: editingId || makeRecordId(),
      labName: activeLab,
      date: form.date || todayInputValue(),
      job: form.job.trim(),
      units: Number(form.units || 0),
      shade: form.shade.trim(),
      costPerUnit: Number(form.costPerUnit || 0),
      totalAmount: currentTotalAmount,
      updatedAt: new Date().toISOString(),
    };

    const currentRecords = patient.labRecords || [];
    const nextRecords = editingId
      ? currentRecords.map((item) => (item.id === editingId ? record : item))
      : [record, ...currentRecords];

    const updatedPatient = {
      ...patient,
      labRecords: nextRecords,
    };

    setSaving(true);

    try {
      await updatePatient(updatedPatient);
      resetForm(patient._id);
      showMessage(editingId ? "Lab case updated." : "Lab case saved.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Lab case could not be saved. Please try again.", "danger");
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
      units: String(recordUnits(record) || ""),
      shade: recordShade(record),
      costPerUnit: String(recordCostPerUnit(record) || ""),
    });
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete ${activeLab} case for ${record.patientName}?`)) {
      return;
    }

    const patient = record.patient;
    const updatedPatient = {
      ...patient,
      labRecords: (patient.labRecords || []).filter((item) => item.id !== record.id),
    };

    try {
      await updatePatient(updatedPatient);
      resetForm(patient._id);
      showMessage("Lab case deleted.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Lab case could not be deleted.", "danger");
    }
  };

  const resetPaymentForm = () => {
    setEditingPaymentId(null);
    setPaymentForm(emptyPaymentForm());
  };

  const handleSavePayment = async () => {
    if (!Number(paymentForm.amount || 0)) {
      showMessage("Enter paid amount before saving.", "danger");
      return;
    }

    const payload = {
      labName: activeLab,
      date: paymentForm.date || todayInputValue(),
      amount: Number(paymentForm.amount || 0),
      method: paymentForm.method,
      note: paymentForm.note,
    };

    try {
      if (editingPaymentId) {
        const response = await api.put(`/lab-payments/${editingPaymentId}`, payload);
        const savedPayment = response.data.payment || { ...payload, _id: editingPaymentId };
        setLabPayments((current) =>
          current.map((payment) => (payment._id === editingPaymentId ? savedPayment : payment))
        );
        showMessage("Lab payment updated.");
      } else {
        const response = await api.post("/lab-payments", payload);
        setLabPayments((current) => [response.data.payment, ...current]);
        showMessage("Lab payment saved.");
      }

      resetPaymentForm();
    } catch (requestError) {
      console.error(requestError);
      showMessage("Lab payment could not be saved.", "danger");
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPaymentId(payment._id);
    setPaymentForm({
      date: payment.date || todayInputValue(),
      amount: String(payment.amount || ""),
      method: payment.method || "",
      note: payment.note || "",
    });
  };

  const handleDeletePayment = async (payment) => {
    if (!window.confirm("Delete this lab payment?")) {
      return;
    }

    try {
      await api.delete(`/lab-payments/${payment._id}`);
      setLabPayments((current) => current.filter((item) => item._id !== payment._id));
      resetPaymentForm();
      showMessage("Lab payment deleted.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Lab payment could not be deleted.", "danger");
    }
  };

  const printLedger = () => {
    const printWindow = window.open("", "", "width=1000,height=760");

    if (!printWindow) {
      window.alert("Print window could not open. Please allow popups for this site.");
      return;
    }

    const caseRows = activeLabRows
      .map(
        (record, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(record.patientName)}</td>
            <td>${escapeHtml(activeLab)}</td>
            <td>${escapeHtml(recordJob(record))}</td>
            <td>${escapeHtml(recordUnits(record))}</td>
            <td>${escapeHtml(recordShade(record))}</td>
            <td>${escapeHtml(formatCurrency(recordCostPerUnit(record)))}</td>
            <td>${escapeHtml(formatCurrency(recordTotalAmount(record)))}</td>
          </tr>
        `
      )
      .join("");
    const paymentRows = activeLabPayments
      .map(
        (payment, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(formatDateDisplay(payment.date))}</td>
            <td>${escapeHtml(payment.method || "-")}</td>
            <td>${escapeHtml(payment.note || "-")}</td>
            <td>${escapeHtml(formatCurrency(payment.amount))}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(activeLab)} Ledger</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#111827}
            h1{font-size:20px;margin:0 0 4px;text-transform:uppercase}
            h2{font-size:15px;margin:0 0 18px;color:#475569}
            h3{font-size:13px;margin:18px 0 8px;text-transform:uppercase}
            table{width:100%;border-collapse:collapse}
            th,td{border:1px solid #cbd5e1;padding:7px;text-align:left;font-size:11px}
            th{background:#f1f5f9;text-transform:uppercase;font-size:10px}
            .totals{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
            .totals div{border:1px solid #cbd5e1;padding:10px}
            .totals span{display:block;color:#64748b;font-size:10px;text-transform:uppercase}
            .totals strong{display:block;margin-top:4px;font-size:15px}
          </style>
        </head>
        <body>
          <h1>${escapeHtml(CLINIC_NAME)}</h1>
          <h2>${escapeHtml(activeLab)} Payment Ledger</h2>
          <div class="totals">
            <div><span>Total Bill</span><strong>${escapeHtml(formatCurrency(ledgerTotals.totalBill))}</strong></div>
            <div><span>Paid</span><strong>${escapeHtml(formatCurrency(ledgerTotals.paid))}</strong></div>
            <div><span>Remaining</span><strong>${escapeHtml(formatCurrency(ledgerTotals.remaining))}</strong></div>
          </div>
          <h3>Lab Cases</h3>
          <table>
            <thead>
              <tr><th>S No</th><th>Patient Name</th><th>Lab Name</th><th>Job</th><th>Units</th><th>Shade</th><th>Cost Per Unit</th><th>Total Amount</th></tr>
            </thead>
            <tbody>${caseRows || `<tr><td colspan="8">No lab cases recorded.</td></tr>`}</tbody>
          </table>
          <h3>Payment Details</h3>
          <table>
            <thead><tr><th>S No</th><th>Paid Date</th><th>Method</th><th>Note</th><th>Paid</th></tr></thead>
            <tbody>${paymentRows || `<tr><td colspan="5">No payments recorded.</td></tr>`}</tbody>
          </table>
          <script>window.onload=()=>setTimeout(()=>window.print(),250);<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page printable-page lab-page">
        <section className="print-report-header">
          <strong>{CLINIC_NAME}</strong>
          <span>{shift?.label || DOCTOR_NAME}</span>
          <span>{activeLab} Payment Ledger</span>
        </section>

        <section className="page-hero">
          <div>
            <div className="eyebrow">Lab module</div>
            <h1>{activeLab}</h1>
            <p>Lab cases with separate printable payment ledger for every lab.</p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" type="button" onClick={printLedger}>
              Print ledger
            </button>
            <button className="btn" type="button" onClick={fetchData}>
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
                {lab}
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

        <section className="metrics-grid printable-report">
          <div className="metric-card">
            <div className="metric-accent blue" />
            <div className="metric-label">Lab Cases</div>
            <div className="metric-value">{loading ? "..." : activeLabRows.length}</div>
            <div className="metric-detail">{activeLab}</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent rose" />
            <div className="metric-label">Total Bill</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(ledgerTotals.totalBill)}</div>
            <div className="metric-detail">All cases in this lab</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent green" />
            <div className="metric-label">Paid</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(ledgerTotals.paid)}</div>
            <div className="metric-detail">Lab payments</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent gold" />
            <div className="metric-label">Remaining</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(ledgerTotals.remaining)}</div>
            <div className="metric-detail">Still payable</div>
          </div>
        </section>

        <section className="lab-layout">
          <div className="panel patient-select-panel no-print">
            <div className="panel-heading">
              <div>
                <h2>Patient Search</h2>
                <p>Select the patient for this lab case.</p>
              </div>
            </div>

            <datalist id="lab-patient-list">
              {patients.map((patient) => (
                <option key={patient._id || regNo(patient)} value={`${patientName(patient)} - ${regNo(patient)}`} />
              ))}
            </datalist>

            <label className="search-field">
              <span>Patient Name</span>
              <input
                list="lab-patient-list"
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

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>{editingId ? "Update Lab Case" : "Add Lab Case"}</h2>
                <p>
                  {selectedPatient
                    ? `Selected: ${patientName(selectedPatient)} | Reg ${regNo(selectedPatient) || "-"}`
                    : "Select a patient and enter case details."}
                </p>
              </div>
            </div>

            <div className="payment-panel lab-case-form no-print">
              <label className="field">
                <span>Date</span>
                <input type="date" value={form.date} onChange={(event) => handleChange("date", event.target.value)} />
              </label>
              <label className="field lab-patient-field">
                <span>Patient Name</span>
                <input
                  list="lab-patient-list"
                  value={patientSearch}
                  onChange={(event) => handlePatientSearch(event.target.value)}
                  placeholder="Search and select patient"
                />
              </label>
              <label className="field">
                <span>Lab Name</span>
                <input value={activeLab} readOnly />
              </label>
              <label className="field">
                <span>Job</span>
                <input value={form.job} onChange={(event) => handleChange("job", event.target.value)} placeholder="Crown, bridge..." />
              </label>
              <label className="field">
                <span>Units</span>
                <input type="number" min="0" value={form.units} onChange={(event) => handleChange("units", event.target.value)} />
              </label>
              <label className="field">
                <span>Shade</span>
                <input value={form.shade} onChange={(event) => handleChange("shade", event.target.value)} />
              </label>
              <label className="field">
                <span>Cost Per Unit</span>
                <input type="number" min="0" value={form.costPerUnit} onChange={(event) => handleChange("costPerUnit", event.target.value)} />
              </label>
              <div className="calculated-field">
                <span>Total Amount</span>
                <strong>{formatCurrency(currentTotalAmount)}</strong>
              </div>
              <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Save"}
              </button>
              {editingId && (
                <button className="btn" type="button" onClick={() => resetForm()}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="panel no-print">
          <div className="panel-heading">
            <div>
              <h2>Payment Details</h2>
              <p>Total bill, paid, remaining, paid dates and payment method for {activeLab}.</p>
            </div>
            <button className="btn btn-dark" type="button" onClick={printLedger}>
              Print
            </button>
          </div>

          <div className="ledger-total-grid">
            <div>
              <span>Total Bill</span>
              <strong>{formatCurrency(ledgerTotals.totalBill)}</strong>
            </div>
            <div>
              <span>Paid</span>
              <strong>{formatCurrency(ledgerTotals.paid)}</strong>
            </div>
            <div>
              <span>Remaining</span>
              <strong>{formatCurrency(ledgerTotals.remaining)}</strong>
            </div>
          </div>

          <div className="payment-panel ledger-payment-form">
            <label className="field">
              <span>Paid Date</span>
              <input
                type="date"
                value={paymentForm.date}
                onChange={(event) => setPaymentForm((current) => ({ ...current, date: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Paid Amount</span>
              <input
                type="number"
                min="0"
                value={paymentForm.amount}
                onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))}
                placeholder="Enter amount"
              />
            </label>
            <label className="field">
              <span>Method</span>
              <input
                value={paymentForm.method}
                onChange={(event) => setPaymentForm((current) => ({ ...current, method: event.target.value }))}
                placeholder="Cash, card, bank transfer..."
              />
            </label>
            <label className="field">
              <span>Note</span>
              <input
                value={paymentForm.note}
                onChange={(event) => setPaymentForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="Payment note"
              />
            </label>
            <button className="btn btn-primary" type="button" onClick={handleSavePayment}>
              {editingPaymentId ? "Update payment" : "Save payment"}
            </button>
            {editingPaymentId && (
              <button className="btn" type="button" onClick={resetPaymentForm}>
                Cancel
              </button>
            )}
          </div>

          <div className="data-table-wrap">
            <table className="data-table compact-table">
              <thead>
                <tr>
                  <th>Paid Date</th>
                  <th>Paid Amount</th>
                  <th>Method</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeLabPayments.length === 0 && (
                  <tr>
                    <td colSpan="5">No lab payments recorded.</td>
                  </tr>
                )}

                {activeLabPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{formatDateDisplay(payment.date) || "-"}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>{payment.method || "-"}</td>
                    <td>{payment.note || "-"}</td>
                    <td className="row-actions">
                      <button className="btn btn-sm" type="button" onClick={() => handleEditPayment(payment)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDeletePayment(payment)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel printable-report">
          <div className="panel-heading">
            <div>
              <h2>{activeLab} Cases</h2>
              <p>
                {selectedPatient
                  ? `${patientName(selectedPatient)} has ${selectedPatientRows.length} cases in this lab.`
                  : "All saved cases for the selected lab."}
              </p>
            </div>
          </div>

          <div className="data-table-wrap">
            <table className="data-table lab-record-table">
              <thead>
                <tr>
                  <th>S No</th>
                  <th>Patient Name</th>
                  <th>Lab Name</th>
                  <th>Job</th>
                  <th>Units</th>
                  <th>Shade</th>
                  <th>Cost Per Unit</th>
                  <th>Total Amount</th>
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="9">Loading lab cases...</td>
                  </tr>
                )}

                {!loading && activeLabRows.length === 0 && (
                  <tr>
                    <td colSpan="9">No cases saved for {activeLab} yet.</td>
                  </tr>
                )}

                {activeLabRows.map((record, index) => (
                  <tr key={record.id || `${record.regNo}-${index}`}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{record.patientName}</strong>
                      <small>Reg {record.regNo || "-"} | {record.mobileNumber}</small>
                    </td>
                    <td>{activeLab}</td>
                    <td>{recordJob(record) || "-"}</td>
                    <td>{recordUnits(record) || "-"}</td>
                    <td>{recordShade(record) || "-"}</td>
                    <td>{formatCurrency(recordCostPerUnit(record))}</td>
                    <td>{formatCurrency(recordTotalAmount(record))}</td>
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

export default LabRecords;
