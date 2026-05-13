/* eslint-disable jsx-a11y/alt-text */

import React, {
  useEffect,
  useState
} from "react";

import api from "../api";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

/* =========================================
AUTO TREATMENT MAP
========================================= */

const conditionsMap = {

  Caries: "Composite Filling",

  Missing: "Implant",

  Fracture: "Crown",

  Infection: "RCT",

  Mobility: "Splinting",

  Attrition: "Night Guard",

  Abrasion: "Restoration",

  Impaction: "Extraction",

  Calculus: "Scaling & Polishing",

  Gingivitis: "Deep Scaling",

  Periodontitis: "Periodontal Therapy",

  Healthy: "None"

};

/* =========================================
SOFT TISSUE OPTIONS
========================================= */

const softTissueConditions = [

  "Gingivitis",

  "Periodontitis",

  "Gingival Hypertrophy",

  "Epulis",

  "Localized Gums",

  "Generalized Gums",

  "Ulcer",

  "Lesion",

  "Swelling",

  "Bleeding Gums"

];

/* =========================================
CLINICAL TREATMENTS
========================================= */

const treatmentsList = [

  "Scaling & Polishing",

  "Medication",

  "Surgical Intervention",

  "RCT",

  "Extraction",

  "Composite Filling",

  "Crown",

  "Bridge",

  "Implant",

  "Night Guard",

  "Deep Scaling"

];

function Checkup() {

  const navigate =
    useNavigate();

  const [patients,
    setPatients] =
    useState([]);

  const [checkups,
    setCheckups] =
    useState([]);

  const [patientId,
    setPatientId] =
    useState("");

  const [chiefComplaint,
    setChiefComplaint] =
    useState("");

  const [detailedComplaint,
    setDetailedComplaint] =
    useState("");

  const [softTissue,
    setSoftTissue] =
    useState({

      details: "",

      condition: "",

      treatment: ""

    });

  const [clinicalTasks,
    setClinicalTasks] =
    useState([]);

  const [labTasks,
    setLabTasks] =
    useState([]);

  const [editId,
    setEditId] =
    useState(null);

  /* =========================================
  LOAD
  ========================================= */

  useEffect(() => {

    loadPatients();

    loadCheckups();

  }, []);

  const loadPatients =
    async () => {

    const res =
      await api.get(
        "/patients/"
      );

    setPatients(
      res.data || []
    );

  };

  const loadCheckups =
    async () => {

    const res =
      await api.get(
        "/checkups/"
      );

    setCheckups(
      res.data || []
    );

  };

  /* =========================================
  TOOTH SELECT
  ========================================= */

  const selectClinicalTooth =
    (tooth) => {

    if (
      !clinicalTasks.find(
        t => t.tooth === tooth
      )
    ) {

      setClinicalTasks([

        ...clinicalTasks,

        {

          tooth,

          condition: "",

          treatment: "",

          implant_size: "",

          implant_company: ""

        }

      ]);

    }

  };

  const selectLabTooth =
    (tooth) => {

    if (
      !labTasks.find(
        t => t.tooth === tooth
      )
    ) {

      setLabTasks([

        ...labTasks,

        {

          tooth,

          work: ""

        }

      ]);

    }

  };

  /* =========================================
  UPDATE TASK
  ========================================= */

  const updateClinical =
    (
      index,
      field,
      value
    ) => {

    const updated =
      [...clinicalTasks];

    updated[index][field] =
      value;

    if (
      field === "condition"
    ) {

      updated[index]
      .treatment =
        conditionsMap[value]
        || "";

    }

    setClinicalTasks(
      updated
    );

  };

  const updateLab =
    (
      index,
      field,
      value
    ) => {

    const updated =
      [...labTasks];

    updated[index][field] =
      value;

    setLabTasks(updated);

  };

  /* =========================================
  REMOVE
  ========================================= */

  const removeClinical =
    (index) => {

    setClinicalTasks(

      clinicalTasks.filter(
        (_, i) =>
          i !== index
      )

    );

  };

  const removeLab =
    (index) => {

    setLabTasks(

      labTasks.filter(
        (_, i) =>
          i !== index
      )

    );

  };

  /* =========================================
  SAVE
  ========================================= */

  const saveCheckup =
    async () => {

    if (!patientId)
      return alert(
        "Select Patient ❌"
      );

    const payload = {

      patient: patientId,

      patient_id:
        patientId,

      complaint:
        chiefComplaint,

      detailed_complaint:
        detailedComplaint,

      soft_tissue:
        softTissue,

      tasks:
        clinicalTasks,

      lab_tasks:
        labTasks

    };

    if (editId) {

      await api.put(

        "/checkups/" +
        editId,

        payload

      );

    } else {

      await api.post(
        "/checkups/",
        payload
      );

    }

    alert(
      "Checkup Saved ✅"
    );

    setPatientId("");

    setChiefComplaint("");

    setDetailedComplaint("");

    setClinicalTasks([]);

    setLabTasks([]);

    setSoftTissue({

      details: "",

      condition: "",

      treatment: ""

    });

    setEditId(null);

    loadCheckups();

  };

  /* =========================================
  DELETE
  ========================================= */

  const deleteCheckup =
    async (id) => {

    await api.delete(
      "/checkups/" + id
    );

    loadCheckups();

  };

  /* =========================================
  GET NAME
  ========================================= */

  const getPatientName =
    (id) => {

    const p =
      patients.find(
        p => p._id === id
      );

    return p
      ? p.name
      : "Unknown";

  };

  /* =========================================
  TEETH NUMBERS
  ========================================= */

  const upperTeeth = [

    18,17,16,15,14,13,12,11,

    21,22,23,24,25,26,27,28

  ];

  const lowerTeeth = [

    48,47,46,45,44,43,42,41,

    31,32,33,34,35,36,37,38

  ];

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        Advanced Checkup Module
      </h1>

      {/* ========================================= */}
      {/* TOP */}
      {/* ========================================= */}

      <div style={card}>

        <div style={topGrid}>

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
              value={
                chiefComplaint
              }
              onChange={(e)=>
                setChiefComplaint(
                  e.target.value
                )
              }
              placeholder="Chief Complaint"
              style={input}
            />

          </div>

        </div>

        <textarea
          value={
            detailedComplaint
          }
          onChange={(e)=>
            setDetailedComplaint(
              e.target.value
            )
          }
          placeholder="Write detailed complaint..."
          style={textarea}
        />

      </div>

      {/* ========================================= */}
      {/* SOFT TISSUE */}
      {/* ========================================= */}

      <div style={card}>

        <h2>
          Soft Tissue Assessment
        </h2>

        <div style={topGrid}>

          <div>

            <label>
              Details
            </label>

            <textarea
              value={
                softTissue.details
              }
              onChange={(e)=>

                setSoftTissue({

                  ...softTissue,

                  details:
                    e.target.value

                })

              }
              style={textarea}
            />

          </div>

          <div>

            <label>
              Condition
            </label>

            <select
              value={
                softTissue.condition
              }
              onChange={(e)=>

                setSoftTissue({

                  ...softTissue,

                  condition:
                    e.target.value

                })

              }
              style={input}
            >

              <option value="">
                Select
              </option>

              {softTissueConditions.map(c => (

                <option key={c}>
                  {c}
                </option>

              ))}

            </select>

          </div>

          <div>

            <label>
              Treatment
            </label>

            <select
              value={
                softTissue.treatment
              }
              onChange={(e)=>

                setSoftTissue({

                  ...softTissue,

                  treatment:
                    e.target.value

                })

              }
              style={input}
            >

              <option value="">
                Select
              </option>

              {treatmentsList.map(t => (

                <option key={t}>
                  {t}
                </option>

              ))}

            </select>

          </div>

        </div>

      </div>

      {/* ========================================= */}
      {/* DENTAL CHARTS */}
      {/* ========================================= */}

      <div style={chartGrid}>

        {/* ========================================= */}
        {/* CLINICAL */}
        {/* ========================================= */}

        <div style={card}>

          <h2>
            Clinical Tasks
          </h2>

          <h4>
            Dental Chart
          </h4>

          <div style={{
            marginBottom: 20
          }}>

            <div style={teethRow}>

              {upperTeeth.map(t => (

                <button
                  key={t}
                  onClick={() =>
                    selectClinicalTooth(t)
                  }
                  style={{
                    ...toothBtn,

                    background:
                      clinicalTasks.find(
                        x => x.tooth === t
                      )
                      ? "#16a34a"
                      : "white",

                    color:
                      clinicalTasks.find(
                        x => x.tooth === t
                      )
                      ? "white"
                      : "black"

                  }}
                >
                  {t}
                </button>

              ))}

            </div>

            <div style={teethRow}>

              {lowerTeeth.map(t => (

                <button
                  key={t}
                  onClick={() =>
                    selectClinicalTooth(t)
                  }
                  style={{
                    ...toothBtn,

                    background:
                      clinicalTasks.find(
                        x => x.tooth === t
                      )
                      ? "#16a34a"
                      : "white",

                    color:
                      clinicalTasks.find(
                        x => x.tooth === t
                      )
                      ? "white"
                      : "black"

                  }}
                >
                  {t}
                </button>

              ))}

            </div>

          </div>

          {clinicalTasks.map((t, i) => (

            <div
              key={i}
              style={taskCard}
            >

              <h3>
                Tooth {t.tooth}
              </h3>

              <select
                value={t.condition}
                onChange={(e)=>

                  updateClinical(

                    i,

                    "condition",

                    e.target.value

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

                  <option key={c}>
                    {c}
                  </option>

                ))}

              </select>

              <input
                value={t.treatment}
                onChange={(e)=>

                  updateClinical(

                    i,

                    "treatment",

                    e.target.value

                  )

                }
                placeholder="Treatment"
                style={input}
              />

              {/* IMPLANT EXTRA */}

              {t.treatment
                ?.toLowerCase()
                .includes("implant") && (

                <>

                  <input
                    placeholder="Implant Size"
                    value={
                      t.implant_size
                    }
                    onChange={(e)=>

                      updateClinical(

                        i,

                        "implant_size",

                        e.target.value

                      )

                    }
                    style={input}
                  />

                  <input
                    placeholder="Made In / Company"
                    value={
                      t.implant_company
                    }
                    onChange={(e)=>

                      updateClinical(

                        i,

                        "implant_company",

                        e.target.value

                      )

                    }
                    style={input}
                  />

                </>

              )}

              <button
                onClick={() =>
                  removeClinical(i)
                }
                style={deleteBtn}
              >
                Remove
              </button>

            </div>

          ))}

        </div>

        {/* ========================================= */}
        {/* LAB */}
        {/* ========================================= */}

        <div style={card}>

          <h2>
            Lab Tasks
          </h2>

          <h4>
            Dental Chart
          </h4>

          <div style={{
            marginBottom: 20
          }}>

            <div style={teethRow}>

              {upperTeeth.map(t => (

                <button
                  key={t}
                  onClick={() =>
                    selectLabTooth(t)
                  }
                  style={{
                    ...toothBtn,

                    background:
                      labTasks.find(
                        x => x.tooth === t
                      )
                      ? "#2563eb"
                      : "white",

                    color:
                      labTasks.find(
                        x => x.tooth === t
                      )
                      ? "white"
                      : "black"

                  }}
                >
                  {t}
                </button>

              ))}

            </div>

            <div style={teethRow}>

              {lowerTeeth.map(t => (

                <button
                  key={t}
                  onClick={() =>
                    selectLabTooth(t)
                  }
                  style={{
                    ...toothBtn,

                    background:
                      labTasks.find(
                        x => x.tooth === t
                      )
                      ? "#2563eb"
                      : "white",

                    color:
                      labTasks.find(
                        x => x.tooth === t
                      )
                      ? "white"
                      : "black"

                  }}
                >
                  {t}
                </button>

              ))}

            </div>

          </div>

          {labTasks.map((t, i) => (

            <div
              key={i}
              style={taskCard}
            >

              <h3>
                Tooth {t.tooth}
              </h3>

              <input
                placeholder="Lab Work"
                value={t.work}
                onChange={(e)=>

                  updateLab(

                    i,

                    "work",

                    e.target.value

                  )

                }
                style={input}
              />

              <button
                onClick={() =>
                  removeLab(i)
                }
                style={deleteBtn}
              >
                Remove
              </button>

            </div>

          ))}

        </div>

      </div>

      {/* ========================================= */}
      {/* SAVE */}
      {/* ========================================= */}

      <button
        onClick={saveCheckup}
        style={saveBtn}
      >
        {editId
          ? "Update Checkup"
          : "Save Checkup"}
      </button>

      {/* ========================================= */}
      {/* CHECKUP LIST */}
      {/* ========================================= */}

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
              {
                getPatientName(
                  c.patient
                )
              }
            </h3>

            <p>

              <b>
                Complaint:
              </b>

              {" "}

              {c.complaint}

            </p>

            {c.tasks?.map((t, i) => (

              <p key={i}>

                Tooth {t.tooth}

                {" → "}

                {t.condition}

                {" → "}

                {t.treatment}

              </p>

            ))}

            <button
              onClick={() =>
                deleteCheckup(
                  c._id
                )
              }
              style={deleteBtn}
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </Layout>

  );

}

/* =========================================
STYLES
========================================= */

const card = {

  background: "white",

  padding: 20,

  borderRadius: 14,

  marginBottom: 20,

  boxShadow:
    "0 2px 8px rgba(0,0,0,0.05)"

};

const topGrid = {

  display: "grid",

  gridTemplateColumns:
    "1fr 1fr",

  gap: 20,

  marginBottom: 15

};

const chartGrid = {

  display: "grid",

  gridTemplateColumns:
    "1fr 1fr",

  gap: 20

};

const input = {

  width: "100%",

  padding: 10,

  border:
    "1px solid #cbd5e1",

  borderRadius: 8,

  marginTop: 6

};

const textarea = {

  width: "100%",

  minHeight: 90,

  padding: 10,

  border:
    "1px solid #cbd5e1",

  borderRadius: 8,

  marginTop: 6

};

const teethRow = {

  display: "flex",

  flexWrap: "wrap",

  gap: 8,

  marginBottom: 10

};

const toothBtn = {

  width: 45,

  height: 45,

  borderRadius: 10,

  border:
    "1px solid #cbd5e1",

  cursor: "pointer",

  fontWeight: "bold"

};

const taskCard = {

  border:
    "1px solid #e2e8f0",

  borderRadius: 12,

  padding: 15,

  marginBottom: 15

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

  padding:
    "12px 24px",

  borderRadius: 8,

  cursor: "pointer",

  marginBottom: 20

};

const deleteBtn = {

  background: "#ef4444",

  color: "white",

  border: "none",

  padding:
    "8px 14px",

  borderRadius: 8,

  cursor: "pointer",

  marginTop: 10

};

export default Checkup;