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
import DailyExpense from "./pages/DailyExpense";
import Notifications from "./pages/Notifications";
import Messenger from "./pages/Messenger";
import LabFollowUp from "./pages/LabFollowUp";
import LedgerExpensePage from "./pages/LedgerExpensePage";
import {
  AcknowledgementTool,
  EntrySheet,
  InstallmentMode,
  Medications,
  PriceSheet,
} from "./pages/ClinicTools";

const ROLE_PAGES = {
  admin: [
    "dashboard",
    "entry-sheet",
    "patients",
    "patients-list",
    "appointments",
    "acknowledgement-sheet",
    "price-sheet",
    "medications",
    "installment-mode",
    "lab-records",
    "account-status",
    "dentist-revenue",
    "account-payable",
    "account-receivable",
    "inventory",
    "expenses",
    "ongoing-patients",
    "completed-patients",
    "to-be-appointed",
    "logs",
    "notifications",
    "messenger",
    "lab-follow-up",


  ],
  dentist: [
    "dashboard",
    "entry-sheet",
    "patients",
    "dentist-patients",
    "dentist-summary",
    "dentist-salary",
    "dentist-percentage",
    "dentist-referral",
    "appointments",
    "acknowledgement-sheet",
    "price-sheet",
    "medications",
    "installment-mode",
    "ongoing-patients",
    "completed-patients",
    "to-be-appointed",
    "notifications",
    "messenger",


  ],
  doctor: [
    "dashboard",
    "entry-sheet",
    "patients",
    "dentist-patients",
    "dentist-summary",
    "dentist-salary",
    "dentist-percentage",
    "dentist-referral",
    "appointments",
    "acknowledgement-sheet",
    "price-sheet",
    "medications",
    "installment-mode",
    "ongoing-patients",
    "completed-patients",
    "to-be-appointed",
    "notifications",
    "messenger",


  ],
  receptionist: [
    "dashboard",
    "entry-sheet",
    "patients",
    "patients-list",
    "appointments",
    "acknowledgement-sheet",
    "price-sheet",
    "medications",
    "installment-mode",
    "account-receivable",
    "lab-records",
    "dental-material",
    "lab-follow-up",
    "inventory-status",
    "maintenance",
    "refurbishing",
    "daily-expense",
    "ongoing-patients",
    "completed-patients",
    "to-be-appointed",
    "official-contact",
    "notifications",
    "messenger",


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

  const savedRole = sessionStorage.getItem("role") || "admin";
  const currentRole = ROLE_PAGES[savedRole] ? savedRole : "admin";
  const allowedPages = ROLE_PAGES[currentRole] || ROLE_PAGES.admin;
  const currentPage = allowedPages.includes(activePage) ? activePage : firstPageForRole(currentRole);

  // DASHBOARD
  if (currentPage === "dashboard") {
    if (currentRole !== "admin") {
      return (
        <RoleDashboard
          activePage={currentPage}
          setActivePage={setActivePage}
          handleLogout={handleLogout}
        />
      );
    }

    return (
      <Dashboard
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  if (currentPage === "entry-sheet") {
    return (
      <EntrySheet
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );
  }

  if (currentPage === "acknowledgement-sheet") {
    return (
      <AcknowledgementTool
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );
  }

  if (currentPage === "price-sheet") {
    return (
      <PriceSheet
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );
  }

  if (currentPage === "medications") {
    return (
      <Medications
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );
  }

  if (currentPage === "installment-mode") {
    return (
      <InstallmentMode
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );
  }


  if (currentPage === "lab-follow-up") {
    return (
      <LabFollowUp
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );
  }

  if (currentPage === "dental-material") {
    return (
      <Expenses
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        initialCategory="dental-material"
        allowedCategories={["dental-material"]}
      />
    );
  }

  if (currentPage === "messenger") {
    return (
      <Messenger
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );
  }

  if (currentPage === "maintenance" || currentPage === "refurbishing") {
    return (
      <LedgerExpensePage
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        category={currentPage}
        title={currentPage === "maintenance" ? "Maintainance Expense" : "Refurbishing Expense"}
      />
    );
  }

  if (PLACEHOLDER_PAGES[currentPage] && currentPage !== "daily-expense") {
    return (
      <PlaceholderPage
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        {...PLACEHOLDER_PAGES[currentPage]}
      />
    );
  }

  if (currentPage === "daily-expense") {
    return (
      <DailyExpense
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );
  }

  if (
    currentPage === "ongoing-patients" ||
    currentPage === "completed-patients" ||
    currentPage === "to-be-appointed"
  ) {
    return (
      <PatientStatusPage
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        mode={
          currentPage === "ongoing-patients"
            ? "ongoing"
            : currentPage === "completed-patients"
              ? "completed-cases"
              : "expected"
        }
      />
    );
  }

  if (
    currentPage === "dentist-patients" ||
    currentPage === "dentist-summary" ||
    currentPage === "dentist-salary" ||
    currentPage === "dentist-percentage" ||
    currentPage === "dentist-referral"
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
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        mode={modeMap[currentPage]}
      />
    );
  }

  if (currentPage === "account-payable" || currentPage === "account-receivable") {
    return (
      <AdminFinance
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        mode={currentPage === "account-payable" ? "payable" : "receivable"}
      />
    );
  }

  if (currentPage === "logs") {
    return (
      <AdminLogs
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );
  }

  if (currentPage === "notifications") {
    return (
      <Notifications
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );
  }

  // PATIENT ENTRY
  if (currentPage === "patients") {

    return (
      <Patients
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  // APPOINTMENTS
  if (currentPage === "appointments") {

    return (
      <Appointments
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  if (currentPage === "lab-records") {

    return (
      <LabRecords
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  // PATIENTS RECORDS
  if (currentPage === "patients-list") {

    return (
      <PatientsList
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  // ACCOUNT STATUS
  if (currentPage === "account-status") {

    return (
      <AccountStatus
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  if (currentPage === "inventory") {

    return (
      <Inventory
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  if (currentPage === "expenses") {

    return (
      <Expenses
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  if (currentPage === "dentist-revenue") {

    return (
      <DentistRevenue
        activePage={currentPage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />
    );

  }

  return null;

}

export default App;
