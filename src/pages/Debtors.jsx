import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function Debtors() {

  const navigate = useNavigate();

  const [data, setData] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    amount: "",
    date: "",
    notes: ""
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/debtors/");
    setData(res.data || []);
  };

  const save = async () => {
    if (!form.name || !form.amount) {
      return alert("Name & Amount required ❗");
    }

    await api.post("/debtors/", form);

    setForm({
      name: "",
      phone: "",
      address: "",
      amount: "",
      date: "",
      notes: ""
    });

    load();
  };

  const remove = async (id) => {
    await api.delete("/debtors/" + id);
    load();
  };

  return (
    <Layout>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
        <h1>ACCOUNT RECEIVABLE 💰</h1>
      </div>

      {/* FORM */}
      <div style={box}>
        <h3>Add Debtor</h3>

        <div style={grid}>
          <input placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            style={input}
          />

          <input placeholder="Phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            style={input}
          />

          <input placeholder="Address"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            style={input}
          />

          <input placeholder="Amount"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            style={input}
          />

          <input type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            style={input}
          />

          <input placeholder="Notes"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            style={input}
          />
        </div>

        <br />
        <button onClick={save} style={btn}>Save</button>
      </div>

      {/* TABLE */}
      <div style={box}>
        <h3>ACCOUNT RECEIVABLE LIST</h3>

        {data.length === 0 ? (
          <p>No records</p>
        ) : (
          <table style={{ width: "100%", marginTop: 10 }}>
            <thead>
              <tr>
                <th align="left">Name</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {data.map(d => (
                <tr key={d._id}>
                  <td>{d.name}</td>
                  <td>{d.phone}</td>
                  <td>Rs {d.amount}</td>
                  <td>{d.date}</td>
                  <td>
                    <button onClick={() => remove(d._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </Layout>
  );
}

/* ========================= STYLES ========================= */

const box = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
  gap: 10
};

const input = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc"
};

const btn = {
  padding: "10px 15px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6
};