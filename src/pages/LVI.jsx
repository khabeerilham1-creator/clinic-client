import React, { useState, useEffect } from "react";
import axios from "axios";

function LVI() {

  const [data, setData] = useState({
    case_entry: "",
    lab_assignment: "",
    deadline: "",
    lab_payable: "",
    paid: "",
    pending: "",
    supplier: "",
    material: "",
    equipment: ""
  });

  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await axios.get("http://127.0.0.1:8000/lvi");
    setRecords(res.data);
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const save = async () => {

    if (editId) {
      await axios.put(`http://127.0.0.1:8000/lvi/${editId}`, data);
      setEditId(null);
    } else {
      await axios.post("http://127.0.0.1:8000/lvi", data);
    }

    setData({
      case_entry: "", lab_assignment: "", deadline: "",
      lab_payable: "", paid: "", pending: "",
      supplier: "", material: "", equipment: ""
    });

    load();
  };

  const edit = (r) => {
    setData(r);
    setEditId(r._id);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete record?")) return;
    await axios.delete(`http://127.0.0.1:8000/lvi/${id}`);
    load();
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>LAB & VENDOR INTELLIGENCE (LVI)</h1>

      {/* ================= 1 ================= */}
      <h3>1. Lab Case Tracking</h3>
      <input name="case_entry" placeholder="Case entry" value={data.case_entry} onChange={handleChange} /><br/>
      <input name="lab_assignment" placeholder="Lab assignment" value={data.lab_assignment} onChange={handleChange} /><br/>
      <input name="deadline" placeholder="Delivery deadlines" value={data.deadline} onChange={handleChange} /><br/>

      {/* ================= 2 ================= */}
      <h3>2. Financial Ledger</h3>
      <input name="lab_payable" placeholder="Lab payable" value={data.lab_payable} onChange={handleChange} /><br/>
      <input name="paid" placeholder="Paid" value={data.paid} onChange={handleChange} /><br/>
      <input name="pending" placeholder="Pending" value={data.pending} onChange={handleChange} /><br/>

      {/* ================= 3 ================= */}
      <h3>3. Vendor Management</h3>
      <input name="supplier" placeholder="Suppliers" value={data.supplier} onChange={handleChange} /><br/>
      <input name="material" placeholder="Material purchase" value={data.material} onChange={handleChange} /><br/>
      <input name="equipment" placeholder="Equipment servicing" value={data.equipment} onChange={handleChange} /><br/>

      <br/>

      <button onClick={save}>
        {editId ? "Update" : "Save"}
      </button>

      <hr/>

      <h2>Records</h2>

      {records.map(r => (
        <div key={r._id} style={{ border:"1px solid", margin:"10px", padding:"10px" }}>

          <b>{r.case_entry}</b> — {r.lab_assignment}

          <br/>

          <button onClick={()=>edit(r)}>Edit</button>
          <button onClick={()=>remove(r._id)}>Delete</button>

        </div>
      ))}

    </div>
  );
}

export default LVI;