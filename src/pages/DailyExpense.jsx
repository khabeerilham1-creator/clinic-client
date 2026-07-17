import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import MonthPeriodSelector from "../components/reports/MonthPeriodSelector";
import ReportActionButtons from "../components/reports/ReportActionButtons";
import { CLINIC_NAME, DOCTOR_NAME } from "../utils/clinicData";
import { escapeHtml, openPrintWindow, printElement } from "../utils/printLedger";
import { currentPeriod, periodLabel, recordInPeriod } from "../utils/reportPeriod";
import { formatCurrency } from "../utils/patientHelpers";
import { playSectionSound } from "../utils/sound";

const CATEGORIES = [
  { key: "refreshment", label: "Refreshment" },
  { key: "food", label: "Food" },
  { key: "tea", label: "Tea" },
  { key: "kitchen", label: "Kitchen" },
  { key: "general", label: "General" },
  { key: "washroom", label: "Washrooms" },
];

const todayInputValue = () => new Date().toISOString().split("T")[0];

const emptyForm = (category = "refreshment") => ({
  category,
  description: "",
  qty: "",
  amount: "",
  date: todayInputValue(),
});

const expenseArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.expenses)) {
    return payload.expenses;
  }

  return [];
};

function DailyExpense({ activePage, setActivePage, handleLogout }) {
  const active = currentPeriod();
  const [periodMonth, setPeriodMonth] = useState(active.month);
  const [periodYear, setPeriodYear] = useState(active.year);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, [periodMonth, periodYear]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = currentPeriod();

      if (next.month !== periodMonth || next.year !== periodYear) {
        setPeriodMonth(next.month);
        setPeriodYear(next.year);
        setEditingId(null);
        setForm(emptyForm());
      }
    }, 60000);

    return () => window.clearInterval(timer);
  }, [periodMonth, periodYear]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/daily-expenses", {
        params: { month: periodMonth, year: periodYear, limit: 2000 },
      });

      setExpenses(expenseArray(response.data));
    } catch (requestError) {
      console.error(requestError);
      setError("Daily expenses could not be loaded.");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    const map = Object.fromEntries(CATEGORIES.map((category) => [category.key, []]));

    expenses
      .filter((entry) => recordInPeriod(entry, periodMonth, periodYear))
      .forEach((entry) => {
        const key = entry.category || "general";

        if (!map[key]) {
          map[key] = [];
        }

        map[key].push(entry);
      });

    return map;
  }, [expenses, periodMonth, periodYear]);

  const categoryTotals = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        ...category,
        total: (grouped[category.key] || []).reduce(
          (sum, entry) => sum + Number(entry.amount || 0),
          0
        ),
      })),
    [grouped]
  );

  const grandTotal = categoryTotals.reduce((sum, category) => sum + category.total, 0);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    playSectionSound(type === "danger" ? "warning" : "success");
    window.setTimeout(() => setMessage(null), 3200);
  };

  const resetForm = (category = form.category) => {
    setEditingId(null);
    setForm(emptyForm(category));
  };

  const handlePeriodChange = (month, year) => {
    setPeriodMonth(month);
    setPeriodYear(year);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!form.description.trim()) {
      showMessage("Enter a description.", "danger");
      return;
    }

    const payload = {
      category: form.category,
      description: form.description.trim(),
      qty: Number(form.qty || 0),
      amount: Number(form.amount || 0),
      date: form.date || todayInputValue(),
      periodMonth,
      periodYear,
    };

    setSaving(true);

    try {
      if (editingId) {
        const response = await api.put(`/daily-expenses/${editingId}`, payload);
        const saved = response.data.expense || { ...payload, _id: editingId };
        setExpenses((current) =>
          current.map((entry) => (entry._id === editingId ? saved : entry))
        );
        showMessage("Entry updated.");
      } else {
        const response = await api.post("/daily-expenses", payload);
        setExpenses((current) => [...current, response.data.expense]);
        showMessage("Entry saved.");
      }

      resetForm(form.category);
    } catch (requestError) {
      console.error(requestError);
      showMessage(
        requestError?.response?.data?.detail || "Entry could not be saved.",
        "danger"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      category: entry.category || "general",
      description: entry.description || "",
      qty: String(entry.qty ?? ""),
      amount: String(entry.amount ?? ""),
      date: entry.date || todayInputValue(),
    });
  };

  const handleDelete = async (entry) => {
    if (!window.confirm("Delete this daily expense entry?")) {
      return;
    }

    try {
      await api.delete(`/daily-expenses/${entry._id}`);
      setExpenses((current) => current.filter((item) => item._id !== entry._id));
      if (editingId === entry._id) {
        resetForm();
      }
      showMessage("Entry deleted.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Entry could not be deleted.", "danger");
    }
  };

  const printEntry = (entry) => {
    openPrintWindow({
      title: "Daily Expense Entry",
      subtitle: `${CATEGORIES.find((item) => item.key === entry.category)?.label || "Daily Expense"} - ${periodLabel(periodMonth, periodYear)}`,
      bodyHtml: `
        <table>
          <tr><th>Description</th><th>Qty</th><th class="amount">Amount</th></tr>
          <tr>
            <td>${escapeHtml(entry.description)}</td>
            <td class="center">${escapeHtml(entry.qty || "-")}</td>
            <td class="amount">${escapeHtml(formatCurrency(entry.amount))}</td>
          </tr>
        </table>
      `,
    });
  };

  const printReport = () => {
    printElement("daily-expense-sheet", `Daily Expenses (${periodLabel(periodMonth, periodYear)})`);
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page printable-page">
        <section className="print-report-header">
          <strong>{CLINIC_NAME}</strong>
          <span>{DOCTOR_NAME}</span>
          <span>Daily Expenses ({periodLabel(periodMonth, periodYear)})</span>
        </section>

        <section className="page-hero">
          <div>
            <div className="eyebrow">Receptionist</div>
            <h1>Daily Expenses</h1>
            <p>
              Monthly expense sheet that renews automatically each month. Current period:{" "}
              {periodLabel(periodMonth, periodYear)}.
            </p>
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
            <button className="btn" type="button" onClick={fetchExpenses}>
              Refresh
            </button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}
        {message && <div className={`notice ${message.type === "danger" ? "danger" : ""}`}>{message.text}</div>}

        <section className="panel no-print">
          <div className="panel-heading">
            <div>
              <h2>{editingId ? "Update Entry" : "Add Entry"}</h2>
              <p>Entries are saved for {periodLabel(periodMonth, periodYear)} only.</p>
            </div>
          </div>

          <div className="payment-panel expense-form">
            <label className="field">
              <span>Category</span>
              <select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              >
                {CATEGORIES.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Description</span>
              <input
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Item description"
              />
            </label>
            <label className="field">
              <span>Qty</span>
              <input
                type="number"
                min="0"
                value={form.qty}
                onChange={(event) => setForm((current) => ({ ...current, qty: event.target.value }))}
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
            <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            {editingId && (
              <button className="btn" type="button" onClick={() => resetForm()}>
                Cancel
              </button>
            )}
          </div>
        </section>

        <section className="panel printable-report">
          <div id="daily-expense-sheet" className="ledger-sheet daily-expense-sheet">
            <div className="ledger-sheet-title">Daily Expenses</div>
            <div className="ledger-sheet-subtitle">D/E Details</div>

            <div className="daily-expense-summary">
              {categoryTotals.map((category) => (
                <div key={category.key} className="daily-expense-summary-item">
                  <span>{category.label}</span>
                  <strong>{formatCurrency(category.total)}</strong>
                </div>
              ))}
              <div className="daily-expense-summary-total">
                <span>Total</span>
                <strong>{formatCurrency(grandTotal)}</strong>
              </div>
            </div>

            <div className="daily-expense-grid">
              {CATEGORIES.map((category) => {
                const rows = grouped[category.key] || [];
                const total = categoryTotals.find((item) => item.key === category.key)?.total || 0;

                return (
                  <div key={category.key} className="category-mini-table">
                    <div className="category-mini-table-title">{category.label}</div>
                    <table className="ledger-table">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Qty</th>
                          <th>Amount</th>
                          <th className="no-print">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && (
                          <tr>
                            <td colSpan="4">Loading...</td>
                          </tr>
                        )}

                        {!loading && rows.length === 0 && (
                          <tr>
                            <td colSpan="4">No entries</td>
                          </tr>
                        )}

                        {rows.map((entry) => (
                          <tr key={entry._id}>
                            <td>{entry.description}</td>
                            <td className="center">{entry.qty || "-"}</td>
                            <td className="amount">{formatCurrency(entry.amount)}</td>
                            <td>
                              <ReportActionButtons
                                onPrint={() => printEntry(entry)}
                                onEdit={() => handleEdit(entry)}
                                onDelete={() => handleDelete(entry)}
                              />
                            </td>
                          </tr>
                        ))}
                        <tr className="total-row">
                          <td colSpan="2">Total</td>
                          <td className="amount">
                            <span className="total-box">{formatCurrency(total)}</span>
                          </td>
                          <td className="no-print" />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default DailyExpense;
