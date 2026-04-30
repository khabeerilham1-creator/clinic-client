/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://pis-backend-final-1.onrender.com";

const conditionsMap = {
  Caries: "Filling",
  Missing: "Implant",
  Fracture: "Crown",
  Infection: "RCT",
  Healthy: "None"
};

const complaintsList = [
  "Tooth Pain",
  "Sensitivity",
  "Bleeding Gums",
  "Swelling",
  "Routine Checkup"
];

function Checkup() {

  const [patients, setPatients] = useState([]);
  const [checkups, setCheckups] = useState([]);

  const [patientId, setPatientId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [tasks, setTasks] = useState([]);

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadPatients();
    loadCheckups();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/patients`);
      setPatients(res.data);
    } catch (err) {
      console.error("Patients load error:", err);
    }
  };

  const loadCheckups = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/checkup`); // ✅ FIXED
      setCheckups(res.data);
    } catch (err) {
      console.error("Checkups load error:", err);
    }
  };

  // ================= SELECT TOOTH =================
  const selectTooth = (tooth) => {
    if (!tasks.find(t => t.tooth === tooth)) {
      setTasks([...tasks, { tooth, condition: "", treatment: "" }]);
    }
  };

  // ================= REMOVE =================
  const removeTooth = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // ================= CONDITION =================
  const updateCondition = (index, condition) => {
    const updated = [...tasks];
    updated[index].condition = condition;
    updated[index].treatment = conditionsMap[condition] || "";
    setTasks(updated);
  };

  // ================= SAVE =================
  const saveCheckup = async () => {
    try {

      if (!patientId) return alert("Select patient ❗");
      if (!tasks.length) return alert("Select at least one tooth ❗");

      const payload = { patient: patientId, complaint, tasks };

      if (editId) {
        await axios.put(`${BASE_URL}/checkup/${editId}`, payload); // ✅ FIXED
        setEditId(null);
      } else {
        await axios.post(`${BASE_URL}/checkup`, payload); // ✅ FIXED
      }

      alert("Saved ✅");

      setTasks([]);
      setComplaint("");
      loadCheckups();

    } catch (err) {
      console.log(err.response?.data || err);
      alert("Error ❌");
    }
  };

  const editCheckup = (c) => {
    setPatientId(c.patient_id);
    setComplaint(c.complaint);
    setTasks(c.tasks || []);
    setEditId(c._id);
  };

  const deleteCheckup = async (id) => {
    if (!window.confirm("Delete?")) return;
    await axios.delete(`${BASE_URL}/checkup/${id}`); // ✅ FIXED
    loadCheckups();
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>Checkup Module ✅</h1>

      <p>
        This module records dental conditions, treatments, and patient complaints
        using an interactive tooth chart.
      </p>

      {/* PATIENT */}
      <select value={patientId} onChange={(e)=>setPatientId(e.target.value)}>
        <option value="">Select Patient</option>
        {patients.map(p => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>

      <br/><br/>

      {/* COMPLAINT */}
      <select value={complaint} onChange={(e)=>setComplaint(e.target.value)}>
        <option value="">Chief Complaint</option>
        {complaintsList.map(c => <option key={c}>{c}</option>)}
      </select>

      <br/><br/>

      {/* DENTAL CHART */}
      <img
        src="/teeth.png"
        alt="Dental Chart"
        useMap="#teethmap"
        style={{ width: "700px" }}
      />

      <map name="teethmap">
        <area coords="10,20,60,80" onClick={()=>selectTooth(1)} />
        <area coords="60,20,110,80" onClick={()=>selectTooth(2)} />
        <area coords="110,20,160,80" onClick={()=>selectTooth(3)} />
        <area coords="160,20,210,80" onClick={()=>selectTooth(4)} />
        <area coords="10,100,60,170" onClick={()=>selectTooth(32)} />
      </map>

      <br/><br/>

      {/* SELECTED */}
      <h3>Selected Teeth</h3>

      {tasks.map((t, i) => (
        <div key={i}>
          Tooth {t.tooth}

          <select
            value={t.condition}
            onChange={(e)=>updateCondition(i, e.target.value)}
          >
            <option value="">Condition</option>
            <option>Caries</option>
            <option>Missing</option>
            <option>Fracture</option>
            <option>Infection</option>
          </select>

          <input value={t.treatment} readOnly />

          <button onClick={()=>removeTooth(i)}>X</button>
        </div>
      ))}

      <br/>

      <button onClick={saveCheckup}>
        {editId ? "Update" : "Save"}
      </button>

      <hr/>

      {/* SAVED */}
      <h2>Saved Checkups</h2>

      {checkups.map(c => (
        <div key={c._id} style={{ border:"1px solid", padding:"10px", margin:"10px" }}>
          <b>{c.complaint}</b>

          {c.tasks?.map((t,i)=>(
            <div key={i}>
              Tooth {t.tooth} → {t.condition}
            </div>
          ))}

          <button onClick={()=>editCheckup(c)}>Edit</button>
          <button onClick={()=>deleteCheckup(c._id)}>Delete</button>
        </div>
      ))}

    </div>
  );
}

export default Checkup;