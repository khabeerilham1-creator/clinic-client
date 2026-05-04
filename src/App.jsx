import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

// 🔥 import all pages
import Patients from "./pages/Patients";
import Visits from "./pages/Visits";
import Checkup from "./pages/Checkup";
import AFI from "./pages/AFI";
import FIS from "./pages/FIS";
import CIS from "./pages/CIS";
import Reports from "./pages/Reports";
import Invoice from "./pages/Invoice";
import LVI from "./pages/LVI";

// ✅ EXISTING
import Prescription from "./pages/Prescription";

// 🔥 NEW IMPORTS (ALREADY IN YOUR SYSTEM)
import PatientFiles from "./pages/PatientFiles";
import Timeline from "./pages/Timeline";

// 🔥 ADD THIS (VERY IMPORTANT)
import PatientFileView from "./pages/PatientFileView";


function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />

        <Route path="/patients" element={<PrivateRoute><Patients /></PrivateRoute>} />
        <Route path="/visits" element={<PrivateRoute><Visits /></PrivateRoute>} />
        <Route path="/checkup" element={<PrivateRoute><Checkup /></PrivateRoute>} />
        <Route path="/afi" element={<PrivateRoute><AFI /></PrivateRoute>} />
        <Route path="/fis" element={<PrivateRoute><FIS /></PrivateRoute>} />
        <Route path="/cis" element={<PrivateRoute><CIS /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/invoice" element={<PrivateRoute><Invoice /></PrivateRoute>} />
        <Route path="/lvi" element={<PrivateRoute><LVI /></PrivateRoute>} />

        {/* ✅ EXISTING */}
        <Route path="/prescription" element={<PrivateRoute><Prescription /></PrivateRoute>} />

        {/* 🔥 PATIENT FILE LIST */}
        <Route path="/patient-files" element={<PrivateRoute><PatientFiles /></PrivateRoute>} />

        {/* 🔥 TIMELINE */}
        <Route path="/timeline/:id" element={<PrivateRoute><Timeline /></PrivateRoute>} />

        {/* 🔥 VERY IMPORTANT (FIXES YOUR 404 ERROR) */}
        <Route path="/patient-files/file/:id/:year" element={<PrivateRoute><PatientFileView /></PrivateRoute>} />

      </Routes>
    </BrowserRouter>
  );
}