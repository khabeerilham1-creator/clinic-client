import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Visits() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);

  const [form, setForm] = useState({
    patient_id: "",
    diagnosis: "",
    treatment: ""
  });

  const [editId, setEditId] = useState(null);

  // =========================
  // LOAD PATIENTS
  // =========================
  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");
      setPatients(res.data);
    } catch (err) {
      console.log("Patients load error", err);
    }
  };

  // =========================
  // LOAD VISITS
  // =========================
  const loadVisits = async () => {
    try {
      const res = await api.get("/visits/");
      setVisits(res.data);
    } catch (err) {
      console.log("Visits load error", err);
    }
  };

  useEffect(() => {
    loadPatients();
    loadVisits();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // SAVE / UPDATE VISIT
  // =========================
  const saveVisit = async () => {
    try {

      if (editId) {
        // 🔥 UPDATE
        await api.put("/visits/" + editId, form);
        alert("Updated ✅");
      } else {
        // 🔥 CREATE
        await api.post("/visits/", form);
        alert("Saved ✅");
      }

      setForm({
        patient_id: "",
        diagnosis: "",
        treatment: ""
      });

      setEditId(null);
      loadVisits();

    } catch (err) {
      console.log("Save error", err);
      alert("Error ❌");
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (v) => {
    setForm({
      patient_id: v.patient_id,
      diagnosis: v.diagnosis,
      treatment: v.treatment
    });

    setEditId(v._id);
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    try {
      await api.delete("/visits/" + id);
      alert("Deleted 🗑️");
      loadVisits();
    } catch (err) {
      console.log("Delete error", err);
    }
  };

  // =========================
  // GET PATIENT NAME
  // =========================
  const getPatientName = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? p.name : "Unknown";
  };

  return (
    <div style={{ padding: 20 }}>

      {/* BACK */}
      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>

      <h1>Patient Visits Module 🩺</h1>

      <hr />

      {/* FORM */}
      <h3>{editId ? "Edit Visit" : "Add Visit"}</h3>

      <select
        name="patient_id"
        value={form.patient_id}
        onChange={handleChange}
      >
        <option value="">Select Patient</option>
        {patients.map(p => (
          <option key={p._id} value={p._id}>
            {p.name} ({p.phone})
          </option>
        ))}
      </select>

      <br /><br />

      <input
        name="diagnosis"
        value={form.diagnosis}
        onChange={handleChange}
        placeholder="Diagnosis"
      />

      <br /><br />

      <input
        name="treatment"
        value={form.treatment}
        onChange={handleChange}
        placeholder="Treatment"
      />

      <br /><br />

      <button onClick={saveVisit}>
        {editId ? "Update Visit" : "Add Visit"}
      </button>

      {editId && (
        <button
          style={{ marginLeft: 10 }}
          onClick={() => {
            setEditId(null);
            setForm({
              patient_id: "",
              diagnosis: "",
              treatment: ""
            });
          }}
        >
          Cancel
        </button>
      )}

      <hr />

      {/* VISITS LIST */}
      <h2>Saved Visits</h2>

      {visits.length === 0 && <p>No visits yet</p>}

      {visits.map((v) => (
        <div key={v._id} style={{
          background: "#f1f5f9",
          padding: 12,
          marginBottom: 10,
          borderRadius: 8
        }}>
          <b>Patient:</b> {getPatientName(v.patient_id)} <br />
          <b>Diagnosis:</b> {v.diagnosis} <br />
          <b>Treatment:</b> {v.treatment} <br />
          <small>{new Date(v.created_at).toLocaleString()}</small>

          <br /><br />

          <button onClick={() => handleEdit(v)}>Edit ✏️</button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => handleDelete(v._id)}
          >
            Delete 🗑️
          </button>
        </div>
      ))}

    </div>
  );
}

export default Visits;