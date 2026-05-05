import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function ReportView() {

  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reports/" + id)
      .then(res => {
        console.log("REPORT DATA:", res.data);
        setData(res.data);
      })
      .catch(err => {
        console.log("REPORT ERROR:", err.response?.data || err);
        alert("Failed to load report ❌");
      });
  }, [id]);

  const printReport = () => window.print();

  if (!data) return <div style={{ padding: 20 }}>Loading...</div>;

  const tasks = data.checkups?.flatMap(c => c.tasks || []) || [];

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: 20 }}>

      {/* ACTION */}
      <div className="no-print" style={{ marginBottom: 15 }}>
        <button onClick={printReport} style={btn}>
          🖨️ Download PDF
        </button>
      </div>

      {/* REPORT CARD */}
      <div id="report" style={{
        background: "white",
        padding: 30,
        borderRadius: 10,
        maxWidth: "900px",
        margin: "auto",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
      }}>

        {/* HEADER */}
        <h1 style={{ textAlign: "center", color: "#1e3a8a" }}>
          HDC Holistic Domain of Creativity
        </h1>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          fontSize: 14
        }}>
          <div><b>Date:</b> {new Date().toLocaleDateString()}</div>
          <div><b>Time:</b> {new Date().toLocaleTimeString()}</div>
        </div>

        {/* PATIENT INFO */}
        <Section title="PATIENT INFORMATION">
          <InfoRow label="Name" value={data.patient?.name} />
          <InfoRow label="Phone" value={data.patient?.phone} />
        </Section>

        {/* CHECKUP */}
        <Section title="DENTAL CHECKUP REPORT">

          <Table
            headers={["Tooth", "Condition", "Treatment"]}
            rows={tasks.length
              ? tasks.map(t => [t.tooth, t.condition, t.treatment])
              : [["-", "No data", "-"]]
            }
          />

          <p style={{ marginTop: 10 }}>
            <b>Chief Complaint:</b> {data.checkups?.[0]?.complaint || ""}
          </p>

        </Section>

        {/* TREATMENT SUMMARY */}
        <Section title="TREATMENT SUMMARY">

          <Table
            headers={["Tooth", "Treatment"]}
            rows={tasks.length
              ? tasks.map(t => [t.tooth, t.treatment])
              : [["-", "No data"]]
            }
          />

        </Section>

        {/* TIMELINE */}
        <Section title="CLINICAL TIMELINE">

          <Table
            headers={["Date", "Diagnosis", "Treatment", "Medicines", "Fee"]}
            rows={data.visits?.length
              ? data.visits.map(v => [
                  v.date || "",
                  v.diagnosis || "",
                  v.treatment || "",
                  v.medicines || "",
                  v.fee || ""
                ])
              : [["-", "No data", "-", "-", "-"]]
            }
          />

        </Section>

        {/* CHART */}
        <Section title="DENTAL CHART">
          <div style={{ textAlign: "center" }}>
            <img src="/teeth.png" style={{ width: 350 }} />
          </div>
        </Section>

      </div>

      {/* STYLE */}
      <style>{`
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th {
          background: #f1f5f9;
          padding: 8px;
          border: 1px solid #ddd;
        }

        td {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: center;
        }

        @media print {
          body {
            background: white;
          }

          .no-print {
            display: none;
          }

          #report {
            box-shadow: none;
            border-radius: 0;
            padding: 10px;
          }
        }
      `}</style>

    </div>
  );
}

/* 🔥 COMPONENTS */

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        background: "#e0ecff",
        padding: 8,
        fontWeight: "bold",
        borderRadius: 4
      }}>
        {title}
      </div>
      <div style={{ marginTop: 10 }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <b>{label}:</b> {value || "N/A"}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <table>
      <thead>
        <tr>
          {headers.map((h, i) => <th key={i}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => <td key={j}>{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const btn = {
  padding: "10px 20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6
};