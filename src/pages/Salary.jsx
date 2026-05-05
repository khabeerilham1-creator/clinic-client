import { useState, useEffect } from "react";
import api from "../api";

export default function Salary() {

  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    name: "",
    amount: ""
  });

  const load = async () => {
    setData((await api.get("/hai/salary")).data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post("/hai/salary", form);
    setForm({ name: "", amount: "" });
    load();
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>Salary System 💵</h1>

      <input
        placeholder="Staff Name"
        value={form.name}
        onChange={e => setForm({...form, name:e.target.value})}
      />

      <input
        placeholder="Amount"
        value={form.amount}
        onChange={e => setForm({...form, amount:e.target.value})}
      />

      <button onClick={save}>Pay Salary</button>

      <hr />

      {data.map(s => (
        <div key={s._id}>
          {s.name} → Rs {s.amount}
        </div>
      ))}

    </div>
  );
}