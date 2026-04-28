import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {

  const navigate = useNavigate();

  // ✅ protect route
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Clinic Management Dashboard ✅</h1>

      <p>
        Welcome to the clinic management system. From here, you can access all
        major modules including patient records, clinical workflows, financial
        tracking, and administrative controls.
      </p>

      <h3>Available Modules:</h3>

      <ul>
        <li>
          <Link to="/patients">Patients</Link> – Manage patient records, history, and profiles
        </li>

        <li>
          <Link to="/fis">FIS</Link> – Full Intraoral Scan and dental analysis
        </li>

        <li>
          <Link to="/cis">CIS</Link> – Clinical Information System for treatment planning
        </li>

        <li>
          <Link to="/checkup">Checkup</Link> – Dental checkups and tooth condition tracking
        </li>

        <li>
          <Link to="/reports">Reports</Link> – Generate clinical and financial reports
        </li>

        <li>
          <Link to="/visits">Visits</Link> – Track patient visits and appointment history
        </li>

        <li>
          <Link to="/invoice">Invoice</Link> – Billing and payment management
        </li>

        <li>
          <Link to="/lvi">LVI</Link> – Lab and visual imaging data management
        </li>

        <li>
          <Link to="/afi">AFI</Link> – Appointment & Flow Intelligence system
        </li>

        <li>
          <Link to="/admin">Admin Users</Link> – Approve and manage system users
        </li>
      </ul>

      <p>
        Use the modules above to navigate through different parts of the system.
        Each section is designed to streamline clinic operations and improve efficiency.
      </p>

      {/* ✅ added logout */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
      >
        Logout
      </button>
    </div>
  );
}