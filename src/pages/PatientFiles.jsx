import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function PatientFiles() {

  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [year, setYear] = useState("2026");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/patient-files/" + year);
      setFiles(res.data);
    } catch {
      alert("Load failed ❌");
    }
  };

  const searchFiles = async () => {
    try {
      const res = await api.get("/patient-files/search/" + search);
      setFiles(res.data);
    } catch {
      alert("Search failed ❌");
    }
  };

  useEffect(() => {
    load();
  }, [year]);

  return (
    <div style={{ padding: 20 }}>

      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>

      <h1>Patient Files 📁</h1>

      {/* YEAR FILTER */}
      <select value={year} onChange={(e)=>setYear(e.target.value)}>
        <option>2026</option>
        <option>2025</option>
        <option>2024</option>
      </select>

      {/* SEARCH */}
      <input
        placeholder="Search name / phone"
        onChange={(e)=>setSearch(e.target.value)}
      />
      <button onClick={searchFiles}>Search</button>

      <hr />

      {/* LIST */}
      {files.map(f => (
        <div key={f._id} style={{ marginBottom: 10 }}>
          <b>{f.data?.patient_info?.name}</b>

          <button
            style={{ marginLeft: 10 }}
            onClick={() =>
              navigate(`/patient-files/file/${f.patient_id}/${f.year}`)
            }
          >
            View File 📄
          </button>

        </div>
      ))}

    </div>
  );
}

export default PatientFiles;