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
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "30px", background: "#f8fafc" }}>
        <h1>Dashboard ({role})</h1>

        {/* TOP STATS */}
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <Card title="Patients" value={stats.total_patients} />
          <Card title="Revenue" value={`Rs ${stats.total_revenue}`} />
          <Card title="Checkups" value={stats.total_checkups} />
        </div>

        {/* DAILY */}
        <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
          <Card title="Today Patients" value={daily.daily_patients} />
          <Card title="Today Revenue" value={`Rs ${daily.daily_revenue}`} />
        </div>

        {/* 🔥 NEW: REVENUE SPLIT */}
        <h3>Revenue Split</h3>
        <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
          <Card title="Doctor" value={`Rs ${stats.doctor_share}`} />
          <Card title="Lab" value={`Rs ${stats.lab_share}`} />
          <Card title="Expenses" value={`Rs ${stats.expense_pool}`} />
          <Card title="Owner" value={`Rs ${stats.owner_share}`} />
        </div>

        {/* MODULE GRID */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          {modules.map((m, i) => (
            <Link key={i} to={m.path}>
              <div style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center"
              }}>
                {m.name}
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
      width: 160
    }}>
      <h4>{title}</h4>
      <p>{value || 0}</p>
    </div>
  );
}