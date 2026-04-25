import React, { useState } from "react";
import api from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      await api.post("/auth/register", {
        username,
        password,
        role: "office"
      });

      alert("Registered successfully. Wait for admin approval ✅");
      window.location.href = "/login";

    } catch (err) {
      alert(err.response?.data?.detail || "Error ❌");
    }
  };

  return (
    <div style={box}>
      <h2>User Registration 📝</h2>

      <p style={{ fontSize: "14px", textAlign: "center" }}>
        Create a new account to access the clinic system.
        Your account will be activated after admin approval.
      </p>

      <input
        placeholder="Enter Username / Email"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={register}>Register</button>

      <p style={{ fontSize: "12px", textAlign: "center" }}>
        Access is restricted to authorized clinic staff only.
      </p>
    </div>
  );
}

const box = {
  width: "320px",
  margin: "100px auto",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};