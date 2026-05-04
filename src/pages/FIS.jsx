import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://pis-backend-final-1.onrender.com";

function FIS() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    patient_name: "",
    procedure: "",
    doctor: "",
    qty: "",
    rate: "",
    discount: "",
    lab_charge: ""
  });

  const [total, setTotal] = useState(0);
  const [final, setFinal] = useState(0);
  const [doctorShare, setDoctorShare] = useState(0);
  const [owner, setOwner] = useState(0);

  // LOAD PATIENTS
  const loadPatients = async () => {
    const res = await axios.get(BASE_URL + "/patients/");
    setPatients(res.data);
  };

  // LOAD RECORDS
  const loadData = async () => {

    let url = BASE_URL + "/fis/billing";

    if (form.patient_name) {
      url += "/" + form.patient_name;
    }

    const res = await axios.get(url);

    // 🔥 FILTER BAD RECORDS
    const safe = (res.data || []).filter(r => r && r._id);

    setRecords(safe);
  };

  useEffect(() => {
    loadPatients();
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [form.patient_name]);

  // CALCULATION
  const handleChange = (e) => {
    const newData = { ...form, [e.target.name]: e.target.value };
    setForm(newData);

    const qty = Number(newData.qty) || 0;
    const rate = Number(newData.rate) || 0;
    const discount = Number(newData.discount) || 0;

    const t = qty * rate;
    const discountAmount = (t * discount) / 100;
    const f = t - discountAmount;

    setTotal(t);
    setFinal(f);

    const lab = Number(newData.lab_charge) || 0;

    const doc = f * 0.25;
    const own = f - doc - lab;

    setDoctorShare(doc);
    setOwner(own);
  };

  // SAVE / UPDATE
  const save = async () => {

    const payload = {
      patient_name: form.patient_name,
      procedure: form.procedure,
      doctor: form.doctor,
      amount: final,
      lab_charge: form.lab_charge
    };

    if (editId) {
      await axios.put(BASE_URL + "/fis/billing/" + editId, payload);
    } else {
      await axios.post(BASE_URL + "/fis/billing", payload);
    }

    resetForm();
    loadData();
  };

  // DELETE
  const handleDelete = async (id) => {

    console.log("DELETE ID:", id);

    if (!id || id === "undefined") {
      alert("Invalid ID ❌");
      return;
    }

    try {
      await axios.delete(BASE_URL + "/fis/billing/" + id);
      loadData();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("Delete failed ❌");
    }
  };

  // EDIT
  const handleEdit = (r) => {
    setForm({
      patient_name: r.patient_name,
      procedure: r.procedure,
      doctor: r.doctor,
      qty: "",
      rate: "",
      discount: "",
      lab_charge: r.lab_charge || ""
    });

    setEditId(r._id);
  };

  const resetForm = () => {
    setForm({
      patient_name: "",
      procedure: "",
      doctor: "",
      qty: "",
      rate: "",
      discount: "",
      lab_charge: ""
    });
    setEditId(null);
  };

  return (
    <div style={{ padding: 20 }}>

      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>

      <h1>FIS</h1>

      <select name="patient_name" value={form.patient_name} onChange={handleChange}>
        <option value="">All Patients</option>
        {patients.map(p => (
          <option key={p._id} value={p.name}>{p.name}</option>
        ))}
      </select>

      <br /><br />

      <input name="procedure" placeholder="Procedure" onChange={handleChange}/>
      <input name="doctor" placeholder="Doctor" onChange={handleChange}/>
      <input name="qty" placeholder="Qty" onChange={handleChange}/>
      <input name="rate" placeholder="Rate" onChange={handleChange}/>
      <input name="discount" placeholder="Discount %" onChange={handleChange}/>

      <h3>Lab Charges</h3>
      <input name="lab_charge" onChange={handleChange}/>

      <h3>Total: {total}</h3>
      <h3>Final: {final}</h3>
      <h3>Doctor Share (25%): {doctorShare}</h3>
      <h3>Owner: {owner}</h3>

      <button onClick={save}>{editId ? "Update" : "Save"}</button>

      <hr />

      <h2>Records</h2>

      {records.map((r) => (
        <div key={r._id} style={{ background: "#eee", padding: 10, marginBottom: 10 }}>
          <b>{r.patient_name}</b><br/>
          {r.procedure} - {r.doctor}<br/>
          Amount: {r.amount}<br/>

          Doctor: {r.doctor_share}<br/>
          Lab: {r.lab_charge}<br/>
          Owner: {r.owner_share}<br/>

          <button onClick={() => handleEdit(r)}>Edit</button>
          <button onClick={() => handleDelete(r._id)}>Delete</button>
        </div>
      ))}

    </div>
  );
}

export default FIS;