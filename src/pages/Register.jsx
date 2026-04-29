import React, { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      const res = await fetch("https://https://pis-backend-final-1.onrender.com"https://pis-backend-final-1.onrender.com/api".onrender.com/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password,
          role: "office"
        })
      });

      const data = await res.json();
      console.log("REGISTER:", data);

      if (res.ok) {
        alert("Registered successfully. Wait for admin approval ✅");
        window.location.href = "/login";
      } else {
        alert(data.detail || "Error ❌");
      }

    } catch (err) {
      console.error(err);
      alert("Network Error ❌");
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
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
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