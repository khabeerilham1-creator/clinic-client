import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import { expenseArray, formatCurrency } from "../utils/patientHelpers";
import { playSectionSound } from "../utils/sound";

const todayInputValue = () => new Date().toISOString().split("T")[0];

const EMPTY_FORM = {
  expenseName: "",
  date: todayInputValue(),
  status: "paid",
  amount: "",
  details: "",
};

const CATEGORY_LABELS = {
  clinical: "Clinical Expenses",
  home: "Home Expenses",
};

function Expenses({ activePage, setActivePage, handleLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [activeCategory, setActiveCategory] = useState("clinical");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/expenses", {
        params: { limit: 500, sort: "date", order: -1 },
      });

      setExpenses(expenseArray(response.data));
    } catch (requestError) {
      console.error(requestError);
      setError("Expenses could not be loaded. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const visibleExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return expenses
      .filter((expense) => expense.category === activeCategory)
      .filter(
        (expense) =>
          !query ||
          expense.expenseName?.toLowerCase().includes(query) ||
          expense.details?.toLowerCase().includes(query)
      )
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }, [expenses, activeCategory, search]);

  const totals = useMemo(() => {
    const total = visibleExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const paid = visibleExpenses
      .filter((expense) => expense.status === "paid")
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const unpaid = total - paid;

    return {
      count: visibleExpenses.length,
      total,
      paid,
      unpaid,
    };
  }, [visibleExpenses]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.expenseName.trim()) {
      alert("Expense name is required.");
      return;
    }

    const payload = {
      ...form,
      category: activeCategory,
      expenseName: form.expenseName.trim(),
      amount: Number(form.amount || 0),
      date: form.date || todayInputValue(),
    };

    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
        setExpenses((current) =>
          current.map((expense) =>
            expense._id === editingId ? { ...expense, ...payload } : expense
          )
        );
      } else {
        const response = await api.post("/expenses", payload);
        setExpenses((current) => [response.data.expense, ...current]);
      }

      playSectionSound("success");
      resetForm();
    } catch (requestError) {
      console.error(requestError);
      alert(requestError?.response?.data?.detail || "Expense could not be saved.");
    }
  };

  const handleEdit = (expense) => {
    setActiveCategory(expense.category || "clinical");
    setEditingId(expense._id);
    setForm({
      expenseName: expense.expenseName || "",
      date: expense.date || todayInputValue(),
      status: expense.status || "paid",
      amount: String(expense.amount ?? ""),
      details: expense.details || "",
    });
  };

  const handleDelete = async (expense) => {
    if (!window.confirm(`Delete expense "${expense.expenseName}"?`)) {
      return;
    }

    try {
      await api.delete(`/expenses/${expense._id}`);
      setExpenses((current) => current.filter((entry) => entry._id !== expense._id));
      playSectionSound("success");
    } catch (requestError) {
      console.error(requestError);
      alert("Expense could not be deleted.");
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Expense control</div>
            <h1>Expenses</h1>
            <p>Separate clinical and home expenses with paid/unpaid status.</p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" type="button" onClick={() => window.print()}>
              Print
            </button>
            <button className="btn" type="button" onClick={fetchExpenses}>
              Refresh
            </button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="toolbar-panel no-print">
          <div className="segmented-control" aria-label="Expense category">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={activeCategory === key ? "active" : ""}
                onClick={() => {
                  setActiveCategory(key);
                  resetForm();
                  playSectionSound("section");
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="search-field">
            <span>Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Expense name or details"
            />
          </div>
        </section>

        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-accent blue" />
            <div className="metric-label">Entries</div>
            <div className="metric-value">{loading ? "..." : totals.count}</div>
            <div className="metric-detail">{CATEGORY_LABELS[activeCategory]}</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent rose" />
            <div className="metric-label">Total</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.total)}</div>
            <div className="metric-detail">All visible expenses</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent green" />
            <div className="metric-label">Paid</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.paid)}</div>
            <div className="metric-detail">Already paid</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent gold" />
            <div className="metric-label">Unpaid</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.unpaid)}</div>
            <div className="metric-detail">Still pending</div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{editingId ? "Update Expense" : `Add ${CATEGORY_LABELS[activeCategory]}`}</h2>
              <p>Saved entries are included in finance net income reports.</p>
            </div>
          </div>

          <div className="payment-panel expense-form no-print">
            <label className="field">
              <span>Expense Name</span>
              <input
                value={form.expenseName}
                onChange={(event) => handleChange("expenseName", event.target.value)}
                placeholder="Rent, electricity, sanitizer, staff meal..."
              />
            </label>
            <label className="field">
              <span>Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) => handleChange("date", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => handleChange("status", event.target.value)}
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
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
              <span>Details</span>
              <input
                value={form.details}
                onChange={(event) => handleChange("details", event.target.value)}
                placeholder="Notes or vendor"
              />
            </label>
            <button className="btn btn-primary" type="button" onClick={handleSubmit}>
              {editingId ? "Update" : "Save"}
            </button>
            {editingId && (
              <button className="btn" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Details</th>
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6">Loading expenses...</td>
                  </tr>
                )}

                {!loading && visibleExpenses.length === 0 && (
                  <tr>
                    <td colSpan="6">No expenses found.</td>
                  </tr>
                )}

                {visibleExpenses.map((expense) => (
                  <tr key={expense._id || `${expense.expenseName}-${expense.date}`}>
                    <td>
                      <strong>{expense.expenseName}</strong>
                    </td>
                    <td>{expense.date || "-"}</td>
                    <td>
                      <span className={expense.status === "paid" ? "pill success" : "pill warning"}>
                        {expense.status === "paid" ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td>{formatCurrency(expense.amount)}</td>
                    <td>{expense.details || "-"}</td>
                    <td className="row-actions no-print">
                      <button className="btn btn-sm" type="button" onClick={() => handleEdit(expense)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        type="button"
                        onClick={() => handleDelete(expense)}
                      >
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

export default Expenses;
