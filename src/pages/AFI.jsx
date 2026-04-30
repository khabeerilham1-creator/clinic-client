import React, { useState, useEffect } from "react";
import axios from "axios";
import PatientSelect from "../components/PatientSelect";

function AFI() {
  const BASE_URL = "https://pis-backend-final-1.onrender.com";

  const [patient, setPatient] = useState(null);

  const [data, setData] = useState({
    doctor: "",
    chair: "",
    procedure: ""
  });

  const save = async () => {
    if (!patient) return alert("Select patient");

    try {
      await axios.post(BASE_URL + "/appointments", {
        ...data,
        patient: patient?.patient_no || ""
      });

      alert("Saved");
    } catch (err) {
      console.log(err);
      alert("Error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AFI</h1>

      {/* SAFE */}
      <PatientSelect onSelect={(p) => setPatient(p)} />

      <input placeholder="Doctor" onChange={e => setData({ ...data, doctor: e.target.value })}/>
      <input placeholder="Chair" onChange={e => setData({ ...data, chair: e.target.value })}/>
      <input placeholder="Procedure" onChange={e => setData({ ...data, procedure: e.target.value })}/>

      <button onClick={save}>Save</button>
    </div>
  );
}

export default AFI;