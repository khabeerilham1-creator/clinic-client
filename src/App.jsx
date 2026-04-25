import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

// Dummy pages (replace with your real ones later)
const Home = () => <h2>Patients Page</h2>;

function App() {
  const token = localStorage.getItem("token");

  // 🔒 NOT LOGGED IN
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // 🔓 LOGGED IN
  return (
    <div>
      <nav style={{ padding: 10, background: "#eee" }}>
        <Link to="/">Patients</Link>
        <button
          style={{ marginLeft: 20 }}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;