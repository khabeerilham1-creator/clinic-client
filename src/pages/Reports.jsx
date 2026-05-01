import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Reports() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
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
      console.log("REPORT ERROR:", err.response?.data || err);
      alert("Failed to load patients ❌");
    }
  };

  // =========================
  // SEARCH FILTER
  // =========================
  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  // =========================
  // VIEW REPORT
  // =========================
  const viewReport = (id) => {
    const token = localStorage.getItem("token");

    window.open(
      `https://pis-backend-final-1.onrender.com/reports/${id}?token=${token}`,
      "_blank"
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Clinical Reports Module 📊</h1>

      <p>
        This module allows you to search patients and generate detailed clinical reports.
      </p>

      <input
        placeholder="Search patient by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <br /><br />

      {filtered.length === 0 ? (
        <p>No patients found</p>
      ) : (
        filtered.map((p) => (
          <div key={p._id} style={{ marginBottom: 10 }}>
            <b>{p.name}</b> - {p.phone}
            <br />
            <button onClick={() => viewReport(p._id)}>
              View Report
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Reports;