import React, { useState } from "react";
import axios from "axios";

const BASE_URL = "https://pis-backend-final-1.onrender.com";

function CIS() {

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
    try {
      const data = new FormData();

      Object.keys(form).forEach(k => data.append(k, form[k]));
      if (file) data.append("photo", file);

      await axios.post(BASE_URL + "/cis", data);

      alert("Saved ✅");

    } catch {
      alert("Error ❌");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>CLINICAL INTELLIGENCE SYSTEM (CIS)</h1>

      {/* TREATMENT */}
      <h3>Treatment Planning</h3>
      <input name="treatment_plan" placeholder="Plan" onChange={handleChange}/>
      <input name="cost" placeholder="Cost" onChange={handleChange}/>
      <input name="timeline" placeholder="Timeline" onChange={handleChange}/>

      {/* NOTES */}
      <h3>Procedure Notes</h3>
      <input name="notes" placeholder="Notes" onChange={handleChange}/>
      <input name="materials" placeholder="Materials" onChange={handleChange}/>
      <input name="anesthesia" placeholder="Anesthesia" onChange={handleChange}/>

      {/* PHOTO */}
      <h3>Case Photography</h3>
      <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>

      {/* FOLLOWUP */}
      <h3>Follow-up</h3>
      <input name="followup" placeholder="Follow-up" onChange={handleChange}/>
      <input name="healing" placeholder="Healing" onChange={handleChange}/>

      <button onClick={save}>Save</button>
    </div>
  );
}

export default CIS;