import React, { useState, useEffect } from "react";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import RoleDashboard from "./pages/RoleDashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import PatientsList from "./pages/PatientsList";
import AccountStatus from "./pages/AccountStatus";
import Inventory from "./pages/Inventory";
import Expenses from "./pages/Expenses";
import LabRecords from "./pages/LabRecords";
import DentistRevenue from "./pages/DentistRevenue";
import PlaceholderPage from "./pages/PlaceholderPage";
import PatientStatusPage from "./pages/PatientStatusPage";
import DentistWorkspace from "./pages/DentistWorkspace";
import AdminLogs from "./pages/AdminLogs";
import AdminFinance from "./pages/AdminFinance";
import Notifications from "./pages/Notifications";

const ROLE_PAGES = {
  admin: [
    "dashboard",
    "patients",
    "patients-list",
    "appointments",
    "lab-records",
    "account-status",
    "dentist-revenue",
    "account-payable",
    "account-receivable",
    "inventory",
    "expenses",
    "logs",
    "notifications",
  ],
  dentist: [
    "dashboard",
    "patients",
    "dentist-patients",
    "dentist-summary",
    "dentist-salary",
    "dentist-percentage",
    "dentist-referral",
  ],
  doctor: [
    "dashboard",
    "patients",
    "dentist-patients",
    "dentist-summary",
    "dentist-salary",
    "dentist-percentage",
    "dentist-referral",
  ],
  receptionist: [
    "dashboard",
    "patients",
    "patients-list",
    "appointments",
    "account-receivable",
    "lab-follow-up",
    "inventory-status",
    "maintenance",
    "refurbishing",
    "daily-expense",
    "ongoing-patients",
    "completed-patients",
    "official-contact",
  ],
};

const PLACEHOLDER_PAGES = {
  "lab-follow-up": {
    title: "Lab Cases Follow Up",
    eyebrow: "Receptionist",
    description: "Lab follow up format pending.",
  },
  "inventory-status": {
    title: "Inventory Status",
    eyebrow: "Receptionist",
    description: "Inventory status format pending.",
  },
  maintenance: {
    title: "Maintenance",
    eyebrow: "Receptionist",
    description: "Maintenance format pending.",
  },
  refurbishing: {
    title: "Refurbishing",
    eyebrow: "Receptionist",
    description: "Refurbishing format pending.",
  },
  "daily-expense": {
    title: "Daily Expense",
    eyebrow: "Receptionist",
    description: "Daily expense format pending.",
  },
  "official-contact": {
    title: "Official Contact",
    eyebrow: "Receptionist",
    description: "Official contact format pending.",
  },
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
    sessionStorage.removeItem("shift");

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
    if (currentRole !== "admin") {
      return (
        <RoleDashboard
          activePage={activePage}
          setActivePage={setActivePage}
          handleLogout={handleLogout}
        />
      );
    }

    return (
      <Dashboard
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  if (PLACEHOLDER_PAGES[activePage]) {
    return (
      <PlaceholderPage
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        {...PLACEHOLDER_PAGES[activePage]}
      />
    );
  }

  if (activePage === "ongoing-patients" || activePage === "completed-patients") {
    return (
      <PatientStatusPage
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        mode={activePage === "ongoing-patients" ? "ongoing" : "completed"}
      />
    );
  }

  if (
    activePage === "dentist-patients" ||
    activePage === "dentist-summary" ||
    activePage === "dentist-salary" ||
    activePage === "dentist-percentage" ||
    activePage === "dentist-referral"
  ) {
    const modeMap = {
      "dentist-patients": "patients",
      "dentist-summary": "summary",
      "dentist-salary": "salary",
      "dentist-percentage": "percentage",
      "dentist-referral": "referral",
    };

    return (
      <DentistWorkspace
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        mode={modeMap[activePage]}
      />
    );
  }

  if (activePage === "account-payable" || activePage === "account-receivable") {
    return (
      <AdminFinance
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        mode={activePage === "account-payable" ? "payable" : "receivable"}
      />
    );
  }

  if (activePage === "logs") {
    return (
      <AdminLogs
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );
  }

  if (activePage === "notifications") {
    return (
      <Notifications
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

  if (activePage === "lab-records") {

    return (
      <LabRecords
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

  if (activePage === "inventory") {

    return (
      <Inventory
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  if (activePage === "expenses") {

    return (
      <Expenses
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  if (activePage === "dentist-revenue") {

    return (
      <DentistRevenue
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  return null;

}

export default App;
