import React, { useEffect, useState } from "react";

import api from "../api";
import { SHIFT_OPTIONS } from "../utils/clinicData";
import { addActivityLog } from "../utils/activityLog";
import { playSectionSound } from "../utils/sound";

const ROLE_OPTIONS = [
  { id: "admin", label: "Admin", tone: "admin" },
  { id: "receptionist", label: "Receptionist", tone: "receptionist" },
  { id: "dentist", label: "Dentist", tone: "dentist" },
];

const dentistIdForShift = (shiftId) =>
  shiftId === "evening" ? "dr-abdur-rehman" : "dr-tufyl";

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

const apiPostWithRetry = async (url, payload) => {
  try {
    return await api.post(url, payload);
  } catch (error) {
    if (error?.response?.status) {
      throw error;
    }

    await wait(550);
    return api.post(url, payload);
  }
};

function Login({ onLogin }) {
  const [step, setStep] = useState("welcome");
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

  useEffect(() => {
    api.get("/", { timeout: 5000 }).catch(() => {});
  }, []);

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
      const response = await apiPostWithRetry("/login", {
        username: username.trim().toLowerCase(),
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
      setError(
        requestError?.response?.status === 401
          ? "Invalid username or password."
          : "Login service is not ready. Please try again."
      );
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
      const response = await apiPostWithRetry("/shift-access", {
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
      const response = await apiPostWithRetry("/role-access", {
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

      addActivityLog("Login", user.role, {
        shift: shift.label,
        dentistName: user.dentistName,
      }).catch((logError) => console.warn("Login activity could not be saved.", logError));

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

  const formSubmitHandler =
    step === "admin" ? handleAdminLogin : step === "shift" ? handleShiftContinue : handleRoleContinue;

  const selectedShift = SHIFT_OPTIONS.find((shift) => shift.id === selectedShiftId);
  const selectedRoleOption = ROLE_OPTIONS.find((role) => role.id === selectedRole);
  const screenMode =
    step === "welcome"
      ? "welcome"
      : step === "admin"
        ? "login"
        : step === "shift" && selectedShift
          ? "shift-password"
          : step === "shift"
            ? "shift"
            : selectedRole
              ? "account-password"
              : "account";
  const screenTone =
    screenMode === "shift-password" && selectedShift?.id
      ? `auth-shift-${selectedShift.id}`
      : screenMode === "account-password" && selectedRole
        ? `auth-role-${selectedRole}`
        : "";
  const backgroundImage =
    screenMode === "welcome"
      ? "/auth-assets/welcome.png"
      : screenMode === "login"
        ? "/auth-assets/login.png"
        : screenMode === "shift"
          ? "/auth-assets/shift.png"
          : screenMode === "shift-password"
            ? `/auth-assets/shift-${selectedShift?.id || "morning"}.png`
            : screenMode === "account"
              ? "/auth-assets/accounts.png"
              : `/auth-assets/account-${selectedRole || "admin"}.png`;

  const handleBack = () => {
    setError("");

    if (step === "admin") {
      setStep("welcome");
      return;
    }

    if (step === "shift" && selectedShift) {
      setSelectedShiftId("");
      setPassword("");
      return;
    }

    if (step === "shift") {
      setStep("admin");
      setPassword("");
      return;
    }

    if (step === "role" && selectedRole) {
      setSelectedRole("");
      setSelectedDentistId("");
      setRoleCode("");
      return;
    }

    if (step === "role") {
      setStep("shift");
      setSelectedShiftId("");
    }
  };

  return (
    <main
      className={`auth-screen auth-screen-${screenMode} ${screenTone}`}
      style={{ "--auth-bg": `url(${backgroundImage})` }}
    >
      {step !== "welcome" && (
        <button className="auth-back-button" type="button" onClick={handleBack} aria-label="Go back">
          <span aria-hidden="true" />
        </button>
      )}

      {error && <div className="auth-notice">{error}</div>}

      <section className={`auth-stage auth-stage-${screenMode}`}>
        {step === "welcome" ? (
          <button
            className="auth-welcome-next"
            type="button"
            onClick={() => {
              setError("");
              setStep("admin");
              playSectionSound("section");
            }}
            aria-label="Continue to login"
          >
            <span aria-hidden="true" />
          </button>
        ) : step === "admin" ? (
          <form className="auth-form auth-login-form" onSubmit={formSubmitHandler} autoComplete="off">
            <label className="auth-field">
              <span>username</span>
              <input
                name="hdc-user-access"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="new-password"
                spellCheck="false"
                autoFocus
              />
            </label>

            <label className="auth-field">
              <span>password</span>
              <div className="auth-password-field">
                <input
                  name="hdc-admin-access-code"
                  type={showAdminPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  spellCheck="false"
                />
                <button
                  type="button"
                  className="auth-eye-button"
                  onClick={() => setShowAdminPassword((visible) => !visible)}
                  aria-label={showAdminPassword ? "Hide password" : "Show password"}
                >
                  <span aria-hidden="true" />
                </button>
              </div>
            </label>

            <button className="auth-continue-button auth-login-button" type="submit" disabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : step === "shift" && !selectedShift ? (
          <div className="auth-choice-grid auth-shift-grid" role="group" aria-label="Select shift">
            {SHIFT_OPTIONS.map((shift) => (
              <button
                key={shift.id}
                type="button"
                className={`auth-image-choice auth-shift-choice ${shift.id}`}
                style={{ "--auth-choice-bg": `url(/auth-assets/shift-${shift.id}-card.png)` }}
                onClick={() => {
                  setSelectedShiftId(shift.id);
                  setPassword("");
                  setError("");
                  playSectionSound("section");
                }}
                aria-label={shift.label}
              >
                <span className="sr-only">{shift.label}</span>
              </button>
            ))}
          </div>
        ) : step === "shift" ? (
          <form className="auth-form auth-password-form" onSubmit={formSubmitHandler} autoComplete="off">
            <label className="auth-field">
              <span>{selectedShift.label} Password</span>
              <div className="auth-password-field">
                <input
                  name={`hdc-${selectedShift.id}-shift-code`}
                  type={showShiftPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  spellCheck="false"
                  autoFocus
                />
                <button
                  type="button"
                  className="auth-eye-button"
                  onClick={() => setShowShiftPassword((visible) => !visible)}
                  aria-label={showShiftPassword ? "Hide shift password" : "Show shift password"}
                >
                  <span aria-hidden="true" />
                </button>
              </div>
            </label>

            <button className="auth-continue-button" type="submit" disabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : !selectedRole ? (
          <div className="auth-choice-grid auth-account-grid" role="group" aria-label="Select account">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role.id}
                type="button"
                className={`auth-image-choice auth-account-choice ${role.tone}`}
                style={{ "--auth-choice-bg": `url(/auth-assets/account-${role.id}-card.png)` }}
                onClick={() => {
                  setSelectedRole(role.id);
                  setSelectedDentistId(role.id === "dentist" ? dentistIdForShift(adminSession?.shift?.id) : "");
                  setRoleCode("");
                  setError("");
                  playSectionSound("section");
                }}
                aria-label={role.label}
              >
                <span className="sr-only">{role.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <form className="auth-form auth-password-form" onSubmit={formSubmitHandler} autoComplete="off">
            <label className="auth-field">
              <span>{selectedRoleOption?.label || "Account"} Password</span>
              <div className="auth-password-field">
                <input
                  name={`hdc-${selectedRole || "account"}-access-code`}
                  type={showRolePassword ? "text" : "password"}
                  value={roleCode}
                  onChange={(event) => setRoleCode(event.target.value)}
                  autoComplete="new-password"
                  spellCheck="false"
                  autoFocus
                />
                <button
                  type="button"
                  className="auth-eye-button"
                  onClick={() => setShowRolePassword((visible) => !visible)}
                  aria-label={showRolePassword ? "Hide account password" : "Show account password"}
                >
                  <span aria-hidden="true" />
                </button>
              </div>
            </label>

            <button className="auth-continue-button" type="submit" disabled={loading}>
              {loading ? "Opening..." : "Continue"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default Login;
