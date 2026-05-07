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
  let bg = "#f0fdf4";

  if (patient.colour_code === "yellow") {
    primary = "#ca8a04";
    light = "#fef9c3";
    bg = "#fefce8";
  }

  if (patient.colour_code === "orange") {
    primary = "#ea580c";
    light = "#fed7aa";
    bg = "#fff7ed";
  }

  if (patient.colour_code === "red") {
    primary = "#dc2626";
    light = "#fecaca";
    bg = "#fef2f2";
  }

  const tasks =
    data.checkups?.flatMap(c => c.tasks || []) || [];

  return (

    <div style={{
      background: bg,
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
        maxWidth: 1100,
        margin: "auto",
        borderRadius: 16,
        padding: 25,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
      }}>

        {/* HEADER */}
        <div style={{
          background: primary,
          color: "white",
          padding: 22,
          borderRadius: 14,
          textAlign: "center",
          fontSize: 34,
          fontWeight: "bold"
        }}>
          HDC Holistic Domain of Creativity
        </div>

        {/* TOP BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
          marginBottom: 20
        }}>

          <div>
            <b>Date:</b> {new Date().toLocaleDateString()}
          </div>

          <div style={{
            background: primary,
            color: "white",
            padding: "6px 16px",
            borderRadius: 20,
            fontSize: 13,
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
            <Info label="Emergency" value={patient.emergency_number} />

            <Info label="Occupation" value={patient.occupation} />
            <Info label="Address" value={patient.address} />

            <Info label="Category" value={patient.category} />
            <Info label="Purpose" value={patient.purpose_of_visit} />

            <Info label="Fee Status" value={patient.consultation_fee_paid} />
            <Info label="Referred By" value={patient.referred_by} />

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

        {/* INVOICE */}
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
            padding: 20
          }}>
            <img
              src="/teeth.png"
              style={{
                width: 350
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
      borderRadius: 12,
      marginTop: 22,
      overflow: "hidden",
      background: "white"
    }}>

      <div style={{
        background: light,
        color: primary,
        padding: 12,
        fontWeight: "bold",
        fontSize: 15
      }}>
        {title}
      </div>

      <div style={{ padding: 14 }}>
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
      gap: 14
    }}>
      {children}
    </div>
  );
}

function Info({ label, value }) {

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: 10,
      background: "#fafafa"
    }}>
      <div style={{
        fontSize: 12,
        color: "#6b7280",
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
  border: "1px solid #d1d5db",
  padding: 10,
  background: "#dcfce7",
  fontWeight: "bold"
};

const td = {
  border: "1px solid #d1d5db",
  padding: 10,
  textAlign: "center"
};