import React, { useEffect, useRef, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import Biography from "../components/patient/Biography";
import Checkup from "../components/patient/Checkup";
import PlannedSequence from "../components/patient/PlannedSequence";
import Invoice from "../components/patient/Invoice";
import AccountLedger from "../components/patient/AccountLedger";
import {
  AcknowledgementSheet,
  FullDentureSheet,
  ImplantCommencementSheet,
  OrthodonticAdjustmentsSheet,
  OrthodonticAssessmentSheet,
} from "../components/patient/SpecialtySheets";
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
  entrySheetType: "routine",
  biography: {},
  checkup: {},
  plannedSequence: [],
  implantCommencement: {},
  orthodonticAssessment: {},
  orthodonticAdjustments: [],
  fullDenture: {},
  acknowledgement: {},
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
  { id: "acknowledgement", label: "Acknowledgement" },
  { id: "account", label: "Account Status" },
];

const SHEETS = [
  { id: "routine", label: "Comprehensive Checkup" },
  { id: "singleTooth", label: "Single Tooth Client" },
  { id: "implant", label: "Dental Implant" },
  { id: "orthodontic", label: "Orthodontic" },
  { id: "geriatric", label: "Geriatrics" },
  { id: "peads", label: "Peads" },
  { id: "fullDenture", label: "Full Denture Sheet" },
  { id: "smileMakeovers", label: "Smile Make Overs" },
  { id: "cosmatics", label: "Cosmatics" },
  { id: "surgical", label: "Surgical" },
];

const SHEET_TABS = {
  routine: TABS,
  singleTooth: TABS,
  geriatric: TABS,
  peads: TABS,
  implant: [
    { id: "implantSheet", label: "Commencement" },
    { id: "plannedSequence", label: "Planned" },
    { id: "invoice", label: "Invoice" },
    { id: "acknowledgement", label: "Acknowledgement" },
    { id: "account", label: "Account Status" },
  ],
  orthodontic: [
    { id: "orthodonticAssessment", label: "Assessment" },
    { id: "orthodonticAdjustments", label: "Monthly Adjustment" },
    { id: "plannedSequence", label: "Planned" },
    { id: "invoice", label: "Invoice" },
    { id: "acknowledgement", label: "Acknowledgement" },
    { id: "account", label: "Account Status" },
  ],
  fullDenture: [
    { id: "fullDentureSheet", label: "Denture Sheet" },
    { id: "invoice", label: "Invoice" },
    { id: "acknowledgement", label: "Acknowledgement" },
    { id: "account", label: "Account Status" },
  ],
  smileMakeovers: [{ id: "formatPending", label: "Format Pending" }],
  cosmatics: [{ id: "formatPending", label: "Format Pending" }],
  surgical: [{ id: "formatPending", label: "Format Pending" }],
};

const defaultTabForSheet = (sheetType) => (SHEET_TABS[sheetType] || TABS)[0].id;
const normalizeSheetType = (sheetType) =>
  SHEETS.some((sheet) => sheet.id === sheetType) ? sheetType : "routine";

export default function Patients({ activePage, setActivePage, handleLogout }) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const shift = activeShift();
  const [data, setData] = useState(EMPTY_PATIENT);
  const [sheetType, setSheetType] = useState("routine");
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
        const nextData = applyUserToClient(applyShiftToPatient(JSON.parse(stored)));
        const nextSheetType = normalizeSheetType(nextData.entrySheetType || nextData.sheetType);

        setSheetType(nextSheetType);
        setTab(defaultTabForSheet(nextSheetType));
        setData({ ...nextData, entrySheetType: nextSheetType });
      } catch (error) {
        console.error(error);
      }
    } else {
      const nextData = applyUserToClient(applyShiftToPatient(EMPTY_PATIENT));

      setSheetType("routine");
      setTab(defaultTabForSheet("routine"));
      setData(nextData);
    }
  }, []);

  const applyUserToClient = (client) => {
    if (!["dentist", "doctor"].includes(user.role) || !user.dentistName) {
      return client;
    }

    return {
      ...client,
      dentistId: user.dentistId || client.dentistId || "",
      dentistName: user.dentistName,
      doctorName: user.dentistName,
      biography: {
        ...(client.biography || {}),
        doctorName: user.dentistName,
        dentistId: user.dentistId || (client.biography || {}).dentistId || "",
        dentistName: user.dentistName,
      },
    };
  };

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => setMessage(null), 4200);
    playSectionSound(type === "danger" ? "warning" : "success");
  };

  const totalInvoiceAmount = invoiceTotal(data);
  const invDiscount = discountAmount(data);
  const invoiceNet = netAmount(data);
  const activeTabs = SHEET_TABS[sheetType] || TABS;
  const tabIndex = Math.max(activeTabs.findIndex((item) => item.id === tab), 0);

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
    acknowledgement:
      Boolean(data.biography?.patientName) ||
      Object.values(data.acknowledgement || {}).some(Boolean),
    implantSheet: Boolean(data.biography?.patientName),
    orthodonticAssessment:
      Boolean(data.biography?.patientName) ||
      Object.values(data.orthodonticAssessment || {}).some((value) =>
        Array.isArray(value) ? value.some(Boolean) : Boolean(value)
      ),
    orthodonticAdjustments: (data.orthodonticAdjustments || []).some(
      (visit) => visit.visit || visit.date || visit.procedure
    ),
    fullDentureSheet:
      Boolean(data.biography?.patientName) ||
      Object.values(data.fullDenture || {}).some((value) =>
        Array.isArray(value) ? value.some((item) => Object.values(item || {}).some(Boolean)) : Boolean(value)
      ),
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
      return { ...data, entrySheetType: sheetType };
    }

    return {
      ...data,
      entrySheetType: sheetType,
      accountLedger: [...(data.accountLedger || []), entry],
    };
  };

  const handleSave = async () => {
    if (loading) {
      return;
    }

    if (!data.biography?.patientName?.trim()) {
      notify("Client name is required before saving.", "danger");
      return;
    }

    if (data.isEditing) {
      notify("Currently in editing mode. Use Update button.", "danger");
      return;
    }

    setLoading(true);

    try {
      const shiftedData = applyUserToClient(applyShiftToPatient({ ...data, entrySheetType: sheetType }));
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
      await addActivityLog("Created client", payload.biography?.patientName || "Client", {
        regNo: response.data.reg_no,
      });
      notify(`Client saved. Reg No: ${response.data.reg_no}`);
    } catch (error) {
      const detail = error?.response?.data?.detail;
      notify(
        (typeof detail === "string" && detail) ||
          error?.message ||
          "Error saving client. Try again.",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (loading) {
      return;
    }

    if (!data._id) {
      notify("No patient ID for update.", "danger");
      return;
    }

    setLoading(true);

    try {
      const payload = applyUserToClient(applyShiftToPatient({ ...data, entrySheetType: sheetType }));
      await api.put(`/patients/${data._id}`, payload);
      setData(payload);
      localStorage.removeItem("editPatient");
      await addActivityLog("Updated client", payload.biography?.patientName || "Client", {
        regNo: payload.biography?.regNo,
      });
      notify("Client updated successfully.");
    } catch (error) {
      notify(error?.response?.data?.detail || "Update failed.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (!window.confirm("Clear all fields and start a new client?")) {
      return;
    }

    localStorage.removeItem("editPatient");
    setSheetType("routine");
    setData(applyUserToClient(applyShiftToPatient(EMPTY_PATIENT)));
    setTab(defaultTabForSheet("routine"));
    notify("Form cleared. Ready for new patient.");
  };

  const goToTab = (tabId) => {
    playSectionSound("section");
    setTab(tabId);
  };

  const goToSheet = (nextSheetType) => {
    const normalized = normalizeSheetType(nextSheetType);

    playSectionSound("section");
    setSheetType(normalized);
    setTab(defaultTabForSheet(normalized));
    setData((current) => ({
      ...current,
      entrySheetType: normalized,
    }));
  };

  const printModeForCurrentTab = () => {
    if (tab === "invoice") {
      return "invoice";
    }

    if (tab === "account") {
      return "account";
    }

    if (tab === "acknowledgement") {
      return "acknowledgement";
    }

    if (sheetType === "implant") {
      return "implant";
    }

    if (sheetType === "orthodontic") {
      return tab === "orthodonticAdjustments" ? "orthodonticAdjustments" : "orthodontic";
    }

    if (sheetType === "fullDenture") {
      return "fullDenture";
    }

    return tab === "plannedSequence" ? "checkup" : tab;
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
          <button type="button" className="btn btn-ghost btn-icon no-print" onClick={() => setActivePage("dashboard")}>
            Back
          </button>

          <div>
            <div className="topbar-title">{data.isEditing ? "Edit Client" : "New Checkup"}</div>
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

          <button type="button" className="btn btn-ghost no-print" onClick={handleClear}>
            Clear
          </button>
          <button type="button" className="btn no-print" onClick={() => printPatientFile(dataWithLivePayment(), toothChartImg, printModeForCurrentTab())}>
            Print Section
          </button>
          <button type="button" className="btn no-print" onClick={() => printPatientFile(dataWithLivePayment(), toothChartImg, "invoice")}>
            Invoice Print
          </button>
        </div>

        <div className="page-content">
          {message && (
            <div className={`notice ${message.type === "danger" ? "danger" : ""}`}>{message.text}</div>
          )}

          <div className="sheet-bar no-print" aria-label="Client entry sheet type">
            {SHEETS.map((sheet) => (
              <button
                key={sheet.id}
                type="button"
                className={`sheet-bar-item${sheetType === sheet.id ? " active" : ""}`}
                onClick={() => goToSheet(sheet.id)}
              >
                {sheet.label}
              </button>
            ))}
          </div>

          <div className="tab-bar">
            {activeTabs.map((item) => (
              <button
                key={item.id}
                type="button"
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
            {tab === "implantSheet" && (
              <ImplantCommencementSheet patientData={data} setPatientData={setData} />
            )}
            {tab === "orthodonticAssessment" && (
              <OrthodonticAssessmentSheet patientData={data} setPatientData={setData} />
            )}
            {tab === "orthodonticAdjustments" && (
              <OrthodonticAdjustmentsSheet patientData={data} setPatientData={setData} />
            )}
            {tab === "fullDentureSheet" && <FullDentureSheet patientData={data} setPatientData={setData} />}
            {tab === "formatPending" && (
              <div className="empty-state">Format pending.</div>
            )}
            {tab === "acknowledgement" && <AcknowledgementSheet patientData={data} setPatientData={setData} />}
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
              type="button"
              className="btn"
              disabled={tabIndex === 0}
              onClick={() => goToTab(activeTabs[tabIndex - 1].id)}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={tabIndex === activeTabs.length - 1}
              onClick={() => goToTab(activeTabs[tabIndex + 1].id)}
            >
              Next
            </button>
          </div>

        </div>

        <div className="bottom-bar no-print">
          <div className="progress-tabs">
            {activeTabs.map((item) => (
              <button
                key={item.id}
                className={`progress-pip${tab === item.id ? " active" : done[item.id] ? " done" : ""}`}
                onClick={() => goToTab(item.id)}
                title={item.label}
                type="button"
              />
            ))}
            <span style={{ fontSize: "11px", color: "var(--muted)", whiteSpace: "nowrap", marginLeft: "4px" }}>
              {tabIndex + 1} / {activeTabs.length}
            </span>
          </div>

          {data.isEditing ? (
            <button type="button" className="btn btn-success btn-lg" onClick={handleUpdate} disabled={loading}>
              {loading ? <><div className="spinner" /> Updating...</> : "Update Client"}
            </button>
          ) : (
            <button type="button" className="btn btn-navy btn-lg" onClick={handleSave} disabled={loading}>
              {loading ? <><div className="spinner" /> Saving...</> : "Save Checkup"}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
