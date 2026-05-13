import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Timeline() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [timeline, setTimeline] =
    useState([]);

  const [file, setFile] =
    useState(null);

  const [visits, setVisits] =
    useState([]);

  const [invoices, setInvoices] =
    useState([]);

  const [checkups, setCheckups] =
    useState([]);

  // =========================
  // LOAD DATA
  // =========================

  const load = async () => {

    try {

      // TIMELINE
      const t =
        await api.get(
          "/timeline/" + id
        );

      setTimeline(t.data || []);

      // PATIENT FILE
      const f =
        await api.get(
          `/patient-files/${id}`
        );

      setFile(f.data);

      // VISITS
      const v =
        await api.get("/visits/");

      const patientVisits =
        (v.data || []).filter(
          x =>
            x.patient_id === id ||
            x.patient === id
        );

      setVisits(patientVisits);

      // INVOICES
      const i =
        await api.get("/invoice/");

      const patientInvoices =
        (i.data || []).filter(
          x =>
            x.patient_id === id ||
            x.patient_name ===
            f.data?.data?.patient_info?.name ||
            x.patient_name ===
            f.data?.patient_info?.name
        );

      setInvoices(patientInvoices);

      // CHECKUPS
      const c =
        await api.get("/checkups/");

      const patientCheckups =
        (c.data || []).filter(
          x =>
            x.patient === id ||
            x.patient_id === id ||
            x.patientId === id
        );

      setCheckups(patientCheckups);

    } catch (err) {

      console.log(err);

      alert(
        "Failed to load ❌"
      );

    }

  };

  useEffect(() => {

    load();

  }, []);

  const patient =
    file?.data?.patient_info ||
    file?.patient_info ||
    {};

  return (

    <Layout>

      {/* HEADER */}

      <div style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>

        <h1 style={{
          margin: 0
        }}>
          Patient History
        </h1>

        <button
          onClick={() =>
            navigate("/patients")
          }
          style={btn}
        >
          ⬅ Back
        </button>

      </div>

      {/* PATIENT */}

      <div style={card}>

        <h2 style={title}>
          Patient Bio Data
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2,1fr)",
          gap: 12
        }}>

          <Info
            label="Reg No"
            value={patient.reg_no}
          />

          <Info
            label="Patient Name"
            value={
              `${patient.title || ""} ${patient.name || ""}`
            }
          />

          <Info
            label="Mobile"
            value={
              patient.mobile_number
            }
          />

          <Info
            label="Birth Date"
            value={
              patient.birth_date
            }
          />

          <Info
            label="Age"
            value={patient.age}
          />

          <Info
            label="Occupation"
            value={
              patient.occupation
            }
          />

          <Info
            label="Address"
            value={
              patient.address
            }
          />

          <Info
            label="Referred By"
            value={
              patient.referred_by
            }
          />

          <Info
            label="Purpose"
            value={
              patient.purpose_of_visit
            }
          />

          <Info
            label="Conditions"
            value={
              Array.isArray(
                patient.conditions
              )
                ? patient.conditions.join(", ")
                : "-"
            }
          />

        </div>

      </div>

      {/* CHECKUPS */}

      <div style={card}>

        <h2 style={title}>
          Checkups
        </h2>

        {checkups.length === 0 ? (

          <p>
            No checkups found
          </p>

        ) : (

          <div style={{
            display: "grid",
            gap: 10
          }}>

            {checkups.map((c, i) => (

              <div
                key={i}
                style={smallCard}
              >

                <div style={badge}>
                  CHECKUP
                </div>

                <p>
                  <b>Complaint:</b>
                  {" "}
                  {c.complaint || "-"}
                </p>

                {c.tasks?.map((t, idx) => (

                  <div
                    key={idx}
                    style={{
                      marginTop: 10,
                      padding: 12,
                      background: "#f8fafc",
                      borderRadius: 10,
                      border:
                        "1px solid #e2e8f0"
                    }}
                  >

                    <p>
                      <b>Tooth:</b>
                      {" "}
                      {t.tooth}
                    </p>

                    <p>
                      <b>Condition:</b>
                      {" "}
                      {t.condition}
                    </p>

                    <p>
                      <b>Treatment:</b>
                      {" "}
                      {t.treatment}
                    </p>

                  </div>

                ))}

              </div>

            ))}

          </div>

        )}

      </div>

      {/* INVOICES */}

      <div style={card}>

        <h2 style={title}>
          Invoices
        </h2>

        {invoices.length === 0 ? (

          <p>
            No invoices found
          </p>

        ) : (

          <div style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: 15
          }}>

            {invoices.map((inv, i) => (

              <div
                key={i}
                style={invoiceCard}
              >

                <h3>
                  Invoice #{i + 1}
                </h3>

                <p>
                  <b>Amount:</b>
                  {" "}
                  Rs {inv.amount || 0}
                </p>

                <p>
                  <b>Paid:</b>
                  {" "}
                  Rs {inv.paid || 0}
                </p>

                <p>
                  <b>Balance:</b>
                  {" "}
                  Rs {inv.balance || 0}
                </p>

                <div style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 10
                }}>

                  <a
                    href={`${api.defaults.baseURL}/invoice/pdf/${encodeURIComponent(inv.patient_name)}`}
                    target="_blank"
                    rel="noreferrer"
                  >

                    <button style={pdfBtn}>
                      PDF
                    </button>

                  </a>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* TREATMENT PLAN */}

      <div style={card}>

        <h2 style={title}>
          Planned Sequence Of Treatment
        </h2>

        {visits.length === 0 ? (

          <p>
            No treatment plans found
          </p>

        ) : (

          <div style={{
            display: "grid",
            gap: 10
          }}>

            {visits.map((v, i) => (

              <div
                key={i}
                style={smallCard}
              >

                <div style={{
                  ...badge,
                  background:
                    v.status ===
                    "Completed"
                      ? "#16a34a"
                      : "#2563eb"
                }}>

                  {v.status}

                </div>

                <p>
                  <b>Visit No:</b>
                  {" "}
                  {v.visit_no}
                </p>

                <p>
                  <b>Treatment:</b>
                  {" "}
                  {v.treatment}
                </p>

                <p>
                  <b>Date:</b>
                  {" "}
                  {v.date}
                </p>

                <p>
                  <b>Doctor:</b>
                  {" "}
                  {v.procedure_doctor || "-"}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </Layout>

  );

}

/* INFO */

function Info({
  label,
  value
}) {

  return (

    <div style={{
      background: "#f8fafc",
      padding: 12,
      borderRadius: 10,
      border:
        "1px solid #e2e8f0"
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
        {value || "-"}
      </div>

    </div>

  );

}

/* STYLES */

const card = {

  background: "white",

  padding: 20,

  borderRadius: 14,

  marginBottom: 20,

  boxShadow:
    "0 2px 8px rgba(0,0,0,0.05)"

};

const title = {

  marginTop: 0,

  marginBottom: 18

};

const smallCard = {

  border:
    "1px solid #e2e8f0",

  borderRadius: 12,

  padding: 14,

  background: "#fff"

};

const invoiceCard = {

  border:
    "1px solid #e2e8f0",

  borderRadius: 12,

  padding: 16,

  background: "#f8fafc"

};

const badge = {

  display: "inline-block",

  background: "#2563eb",

  color: "white",

  padding: "4px 10px",

  borderRadius: 20,

  fontSize: 12,

  marginBottom: 10

};

const btn = {

  padding: "10px 16px",

  border: "none",

  borderRadius: 8,

  background: "#e2e8f0",

  cursor: "pointer"

};

const pdfBtn = {

  padding: "8px 14px",

  border: "none",

  borderRadius: 8,

  background: "#dc2626",

  color: "white",

  cursor: "pointer"

};

export default Timeline;