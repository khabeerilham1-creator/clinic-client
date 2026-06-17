import React, { useState, useEffect } from "react";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import PatientsList from "./pages/PatientsList";
import AccountStatus from "./pages/AccountStatus";

const ROLE_PAGES = {
  admin: ["dashboard", "patients", "patients-list", "appointments", "account-status"],
  doctor: ["patients", "appointments"],
  receptionist: ["patients", "appointments"],
};

const firstPageForRole = (role) => ROLE_PAGES[role]?.[0] || "dashboard";

function App() {

  // LOGIN STATE
  const [token, setToken] = useState(
    sessionStorage.getItem("token")
  );

  // ACTIVE PAGE
  const [activePage, setActivePage] =
    useState("dashboard");

  // CHECK TOKEN ON LOAD
  useEffect(() => {

    const savedToken =
      sessionStorage.getItem("token");

    if (savedToken) {

      setToken(savedToken);

    }

  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const role = sessionStorage.getItem("role") || "admin";
    const allowedPages = ROLE_PAGES[role] || ROLE_PAGES.admin;

    if (!allowedPages.includes(activePage)) {
      setActivePage(firstPageForRole(role));
    }
  }, [token, activePage]);

  // LOGIN SUCCESS FUNCTION
  const handleLogin = (newToken) => {

    sessionStorage.setItem("token", newToken);
    const role = sessionStorage.getItem("role") || "admin";

    setToken(newToken);
    setActivePage(firstPageForRole(role));

  };

  // LOGOUT FUNCTION
  const handleLogout = () => {

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");

    setToken(null);

  };

  // SHOW LOGIN PAGE FIRST
  if (!token) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );

  }

  const currentRole = sessionStorage.getItem("role") || "admin";
  const allowedPages = ROLE_PAGES[currentRole] || ROLE_PAGES.admin;

  if (!allowedPages.includes(activePage)) {
    return null;
  }

  // DASHBOARD
  if (activePage === "dashboard") {

    return (
      <Dashboard
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  // PATIENT ENTRY
  if (activePage === "patients") {

    return (
      <Patients
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  // APPOINTMENTS
  if (activePage === "appointments") {

    return (
      <Appointments
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  // PATIENTS RECORDS
  if (activePage === "patients-list") {

    return (
      <PatientsList
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  // ACCOUNT STATUS
  if (activePage === "account-status") {

    return (
      <AccountStatus
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  return null;

}

export default App;
