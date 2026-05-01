import React, { useState } from "react";
import axios from "axios";

const BASE_URL = "https://pis-backend-final-1.onrender.com";

function FIS() {

  const [form, setForm] = useState({
    patient_name: "",
    procedure: "",
    doctor: "",
    qty: "",
    rate: "",
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

    const qty = Number(newData.qty) || 0;
    const rate = Number(newData.rate) || 0;
    const discount = Number(newData.discount) || 0;
    const p1 = Number(newData.payment1) || 0;
    const p2 = Number(newData.payment2) || 0;

    const t = qty * rate;
    const discountAmount = (t * discount) / 100;
    const f = t - discountAmount;
    const paid = p1 + p2;
    const b = f - paid;

    setTotal(t);
    setFinal(f);
    setBalance(b);
  };

  const save = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ ONLY SEND WHAT BACKEND EXPECTS
      await axios.post(
        BASE_URL + "/fis/billing",
        {
          patient_name: form.patient_name,
          procedure: form.procedure,
          doctor: form.doctor,
          amount: final   // 🔥 IMPORTANT
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Billing Saved ✅");

    } catch (err) {
      console.log("FIS ERROR:", err.response?.data || err);
      alert("Error ❌");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>FINANCIAL INTELLIGENCE SYSTEM (FIS)</h1>

      <h3>Billing Engine</h3>

      <input name="patient_name" placeholder="Patient Name" onChange={handleChange}/>
      <input name="procedure" placeholder="Procedure" onChange={handleChange}/>
      <input name="doctor" placeholder="Doctor" onChange={handleChange}/>
      <input name="qty" placeholder="Quantity" onChange={handleChange}/>
      <input name="rate" placeholder="Rate" onChange={handleChange}/>

      <h3>Discount</h3>
      <input name="discount" placeholder="Discount %" onChange={handleChange}/>

      <h3>Payment</h3>
      <input name="payment1" placeholder="Payment 1" onChange={handleChange}/>
      <input name="payment2" placeholder="Payment 2" onChange={handleChange}/>

      <h3>Summary</h3>
      <p>Total: {total}</p>
      <p>Final: {final}</p>
      <p>Balance: {balance}</p>

      <button onClick={save}>Save</button>
    </div>
  );
}

export default FIS;