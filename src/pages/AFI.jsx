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
    waiting_time: "",
    chair_entry: "",
    exit_time: "",
    doctor_delay: "",
    patient_delay: "",
    bottleneck: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
    load();
  }, [navigate]);

  const load = async () => {
    try {
      await axios.get(BASE_URL + "/appointments");
    } catch (err) {
      console.error("Error loading appointments:", err);
    }
  };

  const save = async () => {
    if (!patient) {
      alert("Select patient first ❗");
      return;
    }

    try {
      await axios.post(BASE_URL + "/appointments", {
        ...data,
        patient: patient.patient_no
      });

      alert("Appointment Saved ✅");
      load();

    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>AFI Module</h1>

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

      <h3>Smart Scheduling</h3>
      <input placeholder="Doctor" onChange={e => setData({ ...data, doctor: e.target.value })}/>
      <input placeholder="Chair" onChange={e => setData({ ...data, chair: e.target.value })}/>
      <input placeholder="Procedure" onChange={e => setData({ ...data, procedure: e.target.value })}/>
      <input type="date" onChange={e => setData({ ...data, appointment_date: e.target.value })}/>
      <input type="time" onChange={e => setData({ ...data, appointment_time: e.target.value })}/>

      <h3>Flow Tracking</h3>
      <input type="time" onChange={e => setData({ ...data, arrival_time: e.target.value })}/>
      <input type="time" onChange={e => setData({ ...data, chair_entry: e.target.value })}/>
      <input type="time" onChange={e => setData({ ...data, exit_time: e.target.value })}/>

      <h3>Delay</h3>
      <input placeholder="Doctor Delay" onChange={e => setData({ ...data, doctor_delay: e.target.value })}/>
      <input placeholder="Patient Delay" onChange={e => setData({ ...data, patient_delay: e.target.value })}/>

      <br/><br/>
      <button onClick={save}>Save Appointment</button>

    </div>
  );
}

export default AFI;