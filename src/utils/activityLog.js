import api from "../api";

const LOCAL_LOG_KEY = "hdcActivityLogs";

const safeJson = (value, fallback) => {
  try {
    return JSON.parse(value || "");
  } catch (error) {
    return fallback;
  }
};

export const currentActor = () => {
  const user = safeJson(sessionStorage.getItem("user"), {}) || {};

  return {
    actor: user.name || "Staff",
    role: sessionStorage.getItem("role") || user.role || "staff",
    shift: user.shiftName || safeJson(sessionStorage.getItem("shift"), {})?.label || "",
  };
};

const saveLocalLog = (entry) => {
  const existing = safeJson(localStorage.getItem(LOCAL_LOG_KEY), []) || [];
  const next = [entry, ...existing].slice(0, 300);

  localStorage.setItem(LOCAL_LOG_KEY, JSON.stringify(next));
};

export const getLocalActivityLogs = () => safeJson(localStorage.getItem(LOCAL_LOG_KEY), []) || [];

export const addActivityLog = async (action, target = "", details = {}) => {
  const entry = {
    ...currentActor(),
    action,
    target,
    details,
    timestamp: new Date().toISOString(),
  };

  saveLocalLog(entry);

  try {
    await api.post("/activity-logs", entry);
  } catch (error) {
    console.warn("Activity log could not be saved to server.", error);
  }
};
