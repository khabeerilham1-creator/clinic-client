import React, { useState } from "react";
import axios from "axios";
import PatientSelect from "../components/PatientSelect";

function FIS() {
  const BASE_URL = "https://pis-backend-final-1.onrender.com";

  const [patient, setPatient] = useState(null);

  const [data, setData] = useState({
    procedure: "",
    qty: "",
    rate: ""
  });

  const [total, setTotal] = useState(0);

  const handleChange = (e) => {
    const newData = { ...data, [e.target.name]: e.target.value };
    setData(newData);

    const t = (Number(newData.qty) || 0) * (Number(newData.rate) || 0);
    setTotal(t);
  };

  const save = async () => {
    if (!patient) return alert("Select patient");

    try {
      await axios.post(BASE_URL + "/invoice", {
        ...data,
        patient: patient?.patient_no || "",
        total
      });

      alert("Saved");
    } catch (err) {
      console.log(err);
      alert("Error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>FIS</h1>

      <PatientSelect onSelect={(p) => setPatient(p)} />

      <input name="procedure" onChange={handleChange}/>
      <input name="qty" onChange={handleChange}/>
      <input name="rate" onChange={handleChange}/>

      <h3>Total: {total}</h3>

      <button onClick={save}>Save</button>
    </div>
  );
}

export default FIS;