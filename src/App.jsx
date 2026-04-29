import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";

// NEW MODULES
import Visits from "./pages/Visits";
import AFI from "./pages/AFI";
import FIS from "./pages/FIS";
import CIS from "./pages/CIS";
import Checkup from "./pages/Checkup";
import Reports from "./pages/Reports";
import Invoice from "./pages/Invoice";
import LVI from "./pages/LVI";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <Router>
      <Routes>

        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/dashboard" /> : <Login setIsLoggedIn={setIsLoggedIn} />
          }
        />

        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/patients"
          element={isLoggedIn ? <Patients setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />}
        />

        {/* NEW MODULE ROUTES */}
        <Route path="/visits" element={<Visits />} />
        <Route path="/afi" element={<AFI />} />
        <Route path="/fis" element={<FIS />} />
        <Route path="/cis" element={<CIS />} />
        <Route path="/checkup" element={<Checkup />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/lvi" element={<LVI />} />

      </Routes>
    </Router>
  );
}

export default App;