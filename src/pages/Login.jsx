import { useState } from "react";
import api from "../api";   // ✅ use api instead of axios
import { useNavigate } from "react-router-dom";

function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      const res = await api.post("/auth/login", form);

      console.log("LOGIN RESPONSE:", res.data);

      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);

        setIsLoggedIn(true);

        alert("Login success ✅");

        navigate("/dashboard");
      } else {
        alert("Invalid login ❌");
      }

    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err);
      alert("Login failed ❌");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
      /><br/><br/>

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
      /><br/><br/>

      <button onClick={login}>Login</button>
    </div>
  );
}

export default Login;