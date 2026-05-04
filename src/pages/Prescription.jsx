import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Prescription() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: ""
  });

  const [meds, setMeds] = useState([
    { name: "", dosage: "", duration: "" }
  ]);

  const [notes, setNotes] = useState("");

  // 🔥 NEW STATE (LIST)
  const [list, setList] = useState([]);

  // =========================
  // LOAD PRESCRIPTIONS
  // =========================
  const load = async () => {
    try {
      const res = await api.get("/prescription/");
      setList(res.data || []);
    } catch {
      console.log("LOAD ERROR");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateMed = (i, field, value) => {
    const updated = [...meds];
    updated[i][field] = value;
    setMeds(updated);
  };

  const addMed = () => {
    setMeds([...meds, { name: "", dosage: "", duration: "" }]);
  };

  const deleteMed = (index) => {
    const updated = meds.filter((_, i) => i !== index);
    setMeds(updated);
  };

  // =========================
  // SAVE
  // =========================
  const save = async () => {
    try {
      await api.post("/prescription/", {
        ...form,
        medicines: meds,
        notes
      });

      alert("Saved ✅");
      load(); // 🔥 refresh list

    } catch {
      alert("Error ❌");
    }
  };

  // =========================
  // DELETE PRESCRIPTION
  // =========================
  const deletePrescription = async (id) => {
    try {
      await api.delete("/prescription/" + id);
      load();
    } catch {
      alert("Delete failed ❌");
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>

      <h1>Prescription Module 💊</h1>

      {/* ========================= */}
      {/* FORM */}
      {/* ========================= */}

      <h3>Patient Info</h3>

      <input name="name" placeholder="Name" onChange={handleChange} /><br/><br/>
      <input name="phone" placeholder="Phone" onChange={handleChange} /><br/><br/>
      <input type="date" name="date" onChange={handleChange} /><br/><br/>

      <h3>Medicines</h3>

      {meds.map((m, i) => (
        <div key={i}>
          <input placeholder="Medicine"
            onChange={(e)=>updateMed(i, "name", e.target.value)} />

          <input placeholder="Dosage"
            onChange={(e)=>updateMed(i, "dosage", e.target.value)} />

          <input placeholder="Duration"
            onChange={(e)=>updateMed(i, "duration", e.target.value)} />

          <button onClick={() => deleteMed(i)}>❌</button>

          <br/><br/>
        </div>
      ))}

      <button onClick={addMed}>+ Add Medicine</button>

      <h3>Notes</h3>
      <textarea onChange={(e)=>setNotes(e.target.value)} />

      <br/><br/>

      <button onClick={save}>Save</button>

      <hr />

      {/* ========================= */}
      {/* 🔥 SAVED LIST */}
      {/* ========================= */}

      <h2>Saved Prescriptions 📄</h2>

      {list.map((p) => (
        <div key={p._id} style={{ marginBottom: 10 }}>
          <b>{p.name}</b> - {p.phone}

          {/* VIEW PDF */}
          <a
            href={`https://pis-backend-final-1.onrender.com/prescription/pdf/${encodeURIComponent(p.name)}`}
            target="_blank"
            rel="noreferrer"
          >
            <button style={{ marginLeft: 5 }}>PDF</button>
          </a>

          {/* DELETE */}
          <button
            onClick={() => deletePrescription(p._id)}
            style={{ marginLeft: 5, background: "red", color: "white" }}
          >
            Delete
          </button>
        </div>
      ))}

    </div>
  );
}

export default Prescription;