import React, { useEffect, useRef, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import Biography from "../components/patient/Biography";
import Checkup from "../components/patient/Checkup";
import PlannedSequence from "../components/patient/PlannedSequence";
import Invoice from "../components/patient/Invoice";
import toothChartImg from "../assets/tooth-chart.png";
import { discountAmount, netAmount } from "../utils/patientHelpers";
import { printPatientFile } from "../utils/printPatientFile";
import { playSectionSound } from "../utils/sound";

const EMPTY_PATIENT = {
  biography: {},
  checkup: {},
  plannedSequence: [],
  invoice: [],
  discount: 0,
  discountPercent: 0,
  accountLedger: [],
  toothStates: {},
  toothNotes: "",
};

const TABS = [
  { id: "biography", label: "Bio-data" },
  { id: "checkup", label: "Clinical Exam" },
  { id: "plannedSequence", label: "Planned" },
  { id: "invoice", label: "Invoice" },
];

export default function Patients({ activePage, setActivePage, handleLogout }) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const [data, setData] = useState(EMPTY_PATIENT);
  const [tab, setTab] = useState("biography");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const messageTimer = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("editPatient");

    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => setMessage(null), 4200);
    playSectionSound(type === "danger" ? "warning" : "success");
  };

  const invoiceTotal = (data.invoice || []).reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const invDiscount = discountAmount(data);
  const invoiceNet = netAmount(data);
  const tabIndex = TABS.findIndex((item) => item.id === tab);

  const done = {
    biography: Boolean(data.biography?.patientName),
    checkup:
      (data.checkup?.softTissueRecords || []).length > 0 ||
      (data.checkup?.hardTissueRecords || []).length > 0 ||
      Object.keys(data.toothStates || {}).length > 0,
    plannedSequence: (data.plannedSequence || []).some(
      (visit) => visit.date || visit.procedure || visit.treatment || visit.details
    ),
    invoice: (data.invoice || []).some((item) => item.details || Number(item.cost || 0) > 0),
  };

  const handleSave = async () => {
    if (!data.biography?.patientName?.trim()) {
      notify("Patient name is required before saving.", "danger");
      return;
    }

    if (data.isEditing) {
      notify("Currently in editing mode. Use Update button.", "danger");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/patients", data);
      setData((current) => ({
        ...current,
        biography: {
          ...current.biography,
          regNo: response.data.reg_no,
        },
      }));
      notify(`Patient saved. Reg No: ${response.data.reg_no}`);
    } catch (error) {
      notify(error?.response?.data?.detail || "Error saving patient. Try again.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!data._id) {
      notify("No patient ID for update.", "danger");
      return;
    }

    setLoading(true);

    try {
      await api.put(`/patients/${data._id}`, data);
      localStorage.removeItem("editPatient");
      notify("Patient updated successfully.");
    } catch (error) {
      notify(error?.response?.data?.detail || "Update failed.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (!window.confirm("Clear all fields and start a new patient?")) {
      return;
    }

    localStorage.removeItem("editPatient");
    setData(EMPTY_PATIENT);
    setTab("biography");
    notify("Form cleared. Ready for new patient.");
  };

  const goToTab = (tabId) => {
    playSectionSound("section");
    setTab(tabId);
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      user={user}
      handleLogout={handleLogout}
    >
      <div className="patient-entry-shell">
        <div className="topbar">
          <button className="btn btn-ghost btn-icon no-print" onClick={() => setActivePage("dashboard")}>
            Back
          </button>

          <div>
            <div className="topbar-title">{data.isEditing ? "Edit Patient" : "Patient Entry"}</div>
            {data.biography?.regNo && (
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>Reg #{data.biography.regNo}</span>
            )}
          </div>

          {invoiceTotal > 0 && (
            <div className="mini-summary">
              <span>Total</span>
              <strong>{invoiceTotal.toLocaleString("en-PK")}</strong>
              <span>Discount</span>
              <strong>{invDiscount.toLocaleString("en-PK")}</strong>
              <span>Net</span>
              <strong>{invoiceNet.toLocaleString("en-PK")}</strong>
            </div>
          )}

          <div style={{ flex: 1 }} />

          <button className="btn btn-ghost no-print" onClick={handleClear}>
            Clear
          </button>
          <button className="btn no-print" onClick={() => printPatientFile(data, toothChartImg)}>
            Print
          </button>
        </div>

        <div className="page-content">
          {message && (
            <div className={`notice ${message.type === "danger" ? "danger" : ""}`}>{message.text}</div>
          )}

          <div className="tab-bar">
            {TABS.map((item) => (
              <button
                key={item.id}
                className={`tab-item${tab === item.id ? " active" : ""}`}
                onClick={() => goToTab(item.id)}
              >
                {item.label}
                {done[item.id] && <span className="tab-done">Done</span>}
              </button>
            ))}
          </div>

          <div className="card fade-in">
            {tab === "biography" && <Biography patientData={data} setPatientData={setData} />}
            {tab === "checkup" && <Checkup patientData={data} setPatientData={setData} />}
            {tab === "plannedSequence" && <PlannedSequence patientData={data} setPatientData={setData} />}
            {tab === "invoice" && <Invoice patientData={data} setPatientData={setData} />}
          </div>

          <div className="form-pager no-print">
            <button
              className="btn"
              disabled={tabIndex === 0}
              onClick={() => goToTab(TABS[tabIndex - 1].id)}
            >
              Previous
            </button>
            <button
              className="btn btn-primary"
              disabled={tabIndex === TABS.length - 1}
              onClick={() => goToTab(TABS[tabIndex + 1].id)}
            >
              Next
            </button>
          </div>
        </div>

        <div className="bottom-bar no-print">
          <div className="progress-tabs">
            {TABS.map((item) => (
              <button
                key={item.id}
                className={`progress-pip${tab === item.id ? " active" : done[item.id] ? " done" : ""}`}
                onClick={() => goToTab(item.id)}
                title={item.label}
                type="button"
              />
            ))}
            <span style={{ fontSize: "11px", color: "var(--muted)", whiteSpace: "nowrap", marginLeft: "4px" }}>
              {tabIndex + 1} / {TABS.length}
            </span>
          </div>

          {data.isEditing ? (
            <button className="btn btn-success btn-lg" onClick={handleUpdate} disabled={loading}>
              {loading ? <><div className="spinner" /> Updating...</> : "Update Patient"}
            </button>
          ) : (
            <button className="btn btn-navy btn-lg" onClick={handleSave} disabled={loading}>
              {loading ? <><div className="spinner" /> Saving...</> : "Save Patient"}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
