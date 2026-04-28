import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      {/* 🔥 TEST LINE (IMPORTANT) */}
      <h1>🔥 NEW DASHBOARD WORKING 🔥</h1>

      <p>Welcome to your clinic system.</p>

      <h3>Modules</h3>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Link to="/patients">
          <button>Patients</button>
        </Link>

        <Link to="/visits">
          <button>Visits</button>
        </Link>

        <Link to="/afi">
          <button>AFI</button>
        </Link>

        <Link to="/register">
          <button>Register</button>
        </Link>
      </div>

      <br />

      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
      >
        Logout
      </button>
    </div>
  );
}