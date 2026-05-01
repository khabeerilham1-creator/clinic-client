import React, { useEffect, useState } from "react";
import api from "../api";

function LVI() {

  // STATES
  const [cases, setCases] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [caseForm, setCaseForm] = useState({
    patient_name: "",
    lab: "",
    deadline: ""
  });

  const [ledgerForm, setLedgerForm] = useState({
    lab: "",
    amount: "",
    status: ""
  });

  const [vendorForm, setVendorForm] = useState({
    name: "",
    service: ""
  });

  // =========================
  // LOAD DATA
  // =========================
  const load = async () => {
    setCases((await api.get("/lvi/case")).data || []);
    setLedger((await api.get("/lvi/ledger")).data || []);
    setVendors((await api.get("/lvi/vendor")).data || []);
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // SAVE FUNCTIONS
  // =========================
  const saveCase = async () => {
    await api.post("/lvi/case", caseForm);
    load();
  };

  const saveLedger = async () => {
    await api.post("/lvi/ledger", ledgerForm);
    load();
  };

  const saveVendor = async () => {
    await api.post("/lvi/vendor", vendorForm);
    load();
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>LVI — Lab Intelligence System 🧪</h1>

      {/* ========================= */}
      {/* 1. LAB CASE TRACKING */}
      {/* ========================= */}
      <h2>Lab Case Tracking</h2>

      <input placeholder="Patient" onChange={e => setCaseForm({...caseForm, patient_name:e.target.value})}/>
      <input placeholder="Lab" onChange={e => setCaseForm({...caseForm, lab:e.target.value})}/>
      <input type="date" onChange={e => setCaseForm({...caseForm, deadline:e.target.value})}/>

      <button onClick={saveCase}>Save Case</button>

      {cases.map(c => (
        <div key={c._id}>
          {c.patient_name} → {c.lab} → {c.deadline}
        </div>
      ))}

      <hr />

      {/* ========================= */}
      {/* 2. FINANCIAL LEDGER */}
      {/* ========================= */}
      <h2>Financial Ledger</h2>

      <input placeholder="Lab" onChange={e => setLedgerForm({...ledgerForm, lab:e.target.value})}/>
      <input placeholder="Amount" onChange={e => setLedgerForm({...ledgerForm, amount:e.target.value})}/>
      <input placeholder="Status (paid/pending)" onChange={e => setLedgerForm({...ledgerForm, status:e.target.value})}/>

      <button onClick={saveLedger}>Add Entry</button>

      {ledger.map(l => (
        <div key={l._id}>
          {l.lab} → {l.amount} → {l.status}
        </div>
      ))}

      <hr />

      {/* ========================= */}
      {/* 3. VENDOR MANAGEMENT */}
      {/* ========================= */}
      <h2>Vendor Management</h2>

      <input placeholder="Vendor Name" onChange={e => setVendorForm({...vendorForm, name:e.target.value})}/>
      <input placeholder="Service" onChange={e => setVendorForm({...vendorForm, service:e.target.value})}/>

      <button onClick={saveVendor}>Add Vendor</button>

      {vendors.map(v => (
        <div key={v._id}>
          {v.name} → {v.service}
        </div>
      ))}

    </div>
  );
}

export default LVI;