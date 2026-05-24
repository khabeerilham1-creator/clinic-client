import React, { useState, useEffect } from "react";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import PatientsList from "./pages/PatientsList";

function App() {

  // LOGIN STATE
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  // ACTIVE PAGE
  const [activePage, setActivePage] =
    useState("dashboard");

  // CHECK TOKEN ON LOAD
  useEffect(() => {

    const savedToken =
      localStorage.getItem("token");

    if (savedToken) {

      setToken(savedToken);

    }

  }, []);

  // LOGIN SUCCESS FUNCTION
  const handleLogin = (newToken) => {

    localStorage.setItem(
      "token",
      newToken
    );

    setToken(newToken);

  };

  // LOGOUT FUNCTION
  const handleLogout = () => {

    localStorage.removeItem("token");

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

  return null;

}

export default App;