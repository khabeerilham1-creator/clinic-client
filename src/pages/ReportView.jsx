import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function ReportView() {

  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reports/report/" + id)
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, [id]);

  const printReport = () => window.print();

  if (!data) return <div style={{ padding: 20 }}>Loading...</div>;

  const tasks = data.checkups?.flatMap(c => c.tasks || []);

  return (
    <div style={{ padding: 20 }}>

      <button onClick={printReport} className="no-print">
        🖨️ Download PDF
      </button>

      <div id="report" style={{ fontFamily: "Arial", padding: 20 }}>

        {/* HEADER */}
        <h1 style={{ textAlign: "center", color: "#2b4c7e" }}>
          HDC Holistic Domain of Creativity
        </h1>

        <p>
          <b>Date:</b> {new Date().toLocaleDateString()} |{" "}
          <b>Time:</b> {new Date().toLocaleTimeString()}
        </p>

        {/* PATIENT INFO */}
        <div className="section">
          <div className="title">PATIENT INFORMATION</div>

          <div className="info">
            Name: {data.patient.name}<br />
            Phone: {data.patient.phone}<br />
          </div>
        </div>

        {/* CHECKUP */}
        <div className="section">
          <div className="title">DENTAL CHECKUP REPORT</div>

          <table>
            <thead>
              <tr>
                <th>Tooth</th>
                <th>Condition</th>
                <th>Treatment</th>
              </tr>
            </thead>

            <tbody>
              {tasks.length ? tasks.map((t, i) => (
                <tr key={i}>
                  <td>{t.tooth}</td>
                  <td>{t.condition}</td>
                  <td>{t.treatment}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3">No checkup data</td>
                </tr>
              )}
            </tbody>
          </table>

          <br />
          <b>Chief Complaint:</b> {data.checkups[0]?.complaint || ""}
        </div>

        {/* TREATMENT */}
        <div className="section">
          <div className="title">TREATMENT SUMMARY</div>

          <table>
            <thead>
              <tr>
                <th>Tooth</th>
                <th>Treatment</th>
              </tr>
            </thead>

            <tbody>
              {tasks.length ? tasks.map((t, i) => (
                <tr key={i}>
                  <td>{t.tooth}</td>
                  <td>{t.treatment}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="2">No treatment data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TIMELINE */}
        <div className="section">
          <div className="title">CLINICAL TIMELINE</div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Medicines</th>
                <th>Fee</th>
              </tr>
            </thead>

            <tbody>
              {data.visits.length ? data.visits.map((v, i) => (
                <tr key={i}>
                  <td>{v.date || ""}</td>
                  <td>{v.diagnosis || ""}</td>
                  <td>{v.treatment || ""}</td>
                  <td>{v.medicines || ""}</td>
                  <td>{v.fee || ""}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5">No visit data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* DENTAL CHART */}
        <div className="section">
          <div className="title">DENTAL CHART</div>

          <div className="chart">
            <img src="/teeth.png" alt="chart" />
          </div>
        </div>

      </div>

      {/* EXACT SAME CSS */}
      <style>
        {`
          body { font-family: Arial; }

          h1 { text-align:center; color:#2b4c7e; }

          .section { margin-top:20px; }

          .title { background:#eef4ff; padding:8px; font-weight:bold; }

          table { width:100%; border-collapse:collapse; }

          th, td { border:1px solid #ccc; padding:6px; text-align:center; }

          .info { border:1px solid #ccc; padding:10px; }

          .chart { text-align:center; margin-top:10px; }

          .chart img { width:300px; }

          @media print {
            .no-print { display:none; }
          }
        `}
      </style>

    </div>
  );
}