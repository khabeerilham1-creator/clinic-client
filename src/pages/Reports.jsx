import React, { useEffect, useState } from "react";
import axios from "axios";

function Reports() {

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/patients");
      setPatients(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load patients");
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div style={{ padding: "20px" }}>

      <h1>Reports</h1>

      {/* SEARCH */}
      <input
        placeholder="Search patient by name or phone..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        style={{ padding: "8px", width: "300px" }}
      />

      <br/><br/>

      {/* LIST */}
      {filteredPatients.map(p => (
        <div
          key={p._id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px"
          }}
        >

          <b>{p.name}</b> <br/>
          Phone: {p.phone} <br/>
          Address: {p.address}

          <br/><br/>

          <button
            onClick={() =>
              window.open(`http://127.0.0.1:8000/report/${p._id}`)
            }
          >
            Show Report
          </button>

        </div>
      ))}

      {filteredPatients.length === 0 && (
        <p>No patients found</p>
      )}

    </div>
  );
}

export default Reports;