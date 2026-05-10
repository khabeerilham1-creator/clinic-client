import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function PatientFiles() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState("");
  const [file, setFile] = useState(null);

  const [month, setMonth] = useState("");

  // =========================
  // LOAD PATIENTS
  // =========================
  const loadPatients = async () => {

    try {

      const res = await api.get("/patients/");

      setPatients(res.data || []);

    } catch (err) {

      console.log(err);

    }
  };

  useEffect(() => {

    loadPatients();

  }, []);

  // =========================
  // LOAD FILE
  // =========================
  const loadFile = async (id) => {

    try {

      const res = await api.get(
        `/patient-files/${id}`
      );

      setFile({
        patient: res.data.patient || {},
        checkups: res.data.checkups || [],
        visits: res.data.visits || [],
        invoices: res.data.invoices || [],
        timeline: res.data.timeline || []
      });

    } catch (err) {

      console.log(err);

      setFile(null);

    }
  };

  // =========================
  // MONTH FILTER
  // =========================
  const filteredPatients = patients.filter((p) => {

    if (!month) return true;

    if (!p.date) return false;

    return p.date.startsWith(month);

  });

  // =========================
  // COLOR SYSTEM
  // =========================
  const getPatientColor = (type) => {

    if (
      type === "friends" ||
      type === "green"
    ) return "#16a34a";

    if (
      type === "relatives" ||
      type === "blue"
    ) return "#2563eb";

    if (
      type === "neighbours" ||
      type === "yellow"
    ) return "#ca8a04";

    if (
      type === "non_affording" ||
      type === "orange"
    ) return "#ea580c";

    if (
      type === "compassionate" ||
      type === "red"
    ) return "#dc2626";

    return "#16a34a";
  };

  const primary = getPatientColor(
    file?.patient?.colour_code
  );

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
          fontSize: 32,
          margin: 0
        }}>
          Patient Files 📁
        </h1>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          style={btn}
        >
          ⬅ Dashboard
        </button>

      </div>

      {/* TOP BAR */}
      <div style={{
        display: "grid",
        gridTemplateColumns:
          "300px 1fr",
        gap: 20,
        marginBottom: 20
      }}>

        {/* MONTH FILTER */}
        <div style={card}>

          <h3>
            Monthly Archive 📅
          </h3>

          <input
            type="month"
            value={month}
            onChange={(e) =>
              setMonth(
                e.target.value
              )
            }
            style={input}
          />

          <button
            onClick={() =>
              setMonth("")
            }
            style={{
              ...btn,
              marginTop: 12,
              width: "100%"
            }}
          >
            Show All Patients
          </button>

        </div>

        {/* SELECT */}
        <div style={{
          ...card,
          borderTop:
            `5px solid ${primary}`
        }}>

          <h3>
            Select Patient
          </h3>

          <select
            value={selected}
            onChange={(e) => {

              setSelected(
                e.target.value
              );

              loadFile(
                e.target.value
              );

            }}
            style={input}
          >

            <option value="">
              -- Select Patient --
            </option>

            {filteredPatients.map((p) => (

              <option
                key={p._id}
                value={p._id}
              >
                {p.name}
              </option>

            ))}

          </select>

        </div>

      </div>

      {!file && (

        <div style={empty}>
          No Patient Selected
        </div>

      )}

      {file && (

        <div>

          {/* PATIENT INFO */}
          <div style={{
            ...card,
            borderTop:
              `6px solid ${primary}`
          }}>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>

              <div>

                <h2 style={{
                  margin: 0
                }}>
                  {file.patient?.title}{" "}
                  {file.patient?.name}
                </h2>

                <p>
                  Reg No:
                  {" "}
                  {file.patient?.reg_no}
                </p>

              </div>

              <div style={{
                background: primary,
                color: "white",
                padding: "10px 18px",
                borderRadius: 30,
                fontWeight: "bold"
              }}>

                {(
                  file.patient
                    ?.colour_code || ""
                ).toUpperCase()}

              </div>

            </div>

            {/* INFO GRID */}
            <div style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: 12,
              marginTop: 20
            }}>

              <Info
                label="Mobile"
                value={
                  file.patient
                    ?.mobile_number
                }
              />

              <Info
                label="Age"
                value={
                  file.patient?.age
                }
              />

              <Info
                label="Address"
                value={
                  file.patient
                    ?.address
                }
              />

              <Info
                label="Occupation"
                value={
                  file.patient
                    ?.occupation
                }
              />

              <Info
                label="Category"
                value={
                  file.patient
                    ?.category
                }
              />

              <Info
                label="Purpose"
                value={
                  file.patient
                    ?.purpose_of_visit
                }
              />

            </div>

          </div>

          {/* MAIN */}
          <div style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 20,
            marginTop: 20
          }}>

            {/* CHECKUPS */}
            <Section
              title="Checkups 🦷"
              primary={primary}
            >

              {file.checkups.length === 0 ? (

                <p>No checkups</p>

              ) : (

                file.checkups.map((c, i) => (

                  <div
                    key={i}
                    style={item}
                  >

                    <b>
                      Complaint:
                    </b>
                    {" "}
                    {c.complaint}

                  </div>

                ))

              )}

            </Section>

            {/* VISITS */}
            <Section
              title="Visits 🩺"
              primary={primary}
            >

              {file.visits.length === 0 ? (

                <p>No visits</p>

              ) : (

                file.visits.map((v, i) => (

                  <div
                    key={i}
                    style={item}
                  >

                    <b>
                      {v.treatment}
                    </b>

                    <div>
                      {v.status}
                    </div>

                  </div>

                ))

              )}

            </Section>

            {/* INVOICES */}
            <Section
              title="Invoices 🧾"
              primary={primary}
            >

              {file.invoices.length === 0 ? (

                <p>No invoices</p>

              ) : (

                file.invoices.map((inv, i) => (

                  <div
                    key={i}
                    style={item}
                  >

                    <div>
                      Amount:
                      {" "}
                      Rs {inv.amount}
                    </div>

                    <div>
                      Paid:
                      {" "}
                      Rs {inv.paid}
                    </div>

                    <div>
                      Balance:
                      {" "}
                      Rs {inv.balance}
                    </div>

                  </div>

                ))

              )}

            </Section>

            {/* REPORTS */}
            <Section
              title="Reports 📄"
              primary={primary}
            >

              <button
                style={btn}
                onClick={() =>
                  navigate(
                    "/timeline/" +
                    file.patient?._id
                  )
                }
              >
                View Timeline
              </button>

              <button
                style={{
                  ...btn,
                  marginLeft: 10
                }}
                onClick={() => {

                  window.open(
                    `${api.defaults.baseURL}/reports/pdf/${file.patient?._id}`
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
  primary
}) {

  return (

    <div style={{
      background: "white",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.05)"
    }}>

      <div style={{
        background: primary,
        color: "white",
        padding: 14,
        fontWeight: "bold"
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

function Info({
  label,
  value
}) {

  return (

    <div style={{
      border:
        "1px solid #e2e8f0",
      borderRadius: 10,
      padding: 12
    }}>

      <div style={{
        fontSize: 12,
        color: "#64748b"
      }}>
        {label}
      </div>

      <div style={{
        fontWeight: "600",
        marginTop: 5
      }}>
        {value || "N/A"}
      </div>

    </div>

  );
}

/* ========================= */

const card = {

  background: "white",

  padding: 18,

  borderRadius: 14,

  boxShadow:
    "0 2px 8px rgba(0,0,0,0.05)"
};

const input = {

  width: "100%",

  padding: 12,

  borderRadius: 10,

  border:
    "1px solid #cbd5e1",

  marginTop: 10
};

const item = {

  borderBottom:
    "1px solid #eee",

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