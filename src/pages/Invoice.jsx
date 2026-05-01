import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Invoice({ setIsLoggedIn }) {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState("");

  const BASE_URL = "https://pis-backend-final-1.onrender.com";

  // =========================
  // AUTH CHECK
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required ❌");
      navigate("/");
    } else {
      loadPatients();
    }
  }, [navigate]);

  // =========================
  // LOAD PATIENTS
  // =========================
  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");
      setPatients(res.data);
    } catch (err) {
      console.log("PATIENT LOAD ERROR:", err.response?.data || err);
      alert("Failed to load patients ❌");
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

      <h3>Select Patient</h3>

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">-- Select Patient --</option>

        {patients.map((p) => (
          <option key={p._id} value={p.name}>
            {p.name} ({p.phone})
          </option>
        ))}
      </select>

      <br/><br/>

      {selected && (
        <a
          href={`${BASE_URL}/invoice-pdf/${selected}`}
          target="_blank"
          rel="noreferrer"
        >
          <button>Generate Invoice PDF 🧾</button>
        </a>
      )}

    </div>
  );
}

export default Invoice;