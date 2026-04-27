import React, { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("admin@hdc.com");
  const [password, setPassword] = useState("123456");

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
    <div style={{ width: "300px", margin: "100px auto", textAlign: "center" }}>
      <h2>Login</h2>

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        style={{ display: "block", margin: "10px", padding: "10px", width: "90%" }}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{ display: "block", margin: "10px", padding: "10px", width: "90%" }}
      />

      <button onClick={login} style={{ padding: "10px", width: "95%" }}>
        Login
      </button>
    </div>
  );
}