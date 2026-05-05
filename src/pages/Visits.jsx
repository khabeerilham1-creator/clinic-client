import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

// 🔥 ADDED
import Layout from "../components/Layout";

function Visits() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);

  const [form, setForm] = useState({
    patient_id: "",
    diagnosis: "",
    treatment: "",
    medicines: "",
    fee: "",
    date: ""   // 🔥 ADDED DATE
  });

  const [editId, setEditId] = useState(null);

  const loadPatients = async () => {
    const res = await api.get("/patients/");
    setPatients(res.data);
  };

  const loadVisits = async () => {
    const res = await api.get("/visits/");
    setVisits(res.data);
  };

  useEffect(() => {
    loadPatients();
    loadVisits();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveVisit = async () => {
    try {

      if (editId) {
        await api.put("/visits/" + editId, form);
        alert("Updated ✅");
      } else {
        await api.post("/visits/", form);
        alert("Saved ✅");
      }

      setForm({
        patient_id: "",
        diagnosis: "",
        treatment: "",
        medicines: "",
        fee: "",
        date: ""   // 🔥 RESET DATE
      });

      setEditId(null);
      loadVisits();

    } catch (err) {
      console.log(err);
      alert("Error ❌");
    }
  };

  const handleEdit = (v) => {
    setForm({
      patient_id: v.patient_id,
      diagnosis: v.diagnosis,
      treatment: v.treatment,
      medicines: v.medicines || "",
      fee: v.fee || "",
      date: v.date || ""   // 🔥 LOAD DATE
    });

    setEditId(v._id);
  };

  const handleDelete = async (id) => {
    await api.delete("/visits/" + id);
    loadVisits();
  };

  const getPatientName = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? p.name : "Unknown";
  };

  return (

    <Layout>

      <h1 style={{ marginBottom: 20 }}>Patient Visits Module 🩺</h1>

      {/* FORM */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <h3>{editId ? "Edit Visit" : "Add Visit"}</h3>

        <select name="patient_id" value={form.patient_id} onChange={handleChange}>
          <option value="">Select Patient</option>
          {patients.map(p => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.phone})
            </option>
          ))}
        </select>

        <br /><br />

        <Grid>
          <input name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder="Diagnosis" />
          <input name="treatment" value={form.treatment} onChange={handleChange} placeholder="Treatment" />
          <input name="medicines" value={form.medicines} onChange={handleChange} placeholder="Medicines" />
          <input name="fee" value={form.fee} onChange={handleChange} placeholder="Fee" />

          {/* 🔥 DATE FIELD */}
          <input type="date" name="date" value={form.date} onChange={handleChange} />
        </Grid>

        <button
          onClick={saveVisit}
          style={{
            marginTop: 15,
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6
          }}
        >
          {editId ? "Update Visit" : "Add Visit"}
        </button>

      </div>

      {/* LIST */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <h2>Saved Visits</h2>

        <table style={{ width: "100%", marginTop: 10 }}>
          <thead>
            <tr>
              <th align="left">Patient</th>
              <th align="left">Diagnosis</th>
              <th align="left">Treatment</th>
              <th align="left">Date</th>
              <th align="right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visits.map(v => (
              <tr key={v._id} style={{ borderTop: "1px solid #eee" }}>
                <td>{getPatientName(v.patient_id)}</td>
                <td>{v.diagnosis}</td>
                <td>{v.treatment}</td>
                <td>{v.date || "-"}</td>

                <td align="right">
                  <button onClick={() => handleEdit(v)}>Edit</button>
                  <button onClick={() => handleDelete(v._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </Layout>
  );
}

/* GRID */
function Grid({ children }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: 10
    }}>
      {children}
    </div>
  );
}

export default Visits;