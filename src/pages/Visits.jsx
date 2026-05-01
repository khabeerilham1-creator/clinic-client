import React, { useState } from "react";
import api from "../api";   // ✅ FIXED

function Visits() {

  const [name, setName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  const addVisit = async () => {
    try {
      await api.post("/visits", {   // ✅ FIXED
        patient_name: name,
        diagnosis,
        treatment,
        medicines: "",
        fee: 0
      });

      alert("Visit added ✅");

      // optional reset
      setName("");
      setDiagnosis("");
      setTreatment("");

    } catch (err) {
      console.log("VISIT ERROR:", err.response?.data || err);
      alert("Failed ❌");
    }
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
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        placeholder="Diagnosis"
        value={diagnosis}
        onChange={e => setDiagnosis(e.target.value)}
      />

      <input
        placeholder="Treatment"
        value={treatment}
        onChange={e => setTreatment(e.target.value)}
      />

      <br/><br/>

      <button onClick={addVisit}>Add Visit</button>

    </div>
  );
}

export default Visits;