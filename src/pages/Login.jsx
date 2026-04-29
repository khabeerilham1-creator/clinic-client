import React, { useState } from "react";
import axios from "axios";

function Login({ setIsLoggedIn }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "https://pis-backend-final-1.onrender.com/auth/login",
        {
          username,
          password
        }
      );

      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
        setIsLoggedIn(true);
      } else {
        alert("Invalid ❌");
      }

    } catch (err) {
      console.log(err);
      alert("Login Failed ❌");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Clinic Login</h2>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Email"
      /><br/><br/>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      /><br/><br/>

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;