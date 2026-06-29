import React, { useState } from "react";

import api from "../api";
import { CLINIC_NAME, DOCTOR_NAME, SHIFT_OPTIONS } from "../utils/clinicData";
import { playSectionSound } from "../utils/sound";

function Login({ onLogin }) {
  const [step, setStep] = useState("admin");
  const [username, setUsername] = useState("hdc1122");
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminSession, setAdminSession] = useState(null);

  const handleAdminLogin = async (event) => {
    event?.preventDefault();

    if (loading) {
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", {
        username: username.trim(),
        password: password.trim(),
      });

      if ((response.data.role || "admin") !== "admin") {
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
      setError("Login failed. Use username hdc1122 and password drzaffar.");
      playSectionSound("warning");
    } finally {
      setLoading(false);
    }
  };

  const handleShiftContinue = (event) => {
    event?.preventDefault();
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
      playSectionSound("warning");
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

  const goBackToAdmin = () => {
    setStep("admin");
    setPassword("");
    setSelectedShiftId("");
    setError("");
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
          <h1>{CLINIC_NAME}</h1>
          <p>
            Fast access to patient records, appointments, invoices, lab cases,
            expenses and revenue tracking.
          </p>
        </div>

        <div className="login-stats">
          <div>
            <strong>01</strong>
            <span>Patient command file</span>
          </div>
          <div>
            <strong>02</strong>
            <span>Morning shift</span>
          </div>
          <div>
            <strong>03</strong>
            <span>Evening shift</span>
          </div>
        </div>
      </section>

      <form className="login-card" onSubmit={step === "admin" ? handleAdminLogin : handleShiftContinue}>
        <div className="login-card-header">
          <div className="eyebrow">Authorized access</div>
          <h2>{step === "admin" ? "Admin login" : "Select shift"}</h2>
          <p>
            {step === "admin"
              ? "Login with the admin account first."
              : "Choose Morning or Evening shift and enter its password."}
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
                placeholder="hdc1122"
                autoComplete="username"
                autoFocus
              />
            </label>

            <label className="field">
              <span>Password</span>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
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
                  placeholder="Enter selected shift password"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="row-actions">
              <button className="btn" type="button" onClick={goBackToAdmin}>
                Back
              </button>
              <button className="btn btn-primary" type="submit">
                Continue
              </button>
            </div>
          </>
        )}

        <div className="login-help">
          {step === "admin" ? (
            <span>Username: hdc1122</span>
          ) : (
            <>
              <span>Morning shift password: 12345</span>
              <span>Evening shift password: 6789</span>
            </>
          )}
        </div>
      </form>
    </main>
  );
}

export default Login;
