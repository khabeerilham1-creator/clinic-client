import React, { useEffect, useState } from "react";
import axios from "axios";

function PatientSelect({ onSelect }) {

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    axios.get("http://https://pis-python-backend.onrender.com:8000/patients")
      .then(res => setPatients(res.data));
  }, []);

  return (
    <select onChange={(e)=>{
      const p = patients.find(x => x.patient_no == e.target.value);
      onSelect(p);
    }}>
      <option>Select Patient</option>
      {patients.map(p => (
        <option key={p._id} value={p.patient_no}>
          {p.patient_no} - {p.name}
        </option>
      ))}
    </select>
  );
}

export default PatientSelect;