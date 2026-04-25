import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard ✅</h1>

      <h3>Modules:</h3>

      <ul>
        <li><Link to="/patients">Patients</Link></li>
        <li><Link to="/fis">FIS</Link></li>
        <li><Link to="/cis">CIS</Link></li>
        <li><Link to="/checkup">Checkup</Link></li>
        <li><Link to="/reports">Reports</Link></li>
        <li><Link to="/visits">Visits</Link></li>
        <li><Link to="/invoice">Invoice</Link></li>
        <li><Link to="/lvi">LVI</Link></li>
        <li><Link to="/afi">AFI</Link></li>
        <li><Link to="/admin">Admin Users</Link></li>
      </ul>
    </div>
  );
}