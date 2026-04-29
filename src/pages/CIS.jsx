import React, { useState } from "react";
import axios from "axios";
import PatientSelect from "../components/PatientSelect";

function CIS() {

  const BASE_URL = "https://https://pis-backend-final-1.onrender.com/api/api.onrender.com";

  const [patient, setPatient] = useState(null);

  const [form, setForm] = useState({
    treatment_plan: "",
    cost: "",
    timeline: "",
    notes: "",
    materials: "",
    anesthesia: "",
    followup: "",
    healing: ""
  });

  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async () => {

    if (!patient) {
      alert("Select patient first ❗");
      return;
    }

    try {
      const data = new FormData();

      data.append("patient_id", patient._id);

      Object.keys(form).forEach(key => {
        data.append(key, form[key]);
      });

      if (file) data.append("photo", file);

      await axios.post(`${BASE_URL}/cis`, data);

      alert("Saved ✅");

    } catch (err) {
      console.error("Save error:", err);
      alert("Error ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>CLINICAL INFORMATION SYSTEM (CIS) ✅</h1>

      <p>
        This module manages treatment planning, procedure notes,
        case documentation, and follow-up tracking.
      </p>

      {/* PATIENT SELECT */}
      <PatientSelect onSelect={setPatient} />

      {patient && <p><strong>Selected Patient:</strong> {patient.name}</p>}

      <h3>1. Treatment Planning</h3>
      <input name="treatment_plan" placeholder="Treatment Plan" onChange={handleChange} />
      <input name="cost" placeholder="Cost Estimate" onChange={handleChange} />
      <input name="timeline" placeholder="Timeline" onChange={handleChange} />

      <h3>2. Procedure Notes</h3>
      <input name="notes" placeholder="Clinical Notes" onChange={handleChange} />
      <input name="materials" placeholder="Materials Used" onChange={handleChange} />
      <input name="anesthesia" placeholder="Anesthesia Details" onChange={handleChange} />

      <h3>3. Case Photography</h3>
      <input type="file" onChange={(e)=>setFile(e.target.files[0])} />

      <h3>4. Follow-up Protocols</h3>
      <input name="followup" placeholder="Follow-up Plan" onChange={handleChange} />
      <input name="healing" placeholder="Healing Progress" onChange={handleChange} />

      <br/><br/>

      <button onClick={save}>Save Case</button>

    </div>
  );
}

export default CIS;