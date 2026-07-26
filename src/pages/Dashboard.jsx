import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  appointmentArray,
  appointmentRequestParams,
  appointmentTimeline,
  filterManualAppointmentsForUser,
  patientAppointmentSummary,
} from "../utils/appointmentHelpers";
import { openPatientFile } from "../utils/clientNavigation";
import {
  balanceDue,
  activeShift,
  activeShiftId,
  filterPatientsForActiveShift,
  formatCurrency,
  invoiceTotal,
  matchesPeriod,
  mobileNumber,
  netAmount,
  patientRecordDate,
  patientArray,
  patientName,
  parseLocalDate,
  regNo,
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
  const shift = activeShift();
  const [patients, setPatients] = useState([]);
  const [manualAppointments, setManualAppointments] = useState([]);
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

  const fetchDashboard = async () => {
    setLoading(true);

    try {
      const [patientsResponse, appointmentsResponse] = await Promise.all([
        api.get("/patients", {
          params: { limit: 100, sort: "createdAt", order: -1, shift: activeShiftId() },
        }),
        api.get("/appointments", {
          params: appointmentRequestParams(),
        }),
      ]);

      setPatients(filterPatientsForActiveShift(patientArray(patientsResponse.data)));
      setManualAppointments(filterManualAppointmentsForUser(appointmentArray(appointmentsResponse.data)));
    } catch (requestError) {
      console.error(requestError);
      setPatients([]);
      setManualAppointments([]);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const allAppointments = useMemo(
    () => appointmentTimeline(patients, manualAppointments),
    [patients, manualAppointments]
  );

  const metrics = useMemo(() => {
    const todayPatients = patients.filter((patient) => {
      const date = patient?.createdAt || patient?.biography?.date || "";
      return String(date).startsWith(today);
    }).length;

    const totalRevenue = patients.reduce((sum, patient) => sum + invoiceTotal(patient), 0);
    const pendingBalance = patients.reduce((sum, patient) => sum + balanceDue(patient), 0);
    const plannedVisits = allAppointments.filter(
      (appointment) => !["Done", "Cancelled", "Missed"].includes(appointment.status)
    ).length;

    return {
      totalPatients: patients.length,
      todayPatients,
      totalRevenue,
      pendingBalance,
      plannedVisits,
    };
  }, [patients, today, allAppointments]);

  const revenueYears = useMemo(() => {
    const years = patients
      .flatMap((patient) => [
        patientRecordDate(patient),
        ...(patient.accountLedger || []).map((entry) => entry.date || entry.timestamp),
      ])
      .map((value) => parseLocalDate(value)?.getFullYear())
      .filter(Boolean);

    return Array.from(new Set([now.getFullYear(), ...years])).sort((a, b) => b - a);
  }, [patients, now]);

  const periodPatients = useMemo(() => {
    return patients.filter((patient) =>
      matchesPeriod(patientRecordDate(patient), selectedMonth, selectedYear)
    );
  }, [patients, selectedMonth, selectedYear]);

  const selectedPeriodPatients = useMemo(() => {
    return [...periodPatients].sort((a, b) => patientName(a).localeCompare(patientName(b)));
  }, [periodPatients]);

  const selectedPeriodLabel =
    selectedMonth === "all"
      ? selectedYear
      : new Date(Number(selectedYear), Number(selectedMonth) - 1, 1).toLocaleDateString("en-PK", {
          month: "long",
          year: "numeric",
        });

  const periodMetrics = useMemo(() => {
    const periodRevenue = periodPatients.reduce((sum, patient) => sum + netAmount(patient), 0);
    const periodPaid = patients.reduce(
      (sum, patient) =>
        sum +
        (patient.accountLedger || [])
          .filter((entry) => matchesPeriod(entry.date || entry.timestamp, selectedMonth, selectedYear))
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

  const dashboardSummary = useMemo(() => {
    const summaries = patients.map((patient) => patientAppointmentSummary(patient, manualAppointments));

    return {
      totalEntries: patients.length,
      expected: summaries.filter((summary) => summary.isExpected).length,
      completedCases: summaries.filter((summary) => summary.isCompletedCase).length,
      followUp: summaries.filter((summary) => summary.isFollowUp).length,
    };
  }, [patients, manualAppointments]);

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
            <h1>{shift?.label || "Executive Dashboard"}</h1>
            <p>
              {dateLabel}. Client flow, treatment plans and account health at a glance.
            </p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" onClick={() => setActivePage("patients")}>
              <span className="btn-icon">+</span>
              New checkup
            </button>
            <button className="btn" onClick={() => setActivePage("appointments")}>
              Appointments
            </button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="role-action-grid dashboard-action-grid">
          <button className="role-action-card blue" type="button" onClick={() => setActivePage("entry-sheet")}>
            <span>ES</span>
            <strong>Entry Sheet</strong>
            <small>Name, time, purpose, contact, entry and exit time.</small>
          </button>
          <button className="role-action-card gold" type="button" onClick={() => setActivePage("appointments")}>
            <span>A</span>
            <strong>Appointments</strong>
            <small>Search and update appointments.</small>
          </button>
          <button className="role-action-card green" type="button" onClick={() => setActivePage("patients")}>
            <span>+</span>
            <strong>New Checkup</strong>
            <small>Open a fresh comprehensive checkup file.</small>
          </button>
          <button className="role-action-card cyan" type="button" onClick={() => setActivePage("patients-list")}>
            <span>R</span>
            <strong>Registered Clients</strong>
            <small>{selectedPeriodLabel}</small>
          </button>
        </section>

        <section className="metrics-grid">
          <StatCard
            label="Total Entries"
            value={loading ? "..." : dashboardSummary.totalEntries}
            detail="All registered client files"
            accent="blue"
          />
          <StatCard
            label="Expected"
            value={loading ? "..." : dashboardSummary.expected}
            detail="Checkup clients waiting for planned dates"
            accent="gold"
          />
          <StatCard
            label="Completed Cases"
            value={loading ? "..." : dashboardSummary.completedCases}
            detail="Last planned appointment is done"
            accent="green"
          />
          <StatCard
            label="Follow Up"
            value={loading ? "..." : dashboardSummary.followUp}
            detail="Completed cases with phase labels"
            accent="rose"
          />
        </section>

        <section className="toolbar-panel revenue-filter">
          <div>
            <span className="toolbar-label">Revenue view</span>
            <strong>{selectedPeriodLabel}</strong>
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
            label="Clients"
            value={loading ? "..." : periodMetrics.patients}
            detail="Filtered by client record date"
            accent="blue"
          />
        </section>

        <section className="metrics-grid">
          <StatCard
            label="Total clients"
            value={loading ? "..." : metrics.totalPatients}
            detail="Complete client records"
            accent="blue"
          />
          <StatCard
            label="Today's Entries"
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
                <h2>Selected Period Clients A-Z</h2>
                <p>{periodMetrics.patients} records match the current dashboard filter.</p>
              </div>
              <button className="btn btn-sm" onClick={() => setActivePage("patients-list")}>
                Open records
              </button>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Reg No</th>
                    <th>Mobile</th>
                    <th>Total</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="5">Loading recent clients...</td>
                    </tr>
                  )}

                  {!loading && selectedPeriodPatients.length === 0 && (
                    <tr>
                      <td colSpan="5">No clients found for the selected period.</td>
                    </tr>
                  )}

                  {selectedPeriodPatients.map((patient) => (
                    <tr key={patient._id || regNo(patient)}>
                      <td>
                        <button className="patient-link" type="button" onClick={() => openPatientFile(patient, setActivePage)}>
                          {patientName(patient)}
                        </button>
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
                  onClick={() => openPatientFile(patient, setActivePage)}
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
