/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";   // 🔥 ADDED

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

  const navigate = useNavigate();   // 🔥 ADDED

  const [patients, setPatients] = useState([]);
  const [checkups, setCheckups] = useState([]);

  const [patientId, setPatientId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [tasks, setTasks] = useState([]);

  const [editId, setEditId] = useState(null);

  const [ai, setAi] = useState({});

  useEffect(() => {
    loadPatients();
    loadCheckups();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCheckups = async () => {
    try {
      const res = await api.get("/checkups/");
      setCheckups(res.data);
    } catch (err) {
      console.error("Checkups load error:", err);
    }
  };

  const selectTooth = (tooth) => {
    if (!tasks.find(t => t.tooth === tooth)) {
      setTasks([...tasks, { tooth, condition: "", treatment: "" }]);
    }
  };

  const removeTooth = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateCondition = (index, condition) => {
    const updated = [...tasks];
    updated[index].condition = condition;
    updated[index].treatment = conditionsMap[condition] || "";
    setTasks(updated);
  };

  const saveCheckup = async () => {
    try {

      if (!patientId) return alert("Select patient ❗");
      if (!tasks.length) return alert("Select at least one tooth ❗");

      const payload = {
        patient: patientId,
        patient_id: patientId,
        complaint,
        tasks
      };

      if (editId) {
        await api.put("/checkups/" + editId, payload);
        setEditId(null);
      } else {
        await api.post("/checkups/", payload);
      }

      alert("Saved ✅");

      setTasks([]);
      setComplaint("");
      setPatientId("");

      loadCheckups();

    } catch (err) {
      console.log(err.response?.data || err);
      alert("Error ❌");
    }
  };

  const editCheckup = (c) => {
    setPatientId(c.patient);
    setComplaint(c.complaint);
    setTasks(c.tasks || []);
    setEditId(c._id);
  };

  const deleteCheckup = async (id) => {
    if (!window.confirm("Delete?")) return;
    await api.delete("/checkups/" + id);
    loadCheckups();
  };

  const getPatientName = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? p.name : "Unknown";
  };

  return (
    <div style={{ padding: "20px" }}>

      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>

      <h1>Checkup Module</h1>

      <select value={patientId} onChange={(e)=>setPatientId(e.target.value)}>
        <option value="">Select Patient</option>
        {patients.map(p => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>

      <br/><br/>

      <select value={complaint} onChange={(e)=>setComplaint(e.target.value)}>
        <option value="">Chief Complaint</option>
        {complaintsList.map(c => <option key={c}>{c}</option>)}
      </select>

      <br/><br/>

      {/* 🔥 YOUR ORIGINAL IMAGE (UNCHANGED) */}
      <div style={{ position: "relative", width: "700px" }}>
        <img src="/teeth.png" useMap="#teethmap" style={{ width: "700px" }}/>

        {/* 🔥 ADDED: CLICKABLE GRID OVERLAY */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "700px",
          height: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gridTemplateRows: "repeat(4, 1fr)",
          gap: "4px"
        }}>
          {Array.from({ length: 32 }, (_, i) => i + 1).map(t => (
            <div
              key={t}
              onClick={() => selectTooth(t)}
              style={{
                cursor: "pointer",
                background: tasks.find(x => x.tooth === t)
                  ? "#22c55e88"
                  : "transparent",
                borderRadius: "4px"
              }}
            />
          ))}
        </div>
      </div>

      {/* 🔥 YOUR ORIGINAL MAP (UNCHANGED) */}
      <map name="teethmap">
        <area coords="10,20,60,80" onClick={()=>selectTooth(1)} />
        <area coords="60,20,110,80" onClick={()=>selectTooth(2)} />
      </map>

      <h3>Selected Teeth</h3>

      {tasks.map((t, i) => (
        <div key={i}>
          Tooth {t.tooth}
          <select value={t.condition} onChange={(e)=>updateCondition(i, e.target.value)}>
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

      <button onClick={async () => {
        try {
          const res = await api.post("/ai/suggest", {
            diagnosis: complaint,
            complaints: complaint
          });
          setAi(res.data);
        } catch (e) {
          alert("AI Error ❌");
        }
      }}>
        AI Suggest 🤖
      </button>

      <br/><br/>

      <button onClick={saveCheckup}>
        {editId ? "Update" : "Save"}
      </button>

      <h3>AI Suggestions 🤖</h3>

      <h4>Diagnosis</h4>
      {ai.diagnosis_suggestions?.map((x, i) => (
        <div key={i}>👉 {x}</div>
      ))}

      <h4>Medicines</h4>
      {ai.medications?.map((x, i) => (
        <div key={i}>💊 {x}</div>
      ))}

      <h4>Investigations</h4>
      {ai.investigations?.map((x, i) => (
        <div key={i}>🧪 {x}</div>
      ))}

      <h4 style={{ color: "red" }}>Red Flags</h4>
      {ai.red_flags?.map((x, i) => (
        <div key={i}>⚠️ {x}</div>
      ))}

      <hr/>

      <h2>Checkup List</h2>

      {checkups.map(c => (
        <div key={c._id} style={{
          border: "1px solid gray",
          padding: "10px",
          marginBottom: "10px"
        }}>
          <h3>{getPatientName(c.patient)}</h3>
          <p><strong>Complaint:</strong> {c.complaint}</p>

          {c.tasks && c.tasks.map((t, i) => (
            <p key={i}>
              Tooth {t.tooth} — {t.condition} → {t.treatment}
            </p>
          ))}

          <button onClick={()=>editCheckup(c)}>Edit</button>
          <button onClick={()=>deleteCheckup(c._id)}>Delete</button>
        </div>
      ))}

    </div>
  );
}

export default Checkup;