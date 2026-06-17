import React, { useState } from "react";

import api from "../api";
import { CLINIC_NAME, DOCTOR_NAME } from "../utils/clinicData";
import { playSectionSound } from "../utils/sound";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/login", {
        username: username.trim(),
        password: password.trim(),
      });

      const user = {
        username: response.data.username || username.trim(),
        name: response.data.name || "HDC Admin",
        role: response.data.role || "admin",
      };

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("role", user.role);
      sessionStorage.setItem("user", JSON.stringify(user));
      playSectionSound("success");

      if (onLogin) {
        onLogin(response.data.token);
      }
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <main className="login-screen">
      <section className="login-visual">
        <div className="login-brand">
            <div className="brand-mark large">H</div>
            <div>
            <div className="brand-name">{CLINIC_NAME}</div>
            <div className="brand-meta">{DOCTOR_NAME}</div>
          </div>
        </div>

        <div className="login-copy">
          <div className="eyebrow">Clinic management workspace</div>
          <h1>Premium patient care starts here.</h1>
          <p>
            Secure access to patient records, appointments, invoices and clinic account
            status from one polished command center.
          </p>
        </div>

        <div className="login-stats">
          <div>
            <strong>01</strong>
            <span>Patient command file</span>
          </div>
          <div>
            <strong>02</strong>
            <span>Finance tracking</span>
          </div>
          <div>
            <strong>03</strong>
            <span>Planned sequence schedule</span>
          </div>
        </div>
      </section>

      <section className="login-card">
        <div className="login-card-header">
          <div className="eyebrow">Authorized access</div>
          <h2>Sign in</h2>
          <p>Enter your clinic credentials to continue.</p>
        </div>

        {error && <div className="notice danger">{error}</div>}

        <label className="field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="admin"
            autoComplete="username"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter password"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="login-help">
          <span>Admin: full access</span>
          <span>Receptionist/doctor: patient entry and appointments only</span>
        </div>
      </section>
    </main>
  );
}

export default Login;
