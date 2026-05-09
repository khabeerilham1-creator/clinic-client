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
    diagnosis: "",
    treatment: "",
    medicines: "",
    fee: "",
    date: new Date().toISOString().split("T")[0]
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

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
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

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  // =========================
  // HANDLE INPUT
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
        diagnosis: "",
        treatment: "",
        medicines: "",
        fee: "",
        date: new Date().toISOString().split("T")[0]
      });

      setEditId(null);

      loadVisits();

    } catch (err) {

      console.log(err);

      if (err.response?.status === 401) {

        alert("Session expired ❌");

        localStorage.removeItem("token");

        navigate("/");

      } else {

        alert("Error saving visit ❌");
      }
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (v) => {

    setForm({
      patient_id: v.patient_id || "",
      diagnosis: v.diagnosis || "",
      treatment: v.treatment || "",
      medicines: v.medicines || "",
      fee: v.fee || "",
      date: v.date || ""
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

      alert("Delete failed ❌");
    }
  };

  // =========================
  // GET PATIENT NAME
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
        Patient Visits Module 🩺
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
          {editId ? "Edit Visit" : "Add Visit"}
        </h3>

        <select
          name="patient_id"
          value={form.patient_id}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: 10
          }}
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
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            placeholder="Diagnosis"
          />

          <input
            name="treatment"
            value={form.treatment}
            onChange={handleChange}
            placeholder="Treatment"
          />

          <input
            name="medicines"
            value={form.medicines}
            onChange={handleChange}
            placeholder="Medicines"
          />

          <input
            name="fee"
            value={form.fee}
            onChange={handleChange}
            placeholder="Fee"
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />

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
          {editId ? "Update Visit" : "Add Visit"}
        </button>

      </div>

      {/* LIST */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <h2>Saved Visits</h2>

        <table style={{
          width: "100%",
          marginTop: 10
        }}>

          <thead>

            <tr>
              <th align="left">Patient</th>
              <th align="left">Diagnosis</th>
              <th align="left">Treatment</th>
              <th align="left">Date</th>
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

                <td>{v.diagnosis}</td>

                <td>{v.treatment}</td>

                <td>{v.date || "-"}</td>

                <td align="right">

                  <button
                    onClick={() => handleEdit(v)}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(v._id)}
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

export default Visits;