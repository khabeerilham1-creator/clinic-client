import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

// =========================
// PAGES
// =========================
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Patients from "./pages/Patients";
import Visits from "./pages/Visits";
import Checkup from "./pages/Checkup";

import AFI from "./pages/AFI";
import CIS from "./pages/CIS";
import Prescription from "./pages/Prescription";

import FIS from "./pages/FIS";
import Invoice from "./pages/Invoice";
import LVI from "./pages/LVI";

import Reports from "./pages/Reports";
import ReportView from "./pages/ReportView";

import PatientFiles from "./pages/PatientFiles";
import Timeline from "./pages/Timeline";

import AI from "./pages/AI";

// NEW MODULES
import ACC from "./pages/ACC";
import HAI from "./pages/HAI";
import Debtors from "./pages/Debtors";
import Creditors from "./pages/Creditors";
import Bills from "./pages/Bills";
import Salary from "./pages/Salary";

// 🚨 ALERT SYSTEM
import ARS from "./pages/ARS";

// 🔥 ACCOUNT STATUS
import PatientAccountStatus from "./pages/PatientAccountStatus";

// 🌍 CITY PATIENTS
import CityPatients from "./pages/CityPatients";

// ✅ COMPLETED CASES
import CompletedCases from "./pages/CompletedCases";

// ⏳ PENDING CASES
import PendingCases from "./pages/PendingCases";

// 📅 TO BE APPOINTED
import ToBeAppointed from "./pages/ToBeAppointed";

// 🚫 TO BE EXCEPTED
import ToBeExcepted from "./pages/ToBeExcepted";

// 🔥 PERMISSIONS
import Permissions from "./pages/Permissions";

import OldPatients from "./pages/OldPatients";

// =========================
// APP
// =========================
export default function App() {

  return (

    <Router>

      <Routes>

        {/* AUTH */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* CORE */}
        <Route
          path="/patients"
          element={<Patients />}
        />

        <Route
          path="/visits"
          element={<Visits />}
        />

        <Route
          path="/checkup"
          element={<Checkup />}
        />

        {/* TIMELINE */}
        <Route
          path="/timeline/:id"
          element={<Timeline />}
        />

        {/* CLINICAL */}
        <Route
          path="/afi"
          element={<AFI />}
        />

        <Route
          path="/cis"
          element={<CIS />}
        />

        <Route
          path="/prescription"
          element={<Prescription />}
        />

        {/* FINANCE */}
        <Route
          path="/fis"
          element={<FIS />}
        />

        <Route
          path="/invoice"
          element={<Invoice />}
        />

        <Route
          path="/lvi"
          element={<LVI />}
        />

        {/* 🚨 ALERT SYSTEM */}
        <Route
          path="/ars"
          element={<ARS />}
        />

        {/* 🔥 ACCOUNT STATUS */}
        <Route
          path="/patient-account-status"
          element={<PatientAccountStatus />}
        />

        {/* 🌍 CITY PATIENTS */}
        <Route
          path="/city-patients"
          element={<CityPatients />}
        />

        {/* ✅ COMPLETED CASES */}
        <Route
          path="/completed-cases"
          element={<CompletedCases />}
        />

        {/* ⏳ PENDING CASES */}
        <Route
          path="/pending-cases"
          element={<PendingCases />}
        />

        {/* 📅 TO BE APPOINTED */}
        <Route
          path="/to-be-appointed"
          element={<ToBeAppointed />}
        />

        {/* 🚫 TO BE EXCEPTED */}
        <Route
          path="/to-be-excepted"
          element={<ToBeExcepted />}
        />

        {/* REPORTS */}
        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/reports/:id"
          element={<ReportView />}
        />

        {/* FILES */}
        <Route
          path="/patient-files"
          element={<PatientFiles />}
        />

        {/* AI */}
        <Route
          path="/ai"
          element={<AI />}
        />

        {/* INTELLIGENCE */}
        <Route
          path="/acc"
          element={<ACC />}
        />

        <Route
          path="/hai"
          element={<HAI />}
        />

        {/* CONTROL */}
        <Route
          path="/debtors"
          element={<Debtors />}
        />

        <Route
          path="/creditors"
          element={<Creditors />}
        />

        <Route
          path="/bills"
          element={<Bills />}
        />

        <Route
          path="/salary"
          element={<Salary />}
        />

        {/* 🔥 PERMISSIONS */}
        <Route
          path="/permissions"
          element={<Permissions />}
        />

        <Route
         path="/old-patients"
         element={<OldPatients />}
        />

      </Routes>

    </Router>
  );
}