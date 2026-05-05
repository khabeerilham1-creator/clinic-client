import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

// 🔥 ADDED
import Layout from "../components/Layout";

function Patients({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    conditions: "",
    complaints: ""
  });

  const [file, setFile] = useState(null);

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    } else {
      loadPatients();
    }
  }, [navigate]);

  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");
      setPatients(res.data);
    } catch (err) {
      console.log("LOAD ERROR:", err.response?.data || err);
      alert("Failed to load patients ❌");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const savePatient = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (file) formData.append("xray", file);

      if (editId) {
        await api.put("/patients/" + editId, form);
        alert("Updated ✅");
        setEditId(null);
      } else {
        await api.post("/patients/", formData);
        alert("Saved ✅");
      }

      setForm({
        name: "",
        age: "",
        gender: "",
        phone: "",
        address: "",
        conditions: "",
        complaints: ""
      });

      setFile(null);

      loadPatients();

    } catch (err) {
      console.log("SAVE ERROR:", err.response?.data || err);

      if (err.response?.status >= 400) {
        alert("Error ❌");
      }
    }
  };

  const deletePatient = async (id) => {
    try {
      await api.delete("/patients/" + id);
      loadPatients();
    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err);
    }
  };

  return (

    // 🔥 WRAPPED IN LAYOUT
    <Layout>

      <h1 style={{ marginBottom: 20 }}>Patients Module</h1>

      {/* FORM */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <h3>Demographics</h3>

        <Grid>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
          <input name="age" value={form.age} onChange={handleChange} placeholder="Age" />
          <input name="gender" value={form.gender} onChange={handleChange} placeholder="Gender" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
          <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
        </Grid>

        <h3>Medical</h3>
        <input style={{ width: "100%" }} name="conditions" value={form.conditions} onChange={handleChange} placeholder="Conditions" />

        <h3 style={{ marginTop: 15 }}>Dental</h3>
        <input style={{ width: "100%" }} name="complaints" value={form.complaints} onChange={handleChange} placeholder="Complaints" />

        <h3 style={{ marginTop: 15 }}>Imaging</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button
          onClick={savePatient}
          style={{
            marginTop: 15,
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6
          }}
        >
          {editId ? "Update" : "Save"}
        </button>

      </div>

      {/* LIST */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <h2>Patients List</h2>

        <table style={{ width: "100%", marginTop: 10 }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Phone</th>
              <th align="right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((p) => (
              <tr key={p._id} style={{ borderTop: "1px solid #eee" }}>
                <td>{p.name}</td>
                <td>{p.phone}</td>

                <td align="right">

                  <button onClick={() => navigate("/timeline/" + p._id)}>
                    History
                  </button>

                  <button onClick={() => {
                    setForm({
                      name: p.name || "",
                      age: p.age || "",
                      gender: p.gender || "",
                      phone: p.phone || "",
                      address: p.address || "",
                      conditions: p.conditions || "",
                      complaints: p.complaints || ""
                    });
                    setEditId(p._id);
                  }}>
                    Edit
                  </button>

                  <button onClick={() => deletePatient(p._id)}>
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </Layout>
  );
}

/* SMALL GRID HELPER */
function Grid({ children }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: 10,
      marginBottom: 10
    }}>
      {children}
    </div>
  );
}

export default Patients;