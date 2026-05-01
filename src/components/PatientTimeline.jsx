import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://pis-backend-final-1.onrender.com";

export default function PatientTimeline({ patientId }) {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (!patientId) return;

    axios.get(BASE_URL + "/api/timeline/" + patientId)
      .then(res => setTimeline(res.data))
      .catch(err => console.log(err));
  }, [patientId]);

  return (
    <div style={{ marginTop: 10 }}>
      <h4>Timeline</h4>

      {timeline.length === 0 && <p>No records</p>}

      {timeline.map((item, i) => (
        <div key={i} style={{
          border: "1px solid #ccc",
          padding: 8,
          marginBottom: 6,
          borderRadius: 6
        }}>
          <b>{item.type.toUpperCase()}</b>
          <p>{item.date || item.created_at}</p>

          <details>
            <summary>View</summary>
            <pre style={{ fontSize: 11 }}>
              {JSON.stringify(item.data, null, 2)}
            </pre>
          </details>
        </div>
      ))}
    </div>
  );
}