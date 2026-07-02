import React, { useState } from "react";

import api from "../api";
import { CLINIC_NAME, DOCTOR_NAME, SHIFT_OPTIONS } from "../utils/clinicData";
import { addActivityLog } from "../utils/activityLog";
import { playSectionSound } from "../utils/sound";

const ROLE_OPTIONS = [
  { id: "receptionist", label: "Receptionist", helper: "Front desk workspace" },
  { id: "dentist", label: "Dentist", helper: "Doctor patient workspace" },
  { id: "admin", label: "Admin", helper: "Full management workspace" },
];

const DENTIST_OPTIONS = [
  { id: "dr-tufyl", label: "Dr Tufyl" },
  { id: "dr-abdur-rehman", label: "Dr Abdur Rehman" },
];

function Login({ onLogin }) {
  const [step, setStep] = useState("admin");
  const [username, setUsername] = useState("");
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDentistId, setSelectedDentistId] = useState("");
  const [password, setPassword] = useState("");
  const [roleCode, setRoleCode] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showShiftPassword, setShowShiftPassword] = useState(false);
  const [showRolePassword, setShowRolePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminSession, setAdminSession] = useState(null);

  const handleAdminLogin = async (event) => {
    event?.preventDefault();

    if (loading) {
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError("Please enter your access details.");
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
      setStep("shift");
      playSectionSound("success");
    } catch (requestError) {
      console.error(requestError);
      setError("Login failed.");
      playSectionSound("warning");
    } finally {
      setLoading(false);
    }
  };

  const handleShiftContinue = async (event) => {
    event?.preventDefault();
    const selectedShift = SHIFT_OPTIONS.find((shift) => shift.id === selectedShiftId);

    if (!selectedShift) {
      setError("Please select morning shift or evening shift.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter the shift code.");
      return;
    }

    if (!adminSession?.token) {
      setError("Please login with admin first.");
      setStep("admin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/shift-access", {
        shiftId: selectedShift.id,
        accessCode: password.trim(),
      });
      const shift = {
        id: response.data.shiftId || selectedShift.id,
        label: response.data.shiftName || selectedShift.label,
        doctorName: response.data.doctorName || selectedShift.doctorName,
      };

      setAdminSession((current) => ({
        ...current,
        shift,
      }));
      setSelectedRole("");
      setSelectedDentistId("");
      setRoleCode("");
      setPassword("");
      setStep("role");
      playSectionSound("success");
    } catch (requestError) {
      console.error(requestError);
      setError("Invalid shift code.");
      playSectionSound("warning");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleContinue = async (event) => {
    event?.preventDefault();

    if (!selectedRole) {
      setError("Please select Receptionist, Dentist or Admin.");
      return;
    }

    if (selectedRole === "dentist" && !selectedDentistId) {
      setError("Please select a dentist.");
      return;
    }

    if (!roleCode.trim()) {
      setError("Please enter the access code.");
      return;
    }

    if (!adminSession?.token || !adminSession?.shift) {
      setError("Please login and select shift first.");
      setStep("admin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/role-access", {
        role: selectedRole,
        dentistId: selectedDentistId,
        accessCode: roleCode.trim(),
      });

      const shift = adminSession.shift;
      const roleData = response.data || {};
      const user = {
        ...adminSession.user,
        name: roleData.name || adminSession.user.name,
        role: roleData.role || selectedRole,
        shiftId: shift.id,
        shiftName: shift.label,
        doctorName: roleData.dentistName || shift.doctorName,
        dentistId: roleData.dentistId || selectedDentistId || "",
        dentistName: roleData.dentistName || "",
      };

      sessionStorage.setItem("token", adminSession.token);
      sessionStorage.setItem("role", user.role || "admin");
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("shift", JSON.stringify(shift));

      await addActivityLog("Login", user.role, {
        shift: shift.label,
        dentistName: user.dentistName,
      });

      playSectionSound("success");

      if (onLogin) {
        onLogin(adminSession.token);
      }
    } catch (requestError) {
      console.error(requestError);
      setError("Invalid access code.");
      playSectionSound("warning");
    } finally {
      setLoading(false);
    }
  };

  const goBackToAdmin = () => {
    setStep("admin");
    setPassword("");
    setSelectedShiftId("");
    setError("");
  };

  const goBackToShift = () => {
    setStep("shift");
    setSelectedRole("");
    setSelectedDentistId("");
    setRoleCode("");
    setError("");
  };

  const formSubmitHandler =
    step === "admin" ? handleAdminLogin : step === "shift" ? handleShiftContinue : handleRoleContinue;

  const cardTitle = step === "admin" ? "Admin login" : step === "shift" ? "Select shift" : "Select staff role";
  const cardCopy =
    step === "admin"
      ? "Login with the admin account first."
      : step === "shift"
        ? "Choose Morning or Evening shift and enter its access code."
        : "Choose the workspace and enter its access code.";

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

      <form className="login-card" onSubmit={formSubmitHandler}>
        <div className="login-card-header">
          <div className="eyebrow">Authorized access</div>
          <h2>{cardTitle}</h2>
          <p>{cardCopy}</p>
        </div>

        {error && <div className="notice danger">{error}</div>}

        {step === "admin" ? (
          <>
            <label className="field">
              <span>User ID</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter user ID"
                autoComplete="off"
                autoFocus
              />
            </label>

            <label className="field">
              <span>Access Code</span>
              <div className="password-field">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter access code"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="password-eye-button"
                  onClick={() => setShowAdminPassword((visible) => !visible)}
                  aria-label={showAdminPassword ? "Hide access code" : "Show access code"}
                >
                  {showAdminPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </>
        ) : step === "shift" ? (
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
              <span>Shift Code</span>
              <div className="password-field">
                <input
                  type={showShiftPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter selected shift code"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="password-eye-button"
                  onClick={() => setShowShiftPassword((visible) => !visible)}
                  aria-label={showShiftPassword ? "Hide shift code" : "Show shift code"}
                >
                  {showShiftPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="row-actions">
              <button className="btn" type="button" onClick={goBackToAdmin}>
                Back
              </button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Checking..." : "Continue"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="shift-choice-grid role-choice-grid" role="group" aria-label="Select staff role">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`shift-choice${selectedRole === role.id ? " active" : ""}`}
                  onClick={() => {
                    setSelectedRole(role.id);
                    setSelectedDentistId("");
                    setRoleCode("");
                    setError("");
                    playSectionSound("section");
                  }}
                >
                  <strong>{role.label}</strong>
                  <span>{role.helper}</span>
                </button>
              ))}
            </div>

            {selectedRole === "dentist" && (
              <div className="shift-choice-grid dentist-choice-grid" role="group" aria-label="Select dentist">
                {DENTIST_OPTIONS.map((dentist) => (
                  <button
                    key={dentist.id}
                    type="button"
                    className={`shift-choice compact${selectedDentistId === dentist.id ? " active" : ""}`}
                    onClick={() => {
                      setSelectedDentistId(dentist.id);
                      setRoleCode("");
                      setError("");
                      playSectionSound("section");
                    }}
                  >
                    <strong>{dentist.label}</strong>
                    <span>Dentist access</span>
                  </button>
                ))}
              </div>
            )}

            <label className="field">
              <span>Access Code</span>
              <div className="password-field">
                <input
                  type={showRolePassword ? "text" : "password"}
                  value={roleCode}
                  onChange={(event) => setRoleCode(event.target.value)}
                  placeholder="Enter role access code"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="password-eye-button"
                  onClick={() => setShowRolePassword((visible) => !visible)}
                  aria-label={showRolePassword ? "Hide role access code" : "Show role access code"}
                >
                  {showRolePassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="row-actions">
              <button className="btn" type="button" onClick={goBackToShift}>
                Back
              </button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Opening..." : "Open workspace"}
              </button>
            </div>
          </>
        )}

        <div className="login-help">
          <span>Authorized staff only.</span>
        </div>
      </form>
    </main>
  );
}

export default Login;
