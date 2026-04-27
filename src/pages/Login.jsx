import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [username, setUsername] = useState("admin@hdc.com");
  const [password, setPassword] = useState("123456");
  const navigate = useNavigate();

  const login = async () => {
    try {
      console.log("SENDING:", username, password);

      const res = await api.post("/auth/login", {
        username,
        password
      });

      const data = res.data;
      console.log("RESPONSE:", data);

      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
        alert("Login Success ✅");
        navigate("/dashboard");
      } else {
        alert("Login Failed ❌");
      }

    } catch (err) {
      console.error(err);
      alert("Network Error ❌");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Clinic Login</h2>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <button onClick={login}>Login</button>
    </div>
  );
}