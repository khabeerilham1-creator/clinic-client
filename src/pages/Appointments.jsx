import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import AppointmentDashboardModules from "../components/appointments/AppointmentDashboardModules";
import Layout from "../components/Layout";
import {
  appointmentArray,
  appointmentTimeline,
  appointmentRequestParams,
  currentWeekRange,
  filterManualAppointmentsForUser,
  manualAppointmentCard,
  patientAppointmentSummary,
} from "../utils/appointmentHelpers";
import {
  activeShift,
  activeShiftId,
  dateKey,
  filterPatientsForActiveShift,
  formatDateDisplay,
  initials,
  mobileNumber,
  patientArray,
  patientName,
  regNo,
} from "../utils/patientHelpers";

function AppointmentCard({ appointment, tone }) {
  return (
    <div className={`schedule-card ${tone}`}>
      <div className="schedule-date">
        <strong>{appointment.dateLabel}</strong>
        <span>{appointment.time || `Visit ${appointment.visitNo || "-"}`}</span>
      </div>

      <div className="patient-cell">
        <span className="patient-avatar">{initials(appointment.clientName || appointment.patientName)}</span>
        <div>
          <strong>{appointment.clientName || appointment.patientName}</strong>
          <small>{appointment.purpose || appointment.procedure || "Treatment visit"}</small>
        </div>
      </div>

      <div className="schedule-meta">
        <span>{appointment.mobileNumber}</span>
        <span>{appointment.source === "manual" ? "Manual" : `Reg ${appointment.registrationNo || "-"}`}</span>
      </div>
    </div>
  );
}

function Appointments({ activePage, setActivePage, handleLogout }) {
  const shift = activeShift();
  const [patients, setPatients] = useState([]);
  const [manualAppointments, setManualAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsResponse, appointmentsResponse] = await Promise.all([
        api.get("/patients", {
          params: { limit: 500, sort: "createdAt", order: -1, shift: activeShiftId() },
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
      setError("Appointments could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const todayKey = dateKey(new Date());
  const week = useMemo(() => currentWeekRange(), []);
  const allAppointments = useMemo(
    () => appointmentTimeline(patients, manualAppointments),
    [patients, manualAppointments]
  );

  const grouped = useMemo(() => {
    const activeAppointments = allAppointments.filter(
      (appointment) => !["Done", "Cancelled", "Missed"].includes(appointment.status)
    );
    const today = activeAppointments.filter((appointment) => appointment.dateKey === todayKey);
    const weekly = activeAppointments.filter(
      (appointment) => appointment.dateKey >= week.startKey && appointment.dateKey <= week.endKey
    );
    const upcoming = activeAppointments.filter((appointment) => appointment.dateKey > week.endKey);
    const done = allAppointments.filter((appointment) => appointment.status === "Done");
    const manual = filterManualAppointmentsForUser(manualAppointments).map(manualAppointmentCard);
    const toBeAppointed = patients
      .map((patient) => ({
        patient,
        summary: patientAppointmentSummary(patient, manualAppointments),
      }))
      .filter(({ summary }) => summary.category === "to-be-appointed");

    return { today, weekly, upcoming, done, manual, toBeAppointed };
  }, [allAppointments, todayKey, week.startKey, week.endKey, patients, manualAppointments]);

  const handleManualCreated = () => {
    setActionMessage("Manual appointment saved.");
    fetchAppointments();
  };

  const updateManualStatus = async (appointment, status) => {
    if (!appointment.raw?._id) {
      return;
    }

    setActionMessage("");

    try {
      await api.put(`/appointments/${appointment.raw._id}`, {
        ...appointment.raw,
        status,
      });
      setActionMessage("Appointment status updated.");
      fetchAppointments();
    } catch (requestError) {
      console.error(requestError);
      setError("Appointment status could not be updated.");
    }
  };

  const deleteManualAppointment = async (appointment) => {
    if (!appointment.raw?._id || !window.confirm("Delete this manual appointment?")) {
      return;
    }

    setActionMessage("");

    try {
      await api.delete(`/appointments/${appointment.raw._id}`);
      setActionMessage("Appointment deleted.");
      fetchAppointments();
    } catch (requestError) {
      console.error(requestError);
      setError("Appointment could not be deleted.");
    }
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      handleLogout={handleLogout}
    >
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Manual appointment system</div>
            <h1>{shift?.label ? `${shift.label} Appointments` : "Appointments"}</h1>
            <p>
              Today, weekly and manual appointments in one schedule.
            </p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" onClick={() => setActivePage("patients")}>
              <span className="btn-icon">+</span>
              Client plan
            </button>
            <button className="btn" onClick={fetchAppointments}>Refresh</button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}
        {actionMessage && <div className="notice">{actionMessage}</div>}

        <AppointmentDashboardModules
          patients={patients}
          manualAppointments={manualAppointments}
          loading={loading}
          onAppointmentCreated={handleManualCreated}
        />

        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-accent blue" />
            <div className="metric-label">Today</div>
            <div className="metric-value">{loading ? "..." : grouped.today.length}</div>
            <div className="metric-detail">Scheduled for today</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent gold" />
            <div className="metric-label">This week</div>
            <div className="metric-value">{loading ? "..." : grouped.weekly.length}</div>
            <div className="metric-detail">{week.label}</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent green" />
            <div className="metric-label">To be appointed</div>
            <div className="metric-value">{loading ? "..." : grouped.toBeAppointed.length}</div>
            <div className="metric-detail">Planned sequence missing date/time</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent rose" />
            <div className="metric-label">Completed</div>
            <div className="metric-value">{loading ? "..." : grouped.done.length}</div>
            <div className="metric-detail">Visits already done</div>
          </div>
        </section>

        <section className="schedule-layout">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Today</h2>
                <p>{todayKey}</p>
              </div>
              <span className="pill">{grouped.today.length}</span>
            </div>

            <div className="schedule-stack">
              {loading && <div className="empty-state compact">Loading schedule...</div>}

              {!loading && grouped.today.length === 0 && (
                <div className="empty-state compact">No appointments today.</div>
              )}

              {grouped.today.map((appointment, index) => (
                <AppointmentCard
                  key={`${appointment.registrationNo}-today-${index}`}
                  appointment={appointment}
                  tone="today"
                />
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Weekly Appointments</h2>
                <p>{week.label}</p>
              </div>
              <span className="pill warning">{grouped.weekly.length}</span>
            </div>

            <div className="schedule-stack">
              {!loading && grouped.weekly.length === 0 && (
                <div className="empty-state compact">No appointments this week.</div>
              )}

              {grouped.weekly.slice(0, 8).map((appointment, index) => (
                <AppointmentCard
                  key={`${appointment.source}-${appointment.id}-week-${index}`}
                  appointment={appointment}
                  tone="tomorrow"
                />
              ))}
            </div>
          </div>

          <div className="panel wide">
            <div className="panel-heading">
              <div>
                <h2>All Weekly Appointments</h2>
                <p>Planned and manual appointments for the current week.</p>
              </div>
              <span className="pill success">{grouped.weekly.length}</span>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Mobile</th>
                    <th>Time</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="6">Loading weekly appointments...</td>
                    </tr>
                  )}

                  {!loading && grouped.weekly.length === 0 && (
                    <tr>
                      <td colSpan="6">No appointments found this week.</td>
                    </tr>
                  )}

                  {grouped.weekly.map((appointment, index) => (
                    <tr key={`${appointment.source}-${appointment.id}-weekly-row-${index}`}>
                      <td>
                        <span className="pill">{formatDateDisplay(appointment.date)}</span>
                      </td>
                      <td>
                        <strong>{appointment.clientName || appointment.patientName}</strong>
                      </td>
                      <td>{appointment.source === "manual" ? "Manual" : `Visit ${appointment.visitNo || "-"}`}</td>
                      <td>{appointment.mobileNumber}</td>
                      <td>{appointment.time || "-"}</td>
                      <td>{appointment.purpose || appointment.procedure || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel wide">
            <div className="panel-heading">
              <div>
                <h2>To Be Appointed</h2>
                <p>Clients with planned sequence treatment but missing date or time.</p>
              </div>
              <span className="pill warning">{grouped.toBeAppointed.length}</span>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Reg No</th>
                    <th>Mobile</th>
                    <th>Missing visits</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="4">Loading clients...</td>
                    </tr>
                  )}
                  {!loading && grouped.toBeAppointed.length === 0 && (
                    <tr>
                      <td colSpan="4">No clients are waiting for appointment date/time.</td>
                    </tr>
                  )}
                  {grouped.toBeAppointed.map(({ patient, summary }) => (
                    <tr key={patient._id || regNo(patient)}>
                      <td>
                        <strong>{patientName(patient)}</strong>
                      </td>
                      <td>
                        <span className="pill">{regNo(patient) || "-"}</span>
                      </td>
                      <td>{mobileNumber(patient)}</td>
                      <td>{summary.missingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel wide">
            <div className="panel-heading">
              <div>
                <h2>Manual Appointment Records</h2>
                <p>Update status or remove manual entries.</p>
              </div>
              <span className="pill">{grouped.manual.length}</span>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Client</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="6">Loading manual appointments...</td>
                    </tr>
                  )}
                  {!loading && grouped.manual.length === 0 && (
                    <tr>
                      <td colSpan="6">No manual appointments saved yet.</td>
                    </tr>
                  )}
                  {grouped.manual.map((appointment) => (
                    <tr key={`manual-record-${appointment.id}`}>
                      <td>{appointment.dateLabel || "-"}</td>
                      <td>{appointment.time || "-"}</td>
                      <td>
                        <strong>{appointment.clientName}</strong>
                        <small className="table-subtext">{appointment.mobileNumber}</small>
                      </td>
                      <td>{appointment.purpose}</td>
                      <td>
                        <select
                          className="table-select"
                          value={appointment.raw?.status || "scheduled"}
                          onChange={(event) => updateManualStatus(appointment, event.target.value)}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="missed">Missed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-sm" type="button" onClick={() => deleteManualAppointment(appointment)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {grouped.done.length > 0 && (
            <div className="panel wide">
              <div className="panel-heading">
                <div>
                  <h2>Done Visits</h2>
                  <p>Past visits and manual completed appointments.</p>
                </div>
                <span className="pill success">{grouped.done.length}</span>
              </div>

              <div className="schedule-stack dense">
                {grouped.done.slice(0, 8).map((appointment, index) => (
                  <AppointmentCard
                    key={`${appointment.source}-${appointment.id}-done-${index}`}
                    appointment={appointment}
                    tone="done"
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default Appointments;
