import React from "react";

export default function PatientSelect({ patients, selectedId, onChange }) {
  return (
    <select
      value={selectedId}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select Patient</option>

      {patients.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}