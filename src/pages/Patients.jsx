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

      const existingPatient = patients.find((p) => {

        const sameMobile =
          p.mobile_number &&
          form.mobile_number &&
          p.mobile_number.trim() ===
          form.mobile_number.trim();

        const sameNameDob =
          p.name?.toLowerCase().trim() ===
          form.name?.toLowerCase().trim()
          &&
          p.birth_date === form.birth_date;

        return sameMobile || sameNameDob;
      });

      if (existingPatient && !editId) {

        alert("Patient already exists");

        navigate("/timeline/" + existingPatient._id);

        return;
      }

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

      alert("Backend save error ❌");
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
  // GET COLOR
  // =========================
  const getPatientColor = (type) => {

    if (type === "friends") return "#16a34a";

    if (type === "relatives") return "#2563eb";

    if (type === "neighbours") return "#ca8a04";

    if (type === "non_affording") return "#ea580c";

    if (type === "compassionate") return "#dc2626";

    return "#16a34a";
  };

  // =========================
  // GET LABEL
  // =========================
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

      {/* SEARCH BAR */}
      <div style={{
        background: "white",
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <input
          type="text"
          placeholder="🔍 Search by Name / Mobile / Registration No"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            outline: "none",
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
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Occupation
            </label>

            <input
              name="occupation"
              value={form.occupation}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Address
            </label>

            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Email
            </label>

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              PTCL Number
            </label>

            <input
              name="ptcl_number"
              value={form.ptcl_number}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Mobile Number
            </label>

            <input
              name="mobile_number"
              value={form.mobile_number}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Emergency Number
            </label>

            <input
              name="emergency_number"
              value={form.emergency_number}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Referred By
            </label>

            <input
              name="referred_by"
              value={form.referred_by}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Category
            </label>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              style={input}
            />
          </div>

          {/* PATIENT TYPE */}
          <div>
            <label style={label}>
              Patient Type
            </label>

            <select
              name="colour_code"
              value={form.colour_code}
              onChange={handleChange}
              style={input}
            >

              <option value="friends">
                🟢 Friends
              </option>

              <option value="relatives">
                🔵 Relatives
              </option>

              <option value="neighbours">
                🟡 Neighbours
              </option>

              <option value="non_affording">
                🟠 Non Affording
              </option>

              <option value="compassionate">
                🔴 Compassionate
              </option>

            </select>
          </div>

          <div>
            <label style={label}>
              Purpose of Visit
            </label>

            <input
              name="purpose_of_visit"
              value={form.purpose_of_visit}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>
              Consultation Fee
            </label>

            <select
              name="consultation_fee_paid"
              value={form.consultation_fee_paid}
              onChange={handleChange}
              style={input}
            >
              <option value="Yes">
                Paid
              </option>

              <option value="No">
                Pending
              </option>
            </select>
          </div>

        </Grid>

        <h3 style={{
          marginTop: 25,
          marginBottom: 10
        }}>
          Medical Conditions
        </h3>

        <input
          style={fullInput}
          name="conditions"
          value={form.conditions}
          onChange={handleChange}
        />

        <h3 style={{
          marginTop: 25,
          marginBottom: 10
        }}>
          Dental Complaints
        </h3>

        <select
          style={fullInput}
          name="complaints"
          value={form.complaints}
          onChange={handleChange}
        >
          <option value="segmental">
            Segmental
          </option>

          <option value="comprehensive">
            Comprehensive
          </option>
        </select>

        <button
          onClick={savePatient}
          style={{
            marginTop: 25,
            padding: "12px 24px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          {editId ? "Update" : "Save"}
        </button>

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

const fullInput = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  outline: "none",
  boxSizing: "border-box",
  background: "white"
};

export default Patients;