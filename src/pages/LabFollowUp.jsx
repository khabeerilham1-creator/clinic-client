import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  activeShiftId,
  filterPatientsForActiveShift,
  formatDateDisplay,
  patientArray,
  patientName,
  regNo,
} from "../utils/patientHelpers";
import { DEFAULT_LABS } from "../utils/clinicData";
import { playSectionSound } from "../utils/sound";

const LAB_STORAGE_KEY = "clinicLabs";

const todayInputValue = () => new Date().toISOString().split("T")[0];

const emptyForm = (patientId = "", labName = "") => ({
  date: todayInputValue(),
  patientId,
  labName,
  job: "",
  units: "",
  shade: "",
  status: "Pending",
});

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const uniqueLabs = (labs) => {
  const seen = new Set();

  return labs
    .map((lab) => String(lab || "").trim())
    .filter(Boolean)
    .filter((lab) => {
      const key = normalizeText(lab);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
};

const loadLabs = () => {
  if (typeof window === "undefined") {
    return DEFAULT_LABS;
  }

  try {
    const storedLabs = JSON.parse(localStorage.getItem(LAB_STORAGE_KEY) || "[]");
    return uniqueLabs([...DEFAULT_LABS, ...(Array.isArray(storedLabs) ? storedLabs : [])]);
  } catch (error) {
    return DEFAULT_LABS;
  }
};

const saveLabs = (labs) => {
  localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(uniqueLabs(labs)));
};

const makeRecordId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `lab-follow-up-${Date.now()}`;
};

const recordDate = (record) => record.date || record.sendingDate || "";
const recordJob = (record) => record.job || record.details || "";
const recordUnits = (record) => record.units || "";
const recordShade = (record) => record.shade || "";
const recordStatus = (record) => record.status || "Pending";

function LabFollowUp({ activePage, setActivePage, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [labs, setLabs] = useState(loadLabs);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [form, setForm] = useState(() => emptyForm("", loadLabs()[0] || DEFAULT_LABS[0] || ""));
  const [editingTarget, setEditingTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/patients", {
        params: { limit: 1000, sort: "createdAt", order: -1, shift: activeShiftId() },
      });
      const list = filterPatientsForActiveShift(patientArray(response.data));

      setPatients(list);

      if (selectedPatient?._id) {
        setSelectedPatient(list.find((patient) => patient._id === selectedPatient._id) || null);
      }
    } catch (requestError) {
      console.error(requestError);
      setPatients([]);
      setError("Lab follow up could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const rows = useMemo(() => {
    const query = normalizeText(search);

    return patients
      .flatMap((patient) =>
        (patient.labRecords || []).map((record, recordIndex) => ({
          ...record,
          patient,
          patientName: patientName(patient),
          regNo: regNo(patient),
          recordIndex,
          rowKey: record.id || `${patient._id || patientName(patient)}-${recordIndex}`,
        }))
      )
      .filter((row) => {
        if (!query) {
          return true;
        }

        return (
          normalizeText(row.patientName).includes(query) ||
          normalizeText(row.regNo).includes(query) ||
          normalizeText(row.labName).includes(query) ||
          normalizeText(recordJob(row)).includes(query) ||
          normalizeText(recordShade(row)).includes(query) ||
          normalizeText(recordStatus(row)).includes(query)
        );
      })
      .sort((a, b) => String(recordDate(b)).localeCompare(String(recordDate(a))));
  }, [patients, search]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    playSectionSound(type === "danger" ? "warning" : "success");
    window.setTimeout(() => setMessage(null), 3200);
  };

  const updateLabs = (nextLabs) => {
    const cleanLabs = uniqueLabs(nextLabs);
    setLabs(cleanLabs);
    saveLabs(cleanLabs);
  };

  const handlePatientSearch = (value) => {
    setPatientSearch(value);

    const matchingPatient = patients.find(
      (patient) =>
        normalizeText(patientName(patient)) === normalizeText(value) ||
        normalizeText(regNo(patient)) === normalizeText(value) ||
        normalizeText(`${patientName(patient)} - ${regNo(patient)}`) === normalizeText(value)
    );

    if (matchingPatient) {
      setSelectedPatient(matchingPatient);
      setForm((current) => ({ ...current, patientId: matchingPatient._id || "" }));
    } else {
      setSelectedPatient(null);
      setForm((current) => ({ ...current, patientId: "" }));
    }
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = (patientId = selectedPatient?._id || "") => {
    setEditingTarget(null);
    setForm(emptyForm(patientId, form.labName || labs[0] || DEFAULT_LABS[0] || ""));
  };

  const updatePatient = async (updatedPatient) => {
    await api.put(`/patients/${updatedPatient._id}`, updatedPatient);
    setSelectedPatient(updatedPatient);
    setPatients((current) =>
      current.map((patient) => (patient._id === updatedPatient._id ? updatedPatient : patient))
    );
  };

  const targetMatches = (record, index, target) =>
    target?.id ? record.id === target.id : index === target?.recordIndex;

  const handleSubmit = async () => {
    const patient = selectedPatient || patients.find((item) => item._id && item._id === form.patientId);
    const cleanLabName = form.labName.trim();

    if (!patient?._id) {
      showMessage("Select a patient before saving.", "danger");
      return;
    }

    if (!cleanLabName) {
      showMessage("Enter lab name before saving.", "danger");
      return;
    }

    if (!form.job.trim() && !form.shade.trim()) {
      showMessage("Enter job or shade before saving.", "danger");
      return;
    }

    if (!labs.some((lab) => normalizeText(lab) === normalizeText(cleanLabName))) {
      updateLabs([...labs, cleanLabName]);
    }

    const record = {
      id: editingTarget?.id || makeRecordId(),
      labName: cleanLabName,
      date: form.date || todayInputValue(),
      job: form.job.trim(),
      units: Number(form.units || 0),
      shade: form.shade.trim(),
      status: form.status || "Pending",
      updatedAt: new Date().toISOString(),
    };
    const currentRecords = patient.labRecords || [];
    const nextRecords = editingTarget
      ? currentRecords.map((item, index) => (targetMatches(item, index, editingTarget) ? record : item))
      : [record, ...currentRecords];

    setSaving(true);

    try {
      await updatePatient({ ...patient, labRecords: nextRecords });
      resetForm(patient._id);
      showMessage(editingTarget ? "Lab follow up updated." : "Lab follow up saved.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Lab follow up could not be saved.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row) => {
    setSelectedPatient(row.patient);
    setPatientSearch(`${row.patientName} - ${row.regNo || ""}`.trim());
    setEditingTarget(row);
    setForm({
      date: recordDate(row) || todayInputValue(),
      patientId: row.patient?._id || "",
      labName: row.labName || labs[0] || DEFAULT_LABS[0] || "",
      job: recordJob(row),
      units: String(recordUnits(row) || ""),
      shade: recordShade(row),
      status: recordStatus(row),
    });
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete lab follow up for ${row.patientName}?`)) {
      return;
    }

    const updatedPatient = {
      ...row.patient,
      labRecords: (row.patient.labRecords || []).filter(
        (record, index) => !targetMatches(record, index, row)
      ),
    };

    try {
      await updatePatient(updatedPatient);
      resetForm(updatedPatient._id);
      showMessage("Lab follow up deleted.");
    } catch (requestError) {
      console.error(requestError);
      showMessage("Lab follow up could not be deleted.", "danger");
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero">
          <div>
            <div className="eyebrow">Receptionist</div>
            <h1>Lab Cases Follow Up</h1>
            <p>{rows.length} lab cases connected with registered cases.</p>
          </div>
          <div className="hero-actions no-print">
            <button className="btn" type="button" onClick={fetchPatients}>Refresh</button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}
        {message && <div className={`notice ${message.type === "danger" ? "danger" : ""}`}>{message.text}</div>}

        <section className="panel no-print">
          <div className="panel-heading">
            <div>
              <h2>{editingTarget ? "Update Lab Follow Up" : "Add Lab Follow Up"}</h2>
              <p>{selectedPatient ? `${patientName(selectedPatient)} | Reg ${regNo(selectedPatient) || "-"}` : "Select patient and lab case details."}</p>
            </div>
          </div>

          <datalist id="lab-follow-up-patient-list">
            {patients.map((patient) => (
              <option key={patient._id || regNo(patient)} value={`${patientName(patient)} - ${regNo(patient)}`} />
            ))}
          </datalist>

          <datalist id="lab-follow-up-lab-list">
            {labs.map((lab) => (
              <option key={lab} value={lab} />
            ))}
          </datalist>

          <div className="payment-panel lab-case-form no-print">
            <label className="field lab-patient-field">
              <span>Patient Name</span>
              <input
                list="lab-follow-up-patient-list"
                value={patientSearch}
                onChange={(event) => handlePatientSearch(event.target.value)}
                placeholder="Search and select patient"
              />
            </label>
            <label className="field">
              <span>Lab Name</span>
              <input
                list="lab-follow-up-lab-list"
                value={form.labName}
                onChange={(event) => handleChange("labName", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Date</span>
              <input type="date" value={form.date} onChange={(event) => handleChange("date", event.target.value)} />
            </label>
            <label className="field">
              <span>Job</span>
              <input value={form.job} onChange={(event) => handleChange("job", event.target.value)} />
            </label>
            <label className="field">
              <span>Units</span>
              <input type="number" min="0" value={form.units} onChange={(event) => handleChange("units", event.target.value)} />
            </label>
            <label className="field">
              <span>Shade</span>
              <input value={form.shade} onChange={(event) => handleChange("shade", event.target.value)} />
            </label>
            <label className="field">
              <span>Status</span>
              <select value={form.status} onChange={(event) => handleChange("status", event.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Sent">Sent</option>
                <option value="Trial">Trial</option>
                <option value="Received">Received</option>
                <option value="Delivered">Delivered</option>
              </select>
            </label>
            <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : editingTarget ? "Update" : "Save"}
            </button>
            {editingTarget && (
              <button className="btn" type="button" onClick={() => resetForm()}>
                Cancel
              </button>
            )}
          </div>
        </section>

        <section className="toolbar-panel no-print">
          <div className="search-field">
            <span>Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Patient, lab, job, shade or status"
            />
          </div>
        </section>

        <section className="panel paper-sheet-panel">
          <div className="paper-table-title">Lab Cases Follow Up Sheet</div>
          <div className="data-table-wrap">
            <table className="data-table paper-follow-table">
              <thead>
                <tr>
                  <th>S No</th>
                  <th>Date</th>
                  <th>Lab</th>
                  <th>Patient Name</th>
                  <th>Job</th>
                  <th>Units</th>
                  <th>Shade</th>
                  <th>Status</th>
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="9">Loading lab cases...</td>
                  </tr>
                )}
                {!loading && rows.length === 0 && (
                  Array.from({ length: 18 }, (_, index) => (
                    <tr key={`blank-${index}`}>
                      <td>{index + 1}</td>
                      <td />
                      <td />
                      <td />
                      <td />
                      <td />
                      <td />
                      <td />
                      <td className="no-print" />
                    </tr>
                  ))
                )}
                {!loading && rows.map((row, index) => (
                  <tr key={row.rowKey}>
                    <td>{index + 1}</td>
                    <td>{formatDateDisplay(recordDate(row))}</td>
                    <td>{row.labName || "-"}</td>
                    <td>{row.patientName}</td>
                    <td>{recordJob(row) || "-"}</td>
                    <td>{recordUnits(row) || "-"}</td>
                    <td>{recordShade(row) || "-"}</td>
                    <td>{recordStatus(row)}</td>
                    <td className="row-actions no-print">
                      <button className="btn btn-sm" type="button" onClick={() => handleEdit(row)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(row)}>
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

export default LabFollowUp;
