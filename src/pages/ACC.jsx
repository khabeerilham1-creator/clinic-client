import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";

import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

// 🔥 ADDED (GLOBAL LAYOUT)
import Layout from "../components/Layout";

export default function ACC() {

  const navigate = useNavigate();

  const [finance, setFinance] = useState({});
  const [rev, setRev] = useState({});
  const [conv, setConv] = useState(0);
  const [docs, setDocs] = useState({});
  const [alerts, setAlerts] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorData, setDoctorData] = useState(null);

  const [range, setRange] = useState("7D");

  useEffect(() => {
    load();
  }, [range]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/acc/live");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFinance(data);
    };

    return () => ws.close();
  }, []);

  const load = async () => {
    const f = await api.get("/acc/finance");
    const r = await api.get("/acc/revenue");
    const d = await api.get("/acc/doctors");
    const c = await api.get("/acc/conversion");

    setFinance(f.data);
    setRev(r.data);
    setDocs(d.data);
    setConv(c.data.conversion);

    let a = [];

    if (f.data.expenses > f.data.revenue) a.push({ msg: "Expenses exceeding revenue", type: "danger" });
    if (f.data.debtors > 50000) a.push({ msg: "High outstanding receivables", type: "warning" });
    if (f.data.profit < 0) a.push({ msg: "Negative profit trend", type: "danger" });

    setAlerts(a);
  };

  const openDoctor = async (doc) => {
    setSelectedDoctor(doc);
    const res = await api.get("/acc/doctor/" + doc);
    setDoctorData(res.data);
  };

  const chartData = [
    { name: "1", value: rev.daily || 0 },
    { name: "2", value: (rev.daily || 0) * 0.8 },
    { name: "3", value: (rev.daily || 0) * 1.1 },
    { name: "4", value: (rev.daily || 0) * 0.9 },
    { name: "Now", value: rev.monthly || 0 }
  ];

  return (

    // 🔥 ONLY CHANGE: WRAPPED INSIDE LAYOUT
    <Layout>

      <h1 style={{ marginBottom: 20 }}>Analytics & Command Center</h1>

      {/* FILTER BAR */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 20
      }}>
        <div>
          {["1D", "7D", "30D"].map(t => (
            <button
              key={t}
              onClick={() => setRange(t)}
              style={{
                marginRight: 10,
                padding: "6px 14px",
                borderRadius: 20,
                border: "1px solid #ddd",
                background: range === t ? "#111827" : "white",
                color: range === t ? "white" : "#333"
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ color: "#6b7280" }}>
          Live System
        </div>
      </div>

      {/* KPI */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 20,
        marginBottom: 20
      }}>
        <Card title="Revenue" value={finance.revenue} />
        <Card title="Profit" value={finance.profit} />
        <Card title="Expenses" value={finance.expenses} />
        <Card title="Conversion" value={conv} suffix="%" />
      </div>

      {/* GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 20
      }}>

        {/* CHART */}
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 10
        }}>
          <h3>Revenue Trend</h3>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="#eee" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#bfdbfe" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ALERTS */}
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 10
        }}>
          <h3>System Alerts</h3>

          {alerts.length === 0
            ? <p style={{ color: "green" }}>System Stable</p>
            : alerts.map((a, i) => (
                <p key={i} style={{
                  color: a.type === "danger" ? "red" : "#f59e0b"
                }}>
                  ⚠ {a.msg}
                </p>
              ))
          }
        </div>

      </div>

      {/* DOCTOR TABLE */}
      <div style={{
        marginTop: 20,
        background: "white",
        padding: 20,
        borderRadius: 10
      }}>
        <h3>Doctor Performance</h3>

        <table width="100%">
          <thead>
            <tr>
              <th align="left">Doctor</th>
              <th align="right">Cases</th>
              <th align="right">Revenue</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(docs).map(([doc, d]) => (
              <tr key={doc} onClick={() => openDoctor(doc)} style={{ cursor: "pointer" }}>
                <td>{doc}</td>
                <td align="right">{d.cases}</td>
                <td align="right">Rs {d.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DRILL PANEL */}
      {selectedDoctor && doctorData && (
        <div style={{
          position: "fixed",
          right: 0,
          top: 0,
          width: 400,
          height: "100vh",
          background: "white",
          padding: 20,
          boxShadow: "-2px 0 10px rgba(0,0,0,0.1)"
        }}>
          <h2>{selectedDoctor}</h2>

          {doctorData.cases.map((c, i) => (
            <div key={i}>
              {c.treatment} - Rs {c.rate}
            </div>
          ))}

          <h3>Total: Rs {doctorData.revenue}</h3>

          <button onClick={() => setSelectedDoctor(null)}>Close</button>
        </div>
      )}

    </Layout>
  );
}

/* COMPONENTS */

function Card({ title, value, suffix = "" }) {
  return (
    <div style={{
      background: "white",
      padding: 20,
      borderRadius: 10,
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
    }}>
      <p style={{ color: "#6b7280" }}>{title}</p>
      <h2>
        <CountUp end={value || 0} duration={1} />{suffix}
      </h2>
    </div>
  );
}

function SidebarItem({ text }) {
  return (
    <p style={{ marginBottom: 15, color: "#9ca3af" }}>
      {text}
    </p>
  );
}