import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import PatientList from "../components/PatientList";

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
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>

      <h1>APPOINTMENT & FLOW INTELLIGENCE (AFI)</h1>

      <input name="patient_name" value={data.patient_name} placeholder="Patient" onChange={handleChange}/>

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

      <PatientList onSelect={(p)=>setData({...data, patient_name:p.name})} />
    </div>
  );
}

export default AFI;