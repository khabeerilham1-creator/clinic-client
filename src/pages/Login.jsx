import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("admin@hdc.com");
  const [password, setPassword] = useState("123456");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await fetch("https://pis-backend-final-1.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        alert("Login Success ✅");

        navigate("/dashboard"); // ✅ correct redirect
      } else {
        alert("Login Failed ❌");
      }

    } catch (error) {
      console.error(error);
      alert("Network Error ❌");
    }
  };

  return (
    <div style={{ width: "300px", margin: "100px auto", textAlign: "center" }}>
      <h2>Clinic Login</h2>

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ margin: "10px", padding: "10px", width: "90%" }}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ margin: "10px", padding: "10px", width: "90%" }}
      />

      <button onClick={login} style={{ padding: "10px", width: "95%" }}>
        Login
      </button>
    </div>
  );
}