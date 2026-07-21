import React, { useMemo } from "react";

import {
  appointmentInitials,
  appointmentTimeline,
  currentWeekRange,
} from "../../utils/appointmentHelpers";
import { dateKey } from "../../utils/patientHelpers";
import ManualAppointmentForm from "./ManualAppointmentForm";

function MiniAppointment({ appointment }) {
  return (
    <div className={`appointment-mini ${appointment.source}`}>
      <span className="patient-avatar">{appointmentInitials(appointment)}</span>
      <div className="appointment-mini-main">
        <strong>{appointment.clientName || appointment.patientName}</strong>
        <small>{appointment.time || appointment.dateLabel || "No time"} | {appointment.purpose || appointment.procedure}</small>
      </div>
      <span className={`pill ${appointment.status === "Done" ? "success" : appointment.status === "Today" ? "warning" : ""}`}>
        {appointment.source === "manual" ? "Manual" : `Visit ${appointment.visitNo || "-"}`}
      </span>
    </div>
  );
}

function AppointmentDashboardModules({
  patients = [],
  manualAppointments = [],
  loading = false,
  onAppointmentCreated,
  onOpenAppointments,
}) {
  const today = dateKey(new Date());
  const week = useMemo(() => currentWeekRange(), []);
  const appointments = useMemo(
    () => appointmentTimeline(patients, manualAppointments),
    [patients, manualAppointments]
  );
  const activeAppointments = appointments.filter(
    (appointment) => !["Done", "Cancelled", "Missed"].includes(appointment.status)
  );
  const todayAppointments = activeAppointments.filter((appointment) => appointment.dateKey === today);
  const weeklyAppointments = activeAppointments.filter(
    (appointment) => appointment.dateKey >= week.startKey && appointment.dateKey <= week.endKey
  );

  return (
    <section className="appointment-modules">
      <div className="panel appointment-module">
        <div className="panel-heading">
          <div>
            <h2>Today's Appointments</h2>
            <p>{today}</p>
          </div>
          <span className="pill warning">{loading ? "..." : todayAppointments.length}</span>
        </div>

        <div className="appointment-mini-stack">
          {loading && <div className="empty-state compact">Loading appointments...</div>}
          {!loading && todayAppointments.length === 0 && (
            <div className="empty-state compact">No appointments today.</div>
          )}
          {todayAppointments.slice(0, 4).map((appointment) => (
            <MiniAppointment key={`${appointment.source}-${appointment.id}`} appointment={appointment} />
          ))}
        </div>
      </div>

      <div className="panel appointment-module">
        <div className="panel-heading">
          <div>
            <h2>Weekly Appointments</h2>
            <p>{week.label}</p>
          </div>
          <span className="pill success">{loading ? "..." : weeklyAppointments.length}</span>
        </div>

        <div className="appointment-mini-stack">
          {loading && <div className="empty-state compact">Loading week...</div>}
          {!loading && weeklyAppointments.length === 0 && (
            <div className="empty-state compact">No appointments this week.</div>
          )}
          {weeklyAppointments.slice(0, 4).map((appointment) => (
            <MiniAppointment key={`${appointment.source}-${appointment.id}`} appointment={appointment} />
          ))}
        </div>

        {onOpenAppointments && (
          <button className="btn btn-sm btn-full" type="button" onClick={onOpenAppointments}>
            Open appointments
          </button>
        )}
      </div>

      <div className="panel appointment-module add-appointment-module">
        <div className="panel-heading">
          <div>
            <h2>Add New Appointment</h2>
            <p>Manual date, time, client and purpose entry.</p>
          </div>
        </div>

        <ManualAppointmentForm compact onCreated={onAppointmentCreated} />
      </div>
    </section>
  );
}

export default AppointmentDashboardModules;
