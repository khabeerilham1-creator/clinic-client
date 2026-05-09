import React, { useState, useEffect } from "react";
import api from "../api";
import Layout from "../components/Layout";

function Invoice() {

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {

    try {

      const res = await api.get("/fis/billing");

      setRecords(res.data || []);

    } catch (err) {

      console.log(err);
    }
  };

  const filteredRecords = records.filter(r =>
    r.patient_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        Invoice System 🧾
      </h1>

      {/* SEARCH */}
      <div style={card}>

        <input
          type="text"
          placeholder="🔍 Search Patient"
          value={search}
          onChange={(e)=>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc"
          }}
        />

      </div>

      {/* SAVED INVOICES */}
      <div style={card}>

        <h2>Saved Invoices</h2>

        {filteredRecords.map(r => (

          <div
            key={r._id}
            style={{
              borderBottom:
                "1px solid #eee",
              padding: 15
            }}
          >

            <h3>
              {r.patient_name}
            </h3>

            <p>
              <strong>
                Procedure:
              </strong>
              {" "}
              {r.procedure}
            </p>

            <p>
              <strong>
                Amount:
              </strong>
              {" "}
              Rs {r.amount}
            </p>

            <a
              href={`${api.defaults.baseURL}/invoice/pdf/${encodeURIComponent(r.patient_name)}`}
              target="_blank"
              rel="noreferrer"
            >

              <button
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                Generate Invoice PDF
              </button>

            </a>

          </div>

        ))}

      </div>

    </Layout>
  );
}

const card = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
  boxShadow:
    "0 2px 6px rgba(0,0,0,0.05)"
};

export default Invoice;