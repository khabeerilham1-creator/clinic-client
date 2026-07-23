import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import MonthPeriodSelector from "../components/reports/MonthPeriodSelector";
import { formatCurrency, formatDateDisplay } from "../utils/patientHelpers";
import { currentPeriod, periodLabel, recordInPeriod } from "../utils/reportPeriod";
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

const emptyForm = () => ({
  date: todayInputValue(),
  description: "",
  amount: "",
  paid: "",
});

function LedgerExpensePage({
  activePage,
  setActivePage,
  handleLogout,
  category,
  title,
}) {
  const active = currentPeriod();
  const [periodMonth, setPeriodMonth] = useState(active.month);
  const [periodYear, setPeriodYear] = useState(active.year);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, [category]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/expenses", {
        params: { category, limit: 1000, sort: "date", order: 1 },
      });

      setExpenses(expenseArray(response.data));
    } catch (requestError) {
      console.error(requestError);
      setError(`${title} could not be loaded.`);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(
    () =>
      expenses
        .filter((entry) => recordInPeriod(entry, periodMonth, periodYear))
        .sort((a, b) => String(a.date || a.dueDate || "").localeCompare(String(b.date || b.dueDate || ""))),
    [expenses, periodMonth, periodYear]
  );

  const totals = useMemo(() => {
    const amount = rows.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const paid = rows.reduce((sum, entry) => sum + Number(entry.paid || 0), 0);

    return {
      amount,
      paid,
      balance: Math.max(amount - paid, 0),
    };
  }, [rows]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    playSectionSound(type === "danger" ? "warning" : "success");
    window.setTimeout(() => setMessage(null), 3200);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!form.description.trim()) {
      showMessage("Enter description.", "danger");
      return;
    }

    const payload = {
      category,
      expenseName: form.description.trim(),
      description: form.description.trim(),
      date: form.date || todayInputValue(),
      amount: Number(form.amount || 0),
      paid: Number(form.paid || 0),
      status: Number(form.paid || 0) >= Number(form.amount || 0) ? "paid" : "unpaid",
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
        setExpenses((current) =>
          current.map((entry) => (entry._id === editingId ? { ...entry, ...payload } : entry))
        );
        showMessage("Entry updated.");
      } else {
        const response = await api.post("/expenses", payload);
        setExpenses((current) => [...current, response.data.expense]);
        showMessage("Entry saved.");
      }

      resetForm();
    } catch (requestError) {
      console.error(requestError);
      showMessage(requestError?.response?.data?.detail || "Entry could not be saved.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      date: entry.date || entry.dueDate || todayInputValue(),
      description: entry.description || entry.expenseName || "",
      amount: String(entry.amount ?? ""),
      paid: String(entry.paid ?? ""),
    });
  };

  const handleDelete = async (entry) => {
    if (!window.confirm("Delete this entry?")) {
      return;
    }

    try {
      await api.delete(`/expenses/${entry._id}`);
      setExpenses((current) => current.filter((item) => item._id !== entry._id));
      showMessage("Entry deleted.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Entry could not be deleted.", "danger");
    }
  };

  const visibleRows = Array.from({ length: Math.max(21, rows.length) }, (_, index) => rows[index] || null);

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page printable-page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Receptionist</div>
            <h1>{title}</h1>
            <p>{periodLabel(periodMonth, periodYear)} ledger format.</p>
          </div>

          <div className="hero-actions no-print">
            <MonthPeriodSelector month={periodMonth} year={periodYear} onChange={(month, year) => {
              setPeriodMonth(month);
              setPeriodYear(year);
              resetForm();
            }} />
            <button className="btn btn-primary" type="button" onClick={() => window.print()}>
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
              <h2>{editingId ? "Update Entry" : `Add ${title}`}</h2>
              <p>Saved entries appear in the paper ledger below.</p>
            </div>
          </div>

          <div className="payment-panel expense-form ledger-expense-form">
            <label className="field">
              <span>Date</span>
              <input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <label className="field">
              <span>Description</span>
              <input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label className="field">
              <span>Amount</span>
              <input type="number" min="0" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
            </label>
            <label className="field">
              <span>Paid</span>
              <input type="number" min="0" value={form.paid} onChange={(event) => setForm((current) => ({ ...current, paid: event.target.value }))} />
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
        </section>

        <section className="panel printable-report paper-report-panel">
          <div className="paper-ledger-sheet">
            <div className="paper-title-box">
              <div>{title}</div>
              <span>({periodLabel(periodMonth, periodYear)})</span>
            </div>

            <div className="data-table-wrap">
              <table className="paper-ledger-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th className="no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="7">Loading...</td>
                    </tr>
                  )}

                  {!loading && visibleRows.map((entry, index) => {
                    const amount = Number(entry?.amount || 0);
                    const paid = Number(entry?.paid || 0);

                    return (
                      <tr key={entry?._id || `blank-${index}`}>
                        <td className="center">{index + 1}</td>
                        <td>{entry ? formatDateDisplay(entry.date || entry.dueDate) : ""}</td>
                        <td>{entry?.description || entry?.expenseName || ""}</td>
                        <td className="amount">{entry ? amount || "?" : ""}</td>
                        <td className="amount">{entry ? (paid >= amount && amount > 0 ? "Paid" : paid || "?") : ""}</td>
                        <td className="amount">{entry ? Math.max(amount - paid, 0) || 0 : ""}</td>
                        <td className="row-actions no-print">
                          {entry && (
                            <>
                              <button className="btn btn-sm" type="button" onClick={() => handleEdit(entry)}>Edit</button>
                              <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(entry)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="paper-total-row">
              <span>Total</span>
              <strong>{totals.amount}</strong>
            </div>
            <div className="paper-total-row">
              <span>Balance</span>
              <strong>{totals.balance}</strong>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default LedgerExpensePage;
