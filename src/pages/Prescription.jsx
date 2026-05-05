import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Prescription() {

const navigate = useNavigate();

const [form, setForm] = useState({
name: "",
phone: "",
date: ""
});

const [meds, setMeds] = useState([
{ name: "", dosage: "", duration: "" }
]);

const [notes, setNotes] = useState("");

const [list, setList] = useState([]);

const load = async () => {
try {
const res = await api.get("/prescription/");
setList(res.data || []);
} catch {
console.log("LOAD ERROR");
}
};

useEffect(() => {
load();
}, []);

const handleChange = (e) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

const updateMed = (i, field, value) => {
const updated = [...meds];
updated[i][field] = value;
setMeds(updated);
};

const addMed = () => {
setMeds([...meds, { name: "", dosage: "", duration: "" }]);
};

const deleteMed = (index) => {
const updated = meds.filter((_, i) => i !== index);
setMeds(updated);
};

const save = async () => {
try {
await api.post("/prescription/", {
...form,
medicines: meds,
notes
});

```
  alert("Saved ✅");
  load();

} catch {
  alert("Error ❌");
}
```

};

const deletePrescription = async (id) => {
try {
await api.delete("/prescription/" + id);
load();
} catch {
alert("Delete failed ❌");
}
};

return (
<div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>

```
  <div style={{
    width: "220px",
    background: "#111827",
    color: "white",
    padding: "20px"
  }}>
    <h2 style={{ marginBottom: 30 }}>Clinic SaaS</h2>

    <div style={{ cursor: "pointer", marginBottom: 15 }} onClick={() => navigate("/dashboard")}>
      🏠 Dashboard
    </div>

    <div style={{ cursor: "pointer", marginBottom: 15, color: "#60a5fa" }}>
      💊 Prescription
    </div>
  </div>

  <div style={{ flex: 1, padding: "30px" }}>

    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20
    }}>
      <h1 style={{ margin: 0 }}>Prescription Module 💊</h1>
      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
    </div>

    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
    }}>

      <h3>Patient Info</h3>

      <input name="name" placeholder="Name" onChange={handleChange} /><br/><br/>
      <input name="phone" placeholder="Phone" onChange={handleChange} /><br/><br/>
      <input type="date" name="date" onChange={handleChange} /><br/><br/>

      <h3>Medicines</h3>

      {meds.map((m, i) => (
        <div key={i}>
          <input placeholder="Medicine"
            onChange={(e)=>updateMed(i, "name", e.target.value)} />

          <input placeholder="Dosage"
            onChange={(e)=>updateMed(i, "dosage", e.target.value)} />

          <input placeholder="Duration"
            onChange={(e)=>updateMed(i, "duration", e.target.value)} />

          <button onClick={() => deleteMed(i)}>❌</button>

          <br/><br/>
        </div>
      ))}

      <button onClick={addMed}>+ Add Medicine</button>

      <h3>Notes</h3>
      <textarea onChange={(e)=>setNotes(e.target.value)} />

      <br/><br/>

      <button onClick={save}>Save</button>

      <hr />

      <h2>Saved Prescriptions 📄</h2>

      {list.map((p) => (
        <div key={p._id} style={{ marginBottom: 10 }}>
          <b>{p.name}</b> - {p.phone}

          <a
            href={`https://pis-backend-final-1.onrender.com/prescription/pdf/${encodeURIComponent(p.name)}`}
            target="_blank"
            rel="noreferrer"
          >
            <button style={{ marginLeft: 5 }}>PDF</button>
          </a>

          <button
            onClick={() => deletePrescription(p._id)}
            style={{ marginLeft: 5, background: "red", color: "white" }}
          >
            Delete
          </button>
        </div>
      ))}

    </div>
  </div>
</div>
```

);
}

export default Prescription;
