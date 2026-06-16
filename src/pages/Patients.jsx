import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import Layout from "../components/Layout";
import Biography from "../components/patient/Biography";
import Checkup from "../components/patient/Checkup";
import PlannedSequence from "../components/patient/PlannedSequence";
import Invoice from "../components/patient/Invoice";
import ToothChart from "../components/common/ToothChart";
import toothChartImg from "../assets/tooth-chart.png";

// ── Print function ──────────────────────────────────────────────────────────
function printPatient(patient, toothChartSrc) {
  const pw = window.open("", "", "width=1400,height=1000");
  const invoice  = patient?.invoice || [];
  const planned  = patient?.plannedSequence || [];
  const toothStates = patient?.toothStates || {};
  const total    = invoice.reduce((s, i) => s + Number(i.cost || 0), 0);
  const disc     = Number(patient?.discount || 0);
  const net      = total - disc;
  const chartNotes = Object.entries(toothStates).filter(([,v]) => v !== "healthy")
    .map(([k, v]) => `#${k}:${v}`).join(", ") || "All teeth healthy";

  pw.document.write(`<!DOCTYPE html><html><head>
  <title>HDC Dental — Patient File</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;padding:16px;color:#000;font-size:13px}
    .header{text-align:center;border-bottom:2.5px solid #000;padding-bottom:12px;margin-bottom:18px}
    .header h1{font-size:22px;font-weight:900}
    .header p{font-size:11px;color:#555;margin-top:3px}
    .sec{font-size:14px;font-weight:700;margin:18px 0 10px;text-decoration:underline;text-underline-offset:3px}
    .bio-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 24px;margin-bottom:14px}
    .bio-row{font-size:13px;padding:3px 0;border-bottom:1px dotted #ddd}
    .bio-row b{min-width:100px;display:inline-block}
    .tooth-box{text-align:center;margin:10px 0}
    .tooth-box img{width:780px;max-width:100%}
    .tooth-notes{font-size:11.5px;background:#f5f5f5;padding:7px 10px;border-radius:4px;margin:8px 0;border:1px solid #ddd}
    table{width:100%;border-collapse:collapse;margin-bottom:18px}
    th{background:#f0f0f0;border:1px solid #000;padding:5px 8px;font-size:12px;text-align:center}
    td{border:1px solid #ccc;padding:5px 8px;font-size:12px}
    td.l{text-align:left}td.r{text-align:right}td.c{text-align:center}
    .totals{width:320px;margin-left:auto;border:1.5px solid #000}
    .totals td{border:none;border-bottom:1px solid #ddd;padding:7px 12px;font-size:14px;font-weight:700}
    .totals tr:last-child td{background:#f0f0f0;border-bottom:none}
    .footer{margin-top:40px;display:flex;justify-content:space-between}
    .sig{border-top:1.5px solid #000;width:200px;padding-top:4px;text-align:center;font-size:11px}
    @media print{body{padding:6px}.tooth-box img{width:680px}}
  </style>
</head><body>

<div class="header">
  <h1>Dr. Zaffar Iqbal Dental Clinic</h1>
  <p>Hayatabad, Peshawar · Patient Record · ${new Date().toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"})}</p>
</div>

<div class="sec">Bio-data</div>
<div class="bio-grid">
  <div class="bio-row"><b>Reg No :</b> ${patient?.biography?.regNo||"—"}</div>
  <div class="bio-row"><b>Date :</b> ${patient?.biography?.date||"—"}</div>
  <div class="bio-row"><b>Patient Name :</b> ${patient?.biography?.patientName||"—"}</div>
  <div class="bio-row"><b>Age / Gender :</b> ${patient?.biography?.age||"—"} / ${patient?.biography?.gender||"—"}</div>
  <div class="bio-row"><b>Contact :</b> ${patient?.biography?.mobileNumber||"—"}</div>
  <div class="bio-row"><b>Referred By :</b> ${patient?.biography?.referredBy||"—"}</div>
  <div class="bio-row"><b>Address :</b> ${patient?.biography?.address||"—"}</div>
  <div class="bio-row"><b>Medical History :</b> ${patient?.biography?.medicalHistory||"None"}</div>
</div>

<div class="sec">Dental Chart</div>
<div class="tooth-box"><img src="${window.location.origin+toothChartSrc}" /></div>
<div class="tooth-notes"><b>Chart summary:</b> ${chartNotes}</div>
${patient?.toothNotes ? `<div class="tooth-notes"><b>Notes:</b> ${patient.toothNotes}</div>` : ""}

<div class="sec">Treatment Details</div>
<table>
  <tr><th style="width:40px">S No</th><th style="width:110px">Details</th><th>Pre-Existing Condition</th><th>Recommended Treatment</th></tr>
  <tr><td class="c">1</td><td class="l">Clinical</td><td class="l">${patient?.checkup?.clinicalTasks?.condition||""}</td><td class="l">${patient?.checkup?.clinicalTasks?.treatment||""}</td></tr>
  ${[2,3,4,5,6].map(n=>`<tr><td class="c">${n}</td><td></td><td></td><td></td></tr>`).join("")}
</table>

${planned.length ? `
<div class="sec">Planned Sequence</div>
<table>
  <tr><th style="width:40px">S No</th><th style="width:100px">Date</th><th>Treatment</th><th style="width:90px">Status</th></tr>
  ${planned.map((p,i)=>`<tr><td class="c">${i+1}</td><td class="c">${p.date||""}</td><td class="l">${p.treatment||p.details||""}</td><td class="c">${p.status||"Planned"}</td></tr>`).join("")}
</table>` : ""}

<div class="sec">Invoice</div>
<table>
  <tr><th style="width:40px">S No</th><th>Treatment / Item</th><th style="width:50px">Qty</th><th style="width:80px">Rate (₨)</th><th style="width:90px">Cost (₨)</th></tr>
  ${invoice.map((item,i)=>`<tr><td class="c">${i+1}</td><td class="l">${item.details||""}</td><td class="c">${item.qty||""}</td><td class="r">${item.rate||""}</td><td class="r">${item.cost||""}</td></tr>`).join("")}
  ${Array.from({length:Math.max(0,5-invoice.length)},(_,i)=>`<tr><td class="c">${invoice.length+i+1}</td><td></td><td></td><td></td><td></td></tr>`).join("")}
</table>

<table class="totals">
  <tr><td>Total Amount</td><td class="r">₨ ${total.toLocaleString()}</td></tr>
  <tr><td>Discount</td><td class="r">₨ ${disc.toLocaleString()}</td></tr>
  <tr><td>Net Amount</td><td class="r">₨ ${net.toLocaleString()}</td></tr>
</table>

<div class="footer">
  <div class="sig">Patient Signature</div>
  <div class="sig">Doctor / Dentist Signature</div>
</div>

<script>window.onload=()=>setTimeout(()=>window.print(),400);<\/script>
</body></html>`);
  pw.document.close();
}

// ═══════════════════════════════════════════════════════════════════════════
export default function Patients({ activePage, setActivePage, handleLogout }) {
  const user         = JSON.parse(localStorage.getItem("user") || "{}");

  const EMPTY = { biography:{}, checkup:{}, plannedSequence:[], invoice:[], discount:0, accountLedger:[], toothStates:{}, toothNotes:"" };

  const [data, setData]       = useState(EMPTY);
  const [tab, setTab]         = useState("biography");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const messageTimer = useRef(null);

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => setMessage(null), 4200);
  };

  useEffect(() => {
    const stored = localStorage.getItem("editPatient");
    if (stored) { try { setData(JSON.parse(stored)); } catch (_) {} }
  }, []);

  // ── Invoice totals ──────────────────────────────────────────────────────
  const invoiceTotal = (data.invoice || []).reduce((s, i) => s + Number(i.cost || 0), 0);
  const invDiscount  = Number(data.discount || 0);
  const invoiceNet   = invoiceTotal - invDiscount;

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!data.biography?.patientName?.trim()) {
      notify("Patient name is required before saving.", "warning"); return;
    }
    if (data.isEditing) {
      notify("Currently in editing mode. Use Update button.", "warning"); return;
    }
    setLoading(true);
    try {
      const res = await api.post("/patients", data);
      setData(p => ({ ...p, biography: { ...p.biography, regNo: res.data.reg_no } }));
      notify(`Patient saved. Reg No: ${res.data.reg_no}`, "success");
    } catch (e) {
      notify(e?.response?.data?.detail || "Error saving patient. Try again.", "danger");
    } finally { setLoading(false); }
  };

  // ── Update ──────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!data._id) { notify("No patient ID for update.", "danger"); return; }
    setLoading(true);
    try {
      await api.put(`/patients/${data._id}`, data);
      notify("Patient updated successfully.", "success");
      localStorage.removeItem("editPatient");
    } catch (e) {
      notify(e?.response?.data?.detail || "Update failed.", "danger");
    } finally { setLoading(false); }
  };

  // ── Clear ───────────────────────────────────────────────────────────────
  const handleClear = () => {
    if (!window.confirm("Clear all fields and start a new patient?")) return;
    localStorage.removeItem("editPatient");
    setData(EMPTY);
    setTab("biography");
    notify("Form cleared. Ready for new patient.", "success");
  };

  const TABS = [
    { id: "biography",       icon: "ti-user",           label: "Bio-data"  },
    { id: "toothChart",      icon: "ti-tooth",          label: "Tooth Chart" },
    { id: "checkup",         icon: "ti-stethoscope",    label: "Checkup"   },
    { id: "plannedSequence", icon: "ti-list-check",     label: "Planned"   },
    { id: "invoice",         icon: "ti-receipt-2",      label: "Invoice"   },
  ];

  const tabIdx = TABS.findIndex(t => t.id === tab);

  // ── Tab completeness ────────────────────────────────────────────────────
  const done = {
    biography:       !!data.biography?.patientName,
    toothChart:      Object.keys(data.toothStates || {}).length > 0,
    checkup:         !!data.checkup?.clinicalTasks?.condition,
    plannedSequence: (data.plannedSequence || []).length > 0,
    invoice:         (data.invoice || []).length > 0,
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      user={user}
      handleLogout={handleLogout}
    >
      <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>

        {/* ── TOPBAR ──────────────────────────────────────────────────── */}
        <div className="topbar">
          <button className="btn btn-ghost btn-icon no-print" onClick={() => setActivePage("dashboard")}>
            <i className="ti ti-arrow-left" style={{ fontSize: "20px" }} />
          </button>
          <div>
            <div className="topbar-title">
              {data.isEditing ? "Edit Patient" : "New Patient Entry"}
            </div>
            {data.biography?.regNo && (
              <span style={{ fontSize: "12px", color: "var(--text-3)" }}>Reg #{data.biography.regNo}</span>
            )}
          </div>

          {/* Invoice mini-summary in topbar */}
          {invoiceTotal > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:"12px", background:"var(--bg)", border:"1.5px solid var(--border)", borderRadius:"10px", padding:"6px 14px", marginLeft:"8px" }}>
              <span style={{ fontSize:"12px", color:"var(--text-3)" }}>Total</span>
              <span style={{ fontWeight:"700", color:"var(--text-1)" }}>₨{invoiceTotal.toLocaleString()}</span>
              {invDiscount > 0 && <>
                <span style={{ fontSize:"12px", color:"var(--text-3)" }}>Net</span>
                <span style={{ fontWeight:"700", color:"var(--success)" }}>₨{invoiceNet.toLocaleString()}</span>
              </>}
            </div>
          )}

          <div style={{ flex: 1 }} />

          <button className="btn btn-ghost no-print" onClick={handleClear}>
            <i className="ti ti-trash" /> Clear
          </button>
          <button className="btn no-print" onClick={() => printPatient(data, toothChartImg)}>
            <i className="ti ti-printer" /> Print
          </button>
        </div>

        {/* ── CONTENT ─────────────────────────────────────────────────── */}
        <div className="page-content" style={{ paddingBottom: "80px" }}>
          {message && (
            <div className={`notice ${message.type === "danger" ? "danger" : ""}`}>
              {message.text}
            </div>
          )}

          {/* Tab bar */}
          <div className="tab-bar">
            {TABS.map((t) => (
              <button key={t.id} className={`tab-item${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                <i className={`ti ${t.icon}`} />
                {t.label}
                {done[t.id] && (
                  <i className="ti ti-circle-check" style={{ fontSize: "13px", color: "var(--success)", marginLeft: "2px" }} />
                )}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="card fade-in" key={tab}>
            {tab === "biography"       && <Biography       patientData={data} setPatientData={setData} />}
            {tab === "toothChart"      && <ToothChart       patientData={data} setPatientData={setData} />}
            {tab === "checkup"         && <Checkup          patientData={data} setPatientData={setData} />}
            {tab === "plannedSequence" && <PlannedSequence  patientData={data} setPatientData={setData} />}
            {tab === "invoice"         && <Invoice          patientData={data} setPatientData={setData} />}
          </div>

          {/* Prev / Next */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"14px" }}>
            <button className="btn" disabled={tabIdx === 0} onClick={() => setTab(TABS[tabIdx-1].id)}>
              <i className="ti ti-arrow-left" /> Previous
            </button>
            <button className="btn btn-primary" disabled={tabIdx === TABS.length-1} onClick={() => setTab(TABS[tabIdx+1].id)}>
              Next <i className="ti ti-arrow-right" />
            </button>
          </div>
        </div>

        {/* ── BOTTOM BAR ──────────────────────────────────────────────── */}
        <div className="bottom-bar no-print">
          {/* Progress pips */}
          <div className="progress-tabs">
            {TABS.map((t) => (
              <div key={t.id} className={`progress-pip${tab === t.id ? " active" : done[t.id] ? " done" : ""}`}
                onClick={() => setTab(t.id)} title={t.label} />
            ))}
            <span style={{ fontSize:"11px", color:"var(--text-3)", whiteSpace:"nowrap", marginLeft:"4px" }}>
              {tabIdx+1} / {TABS.length}
            </span>
          </div>

          {data.isEditing ? (
            <button className="btn btn-success btn-lg" onClick={handleUpdate} disabled={loading}>
              {loading ? <><div className="spinner" /> Updating…</> : <><i className="ti ti-device-floppy" /> Update Patient</>}
            </button>
          ) : (
            <button className="btn btn-navy btn-lg" onClick={handleSave} disabled={loading}>
              {loading ? <><div className="spinner" /> Saving…</> : <><i className="ti ti-device-floppy" /> Save Patient</>}
            </button>
          )}
        </div>

      </div>
    </Layout>
  );
}
