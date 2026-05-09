import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

function Invoice() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);

  const [patient, setPatient] = useState("");

  const [rows, setRows] = useState([
    {
      treatment: "",
      doctor: "",
      qty: "",
      rate: ""
    }
  ]);

  const [payments, setPayments] = useState([
    {
      amount: "",
      method: ""
    }
  ]);

  const [discount, setDiscount] = useState("");

  const [total, setTotal] = useState(0);
  const [final, setFinal] = useState(0);

  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(() => {

    loadPatients();

    loadInvoices();

  }, []);

  const loadPatients = async () => {

    const res = await api.get("/patients/");

    setPatients(res.data);
  };

  const loadInvoices = async () => {

    const res = await api.get("/invoice/");

    setRecords(res.data);
  };

  // =========================
  // AUTO LOAD FIS
  // =========================
  const handlePatientChange = async (value) => {

    setPatient(value);

    try {

      const res = await api.get(
        "/fis/billing/" + value
      );

      const fis = res.data || [];

      if (!fis.length) {

        setRows([
          {
            treatment: "",
            doctor: "",
            qty: "",
            rate: ""
          }
        ]);

        calculate([]);

        return;
      }

      let loadedRows = [];

      fis.forEach(f => {

        // 🔥 MULTIPLE PROCEDURES
        if (Array.isArray(f.procedure)) {

          f.procedure.forEach(p => {

            loadedRows.push({

              treatment:
                p.treatment || "",

              doctor:
                p.doctor || "",

              qty:
                p.qty || 1,

              rate:
                p.rate || 0
            });

          });

        } else {

          loadedRows.push({

            treatment:
              f.procedure || "",

            doctor:
              f.doctor || "",

            qty: 1,

            rate:
              f.amount || 0
          });
        }

      });

      setRows(loadedRows);

      calculate(loadedRows);

    } catch (err) {

      console.log(err);

    }

  };

  // =========================
  // ROW CHANGE
  // =========================
  const handleRowChange = (
    i,
    field,
    value
  ) => {

    const updated = [...rows];

    updated[i][field] = value;

    setRows(updated);

    calculate(updated);
  };

  // =========================
  // ADD ROW
  // =========================
  const addRow = () => {

    setRows([
      ...rows,
      {
        treatment: "",
        doctor: "",
        qty: "",
        rate: ""
      }
    ]);
  };

  // =========================
  // REMOVE ROW
  // =========================
  const removeRow = (i) => {

    const updated = rows.filter(
      (_, idx) => idx !== i
    );

    setRows(updated);

    calculate(updated);
  };

  // =========================
  // PAYMENT
  // =========================
  const handlePaymentChange = (
    i,
    field,
    value
  ) => {

    const updated = [...payments];

    updated[i][field] = value;

    setPayments(updated);
  };

  const addPayment = () => {

    setPayments([
      ...payments,
      {
        amount: "",
        method: ""
      }
    ]);
  };

  // =========================
  // CALCULATE
  // =========================
  const calculate = (data = rows) => {

    let t = 0;

    data.forEach(r => {

      t += Number(r.rate) || 0;

    });

    const disc =
      Number(discount) || 0;

    setTotal(t);

    const f = t - disc;

    setFinal(f);
  };

  useEffect(() => {

    calculate();

  }, [discount]);

  // =========================
  // EDIT
  // =========================
  const handleEdit = (r) => {

    setPatient(r.patient_name);

    setRows(
      r.rows || [
        {
          treatment: "",
          doctor: "",
          qty: "",
          rate: ""
        }
      ]
    );

    setPayments(
      r.payments || [
        {
          amount: "",
          method: ""
        }
      ]
    );

    setDiscount(
      r.discount || ""
    );

    setEditId(r._id);
  };

  // =========================
  // SAVE
  // =========================
  const saveInvoice = async () => {

    try {

      if (!patient) {

        alert(
          "Select patient ❌"
        );

        return;
      }

      if (!rows.length) {

        alert(
          "Add treatment ❌"
        );

        return;
      }

      const payload = {

        patient_name: patient,

        rows,

        payments,

        amount: total,

        discount:
          Number(discount) || 0
      };

      if (editId) {

        await api.put(
          "/invoice/" + editId,
          payload
        );

      } else {

        await api.post(
          "/invoice/",
          payload
        );
      }

      alert("Saved ✅");

      setRows([
        {
          treatment: "",
          doctor: "",
          qty: "",
          rate: ""
        }
      ]);

      setPayments([
        {
          amount: "",
          method: ""
        }
      ]);

      setDiscount("");

      setPatient("");

      setEditId(null);

      loadInvoices();

    } catch (err) {

      console.log(err);

      alert("Error ❌");
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteInvoice = async (id) => {

    await api.delete(
      "/invoice/" + id
    );

    loadInvoices();
  };

  // =========================
  // SEARCH
  // =========================
  const filtered = records.filter(r =>
    r.patient_name
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      )
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
          placeholder="Search Invoice..."
          value={search}
          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: 10
          }}
        />

      </div>

      {/* PATIENT */}
      <div style={card}>

        <select
          value={patient}
          onChange={(e)=>
            handlePatientChange(
              e.target.value
            )
          }
        >

          <option value="">
            -- Select Patient --
          </option>

          {patients.map(p => (

            <option
              key={p._id}
              value={p.name}
            >
              {p.name}
            </option>

          ))}

        </select>

      </div>

      {/* BILLING */}
      <div style={card}>

        <h3>Billing</h3>

        <table style={{
          width: "100%"
        }}>

          <thead>

            <tr>
              <th>Treatment</th>
              <th>Doctor</th>
              <th>Qty</th>
              <th>Rate</th>
              <th></th>
            </tr>

          </thead>

          <tbody>

            {rows.map((r, i) => (

              <tr key={i}>

                <td>
                  <input
                    value={r.treatment}
                    onChange={e =>
                      handleRowChange(
                        i,
                        "treatment",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={r.doctor}
                    onChange={e =>
                      handleRowChange(
                        i,
                        "doctor",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={r.qty}
                    onChange={e =>
                      handleRowChange(
                        i,
                        "qty",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={r.rate}
                    onChange={e =>
                      handleRowChange(
                        i,
                        "rate",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>

                  <button
                    onClick={() =>
                      removeRow(i)
                    }
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
          style={{
            marginTop: 10
          }}
        >
          ➕ Add Row
        </button>

      </div>

      {/* SUMMARY */}
      <div style={card}>

        <input
          placeholder="Discount Amount"
          value={discount}
          onChange={(e)=>
            setDiscount(
              e.target.value
            )
          }
        />

        <div style={{
          marginTop: 15
        }}>

          <b>Total:</b>
          {" "}Rs {total}

          <br/>

          <b>Discount:</b>
          {" "}Rs {discount || 0}

          <br/>

          <b>Final:</b>
          {" "}Rs {final}

        </div>

      </div>

      {/* PAYMENTS */}
      <div style={card}>

        <h3>Payments</h3>

        {payments.map((p, i) => (

          <div
            key={i}
            style={{
              marginBottom: 10
            }}
          >

            <input
              placeholder="Amount"
              value={p.amount}
              onChange={e =>
                handlePaymentChange(
                  i,
                  "amount",
                  e.target.value
                )
              }
            />

            <select
              value={p.method}
              onChange={e =>
                handlePaymentChange(
                  i,
                  "method",
                  e.target.value
                )
              }
              style={{
                marginLeft: 10
              }}
            >

              <option value="">
                Method
              </option>

              <option value="Cash">
                Cash
              </option>

              <option value="Bank">
                Bank
              </option>

            </select>

          </div>

        ))}

        <button
          onClick={addPayment}
        >
          ➕ Add Payment
        </button>

      </div>

      {/* SAVE */}
      <button
        onClick={saveInvoice}
        style={{
          padding: "12px 25px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          marginBottom: 20
        }}
      >
        {editId
          ? "Update Invoice"
          : "Save Invoice"}
      </button>

      {/* LIST */}
      <div style={card}>

        <h2>
          Saved Invoices
        </h2>

        {filtered.map(r => (

          <div
            key={r._id}
            style={{
              borderBottom:
                "1px solid #eee",
              padding: 10
            }}
          >

            <b>
              {r.patient_name}
            </b>

            <br/>

            Amount:
            {" "}Rs {r.amount}

            <br/>

            Paid:
            {" "}Rs {r.paid}

            <br/>

            Balance:
            {" "}Rs {r.balance}

            <br/>

            <button
              onClick={() =>
                handleEdit(r)
              }
            >
              Edit ✏️
            </button>

            <a
              href={`${api.defaults.baseURL}/invoice/pdf/${encodeURIComponent(r.patient_name)}`}
              target="_blank"
              rel="noreferrer"
            >
              <button>
                PDF
              </button>
            </a>

            <button
              onClick={() =>
                deleteInvoice(
                  r._id
                )
              }
            >
              Delete ❌
            </button>

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