import React, { useState, useEffect } from "react";
import api from "../api";
import Layout from "../components/Layout";

function FIS() {

  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);

  const [patient, setPatient] = useState("");
  const [labCharge, setLabCharge] = useState("");
  const [discount, setDiscount] = useState("");

  const [rows, setRows] = useState([
    {
      treatment: "",
      doctor: "",
      qty: "",
      rate: ""
    }
  ]);

  const [total, setTotal] = useState(0);
  const [final, setFinal] = useState(0);
  const [doctorShare, setDoctorShare] = useState(0);
  const [owner, setOwner] = useState(0);

  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState(null);

  const [viewData, setViewData] = useState(null);

  useEffect(() => {

    loadPatients();

    loadData();

  }, []);

  const loadPatients = async () => {

    const res = await api.get("/patients/");

    setPatients(res.data || []);
  };

  const loadData = async () => {

    const res = await api.get("/fis/billing");

    setRecords(res.data || []);
  };

  // =========================
  // ROW CHANGE
  // =========================
  const handleRowChange = (
    index,
    field,
    value
  ) => {

    const updated = [...rows];

    updated[index][field] = value;

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
  // CALCULATE
  // =========================
  const calculate = (
    data = rows
  ) => {

    let t = 0;

    data.forEach(r => {

      const rate =
        Number(r.rate) || 0;

      // 🔥 FIXED
      // QTY DOES NOT MULTIPLY
      t += rate;
    });

    const disc =
      Number(discount) || 0;

    const f = t - disc;

    setTotal(t);

    setFinal(f);

    const lab =
      Number(labCharge) || 0;

    const doc =
      (f - lab) * 0.25;

    setDoctorShare(doc);

    setOwner(
      f - doc - lab
    );
  };

  useEffect(() => {

    calculate();

  }, [discount, labCharge]);

  // =========================
  // SAVE
  // =========================
  const save = async () => {

    try {

      if (!patient)
        return alert(
          "Select patient ❗"
        );

      const payload = {

        patient_name: patient,

        rows: rows.map(r => ({

          treatment:
            r.treatment,

          doctor:
            r.doctor,

          qty:
            r.qty,

          rate:
            r.rate

        })),

        total:
          Number(total) || 0,

        discount:
          Number(discount) || 0,

        amount:
          Number(final) || 0,

        final:
          Number(final) || 0,

        lab_charge:
          Number(labCharge) || 0
      };

      if (editId) {

        await api.put(
          "/fis/billing/" + editId,
          payload
        );

        alert("Updated ✅");

      } else {

        await api.post(
          "/fis/billing",
          payload
        );

        alert("Saved ✅");
      }

      // RESET
      setRows([
        {
          treatment: "",
          doctor: "",
          qty: "",
          rate: ""
        }
      ]);

      setLabCharge("");

      setDiscount("");

      setPatient("");

      setEditId(null);

      setTotal(0);

      setFinal(0);

      setDoctorShare(0);

      setOwner(0);

      loadData();

    } catch (err) {

      console.log(err);

      alert("Error ❌");
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteRecord = async (
    id
  ) => {

    if (
      !window.confirm(
        "Delete?"
      )
    )
      return;

    await api.delete(
      "/fis/billing/" + id
    );

    loadData();
  };

  // =========================
  // FILTER
  // =========================
  const filtered =
    records.filter(r =>
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
        FIS — Financial System
      </h1>

      {/* SEARCH */}
      <div style={{
        background: "white",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20
      }}>

        <input
          placeholder="Search Patient..."
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
      <div style={{
        background: "white",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20
      }}>

        <select
          onChange={(e)=>
            setPatient(
              e.target.value
            )
          }
          value={patient}
          style={{
            padding: 10,
            width: "100%"
          }}
        >

          <option value="">
            Select Patient
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

      {/* TABLE */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20
      }}>

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
                    onChange={(e)=>
                      handleRowChange(
                        i,
                        "treatment",
                        e.target.value
                      )
                    }
                    style={input}
                  />
                </td>

                <td>
                  <input
                    value={r.doctor}
                    onChange={(e)=>
                      handleRowChange(
                        i,
                        "doctor",
                        e.target.value
                      )
                    }
                    style={input}
                  />
                </td>

                <td>
                  <input
                    value={r.qty}
                    onChange={(e)=>
                      handleRowChange(
                        i,
                        "qty",
                        e.target.value
                      )
                    }
                    style={input}
                  />
                </td>

                <td>
                  <input
                    value={r.rate}
                    onChange={(e)=>
                      handleRowChange(
                        i,
                        "rate",
                        e.target.value
                      )
                    }
                    style={input}
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
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20
      }}>

        <input
          placeholder="Discount Amount"
          value={discount}
          onChange={(e)=>
            setDiscount(
              e.target.value
            )
          }
          style={{
            ...input,
            marginBottom: 10
          }}
        />

        <input
          placeholder="Lab Charges"
          value={labCharge}
          onChange={(e)=>
            setLabCharge(
              e.target.value
            )
          }
          style={input}
        />

        <div style={{
          marginTop: 20,
          lineHeight: "32px"
        }}>

          <b>Total:</b>
          {" "}Rs {total}

          <br/>

          <b>Discount:</b>
          {" "}Rs {discount || 0}

          <br/>

          <b>Final:</b>
          {" "}Rs {final}

          <br/>

          <b>Doctor Share:</b>
          {" "}Rs {doctorShare}

          <br/>

          <b>Lab Share:</b>
          {" "}Rs {labCharge || 0}

          <br/>

          <b>Owner:</b>
          {" "}Rs {owner}

        </div>

        <button
          onClick={save}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 6
          }}
        >
          {editId
            ? "Update Billing"
            : "Save Billing"}
        </button>

      </div>

      {/* RECORDS */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10
      }}>

        <h2>
          Records
        </h2>

        {filtered.map(r => (

          <div
            key={r._id}
            style={{
              borderBottom:
                "1px solid #eee",
              padding: 15,
              marginBottom: 10
            }}
          >

            <b style={{
              fontSize: 18
            }}>
              {r.patient_name}
            </b>

            <br/><br/>

            <b>Amount:</b>
            {" "}
            Rs {r.amount}

            <br/>

            <b>Lab Charges:</b>
            {" "}
            Rs {r.lab_charge || 0}

            <br/><br/>

            <button
              onClick={() => {

                setPatient(
                  r.patient_name
                );

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

                setLabCharge(
                  r.lab_charge || ""
                );

                setDiscount(
                  r.discount || ""
                );

                setEditId(r._id);

              }}
              style={{
                marginRight: 10
              }}
            >
              Edit
            </button>

            <button
              onClick={() =>
                setViewData(r)
              }
              style={{
                marginRight: 10
              }}
            >
              View
            </button>

            <button
              onClick={() =>
                deleteRecord(
                  r._id
                )
              }
            >
              Delete
            </button>

          </div>

        ))}

      </div>

      {/* MODAL */}
      {viewData && (

        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>

          <div style={{
            background: "white",
            width: "700px",
            maxHeight: "85vh",
            overflowY: "auto",
            borderRadius: 12,
            padding: 25
          }}>

            <div style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: 20
            }}>

              <h2>
                Billing Details
              </h2>

              <button
                onClick={() =>
                  setViewData(null)
                }
              >
                Close
              </button>

            </div>

            <b>Patient:</b>
            {" "}
            {viewData.patient_name}

            <br/><br/>

            <b>Total:</b>
            {" "}
            Rs {viewData.amount}

            <br/><br/>

            <table style={{
              width: "100%",
              borderCollapse:
                "collapse"
            }}>

              <thead>

                <tr>
                  <th style={th}>
                    Treatment
                  </th>

                  <th style={th}>
                    Doctor
                  </th>

                  <th style={th}>
                    Qty
                  </th>

                  <th style={th}>
                    Rate
                  </th>
                </tr>

              </thead>

              <tbody>

                {viewData.rows?.map((row, i) => (

                  <tr key={i}>

                    <td style={td}>
                      {row.treatment}
                    </td>

                    <td style={td}>
                      {row.doctor}
                    </td>

                    <td style={td}>
                      {row.qty}
                    </td>

                    <td style={td}>
                      Rs {row.rate}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </Layout>
  );
}

const input = {
  width: "100%",
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 6
};

const th = {
  border: "1px solid #ddd",
  padding: 12,
  textAlign: "left",
  background: "#f8fafc"
};

const td = {
  border: "1px solid #ddd",
  padding: 12
};

export default FIS;