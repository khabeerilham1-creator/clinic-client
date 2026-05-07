import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function PatientFiles() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const res = await api.get("/patients/");
    setPatients(res.data);
  };

  const loadFile = async (id) => {
    try {
      const res = await api.get(`/patient-files/${id}`);
      setFile({
  patient: res.data.patient || {},
  checkups: res.data.checkups || [],
  visits: res.data.visits || [],
  invoices: res.data.invoices || [],
  timeline: res.data.timeline || []
});
    } catch {
      setFile(null);
    }
  };

  return (
    <Layout>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
        <h1>Patient Files 📁</h1>
      </div>

      {/* SELECT */}
      <div style={card}>
        <h3>Select Patient</h3>

        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            loadFile(e.target.value);
          }}
          style={input}
        >
          <option value="">-- Select Patient --</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.phone})
            </option>
          ))}
        </select>
      </div>

      {!file && (
        <div style={empty}>
          <p>No data available</p>
        </div>
      )}

      {file && (
        <>

          {/* PATIENT INFO */}
          <Section title="Patient Info">
            <p><b>Name:</b> {file.patient?.name}</p>
            <p><b>Phone:</b> {file.patient?.phone}</p>
          </Section>

          {/* CHECKUPS */}
          <Section title="Checkups 🦷">
            {file.checkups?.length === 0 ? (
              <p>No checkups</p>
            ) : (
              file.checkups.map((c) => (
                <div key={c._id} style={row}>
                  <b>Complaint:</b> {c.complaint}
                  {c.tasks?.map((t, i) => (
                    <div key={i}>
                      Tooth {t.tooth} → {t.treatment}
                    </div>
                  ))}
                </div>
              ))
            )}
          </Section>

          {/* VISITS */}
          <Section title="Visits 🩺">
            {file.visits?.length === 0 ? (
              <p>No visits</p>
            ) : (
              file.visits.map((v) => (
                <div key={v._id} style={row}>
                  {v.diagnosis} → {v.treatment}
                </div>
              ))
            )}
          </Section>

          {/* INVOICES */}
          <Section title="Invoices 🧾">
            {file.invoices?.length === 0 ? (
              <p>No invoices</p>
            ) : (
              file.invoices.map((inv, i) => (
                <div key={i} style={invoiceCard}>
                  <p><b>Procedure:</b> {inv.procedure}</p>
                  <p><b>Amount:</b> Rs {inv.amount}</p>
                  <p><b>Paid:</b> Rs {inv.paid}</p>
                  <p><b>Balance:</b> Rs {inv.balance}</p>

                  <button
                    style={btn}
                    onClick={() =>
                      window.open(
                        `${api.defaults.baseURL}/invoice/pdf/${encodeURIComponent(file.patient?.name)}`
                      )
                    }
                  >
                    View PDF
                  </button>
                </div>
              ))
            )}
          </Section>

          {/* REPORTS */}
          <Section title="Clinical Reports 📊">
            <button
              style={btn}
              onClick={() => {
                const id = file.patient?._id || selected;
                window.open(`${api.defaults.baseURL}/reports/${id}`);
              }}
            >
              View Report
            </button>

            <button
              style={{ ...btn, marginLeft: 10 }}
              onClick={() => {
                const id = file.patient?._id || selected;
                window.open(`${api.defaults.baseURL}/reports/pdf/${id}`);
              }}
            >
              Download Full PDF
            </button>
          </Section>

        </>
      )}

    </Layout>
  );
}

export default PatientFiles;

/* ========================= COMPONENTS ========================= */

function Section({ title, children }) {
  return (
    <div style={card}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
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

const input = {
  padding: 10,
  width: "100%",
  borderRadius: 6,
  border: "1px solid #ccc"
};

const row = {
  borderBottom: "1px solid #eee",
  padding: "10px 0"
};

const invoiceCard = {
  border: "1px solid #eee",
  padding: 10,
  borderRadius: 8,
  marginBottom: 10
};

const btn = {
  padding: "6px 12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const empty = {
  background: "white",
  padding: 30,
  textAlign: "center",
  borderRadius: 12
};