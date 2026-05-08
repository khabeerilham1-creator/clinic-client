import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

function Patients() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);

  // 🔥 SEARCH
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    reg_no: "",
    date: new Date().toISOString().split("T")[0],

    title: "Mr.",

    name: "",
    birth_date: "",
    age: "",

    gender: "",

    occupation: "",

    address: "",

    email: "",

    ptcl_number: "",

    mobile_number: "",

    emergency_number: "",

    referred_by: "",

    category: "",

    colour_code: "friends",

    purpose_of_visit: "",

    consultation_fee_paid: "No",

    conditions: "",

    complaints: "segmental"
  });

  const [editId, setEditId] = useState(null);

  // =========================
  // LOAD
  // =========================
  const loadPatients = async () => {

    try {

      const res = await api.get("/patients/");

      setPatients(res.data || []);

      const nextNo = String((res.data?.length || 0) + 1)
        .padStart(5, "0");

      setForm(prev => ({
        ...prev,
        reg_no: nextNo
      }));

    } catch (err) {

      console.log("LOAD ERROR:", err.response?.data || err);

      alert("Failed to load patients ❌");
    }
  };

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    loadPatients();

  }, [navigate]);

  // =========================
  // AGE AUTO
  // =========================
  useEffect(() => {

    if (!form.birth_date) return;

    const birth = new Date(form.birth_date);

    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const m = today.getMonth() - birth.getMonth();

    if (
      m < 0 ||
      (m === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    setForm(prev => ({
      ...prev,
      age: age.toString()
    }));

  }, [form.birth_date]);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // SAVE
  // =========================
  const savePatient = async () => {

    try {

      let res;

      if (editId) {

        res = await api.put(
          "/patients/" + editId,
          form
        );

        alert("Updated ✅");

        setPatients(prev =>
          prev.map(p =>
            p._id === editId ? res.data : p
          )
        );

        setEditId(null);

      } else {

        res = await api.post(
          "/patients/",
          form
        );

        alert("Saved ✅");

        setPatients(prev => [
          res.data,
          ...prev
        ]);
      }

      // RESET
      setForm({
        reg_no: String((patients.length || 0) + 1)
          .padStart(5, "0"),

        date: new Date().toISOString().split("T")[0],

        title: "Mr.",

        name: "",
        birth_date: "",
        age: "",

        gender: "",

        occupation: "",

        address: "",

        email: "",

        ptcl_number: "",

        mobile_number: "",

        emergency_number: "",

        referred_by: "",

        category: "",

        colour_code: "friends",

        purpose_of_visit: "",

        consultation_fee_paid: "No",

        conditions: "",

        complaints: "segmental"
      });

    } catch (err) {

      console.log(
        JSON.stringify(
          err.response?.data,
          null,
          2
        )
      );

      console.log(err.response?.data);

      if (typeof err.response?.data?.detail === "string") {
        alert(err.response.data.detail);
      } else {
        alert("Backend save error ❌");
      }
    }
  };

  // =========================
  // DELETE
  // =========================
  const deletePatient = async (id) => {

    try {

      await api.delete("/patients/" + id);

      setPatients(prev =>
        prev.filter(p => p._id !== id)
      );

    } catch (err) {

      console.log("DELETE ERROR:", err.response?.data || err);
    }
  };

  // =========================
  // SEARCH FILTER
  // =========================
  const filteredPatients = patients.filter((p) => {

    const q = search.toLowerCase();

    return (
      p.name?.toLowerCase().includes(q) ||
      p.mobile_number?.toLowerCase().includes(q) ||
      p.reg_no?.toLowerCase().includes(q)
    );
  });

  // =========================
  // COLOR SYSTEM
  // =========================
  const getPatientColor = (type) => {

    if (type === "friends") return "#16a34a";

    if (type === "relatives") return "#2563eb";

    if (type === "neighbours") return "#ca8a04";

    if (type === "non_affording") return "#ea580c";

    if (type === "compassionate") return "#dc2626";

    return "#16a34a";
  };

  const getPatientLabel = (type) => {

    if (type === "friends") return "Friends";

    if (type === "relatives") return "Relatives";

    if (type === "neighbours") return "Neighbours";

    if (type === "non_affording") return "Non Affording";

    if (type === "compassionate") return "Compassionate";

    return "General";
  };

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20,
        fontSize: 28
      }}>
        Patient Entry
      </h1>

      {/* SEARCH */}
      <div style={{
        background: "white",
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <input
          placeholder="🔍 Search by Name / Mobile / Reg No"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            fontSize: 14
          }}
        />

      </div>

      {/* FORM */}
      <div style={{
        background: "white",
        padding: 25,
        borderRadius: 14,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
      }}>

        <h3 style={{
          marginBottom: 20,
          fontSize: 22
        }}>
          Patient Information
        </h3>

        <Grid>

          <div>
            <label style={label}>
              Entry Date
            </label>

            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Registration Number
            </label>

            <input
              name="reg_no"
              value={form.reg_no}
              readOnly
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Title
            </label>

            <select
              name="title"
              value={form.title}
              onChange={handleChange}
              style={input}
            >
              <option>Mr.</option>
              <option>Mrs.</option>
              <option>Miss</option>
              <option>Dr.</option>
            </select>
          </div>

          <div>
            <label style={label}>
              Patient Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Patient Name"
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Birth Date
            </label>

            <input
              name="birth_date"
              type="date"
              value={form.birth_date}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Age (Auto Generated)
            </label>

            <input
              name="age"
              value={form.age}
              readOnly
              placeholder="Age"
              style={input}
            />
          </div>

        </Grid>

      </div>

      {/* LIST */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <h2>Patients List</h2>

        <table style={{
          width: "100%",
          marginTop: 10
        }}>

          <thead>

            <tr>
              <th align="left">Reg No</th>
              <th align="left">Name</th>
              <th align="left">Mobile</th>
              <th align="left">Patient Type</th>
              <th align="right">Actions</th>
            </tr>

          </thead>

          <tbody>

            {(filteredPatients || []).map((p) => (

              <tr
                key={p._id}
                style={{
                  borderTop: "1px solid #eee"
                }}
              >

                <td>{p.reg_no}</td>

                <td>
                  {p.title} {p.name}
                </td>

                <td>{p.mobile_number}</td>

                <td>
                  <span style={{
                    background: getPatientColor(p.colour_code),
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12
                  }}>
                    {getPatientLabel(p.colour_code)}
                  </span>
                </td>

                <td align="right">

                  <button
                    onClick={() =>
                      navigate("/timeline/" + p._id)
                    }
                  >
                    History
                  </button>

                  <button
                    onClick={() => {

                      setForm({
                        ...p
                      });

                      setEditId(p._id);

                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deletePatient(p._id)}
                  >
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

/* GRID */

function Grid({ children }) {

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: 16,
      marginBottom: 10
    }}>
      {children}
    </div>
  );
}

/* STYLES */

const label = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: "600",
  color: "#334155"
};

const input = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  outline: "none",
  boxSizing: "border-box",
  background: "white"
};

export default Patients;