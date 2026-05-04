import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

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
    <div style={{ padding: 20 }}>

      <h1>Clinical Reports Module 📊</h1>
      <p>This module allows you to search patients and generate detailed clinical reports.</p>

      <input
        placeholder="Search patient by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: 10, width: 300 }}
      />

      <br /><br />

      {filtered.map(p => (
        <div key={p._id} style={{ marginBottom: 10 }}>

          {p.name} - {p.phone}

          <button
            style={{ marginLeft: 10 }}
            onClick={() => navigate("/reports/" + p._id)}  // ✅ FIXED
          >
            View Report
          </button>

        </div>
      ))}

    </div>
  );
}