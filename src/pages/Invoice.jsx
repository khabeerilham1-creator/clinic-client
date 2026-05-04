import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Invoice({ setIsLoggedIn }) {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);

  const [form, setForm] = useState({
    patient_name: "",
    procedure: "",
    qty: "",
    rate: "",
    payment1: "",
    payment2: ""
  });

  const BASE_URL = "https://pis-backend-final-1.onrender.com";

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required ❌");
      navigate("/");
      return;
    }

    loadPatients();
    loadInvoices();
  }, []);

  // =========================
  // LOAD PATIENTS
  // =========================
  const loadPatients = async () => {
    const res = await api.get("/patients/");
    setPatients(res.data);
  };

  // =========================
  // LOAD INVOICES
  // =========================
  const loadInvoices = async () => {
    try {
      const res = await api.get("/invoice/");   // ✅ GET ALL
      setRecords(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // INPUT
  // =========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // SAVE
  // =========================
  const saveInvoice = async () => {
    try {
      await api.post("/invoice/", form);

      alert("Saved ✅");

      loadInvoices(); // 🔥 refresh list

      setForm({
        patient_name: "",
        procedure: "",
        qty: "",
        rate: "",
        payment1: "",
        payment2: ""
      });

    } catch (err) {
      console.log(err);
      alert("Error ❌");
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteInvoice = async (id) => {
    if (!window.confirm("Delete invoice?")) return;

    await api.delete("/invoice/" + id);
    loadInvoices();
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>Invoice System 🧾</h1>

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

      {/* SELECT PATIENT */}
      <h3>Select Patient</h3>
      <select name="patient_name" onChange={handleChange} value={form.patient_name}>
        <option value="">-- Select Patient --</option>
        {patients.map((p) => (
          <option key={p._id} value={p.name}>
            {p.name} ({p.phone})
          </option>
        ))}
      </select>

      <hr />

      {/* BILLING */}
      <h3>Manual Billing</h3>

      <input name="procedure" placeholder="Procedure" onChange={handleChange} value={form.procedure}/><br/><br/>
      <input name="qty" placeholder="Quantity" onChange={handleChange} value={form.qty}/><br/><br/>
      <input name="rate" placeholder="Rate" onChange={handleChange} value={form.rate}/><br/><br/>

      <h3>Payments</h3>

      <input name="payment1" placeholder="Payment 1" onChange={handleChange} value={form.payment1}/><br/><br/>
      <input name="payment2" placeholder="Payment 2" onChange={handleChange} value={form.payment2}/><br/><br/>

      <button onClick={saveInvoice}>Save Invoice</button>

      <hr />

      {/* 🔥 SAVED INVOICES */}
      <h2>Saved Invoices</h2>

      {records.length === 0 && <p>No invoices</p>}

      {records.map((r) => (
        <div key={r._id} style={{
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 10
        }}>
          <b>{r.patient_name}</b><br />
          {r.procedure}<br />
          Amount: Rs {r.amount}<br />
          Paid: Rs {r.paid}<br />
          Balance: Rs {r.balance}<br />

          {/* PDF */}
          <a
            href={`${BASE_URL}/invoice/pdf/${r.patient_name}`}
            target="_blank"
            rel="noreferrer"
          >
            <button>PDF</button>
          </a>

          {/* DELETE */}
          <button
            style={{ marginLeft: 10 }}
            onClick={() => deleteInvoice(r._id)}
          >
            Delete ❌
          </button>
        </div>
      ))}

    </div>
  );
}

export default Invoice;