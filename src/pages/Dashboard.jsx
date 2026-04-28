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
    { name: "Admin", path: "/admin" }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <div style={{
        width: "220px",
        background: "#1e293b",
        color: "white",
        padding: "20px"
      }}>
        <h2>Clinic 🏥</h2>

        {modules.map((m, i) => (
          <div key={i} style={{ margin: "10px 0" }}>
            <Link to={m.path} style={{ color: "white" }}>
              {m.name}
            </Link>
          </div>
        ))}

        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          style={{ marginTop: "20px" }}
        >
          Logout
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "30px" }}>
        <h1>Dashboard</h1>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          {modules.map((m, i) => (
            <Link key={i} to={m.path}>
              <div style={{
                background: "#f1f5f9",
                padding: "20px",
                borderRadius: "10px",
                textAlign: "center"
              }}>
                {m.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}