import React, { useState } from "react";

function Invoice() {

  const [name, setName] = useState("");

  const BASE_URL = "https://https://pis-backend-final-1.onrender.com/api/api.onrender.com";

  return (
    <div style={{ padding: "20px" }}>

      <h2>Invoice Generation Module 🧾</h2>

      <p>
        This module allows you to generate printable PDF invoices for patients.
        Enter the patient name below and download the invoice instantly.
      </p>

      <input
        placeholder="Enter Patient Name"
        onChange={e => setName(e.target.value)}
      />

      <br/><br/>

      <a
        href={`${BASE_URL}/invoice-pdf/${name}`}
        target="_blank"
        rel="noreferrer"
      >
        Generate Invoice PDF
      </a>

    </div>
  );
}

export default Invoice;