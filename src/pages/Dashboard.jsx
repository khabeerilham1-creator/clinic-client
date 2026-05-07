import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function Dashboard() {

  const navigate = useNavigate();
  const [stats, setStats] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");

    api.get("/dashboard/")
      .then(res => setStats(res.data))
      .catch(() => setStats({}));

  }, [navigate]);

  const modules = [
    { name: "Patients", path: "/patients", icon: "👤" },
    { name: "Visits", path: "/visits", icon: "🩺" },
    { name: "Checkup", path: "/checkup", icon: "🦷" },
    { name: "AFI", path: "/afi", icon: "📋" },
    { name: "Prescription", path: "/prescription", icon: "💊" },
    { name: "FIS", path: "/fis", icon: "💰" },
    { name: "Invoice", path: "/invoice", icon: "🧾" },
    { name: "LVI", path: "/lvi", icon: "🏭" },
    { name: "Reports", path: "/reports", icon: "📄" },
    { name: "Patient Files", path: "/patient-files", icon: "📁" },
    { name: "ACC", path: "/acc", icon: "📊" },
    { name: "HAI", path: "/hai", icon: "👨‍⚕️" },
    { name: "<h1>ACCOUNT RECEIVABLE</h1>", path: "/<h1>ACCOUNT RECEIVABLE</h1>", icon: "📉" },
    { name: "<h1>ACCOUNT PAYABLE</h1>", path: "/<h1>ACCOUNT PAYABLE</h1>", icon: "📈" },
    { name: "Bills", path: "/bills", icon: "💸" }
  ];

  return (
    <Layout>

      {/* HEADER */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28 }}>Dashboard</h1>
        <p style={{ color: "#64748b" }}>
          Welcome to Holistic Domain of Creativity
        </p>
      </div>

      {/* KPI CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
        gap: 20,
        marginBottom: 30
      }}>
        <KPI title="Patients" value={stats.patients} color="#6366f1" />
        <KPI title="Revenue" value={`Rs ${stats.revenue || 0}`} color="#22c55e" />
        <KPI title="Checkups" value={stats.checkups} color="#f59e0b" />
        <KPI title="Today Revenue" value={`Rs ${stats.today_revenue || 0}`} color="#ef4444" />
      </div>

      {/* HIGHLIGHT CARD */}
      <div style={{
        background: "linear-gradient(135deg, #06b6d4, #2563eb)",
        color: "white",
        padding: 25,
        borderRadius: 16,
        marginBottom: 30,
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
      }}>
        <h2 style={{ marginBottom: 10 }}>Clinic Overview</h2>

        <p>Total Revenue: Rs {stats.revenue || 0}</p>

        <p>Today's Patients: {stats.today_patients || 0}</p>

        <p>Logged Role: {localStorage.getItem("role")}</p>
      </div>

      {/* MODULE GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))",
        gap: 20
      }}>
        {modules.map((m, i) => (
          <Link key={i} to={m.path} style={{ textDecoration: "none" }}>
            <div style={{
              background: "white",
              padding: 20,
              borderRadius: 14,
              textAlign: "center",
              transition: "all 0.25s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
            }}
            >
              <div style={{ fontSize: 30 }}>{m.icon}</div>
              <h4 style={{ marginTop: 10 }}>{m.name}</h4>
            </div>
          </Link>
        ))}
      </div>

    </Layout>
  );
}

/* KPI CARD */

function KPI({ title, value, color }) {
  return (
    <div style={{
      background: "white",
      padding: 20,
      borderRadius: 14,
      borderLeft: `6px solid ${color}`,
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
    }}>
      <p style={{ color: "#64748b" }}>{title}</p>
      <h2 style={{ marginTop: 5 }}>{value || 0}</h2>
    </div>
  );
}