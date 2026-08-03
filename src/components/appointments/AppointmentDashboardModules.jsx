import React, { useMemo } from "react";

import {
  appointmentInitials,
  appointmentTimeline,
  currentWeekRange,
} from "../../utils/appointmentHelpers";
import { dateKey, formatDateDisplay } from "../../utils/patientHelpers";
import ManualAppointmentForm from "./ManualAppointmentForm";

function MiniAppointment({ appointment, onOpenPatient, onEditAppointment, onDeleteAppointment }) {
  const canOpen = Boolean(appointment.patient && onOpenPatient);
  const canManage = appointment.source === "manual" && (onEditAppointment || onDeleteAppointment);

  return (
    <div className={`appointment-mini ${appointment.source}`}>
      <span className="patient-avatar">{appointmentInitials(appointment)}</span>
      <div className="appointment-mini-main">
        {canOpen ? (
          <button className="patient-link" type="button" onClick={() => onOpenPatient(appointment.patient)}>
            {appointment.clientName || appointment.patientName}
          </button>
        ) : (
          <strong>{appointment.clientName || appointment.patientName}</strong>
        )}
        <small>{appointment.timeLabel || appointment.time || appointment.dateLabel || "No time"} | {appointment.purpose || appointment.procedure}</small>
      </div>
      <span className={`pill ${appointment.status === "Done" ? "success" : appointment.status === "Today" ? "warning" : ""}`}>
        {appointment.source === "manual" ? "Appointment" : `Visit ${appointment.visitNo || "-"}`}
      </span>
      {canManage && (
        <div className="row-actions appointment-actions no-print">
          {onEditAppointment && (
            <button className="btn btn-sm" type="button" onClick={() => onEditAppointment(appointment)}>
              Edit
            </button>
          )}
          {onDeleteAppointment && (
            <button className="btn btn-sm btn-danger" type="button" onClick={() => onDeleteAppointment(appointment)}>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AppointmentDashboardModules({
  patients = [],
  manualAppointments = [],
  loading = false,
  editingAppointment = null,
  onAppointmentCreated,
  onAppointmentSaved,
  onCancelAppointmentEdit,
  onEditAppointment,
  onDeleteAppointment,
  onOpenAppointments,
  onOpenPatient,
}) {
  const today = dateKey(new Date());
  const isSunday = new Date().getDay() === 0;
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
            <p>{formatDateDisplay(today)}</p>
          </div>
          <span className="pill warning">{loading ? "..." : todayAppointments.length}</span>
        </div>

        <div className="appointment-mini-stack">
          {loading && <div className="empty-state compact">Loading appointments...</div>}
          {!loading && isSunday && (
            <div className="holiday-state">
              <span>It is Sunday, a weekly holiday. Enjoy the off day.</span>
            </div>
          )}
          {!loading && !isSunday && todayAppointments.length === 0 && (
            <div className="empty-state compact">No appointments today.</div>
          )}
          {!isSunday && todayAppointments.slice(0, 4).map((appointment) => (
            <MiniAppointment
              key={`${appointment.source}-${appointment.id}`}
              appointment={appointment}
              onOpenPatient={onOpenPatient}
              onEditAppointment={onEditAppointment}
              onDeleteAppointment={onDeleteAppointment}
            />
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
            <MiniAppointment
              key={`${appointment.source}-${appointment.id}`}
              appointment={appointment}
              onOpenPatient={onOpenPatient}
              onEditAppointment={onEditAppointment}
              onDeleteAppointment={onDeleteAppointment}
            />
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
            <h2>{editingAppointment ? "Edit Appointment" : "Add New Appointment"}</h2>
            <p>Date, time, name and purpose entry.</p>
          </div>
        </div>

        <ManualAppointmentForm
          compact
          appointment={editingAppointment}
          onCreated={onAppointmentCreated}
          onSaved={onAppointmentSaved}
          onCancelEdit={onCancelAppointmentEdit}
        />
      </div>
    </section>
  );
}

export default AppointmentDashboardModules;
