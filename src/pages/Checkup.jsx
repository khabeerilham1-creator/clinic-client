/* eslint-disable jsx-a11y/alt-text */

import React, { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

const conditionsMap = {
  Caries: "Composite Filling",
  Missing: "Implant",
  Fracture: "Ceramic Crown",
  Infection: "RCT",
  Mobility: "Splinting",
  Attrition: "Night Guard",
  Abrasion: "Restoration",
  Impaction: "Extraction",
  Calculus: "U/S Scaling & Polishing",
  Gingivitis: "Medication",
  Periodontitis: "Deep Scaling",
 "Class I Moderate Carious": "Composite Filling",
  "carious": "MTA Pulpotomy",
  Healthy: "None"
};

function Checkup() {

  const [patients, setPatients] = useState([]);
  const [checkups, setCheckups] = useState([]);

  const [patientId, setPatientId] = useState("");
  const [complaint, setComplaint] = useState("");

  const [clinicalTasks, setClinicalTasks] = useState([]);
  const [labTasks, setLabTasks] = useState([]);

  const [editId, setEditId] = useState(null);

  // 🔥 SOFT TISSUE
  const [softTissue, setSoftTissue] = useState({
    details: "",
    conditions: [],
    treatments: []
  });

  useEffect(() => {

    loadPatients();
    loadCheckups();

  }, []);

  const loadPatients = async () => {

    try {

      const res = await api.get("/patients/");

      setPatients(res.data || []);

    } catch (err) {

      console.log(err);

    }

  };

  const loadCheckups = async () => {

    try {

      const res = await api.get("/checkups/");

      setCheckups(res.data || []);

    } catch (err) {

      console.log(err);

    }

  };

  // =========================
  // SOFT TISSUE CHECKBOX
  // =========================

  const toggleSoftCondition = (item) => {

    const exists =
      softTissue.conditions.includes(item);

    setSoftTissue({

      ...softTissue,

      conditions: exists

        ? softTissue.conditions.filter(
            x => x !== item
          )

        : [
            ...softTissue.conditions,
            item
          ]

    });

  };

  const toggleSoftTreatment = (item) => {

    const exists =
      softTissue.treatments.includes(item);

    setSoftTissue({

      ...softTissue,

      treatments: exists

        ? softTissue.treatments.filter(
            x => x !== item
          )

        : [
            ...softTissue.treatments,
            item
          ]

    });

  };

  // =========================
  // SELECT TOOTH
  // =========================

  const selectTooth = (
    tooth,
    type
  ) => {

    const data =
      type === "clinical"
        ? [...clinicalTasks]
        : [...labTasks];

    const exists =
      data.find(
        x => x.tooth === tooth
      );

    if (exists) {

      const filtered =
        data.filter(
          x => x.tooth !== tooth
        );

      if (type === "clinical") {

        setClinicalTasks(filtered);

      } else {

        setLabTasks(filtered);

      }

      return;

    }

    const newTask = {

      tooth,

      condition: "",

      treatment: "",

      implant_size: "",

      implant_brand: ""

    };

    if (type === "clinical") {

      setClinicalTasks([
        ...clinicalTasks,
        newTask
      ]);

    } else {

      setLabTasks([
        ...labTasks,
        newTask
      ]);

    }

  };

  // =========================
  // UPDATE TASK
  // =========================

  const updateTask = (
    index,
    field,
    value,
    type
  ) => {

    const data =
      type === "clinical"
        ? [...clinicalTasks]
        : [...labTasks];

    data[index][field] =
      value;

    if (
      field === "condition"
    ) {

      data[index].treatment =
        conditionsMap[value] || "";

    }

    if (type === "clinical") {

      setClinicalTasks(data);

    } else {

      setLabTasks(data);

    }

  };

  // =========================
  // REMOVE TASK
  // =========================

  const removeTask = (
    index,
    type
  ) => {

    if (type === "clinical") {

      setClinicalTasks(
        clinicalTasks.filter(
          (_, i) => i !== index
        )
      );

    } else {

      setLabTasks(
        labTasks.filter(
          (_, i) => i !== index
        )
      );

    }

  };

  // =========================
  // SAVE
  // =========================

  const saveCheckup = async () => {

    try {

      const payload = {

        patient: patientId,

        patient_id: patientId,

        complaint,

        soft_tissue: softTissue,

        clinical_tasks:
          clinicalTasks,

        lab_tasks:
          labTasks,

        tasks: [
          ...clinicalTasks,
          ...labTasks
        ]

      };

      if (editId) {

        await api.put(
          "/checkups/" + editId,
          payload
        );

        alert("Updated ✅");

      } else {

        await api.post(
          "/checkups/",
          payload
        );

        alert("Saved ✅");

      }

      resetForm();

      loadCheckups();

    } catch (err) {

      console.log(err);

      alert("Save failed ❌");

    }

  };

  // =========================
  // RESET
  // =========================

  const resetForm = () => {

    setPatientId("");

    setComplaint("");

    setClinicalTasks([]);

    setLabTasks([]);

    setEditId(null);

    setSoftTissue({
      details: "",
      conditions: [],
      treatments: []
    });

  };

  // =========================
  // EDIT
  // =========================

  const editCheckup = (c) => {

    setEditId(c._id);

    setPatientId(
      c.patient ||
      c.patient_id
    );

    setComplaint(
      c.complaint || ""
    );

    setClinicalTasks(
      c.clinical_tasks ||
      []
    );

    setLabTasks(
      c.lab_tasks ||
      []
    );

    setSoftTissue(
      c.soft_tissue || {
        details: "",
        conditions: [],
        treatments: []
      }
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };

  // =========================
  // DELETE
  // =========================

  const deleteCheckup = async (id) => {

    if (
      !window.confirm(
        "Delete checkup?"
      )
    ) return;

    await api.delete(
      "/checkups/" + id
    );

    loadCheckups();

  };

  // =========================
  // PATIENT NAME
  // =========================

  const getPatientName = (id) => {

    const p =
      patients.find(
        x => x._id === id
      );

    return p
      ? p.name
      : "Unknown";

  };

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        Advanced Checkup Module
      </h1>

      {/* TOP */}

      <div style={card}>

        <div style={grid}>

          <div>

            <label>
              Select Patient
            </label>

            <select
              value={patientId}
              onChange={(e)=>
                setPatientId(
                  e.target.value
                )
              }
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

          </div>

          <div>

            <label>
              Chief Complaint
            </label>

            <input
              value={complaint}
              onChange={(e)=>
                setComplaint(
                  e.target.value
                )
              }
              style={input}
            />

          </div>

        </div>

        <textarea
          placeholder="Write detailed complaint..."
          value={complaint}
          onChange={(e)=>
            setComplaint(
              e.target.value
            )
          }
          style={textarea}
        />

      </div>

      {/* SOFT TISSUE */}

      <div style={card}>

        <h2 style={{
          marginBottom: 20
        }}>
          Soft Tissue Assessment
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20
        }}>

          {/* DETAILS */}

          <div>

            <label style={label}>
              Details
            </label>

            <textarea
              placeholder="Write details..."
              value={softTissue.details}
              onChange={(e)=>
                setSoftTissue({
                  ...softTissue,
                  details: e.target.value
                })
              }
              style={softTextarea}
            />

          </div>

          {/* CONDITIONS */}

          <div>

            <label style={label}>
              Conditions
            </label>

            <div style={checkboxWrap}>

              {[
                "Gingivitis",
                "Periodontitis",
                "Gingival Hypertrophy",
                "Epulis",
                "Others"
              ].map((item) => (

                <label
                  key={item}
                  style={checkboxLabel}
                >

                  <input
                    type="checkbox"
                    checked={
                      softTissue.conditions.includes(item)
                    }
                    onChange={() =>
                      toggleSoftCondition(item)
                    }
                  />

                  {item}

                </label>

              ))}

            </div>

          </div>

          {/* TREATMENTS */}

          <div>

            <label style={label}>
              Treatment
            </label>

            <div style={checkboxWrap}>

              {[
                "U/S Scaling & Polishing",
                "Medications",
                "Surgical Intervention",
                "Manual"
              ].map((item) => (

                <label
                  key={item}
                  style={checkboxLabel}
                >

                  <input
                    type="checkbox"
                    checked={
                      softTissue.treatments.includes(item)
                    }
                    onChange={() =>
                      toggleSoftTreatment(item)
                    }
                  />

                  {item}

                </label>

              ))}

            </div>

          </div>

        </div>

      </div>

      {/* CHARTS */}

      <div style={chartsGrid}>

        <div style={card}>

          <h2>
            Clinical Tasks
          </h2>

          <DentalChart
            tasks={clinicalTasks}
            selectTooth={(t)=>
              selectTooth(
                t,
                "clinical"
              )
            }
            activeColor="#16a34a"
          />

          {clinicalTasks.map((t, i) => (

            <TaskCard
              key={i}
              task={t}
              index={i}
              type="clinical"
              updateTask={updateTask}
              removeTask={removeTask}
            />

          ))}

        </div>

        <div style={card}>

          <h2>
            Lab Tasks
          </h2>

          <DentalChart
            tasks={labTasks}
            selectTooth={(t)=>
              selectTooth(
                t,
                "lab"
              )
            }
            activeColor="#2563eb"
          />

          {labTasks.map((t, i) => (

            <TaskCard
              key={i}
              task={t}
              index={i}
              type="lab"
              updateTask={updateTask}
              removeTask={removeTask}
            />

          ))}

        </div>

      </div>

      <button
        onClick={saveCheckup}
        style={saveBtn}
      >

        {editId
          ? "Update Checkup"
          : "Save Checkup"}

      </button>

      {/* LIST */}

      <div style={card}>

        <h2>
          Checkup List
        </h2>

        {checkups.map(c => (

          <div
            key={c._id}
            style={listCard}
          >

            <h3>
              {getPatientName(c.patient)}
            </h3>

            <p>
              <b>Complaint:</b> {c.complaint}
            </p>

            {(c.tasks || []).map(
              (t, i) => (

              <p key={i}>

                Tooth {t.tooth}

                {" → "}

                {t.condition}

                {" → "}

                {t.treatment}

              </p>

            ))}

            <div style={{
              display: "flex",
              gap: 10,
              marginTop: 10
            }}>

              <button
                onClick={() =>
                  editCheckup(c)
                }
                style={editBtn}
              >
                Edit
              </button>

              <button
                onClick={() =>
                  deleteCheckup(c._id)
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

// =========================
// TASK CARD
// =========================

function TaskCard({
  task,
  index,
  type,
  updateTask,
  removeTask
}) {

  return (

    <div style={taskCard}>

      <h4>
        Tooth {task.tooth}
      </h4>

      <select
        value={task.condition}
        onChange={(e)=>
          updateTask(
            index,
            "condition",
            e.target.value,
            type
          )
        }
        style={input}
      >

        <option value="">
          Select Condition
        </option>

        {Object.keys(
          conditionsMap
        ).map(c => (

          <option
            key={c}
            value={c}
          >
            {c}
          </option>

        ))}

      </select>

      <input
        placeholder="Treatment"
        value={task.treatment}
        onChange={(e)=>
          updateTask(
            index,
            "treatment",
            e.target.value,
            type
          )
        }
        style={input}
      />

      {task.treatment
        ?.toLowerCase()
        .includes("implant") && (

        <>

          <input
            placeholder="Implant Size"
            value={
              task.implant_size
            }
            onChange={(e)=>
              updateTask(
                index,
                "implant_size",
                e.target.value,
                type
              )
            }
            style={input}
          />

          <input
            placeholder="Made In"
            value={
              task.implant_brand
            }
            onChange={(e)=>
              updateTask(
                index,
                "implant_brand",
                e.target.value,
                type
              )
            }
            style={input}
          />

        </>

      )}

      <button
        onClick={() =>
          removeTask(index, type)
        }
        style={deleteBtn}
      >
        Remove
      </button>

    </div>

  );

}

// =========================
// DENTAL CHART
// =========================

function DentalChart({
  tasks,
  selectTooth,
  activeColor
}) {

  const upper = [
    1,2,3,4,5,6,7,8,
    9,10,11,12,13,14,15,16
  ];

  const lower = [
    32,31,30,29,28,27,26,25,
    24,23,22,21,20,19,18,17
  ];

  return (

    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: 720,
      margin: "auto",
      marginBottom: 25
    }}>

      <img
        src="/teeth.png"
        style={{
          width: "100%",
          display: "block"
        }}
      />

      {upper.map((tooth, i) => {

        const active =
          tasks.find(
            x => x.tooth === tooth
          );

        return (

          <div
            key={tooth}
            onClick={() =>
              selectTooth(tooth)
            }
            style={{
              position: "absolute",
              top: "18%",
              left:
                `${2 + (i * 6.1)}%`,
              width: 28,
              height: 70,
              cursor: "pointer",
              borderRadius: 10,
              background:
                active
                  ? `${activeColor}66`
                  : "transparent",
              border:
                active
                  ? `2px solid ${activeColor}`
                  : "2px solid transparent",
              transition: "0.2s"
            }}
          />

        );

      })}

      {lower.map((tooth, i) => {

        const active =
          tasks.find(
            x => x.tooth === tooth
          );

        return (

          <div
            key={tooth}
            onClick={() =>
              selectTooth(tooth)
            }
            style={{
              position: "absolute",
              top: "54%",
              left:
                `${2 + (i * 6.1)}%`,
              width: 28,
              height: 82,
              cursor: "pointer",
              borderRadius: 10,
              background:
                active
                  ? `${activeColor}66`
                  : "transparent",
              border:
                active
                  ? `2px solid ${activeColor}`
                  : "2px solid transparent",
              transition: "0.2s"
            }}
          />

        );

      })}

    </div>

  );

}

// =========================
// STYLES
// =========================

const card = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  marginBottom: 20,
  boxShadow:
    "0 2px 8px rgba(0,0,0,0.05)"
};

const input = {
  width: "100%",
  padding: 10,
  border:
    "1px solid #cbd5e1",
  borderRadius: 8,
  marginTop: 6,
  marginBottom: 10
};

const textarea = {
  width: "100%",
  minHeight: 90,
  padding: 10,
  border:
    "1px solid #cbd5e1",
  borderRadius: 8,
  marginTop: 10
};

const softTextarea = {
  width: "100%",
  minHeight: 180,
  padding: 12,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  resize: "vertical"
};

const label = {
  fontWeight: "600",
  display: "block",
  marginBottom: 10
};

const checkboxWrap = {
  display: "flex",
  flexDirection: "column",
  gap: 10
};

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: 10
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: 20
};

const chartsGrid = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: 20
};

const taskCard = {
  border:
    "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 14,
  marginBottom: 12
};

const listCard = {
  borderBottom:
    "1px solid #eee",
  paddingBottom: 15,
  marginBottom: 15
};

const saveBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: 8,
  marginBottom: 20,
  cursor: "pointer"
};

const editBtn = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer"
};

const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer"
};

export default Checkup;