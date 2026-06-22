import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  bio,
  initials,
  mobileNumber,
  patientArray,
  patientName,
  regNo,
} from "../utils/patientHelpers";
import { CLINIC_NAME, DOCTOR_NAME } from "../utils/clinicData";
import { playSectionSound } from "../utils/sound";

const todayInputValue = () => new Date().toISOString().split("T")[0];

const EMPTY_FORM = {
  labName: "",
  details: "",
  sendingDate: todayInputValue(),
  receivingDate: "",
};

const makeRecordId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `lab-${Date.now()}`;
};

const recordStatus = (record) => (record.receivingDate ? "Received" : "Sent");

function LabRecords({ activePage, setActivePage, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/patients", {
        params: { limit: 100, sort: "createdAt", order: -1 },
      });

      const list = patientArray(response.data);
      setPatients(list);

      if (selectedPatient?._id) {
        const refreshed = list.find((patient) => patient._id === selectedPatient._id);
        setSelectedPatient(refreshed || null);
      }
    } catch (requestError) {
      console.error(requestError);
      setError("Lab records could not be loaded. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients.filter((patient) => {
      if (!query) {
        return true;
      }

      return (
        patientName(patient).toLowerCase().includes(query) ||
        regNo(patient).toLowerCase().includes(query) ||
        mobileNumber(patient).toLowerCase().includes(query)
      );
    });
  }, [patients, search]);

  const selectedRecords = useMemo(
    () =>
      [...(selectedPatient?.labRecords || [])].sort((a, b) =>
        String(b.sendingDate || "").localeCompare(String(a.sendingDate || ""))
      ),
    [selectedPatient]
  );

  const allLabRows = useMemo(
    () =>
      patients
        .flatMap((patient) =>
          (patient.labRecords || []).map((record) => ({
            ...record,
            patientName: patientName(patient),
            regNo: regNo(patient),
            mobileNumber: mobileNumber(patient),
          }))
        )
        .sort((a, b) => String(b.sendingDate || "").localeCompare(String(a.sendingDate || "")))
        .slice(0, 12),
    [patients]
  );

  const pendingCount = allLabRows.filter((record) => !record.receivingDate).length;

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    playSectionSound(type === "danger" ? "warning" : "success");
    window.setTimeout(() => setMessage(null), 3600);
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setEditingId(null);
    setForm(EMPTY_FORM);
    playSectionSound("section");
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateSelectedPatient = async (records) => {
    const updatedPatient = {
      ...selectedPatient,
      labRecords: records,
    };

    await api.put(`/patients/${selectedPatient._id}`, updatedPatient);
    setSelectedPatient(updatedPatient);
    setPatients((current) =>
      current.map((patient) => (patient._id === selectedPatient._id ? updatedPatient : patient))
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!selectedPatient?._id) {
      showMessage("Select a patient before saving a lab record.", "danger");
      return;
    }

    if (!form.labName.trim() && !form.details.trim()) {
      showMessage("Lab name or details are required.", "danger");
      return;
    }

    const record = {
      id: editingId || makeRecordId(),
      labName: form.labName.trim() || "Lab",
      details: form.details.trim(),
      sendingDate: form.sendingDate || todayInputValue(),
      receivingDate: form.receivingDate || "",
      updatedAt: new Date().toISOString(),
    };

    const currentRecords = selectedPatient.labRecords || [];
    const nextRecords = editingId
      ? currentRecords.map((item) => (item.id === editingId ? record : item))
      : [record, ...currentRecords];

    setSaving(true);

    try {
      await updateSelectedPatient(nextRecords);
      resetForm();
      showMessage(editingId ? "Lab record updated permanently." : "Lab record saved permanently.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Lab record could not be saved. Please try again.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setForm({
      labName: record.labName || "",
      details: record.details || "",
      sendingDate: record.sendingDate || todayInputValue(),
      receivingDate: record.receivingDate || "",
    });
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete lab record for ${record.labName || "Lab"}?`)) {
      return;
    }

    try {
      const nextRecords = (selectedPatient.labRecords || []).filter((item) => item.id !== record.id);
      await updateSelectedPatient(nextRecords);
      resetForm();
      showMessage("Lab record deleted.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Lab record could not be deleted.", "danger");
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page printable-page lab-page">
        <section className="print-report-header">
          <strong>{CLINIC_NAME}</strong>
          <span>{DOCTOR_NAME}</span>
          <span>Lab Records - {selectedPatient ? patientName(selectedPatient) : "All patients"}</span>
        </section>

        <section className="page-hero">
          <div>
            <div className="eyebrow">Lab case register</div>
            <h1>Lab Records</h1>
            <p>Select a patient, save lab case details, and track sent and received dates.</p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn btn-primary" type="button" onClick={() => window.print()}>
              Print
            </button>
            <button className="btn" type="button" onClick={fetchPatients}>
              Refresh
            </button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}
        {message && <div className={`notice ${message.type === "danger" ? "danger" : ""}`}>{message.text}</div>}

        <section className="metrics-grid three">
          <div className="metric-card">
            <div className="metric-accent blue" />
            <div className="metric-label">Patients</div>
            <div className="metric-value">{loading ? "..." : patients.length}</div>
            <div className="metric-detail">Available for lab selection</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent gold" />
            <div className="metric-label">Pending labs</div>
            <div className="metric-value">{loading ? "..." : pendingCount}</div>
            <div className="metric-detail">Sent and not received yet</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent green" />
            <div className="metric-label">Selected records</div>
            <div className="metric-value">{selectedRecords.length}</div>
            <div className="metric-detail">{selectedPatient ? patientName(selectedPatient) : "No patient selected"}</div>
          </div>
        </section>

        <section className="lab-layout printable-report">
          <div className="panel patient-select-panel no-print">
            <div className="panel-heading">
              <div>
                <h2>Patient Selection</h2>
                <p>Search by name, registration number, or mobile number.</p>
              </div>
            </div>

            <label className="search-field">
              <span>Search Patient</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, reg no or mobile number"
              />
            </label>

            <div className="patient-select-list">
              {loading && <div className="empty-state compact">Loading patients...</div>}

              {!loading && filteredPatients.length === 0 && (
                <div className="empty-state compact">No matching patients found.</div>
              )}

              {filteredPatients.slice(0, 18).map((patient) => (
                <button
                  key={patient._id || regNo(patient)}
                  className={`patient-select-row${selectedPatient?._id === patient._id ? " active" : ""}`}
                  type="button"
                  onClick={() => selectPatient(patient)}
                >
                  <span className="patient-avatar">{initials(patientName(patient))}</span>
                  <span>
                    <strong>{patientName(patient)}</strong>
                    <small>Reg {regNo(patient) || "-"} | {mobileNumber(patient)}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel printable-report">
            <div className="panel-heading">
              <div>
                <h2>{selectedPatient ? patientName(selectedPatient) : "Lab Case Details"}</h2>
                <p>
                  {selectedPatient
                    ? `Reg ${regNo(selectedPatient) || "-"} | ${mobileNumber(selectedPatient)} | ${bio(selectedPatient).category || "-"}`
                    : "Select a patient from the left to save lab records."}
                </p>
              </div>
              {selectedPatient && <span className="pill">{selectedRecords.length} records</span>}
            </div>

            <div className="payment-panel lab-form no-print">
              <label className="field">
                <span>Lab Name</span>
                <input
                  value={form.labName}
                  onChange={(event) => handleChange("labName", event.target.value)}
                  placeholder="Lab name"
                />
              </label>
              <label className="field">
                <span>Details</span>
                <input
                  value={form.details}
                  onChange={(event) => handleChange("details", event.target.value)}
                  placeholder="Case, crown, bridge, aligner..."
                />
              </label>
              <label className="field">
                <span>Sending Date</span>
                <input
                  type="date"
                  value={form.sendingDate}
                  onChange={(event) => handleChange("sendingDate", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Receiving Date</span>
                <input
                  type="date"
                  value={form.receivingDate}
                  onChange={(event) => handleChange("receivingDate", event.target.value)}
                />
              </label>
              <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Save"}
              </button>
              {editingId && (
                <button className="btn" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Lab Name</th>
                    <th>Details</th>
                    <th>Sending Date</th>
                    <th>Receiving Date</th>
                    <th>Status</th>
                    <th className="no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedPatient && (
                    <tr>
                      <td colSpan="6">Select a patient to view lab records.</td>
                    </tr>
                  )}

                  {selectedPatient && selectedRecords.length === 0 && (
                    <tr>
                      <td colSpan="6">No lab records saved for this patient.</td>
                    </tr>
                  )}

                  {selectedRecords.map((record) => (
                    <tr key={record.id || `${record.labName}-${record.sendingDate}`}>
                      <td>{record.labName || "-"}</td>
                      <td>{record.details || "-"}</td>
                      <td>{record.sendingDate || "-"}</td>
                      <td>{record.receivingDate || "-"}</td>
                      <td>
                        <span className={record.receivingDate ? "pill success" : "pill warning"}>
                          {recordStatus(record)}
                        </span>
                      </td>
                      <td className="row-actions no-print">
                        <button className="btn btn-sm" type="button" onClick={() => handleEdit(record)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          type="button"
                          onClick={() => handleDelete(record)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="panel printable-report lab-recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Lab Cases</h2>
              <p>Latest saved lab records across patients.</p>
            </div>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Reg No</th>
                  <th>Lab</th>
                  <th>Details</th>
                  <th>Sent</th>
                  <th>Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allLabRows.length === 0 && (
                  <tr>
                    <td colSpan="7">No lab case records saved yet.</td>
                  </tr>
                )}

                {allLabRows.map((record, index) => (
                  <tr key={`${record.id || record.labName}-${index}`}>
                    <td>
                      <strong>{record.patientName}</strong>
                      <small>{record.mobileNumber}</small>
                    </td>
                    <td>{record.regNo || "-"}</td>
                    <td>{record.labName || "-"}</td>
                    <td>{record.details || "-"}</td>
                    <td>{record.sendingDate || "-"}</td>
                    <td>{record.receivingDate || "-"}</td>
                    <td>
                      <span className={record.receivingDate ? "pill success" : "pill warning"}>
                        {recordStatus(record)}
                      </span>
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

export default LabRecords;
