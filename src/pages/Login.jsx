import React, { useState } from "react";
import api from "../api";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.access_token);

      alert("Login Success ✅");

      // 🔥 HASH ROUTER REDIRECT
      window.location.href = "#/dashboard";

    } catch (err) {
      console.error(err);
      alert("Login Failed ❌");
    }
  };

  return (
    <div style={{ width: 320, margin: "100px auto", textAlign: "center" }}>

      <h2>Clinic Login Portal 🔐</h2>

      <p>
        Please enter your credentials to access the clinic system.
      </p>

      <input
        placeholder="Username or Email"
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={login}>Login</button>

    </div>
  );
}