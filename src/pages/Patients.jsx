```javascript
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

  useEffect(() => {
    loadPatients();
  }, []);

  // LOAD
  const loadPatients = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/patients`);
      setPatients(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // FILE
  const handleFile = (e) => {
    const file = e.target.files[0];
    setXray(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // SAVE / UPDATE (FINAL FIX)
  const savePatient = async () => {
    try {

      if (!form.name || !form.age || !form.gender || !form.phone || !form.address) {
        alert("Fill all required fields ❗");
        return;
      }

      const formData = new FormData();

      // REQUIRED
      formData.append("name", String(form.name));
      formData.append("age", String(form.age));
      formData.append("gender", String(form.gender));
      formData.append("phone", String(form.phone));
      formData.append("address", String(form.address));

      // OPTIONAL
      formData.append("referral", form.referral || "");
      formData.append("care_category", form.care_category || "");
      formData.append("conditions", form.conditions || "");
      formData.append("allergies", form.allergies || "");
      formData.append("medications", form.medications || "");
      formData.append("risk_flags", form.risk_flags || "");
      formData.append("past_treatments", form.past_treatments || "");
      formData.append("complaints", form.complaints || "");
      formData.append("habits", form.habits || "");
      formData.append("signed_forms", form.signed_forms || "");
      formData.append("estimates", form.estimates || "");
      formData.append("legal_consents", form.legal_consents || "");

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
      console.log("ERROR:", err.response?.data);
      alert("Error ❌");
    }
  };

  // DELETE
  const deletePatient = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/patients/${id}`);
      loadPatients();
    } catch (err) {
      console.log(err);
    }
  };

  // EDIT
  const editPatient = (p) => {
    setForm(p);
    setEditId(p._id);
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>PATIENT SYSTEM 👤</h1>

      <button onClick={() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }}>
        Logout
      </button>

      <hr />

      <h2>Patient Form</h2>

      {/* DEMOGRAPHICS */}
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} /><br/><br/>
      <input name="age" placeholder="Age" value={form.age} onChange={handleChange} /><br/><br/>
      <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} /><br/><br/>
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} /><br/><br/>
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} /><br/><br/>

      {/* MEDICAL */}
      <input name="conditions" placeholder="Conditions" value={form.conditions} onChange={handleChange} /><br/><br/>
      <input name="allergies" placeholder="Allergies" value={form.allergies} onChange={handleChange} /><br/><br/>

      {/* DENTAL */}
      <input name="complaints" placeholder="Complaints" value={form.complaints} onChange={handleChange} /><br/><br/>

      {/* FILE */}
      <input type="file" onChange={handleFile} /><br/><br/>

      {preview && <img src={preview} alt="preview" width="120" />}

      <br/><br/>

      <button onClick={savePatient}>
        {editId ? "Update Patient" : "Save Patient"}
      </button>

      <hr />

      <h2>Patients List</h2>

      {patients.map(p => (
        <div key={p._id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>

          <h3>{p.name}</h3>

          <p>{p.age} | {p.gender}</p>
          <p>{p.phone}</p>
          <p>{p.address}</p>

          {p.xray && (
            <img src={`${BASE_URL}/${p.xray}`} width="100" alt="xray" />
          )}

          <br/><br/>

          <button onClick={() => editPatient(p)}>Edit</button>
          <button onClick={() => deletePatient(p._id)}>Delete</button>

        </div>
      ))}

    </div>
  );
}

export default Patients;
```
