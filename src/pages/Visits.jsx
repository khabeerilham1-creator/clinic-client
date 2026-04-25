import React, { useState } from "react";
import axios from "axios";

function Visits() {

  const [name, setName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  const addVisit = async () => {
    await axios.post("http://127.0.0.1:8000/visits", {
      patient_name: name,
      diagnosis,
      treatment,
      medicines: "",
      fee: 0
    });

    alert("Visit added");
  };

  return (
    <div style={{ padding: "20px" }}>

      <h2>Visits</h2>

      <input placeholder="Patient Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Diagnosis" onChange={e => setDiagnosis(e.target.value)} />
      <input placeholder="Treatment" onChange={e => setTreatment(e.target.value)} />

      <button onClick={addVisit}>Add Visit</button>

    </div>
  );
}

export default Visits;