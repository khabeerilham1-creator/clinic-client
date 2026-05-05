import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

// 🔥 ADDED
import Layout from "../components/Layout";

export default function Reports() {

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const res = await api.get("/patients/");
    setPatients(res.data);
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (

    <Layout>

      <h1 style={{ marginBottom: 10 }}>Clinical Reports Module 📊</h1>
      <p style={{ marginBottom: 20 }}>
        Search patients and generate detailed clinical reports.
      </p>

      {/* SEARCH BOX */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>
        <input
          placeholder="Search patient by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: 10,
            width: "100%",
            borderRadius: 6,
            border: "1px solid #ccc"
          }}
        />
      </div>

      {/* RESULTS */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <h3>Patient Results</h3>

        {filtered.length === 0 && (
          <p style={{ color: "#888" }}>No patients found</p>
        )}

        {filtered.map(p => (
          <div key={p._id} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eee",
            padding: "10px 0"
          }}>

            <div>
              <b>{p.name}</b><br/>
              <span style={{ color: "#666" }}>{p.phone}</span>
            </div>

            <button
              onClick={() => navigate("/reports/" + p._id)}
              style={{
                padding: "6px 12px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 6
              }}
            >
              View Report
            </button>

          </div>
        ))}

      </div>

    </Layout>
  );
}