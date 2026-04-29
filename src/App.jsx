import React, { useState } from "react";
import Patients from "./pages/Patients";
import AFI from "./pages/AFI";
import CIS from "./pages/CIS";
import FIS from "./pages/FIS";
import Invoice from "./pages/Invoice";
import Reports from "./pages/Reports";
import Visits from "./pages/Visits";

function App() {
  const [page, setPage] = useState("patients");

  return (
    <div style={{ display: "flex" }}>

      {/* 🔥 SIDEBAR */}
      <div style={{
        width: "200px",
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px"
      }}>
        <h3>Dashboard</h3>

        <button onClick={() => setPage("patients")}>Patients</button><br/><br/>
        <button onClick={() => setPage("afi")}>AFI</button><br/><br/>
        <button onClick={() => setPage("cis")}>CIS</button><br/><br/>
        <button onClick={() => setPage("fis")}>FIS</button><br/><br/>
        <button onClick={() => setPage("invoice")}>Invoice</button><br/><br/>
        <button onClick={() => setPage("reports")}>Reports</button><br/><br/>
        <button onClick={() => setPage("visits")}>Visits</button><br/><br/>
      </div>

      {/* 🔥 MAIN CONTENT */}
      <div style={{ flex: 1, padding: "20px" }}>

        {page === "patients" && <Patients />}
        {page === "afi" && <AFI />}
        {page === "cis" && <CIS />}
        {page === "fis" && <FIS />}
        {page === "invoice" && <Invoice />}
        {page === "reports" && <Reports />}
        {page === "visits" && <Visits />}

      </div>

    </div>
  );
}

export default App;