import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  activeShift,
  activeShiftId,
  balanceDue,
  bio,
  discountAmount,
  filterPatientsForActiveShift,
  formatDateDisplay,
  formatCurrency,
  initials,
  invoiceTotal,
  mobileNumber,
  netAmount,
  parseLocalDate,
  patientArray,
  patientName,
  patientRecordDate,
  paymentsTotal,
  regNo,
} from "../utils/patientHelpers";
import { CLINIC_NAME, DOCTOR_NAME } from "../utils/clinicData";
import { playSectionSound } from "../utils/sound";

const todayInputValue = () => new Date().toISOString().split("T")[0];

const expenseArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.expenses)) {
    return payload.expenses;
  }

  return [];
};

const entryAmount = (entry) => Number(entry?.amount || 0);

const ledgerEntryValue = (entry) => {
  const type = String(entry?.type || "payment").toLowerCase();
  const amount = entryAmount(entry);

  return type === "debit" || type === "charge" ? -amount : amount;
};

const listTotal = (items = []) =>
  items.reduce((sum, item) => sum + entryAmount(item), 0);

const patientExpenseTotal = (patient) =>
  listTotal(patient?.doctorShare) +
  listTotal(patient?.labExpenses) +
  listTotal(patient?.dentalMaterials);

const allPatientExpenseEntries = (patient) => [
  ...(patient?.doctorShare || []).map((entry) => ({ ...entry, category: "Doctor share" })),
  ...(patient?.labExpenses || []).map((entry) => ({ ...entry, category: "Lab expenses" })),
  ...(patient?.dentalMaterials || []).map((entry) => ({ ...entry, category: "Dental material" })),
];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const reportBounds = (period, anchorValue) => {
  const anchor = parseLocalDate(anchorValue) || new Date();

  if (period === "weekly") {
    const start = startOfDay(anchor);
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);

    const end = endOfDay(start);
    end.setDate(start.getDate() + 6);

    return { start, end };
  }

  if (period === "yearly") {
    return {
      start: new Date(anchor.getFullYear(), 0, 1),
      end: new Date(anchor.getFullYear(), 11, 31, 23, 59, 59, 999),
    };
  }

  return {
    start: new Date(anchor.getFullYear(), anchor.getMonth(), 1),
    end: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999),
  };
};

const withinBounds = (value, bounds) => {
  const date = parseLocalDate(value);

  return Boolean(date && date >= bounds.start && date <= bounds.end);
};

const reportLabel = (period, bounds) => {
  if (period === "weekly") {
    return `${bounds.start.toLocaleDateString("en-PK")} - ${bounds.end.toLocaleDateString("en-PK")}`;
  }

  if (period === "yearly") {
    return String(bounds.start.getFullYear());
  }

  return bounds.start.toLocaleDateString("en-PK", {
    month: "long",
    year: "numeric",
  });
};

function AccountStatus({ activePage, setActivePage, handleLogout }) {
  const shift = activeShift();
  const [patients, setPatients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [reportDate, setReportDate] = useState(todayInputValue());
  const [paymentForm, setPaymentForm] = useState({
    date: todayInputValue(),
    amount: "",
    description: "",
  });
  const [editingPaymentKey, setEditingPaymentKey] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsResponse, expensesResponse] = await Promise.all([
        api.get("/patients", {
          params: { limit: 100, sort: "createdAt", order: -1, shift: activeShiftId() },
        }),
        api.get("/expenses", {
          params: { limit: 500, sort: "date", order: -1 },
        }),
      ]);

      setPatients(filterPatientsForActiveShift(patientArray(patientsResponse.data)));
      setExpenses(expenseArray(expensesResponse.data));
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
    const dueAmount = filteredPatients.reduce((sum, patient) => sum + balanceDue(patient), 0);
    const paidAmount = filteredPatients.reduce((sum, patient) => sum + paymentsTotal(patient), 0);
    const operatingExpenses = expenses.reduce((sum, expense) => sum + entryAmount(expense), 0);
    const totalExpenses = operatingExpenses;

    return {
      dueAmount,
      incomeAmount: paidAmount,
      totalExpenses,
      netIncome: paidAmount - totalExpenses,
    };
  }, [filteredPatients, expenses]);

  const financeReport = useMemo(() => {
    const bounds = reportBounds(reportPeriod, reportDate);
    const periodPatients = patients
      .filter((patient) => withinBounds(patientRecordDate(patient), bounds))
      .sort((a, b) => patientName(a).localeCompare(patientName(b)));
    const periodIncome = patients.reduce(
      (sum, patient) =>
        sum +
        (patient.accountLedger || [])
          .filter((entry) => withinBounds(entry.date || entry.timestamp, bounds))
          .reduce((ledgerSum, entry) => ledgerSum + ledgerEntryValue(entry), 0),
      0
    );
    const periodExpenses = expenses.filter((expense) =>
      withinBounds(expense.date || expense.createdAt, bounds)
    );
    const operatingExpenseAmount = periodExpenses.reduce(
      (sum, expense) => sum + entryAmount(expense),
      0
    );
    const breakdown = [
      {
        label: "Administration",
        amount: periodExpenses
          .filter((expense) => expense.category === "administration")
          .reduce((sum, expense) => sum + entryAmount(expense.totalAmount || expense.amount), 0),
      },
      {
        label: "Team",
        amount: periodExpenses
          .filter((expense) => expense.category === "team")
          .reduce((sum, expense) => sum + entryAmount(expense.netSalary || expense.amount), 0),
      },
      {
        label: "Dental Material",
        amount: periodExpenses
          .filter((expense) => expense.category === "dental-material")
          .reduce((sum, expense) => sum + entryAmount(expense.totalAmount || expense.amount), 0),
      },
      {
        label: "Dental Implants",
        amount: periodExpenses
          .filter((expense) => expense.category === "dental-implants")
          .reduce((sum, expense) => sum + entryAmount(expense.totalAmount || expense.amount), 0),
      },
    ];
    const totalExpenses = operatingExpenseAmount;

    return {
      bounds,
      label: reportLabel(reportPeriod, bounds),
      patients: periodPatients,
      income: periodIncome,
      expenses: totalExpenses,
      netIncome: periodIncome - totalExpenses,
      breakdown,
    };
  }, [patients, expenses, reportDate, reportPeriod]);

  const handleEdit = (patient) => {
    localStorage.setItem("editPatient", JSON.stringify({ ...patient, isEditing: true }));
    setActivePage("patients");
  };

  const handleDeletePatient = async (patient) => {
    if (!patient?._id) {
      return;
    }

    const confirmed = window.confirm(`Delete patient account for ${patientName(patient)}?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/patients/${patient._id}`);
      setPatients((current) => current.filter((item) => item._id !== patient._id));
      setSelectedPatient(null);
      playSectionSound("warning");
    } catch (requestError) {
      console.error(requestError);
      alert("Patient account could not be deleted. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const ledgerEntryKey = (entry, index) => entry.id || String(index);

  const resetPaymentForm = () => {
    setEditingPaymentKey(null);
    setPaymentForm({
      date: todayInputValue(),
      amount: "",
      description: "",
    });
  };

  const handleAddPayment = async () => {
    if (!selectedPatient?._id || !Number(paymentForm.amount || 0)) {
      return;
    }

    const entry = {
      date: paymentForm.date,
      amount: Number(paymentForm.amount),
      description: paymentForm.description || "Payment received",
      type: "payment",
    };

    try {
      let savedEntry = entry;
      let nextLedger = selectedPatient.accountLedger || [];

      if (editingPaymentKey !== null) {
        const response = await api.put(
          `/patients/${selectedPatient._id}/ledger/${editingPaymentKey}`,
          entry
        );
        savedEntry = response.data.entry || entry;
        nextLedger = nextLedger.map((item, index) =>
          ledgerEntryKey(item, index) === editingPaymentKey ? savedEntry : item
        );
      } else {
        const response = await api.post(`/patients/${selectedPatient._id}/ledger`, entry);
        savedEntry = response.data.entry || entry;
        nextLedger = [...nextLedger, savedEntry];
      }

      const updatedPatient = {
        ...selectedPatient,
        accountLedger: nextLedger,
      };

      setSelectedPatient(updatedPatient);
      setPatients((current) =>
        current.map((patient) => (patient._id === selectedPatient._id ? updatedPatient : patient))
      );
      resetPaymentForm();
      playSectionSound("success");
    } catch (requestError) {
      console.error(requestError);
      alert("Payment could not be saved. Please try again.");
    }
  };

  const handleEditPayment = (entry, index) => {
    setEditingPaymentKey(ledgerEntryKey(entry, index));
    setPaymentForm({
      date: entry.date || todayInputValue(),
      amount: String(entry.amount || ""),
      description: entry.description || "",
    });
  };

  const handleDeletePayment = async (entry, index) => {
    const key = ledgerEntryKey(entry, index);

    if (!selectedPatient?._id || !window.confirm("Delete this payment?")) {
      return;
    }

    try {
      await api.delete(`/patients/${selectedPatient._id}/ledger/${key}`);
      const updatedPatient = {
        ...selectedPatient,
        accountLedger: (selectedPatient.accountLedger || []).filter(
          (item, itemIndex) => ledgerEntryKey(item, itemIndex) !== key
        ),
      };

      setSelectedPatient(updatedPatient);
      setPatients((current) =>
        current.map((patient) => (patient._id === selectedPatient._id ? updatedPatient : patient))
      );
      resetPaymentForm();
      playSectionSound("warning");
    } catch (requestError) {
      console.error(requestError);
      alert("Payment could not be deleted. Please try again.");
    }
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      handleLogout={handleLogout}
    >
      <div className="page printable-page">
        <section className="print-report-header">
          <strong>{CLINIC_NAME}</strong>
          <span>{DOCTOR_NAME}</span>
          <span>Finance Report - {financeReport.label}</span>
        </section>

        <section className="page-hero">
          <div>
            <div className="eyebrow">Finance cockpit</div>
            <h1>{shift?.label ? `${shift.label} Account Status` : "Account Status"}</h1>
            <p>
              Track income, expenses, balances and printable finance reports.
            </p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" onClick={handlePrint}>Print report</button>
            <button className="btn" onClick={fetchPatients}>Refresh</button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-accent gold" />
            <div className="metric-label">Net income</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.netIncome)}</div>
            <div className="metric-detail">Income after all expenses</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent green" />
            <div className="metric-label">Income received</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.incomeAmount)}</div>
            <div className="metric-detail">Payments in visible accounts</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent rose" />
            <div className="metric-label">Total expenses</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.totalExpenses)}</div>
            <div className="metric-detail">Doctor, lab, material and expense entries</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent blue" />
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

        <section className="panel finance-report printable-report">
          <div className="panel-heading">
            <div>
              <h2>Finance Report</h2>
              <p>{financeReport.label}</p>
            </div>

            <div className="filter-controls no-print">
              <label className="field inline-field">
                <span>Report</span>
                <select
                  value={reportPeriod}
                  onChange={(event) => setReportPeriod(event.target.value)}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>
              <label className="field inline-field">
                <span>Date</span>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(event) => setReportDate(event.target.value)}
                />
              </label>
              <button className="btn btn-dark" type="button" onClick={handlePrint}>
                Print
              </button>
            </div>
          </div>

          <div className="record-summary">
            <div>
              <span>Income</span>
              <strong>{formatCurrency(financeReport.income)}</strong>
            </div>
            <div>
              <span>Expenses</span>
              <strong>{formatCurrency(financeReport.expenses)}</strong>
            </div>
            <div>
              <span>Net income</span>
              <strong>{formatCurrency(financeReport.netIncome)}</strong>
            </div>
            <div>
              <span>Patients</span>
              <strong>{financeReport.patients.length}</strong>
            </div>
          </div>

          <div className="data-table-wrap">
            <table className="data-table compact-table">
              <thead>
                <tr>
                  <th>Expense Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {financeReport.breakdown.map((item) => (
                  <tr key={item.label}>
                    <td>{item.label}</td>
                    <td>{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <button className="btn btn-danger" onClick={() => handleDeletePatient(selectedPatient)}>Delete</button>
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
                <strong>{formatCurrency(discountAmount(selectedPatient))}</strong>
              </div>
              <div>
                <span>Paid</span>
                <strong>{formatCurrency(paymentsTotal(selectedPatient))}</strong>
              </div>
              <div>
                <span>Remaining</span>
                <strong>{formatCurrency(balanceDue(selectedPatient))}</strong>
              </div>
            </div>

            <div className="payment-panel no-print">
              <label className="field">
                <span>Paid Date</span>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(event) => setPaymentForm((form) => ({ ...form, date: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Paid Amount</span>
                <input
                  type="number"
                  min="0"
                  value={paymentForm.amount}
                  onChange={(event) => setPaymentForm((form) => ({ ...form, amount: event.target.value }))}
                  placeholder="Enter amount"
                />
              </label>
              <label className="field">
                <span>Payment Note</span>
                <input
                  value={paymentForm.description}
                  onChange={(event) => setPaymentForm((form) => ({ ...form, description: event.target.value }))}
                  placeholder="Cash, card, bank transfer..."
                />
              </label>
              <button className="btn btn-primary" type="button" onClick={handleAddPayment}>
                {editingPaymentKey !== null ? "Update payment" : "Save payment"}
              </button>
              {editingPaymentKey !== null && (
                <button className="btn" type="button" onClick={resetPaymentForm}>
                  Cancel
                </button>
              )}
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

            <div className="detail-card">
              <h3>Payment Details</h3>
              <div className="data-table-wrap">
                <table className="data-table compact-table">
                  <thead>
                    <tr>
                      <th>Paid Date</th>
                      <th>Details</th>
                      <th>Amount</th>
                      <th>Remaining After Payment</th>
                      <th className="no-print">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPatient.accountLedger || []).length === 0 && (
                      <tr>
                        <td colSpan="5">No payment details recorded.</td>
                      </tr>
                    )}

                    {(selectedPatient.accountLedger || []).map((entry, index) => {
                      const paidUntilNow = (selectedPatient.accountLedger || [])
                        .slice(0, index + 1)
                        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

                      return (
                        <tr key={`${entry.date}-${index}`}>
                          <td>{formatDateDisplay(entry.date) || "-"}</td>
                          <td>{entry.description || "Payment received"}</td>
                          <td>{formatCurrency(entry.amount)}</td>
                          <td>{formatCurrency(Math.max(netAmount(selectedPatient) - paidUntilNow, 0))}</td>
                          <td className="row-actions no-print">
                            <button className="btn btn-sm" type="button" onClick={() => handleEditPayment(entry, index)}>
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              type="button"
                              onClick={() => handleDeletePayment(entry, index)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {false && (
              <>
            <div className="detail-card">
              <h3>Doctor Share</h3>
              <div className="payment-panel no-print">
                <label className="field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={doctorShareForm.date}
                    onChange={(event) =>
                      setDoctorShareForm((form) => ({ ...form, date: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    value={doctorShareForm.amount}
                    onChange={(event) =>
                      setDoctorShareForm((form) => ({ ...form, amount: event.target.value }))
                    }
                    placeholder="Doctor share"
                  />
                </label>
                <label className="field">
                  <span>Status</span>
                  <select
                    value={doctorShareForm.status}
                    onChange={(event) =>
                      setDoctorShareForm((form) => ({ ...form, status: event.target.value }))
                    }
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </label>
                <button className="btn btn-primary" type="button" onClick={handleAddDoctorShare}>
                  Save share
                </button>
              </div>

              <div className="data-table-wrap">
                <table className="data-table compact-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Paid / Unpaid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPatient.doctorShare || []).length === 0 && (
                      <tr>
                        <td colSpan="3">No doctor share recorded.</td>
                      </tr>
                    )}

                    {(selectedPatient.doctorShare || []).map((entry, index) => (
                      <tr key={`${entry.date}-${index}`}>
                        <td>{formatDateDisplay(entry.date) || "-"}</td>
                        <td>{formatCurrency(entry.amount)}</td>
                        <td>{entry.status === "paid" ? "Paid" : "Unpaid"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="detail-card">
              <h3>Lab Expenses</h3>
              <div className="payment-panel no-print">
                <label className="field">
                  <span>Lab Name</span>
                  <input
                    value={labExpenseForm.labName}
                    onChange={(event) =>
                      setLabExpenseForm((form) => ({ ...form, labName: event.target.value }))
                    }
                    placeholder="Lab name"
                  />
                </label>
                <label className="field">
                  <span>Details</span>
                  <input
                    value={labExpenseForm.details}
                    onChange={(event) =>
                      setLabExpenseForm((form) => ({ ...form, details: event.target.value }))
                    }
                    placeholder="Case or item details"
                  />
                </label>
                <label className="field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={labExpenseForm.date}
                    onChange={(event) =>
                      setLabExpenseForm((form) => ({ ...form, date: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    value={labExpenseForm.amount}
                    onChange={(event) =>
                      setLabExpenseForm((form) => ({ ...form, amount: event.target.value }))
                    }
                    placeholder="Lab expense"
                  />
                </label>
                <label className="field">
                  <span>Status</span>
                  <select
                    value={labExpenseForm.status}
                    onChange={(event) =>
                      setLabExpenseForm((form) => ({ ...form, status: event.target.value }))
                    }
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </label>
                <button className="btn btn-primary" type="button" onClick={handleAddLabExpense}>
                  Save lab
                </button>
              </div>

              <div className="data-table-wrap">
                <table className="data-table compact-table">
                  <thead>
                    <tr>
                      <th>Lab Name</th>
                      <th>Details</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Paid / Unpaid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPatient.labExpenses || []).length === 0 && (
                      <tr>
                        <td colSpan="5">No lab expenses recorded.</td>
                      </tr>
                    )}

                    {(selectedPatient.labExpenses || []).map((entry, index) => (
                      <tr key={`${entry.labName}-${entry.date}-${index}`}>
                        <td>{entry.labName || "-"}</td>
                        <td>{entry.details || "-"}</td>
                        <td>{formatDateDisplay(entry.date) || "-"}</td>
                        <td>{formatCurrency(entry.amount)}</td>
                        <td>{entry.status === "paid" ? "Paid" : "Unpaid"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="detail-card">
              <h3>Dental Material</h3>
              <div className="payment-panel no-print">
                <label className="field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={dentalMaterialForm.date}
                    onChange={(event) =>
                      setDentalMaterialForm((form) => ({ ...form, date: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    value={dentalMaterialForm.amount}
                    onChange={(event) =>
                      setDentalMaterialForm((form) => ({ ...form, amount: event.target.value }))
                    }
                    placeholder="Material amount"
                  />
                </label>
                <label className="field">
                  <span>Status</span>
                  <select
                    value={dentalMaterialForm.status}
                    onChange={(event) =>
                      setDentalMaterialForm((form) => ({ ...form, status: event.target.value }))
                    }
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </label>
                <button className="btn btn-primary" type="button" onClick={handleAddDentalMaterial}>
                  Save material
                </button>
              </div>

              <div className="data-table-wrap">
                <table className="data-table compact-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Paid / Unpaid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPatient.dentalMaterials || []).length === 0 && (
                      <tr>
                        <td colSpan="3">No dental material expense recorded.</td>
                      </tr>
                    )}

                    {(selectedPatient.dentalMaterials || []).map((entry, index) => (
                      <tr key={`${entry.date}-${index}`}>
                        <td>{formatDateDisplay(entry.date) || "-"}</td>
                        <td>{formatCurrency(entry.amount)}</td>
                        <td>{entry.status === "paid" ? "Paid" : "Unpaid"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              </>
            )}
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
                        Payment
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
