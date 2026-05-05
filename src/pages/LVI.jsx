import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout"; // ✅ ADDED

function LVI() {

  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [editCaseId, setEditCaseId] = useState(null);
  const [editLedgerId, setEditLedgerId] = useState(null);
  const [editVendorId, setEditVendorId] = useState(null);

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

  const load = async () => {
    setCases((await api.get("/lvi/case")).data || []);
    setLedger((await api.get("/lvi/ledger")).data || []);
    setVendors((await api.get("/lvi/vendor")).data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const saveCase = async () => {
    if (editCaseId) {
      await api.put("/lvi/case/" + editCaseId, caseForm);
      setEditCaseId(null);
    } else {
      await api.post("/lvi/case", caseForm);
    }
    setCaseForm({ patient_name:"", lab:"", deadline:"" });
    load();
  };

  const saveLedger = async () => {
    if (editLedgerId) {
      await api.put("/lvi/ledger/" + editLedgerId, ledgerForm);
      setEditLedgerId(null);
    } else {
      await api.post("/lvi/ledger", ledgerForm);
    }
    setLedgerForm({ lab:"", amount:"", status:"" });
    load();
  };

  const saveVendor = async () => {
    if (editVendorId) {
      await api.put("/lvi/vendor/" + editVendorId, vendorForm);
      setEditVendorId(null);
    } else {
      await api.post("/lvi/vendor", vendorForm);
    }
    setVendorForm({ name:"", service:"" });
    load();
  };

  const deleteCase = async (id) => {
    if (!window.confirm("Delete case?")) return;
    await api.delete("/lvi/case/" + id);
    load();
  };

  const deleteLedger = async (id) => {
    if (!window.confirm("Delete entry?")) return;
    await api.delete("/lvi/ledger/" + id);
    load();
  };

  const deleteVendor = async (id) => {
    if (!window.confirm("Delete vendor?")) return;
    await api.delete("/lvi/vendor/" + id);
    load();
  };

  const editCase = (c) => {
    setCaseForm(c);
    setEditCaseId(c._id);
  };

  const editLedger = (l) => {
    setLedgerForm(l);
    setEditLedgerId(l._id);
  };

  const editVendor = (v) => {
    setVendorForm(v);
    setEditVendorId(v._id);
  };

  return (
    <Layout>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
        <h1>LVI — Lab Intelligence System 🧪</h1>
      </div>

      {/* ========================= CASES ========================= */}
      <Section title="Lab Case Tracking">

        <div style={grid}>
          <input placeholder="Patient"
            value={caseForm.patient_name}
            onChange={e => setCaseForm({...caseForm, patient_name:e.target.value})}
          />

          <input placeholder="Lab"
            value={caseForm.lab}
            onChange={e => setCaseForm({...caseForm, lab:e.target.value})}
          />

          <input type="date"
            value={caseForm.deadline}
            onChange={e => setCaseForm({...caseForm, deadline:e.target.value})}
          />
        </div>

        <button onClick={saveCase} style={btn}>
          {editCaseId ? "Update Case" : "Save Case"}
        </button>

        {cases.map(c => (
          <Row key={c._id}>
            {c.patient_name} → {c.lab} → {c.deadline}
            <Actions edit={()=>editCase(c)} del={()=>deleteCase(c._id)} />
          </Row>
        ))}

      </Section>

      {/* ========================= LEDGER ========================= */}
      <Section title="Financial Ledger">

        <div style={grid}>
          <input placeholder="Lab"
            value={ledgerForm.lab}
            onChange={e => setLedgerForm({...ledgerForm, lab:e.target.value})}
          />

          <input placeholder="Amount"
            value={ledgerForm.amount}
            onChange={e => setLedgerForm({...ledgerForm, amount:e.target.value})}
          />

          <input placeholder="Status (paid/pending)"
            value={ledgerForm.status}
            onChange={e => setLedgerForm({...ledgerForm, status:e.target.value})}
          />
        </div>

        <button onClick={saveLedger} style={btn}>
          {editLedgerId ? "Update Entry" : "Add Entry"}
        </button>

        {ledger.map(l => (
          <Row key={l._id}>
            {l.lab} → Rs {l.amount} → {l.status}
            <Actions edit={()=>editLedger(l)} del={()=>deleteLedger(l._id)} />
          </Row>
        ))}

      </Section>

      {/* ========================= VENDORS ========================= */}
      <Section title="Vendor Management">

        <div style={grid}>
          <input placeholder="Vendor Name"
            value={vendorForm.name}
            onChange={e => setVendorForm({...vendorForm, name:e.target.value})}
          />

          <input placeholder="Service"
            value={vendorForm.service}
            onChange={e => setVendorForm({...vendorForm, service:e.target.value})}
          />
        </div>

        <button onClick={saveVendor} style={btn}>
          {editVendorId ? "Update Vendor" : "Add Vendor"}
        </button>

        {vendors.map(v => (
          <Row key={v._id}>
            {v.name} → {v.service}
            <Actions edit={()=>editVendor(v)} del={()=>deleteVendor(v._id)} />
          </Row>
        ))}

      </Section>

    </Layout>
  );
}

/* ========================= UI COMPONENTS ========================= */

function Section({ title, children }) {
  return (
    <div style={card}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Row({ children }) {
  return (
    <div style={row}>
      {children}
    </div>
  );
}

function Actions({ edit, del }) {
  return (
    <span style={{ marginLeft: 10 }}>
      <button onClick={edit}>Edit</button>
      <button onClick={del} style={{ marginLeft: 5 }}>Delete</button>
    </span>
  );
}

/* ========================= STYLES ========================= */

const card = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
  gap: 10,
  marginBottom: 10
};

const row = {
  padding: 10,
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between"
};

const btn = {
  marginBottom: 10,
  padding: "8px 12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6
};

export default LVI;