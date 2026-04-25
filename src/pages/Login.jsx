import React, { useState } from "react";
import axios from "axios";

function Login() {

  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const login = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/login", data);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);

      window.location.href = "/";
    } catch {
      alert("Invalid username or password");
    }
  };

  return (
    <div style={container}>

      <div style={card}>

        <h2 style={{ marginBottom: "20px" }}>HDC Login</h2>

        <input
          style={input}
          placeholder="Username"
          onChange={(e)=>setData({...data, username:e.target.value})}
        />

        <input
          style={input}
          type="password"
          placeholder="Password"
          onChange={(e)=>setData({...data, password:e.target.value})}
        />

        <button style={loginBtn} onClick={login}>
          Login
        </button>

        <button
          style={registerBtn}
          onClick={()=>window.location.href="/register"}
        >
          Register
        </button>

      </div>

    </div>
  );
}

/* STYLES */

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f6f9"
};

const card = {
  width: "350px",
  padding: "30px",
  borderRadius: "10px",
  background: "#fff",
  boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "5px",
  border: "1px solid #ccc"
};

const loginBtn = {
  width: "100%",
  padding: "10px",
  background: "#2b4c7e",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  marginBottom: "10px",
  cursor: "pointer"
};

const registerBtn = {
  width: "100%",
  padding: "10px",
  background: "#ccc",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default Login;