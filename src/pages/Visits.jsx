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

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // SAVE
  // =========================
  const saveVisit = async () => {

    try {

      if (!form.patient_id)
        return alert("Select patient ❗");

      let res;

      if (editId) {

        res = await api.put(
          "/visits/" + editId,
          form
        );

        alert("Updated ✅");

      } else {

        res = await api.post(
          "/visits/",
          form
        );

        alert("Saved ✅");
      }

      setForm({
        patient_id: "",
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
      visit_no: v.visit_no || "",
      treatment: v.treatment || "",
      date: v.date || "",
      procedure_doctor: v.procedure_doctor || "",
      status: v.status || "Planned"
    });

    setEditId(v._id);
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {

    try {

      await api.delete("/visits/" + id);

      loadVisits();

    } catch (err) {

      console.log(err);
    }
  };

  // =========================
  // PATIENT NAME
  // =========================
  const getPatientName = (id) => {

    const p = patients.find(
      p => p._id === id
    );

    return p ? p.name : "Unknown";
  };

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        Planned Sequence Of Treatment
      </h1>

      {/* FORM */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <h3>
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
          style={{
            marginTop: 15,
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6
          }}
        >
          {editId
            ? "Update Plan"
            : "Save Plan"}
        </button>

      </div>

      {/* LIST */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <h2>Treatment Plan List</h2>

        <table style={{
          width: "100%",
          marginTop: 10
        }}>

          <thead>

            <tr>
              <th align="left">Patient</th>
              <th align="left">Visit No</th>
              <th align="left">Treatment</th>
              <th align="left">Date</th>
              <th align="left">Doctor</th>
              <th align="left">Status</th>
              <th align="right">Actions</th>
            </tr>

          </thead>

          <tbody>

            {visits.map(v => (

              <tr
                key={v._id}
                style={{
                  borderTop: "1px solid #eee"
                }}
              >

                <td>
                  {getPatientName(v.patient_id)}
                </td>

                <td>{v.visit_no}</td>

                <td>{v.treatment}</td>

                <td>{v.date}</td>

                <td>
                  {v.procedure_doctor}
                </td>

                <td>

                  <span style={{
                    padding: "5px 10px",
                    borderRadius: 20,
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

                </td>

                <td align="right">

                  <button
                    onClick={() =>
                      handleEdit(v)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(v._id)
                    }
                    style={{
                      marginLeft: 10
                    }}
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
      gap: 10
    }}>
      {children}
    </div>
  );
}

/* INPUT */
const input = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box"
};

export default Visits;