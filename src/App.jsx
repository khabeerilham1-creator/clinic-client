import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Patients from "./pages/Patients";
import Visits from "./pages/Visits";
import AFI from "./pages/AFI";

// Existing modules
import FIS from "./pages/FIS";
import CIS from "./pages/CIS";
import Checkup from "./pages/Checkup";
import Reports from "./pages/Reports";
import Invoice from "./pages/Invoice";
import LVI from "./pages/LVI";

// ❌ Admin REMOVED (important)

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/patients" element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        } />

        <Route path="/visits" element={
          <ProtectedRoute>
            <Visits />
          </ProtectedRoute>
        } />

        <Route path="/afi" element={
          <ProtectedRoute>
            <AFI />
          </ProtectedRoute>
        } />

        <Route path="/fis" element={
          <ProtectedRoute>
            <FIS />
          </ProtectedRoute>
        } />

        <Route path="/cis" element={
          <ProtectedRoute>
            <CIS />
          </ProtectedRoute>
        } />

        <Route path="/checkup" element={
          <ProtectedRoute>
            <Checkup />
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />

        <Route path="/invoice" element={
          <ProtectedRoute>
            <Invoice />
          </ProtectedRoute>
        } />

        <Route path="/lvi" element={
          <ProtectedRoute>
            <LVI />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;