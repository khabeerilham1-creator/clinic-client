import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Patients({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    conditions: "",
    complaints: ""
  });

  const [file, setFile] = useState(null);

  // ✅ ADDED
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    } else {
      loadPatients();
    }
  }, [navigate]);

  // =========================
  // LOAD PATIENTS
  // =========================
  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");
      setPatients(res.data);
    } catch (err) {
      console.log("LOAD ERROR:", err.response?.data || err);
      alert("Failed to load patients ❌");
    }
  };

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // SAVE PATIENT
  // =========================
  const savePatient = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (file) formData.append("xray", file);

      // ✅ ADDED UPDATE LOGIC
      if (editId) {
        await api.put("/patients/" + editId, form);
        alert("Updated ✅");
        setEditId(null);
      } else {
        await api.post("/patients/", formData);
        alert("Saved ✅");
      }

      setForm({
        name: "",
        age: "",
        gender: "",
        phone: "",
        address: "",
        conditions: "",
        complaints: ""
      });

      setFile(null);

      loadPatients();

    } catch (err) {
      console.log("SAVE ERROR:", err.response?.data || err);

      // ✅ FIX FAKE ERROR
      if (err.response?.status >= 400) {
        alert("Error ❌");
      }
    }
  };

  // =========================
  // DELETE
  // =========================
  const deletePatient = async (id) => {
    try {
      await api.delete("/patients/" + id);
      loadPatients();
    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Patients Module</h1>

      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>

      <button
        style={{ marginLeft: 10 }}
        onClick={() => {
          localStorage.removeItem("token");
          if (setIsLoggedIn) setIsLoggedIn(false);
          navigate("/");
        }}
      >
        Logout
      </button>

      <hr />

      <h3>Demographics</h3>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" /><br/><br/>
      <input name="age" value={form.age} onChange={handleChange} placeholder="Age" /><br/><br/>
      <input name="gender" value={form.gender} onChange={handleChange} placeholder="Gender" /><br/><br/>
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" /><br/><br/>
      <input name="address" value={form.address} onChange={handleChange} placeholder="Address" /><br/><br/>

      <h3>Medical</h3>
      <input name="conditions" value={form.conditions} onChange={handleChange} placeholder="Conditions" /><br/><br/>

      <h3>Dental</h3>
      <input name="complaints" value={form.complaints} onChange={handleChange} placeholder="Complaints" /><br/><br/>

      <h3>Imaging</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} /><br/><br/>

      <button onClick={savePatient}>
        {editId ? "Update" : "Save"} {/* ✅ ADDED */}
      </button>

      <hr />

      <h2>Patients List</h2>

      {patients.map((p) => (
        <div key={p._id}>
          <b>{p.name}</b> - {p.phone}
          <br/>

          {/* EXISTING */}
          <button onClick={() => navigate("/timeline/" + p._id)}>
            View History 🔥
          </button>

          {/* ✅ ADDED EDIT BUTTON */}
          <button onClick={() => {
            setForm({
              name: p.name || "",
              age: p.age || "",
              gender: p.gender || "",
              phone: p.phone || "",
              address: p.address || "",
              conditions: p.conditions || "",
              complaints: p.complaints || ""
            });
            setEditId(p._id);
          }}>
            Edit ✏️
          </button>

          <button onClick={() => deletePatient(p._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default Patients;