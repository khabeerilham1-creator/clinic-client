import React, { useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import toothImg from "../assets/tooth_chart.png";

function CheckupModule() {

  const nav = useNavigate();

  // ---------------- STATE ----------------
  const [patientName, setPatientName] = useState("");
  const [contact, setContact] = useState("");
  const [date, setDate] = useState("");
  const [complaint, setComplaint] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // ---------------- COMPLAINT OPTIONS ----------------
  const complaints = [
    { label: "Tooth Pain", value: "Tooth Pain" },
    { label: "Sensitivity", value: "Sensitivity" },
    { label: "Bleeding Gums", value: "Bleeding Gums" },
    { label: "Swelling", value: "Swelling" },
    { label: "Bad Breath", value: "Bad Breath" },
    { label: "Loose Tooth", value: "Loose Tooth" },
    { label: "Others", value: "Others" }
  ];

  // ---------------- CONDITION → TREATMENT ----------------
  const conditionMap = {
    "Caries": "Filling",
    "Grossly Carious": "RCT",
    "Missing": "Implant",
    "Calculus": "Scaling",
    "Impacted": "Surgical Extraction"
  };

  // ---------------- SELECT TOOTH ----------------
  const selectTooth = (num) => {
    if (tasks.find(t => t.tooth === num)) return;

    setTasks([
      ...tasks,
      { tooth: num, condition: "", treatment: "" }
    ]);
  };

  // ---------------- UPDATE CONDITION ----------------
  const updateCondition = (index, value) => {
    const updated = [...tasks];
    updated[index].condition = value;
    updated[index].treatment = conditionMap[value] || "";
    setTasks(updated);
  };

  // ---------------- EDIT ----------------
  const startEdit = (index) => {
    setEditIndex(index);
  };

  const saveEdit = () => {
    setEditIndex(null);
  };

  // ---------------- DELETE ----------------
  const deleteRow = (index) => {
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
  };

  // ---------------- SAVE ----------------
  const saveCheckup = async () => {

    if (!patientName || !contact || !date) {
      alert("Fill all patient info");
      return;
    }

    if (tasks.length === 0) {
      alert("Select at least one tooth");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/checkup", {
        patient_name: patientName,
        contact,
        date,
        chief_complaint: complaint?.value || "",
        tasks
      });

      alert("Checkup Saved ✅");

    } catch (err) {
      console.log(err);
      alert("Error saving ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      {/* 🔙 BACK */}
      <button onClick={() => nav("/")}>⬅ Back to Dashboard</button>

      <h2>HDC Holistic Domain of Creativity</h2>

      {/* ---------------- BIO ---------------- */}
      <input
        placeholder="Patient Name"
        onChange={e => setPatientName(e.target.value)}
      /><br/>

      <input
        placeholder="Contact"
        onChange={e => setContact(e.target.value)}
      /><br/>

      <input
        type="date"
        onChange={e => setDate(e.target.value)}
      /><br/><br/>

      {/* ---------------- COMPLAINT ---------------- */}
      <h3>Chief Complaint</h3>
      <Select
        options={complaints}
        onChange={setComplaint}
        placeholder="Search or select complaint..."
      />

      {/* ---------------- DENTAL CHART ---------------- */}
      <h3>Click Tooth</h3>

      <div style={{ position: "relative", width: "700px", marginTop: "20px" }}>
        <img src={toothImg} alt="chart" style={{ width: "700px" }} />

        {[
          // TOP (1–16)
          { n:1, x:30, y:25 }, { n:2, x:70, y:25 }, { n:3, x:110, y:25 },
          { n:4, x:150, y:25 }, { n:5, x:190, y:25 }, { n:6, x:230, y:25 },
          { n:7, x:270, y:25 }, { n:8, x:310, y:25 }, { n:9, x:350, y:25 },
          { n:10, x:390, y:25 }, { n:11, x:430, y:25 }, { n:12, x:470, y:25 },
          { n:13, x:510, y:25 }, { n:14, x:550, y:25 }, { n:15, x:590, y:25 },
          { n:16, x:630, y:25 },

          // BOTTOM (32–17)
          { n:32, x:30, y:120 }, { n:31, x:70, y:120 }, { n:30, x:110, y:120 },
          { n:29, x:150, y:120 }, { n:28, x:190, y:120 }, { n:27, x:230, y:120 },
          { n:26, x:270, y:120 }, { n:25, x:310, y:120 }, { n:24, x:350, y:120 },
          { n:23, x:390, y:120 }, { n:22, x:430, y:120 }, { n:21, x:470, y:120 },
          { n:20, x:510, y:120 }, { n:19, x:550, y:120 }, { n:18, x:590, y:120 },
          { n:17, x:630, y:120 }
        ].map((tooth, i) => (
          <div
            key={i}
            onClick={() => selectTooth(tooth.n)}
            title={`Tooth ${tooth.n}`}
            style={{
              position: "absolute",
              top: tooth.y,
              left: tooth.x,
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              cursor: "pointer",
              background: tasks.find(t => t.tooth === tooth.n)
                ? "rgba(0,123,255,0.4)"
                : "transparent"
            }}
          />
        ))}
      </div>

      {/* ---------------- TABLE ---------------- */}
      <h3>Clinical Tasks</h3>

      <table border="1" style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Tooth</th>
            <th>Condition</th>
            <th>Treatment</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((t, i) => (
            <tr key={i}>
              <td>{t.tooth}</td>

              <td>
                {editIndex === i ? (
                  <select
                    value={t.condition}
                    onChange={(e) => updateCondition(i, e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Caries">Caries</option>
                    <option value="Grossly Carious">Grossly Carious</option>
                    <option value="Missing">Missing</option>
                    <option value="Calculus">Calculus</option>
                    <option value="Impacted">Impacted</option>
                  </select>
                ) : (
                  t.condition || "-"
                )}
              </td>

              <td>{t.treatment || "-"}</td>

              <td>
                {editIndex === i ? (
                  <button onClick={saveEdit}>Save</button>
                ) : (
                  <button onClick={() => startEdit(i)}>Edit</button>
                )}

                <button onClick={() => deleteRow(i)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br/>
      <button onClick={saveCheckup}>Save Checkup</button>

    </div>
  );
}

export default CheckupModule;