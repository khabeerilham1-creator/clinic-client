import React, { useState } from "react";
import axios from "axios";

const BASE_URL = "https://pis-backend-final-1.onrender.com";

function FIS() {

  const [form, setForm] = useState({
    procedure: "",
    doctor: "",
    qty: "",
    rate: "",
    package: "",
    category: "",
    discount: "",
    payment1: "",
    payment2: ""
  });

  const [total, setTotal] = useState(0);
  const [final, setFinal] = useState(0);
  const [balance, setBalance] = useState(0);

  const handleChange = (e) => {
    const newData = { ...form, [e.target.name]: e.target.value };
    setForm(newData);

    const t = (Number(newData.qty) || 0) * (Number(newData.rate) || 0);
    const d = (t * (Number(newData.discount) || 0)) / 100;
    const f = t - d;
    const paid = (Number(newData.payment1) || 0) + (Number(newData.payment2) || 0);

    setTotal(t);
    setFinal(f);
    setBalance(f - paid);
  };

  const save = async () => {
    try {
      await axios.post(BASE_URL + "/invoice", {
        ...form,
        total: final,
        balance
      });

      alert("Saved ✅");
    } catch {
      alert("Error ❌");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>FINANCIAL INTELLIGENCE SYSTEM (FIS)</h1>

      {/* BILLING */}
      <h3>Billing Engine</h3>
      <input name="procedure" placeholder="Procedure" onChange={handleChange}/>
      <input name="doctor" placeholder="Doctor" onChange={handleChange}/>
      <input name="qty" placeholder="Quantity" onChange={handleChange}/>
      <input name="rate" placeholder="Rate" onChange={handleChange}/>
      <input name="package" placeholder="Package" onChange={handleChange}/>

      {/* DISCOUNT */}
      <h3>Discount Governance</h3>
      <input name="category" placeholder="Category" onChange={handleChange}/>
      <input name="discount" placeholder="Discount %" onChange={handleChange}/>

      {/* PAYMENT */}
      <h3>Payment Tracking</h3>
      <input name="payment1" placeholder="Payment 1" onChange={handleChange}/>
      <input name="payment2" placeholder="Payment 2" onChange={handleChange}/>

      {/* SUMMARY */}
      <h3>Summary</h3>
      <p>Total: {total}</p>
      <p>Final: {final}</p>
      <p>Balance: {balance}</p>

      <button onClick={save}>Save</button>
    </div>
  );
}

export default FIS;