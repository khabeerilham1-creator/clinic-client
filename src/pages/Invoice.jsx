import React, { useState, useEffect } from "react";
import api from "../api";
import Layout from "../components/Layout";

function Invoice() {

  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  // 🔥 LOAD DIRECTLY FROM FIS
  const loadInvoices = async () => {

    try {

      const res = await api.get(
        "/fis/billing"
      );

      const converted =
        (res.data || []).map(r => ({

          _id: r._id,

          patient_name:
            r.patient_name,

          amount:
            r.amount || 0,

          paid: 0,

          balance:
            r.amount || 0,

          procedure:
            r.procedure || "",

          doctor:
            r.doctor || ""
        }));

      setRecords(converted);

    } catch (err) {

      console.log(err);
    }
  };

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        Invoice System 🧾
      </h1>

      {/* LIST */}
      <div style={card}>

        <h2>
          Auto Generated Invoices
        </h2>

        {records.map(r => (

          <div
            key={r._id}
            style={{
              borderBottom:
                "1px solid #eee",
              padding: 15
            }}
          >

            <b>
              {r.patient_name}
            </b>

            <br/>

            <b>Procedure:</b>
            {" "}
            {r.procedure}

            <br/>

            <b>Doctor:</b>
            {" "}
            {r.doctor}

            <br/>

            <b>Total:</b>
            {" "}
            Rs {r.amount}

            <br/>

            <b>Balance:</b>
            {" "}
            Rs {r.balance}

            <br/><br/>

            <a
              href={`${api.defaults.baseURL}/invoice/pdf/${encodeURIComponent(r.patient_name)}`}
              target="_blank"
              rel="noreferrer"
            >

              <button
                style={{
                  padding:
                    "8px 14px",
                  background:
                    "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                PDF Invoice
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