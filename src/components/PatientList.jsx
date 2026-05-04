import { useEffect, useState } from "react";
import api from "../api";

export default function PatientList({ onSelect }) {
  const [patients, setPatients] = useState([]);

  const load = async () => {
    const res = await api.get("/patients/");
    setPatients(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h3>Patients List</h3>

      {patients.map(p => (
        <div key={p._id}>
          <b>{p.name}</b> - {p.phone}

          <button onClick={() => onSelect && onSelect(p)} style={{ marginLeft: 10 }}>
            Select
          </button>
        </div>
      ))}
    </div>
  );
}