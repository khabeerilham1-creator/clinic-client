import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  balanceDue,
  expenseArray,
  formatCurrency,
  inventoryArray,
  patientArray,
  patientName,
  regNo,
  upcomingVisits,
} from "../utils/patientHelpers";

const toDateKey = (value) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const expenseTotal = (expense) =>
  Number(expense.totalAmount || expense.netSalary || expense.amount || expense.basicSalary || 0);

const expensePaid = (expense) =>
  Number(expense.paid || 0) +
  (expense.payments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

function Notifications({ activePage, setActivePage, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [patientsResponse, expensesResponse, inventoryResponse] = await Promise.all([
          api.get("/patients", { params: { limit: 500, sort: "createdAt", order: -1 } }),
          api.get("/expenses", { params: { limit: 800, sort: "date", order: -1 } }),
          api.get("/inventory", { params: { limit: 500 } }),
        ]);

        setPatients(patientArray(patientsResponse.data));
        setExpenses(expenseArray(expensesResponse.data));
        setInventory(inventoryArray(inventoryResponse.data));
      } catch (requestError) {
        console.error(requestError);
        setError("Alerts could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const alerts = useMemo(() => {
    const appointmentAlerts = patients.flatMap((patient) =>
      upcomingVisits(patient)
        .filter((visit) => toDateKey(visit.date) === today)
        .map((visit) => ({
          type: "Appointment",
          title: patientName(patient),
          detail: visit.procedure || visit.treatment || "Visit today",
          tone: "blue",
        }))
    );

    const balanceAlerts = patients
      .filter((patient) => balanceDue(patient) > 0)
      .sort((a, b) => balanceDue(b) - balanceDue(a))
      .slice(0, 8)
      .map((patient) => ({
        type: "Balance",
        title: patientName(patient),
        detail: `${regNo(patient) || "No reg"} | ${formatCurrency(balanceDue(patient))}`,
        tone: "rose",
      }));

    const stockAlerts = inventory
      .filter((item) => Number(item.qty || 0) <= Number(item.minQty || 0))
      .slice(0, 8)
      .map((item) => ({
        type: "Inventory",
        title: item.productName || item.item || "Inventory item",
        detail: `Qty ${Number(item.qty || 0)} | Minimum ${Number(item.minQty || 0)}`,
        tone: "gold",
      }));

    const payableAlerts = expenses
      .map((expense) => {
        const remaining = Math.max(expenseTotal(expense) - expensePaid(expense), 0);

        return {
          expense,
          remaining,
        };
      })
      .filter((row) => row.remaining > 0)
      .slice(0, 8)
      .map(({ expense, remaining }) => ({
        type: "Payable",
        title: expense.description || expense.name || expense.item || expense.shop || "Expense",
        detail: formatCurrency(remaining),
        tone: "green",
      }));

    return [...appointmentAlerts, ...balanceAlerts, ...stockAlerts, ...payableAlerts];
  }, [patients, expenses, inventory, today]);

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero admin-hero">
          <div>
            <div className="eyebrow">Admin</div>
            <h1>Notifications Alerts</h1>
            <p>{alerts.length} live alerts.</p>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="panel gold-bordered">
          <div className="alert-list">
            {loading && <div className="empty-state compact">Loading alerts...</div>}
            {!loading && alerts.length === 0 && <div className="empty-state compact">No alerts found.</div>}
            {alerts.map((alert, index) => (
              <div className={`alert-row alert-${alert.tone}`} key={`${alert.type}-${alert.title}-${index}`}>
                <span>
                  <strong>{alert.title}</strong>
                  <small>{alert.detail}</small>
                </span>
                <b>{alert.type}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Notifications;
