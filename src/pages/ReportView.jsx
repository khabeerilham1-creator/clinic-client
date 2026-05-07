import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function ReportView() {

  const { id } = useParams();

  const [data, setData] = useState(null);

  useEffect(() => {

    api.get("/reports/" + id)

      .then(res => {
        setData(res.data);
      })

      .catch(err => {
        console.log(err);
        alert("Failed to load report ❌");
      });

  }, [id]);

  if (!data) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  const patient = data.patient || {};

  // =========================
  // DYNAMIC COLOUR
  // =========================
  let primary = "#16a34a";
  let light = "#dcfce7";

  if (patient.colour_code === "yellow") {
    primary = "#ca8a04";
    light = "#fef9c3";
  }

  if (patient.colour_code === "orange") {
    primary = "#ea580c";
    light = "#fed7aa";
  }

  if (patient.colour_code === "red") {
    primary = "#dc2626";
    light = "#fecaca";
  }

  const tasks =
    data.checkups?.flatMap(c => c.tasks || []) || [];

  return (

    <div style={{
      background: "#f3f4f6",
      minHeight: "100vh",
      padding: 20
    }}>

      {/* BUTTON */}
      <div style={{ marginBottom: 15 }}>

        <button
          onClick={() =>
            window.open(
              `${api.defaults.baseURL}/reports/pdf/${id}`
            )
          }
          style={{
            padding: "10px 20px",
            background: primary,
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          🖨️ Download PDF
        </button>

      </div>

      {/* REPORT */}
      <div style={{
        background: "white",
        maxWidth: 900,
        margin: "auto",
        borderRadius: 14,
        padding: 25,
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
      }}>

        {/* HEADER */}
        <div style={{
          background: primary,
          color: "white",
          padding: 20,
          borderRadius: 10,
          textAlign: "center",
          fontSize: 34,
          fontWeight: "bold"
        }}>
          HDC Holistic Domain of Creativity
        </div>

        {/* DATE */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 15,
          marginBottom: 15
        }}>

          <div>
            <b>Date:</b> {new Date().toLocaleDateString()}
          </div>

          <div style={{
            background: primary,
            color: "white",
            padding: "5px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: "bold"
          }}>
            {(patient.colour_code || "green").toUpperCase()} CATEGORY
          </div>

        </div>

        {/* PATIENT INFO */}
        <Section
          title="PATIENT INFORMATION"
          primary={primary}
          light={light}
        >

          <Grid>

            <Info label="Reg No" value={patient.reg_no} />
            <Info label="Name" value={`${patient.title || ""} ${patient.name || ""}`} />

            <Info label="Age" value={patient.age} />
            <Info label="Gender" value={patient.gender} />

            <Info label="Mobile" value={patient.mobile_number} />
            <Info label="Address" value={patient.address} />

            <Info label="Occupation" value={patient.occupation} />
            <Info label="Category" value={patient.category} />

            <Info label="Purpose" value={patient.purpose_of_visit} />
            <Info label="Fee Status" value={patient.consultation_fee_paid} />

          </Grid>

        </Section>

        {/* CHECKUP */}
        <Section
          title="CHECKUP REPORT"
          primary={primary}
          light={light}
        >

          <Table
            headers={[
              "Tooth",
              "Condition",
              "Treatment"
            ]}
            rows={
              tasks.length
                ? tasks.map(t => [
                    t.tooth,
                    t.condition,
                    t.treatment
                  ])
                : [["-", "No checkup data", "-"]]
            }
          />

        </Section>

        {/* VISITS */}
        <Section
          title="VISITS HISTORY"
          primary={primary}
          light={light}
        >

          <Table
            headers={[
              "Date",
              "Diagnosis",
              "Treatment",
              "Medicines",
              "Fee"
            ]}
            rows={
              data.visits?.length
                ? data.visits.map(v => [
                    v.date || "",
                    v.diagnosis || "",
                    v.treatment || "",
                    v.medicines || "",
                    v.fee || ""
                  ])
                : [["-", "-", "No visit data", "-", "-"]]
            }
          />

        </Section>

        {/* INVOICES */}
        <Section
          title="INVOICE SUMMARY"
          primary={primary}
          light={light}
        >

          <Table
            headers={[
              "Procedure",
              "Amount",
              "Paid",
              "Balance"
            ]}
            rows={
              data.invoices?.length
                ? data.invoices.map(inv => [
                    inv.rows?.map(r => r.treatment).join(", "),
                    inv.amount,
                    inv.paid,
                    inv.balance
                  ])
                : [["-", "-", "-", "No invoice data"]]
            }
          />

        </Section>

        {/* CHART */}
        <Section
          title="DENTAL CHART"
          primary={primary}
          light={light}
        >

          <div style={{
            textAlign: "center",
            padding: 15
          }}>
            <img
              src="/teeth.png"
              style={{
                width: 300
              }}
            />
          </div>

        </Section>

      </div>

    </div>
  );
}

/* ========================= */

function Section({
  title,
  children,
  primary,
  light
}) {

  return (

    <div style={{
      border: `2px solid ${primary}`,
      borderRadius: 10,
      marginTop: 20,
      overflow: "hidden"
    }}>

      <div style={{
        background: light,
        color: primary,
        padding: 10,
        fontWeight: "bold"
      }}>
        {title}
      </div>

      <div style={{ padding: 10 }}>
        {children}
      </div>

    </div>
  );
}

function Grid({ children }) {

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: 10
    }}>
      {children}
    </div>
  );
}

function Info({ label, value }) {

  return (
    <div style={{
      borderBottom: "1px solid #eee",
      paddingBottom: 6
    }}>
      <b>{label}:</b> {value || "N/A"}
    </div>
  );
}

function Table({ headers, rows }) {

  return (
    <table style={{
      width: "100%",
      borderCollapse: "collapse"
    }}>

      <thead>

        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              style={th}
            >
              {h}
            </th>
          ))}
        </tr>

      </thead>

      <tbody>

        {rows.map((r, i) => (

          <tr key={i}>

            {r.map((c, j) => (
              <td
                key={j}
                style={td}
              >
                {c}
              </td>
            ))}

          </tr>

        ))}

      </tbody>

    </table>
  );
}

const th = {
  border: "1px solid #ddd",
  padding: 8,
  background: "#f8fafc"
};

const td = {
  border: "1px solid #ddd",
  padding: 8,
  textAlign: "center"
};