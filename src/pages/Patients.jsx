import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

function Patients() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);

  const [months, setMonths] = useState([]);

  const [selectedMonth, setSelectedMonth] =
    useState(null);

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

    category: "elite",

    colour_code: "friends",

    purpose_of_visit: "walk_in",

    consultation_fee_paid: "No",

    conditions: []
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

  // =========================
  // LOAD MONTHS
  // =========================
  const loadMonths = async () => {

    try {

      const res = await api.get("/patients/months");

      setMonths(res.data || []);

    } catch (err) {

      console.log(err);

    }
  };

  // =========================
  // MONTH FILTER
  // =========================
  const loadMonthPatients = async (
    year,
    month
  ) => {

    try {

      const res = await api.get(
        `/patients/month/${year}/${month}`
      );

      setPatients(res.data || []);

    } catch (err) {

      console.log(err);

    }
  };

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    loadPatients();

    loadMonths();

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
  // CONDITION CHANGE
  // =========================
  const handleConditionChange = (condition) => {

    let updated = [...form.conditions];

    if (updated.includes(condition)) {

      updated = updated.filter(
        (c) => c !== condition
      );

    } else {

      updated.push(condition);
    }

    setForm({
      ...form,
      conditions: updated
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

      loadMonths();

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

        category: "elite",

        colour_code: "friends",

        purpose_of_visit: "walk_in",

        consultation_fee_paid: "No",

        conditions: []
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

      loadMonths();

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

    return "#16a34a";
  };

  // =========================
  // GET LABEL
  // =========================
  const getPatientLabel = (type) => {

    if (type === "friends") return "Friends";

    if (type === "relatives") return "Relatives";

    if (type === "neighbours") return "Neighbours";

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

          <Row label="Entry Date">
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              style={input}
            />
          </Row>

          <Row label="Registration Number">
            <input
              name="reg_no"
              value={form.reg_no}
              readOnly
              style={input}
            />
          </Row>

          <Row label="Title">
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
          </Row>

          <Row label="Patient Name">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={input}
            />
          </Row>

          <Row label="Birth Date">
            <input
              name="birth_date"
              type="date"
              value={form.birth_date}
              onChange={handleChange}
              style={input}
            />
          </Row>

          <Row label="Age">
            <input
              name="age"
              value={form.age}
              readOnly
              style={input}
            />
          </Row>

          <Row label="Occupation">
            <input
              name="occupation"
              value={form.occupation}
              onChange={handleChange}
              style={input}
            />
          </Row>

          <Row label="Address">
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              style={input}
            />
          </Row>

          <Row label="Email">
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              style={input}
            />
          </Row>

          <Row label="PTCL Number">
            <input
              name="ptcl_number"
              value={form.ptcl_number}
              onChange={handleChange}
              style={input}
            />
          </Row>

          <Row label="Mobile Number">
            <input
              name="mobile_number"
              value={form.mobile_number}
              onChange={handleChange}
              style={input}
            />
          </Row>

          <Row label="Emergency Number">
            <input
              name="emergency_number"
              value={form.emergency_number}
              onChange={handleChange}
              style={input}
            />
          </Row>

          <Row label="Referred By">
            <input
              name="referred_by"
              value={form.referred_by}
              onChange={handleChange}
              style={input}
            />
          </Row>

          <Row label="Category">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={input}
            >
              <option value="elite">
                Elite
              </option>

              <option value="mediocator">
                Mediocator
              </option>

              <option value="non_affording">
                Non Affording
              </option>

              <option value="compassionate">
                Compassionate
              </option>
            </select>
          </Row>

          {/* PATIENT TYPE */}
          <Row label="Patient Type">
            <select
              name="colour_code"
              value={form.colour_code}
              onChange={handleChange}
              style={input}
            >

              <option value="neighbours">
                Neighbours
              </option>

              <option value="relatives">
                Relatives
              </option>

              <option value="friends">
                Friends
              </option>

            </select>
          </Row>

          <Row label="Purpose Of Visit">
            <select
              name="purpose_of_visit"
              value={form.purpose_of_visit}
              onChange={handleChange}
              style={input}
            >

              <option value="walk_in">
                Walk In
              </option>

              <option value="active_treatment">
                Active Treatment
              </option>

            </select>
          </Row>

          <Row label="Consultation Fee">
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
          </Row>

        </Grid>

        <h3 style={{
          marginTop: 25,
          marginBottom: 15
        }}>
          Medical Allergies/Conditions
        </h3>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12
        }}>

          {[
            "Aspirin",
            "Local Anesthesia",
            "Latex gloves",
            "Penicillin",
            "Barbiturates",
            "High blood pressure",
            "Diabetes/Sugar",
            "Heart disease",
            "Asthma",
            "Arthritis",
            "Liver disorder",
            "Kidney disorder",
            "Pregnancy",
            "Blood disorders",
            "Anemia",
            "Bleeding disorders",
            "Chemo therapy",
            "Chemical dependency",
            "Migraine"
          ].map((condition, i) => (

            <label
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14
              }}
            >

              <input
                type="checkbox"
                checked={
                  form.conditions.includes(condition)
                }
                onChange={() =>
                  handleConditionChange(condition)
                }
              />

              {condition}

            </label>

          ))}

        </div>

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

      {/* BOTTOM ERP SECTION */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 20,
        alignItems: "start"
      }}>

        {/* MONTH SIDEBAR */}
<div style={{
  background: "white",
  padding: 18,
  borderRadius: 14,
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
}}>

  <h3 style={{
    marginBottom: 15
  }}>
    Monthly Archive 📅
  </h3>

  <input
    type="month"
    onChange={(e) => {

      if (!e.target.value) {

        setSelectedMonth(null);

        loadPatients();

        return;
      }

      const parts =
        e.target.value.split("-");

      const year =
        parseInt(parts[0]);

      const month =
        parseInt(parts[1]);

      setSelectedMonth({
        year,
        month
      });

      loadMonthPatients(
        year,
        month
      );

    }}
    style={{
      width: "100%",
      padding: 12,
      borderRadius: 10,
      border: "1px solid #cbd5e1",
      marginBottom: 15,
      boxSizing: "border-box"
    }}
  />

  <button
    onClick={() => {

      setSelectedMonth(null);

      loadPatients();

    }}
    style={{
      width: "100%",
      padding: 12,
      borderRadius: 10,
      border: "none",
      background: "#2563eb",
      color: "white",
      fontWeight: "600",
      cursor: "pointer"
    }}
  >
    Show All Patients
  </button>

</div>

        {/* PATIENT LIST */}
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
                          ...p,
                          conditions: p.conditions || []
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

      </div>

    </Layout>
  );
}

/* GRID */

function Grid({ children }) {

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 14,
      marginBottom: 10
    }}>
      {children}
    </div>
  );
}

/* ROW */

function Row({ label, children }) {

  return (

    <div style={{
      display: "grid",
      gridTemplateColumns: "220px 1fr",
      alignItems: "center",
      gap: 14
    }}>

      <label style={labelStyle}>
        {label}
      </label>

      {children}

    </div>
  );
}

/* STYLES */

const labelStyle = {
  fontSize: 14,
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