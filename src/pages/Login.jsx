import React, { useEffect, useState } from "react";

import api from "../api";
import { CLINIC_NAME, DOCTOR_NAME, SHIFT_OPTIONS } from "../utils/clinicData";
import { addActivityLog } from "../utils/activityLog";
import { playSectionSound } from "../utils/sound";

const ROLE_OPTIONS = [
  { id: "admin", label: "Admin", helper: "Full management workspace", tone: "admin" },
  { id: "receptionist", label: "Receptionist", helper: "Front desk workspace", tone: "receptionist" },
  { id: "dentist", label: "Dentist", helper: "Doctor client workspace", tone: "dentist" },
];

const DENTIST_OPTIONS = [
  { id: "dr-tufyl", label: "Dr Tufyl" },
  { id: "dr-abdur-rehman", label: "Dr Abdur Rehman" },
];

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
          ? "Invalid login details."
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

  const selectedShift = SHIFT_OPTIONS.find((shift) => shift.id === selectedShiftId);
  const selectedRoleOption = ROLE_OPTIONS.find((role) => role.id === selectedRole);
  const shouldShowRolePassword = selectedRole && (selectedRole !== "dentist" || selectedDentistId);

  return (
    <main className={`login-screen login-step-${step}`}>
      <section className="login-stage">
        <div className="login-center-brand">
          <div className="brand-mark large">H</div>
          <h1>{CLINIC_NAME}</h1>
        </div>

        <form className={`login-card${step !== "admin" ? " login-card-wide" : ""}`} onSubmit={formSubmitHandler}>
          <div className="login-card-header centered">
            <h2>{step === "admin" ? "Login" : step === "shift" ? "Select Shift" : "Select Account"}</h2>
            {step !== "admin" && <p>{step === "shift" ? "Choose your clinic shift." : "Choose the account to open."}</p>}
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
                {loading ? "Logging in..." : "Login"}
              </button>
            </>
          ) : step === "shift" ? (
            <>
              <div className="shift-choice-grid login-option-grid" role="group" aria-label="Select shift">
                {SHIFT_OPTIONS.map((shift) => (
                  <button
                    key={shift.id}
                    type="button"
                    className={`shift-choice login-tile${selectedShiftId === shift.id ? " active" : ""}`}
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

              {selectedShift && (
                <div className="login-access-panel">
                  <label className="field">
                    <span>{selectedShift.label} Password</span>
                    <div className="password-field">
                      <input
                        type={showShiftPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter shift password"
                        autoComplete="off"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="password-eye-button"
                        onClick={() => setShowShiftPassword((visible) => !visible)}
                        aria-label={showShiftPassword ? "Hide shift password" : "Show shift password"}
                      >
                        {showShiftPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </label>

                  <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                    {loading ? "Checking..." : "Continue"}
                  </button>
                </div>
              )}

              <div className="row-actions centered-actions">
                <button className="btn" type="button" onClick={goBackToAdmin}>
                  Back
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="shift-choice-grid role-choice-grid login-option-grid" role="group" aria-label="Select account">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`shift-choice login-tile role-tile ${role.tone}${selectedRole === role.id ? " active" : ""}`}
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
                      className={`shift-choice compact login-tile${selectedDentistId === dentist.id ? " active" : ""}`}
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

              {shouldShowRolePassword && (
                <div className="login-access-panel">
                  <label className="field">
                    <span>{selectedRoleOption?.label || "Account"} Password</span>
                    <div className="password-field">
                      <input
                        type={showRolePassword ? "text" : "password"}
                        value={roleCode}
                        onChange={(event) => setRoleCode(event.target.value)}
                        placeholder="Enter account password"
                        autoComplete="off"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="password-eye-button"
                        onClick={() => setShowRolePassword((visible) => !visible)}
                        aria-label={showRolePassword ? "Hide account password" : "Show account password"}
                      >
                        {showRolePassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </label>

                  <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                    {loading ? "Opening..." : "Open Account"}
                  </button>
                </div>
              )}

              <div className="row-actions centered-actions">
                <button className="btn" type="button" onClick={goBackToShift}>
                  Back
                </button>
              </div>
            </>
          )}

          <div className="login-help">
            <span>Authorized staff only.</span>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Login;
