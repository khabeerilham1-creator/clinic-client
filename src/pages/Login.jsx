import React, { useState } from "react";
import axios from "axios";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {

      const res = await axios.post(
        "https://pis-backend-final-1.onrender.com/auth/login",
        {
          username,
          password
        },
        {
          timeout: 10000 // 🔥 important for Render
        }
      );

      console.log(res.data);

      if (res.data.access_token) {
        alert("Login Success ✅");

        // OPTIONAL: store token
        localStorage.setItem("token", res.data.access_token);

      } else {
        alert("Invalid credentials ❌");
      }

    } catch (err) {

      console.log("ERROR:", err);

      // 🔥 Better error handling
      if (err.code === "ECONNABORTED") {
        alert("Server waking up... try again in 10 sec ⏳");
      } else if (err.response) {
        alert("Login failed ❌");
      } else {
        alert("Network error ❌ (backend not reachable)");
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