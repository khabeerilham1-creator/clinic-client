import React, { useState } from "react";
import axios from "axios";
import PatientSelect from "../components/PatientSelect";

function CIS() {
  const BASE_URL = "https://pis-backend-final-1.onrender.com";

  const [patient, setPatient] = useState(null);

  const [form, setForm] = useState({
    treatment_plan: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async () => {
    if (!patient) return alert("Select patient");

    try {
      await axios.post(BASE_URL + "/cis", {
        ...form,
        patient_id: patient?._id || ""
      });

      alert("Saved");
    } catch (err) {
      console.log(err);
      alert("Error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>CIS</h1>

      <PatientSelect onSelect={(p) => setPatient(p)} />

      <input name="treatment_plan" onChange={handleChange}/>

      <button onClick={save}>Save</button>
    </div>
  );
}

export default CIS;