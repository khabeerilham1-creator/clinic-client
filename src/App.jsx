import React, { useState } from "react";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import PatientsList from "./pages/PatientsList";

function App() {

  const token =
    localStorage.getItem("token");

  const [activePage, setActivePage] =
    useState("dashboard");

  // LOGIN
  if (!token) {

    return <Login />;

  }

  // DASHBOARD
  if (activePage === "dashboard") {

    return (
      <Dashboard
        activePage={activePage}
        setActivePage={setActivePage}
      />
    );

  }

  // PATIENT ENTRY
  if (activePage === "patients") {

    return (
      <Patients
        activePage={activePage}
        setActivePage={setActivePage}
      />
    );

  }

  // APPOINTMENTS
  if (activePage === "appointments") {

    return (
      <Appointments
        activePage={activePage}
        setActivePage={setActivePage}
      />
    );

  }

  // PATIENTS RECORDS
  if (activePage === "patients-list") {

    return (
      <PatientsList
        activePage={activePage}
        setActivePage={setActivePage}
      />
    );

  }

  return null;
}

export default App;