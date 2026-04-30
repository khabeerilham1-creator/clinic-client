import React, { useState, useEffect } from "react";
import axios from "axios";
import PatientSelect from "../components/PatientSelect";
import { useNavigate } from "react-router-dom";

function AFI() {
  const navigate = useNavigate();
  const BASE_URL = "https://pis-backend-final-1.onrender.com";

  const [patient, setPatient] = useState(null);

  const [data, setData] = useState({
    doctor: "",
    chair: "",
    procedure: "",
    duration: "",
    appointment_date: "",
    appointment_time: "",
    arrival_time: "",
    chair_entry: "",
    exit_time: "",
    doctor_delay: "",
    patient_delay: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  const save = async () => {
    if (!patient) return alert("Select patient");

    await axios.post(BASE_URL + "/appointments", {
      ...data,
      patient: patient.patient_no
    });

    alert("Saved");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AFI</h1>

      <PatientSelect onSelect={setPatient} />

      <input placeholder="Doctor" onChange={e => setData({ ...data, doctor: e.target.value })}/>
      <input placeholder="Chair" onChange={e => setData({ ...data, chair: e.target.value })}/>
      <input placeholder="Procedure" onChange={e => setData({ ...data, procedure: e.target.value })}/>

      <button onClick={save}>Save</button>
    </div>
  );
}

export default AFI;