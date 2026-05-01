import React, { useEffect, useState } from "react";
import api from "../api";   // ✅ FIXED (use api instead of axios)
import { useNavigate } from "react-router-dom";
import PatientTimeline from "../components/PatientTimeline";

function Patients({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    referral: "",
    care_category: "",
    conditions: "",
    allergies: "",
    medications: "",
    risk_flags: "",
    past_treatments: "",
    complaints: "",
    habits: "",
    signed_forms: "",
    estimates: "",
    legal_consents: ""
  });

  const [xray, setXray] = useState(null);
  const [preview, setPreview] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
    loadPatients();
  }, [navigate]);

  // =========================
  // LOAD PATIENTS (FIXED)
  // =========================
  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");  // ✅ FIXED
      setPatients(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load patients ❌");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setXray(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // =========================
  // SAVE PATIENT (FIXED)
  // =========================
  const savePatient = async () => {
    try {
      if (!form.name || !form.age || !form.gender || !form.phone || !form.address) {
        alert("Fill required fields ❗");
        return;
      }

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key] || "");
      });

      if (xray) formData.append("xray", xray);

      if (editId) {
        await api.put("/patients/" + editId, formData);   // ✅ FIXED
      } else {
        await api.post("/patients/", formData);           // ✅ FIXED
      }

      alert("Saved ✅");

      setForm({
        name: "",
        age: "",
        gender: "",
        phone: "",
        address: "",
        referral: "",
        care_category: "",
        conditions: "",
        allergies: "",
        medications: "",
        risk_flags: "",
        past_treatments: "",
        complaints: "",
        habits: "",
        signed_forms: "",
        estimates: "",
        legal_consents: ""
      });

      setXray(null);
      setPreview("");
      setEditId(null);

      loadPatients();

    } catch (err) {
      console.log("SAVE ERROR:", err.response?.data || err);
      alert("Error ❌");
    }
  };

  // =========================
  // DELETE (FIXED)
  // =========================
  const deletePatient = async (id) => {
    await api.delete("/patients/" + id);  // ✅ FIXED
    loadPatients();
  };

  const editPatient = (p) => {
    setForm(p);
    setEditId(p._id);
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>Patients Module</h1>

      <button onClick={() => navigate("/dashboard")}>
        ⬅ Back
      </button>

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
      <input name="allergies" value={form.allergies} onChange={handleChange} placeholder="Allergies" /><br/><br/>

      <h3>Dental</h3>
      <input name="complaints" value={form.complaints} onChange={handleChange} placeholder="Complaints" /><br/><br/>

      <h3>Imaging</h3>
      <input type="file" onChange={handleFile} /><br/><br/>
      {preview && <img src={preview} width="120" alt="preview" />}

      <br/><br/>
      <button onClick={savePatient}>
        {editId ? "Update" : "Save"}
      </button>

      <hr />

      <h2>Patients List</h2>

      {patients.map((p) => (
        <div key={p._id} style={{
          border: "1px solid gray",
          padding: 10,
          marginBottom: 10
        }}>
          <h3>{p.name}</h3>
          <p>{p.age} | {p.gender}</p>
          <p>{p.phone}</p>

          {p.xray && (
            <img src={`https://pis-backend-final-1.onrender.com/${p.xray}`} width="100" alt="xray" />
          )}

          <br/>

          <button onClick={() => editPatient(p)}>Edit</button>
          <button onClick={() => deletePatient(p._id)}>Delete</button>

          <button onClick={() => setSelectedPatient(p._id)}>
            View Timeline
          </button>

          {selectedPatient === p._id && (
            <PatientTimeline patientId={p._id} />
          )}
        </div>
      ))}

    </div>
  );
}

export default Patients;