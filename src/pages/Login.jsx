import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      // ✅ FIX: use success instead of access_token
      if (res.data.success) {
        alert("Login Success ✅");

        // ✅ no localStorage needed (cookie is already set)
        navigate("/dashboard");
      } else {
        alert("Invalid credentials ❌");
      }

    } catch (err) {
      console.error(err);
      alert("Login Failed ❌");
    }
  };

  return (
    <div style={{ width: 320, margin: "100px auto", textAlign: "center" }}>
      <h2>Clinic Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={login}>Login</button>
    </div>
  );
}