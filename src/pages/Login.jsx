import React, { useState } from "react";
import axios from "axios";

function Login({ setIsLoggedIn }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios({
        method: "POST",
        url: "https://pis-backend-final-1.onrender.com/auth/login",
        data: {
          username,
          password
        },
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 15000
      });

      console.log("SUCCESS:", res.data);

      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
        setIsLoggedIn(true);
      } else {
        alert("Invalid credentials ❌");
      }

    } catch (err) {
      console.log("FULL ERROR:", err);

      if (err.code === "ECONNABORTED") {
        alert("Server waking up... try again ⏳");
      } else if (err.response) {
        alert("Login failed ❌");
      } else {
        alert("Network Error ❌ (backend unreachable)");
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br/><br/>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br/><br/>

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;