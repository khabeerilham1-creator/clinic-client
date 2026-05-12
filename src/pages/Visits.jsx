import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

function Visits() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);

  const [form, setForm] = useState({
    patient_id: "",
    patient_name: "",
    visit_no: "",
    treatment: "",
    date: new Date().toISOString().split("T")[0],
    procedure_doctor: "",
    status: "Planned"
  });

  const [editId, setEditId] = useState(null);

  // =========================
  // AUTH
  // =========================
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    loadPatients();
    loadVisits();

  }, []);

  // =========================
  // LOAD PATIENTS
  // =========================
  const loadPatients = async () => {

    try {

      const res = await api.get("/patients/");

      setPatients(res.data || []);

    } catch (err) {

      console.log(err);
    }
  };

  // =========================
  // LOAD VISITS
  // =========================
  const loadVisits = async () => {

    try {

      const res = await api.get("/visits/");

      setVisits(res.data || []);

    } catch (err) {

      console.log(err);
    }
  };

  // =========================
  // INPUT
  // =========================
  const handleChange = (e) => {

    const value = e.target.value;

    if (e.target.name === "patient_id") {

      const selectedPatient =
        patients.find(
          p => p._id === value
        );

      setForm({
        ...form,
        patient_id: value,
        patient_name:
          selectedPatient?.name || ""
      });

      return;
    }

    setForm({
      ...form,
      [e.target.name]: value
    });
  };

  // =========================
  // SAVE
  // =========================
  const saveVisit = async () => {

    try {

      if (!form.patient_id)
        return alert("Select patient ❗");

      const payload = {
        ...form
      };

      if (editId) {

        await api.put(
          "/visits/" + editId,
          payload
        );

        // AUTO UPDATE APPOINTMENT
        if (
          form.status === "Planned"
        ) {

          try {

            await api.post("/afi/", {

              patient_name:
              form.patient_name,

              doctor:
              form.procedure_doctor,

              procedure:
              form.treatment,

              appointment_date:
              form.date,

              appointment_time: "",

              chair: "",

              source: "Visit Auto",

              status: "Planned"
            });

          } catch (err) {

            console.log(
              "AUTO AFI ERROR",
              err
            );
          }
        }

        alert("Updated ✅");

      } else {

        await api.post(
          "/visits/",
          payload
        );

        // AUTO CREATE APPOINTMENT
        if (
          form.status === "Planned"
        ) {

          try {

            await api.post("/afi/", {

              patient_name:
              form.patient_name,

              doctor:
              form.procedure_doctor,

              procedure:
              form.treatment,

              appointment_date:
              form.date,

              appointment_time: "",

              chair: "",

              source: "Visit Auto",

              status: "Planned"
            });

          } catch (err) {

            console.log(
              "AUTO AFI ERROR",
              err
            );
          }
        }

        alert("Saved ✅");
      }

      setForm({
        patient_id: "",
        patient_name: "",
        visit_no: "",
        treatment: "",
        date: new Date().toISOString().split("T")[0],
        procedure_doctor: "",
        status: "Planned"
      });

      setEditId(null);

      loadVisits();

    } catch (err) {

      console.log(err);

      alert("Error ❌");
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (v) => {

    setForm({
      patient_id: v.patient_id || "",
      patient_name: v.patient_name || "",
      visit_no: v.visit_no || "",
      treatment: v.treatment || "",
      date: v.date || "",
      procedure_doctor:
      v.procedure_doctor || "",
      status:
      v.status || "Planned"
    });

    setEditId(v._id);
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {

    try {

      await api.delete(
        "/visits/" + id
      );

      loadVisits();

    } catch (err) {

      console.log(err);
    }
  };

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20,
        fontSize: 26
      }}>
        Planned Sequence Of Treatment
      </h1>

      {/* FORM */}
      <div style={{
        background: "white",
        padding: 18,
        borderRadius: 14,
        marginBottom: 20,
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.05)"
      }}>

        <h3 style={{
          marginBottom: 15
        }}>
          {editId
            ? "Edit Treatment Plan"
            : "Add Treatment Plan"}
        </h3>

        <select
          name="patient_id"
          value={form.patient_id}
          onChange={handleChange}
          style={input}
        >

          <option value="">
            Select Patient
          </option>

          {patients.map(p => (

            <option
              key={p._id}
              value={p._id}
            >
              {p.name}
            </option>

          ))}

        </select>

        <br />
        <br />

        <Grid>

          <input
            name="visit_no"
            value={form.visit_no}
            onChange={handleChange}
            placeholder="Visit No"
            style={input}
          />

          <input
            name="treatment"
            value={form.treatment}
            onChange={handleChange}
            placeholder="Treatment"
            style={input}
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            style={input}
          />

          <input
            name="procedure_doctor"
            value={form.procedure_doctor}
            onChange={handleChange}
            placeholder="Procedure Doctor"
            style={input}
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={input}
          >

            <option value="Planned">
              Planned
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Cancelled">
              Cancelled
            </option>

          </select>

        </Grid>

        <button
          onClick={saveVisit}
          style={saveBtn}
        >
          {editId
            ? "Update Plan"
            : "Save Plan"}
        </button>

      </div>

      {/* LIST */}
      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(240px,1fr))",
        gap: 14
      }}>

        {visits.map(v => (

          <div
            key={v._id}
            style={card}
          >

            <div style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: 10
            }}>

              <h2 style={{
                margin: 0,
                fontSize: 18
              }}>
                {v.patient_name}
              </h2>

              <span style={{
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 11,
                color: "white",
                background:
                  v.status === "Completed"
                    ? "#16a34a"
                    : v.status === "Cancelled"
                    ? "#dc2626"
                    : v.status === "In Progress"
                    ? "#ca8a04"
                    : "#2563eb"
              }}>
                {v.status}
              </span>

            </div>

            <p style={text}>
              🆔 Visit No:
              {" "}
              {v.visit_no}
            </p>

            <p style={text}>
              🩺 Treatment:
              {" "}
              {v.treatment}
            </p>

            <p style={text}>
              📅 Date:
              {" "}
              {v.date}
            </p>

            <p style={text}>
              👨‍⚕️ Doctor:
              {" "}
              {v.procedure_doctor}
            </p>

            <div style={{
              display: "flex",
              gap: 10,
              marginTop: 14
            }}>

              <button
                onClick={() =>
                  handleEdit(v)
                }
                style={editBtn}
              >
                Edit
              </button>

              <button
                onClick={() =>
                  handleDelete(v._id)
                }
                style={deleteBtn}
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </Layout>
  );
}

/* GRID */
function Grid({ children }) {

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(2,1fr)",
      gap: 12
    }}>
      {children}
    </div>
  );
}

/* STYLES */

const input = {

  width: "100%",

  padding: 10,

  borderRadius: 10,

  border: "1px solid #cbd5e1",

  boxSizing: "border-box",

  fontSize: 13
};

const saveBtn = {

  marginTop: 16,

  padding: "10px 18px",

  background: "#2563eb",

  color: "white",

  border: "none",

  borderRadius: 10,

  cursor: "pointer",

  fontSize: 13
};

const card = {

  background: "white",

  padding: 14,

  borderRadius: 14,

  boxShadow:
    "0 2px 8px rgba(0,0,0,0.05)"
};

const text = {

  fontSize: 13,

  margin: "6px 0",

  color: "#334155"
};

const editBtn = {

  flex: 1,

  padding: 8,

  border: "none",

  borderRadius: 8,

  background: "#f59e0b",

  color: "white",

  cursor: "pointer",

  fontSize: 12
};

const deleteBtn = {

  flex: 1,

  padding: 8,

  border: "none",

  borderRadius: 8,

  background: "#dc2626",

  color: "white",

  cursor: "pointer",

  fontSize: 12
};

export default Visits;