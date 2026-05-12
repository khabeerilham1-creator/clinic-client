import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import api from "../api";

import Layout from "../components/Layout";

export default function Dashboard() {

  const navigate =
    useNavigate();

  const [stats, setStats] =
    useState({});

  const [month, setMonth] =
    useState("");

  const [year, setYear] =
    useState("");

  // =========================
  // USER ACCESS
  // =========================
  const role =
    localStorage.getItem("role");

  const permissions =
    JSON.parse(
      localStorage.getItem(
        "permissions"
      ) || "{}"
    );

  const isAdmin =
    role === "CEO" ||
    role === "admin";

  const canView = (
    permission
  ) => {

    if (isAdmin) {
      return true;
    }

    return (
      permissions[permission]
      === "enabled"
    );
  };

  // =========================
  // LOAD DASHBOARD
  // =========================
  const loadDashboard = async (
    selectedMonth,
    selectedYear
  ) => {

    try {

      let url =
        "/dashboard/";

      if (
        selectedMonth &&
        selectedYear
      ) {

        url +=
          `?month=${selectedMonth}&year=${selectedYear}`;
      }

      const res =
        await api.get(url);

      setStats(res.data);

    } catch {

      setStats({});
    }
  };

  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {

      navigate("/");
    }

    loadDashboard();

  }, [navigate]);

  // =========================
  // MODULES
  // =========================
  const modules = [

    {
      name: "Patients",
      path: "/patients",
      icon: "👤",
      permission: "patients"
    },

    {
      name: "Visits",
      path: "/visits",
      icon: "🩺",
      permission: "visits"
    },

    {
      name: "Checkup",
      path: "/checkup",
      icon: "🦷",
      permission: "checkup"
    },

    {
      name: "AFI",
      path: "/afi",
      icon: "📋",
      permission: "afi"
    },

    {
      name: "CIS",
      path: "/cis",
      icon: "🧠",
      permission: "cis"
    },

    {
      name: "Prescription",
      path: "/prescription",
      icon: "💊",
      permission: "prescription"
    },

    {
      name: "FIS",
      path: "/fis",
      icon: "💰",
      permission: "fis"
    },

    {
      name: "Invoice",
      path: "/invoice",
      icon: "🧾",
      permission: "invoice"
    },

    {
      name: "LVI",
      path: "/lvi",
      icon: "🏭",
      permission: "lvi"
    },

    {
      name:
        "Patient Account Status",

      path:
        "/patient-account-status",

      icon: "💳",

      permission:
        "patient_account_status"
    },

    {
      name:
        "City Patients",

      path:
        "/city-patients",

      icon: "🌍",

      permission:
        "city_patients"
    },

    {
      name:
        "Completed Cases",

      path:
        "/completed-cases",

      icon: "✅",

      permission:
        "completed_cases"
    },

    {
      name:
        "Pending Cases",

      path:
        "/pending-cases",

      icon: "⏳",

      permission:
        "pending_cases"
    },

    {
      name:
        "To Be Appointed",

      path:
        "/to-be-appointed",

      icon: "📅",

      permission:
        "to_be_appointed"
    },

    {
      name:
        "To Be Excepted",

      path:
        "/to-be-excepted",

      icon: "🚫",

      permission:
        "to_be_excepted"
    },

    {
      name: "ACC",
      path: "/acc",
      icon: "📊",
      permission: "acc"
    },

    {
      name: "HAI",
      path: "/hai",
      icon: "👨‍⚕️",
      permission: "hai"
    },

    {
      name: "ARS",
      path: "/ars",
      icon: "🚨",
      permission: "ars"
    },

    {
      name:
        "ACCOUNT RECEIVABLE",

      path:
        "/debtors",

      icon: "📉",

      permission:
        "debtors"
    },

    {
      name:
        "ACCOUNT PAYABLE",

      path:
        "/creditors",

      icon: "📈",

      permission:
        "creditors"
    },

    {
      name: "Bills",
      path: "/bills",
      icon: "💸",
      permission: "bills"
    },

    {
      name: "Reports",
      path: "/reports",
      icon: "📄",
      permission: "reports"
    },

    {
      name:
        "Patient Files",

      path:
        "/patient-files",

      icon: "📁",

      permission:
        "patient_files"
    }

  ];

  return (

    <Layout>

      {/* HEADER */}
      <div style={{
        marginBottom: 30
      }}>

        <h1 style={{
          fontSize: 28,
          marginBottom: 5
        }}>
          Dashboard
        </h1>

        <p style={{
          color: "#64748b"
        }}>
          Clinic Management
        </p>

      </div>

      {/* ADMIN ONLY */}
      {isAdmin && (

        <>

          {/* FILTER */}
          <div style={{
            display: "flex",
            gap: 10,
            marginBottom: 25
          }}>

            <select
              value={month}
              onChange={(e)=>
                setMonth(
                  e.target.value
                )
              }
              style={filterInput}
            >
              <option value="">
                Select Month
              </option>

              {[...Array(12)].map(
                (_, i) => (

                <option
                  key={i}
                  value={i + 1}
                >
                  {new Date(
                    0,
                    i
                  ).toLocaleString(
                    "default",
                    {
                      month: "long"
                    }
                  )}
                </option>

              ))}
            </select>

            <select
              value={year}
              onChange={(e)=>
                setYear(
                  e.target.value
                )
              }
              style={filterInput}
            >

              <option value="">
                Select Year
              </option>

              <option value="2024">
                2024
              </option>

              <option value="2025">
                2025
              </option>

              <option value="2026">
                2026
              </option>

            </select>

            <button
              onClick={() =>
                loadDashboard(
                  month,
                  year
                )
              }
              style={filterBtn}
            >
              Filter
            </button>

          </div>

          {/* KPI */}
          <div style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",

            gap: 20,

            marginBottom: 30
          }}>

            <KPI
              title="Patients"
              value={stats.patients}
              color="#6366f1"
            />

            <KPI
              title="Monthly Revenue"
              value={`Rs ${stats.revenue || 0}`}
              color="#22c55e"
            />

            <KPI
              title="Checkups"
              value={stats.checkups}
              color="#f59e0b"
            />

            <KPI
              title="Today Revenue"
              value={`Rs ${stats.today_revenue || 0}`}
              color="#ef4444"
            />

          </div>

          {/* OVERVIEW */}
          <div style={overviewCard}>

            <h2>
              Revenue Overview
            </h2>

            <p>
              Monthly Revenue:
              Rs {stats.revenue || 0}
            </p>

            <p>
              Doctor Share:
              Rs {stats?.split?.doctor || 0}
            </p>

            <p>
              Lab Share:
              Rs {stats?.split?.lab || 0}
            </p>

            <p>
              Owner Profit:
              Rs {stats?.split?.owner || 0}
            </p>

          </div>

        </>

      )}

      {/* MODULE GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fill,minmax(180px,1fr))",

        gap: 20
      }}>

        {modules
        .filter((m)=>
          canView(
            m.permission
          )
        )
        .map((m, i) => (

          <Link
            key={i}
            to={m.path}
            style={{
              textDecoration:
                "none"
            }}
          >

            <div style={moduleCard}>

              <div style={{
                fontSize: 30
              }}>
                {m.icon}
              </div>

              <h4 style={{
                marginTop: 10
              }}>
                {m.name}
              </h4>

            </div>

          </Link>

        ))}

      </div>

    </Layout>
  );
}

/* KPI */
function KPI({
  title,
  value,
  color
}) {

  return (

    <div style={{
      background: "white",
      padding: 20,
      borderRadius: 14,
      borderLeft:
        `6px solid ${color}`
    }}>

      <p>
        {title}
      </p>

      <h2>
        {value || 0}
      </h2>

    </div>
  );
}

const moduleCard = {

  background: "white",

  padding: 20,

  borderRadius: 14,

  textAlign: "center",

  boxShadow:
    "0 2px 8px rgba(0,0,0,0.05)"
};

const overviewCard = {

  background:
    "linear-gradient(135deg,#06b6d4,#2563eb)",

  color: "white",

  padding: 25,

  borderRadius: 16,

  marginBottom: 30
};

const filterInput = {

  padding: 10,

  borderRadius: 8,

  border:
    "1px solid #cbd5e1"
};

const filterBtn = {

  padding:
    "10px 18px",

  border: "none",

  borderRadius: 8,

  background:
    "#2563eb",

  color: "white",

  cursor: "pointer"
};