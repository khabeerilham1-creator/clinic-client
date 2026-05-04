import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://pis-backend-final-1.onrender.com";

function PatientSelect({ onSelect }) {
  const [patients, setPatients] = useState([]); // always array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(BASE_URL + "/patients/", getAuthHeaders());

      // safety check
      if (Array.isArray(res.data)) {
        setPatients(res.data);
      } else {
        setPatients([]);
      }

    } catch (err) {
      console.error("Error fetching patients:", err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>Select Patient</h3>

      <select
        onChange={(e) => {
          const selected = patients.find(p => p._id === e.target.value);
          if (onSelect) onSelect(selected);
        }}
        style={{ padding: "8px", width: "250px" }}
      >
        <option value="">-- Select Patient --</option>

        {loading ? (
          <option disabled>Loading...</option>
        ) : patients.length === 0 ? (
          <option disabled>No patients found</option>
        ) : (
          patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.patient_no || "No ID"})
            </option>
          ))
        )}
      </select>
    </div>
  );
}

export default PatientSelect;