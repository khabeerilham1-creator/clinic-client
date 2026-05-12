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

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({

    reg_no: "",

    date: new Date()
      .toLocaleDateString("en-GB")
      .split("/")
      .join("/"),

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

      const res =
        await api.get("/patients/");

      setPatients(res.data || []);

      const nextNo = String(
        (res.data?.length || 0) + 1
      ).padStart(5, "0");

      setForm(prev => ({
        ...prev,
        reg_no: nextNo
      }));

    } catch (err) {

      console.log(err);

      alert(
        "Failed to load patients ❌"
      );
    }
  };

  // =========================
  // MONTHS
  // =========================
  const loadMonths = async () => {

    try {

      const res =
        await api.get(
          "/patients/months"
        );

      setMonths(res.data || []);

    } catch (err) {

      console.log(err);

    }
  };

  // =========================
  // FILTER MONTH
  // =========================
  const loadMonthPatients =
    async (year, month) => {

      try {

        const res =
          await api.get(
            `/patients/month/${year}/${month}`
          );

        setPatients(
          res.data || []
        );

      } catch (err) {

        console.log(err);

      }
    };

  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {

      navigate("/");

      return;
    }

    loadPatients();

    loadMonths();

  }, [navigate]);

  // =========================
  // AUTO AGE
  // =========================
  useEffect(() => {

    if (!form.birth_date) return;

    const birth =
      new Date(form.birth_date);

    const today =
      new Date();

    let age =
      today.getFullYear() -
      birth.getFullYear();

    const m =
      today.getMonth() -
      birth.getMonth();

    if (
      m < 0 ||
      (
        m === 0 &&
        today.getDate() <
        birth.getDate()
      )
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

      [e.target.name]:
        e.target.value
    });
  };

  // =========================
  // CONDITIONS
  // =========================
  const toggleCondition = (
    condition
  ) => {

    let updated = [
      ...(form.conditions || [])
    ];

    if (
      updated.includes(condition)
    ) {

      updated =
        updated.filter(
          c => c !== condition
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

      let res;

      if (editId) {

        res = await api.put(
          "/patients/" + editId,
          form
        );

        alert("Updated ✅");

        setPatients(prev =>
          prev.map(p =>
            p._id === editId
              ? res.data
              : p
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

      setForm({

        reg_no: String(
          (patients.length || 0) + 1
        ).padStart(5, "0"),

        date: new Date()
          .toLocaleDateString(
            "en-GB"
          ),

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

        purpose_of_visit:
          "walk_in",

        consultation_fee_paid:
          "No",

        conditions: []

      });

    } catch (err) {

      console.log(err);

      alert(
        "Backend save error ❌"
      );
    }
  };

  // =========================
  // DELETE
  // =========================
  const deletePatient =
    async (id) => {

      try {

        await api.delete(
          "/patients/" + id
        );

        setPatients(prev =>
          prev.filter(
            p => p._id !== id
          )
        );

      } catch (err) {

        console.log(err);

      }
    };

  // =========================
  // SEARCH
  // =========================
  const filteredPatients =
    patients.filter((p) => {

      const q =
        search.toLowerCase();

      return (

        p.name
          ?.toLowerCase()
          .includes(q)

        ||

        p.mobile_number
          ?.toLowerCase()
          .includes(q)

        ||

        p.reg_no
          ?.toLowerCase()
          .includes(q)
      );
    });

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        Patient Entry
      </h1>

      {/* SEARCH */}
      <div style={card}>

        <input

          type="text"

          placeholder="🔍 Search patient"

          value={search}

          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }

          style={input}

        />

      </div>

      {/* FORM */}
      <div style={card}>

        <h2>
          Patient Information
        </h2>

        <Grid>

          <Row
            label="Entry Date"
          >

            <input
              name="date"
              value={form.date}
              onChange={handleChange}
              style={input}
              placeholder="27/12/2007"
            />

          </Row>

          <Row
            label="Registration No"
          >

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

          <Row
            label="Patient Name"
          >

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={input}
            />

          </Row>

          <Row
            label="Birth Date"
          >

            <input
              name="birth_date"
              value={form.birth_date}
              onChange={handleChange}
              style={input}
              placeholder="27/12/2007"
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

          <Row label="Gender">

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              style={input}
            >

              <option value="">
                Select
              </option>

              <option>
                Male
              </option>

              <option>
                Female
              </option>

            </select>

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

          <Row label="PTCL">

            <input
              name="ptcl_number"
              value={form.ptcl_number}
              onChange={handleChange}
              style={input}
            />

          </Row>

          <Row label="Mobile">

            <input
              name="mobile_number"
              value={form.mobile_number}
              onChange={handleChange}
              style={input}
            />

          </Row>

          <Row label="Emergency">

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

          <Row
            label="Purpose Of Visit"
          >

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

          <Row
            label="Consultation Fee"
          >

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

        {/* MEDICAL */}
        <h3 style={{
          marginTop: 30
        }}>
          Medical Allergies/Conditions
        </h3>

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3,1fr)",
          gap: 10,
          marginTop: 15
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
          ].map((item, i) => (

            <label
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                background:
                  "#f8fafc",
                padding: 10,
                borderRadius: 8
              }}
            >

              <input
                type="checkbox"
                checked={
                  form.conditions?.includes(
                    item
                  )
                }
                onChange={() =>
                  toggleCondition(
                    item
                  )
                }
              />

              {item}

            </label>

          ))}

        </div>

        <button
          onClick={savePatient}
          style={saveBtn}
        >

          {editId
            ? "Update"
            : "Save"}

        </button>

      </div>

    </Layout>
  );
}

/* ROW */

function Row({
  label,
  children
}) {

  return (

    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 15
    }}>

      <label style={{
        minWidth: 170,
        fontWeight: "600",
        fontSize: 14
      }}>
        {label}
      </label>

      <div style={{
        flex: 1
      }}>
        {children}
      </div>

    </div>
  );
}

/* GRID */

function Grid({
  children
}) {

  return (

    <div style={{
      display: "grid",
      gridTemplateColumns:
        "1fr 1fr",
      gap: 18
    }}>
      {children}
    </div>
  );
}

/* STYLES */

const card = {

  background: "white",

  padding: 25,

  borderRadius: 14,

  marginBottom: 20,

  boxShadow:
    "0 2px 8px rgba(0,0,0,0.06)"
};

const input = {

  width: "100%",

  padding: 10,

  borderRadius: 8,

  border:
    "1px solid #cbd5e1",

  outline: "none",

  boxSizing: "border-box"
};

const saveBtn = {

  marginTop: 30,

  padding: "12px 24px",

  background: "#2563eb",

  color: "white",

  border: "none",

  borderRadius: 8,

  cursor: "pointer",

  fontWeight: "600"
};

export default Patients;