import React, { useState } from "react";
import axios from "axios";

const BASE_URL = "https://pis-backend-final-1.onrender.com";

function CIS() {

  const [form, setForm] = useState({
    patient_id: "",
    diagnosis: "",
    treatment: "",
    notes: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        BASE_URL + "/cis/",
        {
          patient_id: form.patient_id,
          diagnosis: form.diagnosis,
          treatment: form.treatment,
          notes: form.notes
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      alert("CIS Saved ✅");

      setForm({
        patient_id: "",
        diagnosis: "",
        treatment: "",
        notes: ""
      });

    } catch (err) {
      console.log("CIS ERROR:", err.response?.data || err);
      alert("Error ❌");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>

      {/* SIDEBAR */}
      <div style={{
        width: "220px",
        background: "#111827",
        color: "white",
        padding: "20px"
      }}>
        <h2 style={{ marginBottom: 30 }}>Clinic SaaS</h2>

        <div style={{ cursor: "pointer", marginBottom: 15 }}>
          🏠 Dashboard
        </div>

        <div style={{ cursor: "pointer", marginBottom: 15, color: "#60a5fa" }}>
          🧠 CIS Module
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "30px" }}>

        {/* HEADER */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}>
          <h1 style={{ margin: 0 }}>
            CLINICAL INTELLIGENCE SYSTEM (CIS)
          </h1>
        </div>

        {/* CARD */}
        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
        }}>

          {/* PATIENT CORE */}
          <h3>Patient Clinical Data</h3>

          <input
            name="patient_id"
            placeholder="Patient ID"
            value={form.patient_id}
            onChange={handleChange}
          /><br/><br/>

          <input
            name="diagnosis"
            placeholder="Diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
          /><br/><br/>

          <input
            name="treatment"
            placeholder="Treatment"
            value={form.treatment}
            onChange={handleChange}
          /><br/><br/>

          <input
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
          /><br/><br/>

          {/* ---------------------- */}
          {/* 1. TREATMENT PLANNING */}
          {/* ---------------------- */}
          <h3>🧾 Treatment Planning</h3>

          <input placeholder="Phase 1 (e.g Scaling)" /><br/><br/>
          <input placeholder="Phase 2 (e.g RCT)" /><br/><br/>
          <input placeholder="Total Cost" /><br/><br/>
          <input type="date" placeholder="Start Date" /><br/><br/>

          {/* ---------------------- */}
          {/* 2. PROCEDURE NOTES */}
          {/* ---------------------- */}
          <h3>🪥 Procedure Notes</h3>

          <input placeholder="Chairside Notes" /><br/><br/>
          <input placeholder="Materials Used" /><br/><br/>
          <input placeholder="Anesthesia Details" /><br/><br/>

          {/* ---------------------- */}
          {/* 3. CASE PHOTOGRAPHY */}
          {/* ---------------------- */}
          <h3>📸 Case Photography</h3>

          <input type="file" /><br/><br/>
          <small>Before / During / After</small><br/><br/>

          {/* ---------------------- */}
          {/* 4. FOLLOW-UP */}
          {/* ---------------------- */}
          <h3>🔁 Follow-up Protocols</h3>

          <input type="date" placeholder="Next Visit" /><br/><br/>
          <input placeholder="Healing Notes" /><br/><br/>

          <br/>
          <button onClick={save}>Save</button>

        </div>
      </div>
    </div>
  );
}

export default CIS;