import React, { useState } from "react";

import api from "../api";
import { CLINIC_NAME, DOCTOR_NAME, SHIFT_OPTIONS } from "../utils/clinicData";
import { playSectionSound } from "../utils/sound";

function Login({ onLogin }) {
  const [step, setStep] = useState("admin");
  const [username, setUsername] = useState("admin");
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminSession, setAdminSession] = useState(null);

  const handleAdminLogin = async () => {
    if (!username.trim()) {
      setError("Please enter the admin username.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/login", {
        username: username.trim(),
        password: password.trim(),
      });

      if ((response.data.role || "admin") !== "admin" || response.data.shiftId) {
        setError("Please sign in with the admin account.");
        return;
      }

      const user = {
        username: response.data.username || username.trim(),
        name: response.data.name || "HDC Admin",
        role: response.data.role || "admin",
      };

      setAdminSession({
        token: response.data.token,
        user,
      });
      setPassword("");
      setSelectedShiftId("");
      setShowPassword(false);
      setStep("shift");
      playSectionSound("success");
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShiftContinue = () => {
    const selectedShift = SHIFT_OPTIONS.find((shift) => shift.id === selectedShiftId);

    if (!selectedShift) {
      setError("Please select morning shift or evening shift.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter the shift password.");
      return;
    }

    if (password.trim() !== selectedShift.password) {
      setError("Invalid shift password.");
      return;
    }

    if (!adminSession?.token) {
      setError("Please login with admin first.");
      setStep("admin");
      return;
    }

    const shift = {
      id: selectedShift.id,
      label: selectedShift.label,
      doctorName: selectedShift.doctorName,
    };
    const user = {
      ...adminSession.user,
      shiftId: shift.id,
      shiftName: shift.label,
      doctorName: shift.doctorName,
    };

    sessionStorage.setItem("token", adminSession.token);
    sessionStorage.setItem("role", user.role || "admin");
    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("shift", JSON.stringify(shift));
    playSectionSound("success");

    if (onLogin) {
      onLogin(adminSession.token);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (step === "admin") {
        handleAdminLogin();
      } else {
        handleShiftContinue();
      }
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
          <h2>{step === "admin" ? "Admin login" : "Select shift"}</h2>
          <p>
            {step === "admin"
              ? "Login with the admin account first."
              : "Choose the working shift and enter its password to continue."}
          </p>
        </div>

        {error && <div className="notice danger">{error}</div>}

        {step === "admin" ? (
          <>
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
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button className="btn btn-primary btn-full" onClick={handleAdminLogin} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </>
        ) : (
          <>
            <div className="shift-choice-grid" role="group" aria-label="Select shift">
              {SHIFT_OPTIONS.map((shift) => (
                <button
                  key={shift.id}
                  type="button"
                  className={`shift-choice${selectedShiftId === shift.id ? " active" : ""}`}
                  onClick={() => {
                    setSelectedShiftId(shift.id);
                    setPassword("");
                    setShowPassword(false);
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

            <button className="btn btn-primary btn-full" onClick={handleShiftContinue}>
              Continue
            </button>
          </>
        )}

        <div className="login-help">
          {step === "admin" ? (
            <span>Use admin access, then choose Morning or Evening shift.</span>
          ) : (
            <>
              <span>Morning shift opens Dr Tufyl records.</span>
              <span>Evening shift opens Dr Abdur Rehman records.</span>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default Login;
