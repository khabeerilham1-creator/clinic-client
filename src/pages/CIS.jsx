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

      // reset form
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
    <div style={{ padding: 20 }}>
      <h1>CLINICAL INTELLIGENCE SYSTEM (CIS)</h1>

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

      <button onClick={save}>Save</button>
    </div>
  );
}

export default CIS;