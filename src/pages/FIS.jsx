import React, { useState, useEffect } from "react";
import api from "../api"; // ✅ USE THIS
import { useNavigate } from "react-router-dom";

function FIS() {

  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);

  const [form, setForm] = useState({
    patient_name: "",
    procedure: "",
    doctor: "",
    qty: "",
    rate: "",
    discount: "",
    lab_charge: ""
  });

  const [editId, setEditId] = useState(null);

  const [total, setTotal] = useState(0);
  const [final, setFinal] = useState(0);
  const [doctorShare, setDoctorShare] = useState(0);
  const [owner, setOwner] = useState(0);

  // =========================
  // LOAD PATIENTS (AUTH FIX)
  // =========================
  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");
      setPatients(res.data);
    } catch (err) {
      console.log("Auth error:", err.response?.data || err);
    }
  };

  // =========================
  // LOAD RECORDS (AUTH FIX)
  // =========================
  const loadData = async () => {
    try {
      let url = "/fis/billing";

      if (form.patient_name) {
        url += "/" + form.patient_name;
      }

      const res = await api.get(url);

      console.log("DATA:", res.data);

      setRecords(res.data || []);

    } catch (err) {
      console.log("LOAD ERROR:", err.response?.data || err);
    }
  };

  useEffect(() => {
    loadPatients();
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [form.patient_name]);

  // =========================
  // CALCULATION
  // =========================
  const handleChange = (e) => {
    const data = { ...form, [e.target.name]: e.target.value };
    setForm(data);

    const qty = Number(data.qty) || 0;
    const rate = Number(data.rate) || 0;
    const discount = Number(data.discount) || 0;

    const t = qty * rate;
    const disc = (t * discount) / 100;
    const f = t - disc;

    setTotal(t);
    setFinal(f);

    const lab = Number(data.lab_charge) || 0;
    const doc = f * 0.25;
    const own = f - doc - lab;

    setDoctorShare(doc);
    setOwner(own);
  };

  // =========================
  // SAVE / UPDATE (AUTH FIX)
  // =========================
  const save = async () => {
    try {
      const payload = {
        patient_name: form.patient_name,
        procedure: form.procedure,
        doctor: form.doctor,
        amount: final,
        lab_charge: form.lab_charge
      };

      if (editId) {
        await api.put("/fis/billing/" + editId, payload);
      } else {
        await api.post("/fis/billing", payload);
      }

      resetForm();
      loadData();

    } catch (err) {
      console.log("SAVE ERROR:", err.response?.data || err);
    }
  };

  // =========================
  // DELETE (AUTH FIX)
  // =========================
  const handleDelete = async (id) => {
    try {
      if (!id) return alert("Invalid ID");

      await api.delete("/fis/billing/" + id);
      loadData();

    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (r) => {
    setForm({
      patient_name: r.patient_name,
      procedure: r.procedure,
      doctor: r.doctor,
      qty: "",
      rate: "",
      discount: "",
      lab_charge: r.lab_charge
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

      <select name="patient_name" onChange={handleChange}>
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
      <input name="lab_charge" placeholder="Lab Charges" onChange={handleChange}/>

      <h3>Total: {total}</h3>
      <h3>Final: {final}</h3>
      <h3>Doctor Share: {doctorShare}</h3>
      <h3>Owner: {owner}</h3>

      <button onClick={save}>{editId ? "Update" : "Save"}</button>

      <hr />

      <h2>Records</h2>

      {records.map(r => (
        <div key={r._id}>
          <b>{r.patient_name}</b><br/>
          {r.procedure} - {r.doctor}<br/>
          Amount: {r.amount}<br/>

          <button onClick={() => handleEdit(r)}>Edit</button>
          <button onClick={() => handleDelete(r._id)}>Delete</button>
        </div>
      ))}

    </div>
  );
}

export default FIS;