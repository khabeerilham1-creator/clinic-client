import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function Bills() {

  const navigate = useNavigate();

  const [type, setType] = useState("clinic");
  const [rows, setRows] = useState([{ title: "", amount: "" }]);
  const [date, setDate] = useState("");
  const [records, setRecords] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await api.get("/bills/");
    setRecords(res.data || []);
  };

  const handleChange = (i, field, value) => {
    const updated = [...rows];
    updated[i][field] = value;
    setRows(updated);
  };

  const addRow = () => setRows([...rows, { title: "", amount: "" }]);

  const removeRow = (i) => {
    setRows(rows.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    await api.post("/bills/", { type, date, rows });
    setRows([{ title: "", amount: "" }]);
    setDate("");
    load();
  };

  const remove = async (id) => {
    await api.delete("/bills/" + id);
    load();
  };

  const clinic = records.filter(r => r.type === "clinic");
  const home = records.filter(r => r.type === "home");

  return (
    <Layout>

      <div style={{ marginBottom: 25 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
        <h1>Bills Module 🧾</h1>
      </div>

      {/* ADD SECTION */}
      <div style={card}>
        <h3 style={{ marginBottom: 15 }}>Add Expense</h3>

        {/* TOP BAR */}
        <div style={topBar}>
          <select value={type} onChange={e => setType(e.target.value)} style={input}>
            <option value="clinic">Clinic</option>
            <option value="home">Residence</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={input}
          />
        </div>

        {/* TABLE */}
        <table style={table}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Expense Type</th>
              <th style={{ width: 120 }}>Amount</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>
                  <input
                    style={inputFull}
                    placeholder="Electricity / Gas / Rent / Maintenance"
                    value={r.title}
                    onChange={e => handleChange(i, "title", e.target.value)}
                  />
                </td>

                <td>
                  <input
                    style={inputFull}
                    placeholder="Amount"
                    value={r.amount}
                    onChange={e => handleChange(i, "amount", e.target.value)}
                  />
                </td>

                <td style={{ textAlign: "center" }}>
                  <button onClick={() => removeRow(i)} style={deleteBtn}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ACTIONS */}
        <div style={actions}>
          <button onClick={addRow} style={addBtn}>➕ Add Row</button>
          <button onClick={save} style={saveBtn}>Save</button>
        </div>
      </div>

      {/* SECTIONS */}
      <Section title="Clinic Expenses 🏥" data={clinic} remove={remove} />
      <Section title="Residence Expenses 🏠" data={home} remove={remove} />

    </Layout>
  );
}

/* ========================= SECTION ========================= */

function Section({ title, data, remove }) {
  return (
    <div style={card}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>

      {data.length === 0 ? (
        <p style={{ color: "#64748b" }}>No records</p>
      ) : (
        data.map((b) => (
          <div key={b._id} style={rowCard}>
            <div>
              <b>{b.date}</b>

              {b.rows?.map((r, i) => (
                <p key={i} style={{ margin: 0 }}>
                  {r.title} — Rs {r.amount}
                </p>
              ))}
            </div>

            <button onClick={() => remove(b._id)} style={deleteBtn}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

/* ========================= STYLES ========================= */

const card = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const topBar = {
  display: "flex",
  gap: 10,
  marginBottom: 15
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 10
};

const input = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc"
};

const inputFull = {
  width: "100%",
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ddd"
};

const actions = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 10
};

const addBtn = {
  padding: "8px 14px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6
};

const saveBtn = {
  padding: "8px 18px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6
};

const deleteBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "4px 8px",
  cursor: "pointer"
};

const rowCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 10,
  borderBottom: "1px solid #eee"
};