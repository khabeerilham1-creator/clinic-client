import React, { useState } from "react";
import axios from "axios";

function Visits() {

  const BASE_URL = "https://https://pis-backend-final-1.onrender.com/api/api.onrender.com";

  const [name, setName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  const addVisit = async () => {
    await axios.post(`${BASE_URL}/visits`, {
      patient_name: name,
      diagnosis,
      treatment,
      medicines: "",
      fee: 0
    });

    alert("Visit added ✅");
  };

  return (
    <div style={{ padding: "20px" }}>

      <h2>Patient Visits Module 🩺</h2>

      <p>
        Record patient visits, diagnoses, and treatments for clinical tracking
        and history management.
      </p>

      <input
        placeholder="Patient Name"
        onChange={e => setName(e.target.value)}
      />

      <input
        placeholder="Diagnosis"
        onChange={e => setDiagnosis(e.target.value)}
      />

      <input
        placeholder="Treatment"
        onChange={e => setTreatment(e.target.value)}
      />

      <br/><br/>

      <button onClick={addVisit}>Add Visit</button>

    </div>
  );
}

export default Visits;