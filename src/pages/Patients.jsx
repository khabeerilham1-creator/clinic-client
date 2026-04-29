import React, { useEffect, useState } from "react";
import axios from "axios";

function Patients({ setIsLoggedIn }) {

  const BASE_URL = "https://pis-backend-final-1.onrender.com/api";

  const [patients, setPatients] = useState([]);

  const [form, setForm] = useState({
    name: "", age: "", gender: "", phone: "", address: "",
    referral: "", care_category: "",
    conditions: "", allergies: "", medications: "", risk_flags: "",
    past_treatments: "", complaints: "", habits: "",
    signed_forms: "", estimates: "", legal_consents: ""
  });

  const [xray, setXray] = useState(null);
  const [preview, setPreview] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  // 🔥 LOAD
  const loadPatients = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/patients`);
      setPatients(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 FILE
  const handleFile = (e) => {
    const file = e.target.files[0];
    setXray(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // 🔥 SAVE / UPDATE
  const savePatient = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      if (xray) formData.append("xray", xray);

      if (editId) {
        await axios.put(`${BASE_URL}/patients/${editId}`, formData);
        setEditId(null);
      } else {
        await axios.post(`${BASE_URL}/patients`, formData);
      }

      alert("Patient Saved ✅");

      setForm({
        name: "", age: "", gender: "", phone: "", address: "",
        referral: "", care_category: "",
        conditions: "", allergies: "", medications: "", risk_flags: "",
        past_treatments: "", complaints: "", habits: "",
        signed_forms: "", estimates: "", legal_consents: ""
      });

      setXray(null);
      setPreview("");

      loadPatients();

    } catch (err) {
      console.log(err);
      alert("Error ❌");
    }
  };

  // 🔥 DELETE
  const deletePatient = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/patients/${id}`);
      loadPatients();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 EDIT
  const editPatient = (p) => {
    setForm(p);
    setEditId(p._id);
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>PATIENT INTELLIGENCE SYSTEM (PIS) 👤</h1>

      {/* 🔥 LOGOUT */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }}
      >
        Logout
      </button>

      <p>
        Manage patient demographics, medical history, dental data, imaging, and legal records.
      </p>

      <h3>1. Demographics</h3>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} /><br/><br/>
      <input name="age" placeholder="Age" value={form.age} onChange={handleChange} /><br/><br/>
      <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} /><br/><br/>
      <input name="phone" placeholder="Contact" value={form.phone} onChange={handleChange} /><br/><br/>
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} /><br/><br/>
      <input name="referral" placeholder="Referral Source" value={form.referral} onChange={handleChange} /><br/><br/>
      <input name="care_category" placeholder="Care Category" value={form.care_category} onChange={handleChange} /><br/><br/>

      <h3>2. Medical Intelligence</h3>
      <input name="conditions" placeholder="Conditions" value={form.conditions} onChange={handleChange} /><br/><br/>
      <input name="allergies" placeholder="Allergies" value={form.allergies} onChange={handleChange} /><br/><br/>
      <input name="medications" placeholder="Medications" value={form.medications} onChange={handleChange} /><br/><br/>
      <input name="risk_flags" placeholder="Risk Flags" value={form.risk_flags} onChange={handleChange} /><br/><br/>

      <h3>3. Dental History</h3>
      <input name="past_treatments" placeholder="Past Treatments" value={form.past_treatments} onChange={handleChange} /><br/><br/>
      <input name="complaints" placeholder="Complaints" value={form.complaints} onChange={handleChange} /><br/><br/>
      <input name="habits" placeholder="Habits" value={form.habits} onChange={handleChange} /><br/><br/>

      <h3>4. Imaging Archive</h3>
      <input type="file" onChange={handleFile} /><br/><br/>

      {preview && (
        <img src={preview} alt="preview" style={{ width: "150px" }} />
      )}

      <h3>5. Consent Vault</h3>
      <input name="signed_forms" placeholder="Signed Forms" value={form.signed_forms} onChange={handleChange} /><br/><br/>
      <input name="estimates" placeholder="Estimates" value={form.estimates} onChange={handleChange} /><br/><br/>
      <input name="legal_consents" placeholder="Legal Consents" value={form.legal_consents} onChange={handleChange} /><br/><br/>

      <button onClick={savePatient}>
        {editId ? "Update Patient" : "Save Patient"}
      </button>

      <hr />

      <h2>Saved Patients</h2>

      {patients.map(p => (
        <div key={p._id} style={{ border:"1px solid #ccc", padding:"15px", marginBottom:"20px" }}>

          <h3>{p.name}</h3>

          <b>Demographics:</b><br/>
          {p.age} | {p.gender}<br/>
          {p.phone}<br/>
          {p.address}<br/><br/>

          <b>Medical:</b><br/>
          {p.conditions}<br/>
          {p.allergies}<br/><br/>

          <b>Dental:</b><br/>
          {p.complaints}<br/><br/>

          {p.xray && (
            <img
              src={`https://pis-backend-final-1.onrender.com/${p.xray}`}
              alt="xray"
              style={{ width: "120px" }}
            />
          )}

          <br/><br/>

          <button onClick={() => editPatient(p)}>Edit</button>
          <button onClick={() => deletePatient(p._id)} style={{ marginLeft:10 }}>
            Delete
          </button>

        </div>
      ))}

    </div>
  );
}

export default Patients;