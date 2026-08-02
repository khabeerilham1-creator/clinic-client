import React, { useMemo, useState } from "react";

import api from "../../api";
import {
  APPOINTMENT_PURPOSE_OPTIONS,
  manualAppointmentPayload,
} from "../../utils/appointmentHelpers";
import { dateKey } from "../../utils/patientHelpers";

const emptyForm = () => ({
  date: dateKey(new Date()),
  time: "",
  clientName: "",
  mobileNumber: "",
  purpose: APPOINTMENT_PURPOSE_OPTIONS[0],
  notes: "",
  status: "scheduled",
});

function ManualAppointmentForm({ onCreated, compact = false }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canSave = useMemo(
    () => form.date && form.time && form.clientName.trim() && form.purpose,
    [form]
  );

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
      setError("Please enter date, time, name and purpose.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = manualAppointmentPayload(form);
      const response = await api.post("/appointments", payload);
      setForm(emptyForm());
      setMessage("Appointment saved.");

      if (onCreated) {
        onCreated(response.data?.appointment);
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
            type="date"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
            max="9999-12-31"
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
        {saving ? "Saving..." : "Save appointment"}
      </button>
    </form>
  );
}

export default ManualAppointmentForm;
