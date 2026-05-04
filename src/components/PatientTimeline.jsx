import { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";

export default function PatientTimeline() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/timeline/" + id)
      .then(res => setData(res.data));
  }, [id]);

  return (
    <div style={{ padding: 20 }}>

      <button onClick={() => navigate("/patients")}>⬅ Back</button>

      <h1>Patient Full History 🔥</h1>

      {data.map((item, i) => (
        <div key={i} style={{
          border: "1px solid #ccc",
          marginBottom: 10,
          padding: 10,
          borderRadius: 6
        }}>
          <b>{item.event_type}</b>

          <br/>

          <pre style={{ fontSize: 12 }}>
            {JSON.stringify(item.data, null, 2)}
          </pre>
        </div>
      ))}

    </div>
  );
}