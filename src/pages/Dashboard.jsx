import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }
  }, [navigate]); // ✅ FIXED: added navigate here

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Dashboard ✅</h1>
      <p>You are logged in.</p>
    </div>
  );
}