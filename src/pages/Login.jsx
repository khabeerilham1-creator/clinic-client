import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await api.post("/auth/login", form);

    if (res.data.access_token) {
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);  // 🔥 role saved
      navigate("/dashboard");
    } else {
      alert("Login failed");
    }
  };

  return (
    <div style={{ padding: 50 }}>
      <h2>Login</h2>

      <input placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })} />

      <input placeholder="Password" type="password"
        onChange={(e) => setForm({ ...form, password: e.target.value })} />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}