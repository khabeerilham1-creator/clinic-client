import React, { useEffect, useState } from "react";
import axios from "axios";

function Patients({ setIsLoggedIn }) {

  const BASE_URL = "https://pis-backend-final-1.onrender.com";

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

  // 🔥 LOAD PATIENTS
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/patients`);
      setPatients(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 INPUT
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
      } else {
        await axios.post(`${BASE_URL}/patients`, formData);
      }

      alert("Saved ✅");

      setForm({
        name: "", age: "", gender: "", phone: "", address: "",
        referral: "", care_category: "",
        conditions: "", allergies: "", medications: "", risk_flags: "",
        past_treatments: "", complaints: "", habits: "",
        signed_forms: "", estimates: "", legal_consents: ""
      });

      setXray(null);
      setPreview("");
      setEditId(null);

      loadPatients();

    } catch (err) {
      console.log(err);
      alert("Error ❌");
    }
  };

  // 🔥 DELETE
  const deletePatient = async (id) => {
    await axios.delete(`${BASE_URL}/patients/${id}`);
    loadPatients();
  };

  // 🔥 EDIT
  const editPatient = (p) => {
    setForm(p);
    setEditId(p._id);
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>PATIENT SYSTEM 👤</h1>

      <button onClick={() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }}>
        Logout
      </button>

      <hr />

      <h3>Patient Form</h3>

      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} /><br/><br/>
      <input name="age" placeholder="Age" value={form.age} onChange={handleChange} /><br/><br/>
      <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} /><br/><br/>
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} /><br/><br/>
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} /><br/><br/>

      <input type="file" onChange={handleFile} /><br/><br/>

      {preview && <img src={preview} alt="preview" width="120" />}

      <br/><br/>

      <button onClick={savePatient}>
        {editId ? "Update" : "Save"}
      </button>

      <hr />

      <h2>Patients List</h2>

      {patients.map(p => (
        <div key={p._id} style={{ border:"1px solid gray", padding:10, marginBottom:10 }}>
          <h3>{p.name}</h3>
          <p>{p.age} | {p.gender}</p>
          <p>{p.phone}</p>

          {p.xray && (
            <img
              src={`${BASE_URL}${p.xray}`}
              alt="xray"
              width="100"
            />
          )}

          <br/>

          <button onClick={() => editPatient(p)}>Edit</button>
          <button onClick={() => deletePatient(p._id)}>Delete</button>
        </div>
      ))}

    </div>
  );
}

export default Patients;