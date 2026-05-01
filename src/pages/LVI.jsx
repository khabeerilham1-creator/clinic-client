import React, { useEffect, useState } from "react";
import api from "../api";

function LVI() {

  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    patient_name: "",
    tooth: "",
    note: ""
  });

  // =========================
  // LOAD DATA
  // =========================
  const load = async () => {
    try {
      const res = await api.get("/lvi/");

      console.log("LVI DATA:", res.data);

      if (Array.isArray(res.data)) {
        setRecords(res.data);
      } else if (res.data.data) {
        setRecords(res.data.data);
      } else {
        setRecords([]);
      }

    } catch (err) {
      console.log("LVI LOAD ERROR:", err.response?.data || err);
      setRecords([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // SAVE
  // =========================
  const save = async () => {
    try {
      await api.post("/lvi/", form);

      alert("Saved ✅");

      setForm({
        patient_name: "",
        tooth: "",
        note: ""
      });

      load();

    } catch (err) {
      console.log("SAVE ERROR:", err.response?.data || err);
      alert("Error ❌");
    }
  };

  // =========================
  // DELETE
  // =========================
  const del = async (id) => {
    try {
      await api.delete("/lvi/" + id);
      load();
    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>LVI Module</h1>

      {/* FORM */}
      <input
        name="patient_name"
        placeholder="Patient Name"
        value={form.patient_name}
        onChange={handleChange}
      /><br/><br/>

      <input
        name="tooth"
        placeholder="Tooth"
        value={form.tooth}
        onChange={handleChange}
      /><br/><br/>

      <input
        name="note"
        placeholder="Note"
        value={form.note}
        onChange={handleChange}
      /><br/><br/>

      <button onClick={save}>Save</button>

      <hr />

      {/* LIST */}
      <h2>Records</h2>

      {Array.isArray(records) && records.length > 0 ? (
        records.map((r) => (
          <div key={r._id}>
            <b>{r.patient_name}</b> - {r.tooth} - {r.note}
            <br/>
            <button onClick={() => del(r._id)}>Delete</button>
            <hr />
          </div>
        ))
      ) : (
        <p>No data</p>
      )}

    </div>
  );
}

export default LVI;