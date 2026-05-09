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

// 🔥 PERMISSIONS
import Permissions from "./pages/Permissions";


// =========================
// APP
// =========================
export default function App() {

  return (

    <Router>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

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

        <Route
          path="/timeline/:id"
          element={<Timeline />}
        />

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

        <Route
          path="/patient-account-status"
          element={<PatientAccountStatus />}
        />

        <Route
          path="/city-patients"
          element={<CityPatients />}
        />

        <Route
          path="/completed-cases"
          element={<CompletedCases />}
        />

        <Route
          path="/pending-cases"
          element={<PendingCases />}
        />

        <Route
          path="/to-be-appointed"
          element={<ToBeAppointed />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/reports/:id"
          element={<ReportView />}
        />

        <Route
          path="/patient-files"
          element={<PatientFiles />}
        />

        <Route
          path="/ai"
          element={<AI />}
        />

        <Route
          path="/acc"
          element={<ACC />}
        />

        <Route
          path="/hai"
          element={<HAI />}
        />

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

        <Route
          path="/permissions"
          element={<Permissions />}
        />

      </Routes>

    </Router>
  );
}