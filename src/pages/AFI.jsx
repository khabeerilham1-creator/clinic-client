import React, { useState, useEffect } from "react";
import axios from "axios";
import PatientSelect from "../components/PatientSelect";

function AFI() {

  // ✅ fixed URL
  const BASE_URL = "https://pis-backend-final-1.onrender.com"https://pis-backend-final-1.onrender.com/api"";

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
    load();
  }, []);

  const load = async () => {
    try {
      await axios.get(`${BASE_URL}/appointments`);
      // ❌ removed setList (unused)
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
      await axios.post(`${BASE_URL}/appointments`, {
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

      <h1>APPOINTMENT & FLOW INTELLIGENCE (AFI) ✅</h1>

      <p>
        This module manages appointment scheduling, patient flow tracking,
        delays, and clinic efficiency analysis.
      </p>

      {/* ✅ fixed prop */}
      <PatientSelect onChange={setPatient} />

      <h3>1. Smart Scheduling</h3>

      <input placeholder="Doctor Name"
        onChange={e => setData({ ...data, doctor: e.target.value })} />

      <input placeholder="Chair Allocation"
        onChange={e => setData({ ...data, chair: e.target.value })} />

      <input placeholder="Procedure Type"
        onChange={e => setData({ ...data, procedure: e.target.value })} />

      <input type="date"
        onChange={e => setData({ ...data, appointment_date: e.target.value })} />

      <input type="time"
        onChange={e => setData({ ...data, appointment_time: e.target.value })} />

      <h3>2. Patient Flow Tracking</h3>

      <input type="time"
        onChange={e => setData({ ...data, arrival_time: e.target.value })} />

      <input type="time"
        onChange={e => setData({ ...data, chair_entry: e.target.value })} />

      <input type="time"
        onChange={e => setData({ ...data, exit_time: e.target.value })} />

      <h3>3. Delay Intelligence</h3>

      <input placeholder="Doctor Delay (minutes)"
        onChange={e => setData({ ...data, doctor_delay: e.target.value })} />

      <input placeholder="Patient Delay (minutes)"
        onChange={e => setData({ ...data, patient_delay: e.target.value })} />

      <h3>4. Reminder System</h3>
      <p>SMS / WhatsApp integration (coming soon)</p>

      <button onClick={save}>Save Appointment</button>

    </div>
  );
}

export default AFI;