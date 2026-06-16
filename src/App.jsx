import React, { useState, useEffect } from "react";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import PatientsList from "./pages/PatientsList";
import AccountStatus from "./pages/AccountStatus";

function App() {

  // LOGIN STATE
  const [token, setToken] = useState(
    sessionStorage.getItem("token") ||
    localStorage.getItem("token")
  );

  // ACTIVE PAGE
  const [activePage, setActivePage] =
    useState("dashboard");

  // CHECK TOKEN ON LOAD
  useEffect(() => {

    const savedToken =
      sessionStorage.getItem("token") ||
      localStorage.getItem("token");

    if (savedToken) {

      setToken(savedToken);

    }

  }, []);

  // LOGIN SUCCESS FUNCTION
  const handleLogin = (newToken) => {

    sessionStorage.setItem("token", newToken);
    localStorage.setItem("token", newToken);

    setToken(newToken);

  };

  // LOGOUT FUNCTION
  const handleLogout = () => {

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

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
