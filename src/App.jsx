import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import AI from "./pages/AI";

// 🔥 NEW MODULES
import ACC from "./pages/ACC";
import HAI from "./pages/HAI";
import Debtors from "./pages/Debtors";
import Creditors from "./pages/Creditors";
import Bills from "./pages/Bills";
import Salary from "./pages/Salary";   // optional if created


// =========================
// APP
// =========================
export default function App() {
  return (
    <Router>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Login />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* CORE */}
        <Route path="/patients" element={<Patients />} />
        <Route path="/visits" element={<Visits />} />
        <Route path="/checkup" element={<Checkup />} />

        {/* CLINICAL */}
        <Route path="/afi" element={<AFI />} />
        <Route path="/cis" element={<CIS />} />
        <Route path="/prescription" element={<Prescription />} />

        {/* FINANCE */}
        <Route path="/fis" element={<FIS />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/lvi" element={<LVI />} />

        {/* REPORTS */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportView />} />

        {/* FILES */}
        <Route path="/patient-files" element={<PatientFiles />} />

        {/* AI */}
        <Route path="/ai" element={<AI />} />

        {/* 🔥 NEW SYSTEMS */}
        <Route path="/acc" element={<ACC />} />
        <Route path="/hai" element={<HAI />} />
        <Route path="/debtors" element={<Debtors />} />
        <Route path="/creditors" element={<Creditors />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/salary" element={<Salary />} />

      </Routes>
    </Router>
  );
}