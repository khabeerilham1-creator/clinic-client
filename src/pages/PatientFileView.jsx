import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function PatientFileView() {

  const { id } = useParams();
  const year = new Date().getFullYear();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [tab, setTab] = useState("overview");

  const load = async () => {
    try {
      const res = await api.get(`/patient-files/file/${id}/${year}`);
      setFile(res.data?.data);
    } catch {
      alert("Failed to load ❌");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!file) return <Layout><div style={{ padding: 20 }}>Loading...</div></Layout>;

  const info = file.patient_info || {};

  return (
    <Layout>

      {/* HEADER */}
      <div style={header}>
        <div>
          <button onClick={() => navigate("/patient-files")}>⬅ Back</button>
          <h1 style={{ marginTop: 10 }}>Patient File ({year}) 📁</h1>
        </div>

        <a
          href={`http://localhost:8000/patient-file-pdf/${id}/${year}`}
          target="_blank"
          rel="noreferrer"
        >
          <button style={printBtn}>🧾 Print File</button>
        </a>
      </div>

      {/* PATIENT CARD */}
      <div style={card}>
        <h2>{info.name}</h2>
        <p>📞 {info.phone}</p>
        <p>🧬 {info.gender} | 🎂 {info.age}</p>
        <p>📍 {info.address}</p>
      </div>

      {/* TABS */}
      <div style={tabs}>
        {["overview", "clinical", "financial", "timeline"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...tabBtn,
              background: tab === t ? "#0f172a" : "#e5e7eb",
              color: tab === t ? "white" : "#111"
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {tab === "overview" && (
        <div style={grid}>
          <Card title="Conditions" data={info.conditions} />
          <Card title="Complaints" data={info.complaints} />
        </div>
      )}

      {tab === "clinical" && (
        <div>
          <Section title="Checkups" items={file.checkups} />
          <Section title="Visits" items={file.visits} />
        </div>
      )}

      {tab === "financial" && (
        <div>
          <Section title="Billing" items={file.billing} />
          <Section title="Payments" items={file.payments} />
        </div>
      )}

      {tab === "timeline" && (
        <div>
          {file.timeline?.map((t, i) => (
            <div key={i} style={timelineCard}>
              <div>
                <b>{t.event_type}</b>
                <br />
                <small>{new Date(t.created_at).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}

    </Layout>
  );
}

/* ========================= COMPONENTS ========================= */

function Card({ title, data }) {
  return (
    <div style={card}>
      <h3>{title}</h3>
      <p>{data || "No data"}</p>
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div style={{ marginBottom: 25 }}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>

      {items?.length ? items.map((item, i) => (
        <div key={i} style={card}>
          {Object.entries(item).map(([k, v]) => (
            <div key={k}>
              <b>{k}:</b> {String(v)}
            </div>
          ))}
        </div>
      )) : (
        <p style={{ color: "#64748b" }}>No data</p>
      )}
    </div>
  );
}

/* ========================= STYLES ========================= */

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20
};

const printBtn = {
  padding: "10px 15px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const tabs = {
  display: "flex",
  gap: 10,
  marginBottom: 20
};

const tabBtn = {
  padding: "8px 14px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const card = {
  background: "white",
  padding: 15,
  borderRadius: 10,
  marginBottom: 15,
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
  gap: 15
};

const timelineCard = {
  background: "white",
  padding: 12,
  borderRadius: 8,
  marginBottom: 10,
  borderLeft: "4px solid #0f172a"
};

export default PatientFileView;