/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

// 🔥 ADDED
import Layout from "../components/Layout";

const conditionsMap = {
  Caries: "Filling",
  Missing: "Implant",
  Fracture: "Crown",
  Infection: "RCT",
  Mobility: "Splinting",
  Attrition: "Night Guard",
  Abrasion: "Restoration",
  Impaction: "Extraction",
  Calculus: "Scaling",
  Gingivitis: "Cleaning",
  Periodontitis: "Deep Scaling",
  Healthy: "None"
};

const complaintsList = [
  "Tooth Pain",
  "Sensitivity",
  "Bleeding Gums",
  "Swelling",
  "Routine Checkup"
];

function Checkup() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [checkups, setCheckups] = useState([]);

  const [patientId, setPatientId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [tasks, setTasks] = useState([]);

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadPatients();
    loadCheckups();
  }, []);

  const loadPatients = async () => {
    const res = await api.get("/patients/");
    setPatients(res.data);
  };

  const loadCheckups = async () => {
    const res = await api.get("/checkups/");
    setCheckups(res.data);
  };

  const selectTooth = (tooth) => {
    if (!tasks.find(t => t.tooth === tooth)) {
      setTasks([
        ...tasks,
        {
          tooth,
          condition: "",
          treatment: ""
        }
      ]);
    }
  };

  const removeTooth = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // 🔥 CONDITION UPDATE
  const updateCondition = (index, condition) => {

    const updated = [...tasks];

    updated[index].condition = condition;

    // 🔥 AUTO SUGGEST TREATMENT
    updated[index].treatment =
      conditionsMap[condition] || "";

    setTasks(updated);
  };

  // 🔥 MANUAL TREATMENT UPDATE
  const updateTreatment = (index, treatment) => {

    const updated = [...tasks];

    updated[index].treatment = treatment;

    setTasks(updated);
  };

  const saveCheckup = async () => {

    if (!patientId)
      return alert("Select patient ❗");

    if (!tasks.length)
      return alert("Select at least one tooth ❗");

    const payload = {
      patient: patientId,
      patient_id: patientId,
      complaint,
      tasks
    };

    if (editId) {

      await api.put(
        "/checkups/" + editId,
        payload
      );

      setEditId(null);

    } else {

      await api.post(
        "/checkups/",
        payload
      );
    }

    alert("Saved ✅");

    setTasks([]);
    setComplaint("");
    setPatientId("");

    loadCheckups();
  };

  const editCheckup = (c) => {

    setPatientId(c.patient);

    setComplaint(c.complaint);

    setTasks(c.tasks || []);

    setEditId(c._id);
  };

  const deleteCheckup = async (id) => {

    if (!window.confirm("Delete?"))
      return;

    await api.delete("/checkups/" + id);

    loadCheckups();
  };

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
        Checkup Module
      </h1>

      {/* FORM */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <Grid>

          <select
            value={patientId}
            onChange={(e)=>
              setPatientId(e.target.value)
            }
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

          <select
            value={complaint}
            onChange={(e)=>
              setComplaint(e.target.value)
            }
          >
            <option value="">
              Chief Complaint
            </option>

            {complaintsList.map(c => (
              <option key={c}>
                {c}
              </option>
            ))}
          </select>

        </Grid>

        <textarea
          placeholder="Write detailed complaint..."
          value={complaint}
          onChange={(e)=>
            setComplaint(e.target.value)
          }
          style={{
            width: "100%",
            height: "70px",
            marginTop: 10
          }}
        />

      </div>

      {/* TOOTH CHART */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.05)"
      }}>

        <h3>Dental Chart</h3>

        <div style={{
          position: "relative",
          width: "700px"
        }}>

          <img
            src="/teeth.png"
            style={{ width: "700px" }}
          />

          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              onClick={() =>
                selectTooth(i + 1)
              }
              style={{
                position: "absolute",
                top: "20px",
                left: `${30 + i * 40}px`,
                width: "30px",
                height: "60px",
                cursor: "pointer",
                background:
                  tasks.find(
                    t => t.tooth === i + 1
                  )
                    ? "#22c55e88"
                    : "transparent"
              }}
            />
          ))}

          {[...Array(16)].map((_, i) => (
            <div
              key={i + 16}
              onClick={() =>
                selectTooth(32 - i)
              }
              style={{
                position: "absolute",
                top: "140px",
                left: `${30 + i * 40}px`,
                width: "30px",
                height: "60px",
                cursor: "pointer",
                background:
                  tasks.find(
                    t => t.tooth === 32 - i
                  )
                    ? "#22c55e88"
                    : "transparent"
              }}
            />
          ))}

        </div>

      </div>

      {/* SELECTED TEETH */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20
      }}>

        <h3>Selected Teeth</h3>

        {tasks.map((t, i) => (

          <div
            key={i}
            style={{
              marginBottom: 15,
              paddingBottom: 10,
              borderBottom: "1px solid #eee"
            }}
          >

            <strong>
              Tooth {t.tooth}
            </strong>

            {/* CONDITION */}
            <div style={{ marginTop: 10 }}>

              <select
                value={t.condition}
                onChange={(e)=>
                  updateCondition(
                    i,
                    e.target.value
                  )
                }
                style={{
                  padding: 8,
                  marginRight: 10
                }}
              >
                <option value="">
                  Select Condition
                </option>

                {Object.keys(
                  conditionsMap
                ).map(c => (
                  <option key={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* 🔥 MANUAL CONDITION */}
              <input
                type="text"
                placeholder="Or write condition manually"
                value={t.condition}
                onChange={(e)=>
                  updateCondition(
                    i,
                    e.target.value
                  )
                }
                style={{
                  padding: 8,
                  width: "250px"
                }}
              />

            </div>

            {/* TREATMENT */}
            <div style={{ marginTop: 10 }}>

              <input
                value={t.treatment}
                onChange={(e)=>
                  updateTreatment(
                    i,
                    e.target.value
                  )
                }
                placeholder="Suggested / Manual Treatment"
                style={{
                  padding: 8,
                  width: "300px"
                }}
              />

            </div>

            <button
              onClick={() =>
                removeTooth(i)
              }
              style={{
                marginTop: 10,
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6
              }}
            >
              Remove
            </button>

          </div>

        ))}

        <button
          onClick={saveCheckup}
          style={{
            marginTop: 10,
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
        borderRadius: 10
      }}>

        <h2>Checkup List</h2>

        {checkups.map(c => (

          <div
            key={c._id}
            style={{
              borderBottom:
                "1px solid #eee",
              padding: 10
            }}
          >

            <h3>
              {getPatientName(c.patient)}
            </h3>

            <p>
              <strong>
                Complaint:
              </strong>
              {" "}
              {c.complaint}
            </p>

            {c.tasks?.map((t, i) => (
              <p key={i}>
                Tooth {t.tooth}
                {" — "}
                {t.condition}
                {" → "}
                {t.treatment}
              </p>
            ))}

            <button
              onClick={() =>
                editCheckup(c)
              }
            >
              Edit
            </button>

            <button
              onClick={() =>
                deleteCheckup(c._id)
              }
              style={{
                marginLeft: 10
              }}
            >
              Delete
            </button>

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
      gap: 10
    }}>
      {children}
    </div>
  );
}

export default Checkup;