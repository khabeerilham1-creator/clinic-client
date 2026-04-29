import React, { useState } from "react";
import axios from "axios";
import PatientSelect from "../components/PatientSelect";
import { useNavigate } from "react-router-dom";

function CIS() {
  const navigate = useNavigate();

  const BASE_URL = "https://pis-backend-final-1.onrender.com";

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

      await axios.post(BASE_URL + "/cis", data);

      alert("Saved ✅");

    } catch (err) {
      console.error("Save error:", err);
      alert("Error ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>CIS Module</h1>

      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>

      <button
        style={{ marginLeft: 10 }}
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
      >
        Logout
      </button>

      <hr />

      <PatientSelect onSelect={setPatient} />

      {patient && <p><b>{patient.name}</b></p>}

      <input name="treatment_plan" placeholder="Treatment Plan" onChange={handleChange}/>
      <input name="cost" placeholder="Cost" onChange={handleChange}/>
      <input name="timeline" placeholder="Timeline" onChange={handleChange}/>
      <input name="notes" placeholder="Notes" onChange={handleChange}/>
      <input name="materials" placeholder="Materials" onChange={handleChange}/>
      <input name="anesthesia" placeholder="Anesthesia" onChange={handleChange}/>

      <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>

      <input name="followup" placeholder="Follow-up" onChange={handleChange}/>
      <input name="healing" placeholder="Healing" onChange={handleChange}/>

      <br/><br/>
      <button onClick={save}>Save Case</button>

    </div>
  );
}

export default CIS;