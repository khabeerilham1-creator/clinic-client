import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

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
  const [list, setList] = useState([]);

  // =========================
  // LOAD DATA
  // =========================
  const load = async () => {
    try {
      const res = await api.get("/prescription/");
      setList(res.data || []);
    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // FORM HANDLING
  // =========================
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

      // RESET FORM (important)
      setForm({
        name: "",
        phone: "",
        date: ""
      });

      setMeds([{ name: "", dosage: "", duration: "" }]);
      setNotes("");

      load();

    } catch (err) {
      console.log("SAVE ERROR:", err.response?.data || err);
      alert("Error ❌");
    }
  };

  // =========================
  // DELETE
  // =========================
  const deletePrescription = async (id) => {
    try {
      await api.delete("/prescription/" + id);
      load();
    } catch (err) {
      console.log("DELETE ERROR:", err);
      alert("Delete failed ❌");
    }
  };

  return (
    <Layout>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>
        <h1 style={{ margin: 0 }}>Prescription Module 💊</h1>
        <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
      </div>

      {/* CARD */}
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
      }}>

        <h3>Patient Info</h3>

        <input name="name" value={form.name} placeholder="Name" onChange={handleChange} /><br/><br/>
        <input name="phone" value={form.phone} placeholder="Phone" onChange={handleChange} /><br/><br/>
        <input type="date" name="date" value={form.date} onChange={handleChange} /><br/><br/>

        <h3>Medicines</h3>

        {meds.map((m, i) => (
          <div key={i}>
            <input
              placeholder="Medicine"
              value={m.name}
              onChange={(e)=>updateMed(i, "name", e.target.value)}
            />

            <input
              placeholder="Dosage"
              value={m.dosage}
              onChange={(e)=>updateMed(i, "dosage", e.target.value)}
            />

            <input
              placeholder="Duration"
              value={m.duration}
              onChange={(e)=>updateMed(i, "duration", e.target.value)}
            />

            <button onClick={() => deleteMed(i)}>❌</button>

            <br/><br/>
          </div>
        ))}

        <button onClick={addMed}>+ Add Medicine</button>

        <h3>Notes</h3>
        <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} />

        <br/><br/>

        <button onClick={save}>Save</button>

        <hr />

        <h2>Saved Prescriptions 📄</h2>

        {list.map((p) => (
          <div key={p._id} style={{ marginBottom: 10 }}>
            <b>{p.name}</b> - {p.phone}

            <a
              href={`https://pis-backend-final-1.onrender.com/prescription/pdf/${encodeURIComponent(p.name)}`}
              target="_blank"
              rel="noreferrer"
            >
              <button style={{ marginLeft: 5 }}>PDF</button>
            </a>

            <button
              onClick={() => deletePrescription(p._id)}
              style={{ marginLeft: 5, background: "red", color: "white" }}
            >
              Delete
            </button>
          </div>
        ))}

      </div>

    </Layout>
  );
}

export default Prescription;