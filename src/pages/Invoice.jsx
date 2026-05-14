import React, {
  useEffect,
  useState
} from "react";

import api from "../api";
import Layout from "../components/Layout";

/* =========================================
PRICE LIST
========================================= */

const PRICE_LIST = {

  "U/S & Polising": {
    "Category 1": 15000,
    "Category 2": 10000,
    "Category 3": 8000
  },

  "Root planing": {
    "Category 1": 20000,
    "Category 2": 15000,
    "Category 3": 10000
  },

  "L-Gingivectomy Pulpotomy": {
    "Category 1": 10000,
    "Category 2": 8000,
    "Category 3": 6000
  },

  "g-Gingivectomy": {
    "Category 1": 20000,
    "Category 2": 15000,
    "Category 3": 10000
  },

  "Epulis removal": {
    "Category 1": 15000,
    "Category 2": 12000,
    "Category 3": 10000
  },

  "Simple EXT": {
    "Category 1": 5000,
    "Category 2": 3000,
    "Category 3": 2000
  },

  "Complex EXT": {
    "Category 1": 7500,
    "Category 2": 5000,
    "Category 3": 3000
  },

  "Ceramic Crowns Veneer": { 
    "Category 1": 35000,
    "Category 2": 30000,
    "Category 3": 25000
  },	

  "Ceramic Crowns Per unit": { 
    "Category 1": 35000,
    "Category 2": 30000,
    "Category 3": 25000
  },	

  "Segurical EXT": {
    "Category 1": 15000,
    "Category 2": 10000,
    "Category 3": 7000
  },

  "impacted tooth EXT": {
    "Category 1": 25000,
    "Category 2": 15000,
    "Category 3": 10000
  },

  "Composite Build up": {
    "Category 1": 15000,
    "Category 2": 10000,
    "Category 3": 8000
  },

  "Fiber Post": {
    "Category 1": 5000,
    "Category 2": 3000,
    "Category 3": 2000
  },

  "MTA pulpotomy": {
    "Category 1": 20000,
    "Category 2": 10000,
    "Category 3": 8000
  }

};

function Invoice() {

  const [patients, setPatients] =
    useState([]);

  const [checkups, setCheckups] =
    useState([]);

  const [selectedPatient,
    setSelectedPatient] =
    useState(null);

  const [invoiceDate,
    setInvoiceDate] =
    useState(
      new Date()
      .toISOString()
      .split("T")[0]
    );

  const [invoiceNo] =
    useState("INV-00001");

  const [discount,
    setDiscount] =
    useState("");

  const [rows, setRows] =
    useState([
      {
        treatment: "",
        doctor: "",
        qty: 1,
        rate: 0
      }
    ]);

  useEffect(() => {

    loadPatients();

    loadCheckups();

  }, []);

  const loadPatients = async () => {

    const res =
      await api.get("/patients/");

    setPatients(res.data || []);

  };

  const loadCheckups = async () => {

    const res =
      await api.get("/checkups/");

    setCheckups(res.data || []);

  };

  const handlePatient = (id) => {

    const p =
      patients.find(
        x => x._id === id
      );

    setSelectedPatient(p);

  };

  const addRow = () => {

    setRows([
      ...rows,
      {
        treatment: "",
        doctor: "",
        qty: 1,
        rate: 0
      }
    ]);

  };

  const removeRow = (index) => {

    setRows(
      rows.filter(
        (_, i) => i !== index
      )
    );

  };

  const handleTreatment = (
    index,
    value
  ) => {

    const updated = [...rows];

    updated[index].treatment =
      value;

    updated[index].rate =
      PRICE_LIST[value]
      ?.["Category 1"] || 0;

    setRows(updated);

  };

  const handleRow = (
    index,
    field,
    value
  ) => {

    const updated = [...rows];

    updated[index][field] =
      value;

    setRows(updated);

  };

  const total =
    rows.reduce(
      (a, b) =>
        a +
        (
          Number(b.qty)
          *
          Number(b.rate)
        ),
      0
    );

  const final =
    total -
    Number(discount || 0);

  const patientCheckups =
    checkups.filter(
      c =>
        c.patient ===
        selectedPatient?._id
    );

  const saveInvoice = async () => {

    if (!selectedPatient) {

      alert(
        "Select Patient ❌"
      );

      return;

    }

    await api.post(
      "/invoice/",
      {
        invoice_no:
          invoiceNo,

        patient_name:
          selectedPatient.name,

        patient_id:
          selectedPatient._id,

        invoice_date:
          invoiceDate,

        rows,

        amount: total,

        discount
      }
    );

    alert("Invoice Saved ✅");

  };

 const generateHTML = (
  category
) => {

  const bills =
    rows.map(r => {

      const rate =
        PRICE_LIST[
          r.treatment
        ]?.[
          category
        ] || 0;

      return `
<tr>
<td>${r.treatment}</td>
<td>${r.qty}</td>
<td>${rate}</td>
<td>
${
  Number(r.qty)
  *
  Number(rate)
}
</td>
</tr>
`;

    }).join("");

  const totalAmount =
    rows.reduce(
      (a, b) =>
        a +
        (
          Number(b.qty)
          *
          Number(
            PRICE_LIST[
              b.treatment
            ]?.[
              category
            ] || 0
          )
        ),
      0
    );

  const finalAmount =
    totalAmount -
    Number(discount || 0);

  return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

@page{
  size:A4;
  margin:0;
}

body{
  font-family:Arial;
  background:white;
  margin:0;
  padding:0;
}

/* 🔥 MAIN PRINT AREA */

.invoice-wrapper{

  width:170mm;

  min-height:140mm;

  margin:auto;

  margin-top:75mm;

  padding:15mm;

  box-sizing:border-box;

}

/* 🔥 HEADER */

h1{
  text-align:center;
  color:#2563eb;
  margin-bottom:25px;
  font-size:28px;
}

/* 🔥 SECTION */

.section{
  border:2px solid #2563eb;
  margin-top:20px;
  border-radius:10px;
  overflow:hidden;
}

.title{
  background:#dbeafe;
  padding:10px;
  font-weight:bold;
  color:#2563eb;
}

table{
  width:100%;
  border-collapse:collapse;
}

th,td{
  border:1px solid #ddd;
  padding:10px;
  text-align:center;
  font-size:14px;
}

.badge{
  background:#2563eb;
  color:white;
  padding:6px 14px;
  border-radius:20px;
  display:inline-block;
  font-size:12px;
  font-weight:bold;
}

.summary td{
  font-size:15px;
}

</style>

</head>

<body>

<div class="invoice-wrapper">

<h1>HDC Invoice</h1>

<div style="display:flex;justify-content:space-between;">

<div>
<b>Patient:</b>
${selectedPatient?.name || "-"}
</div>

<div class="badge">
${category}
</div>

</div>

<div style="margin-top:15px;">
<b>Date:</b>
${invoiceDate}
</div>

<div class="section">

<div class="title">
BILLING DETAILS
</div>

<table>

<tr>
<th>Procedure</th>
<th>Qty</th>
<th>Rate</th>
<th>Amount</th>
</tr>

${bills}

</table>

</div>

<div class="section">

<div class="title">
SUMMARY
</div>

<table class="summary">

<tr>
<td>Total</td>
<td>${totalAmount}</td>
</tr>

<tr>
<td>Discount</td>
<td>${discount || 0}</td>
</tr>

<tr>
<td>Paid</td>
<td>0</td>
</tr>

<tr>
<td><b>Balance</b></td>
<td>
<b>
${finalAmount}
</b>
</td>
</tr>

</table>

</div>

</div>

</body>

</html>

`;


  };

  const viewInvoice = (
    category
  ) => {

    const win =
      window.open(
        "",
        "_blank"
      );

    win.document.write(
      generateHTML(category)
    );

    win.document.close();

  };

  const printInvoice = async (
  category
) => {

  if (!selectedPatient) {

    alert("Select Patient ❌");

    return;

  }

  // 🔥 SAVE INVOICE FIRST
  await api.post(
    "/invoice/",
    {
      invoice_no:
        invoiceNo,

      patient_name:
        selectedPatient.name,

      patient_id:
        selectedPatient._id,

      invoice_date:
        invoiceDate,

      rows,

      amount:
        rows.reduce(
          (a, b) =>
            a +
            (
              Number(b.qty)
              *
              Number(
                PRICE_LIST[
                  b.treatment
                ]?.[
                  category
                ] || 0
              )
            ),
          0
        ),

      discount,

      paid: 0,

      category
    }
  );

  // 🔥 OPEN BACKEND PDF
  window.open(

    `http://localhost:8000/invoice/pdf/${selectedPatient._id}`,

    "_blank"

  );

};

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        Invoice System 🧾
      </h1>

      <div style={card}>

        <div style={topGrid}>

          <div>

            <label>
              Invoice No
            </label>

            <input
              value={invoiceNo}
              readOnly
              style={input}
            />

          </div>

          <div>

            <label>
              Invoice Date
            </label>

            <input
              type="date"
              value={invoiceDate}
              onChange={(e)=>
                setInvoiceDate(
                  e.target.value
                )
              }
              style={input}
            />

          </div>

          <div>

            <label>
              Select Patient
            </label>

            <select
              onChange={(e)=>
                handlePatient(
                  e.target.value
                )
              }
              style={input}
            >

              <option value="">
                Select Patient
              </option>

              {patients.map(p => (

                <option
                  key={p._id}
                  value={p._id}
                >
                  {p.name}
                </option>

              ))}

            </select>

          </div>

        </div>

      </div>

      {selectedPatient && (

        <div style={card}>

          <h3>
            Bio Data
          </h3>

          <div style={bioGrid}>

            <Info
              label="Patient"
              value={
                selectedPatient.name
              }
            />

            <Info
              label="Phone"
              value={
                selectedPatient.mobile_number
              }
            />

            <Info
              label="Address"
              value={
                selectedPatient.address
              }
            />

            <Info
              label="Age"
              value={
                selectedPatient.age
              }
            />

          </div>

        </div>

      )}

      {selectedPatient && (

        <div style={card}>

          <h3>
            Checkup
          </h3>

          {patientCheckups.map((c, i) => (

            <div
              key={i}
              style={{
                borderBottom:
                  "1px solid #eee",
                marginBottom: 12,
                paddingBottom: 10
              }}
            >

              <p>

                <b>
                  Complaint:
                </b>

                {" "}

                {c.complaint}

              </p>

              {c.tasks?.map(
                (t, idx) => (

                <p key={idx}>

                  Tooth {t.tooth}

                  {" → "}

                  {t.treatment}

                </p>

              ))}

            </div>

          ))}

        </div>

      )}

      <div style={card}>

        <h3>
          Invoice
        </h3>

        <table style={{
          width: "100%"
        }}>

          <thead>

            <tr>

              <th>
                Treatment
              </th>

              <th>
                Doctor
              </th>

              <th>
                Qty
              </th>

              <th>
                Rate
              </th>

              <th>
                Total
              </th>

              <th></th>

            </tr>

          </thead>

          <tbody>

            {rows.map((r, i) => (

              <tr key={i}>

                <td>

                  <input
                    list={`treatment-${i}`}
                    value={r.treatment}
                    placeholder="Search Treatment"
                    onChange={(e)=>
                      handleTreatment(
                        i,
                        e.target.value
                      )
                    }
                    style={tableInput}
                  />

                  <datalist
                    id={`treatment-${i}`}
                  >

                    {Object.keys(
                      PRICE_LIST
                    ).map(item => (

                      <option
                        key={item}
                        value={item}
                      />

                    ))}

                  </datalist>

                </td>

                <td>

                  <input
                    value={r.doctor}
                    onChange={(e)=>
                      handleRow(
                        i,
                        "doctor",
                        e.target.value
                      )
                    }
                    style={tableInput}
                  />

                </td>

                <td>

                  <input
                    type="number"
                    value={r.qty}
                    onChange={(e)=>
                      handleRow(
                        i,
                        "qty",
                        e.target.value
                      )
                    }
                    style={tableInput}
                  />

                </td>

                <td>

                  {r.rate}

                </td>

                <td>

                  {
                    Number(r.qty)
                    *
                    Number(r.rate)
                  }

                </td>

                <td>

                  <button
                    onClick={() =>
                      removeRow(i)
                    }
                    style={deleteBtn}
                  >
                    X
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        <button
          onClick={addRow}
          style={addBtn}
        >
          + Add Row
        </button>

      </div>

      <div style={card}>

        <input
          placeholder="Discount"
          value={discount}
          onChange={(e)=>
            setDiscount(
              e.target.value
            )
          }
          style={input}
        />

        <div style={{
          marginTop: 20
        }}>

          <h2>
            Total:
            {total}
          </h2>

          <h2>
            Final:
            {final}
          </h2>

        </div>

      </div>

      <div style={previewGrid}>

        {[
          "Category 1",
          "Category 2",
          "Category 3"
        ].map(category => {

          const categoryRows =
            rows.map(r => {

              return {

                ...r,

                categoryRate:
                  PRICE_LIST[
                    r.treatment
                  ]?.[
                    category
                  ] || 0

              };

            });

          const categoryTotal =
            categoryRows.reduce(
              (a, b) =>
                a +
                (
                  Number(b.qty)
                  *
                  Number(
                    b.categoryRate
                  )
                ),
              0
            );

          return (

            <div
              key={category}
              style={invoiceCard}
            >

              <div style={invoiceHeader}>

                <div>

                  <h2 style={{
                    margin: 0,
                    color: "#2563eb"
                  }}>
                    HDC
                  </h2>

                  <p style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#64748b"
                  }}>
                    Holistic Domain of Creativity
                  </p>

                </div>

                <div style={{
                  textAlign: "right"
                }}>

                  <h3 style={{
                    margin: 0
                  }}>
                    INVOICE
                  </h3>

                  <p style={{
                    margin: 0,
                    fontSize: 12
                  }}>
                    {invoiceNo}
                  </p>

                </div>

              </div>

              <div style={{
                marginTop: 20,
                marginBottom: 20
              }}>

                <div style={infoRow}>

                  <span>
                    Patient
                  </span>

                  <strong>
                    {
                      selectedPatient
                      ?.name || "-"
                    }
                  </strong>

                </div>

                <div style={infoRow}>

                  <span>
                    Date
                  </span>

                  <strong>
                    {invoiceDate}
                  </strong>

                </div>

                <div style={infoRow}>

                  <span>
                    Category
                  </span>

                  <strong>
                    {category}
                  </strong>

                </div>

              </div>

              <div style={{
                border:
                  "1px solid #e2e8f0",
                borderRadius: 10,
                overflow: "hidden"
              }}>

                <div style={tableHead}>

                  <div>
                    Treatment
                  </div>

                  <div>
                    Qty
                  </div>

                  <div>
                    Price
                  </div>

                </div>

                {categoryRows.map(
                  (r, i) => (

                  <div
                    key={i}
                    style={tableRow}
                  >

                    <div>

                      <strong>
                        {
                          r.treatment ||
                          "-"
                        }
                      </strong>

                      <br/>

                      <small style={{
                        color:
                          "#64748b"
                      }}>

                        Doctor:
                        {" "}
                        {
                          r.doctor ||
                          "-"
                        }

                      </small>

                    </div>

                    <div>
                      {r.qty}
                    </div>

                    <div>

                      {
                        Number(r.qty)
                        *
                        Number(
                          r.categoryRate
                        )
                      }

                    </div>

                  </div>

                ))}

              </div>

              <div style={invoiceTotal}>

                <span>
                  Total
                </span>

                <h2 style={{
                  margin: 0
                }}>
                  {categoryTotal}
                </h2>

              </div>

              <div style={{
                display: "flex",
                gap: 10,
                marginTop: 20
              }}>

                <button
                  style={viewBtn}
                  onClick={() =>
                    viewInvoice(
                      category
                    )
                  }
                >
                  View
                </button>

                <button
                  style={pdfBtn}
                  onClick={() =>
                    printInvoice(
                      category
                    )
                  }
                >
                  PDF
                </button>

              </div>

            </div>

          );

        })}

      </div>

      <button
        onClick={saveInvoice}
        style={saveBtn}
      >
        Save Invoice
      </button>

    </Layout>

  );

}

function Info({
  label,
  value
}) {

  return (

    <div>

      <p style={{
        fontSize: 12,
        color: "#64748b"
      }}>
        {label}
      </p>

      <h4>
        {value || "-"}
      </h4>

    </div>

  );

}

const card = {

  background: "white",

  padding: 20,

  borderRadius: 12,

  marginBottom: 20,

  boxShadow:
    "0 2px 6px rgba(0,0,0,0.05)"

};

const input = {

  width: "100%",

  padding: 12,

  border:
    "1px solid #cbd5e1",

  borderRadius: 8

};

const tableInput = {

  width: "100%",

  padding: 10,

  border:
    "1px solid #cbd5e1",

  borderRadius: 8

};

const topGrid = {

  display: "grid",

  gridTemplateColumns:
    "1fr 1fr 1fr",

  gap: 20

};

const bioGrid = {

  display: "grid",

  gridTemplateColumns:
    "repeat(4,1fr)",

  gap: 20

};

const previewGrid = {

  display: "grid",

  gridTemplateColumns:
    "1fr 1fr 1fr",

  gap: 20,

  marginBottom: 20

};

const invoiceCard = {

  background: "white",

  borderRadius: 18,

  padding: 24,

  boxShadow:
    "0 4px 15px rgba(0,0,0,0.06)",

  border:
    "1px solid #e2e8f0"

};

const invoiceHeader = {

  display: "flex",

  justifyContent:
    "space-between",

  alignItems: "center",

  borderBottom:
    "1px solid #e2e8f0",

  paddingBottom: 15

};

const infoRow = {

  display: "flex",

  justifyContent:
    "space-between",

  marginBottom: 10,

  fontSize: 14

};

const tableHead = {

  display: "grid",

  gridTemplateColumns:
    "2fr 1fr 1fr",

  background: "#2563eb",

  color: "white",

  padding: 12,

  fontWeight: "bold"

};

const tableRow = {

  display: "grid",

  gridTemplateColumns:
    "2fr 1fr 1fr",

  padding: 12,

  borderTop:
    "1px solid #e2e8f0",

  alignItems: "center"

};

const invoiceTotal = {

  marginTop: 20,

  display: "flex",

  justifyContent:
    "space-between",

  alignItems: "center",

  borderTop:
    "2px dashed #cbd5e1",

  paddingTop: 15

};

const addBtn = {

  marginTop: 15,

  padding:
    "10px 18px",

  background: "#16a34a",

  color: "white",

  border: "none",

  borderRadius: 8

};

const saveBtn = {

  padding:
    "12px 24px",

  background: "#2563eb",

  color: "white",

  border: "none",

  borderRadius: 8,

  marginBottom: 20

};

const deleteBtn = {

  background: "#ef4444",

  color: "white",

  border: "none",

  borderRadius: 6,

  padding:
    "6px 10px"

};

const viewBtn = {

  background: "#2563eb",

  color: "white",

  border: "none",

  padding:
    "10px 18px",

  borderRadius: 8,

  cursor: "pointer"

};

const pdfBtn = {

  background: "#ef4444",

  color: "white",

  border: "none",

  padding:
    "10px 18px",

  borderRadius: 8,

  cursor: "pointer"

};

export default Invoice;