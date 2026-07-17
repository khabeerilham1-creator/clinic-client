import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import MonthPeriodSelector from "../components/reports/MonthPeriodSelector";
import ReportActionButtons from "../components/reports/ReportActionButtons";
import { CLINIC_NAME, DOCTOR_NAME } from "../utils/clinicData";
import {
  balanceDue,
  formatCurrency,
  invoiceTotal,
  mobileNumber,
  netAmount,
  patientArray,
  patientName,
  paymentsTotal,
  regNo,
} from "../utils/patientHelpers";
import { escapeHtml, openPrintWindow, printElement } from "../utils/printLedger";
import { currentPeriod, periodLabel, recordInPeriod } from "../utils/reportPeriod";
import { playSectionSound } from "../utils/sound";

const todayInputValue = () => new Date().toISOString().split("T")[0];

const emptyPayableForm = () => ({
  to: "",
  amount: "",
  description: "",
  status: "Un paid",
  date: todayInputValue(),
});

const payableArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.payables)) {
    return payload.payables;
  }

  return [];
};

const patientDepartment = (patient) => {
  const sheet = String(patient?.entrySheetType || "routine").toLowerCase();

  if (sheet === "orthodontic") {
    return "Ortho";
  }

  if (sheet === "fullDenture") {
    return "Prosthetic";
  }

  if (sheet === "implant") {
    return "Implant";
  }

  const invoiceText = (patient?.invoice || [])
    .map((row) => `${row?.procedure || ""} ${row?.treatment || ""}`)
    .join(" ")
    .toLowerCase();

  if (invoiceText.includes("ortho")) {
    return "Ortho";
  }

  if (invoiceText.includes("prost") || invoiceText.includes("denture")) {
    return "Prosthetic";
  }

  if (invoiceText.includes("endo")) {
    return "Endodontic";
  }

  return "General";
};

const receivableGroup = (patient) => {
  const department = patientDepartment(patient);

  if (department === "Ortho") {
    return "Ortho-Dontic Patient";
  }

  const visits = patient?.plannedSequence || [];
  const hasFutureVisits = visits.some((visit) => {
    const status = String(visit?.status || "").toLowerCase();
    return status !== "done" && status !== "completed";
  });

  if (hasFutureVisits) {
    return "Patient With Continue Treatment";
  }

  return "General Receivables";
};

function AdminFinance({ activePage, setActivePage, handleLogout, mode = "receivable" }) {
  const active = currentPeriod();
  const isPayable = mode === "payable";
  const [periodMonth, setPeriodMonth] = useState(active.month);
  const [periodYear, setPeriodYear] = useState(active.year);
  const [patients, setPatients] = useState([]);
  const [payables, setPayables] = useState([]);
  const [form, setForm] = useState(emptyPayableForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, [periodMonth, periodYear, isPayable]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = currentPeriod();

      if (next.month !== periodMonth || next.year !== periodYear) {
        setPeriodMonth(next.month);
        setPeriodYear(next.year);
        setEditingId(null);
        setForm(emptyPayableForm());
      }
    }, 60000);

    return () => window.clearInterval(timer);
  }, [periodMonth, periodYear]);

  const fetchData = async () => {
    setLoading(true);

    try {
      if (isPayable) {
        const response = await api.get("/account-payables", {
          params: { month: periodMonth, year: periodYear, limit: 1000 },
        });
        setPayables(payableArray(response.data));
      } else {
        const response = await api.get("/patients", {
          params: { limit: 500, sort: "createdAt", order: -1 },
        });
        setPatients(patientArray(response.data));
      }
    } catch (requestError) {
      console.error(requestError);
      if (isPayable) {
        setPayables([]);
      } else {
        setPatients([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const receivableRows = useMemo(() => {
    return patients
      .map((patient) => ({
        patient,
        fileNo: regNo(patient),
        name: patientName(patient),
        department: patientDepartment(patient),
        totalAmount: netAmount(patient),
        paid: paymentsTotal(patient),
        balance: balanceDue(patient),
        group: receivableGroup(patient),
      }))
      .filter((row) => row.totalAmount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [patients]);

  const groupedReceivables = useMemo(() => {
    const groups = new Map();

    receivableRows.forEach((row) => {
      if (!groups.has(row.group)) {
        groups.set(row.group, []);
      }

      groups.get(row.group).push(row);
    });

    return Array.from(groups.entries());
  }, [receivableRows]);

  const payableRows = useMemo(
    () => payables.filter((entry) => recordInPeriod(entry, periodMonth, periodYear)),
    [payables, periodMonth, periodYear]
  );

  const totalReceivable = receivableRows.reduce((sum, row) => sum + row.balance, 0);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    playSectionSound(type === "danger" ? "warning" : "success");
    window.setTimeout(() => setMessage(null), 3200);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyPayableForm());
  };

  const handlePeriodChange = (month, year) => {
    setPeriodMonth(month);
    setPeriodYear(year);
    resetForm();
  };

  const handleSavePayable = async () => {
    if (!form.to.trim()) {
      showMessage("Enter payee name.", "danger");
      return;
    }

    const payload = {
      to: form.to.trim(),
      amount: Number(form.amount || 0),
      description: form.description.trim(),
      status: form.status,
      date: form.date || todayInputValue(),
      periodMonth,
      periodYear,
    };

    setSaving(true);

    try {
      if (editingId) {
        const response = await api.put(`/account-payables/${editingId}`, payload);
        const saved = response.data.payable || { ...payload, _id: editingId };
        setPayables((current) => current.map((entry) => (entry._id === editingId ? saved : entry)));
        showMessage("Payable updated.");
      } else {
        const response = await api.post("/account-payables", payload);
        setPayables((current) => [...current, response.data.payable]);
        showMessage("Payable saved.");
      }

      resetForm();
    } catch (requestError) {
      console.error(requestError);
      showMessage(requestError?.response?.data?.detail || "Payable could not be saved.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleEditPayable = (entry) => {
    setEditingId(entry._id);
    setForm({
      to: entry.to || "",
      amount: String(entry.amount ?? ""),
      description: entry.description || "",
      status: entry.status || "Un paid",
      date: entry.date || todayInputValue(),
    });
  };

  const handleDeletePayable = async (entry) => {
    if (!window.confirm("Delete this payable entry?")) {
      return;
    }

    try {
      await api.delete(`/account-payables/${entry._id}`);
      setPayables((current) => current.filter((item) => item._id !== entry._id));
      if (editingId === entry._id) {
        resetForm();
      }
      showMessage("Payable deleted.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Payable could not be deleted.", "danger");
    }
  };

  const printPayableEntry = (entry, index) => {
    openPrintWindow({
      title: "Account Payable",
      subtitle: periodLabel(periodMonth, periodYear),
      bodyHtml: `
        <table>
          <tr><th>S.No</th><th>To</th><th>Amount</th><th>Description</th><th>Status</th></tr>
          <tr>
            <td class="center">${index + 1}</td>
            <td>${escapeHtml(entry.to)}</td>
            <td class="amount">${escapeHtml(formatCurrency(entry.amount))}</td>
            <td>${escapeHtml(entry.description || "-")}</td>
            <td>${escapeHtml(entry.status || "Un paid")}</td>
          </tr>
        </table>
      `,
    });
  };

  const printReceivableEntry = (row, index) => {
    openPrintWindow({
      title: "Account Receivable",
      subtitle: periodLabel(periodMonth, periodYear),
      bodyHtml: `
        <table>
          <tr><th>S.No</th><th>File No</th><th>Patient Name</th><th>Department</th><th>Total Amount</th><th>Paid</th><th>Balance</th></tr>
          <tr>
            <td class="center">${index + 1}</td>
            <td>${escapeHtml(row.fileNo || "-")}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${escapeHtml(row.department)}</td>
            <td class="amount">${escapeHtml(formatCurrency(row.totalAmount))}</td>
            <td class="amount">${escapeHtml(formatCurrency(row.paid))}</td>
            <td class="amount">${escapeHtml(formatCurrency(row.balance))}</td>
          </tr>
        </table>
      `,
    });
  };

  const handleEditReceivable = (row) => {
    localStorage.setItem("editPatient", JSON.stringify({ ...row.patient, isEditing: true }));
    setActivePage("patients");
  };

  const handleDeleteReceivable = async (row) => {
    if (!row.patient?._id || !window.confirm(`Delete patient record for ${row.name}?`)) {
      return;
    }

    try {
      await api.delete(`/patients/${row.patient._id}`);
      setPatients((current) => current.filter((patient) => patient._id !== row.patient._id));
      showMessage("Patient record deleted.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Patient record could not be deleted.", "danger");
    }
  };

  const printReport = () => {
    printElement(
      isPayable ? "account-payable-sheet" : "account-receivable-sheet",
      `${isPayable ? "Account Payable" : "Account Receivables"} (${periodLabel(periodMonth, periodYear)})`
    );
  };

  let serial = 0;

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page printable-page">
        <section className="print-report-header">
          <strong>{CLINIC_NAME}</strong>
          <span>{DOCTOR_NAME}</span>
          <span>
            {isPayable ? "Account Payable" : "Account Receivables"} ({periodLabel(periodMonth, periodYear)})
          </span>
        </section>

        <section className="page-hero accent-hero admin-hero">
          <div>
            <div className="eyebrow">Admin finance</div>
            <h1>{isPayable ? "Account Payable" : "Account Receivables"}</h1>
            <p>Monthly ledger that renews automatically. Period: {periodLabel(periodMonth, periodYear)}.</p>
          </div>

          <div className="hero-actions no-print">
            <MonthPeriodSelector
              month={periodMonth}
              year={periodYear}
              onChange={handlePeriodChange}
            />
            <button className="btn btn-primary" type="button" onClick={printReport}>
              Print
            </button>
            <button className="btn" type="button" onClick={fetchData}>
              Refresh
            </button>
          </div>
        </section>

        {message && <div className={`notice ${message.type === "danger" ? "danger" : ""}`}>{message.text}</div>}

        {isPayable && (
          <section className="panel no-print">
            <div className="panel-heading">
              <div>
                <h2>{editingId ? "Update Payable" : "Add Payable"}</h2>
                <p>Save vendor payables for the selected month.</p>
              </div>
            </div>

            <div className="payment-panel expense-form">
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>To</span>
                <input
                  value={form.to}
                  onChange={(event) => setForm((current) => ({ ...current, to: event.target.value }))}
                  placeholder="Vendor / payee"
                />
              </label>
              <label className="field">
                <span>Amount</span>
                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Description</span>
                <input
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Dental Material, Lab bill..."
                />
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="Un paid">Un paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                </select>
              </label>
              <button className="btn btn-primary" type="button" onClick={handleSavePayable} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Save"}
              </button>
              {editingId && (
                <button className="btn" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </section>
        )}

        <section className="panel printable-report gold-bordered">
          {isPayable ? (
            <div id="account-payable-sheet" className="ledger-sheet">
              <div className="ledger-sheet-title">
                Account Payable ({periodLabel(periodMonth, periodYear)})
              </div>
              <div className="data-table-wrap">
                <table className="ledger-table full-width-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>To</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th className="no-print">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan="6">Loading payables...</td>
                      </tr>
                    )}

                    {!loading && payableRows.length === 0 && (
                      <tr>
                        <td colSpan="6">No payables for this month.</td>
                      </tr>
                    )}

                    {payableRows.map((entry, index) => (
                      <tr key={entry._id}>
                        <td className="center">{index + 1}</td>
                        <td>{entry.to}</td>
                        <td className="amount">{formatCurrency(entry.amount)}</td>
                        <td>{entry.description || "-"}</td>
                        <td>{entry.status || "Un paid"}</td>
                        <td>
                          <ReportActionButtons
                            onPrint={() => printPayableEntry(entry, index)}
                            onEdit={() => handleEditPayable(entry)}
                            onDelete={() => handleDeletePayable(entry)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div id="account-receivable-sheet" className="ledger-sheet">
              <div className="ledger-sheet-title">
                Account Receivables ({periodLabel(periodMonth, periodYear)})
              </div>
              <div className="data-table-wrap">
                <table className="ledger-table full-width-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>File No</th>
                      <th>Patient Name</th>
                      <th>Department</th>
                      <th>Total Amount</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th className="no-print">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan="8">Loading receivables...</td>
                      </tr>
                    )}

                    {!loading && receivableRows.length === 0 && (
                      <tr>
                        <td colSpan="8">No open receivables found.</td>
                      </tr>
                    )}

                    {groupedReceivables.map(([groupName, rows]) => (
                      <React.Fragment key={groupName}>
                        {groupName !== "General Receivables" && (
                          <tr className="group-header-row">
                            <td colSpan="8">{groupName}</td>
                          </tr>
                        )}
                        {rows.map((row) => {
                          serial += 1;
                          const currentSerial = serial;

                          return (
                            <tr key={row.patient._id || row.fileNo}>
                              <td className="center">{currentSerial}</td>
                              <td>{row.fileNo || "-"}</td>
                              <td>{row.name}</td>
                              <td>{row.department}</td>
                              <td className="amount">{formatCurrency(row.totalAmount)}</td>
                              <td className="amount">{formatCurrency(row.paid)}</td>
                              <td className="amount">{formatCurrency(row.balance)}</td>
                              <td>
                                <ReportActionButtons
                                  onPrint={() => printReceivableEntry(row, currentSerial - 1)}
                                  onEdit={() => handleEditReceivable(row)}
                                  onDelete={() => handleDeleteReceivable(row)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}

                    <tr className="total-row">
                      <td colSpan="6" className="total-label-cell">
                        <span className="total-box">Total A/R Of {MONTH_SHORT(periodMonth)}</span>
                      </td>
                      <td className="amount">
                        <span className="total-box">{formatCurrency(totalReceivable)}</span>
                      </td>
                      <td className="no-print" />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

const MONTH_SHORT = (month) =>
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1];

export default AdminFinance;
