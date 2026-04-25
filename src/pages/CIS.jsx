import React, { useState } from "react";
import axios from "axios";
import PatientSelect from "../components/PatientSelect";

function CIS() {

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

    if (!patient) return alert("Select patient first");

    const data = new FormData();

    data.append("patient_id", patient._id);

    Object.keys(form).forEach(key => {
      data.append(key, form[key]);
    });

    if (file) data.append("photo", file);

    await axios.post("http://127.0.0.1:8000/cis", data);

    alert("Saved ✅");
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>CIS</h1>

      {/* 🔥 PATIENT SELECT */}
      <PatientSelect onSelect={setPatient} />

      {patient && <p>Selected: {patient.name}</p>}

      <h3>1. Treatment Planning</h3>
      <input name="treatment_plan" placeholder="Multi-phase plans" onChange={handleChange} />
      <input name="cost" placeholder="Cost integration" onChange={handleChange} />
      <input name="timeline" placeholder="Timeline mapping" onChange={handleChange} />

      <h3>2. Procedure Notes</h3>
      <input name="notes" placeholder="Chairside notes" onChange={handleChange} />
      <input name="materials" placeholder="Materials used" onChange={handleChange} />
      <input name="anesthesia" placeholder="Anesthesia logs" onChange={handleChange} />

      <h3>3. Case Photography</h3>
      <input type="file" onChange={(e)=>setFile(e.target.files[0])} />

      <h3>4. Follow-up Protocols</h3>
      <input name="followup" placeholder="Review reminders" onChange={handleChange} />
      <input name="healing" placeholder="Healing tracking" onChange={handleChange} />

      <br/><br/>

      <button onClick={save}>Save</button>

    </div>
  );
}

export default CIS;