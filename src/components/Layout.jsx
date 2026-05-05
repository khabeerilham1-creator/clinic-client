import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children }) {

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>

      {/* SIDEBAR */}
      <div style={{
        width: 260,
        background: "#0f172a",
        color: "white",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        borderRight: "1px solid #1e293b"
      }}>

        <h2 style={{ marginBottom: 25 }}>Clinic OS</h2>

        <Section title="CORE">
          <Nav icon="🏠" text="Dashboard" path="/dashboard" current={location.pathname} />
          <Nav icon="👤" text="Patients" path="/patients" current={location.pathname} />
          <Nav icon="🩺" text="Visits" path="/visits" current={location.pathname} />
          <Nav icon="🦷" text="Checkup" path="/checkup" current={location.pathname} />
        </Section>

        <Section title="CLINICAL">
          <Nav icon="📋" text="AFI" path="/afi" current={location.pathname} />
          <Nav icon="🧠" text="CIS" path="/cis" current={location.pathname} />
          <Nav icon="💊" text="Prescription" path="/prescription" current={location.pathname} />
        </Section>

        <Section title="FINANCE">
          <Nav icon="💰" text="FIS" path="/fis" current={location.pathname} />
          <Nav icon="🧾" text="Invoice" path="/invoice" current={location.pathname} />
          <Nav icon="🏭" text="LVI" path="/lvi" current={location.pathname} />
        </Section>

        <Section title="INTELLIGENCE">
          <Nav icon="📊" text="ACC" path="/acc" current={location.pathname} />
          <Nav icon="👨‍⚕️" text="HAI" path="/hai" current={location.pathname} />
        </Section>

        <Section title="CONTROL">
          <Nav icon="📉" text="Debtors" path="/debtors" current={location.pathname} />
          <Nav icon="📈" text="Creditors" path="/creditors" current={location.pathname} />
          <Nav icon="💸" text="Bills" path="/bills" current={location.pathname} />
        </Section>

        <Section title="SYSTEM">
          <Nav icon="📄" text="Reports" path="/reports" current={location.pathname} />
          <Nav icon="📁" text="Patient Files" path="/patient-files" current={location.pathname} />
        </Section>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          style={{
            marginTop: "auto",
            padding: 10,
            background: "#ef4444",
            border: "none",
            borderRadius: 6,
            color: "white",
            cursor: "pointer"
          }}
        >
          Logout
        </button>

      </div>

      {/* MAIN */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column"
      }}>

        {/* HEADER */}
        <div style={{
          background: "white",
          padding: 15,
          borderBottom: "1px solid #e5e7eb"
        }}>
          <h3>Clinic Management System</h3>
        </div>

        {/* CONTENT */}
        <div style={{
          flex: 1,
          padding: 20,
          overflowY: "auto"
        }}>
          {children}
        </div>

      </div>

    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <p style={{
        fontSize: 12,
        color: "#64748b",
        marginBottom: 6
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Nav({ icon, text, path, current }) {

  const active = current === path;

  return (
    <Link to={path} style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 10px",
      marginBottom: 5,
      borderRadius: 6,
      background: active ? "#1e293b" : "transparent",
      color: active ? "white" : "#9ca3af",
      textDecoration: "none",
      transition: "0.2s"
    }}>
      <span>{icon}</span>
      <span>{text}</span>
    </Link>
  );
}