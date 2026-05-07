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

    try {

      const res = await api.get("/patients/");

      setPatients(res.data || []);

    } catch (err) {

      console.log(err);

    }
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

  // =========================
  // COLOUR
  // =========================
  let primary = "#16a34a";
  let light = "#dcfce7";

  if (file?.patient?.colour_code === "yellow") {
    primary = "#ca8a04";
    light = "#fef9c3";
  }

  if (file?.patient?.colour_code === "orange") {
    primary = "#ea580c";
    light = "#fed7aa";
  }

  if (file?.patient?.colour_code === "red") {
    primary = "#dc2626";
    light = "#fecaca";
  }

  return (

    <Layout>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>

        <h1 style={{
          fontSize: 30,
          margin: 0
        }}>
          Patient Files 📁
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          style={btn}
        >
          ⬅ Dashboard
        </button>

      </div>

      {/* SELECT */}
      <div style={{
        ...card,
        borderTop: `5px solid ${primary}`
      }}>

        <h3>Select Patient</h3>

        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            loadFile(e.target.value);
          }}
          style={input}
        >

          <option value="">
            -- Select Patient --
          </option>

          {patients.map((p) => (

            <option
              key={p._id}
              value={p._id}
            >
              {p.name}
            </option>

          ))}

        </select>

      </div>

      {!file && (

        <div style={empty}>
          No Patient Selected
        </div>

      )}

      {file && (

        <div style={{
          maxWidth: "100%",
          margin: "auto"
        }}>

          {/* TOP INFO */}
          <div style={{
            ...card,
            borderTop: `6px solid ${primary}`
          }}>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 15
            }}>

              <div>

                <h2 style={{
                  margin: 0
                }}>
                  {file.patient?.title} {file.patient?.name}
                </h2>

                <p style={{
                  margin: "5px 0",
                  color: "#64748b"
                }}>
                  Reg No: {file.patient?.reg_no}
                </p>

              </div>

              <div style={{
                background: primary,
                color: "white",
                padding: "8px 18px",
                borderRadius: 30,
                fontWeight: "bold"
              }}>
                {(file.patient?.colour_code || "green").toUpperCase()}
              </div>

            </div>

            {/* GRID */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 12,
              marginTop: 20
            }}>

              <Info
                label="Mobile"
                value={file.patient?.mobile_number}
              />

              <Info
                label="Age"
                value={file.patient?.age}
              />

              <Info
                label="Address"
                value={file.patient?.address}
              />

              <Info
                label="Occupation"
                value={file.patient?.occupation}
              />

              <Info
                label="Category"
                value={file.patient?.category}
              />

              <Info
                label="Purpose"
                value={file.patient?.purpose_of_visit}
              />

            </div>

          </div>

          {/* MAIN GRID */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginTop: 20
          }}>

            {/* CHECKUPS */}
            <Section
              title="Checkups 🦷"
              primary={primary}
              light={light}
            >

              {file.checkups?.length === 0 ? (

                <p>No checkups</p>

              ) : (

                file.checkups.map((c) => (

                  <div
                    key={c._id}
                    style={item}
                  >

                    <b>Complaint:</b> {c.complaint}

                    {(c.tasks || []).map((t, i) => (

                      <div
                        key={i}
                        style={{ marginTop: 6 }}
                      >
                        Tooth {t.tooth} → {t.treatment}
                      </div>

                    ))}

                  </div>

                ))

              )}

            </Section>

            {/* VISITS */}
            <Section
              title="Visits 🩺"
              primary={primary}
              light={light}
            >

              {file.visits?.length === 0 ? (

                <p>No visits</p>

              ) : (

                file.visits.map((v) => (

                  <div
                    key={v._id}
                    style={item}
                  >

                    <b>{v.diagnosis}</b>

                    <div>
                      {v.treatment}
                    </div>

                  </div>

                ))

              )}

            </Section>

            {/* INVOICES */}
            <Section
              title="Invoices 🧾"
              primary={primary}
              light={light}
            >

              {file.invoices?.length === 0 ? (

                <p>No invoices</p>

              ) : (

                file.invoices.map((inv, i) => (

                  <div
                    key={i}
                    style={item}
                  >

                    <div>
                      Amount: Rs {inv.amount}
                    </div>

                    <div>
                      Paid: Rs {inv.paid}
                    </div>

                    <div>
                      Balance: Rs {inv.balance}
                    </div>

                  </div>

                ))

              )}

            </Section>

            {/* REPORTS */}
            <Section
              title="Reports 📄"
              primary={primary}
              light={light}
            >

              <button
                style={{
                  ...btn,
                  background: primary
                }}
                onClick={() => {
                  const id = file.patient?._id || selected;
                  navigate("/reports/" + id);
                }}
              >
                View History
              </button>

              <button
                style={{
                  ...btn,
                  marginLeft: 10,
                  background: primary
                }}
                onClick={() => {
                  const id = file.patient?._id || selected;
                  window.open(
                    `${api.defaults.baseURL}/reports/pdf/${id}`
                  );
                }}
              >
                Download PDF
              </button>

            </Section>

          </div>

        </div>

      )}

    </Layout>
  );
}

export default PatientFiles;

/* ========================= */

function Section({
  title,
  children,
  primary,
  light
}) {

  return (

    <div style={{
      background: "white",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    }}>

      <div style={{
        background: light,
        color: primary,
        padding: 14,
        fontWeight: "bold",
        fontSize: 16
      }}>
        {title}
      </div>

      <div style={{
        padding: 16
      }}>
        {children}
      </div>

    </div>
  );
}

function Info({ label, value }) {

  return (

    <div style={{
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      padding: 10
    }}>

      <div style={{
        fontSize: 12,
        color: "#64748b",
        marginBottom: 5
      }}>
        {label}
      </div>

      <div style={{
        fontWeight: "600"
      }}>
        {value || "N/A"}
      </div>

    </div>
  );
}

/* ========================= */

const card = {
  background: "white",
  padding: 12,
  borderRadius: 14,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  marginTop: 10
};

const item = {
  borderBottom: "1px solid #eee",
  padding: "10px 0"
};

const btn = {
  padding: "10px 18px",
  border: "none",
  borderRadius: 8,
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  background: "#16a34a"
};

const empty = {
  background: "white",
  padding: 40,
  borderRadius: 14,
  textAlign: "center",
  fontSize: 18
};