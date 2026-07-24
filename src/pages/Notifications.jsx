import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  appointmentArray,
  appointmentRequestParams,
  filterManualAppointmentsForUser,
  manualAppointmentCard,
} from "../utils/appointmentHelpers";
import {
  activeShiftId,
  balanceDue,
  expenseArray,
  filterPatientsForActiveShift,
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

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const expenseTotal = (expense) =>
  Number(expense.totalAmount || expense.netSalary || expense.amount || expense.basicSalary || 0);

const expensePaid = (expense) =>
  Number(expense.paid || 0) +
  (expense.payments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

const messageArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.messages)) {
    return payload.messages;
  }

  return [];
};

function Notifications({ activePage, setActivePage, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const today = toDateKey(new Date());
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const role = sessionStorage.getItem("role") || user.role || "admin";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [patientsResponse, expensesResponse, inventoryResponse, appointmentsResponse, messagesResponse] =
          await Promise.all([
            api.get("/patients", { params: { limit: 1000, sort: "createdAt", order: -1, shift: activeShiftId() } }),
            api.get("/expenses", { params: { limit: 800, sort: "date", order: -1 } }),
            api.get("/inventory", { params: { limit: 1000 } }),
            api.get("/appointments", { params: appointmentRequestParams() }),
            api.get("/messages", { params: { role, unreadOnly: true, limit: 100 } }),
          ]);

        setPatients(filterPatientsForActiveShift(patientArray(patientsResponse.data)));
        setExpenses(expenseArray(expensesResponse.data));
        setInventory(inventoryArray(inventoryResponse.data));
        setAppointments(filterManualAppointmentsForUser(appointmentArray(appointmentsResponse.data)));
        setMessages(messageArray(messagesResponse.data));
      } catch (requestError) {
        console.error(requestError);
        setError("Alerts could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role]);

  const alerts = useMemo(() => {
    const plannedAppointmentAlerts = patients.flatMap((patient) =>
      upcomingVisits(patient)
        .filter((visit) => toDateKey(visit.date) === today)
        .map((visit) => ({
          type: "Appointment",
          title: patientName(patient),
          detail: visit.procedure || visit.treatment || "Visit today",
          tone: "blue",
        }))
    );

    const manualAppointmentAlerts = appointments
      .map(manualAppointmentCard)
      .filter((appointment) => appointment.dateKey === today && appointment.status !== "Done")
      .map((appointment) => ({
        type: "Manual Appointment",
        title: appointment.clientName,
        detail: `${appointment.time || ""} ${appointment.purpose || ""}`.trim(),
        tone: "blue",
      }));

    const messageAlerts = messages
      .filter((message) => message.toRole === role && !message.read)
      .map((message) => ({
        type: "Message",
        title: message.fromName || message.fromRole || "Staff",
        detail: message.body,
        tone: "green",
      }));

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

        return { expense, remaining };
      })
      .filter((row) => row.remaining > 0)
      .slice(0, 8)
      .map(({ expense, remaining }) => ({
        type: "Payable",
        title: expense.description || expense.name || expense.item || expense.shop || "Expense",
        detail: formatCurrency(remaining),
        tone: "green",
      }));

    return [
      ...messageAlerts,
      ...plannedAppointmentAlerts,
      ...manualAppointmentAlerts,
      ...balanceAlerts,
      ...stockAlerts,
      ...payableAlerts,
    ];
  }, [patients, expenses, inventory, appointments, messages, today, role]);

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero admin-hero">
          <div>
            <div className="eyebrow">Alerts</div>
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
