import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import PriceListPanel from "../components/patient/PriceListPanel";
import { AcknowledgementSheet } from "../components/patient/SpecialtySheets";
import { activeShift, dateKey, formatDateDisplay, formatTimeDisplay } from "../utils/patientHelpers";

const emptyEntry = () => ({
  date: formatDateDisplay(new Date()),
  name: "",
  time: "",
  purpose: "",
  contact: "",
  entryTime: "",
  exitTime: "",
});

const entryArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.entries)) {
    return payload.entries;
  }

  return [];
};

const safeUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch (error) {
    return {};
  }
};

const entryId = (entry) => entry?._id || entry?.id || "";

export function EntrySheet({ activePage, setActivePage, handleLogout }) {
  const [form, setForm] = useState(emptyEntry);
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const shift = activeShift();

  useEffect(() => {
    fetchEntries();
  }, [shift?.id]);

  const fetchEntries = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/entry-sheet", {
        params: {
          limit: 1000,
          shift: shift?.id || undefined,
        },
      });
      setEntries(entryArray(response.data));
    } catch (requestError) {
      console.error(requestError);
      setEntries([]);
      setError("Entry sheet could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const entryPayload = () => {
    const user = safeUser();

    return {
      ...form,
      date: dateKey(form.date) || "",
      shiftId: shift?.id || user.shiftId || "",
      shiftName: shift?.label || user.shiftName || "",
      createdByRole: sessionStorage.getItem("role") || user.role || "",
      createdByName: user.name || "",
    };
  };

  const saveEntry = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !dateKey(form.date)) {
      setError("Please enter name and date as day/month/year.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = entryPayload();

      if (editingId) {
        await api.put(`/entry-sheet/${editingId}`, payload);
        setMessage("Entry updated.");
      } else {
        await api.post("/entry-sheet", payload);
        setMessage("Entry saved.");
      }

      setEditingId(null);
      setForm(emptyEntry());
      fetchEntries();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError?.response?.data?.detail || "Entry could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setMessage("");
  };

  const editEntry = (entry) => {
    setEditingId(entryId(entry));
    setForm({ ...emptyEntry(), ...entry, date: formatDateDisplay(entry.date) });
    setError("");
    setMessage("");
  };

  const deleteEntry = async (entry) => {
    const id = entryId(entry);

    if (!id) {
      setError("Entry ID is missing.");
      return;
    }

    if (!window.confirm(`Delete entry for ${entry.name}?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(`/entry-sheet/${id}`);
      setMessage("Entry deleted.");

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyEntry());
      }

      fetchEntries();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError?.response?.data?.detail || "Entry could not be deleted.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyEntry());
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Entry sheet</div>
            <h1>Entry Sheet</h1>
            <p>Name, time, purpose, contact, entry time and exit time.</p>
          </div>
        </section>

        <section className="panel">
          <form className="appointment-form-grid entry-sheet-form" onSubmit={saveEntry}>
            <label className="field">
              <span>Date</span>
              <input
                inputMode="numeric"
                placeholder="dd/mm/yyyy"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Name</span>
              <input value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            </label>
            <label className="field">
              <span>Time</span>
              <input type="time" value={form.time} onChange={(event) => updateField("time", event.target.value)} />
            </label>
            <label className="field">
              <span>Purpose</span>
              <textarea
                value={form.purpose}
                onChange={(event) => updateField("purpose", event.target.value)}
                placeholder="Enter purpose manually"
              />
            </label>
            <label className="field">
              <span>Contact</span>
              <input value={form.contact} onChange={(event) => updateField("contact", event.target.value)} />
            </label>
            <label className="field">
              <span>Entry Time</span>
              <input type="time" value={form.entryTime} onChange={(event) => updateField("entryTime", event.target.value)} />
            </label>
            <label className="field">
              <span>Exit Time</span>
              <input type="time" value={form.exitTime} onChange={(event) => updateField("exitTime", event.target.value)} />
            </label>
            <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Entry" : "Save Entry"}
            </button>
            {editingId && (
              <button className="btn btn-full" type="button" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
            )}
          </form>
          {error && <div className="notice danger compact-notice">{error}</div>}
          {message && <div className="notice compact-notice">{message}</div>}
        </section>

        <section className="panel">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Time</th>
                  <th>Purpose</th>
                  <th>Contact</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="8">Loading entry sheet...</td>
                  </tr>
                )}
                {!loading && entries.length === 0 && (
                  <tr>
                    <td colSpan="8">No entry sheet records yet.</td>
                  </tr>
                )}
                {!loading && entries.map((entry) => (
                  <tr key={entryId(entry)}>
                    <td>{formatDateDisplay(entry.date) || "-"}</td>
                    <td>{entry.name}</td>
                    <td>{formatTimeDisplay(entry.time) || "-"}</td>
                    <td>{entry.purpose}</td>
                    <td>{entry.contact || "-"}</td>
                    <td>{formatTimeDisplay(entry.entryTime) || "-"}</td>
                    <td>{formatTimeDisplay(entry.exitTime) || "-"}</td>
                    <td className="row-actions no-print">
                      <button className="btn btn-sm" type="button" onClick={() => editEntry(entry)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" type="button" onClick={() => deleteEntry(entry)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export function PriceSheet({ activePage, setActivePage, handleLogout }) {
  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Clinic prices</div>
            <h1>Price Sheet</h1>
            <p>Treatment prices by client category.</p>
          </div>
        </section>
        <PriceListPanel />
      </div>
    </Layout>
  );
}

export function AcknowledgementTool({ activePage, setActivePage, handleLogout }) {
  const [patientData, setPatientData] = useState({
    acknowledgement: {
      date: dateKey(new Date()),
    },
  });

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page printable-report">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Printable</div>
            <h1>Acknowledgement Sheet</h1>
            <p>Same acknowledgement format used in New Checkup.</p>
          </div>
          <button className="btn btn-primary no-print" type="button" onClick={() => window.print()}>
            Print
          </button>
        </section>

        <AcknowledgementSheet patientData={patientData} setPatientData={setPatientData} />
      </div>
    </Layout>
  );
}

export function Medications({ activePage, setActivePage, handleLogout }) {
  const rows = useMemo(
    () => ["Pain control", "Antibiotic", "Mouthwash", "Post-op instructions", "Follow-up advice"],
    []
  );

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Clinic reference</div>
            <h1>Medications</h1>
            <p>Medication notes and prescription reminders.</p>
          </div>
        </section>
        <section className="panel">
          <div className="quick-grid">
            {rows.map((row) => (
              <div className="quick-action" key={row}>
                <span>RX</span>
                {row}
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export function InstallmentMode({ activePage, setActivePage, handleLogout }) {
  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Payments</div>
            <h1>Installment Mode</h1>
            <p>Plan installment amount, paid amount and remaining balance.</p>
          </div>
        </section>
        <section className="panel">
          <div className="appointment-form-grid">
            <label className="field"><span>Total Amount</span><input type="number" /></label>
            <label className="field"><span>Advance Paid</span><input type="number" /></label>
            <label className="field"><span>Installments</span><input type="number" /></label>
            <label className="field"><span>Monthly Due Date</span><input type="date" /></label>
          </div>
        </section>
      </div>
    </Layout>
  );
}
