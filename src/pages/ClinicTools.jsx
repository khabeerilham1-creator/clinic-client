import React, { useMemo, useState } from "react";

import Layout from "../components/Layout";
import PriceListPanel from "../components/patient/PriceListPanel";
import { AcknowledgementSheet } from "../components/patient/SpecialtySheets";
import { dateKey, formatTimeDisplay } from "../utils/patientHelpers";

const entryStorageKey = "clinicEntrySheetRows";

const emptyEntry = () => ({
  id: `${Date.now()}`,
  date: dateKey(new Date()),
  name: "",
  time: "",
  purpose: "",
  contact: "",
  entryTime: "",
  exitTime: "",
});

const readEntries = () => {
  try {
    return JSON.parse(localStorage.getItem(entryStorageKey) || "[]");
  } catch (error) {
    return [];
  }
};

export function EntrySheet({ activePage, setActivePage, handleLogout }) {
  const [form, setForm] = useState(emptyEntry);
  const [entries, setEntries] = useState(readEntries);
  const [editingId, setEditingId] = useState(null);

  const saveEntry = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    const savedEntry = { ...form, id: editingId || form.id || `${Date.now()}` };
    const nextEntries = editingId
      ? entries.map((entry) => (entry.id === editingId ? savedEntry : entry))
      : [savedEntry, ...entries];

    setEntries(nextEntries);
    localStorage.setItem(entryStorageKey, JSON.stringify(nextEntries));
    setEditingId(null);
    setForm(emptyEntry());
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const editEntry = (entry) => {
    setEditingId(entry.id);
    setForm({ ...emptyEntry(), ...entry });
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
            <button className="btn btn-primary btn-full" type="submit">
              {editingId ? "Update Entry" : "Save Entry"}
            </button>
            {editingId && (
              <button className="btn btn-full" type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </form>
        </section>

        <section className="panel">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
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
                {entries.length === 0 && (
                  <tr>
                    <td colSpan="7">No entry sheet records yet.</td>
                  </tr>
                )}
                {entries.map((entry) => (
                  <tr key={entry.id}>
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
