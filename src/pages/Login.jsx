import React, { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      console.log("SENDING:", username, password);

      const res = await fetch("https://pis-backend-final-1.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await res.json();
      console.log("RESPONSE:", data);

      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        alert("Login Success ✅");

        // redirect after login
        window.location.href = "/dashboard";
      } else {
        alert("Login Failed ❌");
      }

    } catch (error) {
      console.error("ERROR:", error);
      alert("Network Error ❌");
    }
  };

  return (
    <div style={{ width: "300px", margin: "100px auto", display: "flex", flexDirection: "column", gap: "10px", textAlign: "center" }}>
      <h2>Clinic Login</h2>

      <input
        type="text"
        placeholder="Enter Username / Email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "10px" }}
      />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px" }}
      />

      <button
        onClick={login}
        style={{ padding: "10px", cursor: "pointer" }}
      >
        Login
      </button>
    </div>
  );
}