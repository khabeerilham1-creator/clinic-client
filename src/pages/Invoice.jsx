import React, { useEffect, useState } from "react";
import api from "../api";

function Invoice() {

  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    procedure: "",
    qty: "",
    rate: "",
    payment1: "",
    payment2: ""
  });

  // =========================
  // LOAD PATIENTS
  // =========================
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");
      setPatients(res.data);
    } catch {
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
      await api.post("/invoice", {
        patient_name: selected.name,
        ...form
      });

      alert("Saved ✅");

    } catch {
      alert("Error ❌");
    }
  };

  // =========================
  // GENERATE PDF
  // =========================
  const generatePDF = () => {
    window.open(
      `https://pis-backend-final-1.onrender.com/invoice-pdf/${selected.name}`,
      "_blank"
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Invoice System 🧾</h2>

      {/* PATIENT LIST */}
      <h3>Select Patient</h3>
      {patients.map((p) => (
        <div key={p._id}>
          <button onClick={() => setSelected(p)}>
            {p.name}
          </button>
        </div>
      ))}

      <hr />

      {/* FORM */}
      {selected && (
        <>
          <h3>Invoice for: {selected.name}</h3>

          <input name="procedure" placeholder="Procedure" onChange={handleChange}/><br/><br/>
          <input name="qty" placeholder="Qty" onChange={handleChange}/><br/><br/>
          <input name="rate" placeholder="Rate" onChange={handleChange}/><br/><br/>

          <h4>Payments</h4>
          <input name="payment1" placeholder="Payment 1" onChange={handleChange}/><br/><br/>
          <input name="payment2" placeholder="Payment 2" onChange={handleChange}/><br/><br/>

          <button onClick={saveInvoice}>Save Invoice</button>

          <br/><br/>

          <button onClick={generatePDF}>
            Generate Invoice PDF
          </button>
        </>
      )}
    </div>
  );
}

export default Invoice;