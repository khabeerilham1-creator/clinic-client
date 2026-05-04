import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";

function Timeline() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [timeline, setTimeline] = useState([]);
  const [file, setFile] = useState(null);

  // =========================
  // LOAD DATA
  // =========================
  const load = async () => {
    try {
      const t = await api.get("/timeline/" + id);
      setTimeline(t.data);

      const f = await api.get(`/patient-files/file/${id}/2026`);
      setFile(f.data);

    } catch (err) {
      console.log(err);
      alert("Failed to load ❌");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>

      <button onClick={() => navigate("/patients")}>⬅ Back</button>

      <h1>Patient Timeline 🔥</h1>

      {/* ========================= */}
      {/* PATIENT INFO */}
      {/* ========================= */}
      {file?.data?.patient_info && (
        <div style={{ marginBottom: 20 }}>
          <h2>{file.data.patient_info.name}</h2>
          <p>{file.data.patient_info.phone}</p>
        </div>
      )}

      {/* ========================= */}
      {/* TIMELINE */}
      {/* ========================= */}
      <h3>Activity Timeline</h3>

      {timeline.map((t, i) => (
        <div key={i} style={{
          border: "1px solid #ddd",
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          background: "white"
        }}>
          <b>{t.event_type.toUpperCase()}</b>
          <br/>

          <small>
            {new Date(t.created_at).toLocaleString()}
          </small>

          <pre style={{ marginTop: 5 }}>
            {JSON.stringify(t.data, null, 2)}
          </pre>
        </div>
      ))}

      {/* ========================= */}
      {/* FULL DATA VIEW */}
      {/* ========================= */}
      <h3>Full Patient File 📁</h3>

      <div style={{
        background: "#f1f5f9",
        padding: 10,
        borderRadius: 10
      }}>
        <pre>
          {JSON.stringify(file?.data, null, 2)}
        </pre>
      </div>

    </div>
  );
}

export default Timeline;