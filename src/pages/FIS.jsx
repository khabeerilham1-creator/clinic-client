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
    discount: "",
    payment1: "",
    payment2: ""
  });

  const [finalTotal, setFinalTotal] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");

    const total = (Number(data.qty) || 0) * (Number(data.rate) || 0);
    const discount = (total * (Number(data.discount) || 0)) / 100;
    const final = total - discount;
    const paid = (Number(data.payment1) || 0) + (Number(data.payment2) || 0);

    setFinalTotal(final);
    setBalance(final - paid);

  }, [data, navigate]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const save = async () => {
    if (!patient) return alert("Select patient");

    await axios.post(BASE_URL + "/invoice", {
      ...data,
      patient: patient.patient_no,
      total: finalTotal,
      balance
    });

    alert("Saved");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>FIS</h1>

      <PatientSelect onSelect={setPatient} />

      <input name="procedure" onChange={handleChange}/>
      <input name="qty" onChange={handleChange}/>
      <input name="rate" onChange={handleChange}/>

      <h3>{finalTotal}</h3>

      <button onClick={save}>Save</button>
    </div>
  );
}

export default FIS;