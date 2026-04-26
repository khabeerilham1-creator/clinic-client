import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await fetch("https://pis-python-backend.onrender.com/auth/login", {
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
      console.log("DATA:", data);

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);

        alert("Login Success ✅");
        navigate("/dashboard");
      } else {
        alert("Invalid credentials ❌");
      }

    } catch (err) {
      console.error("ERROR:", err);
      alert("Login Failed ❌");
    }
  };

  return (
    <div style={{ width: 320, margin: "100px auto", textAlign: "center" }}>
      <h2>Clinic Login</h2>

      <input
        placeholder="Email or Username"
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