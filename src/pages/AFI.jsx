import React, { useState } from "react";
import axios from "axios";

const BASE_URL = "https://pis-backend-final-1.onrender.com";

function AFI() {

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
    patient_delay: ""
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const save = async () => {
    try {
      await axios.post(BASE_URL + "/appointments", data);
      alert("Saved ✅");
    } catch {
      alert("Error ❌");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>APPOINTMENT & FLOW INTELLIGENCE (AFI)</h1>

      {/* SCHEDULING */}
      <h3>Smart Scheduling</h3>
      <input name="doctor" placeholder="Doctor" onChange={handleChange}/>
      <input name="chair" placeholder="Chair" onChange={handleChange}/>
      <input name="procedure" placeholder="Procedure" onChange={handleChange}/>
      <input type="date" name="appointment_date" onChange={handleChange}/>
      <input type="time" name="appointment_time" onChange={handleChange}/>

      {/* FLOW */}
      <h3>Patient Flow Tracking</h3>
      <input type="time" name="arrival_time" onChange={handleChange}/>
      <input type="time" name="chair_entry" onChange={handleChange}/>
      <input type="time" name="exit_time" onChange={handleChange}/>

      {/* DELAYS */}
      <h3>Delay Intelligence</h3>
      <input name="doctor_delay" placeholder="Doctor Delay" onChange={handleChange}/>
      <input name="patient_delay" placeholder="Patient Delay" onChange={handleChange}/>

      <button onClick={save}>Save</button>
    </div>
  );
}

export default AFI;