import React, { useState, useEffect } from "react";
import axios from "axios";
import PatientSelect from "../components/PatientSelect";

function FIS() {

  const BASE_URL = "https://https://pis-backend-final-1.onrender.com"https://pis-backend-final-1.onrender.com/api".onrender.com";

  const [patient, setPatient] = useState(null);

  const [data, setData] = useState({
    procedure: "",
    qty: "",
    rate: "",
    doctor: "",
    package: "",
    category: "",
    discount: "",
    payment1: "",
    payment2: ""
  });

  const [total, setTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [paid, setPaid] = useState(0);
  const [balance, setBalance] = useState(0);

  const [invoices, setInvoices] = useState([]);

  useEffect(() => {

    const t = (Number(data.qty) || 0) * (Number(data.rate) || 0);
    const d = (t * (Number(data.discount) || 0)) / 100;
    const final = t - d;
    const p = (Number(data.payment1) || 0) + (Number(data.payment2) || 0);

    setTotal(t);
    setDiscountAmount(d);
    setFinalTotal(final);
    setPaid(p);
    setBalance(final - p);

  }, [data]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await axios.get(`${BASE_URL}/invoices`);
    setInvoices(res.data);
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const save = async () => {

    if (!patient) return alert("Select patient ❗");

    await axios.post(`${BASE_URL}/invoice`, {
      ...data,
      patient: patient.patient_no,
      total: finalTotal,
      paid,
      balance
    });

    alert("Invoice Saved ✅");
    load();
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>HDC Financial Intelligence System (FIS) 💰</h1>

      <p>
        This module manages billing, discount control, payment tracking,
        and financial summaries for all patient treatments.
      </p>

      <PatientSelect onSelect={setPatient} />

      {patient && <p><strong>Selected Patient:</strong> {patient.name}</p>}

      <div style={grid}>

        {/* BILLING */}
        <div style={card}>
          <h3>1. Billing Engine</h3>
          <p>Enter procedure details and pricing information.</p>

          <input name="procedure" placeholder="Procedure" onChange={handleChange}/>
          <input name="qty" placeholder="Quantity" onChange={handleChange}/>
          <input name="rate" placeholder="Rate per unit" onChange={handleChange}/>
          <input name="package" placeholder="Package" onChange={handleChange}/>
          <input name="doctor" placeholder="Doctor" onChange={handleChange}/>
        </div>

        {/* DISCOUNT */}
        <div style={card}>
          <h3>2. Discount Governance</h3>
          <p>Apply discounts based on treatment category.</p>

          <input name="category" placeholder="Care category" onChange={handleChange}/>
          <input name="discount" placeholder="Discount %" onChange={handleChange}/>
        </div>

        {/* PAYMENT */}
        <div style={card}>
          <h3>3. Payment Tracking</h3>
          <p>Record payments received from the patient.</p>

          <input name="payment1" placeholder="Payment 1" onChange={handleChange}/>
          <input name="payment2" placeholder="Payment 2" onChange={handleChange}/>
        </div>

        {/* SUMMARY */}
        <div style={summaryCard}>
          <h3>Financial Summary</h3>

          <p>Total: {total}</p>
          <p>Discount: {discountAmount}</p>
          <h2>Final Amount: {finalTotal}</h2>
          <p>Paid: {paid}</p>
          <h2>Balance: {balance}</h2>

          <button onClick={save}>Save Invoice</button>
        </div>

      </div>

      <hr/>

      <h2>Saved Invoices</h2>

      {invoices.map(i => (
        <div key={i._id} style={invoiceCard}>
          <b>Rs {i.total}</b>
        </div>
      ))}

    </div>
  );
}

/* STYLES */

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px"
};

const card = {
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "10px",
  background: "#fff"
};

const summaryCard = {
  border: "2px solid #2b4c7e",
  padding: "15px",
  borderRadius: "10px",
  background: "#eef4ff"
};

const invoiceCard = {
  border: "1px solid #ccc",
  padding: "10px",
  marginTop: "10px"
};

export default FIS;