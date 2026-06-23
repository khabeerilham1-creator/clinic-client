import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  activeShift,
  activeShiftId,
  filterPatientsForActiveShift,
  initials,
  mobileNumber,
  patientArray,
  patientName,
  regNo,
} from "../utils/patientHelpers";

const toDateKey = (date) => new Date(date).toISOString().split("T")[0];

function AppointmentCard({ appointment, tone }) {
  return (
    <div className={`schedule-card ${tone}`}>
      <div className="schedule-date">
        <strong>{appointment.dateLabel}</strong>
        <span>Visit {appointment.visitNo || "-"}</span>
      </div>

      <div className="patient-cell">
        <span className="patient-avatar">{initials(appointment.patientName)}</span>
        <div>
          <strong>{appointment.patientName}</strong>
          <small>{appointment.procedure || "Treatment visit"}</small>
        </div>
      </div>

      <div className="schedule-meta">
        <span>{appointment.mobileNumber}</span>
        <span>Reg {appointment.registrationNo || "-"}</span>
      </div>
    </div>
  );
}

function Appointments({ activePage, setActivePage, handleLogout }) {
  const shift = activeShift();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/patients", {
        params: { limit: 100, sort: "createdAt", order: -1, shift: activeShiftId() },
      });

      const allAppointments = filterPatientsForActiveShift(patientArray(response.data))
        .flatMap((patient) =>
          (patient.plannedSequence || []).map((visit) => ({
            patientId: patient._id,
            patientName: patientName(patient),
            mobileNumber: mobileNumber(patient),
            registrationNo: regNo(patient),
            visitNo: visit.visitNo,
            date: visit.date,
            procedure: visit.procedure || visit.treatment || visit.details,
            rawVisit: visit,
          }))
        )
        .filter((appointment) => appointment.date)
        .sort((a, b) => String(a.date).localeCompare(String(b.date)))
        .map((appointment) => ({
          ...appointment,
          dateLabel: new Date(`${appointment.date}T00:00:00`).toLocaleDateString("en-PK", {
            day: "2-digit",
            month: "short",
          }),
        }));

      setAppointments(allAppointments);
    } catch (requestError) {
      console.error(requestError);
      setError("Appointments could not be loaded from patient planned sequences.");
    } finally {
      setLoading(false);
    }
  };

  const todayKey = toDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = toDateKey(tomorrow);

  const grouped = useMemo(() => {
    const today = appointments.filter((appointment) => appointment.date === todayKey);
    const tomorrowList = appointments.filter((appointment) => appointment.date === tomorrowKey);
    const upcoming = appointments.filter((appointment) => appointment.date > tomorrowKey);
    const overdue = appointments.filter((appointment) => appointment.date < todayKey);

    return { today, tomorrow: tomorrowList, upcoming, overdue };
  }, [appointments, todayKey, tomorrowKey]);

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      handleLogout={handleLogout}
    >
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Planned sequence calendar</div>
            <h1>{shift?.label ? `${shift.label} Appointments` : "Appointments"}</h1>
            <p>
              {shift?.doctorName
                ? `Scheduled visits for ${shift.doctorName} are pulled directly from patient treatment plans.`
                : "All scheduled visits are pulled directly from patient treatment plans."}
            </p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" onClick={() => setActivePage("patients")}>
              <span className="btn-icon">+</span>
              Add visit
            </button>
            <button className="btn" onClick={fetchAppointments}>Refresh</button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="metrics-grid three">
          <div className="metric-card">
            <div className="metric-accent blue" />
            <div className="metric-label">Today</div>
            <div className="metric-value">{loading ? "..." : grouped.today.length}</div>
            <div className="metric-detail">Chairside visits</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent gold" />
            <div className="metric-label">Tomorrow</div>
            <div className="metric-value">{loading ? "..." : grouped.tomorrow.length}</div>
            <div className="metric-detail">Prepared files</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent green" />
            <div className="metric-label">Upcoming</div>
            <div className="metric-value">{loading ? "..." : grouped.upcoming.length}</div>
            <div className="metric-detail">Future visits</div>
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
                <h2>Tomorrow</h2>
                <p>{tomorrowKey}</p>
              </div>
              <span className="pill warning">{grouped.tomorrow.length}</span>
            </div>

            <div className="schedule-stack">
              {!loading && grouped.tomorrow.length === 0 && (
                <div className="empty-state compact">No appointments tomorrow.</div>
              )}

              {grouped.tomorrow.map((appointment, index) => (
                <AppointmentCard
                  key={`${appointment.registrationNo}-tomorrow-${index}`}
                  appointment={appointment}
                  tone="tomorrow"
                />
              ))}
            </div>
          </div>

          <div className="panel wide">
            <div className="panel-heading">
              <div>
                <h2>Upcoming Treatment Queue</h2>
                <p>Future planned visits sorted by date.</p>
              </div>
              <span className="pill success">{grouped.upcoming.length}</span>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Reg No</th>
                    <th>Mobile</th>
                    <th>Procedure</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="5">Loading upcoming appointments...</td>
                    </tr>
                  )}

                  {!loading && grouped.upcoming.length === 0 && (
                    <tr>
                      <td colSpan="5">No upcoming appointments found.</td>
                    </tr>
                  )}

                  {grouped.upcoming.map((appointment, index) => (
                    <tr key={`${appointment.registrationNo}-upcoming-${index}`}>
                      <td>
                        <span className="pill">{appointment.date}</span>
                      </td>
                      <td>
                        <strong>{appointment.patientName}</strong>
                      </td>
                      <td>{appointment.registrationNo || "-"}</td>
                      <td>{appointment.mobileNumber}</td>
                      <td>{appointment.procedure || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {grouped.overdue.length > 0 && (
            <div className="panel wide">
              <div className="panel-heading">
                <div>
                  <h2>Overdue Follow-ups</h2>
                  <p>Past planned dates that may need a call.</p>
                </div>
                <span className="pill danger">{grouped.overdue.length}</span>
              </div>

              <div className="schedule-stack dense">
                {grouped.overdue.slice(0, 8).map((appointment, index) => (
                  <AppointmentCard
                    key={`${appointment.registrationNo}-overdue-${index}`}
                    appointment={appointment}
                    tone="overdue"
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
