import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import PatientList from "../components/PatientList";

// 🔥 ADD THIS
import Layout from "../components/Layout";

function AFI() {

  const navigate = useNavigate();

  const [data, setData] = useState({
    doctor: "",
    chair: "",
    procedure: "",
    appointment_date: "",
    appointment_time: "",
    arrival_time: "",
    chair_entry: "",
    exit_time: "",
    doctor_delay: "",
    patient_delay: "",
    patient_name: ""
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const save = async () => {
    try {
      await api.post("/afi/", data);
      alert("Saved ✅");
    } catch (err) {
      console.log("AFI ERROR:", err.response?.data || err);
      alert("Error ❌");
    }
  };

  return (

    // 🔥 WRAPPED IN LAYOUT
    <Layout>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>
        <h1 style={{ margin: 0 }}>APPOINTMENT & FLOW INTELLIGENCE</h1>
        <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
      </div>

      {/* CARD */}
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
      }}>

        <input
          name="patient_name"
          value={data.patient_name}
          placeholder="Patient"
          onChange={handleChange}
        />

        <h3>Smart Scheduling</h3>

        <input name="doctor" value={data.doctor} placeholder="Doctor" onChange={handleChange}/>
        <input name="chair" value={data.chair} placeholder="Chair" onChange={handleChange}/>
        <input name="procedure" value={data.procedure} placeholder="Procedure" onChange={handleChange}/>
        <input type="date" name="appointment_date" value={data.appointment_date} onChange={handleChange}/>
        <input type="time" name="appointment_time" value={data.appointment_time} onChange={handleChange}/>

        <h3>Patient Flow</h3>

        <input type="time" name="arrival_time" value={data.arrival_time} onChange={handleChange}/>
        <input type="time" name="chair_entry" value={data.chair_entry} onChange={handleChange}/>
        <input type="time" name="exit_time" value={data.exit_time} onChange={handleChange}/>

        <h3>Delay</h3>

        <input name="doctor_delay" value={data.doctor_delay} placeholder="Doctor Delay" onChange={handleChange}/>
        <input name="patient_delay" value={data.patient_delay} placeholder="Patient Delay" onChange={handleChange}/>

        <br/><br/>

        <button onClick={save}>Save</button>

        <hr/>

        {/* 🔥 Patient Selector */}
        <PatientList onSelect={(p)=>setData({...data, patient_name:p.name})} />

      </div>

    </Layout>
  );
}

export default AFI;