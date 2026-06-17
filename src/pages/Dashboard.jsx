import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  balanceDue,
  formatCurrency,
  invoiceTotal,
  mobileNumber,
  netAmount,
  patientRecordDate,
  patientArray,
  patientName,
  regNo,
  upcomingVisits,
} from "../utils/patientHelpers";

function StatCard({ label, value, detail, accent }) {
  return (
    <div className="metric-card">
      <div className={`metric-accent ${accent}`} />
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </div>
  );
}

function Dashboard({ activePage, setActivePage, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const today = new Date().toISOString().split("T")[0];
  const dateLabel = now.toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/patients", {
          params: { limit: 100, sort: "createdAt", order: -1 },
        });

        setPatients(patientArray(response.data));
      } catch (requestError) {
        console.error(requestError);
        setError("Dashboard data could not be loaded. Please check the API connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const metrics = useMemo(() => {
    const todayPatients = patients.filter((patient) => {
      const date = patient?.createdAt || patient?.biography?.date || "";
      return String(date).startsWith(today);
    }).length;

    const totalRevenue = patients.reduce((sum, patient) => sum + invoiceTotal(patient), 0);
    const pendingBalance = patients.reduce((sum, patient) => sum + balanceDue(patient), 0);
    const plannedVisits = patients.reduce(
      (sum, patient) => sum + upcomingVisits(patient).length,
      0
    );

    return {
      totalPatients: patients.length,
      todayPatients,
      totalRevenue,
      pendingBalance,
      plannedVisits,
    };
  }, [patients, today]);

  const revenueYears = useMemo(() => {
    const years = patients
      .map((patient) => new Date(patientRecordDate(patient)).getFullYear())
      .filter((year) => !Number.isNaN(year));

    return Array.from(new Set([now.getFullYear(), ...years])).sort((a, b) => b - a);
  }, [patients, now]);

  const periodPatients = useMemo(() => {
    return patients.filter((patient) => {
      const date = new Date(patientRecordDate(patient));

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      const yearMatches = String(date.getFullYear()) === String(selectedYear);
      const monthMatches =
        selectedMonth === "all" || String(date.getMonth() + 1) === String(selectedMonth);

      return yearMatches && monthMatches;
    });
  }, [patients, selectedMonth, selectedYear]);

  const periodMetrics = useMemo(() => {
    const matchesSelectedPeriod = (value) => {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      const yearMatches = String(date.getFullYear()) === String(selectedYear);
      const monthMatches =
        selectedMonth === "all" || String(date.getMonth() + 1) === String(selectedMonth);

      return yearMatches && monthMatches;
    };

    const periodRevenue = periodPatients.reduce((sum, patient) => sum + netAmount(patient), 0);
    const periodPaid = patients.reduce(
      (sum, patient) =>
        sum +
        (patient.accountLedger || [])
          .filter((entry) => matchesSelectedPeriod(entry.date || entry.timestamp))
          .reduce((ledgerSum, entry) => ledgerSum + Number(entry.amount || 0), 0),
      0
    );
    const periodDue = periodPatients.reduce((sum, patient) => sum + balanceDue(patient), 0);

    return {
      patients: periodPatients.length,
      periodRevenue,
      periodPaid,
      periodDue,
    };
  }, [patients, periodPatients, selectedMonth, selectedYear]);

  const todayAppointments = useMemo(() => {
    return patients
      .flatMap((patient) =>
        upcomingVisits(patient)
          .filter((visit) => visit.date === today)
          .map((visit) => ({
            patient,
            visit,
          }))
      )
      .slice(0, 6);
  }, [patients, today]);

  const recentPatients = patients.slice(0, 6);

  const dueAccounts = patients
    .filter((patient) => balanceDue(patient) > 0)
    .sort((a, b) => balanceDue(b) - balanceDue(a))
    .slice(0, 4);

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      handleLogout={handleLogout}
    >
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Clinic overview</div>
            <h1>Executive Dashboard</h1>
            <p>{dateLabel}. Patient flow, treatment plans and account health at a glance.</p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" onClick={() => setActivePage("patients")}>
              <span className="btn-icon">+</span>
              New patient
            </button>
            <button className="btn" onClick={() => setActivePage("appointments")}>
              Appointments
            </button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="toolbar-panel revenue-filter">
          <div>
            <span className="toolbar-label">Revenue view</span>
            <strong>
              {selectedMonth === "all"
                ? selectedYear
                : new Date(Number(selectedYear), Number(selectedMonth) - 1, 1).toLocaleDateString("en-PK", {
                    month: "long",
                    year: "numeric",
                  })}
            </strong>
          </div>

          <div className="filter-controls">
            <label className="field inline-field">
              <span>Month</span>
              <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                <option value="all">Full year</option>
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={String(index + 1)}>
                    {new Date(2026, index, 1).toLocaleDateString("en-PK", { month: "long" })}
                  </option>
                ))}
              </select>
            </label>

            <label className="field inline-field">
              <span>Year</span>
              <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                {revenueYears.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="metrics-grid">
          <StatCard
            label="Period revenue"
            value={loading ? "..." : formatCurrency(periodMetrics.periodRevenue)}
            detail={`${periodMetrics.patients} patient records in selected period`}
            accent="gold"
          />
          <StatCard
            label="Paid in period"
            value={loading ? "..." : formatCurrency(periodMetrics.periodPaid)}
            detail="Based on account ledger payments"
            accent="green"
          />
          <StatCard
            label="Remaining"
            value={loading ? "..." : formatCurrency(periodMetrics.periodDue)}
            detail="Pending after paid amounts"
            accent="rose"
          />
          <StatCard
            label="Patients"
            value={loading ? "..." : periodMetrics.patients}
            detail="Filtered by patient record date"
            accent="blue"
          />
        </section>

        <section className="metrics-grid">
          <StatCard
            label="Total patients"
            value={loading ? "..." : metrics.totalPatients}
            detail="Complete patient records"
            accent="blue"
          />
          <StatCard
            label="Today"
            value={loading ? "..." : metrics.todayPatients}
            detail="New records opened today"
            accent="green"
          />
          <StatCard
            label="Revenue"
            value={loading ? "..." : formatCurrency(metrics.totalRevenue)}
            detail="Invoice value in records"
            accent="gold"
          />
          <StatCard
            label="Balance due"
            value={loading ? "..." : formatCurrency(metrics.pendingBalance)}
            detail={`${metrics.plannedVisits} planned visits tracked`}
            accent="rose"
          />
        </section>

        <section className="dashboard-grid">
          <div className="panel xl">
            <div className="panel-heading">
              <div>
                <h2>Today's Appointments</h2>
                <p>{todayAppointments.length} planned visits found for today.</p>
              </div>
              <button className="btn btn-sm" onClick={() => setActivePage("appointments")}>
                View all
              </button>
            </div>

            <div className="appointment-list">
              {loading && <div className="empty-state">Loading appointments...</div>}

              {!loading && todayAppointments.length === 0 && (
                <div className="empty-state">
                  No appointments today. Use planned sequence dates to fill this schedule.
                </div>
              )}

              {todayAppointments.map(({ patient, visit }, index) => (
                <div className="appointment-item" key={`${regNo(patient)}-${index}`}>
                  <div className="appointment-time">{visit.time || "Today"}</div>
                  <div className="appointment-main">
                    <strong>{patientName(patient)}</strong>
                    <span>{visit.procedure || visit.treatment || "Treatment visit"}</span>
                  </div>
                  <div className="appointment-meta">
                    <span>{mobileNumber(patient)}</span>
                    <span>Visit {visit.visitNo || index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Quick Actions</h2>
                <p>Fast paths for reception and chairside work.</p>
              </div>
            </div>

            <div className="quick-grid">
              <button onClick={() => setActivePage("patients")} className="quick-action">
                <span>+</span>
                New record
              </button>
              <button onClick={() => setActivePage("patients-list")} className="quick-action">
                <span>R</span>
                Records
              </button>
              <button onClick={() => setActivePage("account-status")} className="quick-action">
                <span>$</span>
                Accounts
              </button>
              <button onClick={() => window.print()} className="quick-action">
                <span>P</span>
                Print view
              </button>
            </div>
          </div>

          <div className="panel xl">
            <div className="panel-heading">
              <div>
                <h2>Recent Patients</h2>
                <p>Newest records saved in the clinic database.</p>
              </div>
              <button className="btn btn-sm" onClick={() => setActivePage("patients-list")}>
                Open records
              </button>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Reg No</th>
                    <th>Mobile</th>
                    <th>Total</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="5">Loading recent patients...</td>
                    </tr>
                  )}

                  {!loading && recentPatients.length === 0 && (
                    <tr>
                      <td colSpan="5">No patients saved yet.</td>
                    </tr>
                  )}

                  {recentPatients.map((patient) => (
                    <tr key={patient._id || regNo(patient)}>
                      <td>
                        <strong>{patientName(patient)}</strong>
                      </td>
                      <td>
                        <span className="pill">{regNo(patient) || "-"}</span>
                      </td>
                      <td>{mobileNumber(patient)}</td>
                      <td>{formatCurrency(invoiceTotal(patient))}</td>
                      <td>
                        <span className={balanceDue(patient) > 0 ? "pill warning" : "pill success"}>
                          {formatCurrency(balanceDue(patient))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Account Alerts</h2>
                <p>Highest pending balances.</p>
              </div>
            </div>

            <div className="alert-list">
              {loading && <div className="empty-state compact">Loading alerts...</div>}

              {!loading && dueAccounts.length === 0 && (
                <div className="empty-state compact">No pending balances found.</div>
              )}

              {dueAccounts.map((patient) => (
                <button
                  key={patient._id || regNo(patient)}
                  className="alert-row"
                  onClick={() => setActivePage("account-status")}
                >
                  <span>
                    <strong>{patientName(patient)}</strong>
                    <small>{regNo(patient) || mobileNumber(patient)}</small>
                  </span>
                  <b>{formatCurrency(balanceDue(patient))}</b>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;
