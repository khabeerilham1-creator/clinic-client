import {
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";

export default function Layout({
  children
}) {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const role =
    localStorage.getItem("role");

  const permissions =
    JSON.parse(

      localStorage.getItem(
        "permissions"
      ) || "{}"
    );

  // =========================
  // CHECK ACCESS
  // =========================
  const canView = (module) => {

    // CEO / ADMIN FULL ACCESS
    if (

      role === "CEO" ||

      role === "admin"

    ) {

      return true;
    }

    // IF NO PERMISSIONS
    // SHOW DASHBOARD ONLY
    if (

      !permissions ||

      Object.keys(
        permissions
      ).length === 0

    ) {

      return module === "dashboard";
    }

    // STAFF ACCESS
    return (

      permissions[module] ===
      "enabled"
    );
  };

  return (

    <div style={{

      display: "flex",

      minHeight: "100vh",

      background: "#f8fafc"

    }}>

      {/* SIDEBAR */}
      <div style={{

        width: 270,

        background: "#0f172a",

        color: "white",

        padding: 20,

        display: "flex",

        flexDirection: "column",

        position: "sticky",

        top: 0,

        height: "100vh",

        overflowY: "auto",

        borderRight:
          "1px solid #1e293b"

      }}>

        {/* LOGO */}
        <div style={{
          marginBottom: 25
        }}>

          <h1 style={{

            margin: 0,

            fontSize: 28,

            fontWeight: "bold"

          }}>
            HDC
          </h1>

          <div style={{

            fontSize: 12,

            color: "#94a3b8",

            marginTop: 4

          }}>
            Holistic Domain of Creativity
          </div>

        </div>

        {/* CORE */}
        <Section title="CORE">

          {canView("dashboard") && (

            <Nav
              icon="🏠"
              text="Dashboard"
              path="/dashboard"
              current={location.pathname}
            />

          )}

          {canView("patients") && (

            <Nav
              icon="👤"
              text="Patients Entry"
              path="/patients entry"
              current={location.pathname}
            />

          )}

          {canView("visits") && (

            <Nav
              icon="🩺"
              text="Planned Sequence Of Treatment"
              path="/Planned Sequence Of Treatment"
              current={location.pathname}
            />

          )}

          {canView("checkup") && (

            <Nav
              icon="🦷"
              text="Checkup"
              path="/checkup"
              current={location.pathname}
            />

          )}

        </Section>

        {/* CLINICAL */}
        <Section title="CLINICAL">

          {canView("afi") && (

            <Nav
              icon="📋"
              text="AFI"
              path="/afi"
              current={location.pathname}
            />

          )}

          {canView("cis") && (

            <Nav
              icon="🧠"
              text="CIS"
              path="/cis"
              current={location.pathname}
            />

          )}

          {canView("prescription") && (

            <Nav
              icon="💊"
              text="Prescription"
              path="/prescription"
              current={location.pathname}
            />

          )}

        </Section>

        {/* FINANCE */}
        <Section title="FINANCE">

          {canView("fis") && (

            <Nav
              icon="💰"
              text="FIS"
              path="/fis"
              current={location.pathname}
            />

          )}

          {canView("invoice") && (

            <Nav
              icon="🧾"
              text="Invoice"
              path="/invoice"
              current={location.pathname}
            />

          )}

          {canView("lvi") && (

            <Nav
              icon="🏭"
              text="LVI"
              path="/lvi"
              current={location.pathname}
            />

          )}

          {canView("patient_account_status") && (

            <Nav
              icon="💳"
              text="Patient Account Status"
              path="/patient-account-status"
              current={location.pathname}
            />

          )}

        </Section>

        {/* INTELLIGENCE */}
        <Section title="INTELLIGENCE">

          {canView("acc") && (

            <Nav
              icon="📊"
              text="ACC"
              path="/acc"
              current={location.pathname}
            />

          )}

          {canView("hai") && (

            <Nav
              icon="👨‍⚕️"
              text="HAI"
              path="/hai"
              current={location.pathname}
            />

          )}

          {canView("ars") && (

           <Nav
              icon="🚨"
              text="ARS"
              path="/ars"
              current={location.pathname}
            />

          )}

        </Section>

        {/* CONTROL */}
        <Section title="CONTROL">

          {canView("debtors") && (

            <Nav
              icon="📉"
              text="ACCOUNT RECEIVABLE"
              path="/debtors"
              current={location.pathname}
            />

          )}

          {canView("creditors") && (

            <Nav
              icon="📈"
              text="ACCOUNT PAYABLE"
              path="/creditors"
              current={location.pathname}
            />

          )}

          {canView("bills") && (

            <Nav
              icon="💸"
              text="Bills"
              path="/bills"
              current={location.pathname}
            />

          )}

        </Section>

        {/* SYSTEM */}
        <Section title="SYSTEM">

          {canView("reports") && (

            <Nav
              icon="📄"
              text="Reports"
              path="/reports"
              current={location.pathname}
            />

          )}

          {canView("patient_files") && (

            <Nav
              icon="📁"
              text="Patient Files"
              path="/patient-files"
              current={location.pathname}
            />

          )}

          {canView("city_patients") && (

            <Nav
              icon="🌍"
              text="City Patients"
              path="/city-patients"
              current={location.pathname}
            />

          )}

          {canView("completed_cases") && (

            <Nav
              icon="✅"
              text="Completed Cases"
              path="/completed-cases"
              current={location.pathname}
            />

          )}

          {canView("pending_cases") && (

            <Nav
              icon="⏳"
              text="Pending Cases"
              path="/pending-cases"
              current={location.pathname}
            />

          )}

          {canView("to_be_appointed") && (

            <Nav
              icon="📅"
              text="To Be Appointed"
              path="/to-be-appointed"
              current={location.pathname}
            />

          )}

          {canView("to_be_excepted") && (

            <Nav
              icon="🚫"
              text="To Be Excepted"
              path="/to-be-excepted"
              current={location.pathname}
            />

          )}

          {(role === "CEO" ||
            role === "admin") && (

            <Nav
              icon="🔐"
              text="Permissions"
              path="/permissions"
              current={location.pathname}
            />

          )}

        </Section>

        {/* LOGOUT */}
        <button

          onClick={() => {

            localStorage.clear();

            navigate("/");
          }}

          style={{

            marginTop: "auto",

            padding: 12,

            background: "#ef4444",

            border: "none",

            borderRadius: 8,

            color: "white",

            cursor: "pointer",

            fontWeight: "bold",

            fontSize: 14

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

          padding: "16px 24px",

          borderBottom:
            "1px solid #e5e7eb",

          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between"

        }}>

          <h3 style={{

            margin: 0,

            fontSize: 20,

            fontWeight: "600",

            color: "#0f172a"

          }}>
            Holistic Domain of Creativity
          </h3>

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

/* SECTION */

function Section({
  title,
  children
}) {

  return (

    <div style={{
      marginBottom: 20
    }}>

      <p style={{

        fontSize: 11,

        color: "#64748b",

        marginBottom: 8,

        letterSpacing: "1px",

        fontWeight: "bold"

      }}>
        {title}
      </p>

      {children}

    </div>
  );
}

/* NAV */

function Nav({
  icon,
  text,
  path,
  current
}) {

  const active =
    current.startsWith(path);

  return (

    <Link

      to={path}

      style={{

        display: "flex",

        alignItems: "center",

        gap: 10,

        padding: "11px 12px",

        marginBottom: 6,

        borderRadius: 8,

        background:
          active
            ? "#1e293b"
            : "transparent",

        color:
          active
            ? "white"
            : "#cbd5e1",

        textDecoration: "none",

        fontSize: 14,

        transition: "0.2s",

        fontWeight:
          active
            ? "600"
            : "400"

      }}
    >

      <span style={{
        fontSize: 16
      }}>
        {icon}
      </span>

      <span>
        {text}
      </span>

    </Link>
  );
}