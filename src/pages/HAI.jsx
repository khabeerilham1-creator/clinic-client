import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function HAI() {

  const navigate = useNavigate();
  const [active, setActive] = useState("profiles");

  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState("");

  const [form, setForm] = useState({
    name: "",
    role: "",
    experience: "",
    previous_job: "",
    qualification: "",
    specialization: "",
    notes: "",
    joining_date: ""
  });

  const [file, setFile] = useState(null);

  const [attendance, setAttendance] = useState([]);
  const [logs, setLogs] = useState([]);
  const [awards, setAwards] = useState([]);
  const [score, setScore] = useState("");
  const [note, setNote] = useState("");
  const [award, setAward] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const s = await api.get("/hai/staff");
      const a = await api.get("/hai/attendance");
      const l = await api.get("/hai/logs");
      const aw = await api.get("/hai/appreciation");

      setStaff(s.data || []);
      setAttendance(a.data || []);
      setLogs(l.data || []);
      setAwards(aw.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  // ================= STAFF =================
  const saveStaff = async () => {

    const formData = new FormData();

    Object.keys(form).forEach(k => {
      formData.append(k, form[k]);
    });

    if (file) formData.append("photo", file);

    await api.post("/hai/staff", formData);

    setForm({
      name: "", role: "", experience: "", previous_job: "",
      qualification: "", specialization: "", notes: "", joining_date: ""
    });

    setFile(null);
    loadAll();
  };

  // ================= ATTENDANCE =================
  const checkIn = async () => {
    await api.post("/hai/checkin", { staff: selected });
    loadAll();
  };

  const checkOut = async () => {
    await api.post("/hai/checkout", { staff: selected });
    loadAll();
  };

  // ================= EVALUATION =================
  const saveScore = async () => {
    await api.post("/hai/evaluation", { staff: selected, score });
    setScore("");
  };

  // ================= LOGS =================
  const saveLog = async () => {
    await api.post("/hai/logs", { staff: selected, note });
    setNote("");
    loadAll();
  };

  // ================= APPRECIATION =================
  const saveAward = async () => {
    await api.post("/hai/appreciation", { staff: selected, award });
    setAward("");
    loadAll();
  };

  return (
    <Layout>

      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
      <h1>Staff & accountability intelligence</h1>

      {/* TABS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["profiles","attendance","evaluation","logs","appreciation"].map(t => (
          <button key={t} onClick={()=>setActive(t)}
            style={{
              padding: 8,
              background: active===t ? "#2563eb":"#ddd",
              color: active===t?"white":"black",
              border: "none"
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* ================= PROFILES ================= */}
      {active === "profiles" && (
        <>
          <h3>Add Staff Profile</h3>

          <input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>
          <input placeholder="Role" onChange={e=>setForm({...form,role:e.target.value})}/>
          <input placeholder="Experience" onChange={e=>setForm({...form,experience:e.target.value})}/>
          <input placeholder="Previous Job" onChange={e=>setForm({...form,previous_job:e.target.value})}/>
          <input placeholder="Qualification" onChange={e=>setForm({...form,qualification:e.target.value})}/>
          <input placeholder="Specialization" onChange={e=>setForm({...form,specialization:e.target.value})}/>
          <input placeholder="Notes" onChange={e=>setForm({...form,notes:e.target.value})}/>
          <input type="date" onChange={e=>setForm({...form,joining_date:e.target.value})}/>
          <input type="file" onChange={e=>setFile(e.target.files[0])}/>

          <button onClick={saveStaff}>Save Profile</button>

          <hr />

          {staff.map(s=>(
            <div key={s._id}>
              <b>{s.name}</b> ({s.role})<br/>
              Joined: {s.joining_date}
            </div>
          ))}
        </>
      )}

      {/* ================= ATTENDANCE ================= */}
      {active === "attendance" && (
        <>
          <h3>Attendance Intelligence</h3>

          <select onChange={e=>setSelected(e.target.value)}>
            <option>Select Staff</option>
            {staff.map(s=><option key={s._id}>{s.name}</option>)}
          </select>

          <button onClick={checkIn}>Check-in</button>
          <button onClick={checkOut}>Check-out</button>

          {attendance.map(a=>(
            <p key={a._id}>{a.staff} - {a.type}</p>
          ))}
        </>
      )}

      {/* ================= EVALUATION ================= */}
      {active === "evaluation" && (
        <>
          <h3>Evaluation Engine</h3>

          <select onChange={e=>setSelected(e.target.value)}>
            {staff.map(s=><option key={s._id}>{s.name}</option>)}
          </select>

          <input placeholder="Score" value={score} onChange={e=>setScore(e.target.value)}/>
          <button onClick={saveScore}>Save</button>
        </>
      )}

      {/* ================= LOGS ================= */}
      {active === "logs" && (
        <>
          <h3>Correction Logs</h3>

          <select onChange={e=>setSelected(e.target.value)}>
            {staff.map(s=><option key={s._id}>{s.name}</option>)}
          </select>

          <input placeholder="Note" value={note} onChange={e=>setNote(e.target.value)}/>
          <button onClick={saveLog}>Save</button>

          {logs.map(l=>(
            <p key={l._id}>{l.staff} - {l.note}</p>
          ))}
        </>
      )}

      {/* ================= APPRECIATION ================= */}
      {active === "appreciation" && (
        <>
          <h3>Appreciation Records</h3>

          <select onChange={e=>setSelected(e.target.value)}>
            {staff.map(s=><option key={s._id}>{s.name}</option>)}
          </select>

          <input placeholder="Award / Recognition"
            value={award}
            onChange={e=>setAward(e.target.value)}
          />

          <button onClick={saveAward}>Save</button>

          {awards.map(a=>(
            <p key={a._id}>{a.staff} - {a.award}</p>
          ))}
        </>
      )}

    </Layout>
  );
}