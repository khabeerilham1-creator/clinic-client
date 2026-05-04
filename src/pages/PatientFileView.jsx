import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";

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

  if (!file) return <div style={{ padding: 20 }}>Loading...</div>;

  const info = file.patient_info || {};

  return (
    <div style={{ padding: 20 }}>

      <button onClick={() => navigate("/patient-files")}>⬅ Back</button>

      {/* 🔥 PRINT BUTTON (ONLY ADDED) */}
      <a
        href={`http://localhost:8000/patient-file-pdf/${id}/${year}`}
        target="_blank"
        rel="noreferrer"
      >
        <button style={{ marginLeft: 10 }}>
          Print Full File 🧾
        </button>
      </a>

      <h1>Patient File ({year}) 📁</h1>

      {/* ========================= */}
      {/* PATIENT HEADER */}
      {/* ========================= */}
      <div style={{
        background: "white",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
      }}>
        <h2>{info.name}</h2>
        <p>📞 {info.phone}</p>
        <p>🧬 {info.gender} | 🎂 {info.age}</p>
        <p>📍 {info.address}</p>
      </div>

      {/* ========================= */}
      {/* TABS */}
      {/* ========================= */}
      <div style={{ marginBottom: 20 }}>
        {["overview", "clinical", "financial", "timeline"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              marginRight: 10,
              padding: "8px 12px",
              background: tab === t ? "#0f172a" : "#e2e8f0",
              color: tab === t ? "white" : "black",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
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
            <div key={i} style={{
              background: "white",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
              borderLeft: "4px solid #0f172a"
            }}>
              <b>{t.event_type}</b>
              <br/>
              <small>{new Date(t.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

function Card({ title, data }) {
  return (
    <div style={{
      background: "white",
      padding: 15,
      marginBottom: 15,
      borderRadius: 10
    }}>
      <h3>{title}</h3>
      <p>{data || "No data"}</p>
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3>{title}</h3>

      {items?.length ? items.map((item, i) => (
        <div key={i} style={{
          background: "white",
          padding: 10,
          marginBottom: 10,
          borderRadius: 8
        }}>
          {Object.entries(item).map(([k, v]) => (
            <div key={k}>
              <b>{k}:</b> {String(v)}
            </div>
          ))}
        </div>
      )) : (
        <p>No data</p>
      )}
    </div>
  );
}

export default PatientFileView;