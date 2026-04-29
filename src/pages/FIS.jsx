import React, { useState, useEffect } from "react";
import axios from "axios";
import PatientSelect from "../components/PatientSelect";
import { useNavigate } from "react-router-dom";

function FIS() {
  const navigate = useNavigate();

  const BASE_URL = "https://pis-backend-final-1.onrender.com";

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
    const token = localStorage.getItem("token");
    if (!token) navigate("/");

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
    const res = await axios.get(BASE_URL + "/invoices");
    setInvoices(res.data);
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const save = async () => {
    if (!patient) return alert("Select patient ❗");

    await axios.post(BASE_URL + "/invoice", {
      ...data,
      patient: patient.patient_no,
      total: finalTotal,
      paid,
      balance
    });

    alert("Saved ✅");
    load();
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>FIS Module</h1>

      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>

      <button
        style={{ marginLeft: 10 }}
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
      >
        Logout
      </button>

      <hr />

      <PatientSelect onSelect={setPatient} />

      <input name="procedure" placeholder="Procedure" onChange={handleChange}/>
      <input name="qty" placeholder="Qty" onChange={handleChange}/>
      <input name="rate" placeholder="Rate" onChange={handleChange}/>
      <input name="discount" placeholder="Discount" onChange={handleChange}/>
      <input name="payment1" placeholder="Payment1" onChange={handleChange}/>
      <input name="payment2" placeholder="Payment2" onChange={handleChange}/>

      <h3>Total: {finalTotal}</h3>
      <h3>Balance: {balance}</h3>

      <button onClick={save}>Save</button>

      <hr/>

      {invoices.map(i => (
        <div key={i._id}>
          Rs {i.total}
        </div>
      ))}

    </div>
  );
}

export default FIS;