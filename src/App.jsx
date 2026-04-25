import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import FIS from "./pages/FIS";
import CIS from "./pages/CIS";
import Checkup from "./pages/Checkup";
import Reports from "./pages/Reports";
import Visits from "./pages/Visits";
import Invoice from "./pages/Invoice";
import LVI from "./pages/LVI";
import AFI from "./pages/AFI";
import AdminUsers from "./pages/AdminUsers";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Main Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/fis" element={<FIS />} />
        <Route path="/cis" element={<CIS />} />
        <Route path="/checkup" element={<Checkup />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/visits" element={<Visits />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/lvi" element={<LVI />} />
        <Route path="/afi" element={<AFI />} />
        <Route path="/admin" element={<AdminUsers />} />
      </Routes>
    </Router>
  );
}

export default App;