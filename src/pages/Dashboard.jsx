import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  const modules = [
    { name: "Patients", path: "/patients" },
    { name: "Visits", path: "/visits" },
    { name: "AFI", path: "/afi" },
    { name: "FIS", path: "/fis" },
    { name: "CIS", path: "/cis" },
    { name: "Checkup", path: "/checkup" },
    { name: "Reports", path: "/reports" },
    { name: "Invoice", path: "/invoice" },
    { name: "LVI", path: "/lvi" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial" }}>

      {/* Sidebar */}
      <div style={{
        width: "230px",
        background: "#0f172a",
        color: "white",
        padding: "20px"
      }}>
        <h2 style={{ marginBottom: "20px" }}>🏥 Clinic</h2>

        {modules.map((m, i) => (
          <div key={i} style={{ marginBottom: "12px" }}>
            <Link
              to={m.path}
              style={{
                color: "white",
                textDecoration: "none",
                display: "block",
                padding: "8px",
                borderRadius: "6px"
              }}
            >
              {m.name}
            </Link>
          </div>
        ))}

        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          style={{
            marginTop: "30px",
            width: "100%",
            padding: "10px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "30px", background: "#f8fafc" }}>
        <h1 style={{ marginBottom: "20px" }}>Dashboard</h1>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          {modules.map((m, i) => (
            <Link key={i} to={m.path} style={{ textDecoration: "none" }}>
              <div style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "0.2s"
              }}>
                <h3>{m.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}