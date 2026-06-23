import React, { useState } from "react";

import api from "../api";
import { CLINIC_NAME, DOCTOR_NAME, SHIFT_OPTIONS } from "../utils/clinicData";
import { playSectionSound } from "../utils/sound";

function Login({ onLogin }) {
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const selectedShift = SHIFT_OPTIONS.find((shift) => shift.id === selectedShiftId);

    if (!selectedShift) {
      setError("Please select morning shift or evening shift.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter the shift password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/login", {
        username: selectedShift.id,
        password: password.trim(),
      });

      const shift = {
        id: response.data.shiftId || selectedShift.id,
        label: response.data.shiftName || selectedShift.label,
        doctorName: response.data.doctorName || selectedShift.doctorName,
      };
      const user = {
        username: response.data.username || selectedShift.id,
        name: response.data.name || shift.doctorName,
        role: response.data.role || "admin",
        shiftId: shift.id,
        shiftName: shift.label,
        doctorName: shift.doctorName,
      };

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("role", user.role);
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("shift", JSON.stringify(shift));
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
          <h2>Select shift</h2>
          <p>Choose the working shift and enter its password to continue.</p>
        </div>

        {error && <div className="notice danger">{error}</div>}

        <div className="shift-choice-grid" role="group" aria-label="Select shift">
          {SHIFT_OPTIONS.map((shift) => (
            <button
              key={shift.id}
              type="button"
              className={`shift-choice${selectedShiftId === shift.id ? " active" : ""}`}
              onClick={() => {
                setSelectedShiftId(shift.id);
                setError("");
                playSectionSound("section");
              }}
            >
              <strong>{shift.label}</strong>
              <span>{shift.doctorName}</span>
            </button>
          ))}
        </div>

        <label className="field">
          <span>Shift Password</span>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter selected shift password"
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
          <span>Morning shift opens Dr Tufyl records.</span>
          <span>Evening shift opens Dr Abdur Rehman records.</span>
        </div>
      </section>
    </main>
  );
}

export default Login;
