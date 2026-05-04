import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [daily, setDaily] = useState({});

  const role = localStorage.getItem("role");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");

    api.get("/dashboard/").then(res => setStats(res.data));
    api.get("/dashboard/daily").then(res => setDaily(res.data));

  }, [navigate]);

  let modules = [
    { name: "Patients", path: "/patients" },
    { name: "Visits", path: "/visits" },
    { name: "Checkup", path: "/checkup" },
    { name: "AFI", path: "/afi" },
    { name: "Prescription", path: "/prescription" },
  ];

  if (role === "doctor") {
    modules.push(
      { name: "AI Assistant", path: "/ai" },
      { name: "CIS", path: "/cis" }
    );
  }

  if (role === "admin") {
    modules.push(
      { name: "FIS", path: "/fis" },
      { name: "Reports", path: "/reports" },
      { name: "Invoice", path: "/invoice" },
      { name: "LVI", path: "/lvi" },
      { name: "Patient Files", path: "/patient-files" }
    );
  }

  if (role === "staff") {
    modules.push({ name: "CIS", path: "/cis" });
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial" }}>

      {/* SIDEBAR */}
      <div style={{
        width: "230px",
        background: "#0f172a",
        color: "white",
        padding: "20px"
      }}>
        <h2>🏥 Clinic</h2>

        {modules.map((m, i) => (
          <Link key={i} to={m.path} style={{ color: "white", display: "block", margin: "10px 0" }}>
            {m.name}
          </Link>
        ))}

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "10px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "30px", background: "#f8fafc" }}>
        <h1>Dashboard ({role})</h1>

        {/* TOP STATS */}
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <Card title="Patients" value={stats.patients} />
          <Card title="Revenue" value={`Rs ${stats.revenue}`} />
          <Card title="Checkups" value={stats.checkups} />
        </div>

        {/* DAILY */}
        <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
          <Card title="Today Patients" value={stats.today_patients} />
          <Card title="Today Revenue" value={`Rs ${stats.today_revenue}`} />
        </div>

        {/* 🔥 CORRECT REVENUE SPLIT */}
        <h3>Revenue Split</h3>
        <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
          <Card title="Doctor (25%)" value={`Rs ${stats.split?.doctor || 0}`} />
          <Card title="Lab Charges" value={`Rs ${stats.split?.lab || 0}`} />
          <Card title="Profit" value={`Rs ${stats.split?.owner || 0}`} />
        </div>

        {/* MODULE GRID */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          {modules.map((m, i) => (
            <Link key={i} to={m.path} style={{ textDecoration: "none" }}>
              <div style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}>
                <h3>{m.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{
      background: "white",
      padding: 20,
      borderRadius: 10,
      width: 170,
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      <h4>{title}</h4>
      <p style={{ fontWeight: "bold", fontSize: "18px" }}>{value || 0}</p>
    </div>
  );
}