import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import { expenseArray, formatCurrency, formatDateDisplay } from "../utils/patientHelpers";
import { CLINIC_NAME, DOCTOR_NAME } from "../utils/clinicData";
import { playSectionSound } from "../utils/sound";

const todayInputValue = () => new Date().toISOString().split("T")[0];

const CATEGORIES = [
  { key: "administration", label: "Administration" },
  { key: "team", label: "Team" },
  { key: "dental-material", label: "Dental Material" },
  { key: "dental-implants", label: "Dental Implants" },
];

const ADMIN_DESCRIPTIONS = ["Rent", "Pesco", "Nayatel", "Water"];
const TEAM_DESIGNATIONS = [
  "Assistant manager",
  "Receptionist",
  "Assistant 1",
  "Assistant 2",
  "Office assistant",
  "Dentist",
];

const emptyForm = (category) => {
  if (category === "team") {
    return {
      designation: TEAM_DESIGNATIONS[0],
      name: "",
      joiningDate: todayInputValue(),
      basicSalary: "",
      allocation: "",
      deduction: "",
    };
  }

  if (category === "dental-material") {
    return {
      date: todayInputValue(),
      shop: "",
      item: "",
      qty: "",
      ratePerUnit: "",
    };
  }

  if (category === "dental-implants") {
    return {
      date: todayInputValue(),
      vendor: "",
      items: "",
      qty: "",
      ratePerImplant: "",
    };
  }

  return {
    dueDate: todayInputValue(),
    description: ADMIN_DESCRIPTIONS[0],
    amount: "",
    paid: "",
  };
};

const emptyPaymentForm = () => ({
  date: todayInputValue(),
  amount: "",
  method: "",
  note: "",
});

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const numberValue = (value) => Number(value || 0);

const makeId = (prefix) => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
};

const categoryLabel = (key) => CATEGORIES.find((item) => item.key === key)?.label || "Expenses";

const entryBill = (entry) =>
  numberValue(entry.totalAmount || entry.netSalary || entry.amount);

const entryPaid = (entry) => {
  if (Array.isArray(entry.payments) && entry.payments.length > 0) {
    return entry.payments.reduce((sum, payment) => sum + numberValue(payment.amount), 0);
  }

  return numberValue(entry.paid);
};

const entryRemaining = (entry) => Math.max(entryBill(entry) - entryPaid(entry), 0);

const entryStatus = (entry) => {
  const bill = entryBill(entry);
  const paid = entryPaid(entry);

  if (bill > 0 && paid >= bill) {
    return "Paid";
  }

  if (paid > 0) {
    return "Partial";
  }

  return "Unpaid";
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function Expenses({
  activePage,
  setActivePage,
  handleLogout,
  initialCategory = "administration",
  allowedCategories,
}) {
  const categoryOptions = useMemo(() => {
    if (!Array.isArray(allowedCategories) || allowedCategories.length === 0) {
      return CATEGORIES;
    }

    const allowed = new Set(allowedCategories);
    return CATEGORIES.filter((category) => allowed.has(category.key));
  }, [allowedCategories]);
  const defaultCategory = categoryOptions.some((category) => category.key === initialCategory)
    ? initialCategory
    : categoryOptions[0]?.key || "administration";
  const [expenses, setExpenses] = useState([]);
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [form, setForm] = useState(() => emptyForm(defaultCategory));
  const [editingId, setEditingId] = useState(null);
  const [ledgerRecordId, setLedgerRecordId] = useState(null);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/expenses", {
        params: { limit: 1000, sort: "updatedAt", order: -1 },
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
    const query = normalizeText(search);

    return expenses
      .filter((expense) => expense.category === activeCategory)
      .filter((expense) => {
        if (!query) {
          return true;
        }

        return [
          expense.description,
          expense.expenseName,
          expense.name,
          expense.designation,
          expense.shop,
          expense.vendor,
          expense.item,
          expense.items,
        ].some((value) => normalizeText(value).includes(query));
      })
      .sort((a, b) =>
        String(b.date || b.dueDate || b.joiningDate || b.updatedAt || "").localeCompare(
          String(a.date || a.dueDate || a.joiningDate || a.updatedAt || "")
        )
      );
  }, [expenses, activeCategory, search]);

  const ledgerRecord = useMemo(
    () => expenses.find((expense) => expense._id === ledgerRecordId) || null,
    [expenses, ledgerRecordId]
  );

  const totals = useMemo(() => {
    const bill = visibleExpenses.reduce((sum, expense) => sum + entryBill(expense), 0);
    const paid = visibleExpenses.reduce((sum, expense) => sum + entryPaid(expense), 0);

    return {
      count: visibleExpenses.length,
      bill,
      paid,
      remaining: Math.max(bill - paid, 0),
    };
  }, [visibleExpenses]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    playSectionSound(type === "danger" ? "warning" : "success");
    window.setTimeout(() => setMessage(null), 3200);
  };

  const resetForm = (category = activeCategory) => {
    setEditingId(null);
    setForm(emptyForm(category));
  };

  const switchCategory = (category) => {
    if (!categoryOptions.some((item) => item.key === category)) {
      return;
    }

    setActiveCategory(category);
    setLedgerRecordId(null);
    setPaymentForm(emptyPaymentForm());
    resetForm(category);
    playSectionSound("section");
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const payloadFromForm = () => {
    if (activeCategory === "team") {
      const basicSalary = numberValue(form.basicSalary);
      const allocation = numberValue(form.allocation);
      const deduction = numberValue(form.deduction);
      const netSalary = basicSalary + allocation - deduction;

      return {
        category: activeCategory,
        expenseName: form.name || form.designation,
        designation: form.designation,
        name: form.name,
        joiningDate: form.joiningDate || todayInputValue(),
        basicSalary,
        allocation,
        deduction,
        netSalary,
        amount: netSalary,
        paid: netSalary,
        status: "paid",
      };
    }

    if (activeCategory === "dental-material") {
      const qty = numberValue(form.qty);
      const ratePerUnit = numberValue(form.ratePerUnit);
      const totalAmount = qty * ratePerUnit;

      return {
        category: activeCategory,
        expenseName: form.item || "Dental material",
        date: form.date || todayInputValue(),
        shop: form.shop,
        item: form.item,
        qty,
        ratePerUnit,
        totalAmount,
        amount: totalAmount,
        payments: form.payments || [],
      };
    }

    if (activeCategory === "dental-implants") {
      const qty = numberValue(form.qty);
      const ratePerImplant = numberValue(form.ratePerImplant);
      const totalAmount = qty * ratePerImplant;

      return {
        category: activeCategory,
        expenseName: form.items || "Dental implants",
        date: form.date || todayInputValue(),
        vendor: form.vendor,
        items: form.items,
        qty,
        ratePerImplant,
        totalAmount,
        amount: totalAmount,
        payments: form.payments || [],
      };
    }

    const amount = numberValue(form.amount);
    const paid = numberValue(form.paid);

    return {
      category: activeCategory,
      expenseName: form.description,
      dueDate: form.dueDate || todayInputValue(),
      description: form.description,
      amount,
      paid,
      status: paid >= amount && amount > 0 ? "paid" : paid > 0 ? "partial" : "unpaid",
    };
  };

  const handleSubmit = async () => {
    const payload = payloadFromForm();

    if (!payload.expenseName && !payload.name) {
      showMessage("Please enter the required expense details.", "danger");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
        setExpenses((current) =>
          current.map((expense) => (expense._id === editingId ? { ...expense, ...payload } : expense))
        );
        showMessage("Expense updated.");
      } else {
        const response = await api.post("/expenses", payload);
        setExpenses((current) => [response.data.expense, ...current]);
        showMessage("Expense saved.");
      }

      resetForm();
    } catch (requestError) {
      console.error(requestError);
      showMessage(requestError?.response?.data?.detail || "Expense could not be saved.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setActiveCategory(expense.category || "administration");
    setEditingId(expense._id);

    if (expense.category === "team") {
      setForm({
        designation: expense.designation || TEAM_DESIGNATIONS[0],
        name: expense.name || "",
        joiningDate: expense.joiningDate || todayInputValue(),
        basicSalary: String(expense.basicSalary ?? ""),
        allocation: String(expense.allocation ?? ""),
        deduction: String(expense.deduction ?? ""),
      });
      return;
    }

    if (expense.category === "dental-material") {
      setForm({
        date: expense.date || todayInputValue(),
        shop: expense.shop || "",
        item: expense.item || "",
        qty: String(expense.qty ?? ""),
        ratePerUnit: String(expense.ratePerUnit ?? ""),
        payments: expense.payments || [],
      });
      return;
    }

    if (expense.category === "dental-implants") {
      setForm({
        date: expense.date || todayInputValue(),
        vendor: expense.vendor || "",
        items: expense.items || "",
        qty: String(expense.qty ?? ""),
        ratePerImplant: String(expense.ratePerImplant ?? ""),
        payments: expense.payments || [],
      });
      return;
    }

    setForm({
      dueDate: expense.dueDate || expense.date || todayInputValue(),
      description: expense.description || expense.expenseName || "",
      amount: String(expense.amount ?? ""),
      paid: String(expense.paid ?? ""),
    });
  };

  const handleDelete = async (expense) => {
    if (!window.confirm("Delete this expense entry?")) {
      return;
    }

    try {
      await api.delete(`/expenses/${expense._id}`);
      setExpenses((current) => current.filter((entry) => entry._id !== expense._id));
      if (ledgerRecordId === expense._id) {
        setLedgerRecordId(null);
      }
      showMessage("Expense deleted.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Expense could not be deleted.", "danger");
    }
  };

  const updateExpenseRecord = async (record, updates) => {
    const updated = { ...record, ...updates };
    await api.put(`/expenses/${record._id}`, updated);
    setExpenses((current) =>
      current.map((expense) => (expense._id === record._id ? updated : expense))
    );
    return updated;
  };

  const handleAddPayment = async () => {
    if (!ledgerRecord?._id || !numberValue(paymentForm.amount)) {
      showMessage("Select a bill and enter paid amount.", "danger");
      return;
    }

    const payment = {
      id: makeId("payment"),
      date: paymentForm.date || todayInputValue(),
      amount: numberValue(paymentForm.amount),
      method: paymentForm.method,
      note: paymentForm.note,
    };

    try {
      await updateExpenseRecord(ledgerRecord, {
        payments: [...(ledgerRecord.payments || []), payment],
      });
      setPaymentForm(emptyPaymentForm());
      showMessage("Ledger payment saved.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Ledger payment could not be saved.", "danger");
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!ledgerRecord?._id || !window.confirm("Delete this ledger payment?")) {
      return;
    }

    try {
      await updateExpenseRecord(ledgerRecord, {
        payments: (ledgerRecord.payments || []).filter((payment) => payment.id !== paymentId),
      });
      showMessage("Ledger payment deleted.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Ledger payment could not be deleted.", "danger");
    }
  };

  const printLedger = (record) => {
    const printWindow = window.open("", "", "width=900,height=700");

    if (!printWindow) {
      window.alert("Print window could not open. Please allow popups.");
      return;
    }

    const title = record.category === "dental-implants" ? "Dental Implants Ledger" : "Dental Material Ledger";
    const name = record.shop || record.vendor || record.item || record.items || "Ledger";
    const rows = (record.payments || [])
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
          <title>${escapeHtml(title)}</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#111827}
            h1{font-size:20px;margin:0 0 4px}
            h2{font-size:14px;margin:0 0 18px;color:#475569}
            table{width:100%;border-collapse:collapse;margin-top:14px}
            th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:12px}
            th{background:#f1f5f9;text-transform:uppercase;font-size:11px}
            .totals{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
            .totals div{border:1px solid #cbd5e1;padding:10px}
            .totals span{display:block;color:#64748b;font-size:11px;text-transform:uppercase}
            .totals strong{display:block;margin-top:4px;font-size:15px}
          </style>
        </head>
        <body>
          <h1>${escapeHtml(CLINIC_NAME)}</h1>
          <h2>${escapeHtml(title)} - ${escapeHtml(name)}</h2>
          <div class="totals">
            <div><span>Total Bill</span><strong>${escapeHtml(formatCurrency(entryBill(record)))}</strong></div>
            <div><span>Paid</span><strong>${escapeHtml(formatCurrency(entryPaid(record)))}</strong></div>
            <div><span>Remaining</span><strong>${escapeHtml(formatCurrency(entryRemaining(record)))}</strong></div>
          </div>
          <table>
            <thead><tr><th>S No</th><th>Paid Date</th><th>Method</th><th>Note</th><th>Paid</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="5">No payments recorded.</td></tr>`}</tbody>
          </table>
          <script>window.onload=()=>setTimeout(()=>window.print(),250);<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderForm = () => {
    if (activeCategory === "team") {
      const netSalary =
        numberValue(form.basicSalary) + numberValue(form.allocation) - numberValue(form.deduction);

      return (
        <div className="payment-panel expense-form team-expense-form no-print">
          <label className="field">
            <span>Designation</span>
            <select value={form.designation} onChange={(event) => handleChange("designation", event.target.value)}>
              {TEAM_DESIGNATIONS.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Name</span>
            <input value={form.name} onChange={(event) => handleChange("name", event.target.value)} />
          </label>
          <label className="field">
            <span>Joining Date</span>
            <input type="date" value={form.joiningDate} onChange={(event) => handleChange("joiningDate", event.target.value)} />
          </label>
          <label className="field">
            <span>Basic Salary</span>
            <input type="number" min="0" value={form.basicSalary} onChange={(event) => handleChange("basicSalary", event.target.value)} />
          </label>
          <label className="field">
            <span>Allocation</span>
            <input type="number" min="0" value={form.allocation} onChange={(event) => handleChange("allocation", event.target.value)} />
          </label>
          <label className="field">
            <span>Deduction</span>
            <input type="number" min="0" value={form.deduction} onChange={(event) => handleChange("deduction", event.target.value)} />
          </label>
          <div className="calculated-field">
            <span>Net Salary</span>
            <strong>{formatCurrency(netSalary)}</strong>
          </div>
          <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update" : "Save"}
          </button>
          {editingId && <button className="btn" type="button" onClick={() => resetForm()}>Cancel</button>}
        </div>
      );
    }

    if (activeCategory === "dental-material") {
      const totalAmount = numberValue(form.qty) * numberValue(form.ratePerUnit);

      return (
        <div className="payment-panel expense-form stock-expense-form no-print">
          <label className="field">
            <span>Date</span>
            <input type="date" value={form.date} onChange={(event) => handleChange("date", event.target.value)} />
          </label>
          <label className="field">
            <span>Shop</span>
            <input value={form.shop} onChange={(event) => handleChange("shop", event.target.value)} />
          </label>
          <label className="field">
            <span>Item</span>
            <input value={form.item} onChange={(event) => handleChange("item", event.target.value)} />
          </label>
          <label className="field">
            <span>Qty</span>
            <input type="number" min="0" value={form.qty} onChange={(event) => handleChange("qty", event.target.value)} />
          </label>
          <label className="field">
            <span>Rate Per Unit</span>
            <input type="number" min="0" value={form.ratePerUnit} onChange={(event) => handleChange("ratePerUnit", event.target.value)} />
          </label>
          <div className="calculated-field">
            <span>Total Amount</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>
          <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update" : "Save"}
          </button>
          {editingId && <button className="btn" type="button" onClick={() => resetForm()}>Cancel</button>}
        </div>
      );
    }

    if (activeCategory === "dental-implants") {
      const totalAmount = numberValue(form.qty) * numberValue(form.ratePerImplant);

      return (
        <div className="payment-panel expense-form stock-expense-form no-print">
          <label className="field">
            <span>Date</span>
            <input type="date" value={form.date} onChange={(event) => handleChange("date", event.target.value)} />
          </label>
          <label className="field">
            <span>Vendor</span>
            <input value={form.vendor} onChange={(event) => handleChange("vendor", event.target.value)} />
          </label>
          <label className="field">
            <span>Items</span>
            <input value={form.items} onChange={(event) => handleChange("items", event.target.value)} />
          </label>
          <label className="field">
            <span>Qty</span>
            <input type="number" min="0" value={form.qty} onChange={(event) => handleChange("qty", event.target.value)} />
          </label>
          <label className="field">
            <span>Rate Per Implant</span>
            <input type="number" min="0" value={form.ratePerImplant} onChange={(event) => handleChange("ratePerImplant", event.target.value)} />
          </label>
          <div className="calculated-field">
            <span>Total Amount</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>
          <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update" : "Save"}
          </button>
          {editingId && <button className="btn" type="button" onClick={() => resetForm()}>Cancel</button>}
        </div>
      );
    }

    return (
      <div className="payment-panel expense-form admin-expense-form no-print">
        <label className="field">
          <span>Due Date</span>
          <input type="date" value={form.dueDate} onChange={(event) => handleChange("dueDate", event.target.value)} />
        </label>
        <label className="field">
          <span>Description</span>
          <select value={form.description} onChange={(event) => handleChange("description", event.target.value)}>
            {ADMIN_DESCRIPTIONS.map((description) => (
              <option key={description} value={description}>
                {description}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Amount</span>
          <input type="number" min="0" value={form.amount} onChange={(event) => handleChange("amount", event.target.value)} />
        </label>
        <label className="field">
          <span>Paid</span>
          <input type="number" min="0" value={form.paid} onChange={(event) => handleChange("paid", event.target.value)} />
        </label>
        <div className="calculated-field">
          <span>Status</span>
          <strong>{entryStatus({ amount: form.amount, paid: form.paid })}</strong>
        </div>
        <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : editingId ? "Update" : "Save"}
        </button>
        {editingId && <button className="btn" type="button" onClick={() => resetForm()}>Cancel</button>}
      </div>
    );
  };

  const renderRows = () => {
    if (activeCategory === "team") {
      return visibleExpenses.map((expense) => (
        <tr key={expense._id}>
          <td>{expense.designation || "-"}</td>
          <td>{expense.name || "-"}</td>
          <td>{formatDateDisplay(expense.joiningDate) || "-"}</td>
          <td>{formatCurrency(expense.basicSalary)}</td>
          <td>{formatCurrency(expense.allocation)}</td>
          <td>{formatCurrency(expense.deduction)}</td>
          <td>{formatCurrency(expense.netSalary)}</td>
          <td className="row-actions no-print">
            <button className="btn btn-sm" type="button" onClick={() => handleEdit(expense)}>Edit</button>
            <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(expense)}>Delete</button>
          </td>
        </tr>
      ));
    }

    if (activeCategory === "dental-material") {
      return visibleExpenses.map((expense) => (
        <tr key={expense._id}>
          <td>{formatDateDisplay(expense.date) || "-"}</td>
          <td>{expense.shop || "-"}</td>
          <td>{expense.item || "-"}</td>
          <td>{expense.qty || "-"}</td>
          <td>{formatCurrency(expense.ratePerUnit)}</td>
          <td>{formatCurrency(entryBill(expense))}</td>
          <td>{formatCurrency(entryPaid(expense))}</td>
          <td>{formatCurrency(entryRemaining(expense))}</td>
          <td className="row-actions no-print">
            <button className="btn btn-sm" type="button" onClick={() => setLedgerRecordId(expense._id)}>Ledger</button>
            <button className="btn btn-sm" type="button" onClick={() => handleEdit(expense)}>Edit</button>
            <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(expense)}>Delete</button>
          </td>
        </tr>
      ));
    }

    if (activeCategory === "dental-implants") {
      return visibleExpenses.map((expense) => (
        <tr key={expense._id}>
          <td>{formatDateDisplay(expense.date) || "-"}</td>
          <td>{expense.vendor || "-"}</td>
          <td>{expense.items || "-"}</td>
          <td>{expense.qty || "-"}</td>
          <td>{formatCurrency(expense.ratePerImplant)}</td>
          <td>{formatCurrency(entryBill(expense))}</td>
          <td>{formatCurrency(entryPaid(expense))}</td>
          <td>{formatCurrency(entryRemaining(expense))}</td>
          <td className="row-actions no-print">
            <button className="btn btn-sm" type="button" onClick={() => setLedgerRecordId(expense._id)}>Ledger</button>
            <button className="btn btn-sm" type="button" onClick={() => handleEdit(expense)}>Edit</button>
            <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(expense)}>Delete</button>
          </td>
        </tr>
      ));
    }

    return visibleExpenses.map((expense) => (
      <tr key={expense._id}>
        <td>{formatDateDisplay(expense.dueDate || expense.date) || "-"}</td>
        <td>{expense.description || expense.expenseName || "-"}</td>
        <td>{formatCurrency(expense.amount)}</td>
        <td>{formatCurrency(entryPaid(expense))}</td>
        <td>
          <span className={entryStatus(expense) === "Paid" ? "pill success" : entryStatus(expense) === "Partial" ? "pill warning" : "pill danger"}>
            {entryStatus(expense)}
          </span>
        </td>
        <td className="row-actions no-print">
          <button className="btn btn-sm" type="button" onClick={() => handleEdit(expense)}>Edit</button>
          <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(expense)}>Delete</button>
        </td>
      </tr>
    ));
  };

  const tableHeaders = () => {
    if (activeCategory === "team") {
      return ["Designation", "Name", "Joining Date", "Basic Salary", "Allocation", "Deduction", "Net Salary"];
    }

    if (activeCategory === "dental-material") {
      return ["Date", "Shop", "Item", "Qty", "Rate Per Unit", "Total Amount", "Paid", "Remaining"];
    }

    if (activeCategory === "dental-implants") {
      return ["Date", "Vendor", "Items", "Qty", "Rate Per Implant", "Total Amount", "Paid", "Remaining"];
    }

    return ["Due Date", "Description", "Amount", "Paid", "Status"];
  };

  const canShowLedger =
    activeCategory === "dental-material" || activeCategory === "dental-implants";

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page printable-page">
        <section className="print-report-header">
          <strong>{CLINIC_NAME}</strong>
          <span>{DOCTOR_NAME}</span>
          <span>{categoryLabel(activeCategory)} Expense Report</span>
        </section>

        <section className="page-hero">
          <div>
            <div className="eyebrow">Expense control</div>
            <h1>{categoryLabel(activeCategory)}</h1>
            <p>{categoryOptions.length === 1 ? "Dental material entries with printable payment ledgers." : "Administration, team, material and implant expenses with printable ledgers."}</p>
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
        {message && <div className={`notice ${message.type === "danger" ? "danger" : ""}`}>{message.text}</div>}

        <section className="toolbar-panel no-print">
          <div className="segmented-control" aria-label="Expense category">
            {categoryOptions.map((category) => (
              <button
                key={category.key}
                type="button"
                className={activeCategory === category.key ? "active" : ""}
                onClick={() => switchCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="search-field">
            <span>Search</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search expenses" />
          </div>
        </section>

        <section className="metrics-grid printable-report">
          <div className="metric-card">
            <div className="metric-accent blue" />
            <div className="metric-label">Entries</div>
            <div className="metric-value">{loading ? "..." : totals.count}</div>
            <div className="metric-detail">{categoryLabel(activeCategory)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent rose" />
            <div className="metric-label">Total Bill</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.bill)}</div>
            <div className="metric-detail">Visible entries</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent green" />
            <div className="metric-label">Paid</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.paid)}</div>
            <div className="metric-detail">Payments recorded</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent gold" />
            <div className="metric-label">Remaining</div>
            <div className="metric-value">{loading ? "..." : formatCurrency(totals.remaining)}</div>
            <div className="metric-detail">Still pending</div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{editingId ? "Update Entry" : `Add ${categoryLabel(activeCategory)}`}</h2>
              <p>Save once and the table updates immediately.</p>
            </div>
          </div>
          {renderForm()}
        </section>

        {canShowLedger && ledgerRecord && (
          <section className="panel no-print">
            <div className="panel-heading">
              <div>
                <h2>Payment Details Ledger</h2>
                <p>{ledgerRecord.shop || ledgerRecord.vendor || ledgerRecord.item || ledgerRecord.items}</p>
              </div>
              <div className="row-actions">
                <button className="btn btn-dark" type="button" onClick={() => printLedger(ledgerRecord)}>
                  Print ledger
                </button>
                <button className="btn" type="button" onClick={() => setLedgerRecordId(null)}>
                  Close
                </button>
              </div>
            </div>

            <div className="ledger-total-grid">
              <div>
                <span>Total Bill</span>
                <strong>{formatCurrency(entryBill(ledgerRecord))}</strong>
              </div>
              <div>
                <span>Paid</span>
                <strong>{formatCurrency(entryPaid(ledgerRecord))}</strong>
              </div>
              <div>
                <span>Remaining</span>
                <strong>{formatCurrency(entryRemaining(ledgerRecord))}</strong>
              </div>
            </div>

            <div className="payment-panel ledger-payment-form">
              <label className="field">
                <span>Paid Date</span>
                <input type="date" value={paymentForm.date} onChange={(event) => setPaymentForm((form) => ({ ...form, date: event.target.value }))} />
              </label>
              <label className="field">
                <span>Paid Amount</span>
                <input type="number" min="0" value={paymentForm.amount} onChange={(event) => setPaymentForm((form) => ({ ...form, amount: event.target.value }))} placeholder="Enter amount" />
              </label>
              <label className="field">
                <span>Method</span>
                <input value={paymentForm.method} onChange={(event) => setPaymentForm((form) => ({ ...form, method: event.target.value }))} placeholder="Cash, card, bank transfer..." />
              </label>
              <label className="field">
                <span>Note</span>
                <input value={paymentForm.note} onChange={(event) => setPaymentForm((form) => ({ ...form, note: event.target.value }))} placeholder="Payment note" />
              </label>
              <button className="btn btn-primary" type="button" onClick={handleAddPayment}>
                Save payment
              </button>
            </div>

            <div className="data-table-wrap">
              <table className="data-table compact-table">
                <thead>
                  <tr>
                    <th>Paid Date</th>
                    <th>Method</th>
                    <th>Note</th>
                    <th>Paid</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(ledgerRecord.payments || []).length === 0 && (
                    <tr>
                      <td colSpan="5">No ledger payments recorded.</td>
                    </tr>
                  )}

                  {(ledgerRecord.payments || []).map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDateDisplay(payment.date) || "-"}</td>
                      <td>{payment.method || "-"}</td>
                      <td>{payment.note || "-"}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDeletePayment(payment.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="panel printable-report">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {tableHeaders().map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={tableHeaders().length + 1}>Loading expenses...</td>
                  </tr>
                )}

                {!loading && visibleExpenses.length === 0 && (
                  <tr>
                    <td colSpan={tableHeaders().length + 1}>No expenses found.</td>
                  </tr>
                )}

                {renderRows()}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Expenses;
