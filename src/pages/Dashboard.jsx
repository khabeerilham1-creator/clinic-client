import React, { useState } from "react";
import axios from "axios";

function Dashboard() {

  const [id, setId] = useState("");
  const [data, setData] = useState(null);

  const load = async () => {
    const res = await axios.get(`http://127.0.0.1:8000/dashboard/${id}`);
    setData(res.data);
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>Patient Dashboard</h1>

      <input placeholder="Patient ID" onChange={(e)=>setId(e.target.value)} />
      <button onClick={load}>Load</button>

      {data && (
        <div>

          {/* PATIENT */}
          <div style={card}>
            <h2>Patient Info</h2>
            <p>{data.patient?.name}</p>
            <p>{data.patient?.phone}</p>
          </div>

          {/* CHECKUPS */}
          <div style={card}>
            <h2>Checkups</h2>
            {data.checkups.map((c,i)=>(
              <p key={i}>{c.complaint}</p>
            ))}
          </div>

          {/* INVOICES */}
          <div style={card}>
            <h2>Invoices</h2>
            {data.invoices.map((i)=>(
              <p key={i._id}>Rs {i.total}</p>
            ))}
          </div>

          {/* APPOINTMENTS */}
          <div style={card}>
            <h2>Appointments</h2>
            {data.appointments.map((a)=>(
              <p key={a._id}>
                {a.appointment_date} - {a.appointment_time}
              </p>
            ))}
          </div>

          {/* CIS + IMAGE */}
          <div style={card}>
            <h2>Clinical Records</h2>
            {data.cis.map((c)=>(
              <div key={c._id}>
                <p>{c.treatment_plan}</p>

                {c.photo && (
                  <img
                    src={`http://127.0.0.1:8000/${c.photo}`}
                    alt=""
                    style={{ width: "150px" }}
                  />
                )}
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

const card = {
  border: "1px solid #ccc",
  padding: "15px",
  marginTop: "15px",
  borderRadius: "10px",
  background: "#f9f9f9"
};

export default Dashboard;