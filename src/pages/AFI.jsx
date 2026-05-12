import React, {
  useState,
  useEffect
} from "react";

import api from "../api";

import {
  useNavigate
} from "react-router-dom";

import Layout
from "../components/Layout";

function AFI() {

  const navigate =
    useNavigate();

  const [appointments,
    setAppointments] =
    useState([]);

  const [patients,
    setPatients] =
    useState([]);

  const [editId,
    setEditId] =
    useState(null);

  const [data, setData] =
    useState({

      doctor: "",

      chair: "",

      procedure: "",

      appointment_date: "",

      appointment_time: "",

      arrival_time: "",

      chair_entry: "",

      exit_time: "",

      doctor_delay: "",

      patient_delay: "",

      patient_name: "",

      status: "Planned",

      source: "Manual"
    });

  // =========================
  // LOAD
  // =========================
  useEffect(() => {

    loadAppointments();

    loadPatients();

  }, []);

  const loadPatients =
  async () => {

    try {

      const res =
        await api.get("/patients/");

      setPatients(
        res.data || []
      );

    } catch (err) {

      console.log(err);
    }
  };

  const loadAppointments =
  async () => {

    try {

      const res =
        await api.get("/afi/");

      const clean =
        (res.data || []).filter(
          a =>
            a.patient_name &&
            a.patient_name !==
            "Unknown"
        );

      setAppointments(clean);

    } catch (err) {

      console.log(err);
    }
  };

  // =========================
  // INPUT
  // =========================
  const handleChange = (e) => {

    setData({

      ...data,

      [e.target.name]:
      e.target.value
    });
  };

  // =========================
  // SAVE
  // =========================
  const save = async () => {

    try {

      if (editId) {

        await api.put(
          "/afi/" + editId,
          data
        );

        alert("Updated ✅");

      } else {

        await api.post(
          "/afi/",
          data
        );

        alert("Saved ✅");
      }

      resetForm();

      loadAppointments();

    } catch (err) {

      console.log(
        err.response?.data || err
      );

      alert("Error ❌");
    }
  };

  // =========================
  // RESET
  // =========================
  const resetForm = () => {

    setData({

      doctor: "",

      chair: "",

      procedure: "",

      appointment_date: "",

      appointment_time: "",

      arrival_time: "",

      chair_entry: "",

      exit_time: "",

      doctor_delay: "",

      patient_delay: "",

      patient_name: "",

      status: "Planned",

      source: "Manual"
    });

    setEditId(null);
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (a) => {

    setData({

      doctor:
      a.doctor || "",

      chair:
      a.chair || "",

      procedure:
      a.procedure || "",

      appointment_date:
      a.appointment_date || "",

      appointment_time:
      a.appointment_time || "",

      arrival_time:
      a.arrival_time || "",

      chair_entry:
      a.chair_entry || "",

      exit_time:
      a.exit_time || "",

      doctor_delay:
      a.doctor_delay || "",

      patient_delay:
      a.patient_delay || "",

      patient_name:
      a.patient_name || "",

      status:
      a.status || "Planned",

      source:
      a.source || "Manual"
    });

    setEditId(a._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // =========================
  // DELETE
  // =========================
  const deleteAppointment =
  async (id) => {

    try {

      await api.delete(
        "/afi/" + id
      );

      loadAppointments();

    } catch (err) {

      console.log(err);
    }
  };

  return (

    <Layout>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        marginBottom: 12
      }}>

        <h1 style={{
          margin: 0,
          fontSize: 20
        }}>
          APPOINTMENT &
          FLOW INTELLIGENCE
        </h1>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          style={backBtn}
        >
          ⬅ Back
        </button>

      </div>

      {/* FORM */}
      <div style={card}>

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2,1fr)",
          gap: 8
        }}>

          {/* PATIENT SELECT */}
          <select
            name="patient_name"
            value={data.patient_name}
            onChange={handleChange}
            style={input}
          >

            <option value="">
              Select Patient
            </option>

            {patients.map(p => (

              <option
                key={p._id}
                value={p.name}
              >
                {p.name}
              </option>

            ))}

          </select>

          <input
            name="doctor"
            value={data.doctor}
            placeholder="Doctor"
            onChange={handleChange}
            style={input}
          />

          <input
            name="chair"
            value={data.chair}
            placeholder="Chair"
            onChange={handleChange}
            style={input}
          />

          <input
            name="procedure"
            value={data.procedure}
            placeholder="Procedure"
            onChange={handleChange}
            style={input}
          />

          <input
            type="date"
            name="appointment_date"
            value={data.appointment_date}
            onChange={handleChange}
            style={input}
          />

          <input
            type="time"
            name="appointment_time"
            value={data.appointment_time}
            onChange={handleChange}
            style={input}
          />

          <input
            type="time"
            name="arrival_time"
            value={data.arrival_time}
            onChange={handleChange}
            style={input}
          />

          <input
            type="time"
            name="chair_entry"
            value={data.chair_entry}
            onChange={handleChange}
            style={input}
          />

          <input
            type="time"
            name="exit_time"
            value={data.exit_time}
            onChange={handleChange}
            style={input}
          />

          <input
            name="doctor_delay"
            value={data.doctor_delay}
            placeholder="Doctor Delay"
            onChange={handleChange}
            style={input}
          />

          <input
            name="patient_delay"
            value={data.patient_delay}
            placeholder="Patient Delay"
            onChange={handleChange}
            style={input}
          />

        </div>

        <button
          onClick={save}
          style={saveBtn}
        >
          {editId
            ? "Update"
            : "Save"}
        </button>

      </div>

      {/* LIST */}
      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: 10
      }}>

        {appointments.map(a => (

          <div
            key={a._id}
            style={listCard}
          >

            <div style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: 5
            }}>

              <h3 style={{
                margin: 0,
                fontSize: 14
              }}>
                {a.patient_name}
              </h3>

              <span style={{
                background:
                  "#2563eb",

                color: "white",

                padding:
                  "2px 7px",

                borderRadius: 20,

                fontSize: 9
              }}>
                {a.status}
              </span>

            </div>

            <p style={text}>
              📅 {a.appointment_date}
            </p>

            <p style={text}>
              🩺 {a.procedure}
            </p>

            <p style={text}>
              👨‍⚕️ {a.doctor || "-"}
            </p>

            <p style={text}>
              🔄 {a.source}
            </p>

            <div style={{
              display: "flex",
              gap: 6,
              marginTop: 8
            }}>

              <button
                onClick={() =>
                  handleEdit(a)
                }
                style={editBtn}
              >
                Edit
              </button>

              <button
                onClick={() =>
                  deleteAppointment(a._id)
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

/* STYLES */

const card = {

  background: "white",

  padding: 12,

  borderRadius: 10,

  marginBottom: 14,

  boxShadow:
    "0 2px 5px rgba(0,0,0,0.05)"
};

const listCard = {

  background: "white",

  padding: 10,

  borderRadius: 10,

  boxShadow:
    "0 2px 5px rgba(0,0,0,0.05)"
};

const input = {

  width: "100%",

  padding: 8,

  borderRadius: 7,

  border:
    "1px solid #cbd5e1",

  boxSizing:
    "border-box",

  fontSize: 12
};

const saveBtn = {

  marginTop: 10,

  padding:
    "8px 16px",

  border: "none",

  borderRadius: 7,

  background: "#2563eb",

  color: "white",

  cursor: "pointer",

  fontSize: 12
};

const backBtn = {

  padding:
    "7px 12px",

  border: "none",

  borderRadius: 8,

  background: "#e2e8f0",

  cursor: "pointer",

  fontSize: 12
};

const deleteBtn = {

  flex: 1,

  padding: 6,

  border: "none",

  borderRadius: 6,

  background: "#dc2626",

  color: "white",

  cursor: "pointer",

  fontSize: 11
};

const editBtn = {

  flex: 1,

  padding: 6,

  border: "none",

  borderRadius: 6,

  background: "#f59e0b",

  color: "white",

  cursor: "pointer",

  fontSize: 11
};

const text = {

  fontSize: 11,

  margin: "3px 0",

  color: "#334155"
};

export default AFI;