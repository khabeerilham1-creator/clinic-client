import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function CIS() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);

  const [form, setForm] = useState({
    patient_id: "",
    diagnosis: "",
    treatment: "",
    notes: "",

    phase1: "",
    phase2: "",
    total_cost: "",
    start_date: "",

    chair_notes: "",
    materials: "",
    anesthesia: "",

    next_visit: "",
    healing_notes: ""
  });

  const [file, setFile] = useState(null);

  // =========================
  // LOAD PATIENTS
  // =========================
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");
      setPatients(res.data || []);
    } catch {
      console.log("PATIENT LOAD ERROR");
    }
  };

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // SAVE
  // =========================
  const save = async () => {
    try {

      if (!form.patient_id) {
        alert("Select patient ❗");
        return;
      }

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (file) formData.append("image", file);

      await api.post("/cis/", formData);

      alert("CIS Saved ✅");

      setForm({
        patient_id: "",
        diagnosis: "",
        treatment: "",
        notes: "",
        phase1: "",
        phase2: "",
        total_cost: "",
        start_date: "",
        chair_notes: "",
        materials: "",
        anesthesia: "",
        next_visit: "",
        healing_notes: ""
      });

      setFile(null);

    } catch (err) {
      console.log("CIS ERROR:", err.response?.data || err);
      alert("Error ❌");
    }
  };

  return (
    <Layout>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 20
      }}>
        <h1>CLINICAL INTELLIGENCE SYSTEM (CIS)</h1>
        <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
      </div>

      {/* CARD */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
      }}>

        {/* ========================= */}
        {/* PATIENT SELECT */}
        {/* ========================= */}
        <h3>Patient</h3>

        <select name="patient_id" value={form.patient_id} onChange={handleChange}>
          <option value="">Select Patient</option>
          {patients.map(p => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.phone})
            </option>
          ))}
        </select>

        <br/><br/>

        {/* ========================= */}
        {/* CORE DATA */}
        {/* ========================= */}
        <h3>Clinical Data</h3>

        <input name="diagnosis" value={form.diagnosis} placeholder="Diagnosis" onChange={handleChange}/><br/><br/>
        <input name="treatment" value={form.treatment} placeholder="Treatment" onChange={handleChange}/><br/><br/>
        <textarea name="notes" value={form.notes} placeholder="Notes" onChange={handleChange}/><br/><br/>

        {/* ========================= */}
        {/* TREATMENT PLAN */}
        {/* ========================= */}
        <h3>🧾 Treatment Planning</h3>

        <input name="phase1" value={form.phase1} placeholder="Phase 1" onChange={handleChange}/><br/><br/>
        <input name="phase2" value={form.phase2} placeholder="Phase 2" onChange={handleChange}/><br/><br/>
        <input name="total_cost" value={form.total_cost} placeholder="Total Cost" onChange={handleChange}/><br/><br/>
        <input type="date" name="start_date" value={form.start_date} onChange={handleChange}/><br/><br/>

        {/* ========================= */}
        {/* PROCEDURE NOTES */}
        {/* ========================= */}
        <h3>🪥 Procedure Notes</h3>

        <input name="chair_notes" value={form.chair_notes} placeholder="Chairside Notes" onChange={handleChange}/><br/><br/>
        <input name="materials" value={form.materials} placeholder="Materials Used" onChange={handleChange}/><br/><br/>
        <input name="anesthesia" value={form.anesthesia} placeholder="Anesthesia" onChange={handleChange}/><br/><br/>

        {/* ========================= */}
        {/* IMAGE UPLOAD */}
        {/* ========================= */}
        <h3>📸 Case Image</h3>

        <input type="file" onChange={(e) => setFile(e.target.files[0])}/><br/><br/>

        {/* ========================= */}
        {/* FOLLOW UP */}
        {/* ========================= */}
        <h3>🔁 Follow-up</h3>

        <input type="date" name="next_visit" value={form.next_visit} onChange={handleChange}/><br/><br/>
        <input name="healing_notes" value={form.healing_notes} placeholder="Healing Notes" onChange={handleChange}/><br/><br/>

        <button onClick={save}>Save CIS</button>

      </div>

    </Layout>
  );
}

export default CIS;