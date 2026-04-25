import React from "react";
import { Routes, Route, Link } from "react-router-dom";

// SYSTEM PAGES
import Patients from "./pages/Patients";
import Checkup from "./pages/Checkup";
import Reports from "./pages/Reports";
import FIS from "./pages/FIS";
import AFI from "./pages/AFI";
import CIS from "./pages/CIS";
import Dashboard from "./pages/Dashboard";
import LVI from "./pages/LVI";

// AUTH
import Login from "./pages/Login";
import Register from "./pages/Register";

// ADMIN
import AdminUsers from "./pages/AdminUsers";

function App() {

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ================= 🔐 NOT LOGGED IN =================
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // ================= ✅ LOGGED IN =================
  return (
    <div>

      {/* NAVBAR */}
      <div style={nav}>

        {/* COMMON */}
        <Link to="/">Patients</Link>
        <Link to="/checkup">Checkup</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/fis">FIS</Link>
        <Link to="/afi">AFI</Link>
        <Link to="/cis">CIS</Link>
        <Link to="/lvi">LVI</Link>

        {/* ADMIN ONLY */}
        {role === "admin" && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/admin-users">Users</Link>
          </>
        )}

        {/* LOGOUT */}
        <button
          style={logout}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>

      </div>

      {/* ROUTES */}
      <Routes>

        {/* COMMON ROUTES */}
        <Route path="/" element={<Patients />} />
        <Route path="/checkup" element={<Checkup />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/fis" element={<FIS />} />
        <Route path="/afi" element={<AFI />} />
        <Route path="/cis" element={<CIS />} />
        <Route path="/lvi" element={<LVI />} />

        {/* ADMIN ROUTES */}
        {role === "admin" && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin-users" element={<AdminUsers />} />
          </>
        )}

        {/* FALLBACK */}
        <Route path="*" element={<Patients />} />

      </Routes>

    </div>
  );
}

/* ================= STYLES ================= */

const nav = {
  padding: "10px",
  background: "#eef2f7",
  display: "flex",
  gap: "15px",
  alignItems: "center"
};

const logout = {
  marginLeft: "auto",
  padding: "6px 12px",
  background: "#d9534f",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default App;