import React, { useEffect, useMemo, useState } from "react";

import api from "../../api";
import {
  APPOINTMENT_PURPOSE_OPTIONS,
  manualAppointmentPayload,
} from "../../utils/appointmentHelpers";
import { dateKey, formatDateDisplay } from "../../utils/patientHelpers";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "missed", label: "Missed" },
];

const emptyForm = () => ({
  date: formatDateDisplay(new Date()),
  time: "",
  clientName: "",
  mobileNumber: "",
  purpose: APPOINTMENT_PURPOSE_OPTIONS[0],
  notes: "",
  status: "scheduled",
  patientId: "",
  registrationNo: "",
});

const appointmentId = (appointment) => appointment?._id || appointment?.id || "";

const formFromAppointment = (appointment) => {
  const raw = appointment?.raw || appointment || {};

  return {
    ...emptyForm(),
    date: formatDateDisplay(raw.date || appointment?.date || new Date()),
    time: raw.time || appointment?.time || "",
    clientName: raw.clientName || appointment?.clientName || appointment?.patientName || "",
    mobileNumber: raw.mobileNumber || appointment?.mobileNumber || "",
    purpose: raw.purpose || appointment?.purpose || appointment?.procedure || APPOINTMENT_PURPOSE_OPTIONS[0],
    notes: raw.notes || appointment?.notes || "",
    status: raw.status || appointment?.status || "scheduled",
    patientId: raw.patientId || appointment?.patientId || "",
    registrationNo: raw.registrationNo || appointment?.registrationNo || "",
  };
};

function ManualAppointmentForm({
  appointment,
  onCreated,
  onSaved,
  onCancelEdit,
  compact = false,
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const editingId = appointmentId(appointment);

  const canSave = useMemo(
    () => dateKey(form.date) && form.time && form.clientName.trim() && form.purpose,
    [form]
  );

  useEffect(() => {
    setForm(editingId ? formFromAppointment(appointment) : emptyForm());
    setMessage("");
    setError("");
  }, [appointment, editingId]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSave || saving) {
      setError("Please enter date as day/month/year, time, name and purpose.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = manualAppointmentPayload(form);
      const response = editingId
        ? await api.put(`/appointments/${editingId}`, payload)
        : await api.post("/appointments", payload);

      if (!editingId) {
        setForm(emptyForm());
      }

      setMessage(editingId ? "Appointment updated." : "Appointment saved.");

      if (!editingId && onCreated && !onSaved) {
        onCreated(response.data?.appointment);
      }

      if (onSaved) {
        onSaved(response.data?.appointment, Boolean(editingId));
      }
    } catch (requestError) {
      console.error(requestError);
      setError(requestError?.response?.data?.detail || "Appointment could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={`manual-appointment-form${compact ? " compact" : ""}`} onSubmit={handleSubmit}>
      <div className="appointment-form-grid">
        <label className="field">
          <span>Date</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="dd/mm/yyyy"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Time</span>
          <input
            type="time"
            value={form.time}
            onChange={(event) => updateField("time", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Name</span>
          <input
            type="text"
            value={form.clientName}
            onChange={(event) => updateField("clientName", event.target.value)}
            placeholder="Name"
            autoCapitalize="words"
          />
        </label>

        <label className="field">
          <span>Contact</span>
          <input
            type="tel"
            value={form.mobileNumber}
            onChange={(event) => updateField("mobileNumber", event.target.value)}
            placeholder="Optional"
          />
        </label>

        <label className="field">
          <span>Purpose visit</span>
          <select
            value={form.purpose}
            onChange={(event) => updateField("purpose", event.target.value)}
          >
            {APPOINTMENT_PURPOSE_OPTIONS.map((purpose) => (
              <option key={purpose} value={purpose}>
                {purpose}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Notes</span>
          <input
            type="text"
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Optional"
          />
        </label>
      </div>

      {error && <div className="notice danger compact-notice">{error}</div>}
      {message && <div className="notice compact-notice">{message}</div>}

      <button className="btn btn-primary btn-full" type="submit" disabled={saving || !canSave}>
        {saving ? "Saving..." : editingId ? "Update appointment" : "Save appointment"}
      </button>
      {editingId && onCancelEdit && (
        <button className="btn btn-full" type="button" onClick={onCancelEdit} disabled={saving}>
          Cancel edit
        </button>
      )}
    </form>
  );
}

export default ManualAppointmentForm;
