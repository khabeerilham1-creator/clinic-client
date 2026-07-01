import React, { useEffect, useRef, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import Biography from "../components/patient/Biography";
import Checkup from "../components/patient/Checkup";
import PlannedSequence from "../components/patient/PlannedSequence";
import Invoice from "../components/patient/Invoice";
import AccountLedger from "../components/patient/AccountLedger";
import toothChartImg from "../assets/tooth-chart.png";
import {
  activeShift,
  applyShiftToPatient,
  balanceDue,
  discountAmount,
  invoiceTotal,
  netAmount,
  paymentsTotal,
  todayDisplayValue,
} from "../utils/patientHelpers";
import { printPatientFile } from "../utils/printPatientFile";
import { addActivityLog } from "../utils/activityLog";
import { playSectionSound } from "../utils/sound";

const EMPTY_PATIENT = {
  biography: {},
  checkup: {},
  plannedSequence: [],
  invoices: [],
  invoice: [],
  discount: 0,
  discountPercent: 0,
  accountLedger: [],
  doctorShare: [],
  labExpenses: [],
  labRecords: [],
  dentalMaterials: [],
  toothStates: {},
  toothNotes: "",
};

const todayInputValue = () => todayDisplayValue();

const TABS = [
  { id: "biography", label: "Bio-data" },
  { id: "checkup", label: "Clinical Exam" },
  { id: "plannedSequence", label: "Planned" },
  { id: "invoice", label: "Invoice" },
  { id: "account", label: "Account Status" },
];

export default function Patients({ activePage, setActivePage, handleLogout }) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const shift = activeShift();
  const [data, setData] = useState(EMPTY_PATIENT);
  const [tab, setTab] = useState("biography");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [initialPayment, setInitialPayment] = useState({
    date: todayInputValue(),
    amount: "",
    description: "",
  });
  const messageTimer = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("editPatient");

    if (stored) {
      try {
        setData(applyShiftToPatient(JSON.parse(stored)));
      } catch (error) {
        console.error(error);
      }
    } else {
      setData(applyShiftToPatient(EMPTY_PATIENT));
    }
  }, []);

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => setMessage(null), 4200);
    playSectionSound(type === "danger" ? "warning" : "success");
  };

  const totalInvoiceAmount = invoiceTotal(data);
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
    invoice:
      (data.invoice || []).some((item) => item.details || Number(item.cost || 0) > 0) ||
      (data.invoices || []).some((invoice) =>
        (invoice.items || []).some((item) => item.details || Number(item.cost || 0) > 0)
      ),
    account: (data.accountLedger || []).length > 0 || paymentsTotal(data) > 0 || balanceDue(data) > 0,
  };

  const pendingPaymentEntry = () => {
    const paidNow = Number(initialPayment.amount || 0);

    if (paidNow <= 0) {
      return null;
    }

    return {
      date: initialPayment.date || todayInputValue(),
      amount: paidNow,
      description: initialPayment.description || "",
      type: "payment",
    };
  };

  const dataWithLivePayment = () => {
    const entry = pendingPaymentEntry();

    if (!entry) {
      return data;
    }

    return {
      ...data,
      accountLedger: [...(data.accountLedger || []), entry],
    };
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
      const shiftedData = applyShiftToPatient(data);
      const paymentEntry = pendingPaymentEntry();
      const payload = paymentEntry
        ? {
            ...shiftedData,
            accountLedger: [...(shiftedData.accountLedger || []), paymentEntry],
          }
        : shiftedData;
      const response = await api.post("/patients", payload);
      setData((current) => ({
        ...payload,
        biography: {
          ...payload.biography,
          regNo: response.data.reg_no,
        },
      }));
      setInitialPayment({
        date: todayInputValue(),
        amount: "",
        description: "",
      });
      await addActivityLog("Created patient", payload.biography?.patientName || "Patient", {
        regNo: response.data.reg_no,
      });
      notify(`Patient saved. Reg No: ${response.data.reg_no}`);
    } catch (error) {
      const detail = error?.response?.data?.detail;
      notify(
        (typeof detail === "string" && detail) ||
          error?.message ||
          "Error saving patient. Try again.",
        "danger"
      );
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
      const payload = applyShiftToPatient(data);
      await api.put(`/patients/${data._id}`, payload);
      setData(payload);
      localStorage.removeItem("editPatient");
      await addActivityLog("Updated patient", payload.biography?.patientName || "Patient", {
        regNo: payload.biography?.regNo,
      });
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
    setData(applyShiftToPatient(EMPTY_PATIENT));
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
            {shift?.label && (
              <span className="topbar-shift">
                {shift.label}
              </span>
            )}
          </div>

          {totalInvoiceAmount > 0 && (
            <div className="mini-summary">
              <span>Total</span>
              <strong>{totalInvoiceAmount.toLocaleString("en-PK")}</strong>
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
          <button className="btn no-print" onClick={() => printPatientFile(dataWithLivePayment(), toothChartImg, "checkup")}>
            Checkup Sheet Print
          </button>
          <button className="btn no-print" onClick={() => printPatientFile(dataWithLivePayment(), toothChartImg, "invoice")}>
            Invoice Print
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
            {tab === "invoice" && (
              <Invoice
                patientData={data}
                setPatientData={setData}
                initialPayment={initialPayment}
                setInitialPayment={setInitialPayment}
              />
            )}
            {tab === "account" && <AccountLedger patientData={data} setPatientData={setData} />}
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
