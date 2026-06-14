import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import Layout from "../components/Layout";
import Biography from "../components/patient/Biography";
import Checkup from "../components/patient/Checkup";
import PlannedSequence from "../components/patient/PlannedSequence";
import Invoice from "../components/patient/Invoice";
import ToothChart from "../components/patient/ToothChart";
import toothChart from "../assets/tooth-chart.png";

// ── Sound alert helper ─────────────────────────────────────────────────────
function playBeep(type = "success") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs =
      type === "success"  ? [660, 880]      :
      type === "error"    ? [330, 220]      :
      type === "warning"  ? [550, 440, 550] : [660];
    let t = ctx.currentTime;
    freqs.forEach((f) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = f; o.type = "sine";
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.start(t); o.stop(t + 0.2);
      t += 0.23;
    });
  } catch (_) {}
}

// ── Alert banner component ─────────────────────────────────────────────────
function AlertBanner({ alert, onClose }) {
  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [alert, onClose]);

  if (!alert) return null;

  const styles = {
    success: { bg: "#EAF3DE", border: "#97C459", color: "#27500A", icon: "✓" },
    error:   { bg: "#FCEBEB", border: "#E24B4A", color: "#791F1F", icon: "✕" },
    warning: { bg: "#FAEEDA", border: "#EF9F27", color: "#633806", icon: "⚠" },
  };
  const s = styles[alert.type] || styles.success;

  return (
    <div style={{
      position: "fixed", top: "20px", right: "20px", zIndex: 9999,
      background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: "12px",
      padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)", minWidth: "300px", maxWidth: "420px",
      animation: "slideIn 0.25s ease",
    }}>
      <span style={{ fontSize: "18px", color: s.color, fontWeight: "bold" }}>{s.icon}</span>
      <span style={{ flex: 1, color: s.color, fontSize: "13.5px", fontWeight: "500" }}>{alert.msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: s.color, fontSize: "16px", padding: "0 4px" }}>×</button>
    </div>
  );
}

// ── Main Patients page ─────────────────────────────────────────────────────
function Patients({ activePage, setActivePage }) {

  const [patientData, setPatientData] = useState({
    biography:       {},
    checkup:         {},
    plannedSequence: [],
    invoice:         [],
    discount:        0,
    accountLedger:   [],
    toothStates:     {},   // NEW — tooth chart states
  });

  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState(null);
  const [activeTab, setActiveTab] = useState("biography");
  const printRef = useRef();

  // ── Load editing patient from localStorage ──────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("editPatient");
    if (stored) {
      try { setPatientData(JSON.parse(stored)); }
      catch (_) {}
    }
  }, []);

  // ── Show alert helper ───────────────────────────────────────────────────
  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    playBeep(type);
  };

  // ── SAVE ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (patientData?.isEditing) {
      showAlert("Editing mode — Update route not connected yet.", "warning");
      return;
    }

    // Basic validation
    if (!patientData?.biography?.patientName?.trim()) {
      showAlert("Please enter the patient name before saving.", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/patients", patientData);

      // Update reg no from server response
      setPatientData((prev) => ({
        ...prev,
        biography: { ...prev.biography, regNo: response.data.reg_no },
      }));

      showAlert(`Patient saved! Reg No: ${response.data.reg_no}`, "success");
    } catch (error) {
      console.error(error);
      showAlert("Error saving patient. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── UPDATE (editing mode) ───────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!patientData?._id) {
      showAlert("No patient ID found for update.", "error");
      return;
    }
    try {
      setLoading(true);
      await api.put(`/patients/${patientData._id}`, patientData);
      showAlert("Patient updated successfully!", "success");
      localStorage.removeItem("editPatient");
    } catch (error) {
      console.error(error);
      showAlert("Error updating patient.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── CLEAR FORM ──────────────────────────────────────────────────────────
  const handleClear = () => {
    if (!window.confirm("Clear all fields and start a new patient?")) return;
    localStorage.removeItem("editPatient");
    setPatientData({
      biography: {}, checkup: {}, plannedSequence: [],
      invoice: [], discount: 0, accountLedger: {}, toothStates: {},
    });
    setActiveTab("biography");
    showAlert("Form cleared. Ready for new patient.", "success");
  };

  // ── PRINT ───────────────────────────────────────────────────────────────
  const handlePrint = (patient) => {
    const printWindow = window.open("", "", "width=1400,height=1000");

    const invoice  = patient?.invoice || [];
    const planned  = patient?.plannedSequence || [];
    const toothStates = patient?.toothStates || {};

    const totalAmount = invoice.reduce((sum, item) => sum + Number(item.cost || 0), 0);
    const discount    = Number(patient?.discount || 0);
    const netAmount   = totalAmount - discount;

    // Build tooth states summary for print
    const toothSummary = Object.entries(toothStates)
      .filter(([, v]) => v !== "healthy")
      .map(([k, v]) => `Tooth #${k}: ${v}`)
      .join(", ") || "All teeth healthy";

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>HDC Dental — Patient Record</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 0; padding: 16px; color: #000; font-size: 13px; }
    .clinic-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 16px; }
    .clinic-header h1 { font-size: 22px; margin: 0 0 4px; }
    .clinic-header p  { margin: 0; font-size: 12px; color: #555; }
    .section { font-size: 15px; font-weight: bold; margin: 18px 0 10px; text-decoration: underline; text-underline-offset: 3px; }
    .bio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; margin-bottom: 14px; }
    .bio-row { font-size: 13px; padding: 2px 0; }
    .bio-row b { display: inline-block; min-width: 90px; }
    .tooth-img { text-align: center; margin: 10px 0 6px; }
    .tooth-img img { width: 780px; max-width: 100%; }
    .tooth-summary { font-size: 12px; color: #333; margin-bottom: 10px; padding: 6px 10px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { border: 1px solid #000; padding: 5px 8px; font-size: 12px; text-align: center; background: #f0f0f0; }
    td { border: 1px solid #ccc; padding: 5px 8px; font-size: 12px; text-align: center; }
    td.left { text-align: left; }
    .no-border td { border: none; }
    .totals { width: 320px; margin-left: auto; border: 1px solid #000; }
    .totals td { font-size: 14px; font-weight: bold; border: none; border-bottom: 1px solid #ddd; padding: 6px 10px; }
    .totals tr:last-child td { border-bottom: none; background: #f0f0f0; }
    .totals .label { text-align: left; }
    .totals .value { text-align: right; }
    .planned-table td { text-align: left; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
    .sig-line { border-top: 1px solid #000; width: 200px; padding-top: 4px; text-align: center; }
    @media print {
      body { padding: 8px; }
      .tooth-img img { width: 700px; }
    }
  </style>
</head>
<body>

  <div class="clinic-header">
    <h1>HDC Dental Clinic</h1>
    <p>Hayatabad, Peshawar &nbsp;·&nbsp; Patient Record &nbsp;·&nbsp; Printed: ${new Date().toLocaleDateString("en-PK", { day:"2-digit", month:"short", year:"numeric" })}</p>
  </div>

  <!-- BIO DATA -->
  <div class="section">Bio-data</div>
  <div class="bio-grid">
    <div class="bio-row"><b>Reg No :</b> ${patient?.biography?.regNo || "—"}</div>
    <div class="bio-row"><b>Date :</b> ${patient?.biography?.date || "—"}</div>
    <div class="bio-row"><b>Patient Name :</b> ${patient?.biography?.patientName || "—"}</div>
    <div class="bio-row"><b>Age / Gender :</b> ${patient?.biography?.age || "—"} / ${patient?.biography?.gender || "—"}</div>
    <div class="bio-row"><b>Contact :</b> ${patient?.biography?.mobileNumber || "—"}</div>
    <div class="bio-row"><b>Referred by :</b> ${patient?.biography?.referredBy || "—"}</div>
    <div class="bio-row"><b>Address :</b> ${patient?.biography?.address || "—"}</div>
  </div>

  <!-- TOOTH CHART -->
  <div class="section">Tooth Chart</div>
  <div class="tooth-img">
    <img src="${window.location.origin + toothChart}" />
  </div>
  <div class="tooth-summary"><b>Chart notes:</b> ${toothSummary}</div>

  <!-- TREATMENT DETAILS -->
  <div class="section">Treatment Details</div>
  <table>
    <tr>
      <th style="width:40px">S No</th>
      <th style="width:120px">Details</th>
      <th>Pre-Existing Condition</th>
      <th>Recommended Treatment</th>
    </tr>
    <tr>
      <td>1</td><td class="left">Clinical</td>
      <td class="left">${patient?.checkup?.clinicalTasks?.condition || ""}</td>
      <td class="left">${patient?.checkup?.clinicalTasks?.treatment || ""}</td>
    </tr>
    ${[2,3,4,5,6].map(n => `<tr><td>${n}</td><td></td><td></td><td></td></tr>`).join("")}
  </table>

  <!-- PLANNED SEQUENCE -->
  ${planned.length > 0 ? `
  <div class="section">Planned Sequence</div>
  <table class="planned-table">
    <tr><th style="width:40px">S No</th><th style="width:100px">Date</th><th>Treatment</th><th style="width:80px">Status</th></tr>
    ${planned.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.date || ""}</td>
        <td class="left">${p.treatment || p.details || ""}</td>
        <td>${p.status || "Planned"}</td>
      </tr>`).join("")}
  </table>` : ""}

  <!-- INVOICE -->
  <div class="section">Invoice</div>
  <table>
    <tr>
      <th style="width:40px">S No</th>
      <th>Treatment / Item</th>
      <th style="width:50px">Qty</th>
      <th style="width:80px">Rate (₨)</th>
      <th style="width:90px">Cost (₨)</th>
    </tr>
    ${invoice.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td class="left">${item.details || ""}</td>
        <td>${item.qty || ""}</td>
        <td>${item.rate || ""}</td>
        <td>${item.cost || ""}</td>
      </tr>`).join("")}
    ${Array.from({ length: Math.max(0, 5 - invoice.length) }, (_, i) =>
      `<tr><td>${invoice.length + i + 1}</td><td></td><td></td><td></td><td></td></tr>`
    ).join("")}
  </table>

  <table class="totals">
    <tr><td class="label">Total Amount</td><td class="value">₨ ${totalAmount.toLocaleString()}</td></tr>
    <tr><td class="label">Discount</td><td class="value">₨ ${discount.toLocaleString()}</td></tr>
    <tr><td class="label">Net Amount</td><td class="value">₨ ${netAmount.toLocaleString()}</td></tr>
  </table>

  <div class="footer">
    <div class="sig-line">Patient Signature</div>
    <div class="sig-line">Doctor Signature</div>
  </div>

</body>
</html>`);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

  // ── Tabs config ─────────────────────────────────────────────────────────
  const tabs = [
    { id: "biography",       label: "Bio-data",        icon: "👤" },
    { id: "toothChart",      label: "Tooth Chart",     icon: "🦷" },
    { id: "checkup",         label: "Checkup",         icon: "🔍" },
    { id: "plannedSequence", label: "Planned",         icon: "📋" },
    { id: "invoice",         label: "Invoice",         icon: "🧾" },
  ];

  // ── Invoice totals ──────────────────────────────────────────────────────
  const invoiceTotal    = (patientData?.invoice || []).reduce((s, i) => s + Number(i.cost || 0), 0);
  const invoiceDiscount = Number(patientData?.discount || 0);
  const invoiceNet      = invoiceTotal - invoiceDiscount;

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>

      {/* Slide-in animation keyframes */}
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
        .tab-btn { transition: all .15s; }
        .tab-btn:hover { background: #f0f4f8 !important; }
      `}</style>

      {/* Alert banner */}
      <AlertBanner alert={alert} onClose={() => setAlert(null)} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px 120px" }}>

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <div style={{ background: "#fff", borderRadius: "20px", padding: "24px 28px", marginBottom: "20px", border: "1px solid #e8ecf0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" }}>
              {patientData?.isEditing ? "✏️ Edit Patient" : "➕ New Patient Entry"}
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              HDC Dental Clinic — Patient Management
              {patientData?.biography?.regNo && (
                <span style={{ marginLeft: "12px", background: "#E6F1FB", color: "#0C447C", padding: "2px 10px", borderRadius: "20px", fontWeight: "600", fontSize: "12px" }}>
                  Reg #{patientData.biography.regNo}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleClear}
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "13px", color: "#64748b", fontWeight: "500" }}
          >
            🗑 Clear / New
          </button>
        </div>

        {/* ── INVOICE SUMMARY BAR (shows when invoice has items) ──────── */}
        {(patientData?.invoice?.length > 0) && (
          <div style={{ background: "#07111f", borderRadius: "14px", padding: "12px 22px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "24px", color: "#fff" }}>
            <span style={{ fontSize: "13px", opacity: .7 }}>Invoice summary</span>
            <span style={{ fontSize: "13px" }}>Total: <b>₨{invoiceTotal.toLocaleString()}</b></span>
            <span style={{ fontSize: "13px" }}>Discount: <b>₨{invoiceDiscount.toLocaleString()}</b></span>
            <span style={{ fontSize: "14px", marginLeft: "auto", background: "#185FA5", padding: "4px 14px", borderRadius: "8px" }}>
              Net: <b>₨{invoiceNet.toLocaleString()}</b>
            </span>
          </div>
        )}

        {/* ── TAB NAV ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "18px", background: "#fff", borderRadius: "14px", padding: "6px", border: "1px solid #e8ecf0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="tab-btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: "10px 6px", borderRadius: "10px", border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: "600",
                background: activeTab === tab.id ? "#07111f" : "transparent",
                color:      activeTab === tab.id ? "#fff"    : "#64748b",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB PANELS ──────────────────────────────────────────────── */}
        <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", border: "1px solid #e8ecf0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

          {activeTab === "biography" && (
            <Biography patientData={patientData} setPatientData={setPatientData} />
          )}

          {activeTab === "toothChart" && (
            <ToothChart patientData={patientData} setPatientData={setPatientData} />
          )}

          {activeTab === "checkup" && (
            <Checkup patientData={patientData} setPatientData={setPatientData} />
          )}

          {activeTab === "plannedSequence" && (
            <PlannedSequence patientData={patientData} setPatientData={setPatientData} />
          )}

          {activeTab === "invoice" && (
            <Invoice patientData={patientData} setPatientData={setPatientData} />
          )}

        </div>

        {/* ── TAB NAVIGATION ARROWS ───────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px" }}>
          <button
            onClick={() => {
              const idx = tabs.findIndex(t => t.id === activeTab);
              if (idx > 0) setActiveTab(tabs[idx - 1].id);
            }}
            disabled={activeTab === tabs[0].id}
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "9px 18px", cursor: "pointer", fontSize: "13px", color: "#64748b", fontWeight: "500", opacity: activeTab === tabs[0].id ? 0.4 : 1 }}
          >
            ← Previous
          </button>
          <button
            onClick={() => {
              const idx = tabs.findIndex(t => t.id === activeTab);
              if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
            }}
            disabled={activeTab === tabs[tabs.length - 1].id}
            style={{ background: "#07111f", border: "none", borderRadius: "10px", padding: "9px 18px", cursor: "pointer", fontSize: "13px", color: "#fff", fontWeight: "500", opacity: activeTab === tabs[tabs.length - 1].id ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>

      </div>

      {/* ── FIXED BOTTOM ACTION BAR ─────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)",
        borderTop: "1px solid #e8ecf0", padding: "12px 24px",
        display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-end",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
      }}>
        {/* Progress indicator */}
        <div style={{ flex: 1, display: "flex", gap: "6px", alignItems: "center" }}>
          {tabs.map((tab) => (
            <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              height: "4px", flex: 1, borderRadius: "2px", cursor: "pointer",
              background: activeTab === tab.id ? "#07111f" : tab.id === "biography" && patientData?.biography?.patientName ? "#97C459"
                : tab.id === "toothChart" && Object.keys(patientData?.toothStates || {}).length > 0 ? "#97C459"
                : tab.id === "invoice" && patientData?.invoice?.length > 0 ? "#97C459"
                : "#e2e8f0",
              transition: "background .2s",
            }} title={tab.label} />
          ))}
          <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
            {tabs.findIndex(t => t.id === activeTab) + 1} / {tabs.length}
          </span>
        </div>

        <button
          onClick={() => handlePrint(patientData)}
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "11px 22px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}
        >
          🖨 Print
        </button>

        {patientData?.isEditing ? (
          <button
            onClick={handleUpdate}
            disabled={loading}
            style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: "12px", padding: "11px 28px", cursor: loading ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "700", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Updating…" : "✓ Update Patient"}
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading}
            style={{ background: "#07111f", color: "#fff", border: "none", borderRadius: "12px", padding: "11px 28px", cursor: loading ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "700", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Saving…" : "💾 Save Patient"}
          </button>
        )}
      </div>

    </Layout>
  );
}

export default Patients;