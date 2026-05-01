import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Invoice({ setIsLoggedIn }) {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
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
  // AUTH CHECK
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required ❌");
      navigate("/");
      return;
    }

    loadPatients();
  }, []);

  // =========================
  // LOAD PATIENTS
  // =========================
  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");
      setPatients(res.data);
    } catch (err) {
      console.log("PATIENT ERROR:", err.response?.data || err);
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
  // SAVE INVOICE
  // =========================
  const saveInvoice = async () => {
    try {
      await api.post("/invoice", form);
      alert("Invoice Saved ✅");
    } catch (err) {
      console.log(err);
      alert("Error saving ❌");
    }
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
      <select name="patient_name" onChange={handleChange}>
        <option value="">-- Select Patient --</option>

        {patients.map((p) => (
          <option key={p._id} value={p.name}>
            {p.name} ({p.phone})
          </option>
        ))}
      </select>

      <hr />

      {/* MANUAL BILL */}
      <h3>Manual Billing</h3>

      <input name="procedure" placeholder="Procedure" onChange={handleChange} /><br/><br/>
      <input name="qty" placeholder="Quantity" onChange={handleChange} /><br/><br/>
      <input name="rate" placeholder="Rate" onChange={handleChange} /><br/><br/>

      <h3>Payments</h3>
      <input name="payment1" placeholder="Payment 1" onChange={handleChange} /><br/><br/>
      <input name="payment2" placeholder="Payment 2" onChange={handleChange} /><br/><br/>

      <button onClick={saveInvoice}>Save Invoice</button>

      <hr />

      {/* PDF */}
      {form.patient_name && (
        <a
          href={`${BASE_URL}/invoice-pdf/${form.patient_name}`}
          target="_blank"
          rel="noreferrer"
        >
          <button>Generate PDF 🧾</button>
        </a>
      )}

    </div>
  );
}

export default Invoice;