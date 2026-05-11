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
  // LOAD DASHBOARD
  // =========================
  const loadDashboard = async (
    selectedMonth,
    selectedYear
  ) => {

    try {

      let url = "/dashboard/";

      if (
        selectedMonth &&
        selectedYear
      ) {

        url += `?month=${selectedMonth}&year=${selectedYear}`;
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
      icon: "👤"
    },

    {
      name: "Visits",
      path: "/visits",
      icon: "🩺"
    },

    {
      name: "Checkup",
      path: "/checkup",
      icon: "🦷"
    }

  ];

  return (

    <Layout>

      {/* HEADER */}
      <div style={{
        marginBottom: 30,
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center"
      }}>

        <div>

          <h1 style={{
            fontSize: 28,
            marginBottom: 5
          }}>
            Dashboard
          </h1>

          <p style={{
            color: "#64748b"
          }}>
            Revenue Analytics
          </p>

        </div>

        {/* MONTH FILTER */}
        <div style={{
          display: "flex",
          gap: 10
        }}>

          <select
            value={
              month
            }
            onChange={(e)=>
              setMonth(
                e.target.value
              )
            }
            style={filterInput}
          >

            <option value="">
              Month
            </option>

            {(stats.available_months || [])
              .map((m, i) => (

              <option
                key={i}
                value={m.month}
              >
                {m.month_name}
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
              Year
            </option>

            {(stats.available_months || [])
              .map((m, i) => (

              <option
                key={i}
                value={m.year}
              >
                {m.year}
              </option>

            ))}

          </select>

          <button
            onClick={() =>
              loadDashboard(
                month,
                year
              )
            }
            style={{
              padding:
                "10px 18px",
              border: "none",
              borderRadius: 8,
              background:
                "#2563eb",
              color: "white",
              cursor: "pointer"
            }}
          >
            Filter
          </button>

        </div>

      </div>

      {/* KPI */}
      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(220px,1fr))",
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
      <div style={{
        background:
          "linear-gradient(135deg, #06b6d4, #2563eb)",

        color: "white",

        padding: 25,

        borderRadius: 16,

        marginBottom: 30
      }}>

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

      {/* MODULE GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fill, minmax(180px,1fr))",

        gap: 20
      }}>

        {modules.map((m, i) => (

          <Link
            key={i}
            to={m.path}
            style={{
              textDecoration:
                "none"
            }}
          >

            <div
              style={{
                background:
                  "white",

                padding: 20,

                borderRadius: 14,

                textAlign:
                  "center",

                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.05)"
              }}
            >

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

      <p style={{
        color: "#64748b"
      }}>
        {title}
      </p>

      <h2>
        {value || 0}
      </h2>

    </div>
  );
}

const filterInput = {

  padding: 10,

  borderRadius: 8,

  border:
    "1px solid #cbd5e1"
};