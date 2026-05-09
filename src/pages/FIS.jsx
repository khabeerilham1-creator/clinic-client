import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

// 🔥 ADDED
import Layout from "../components/Layout";

function FIS() {

  const navigate = useNavigate();

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

  useEffect(() => {

    loadPatients();

    loadData();

  }, []);

  const loadPatients = async () => {

    const res = await api.get("/patients/");

    setPatients(res.data);
  };

  const loadData = async () => {

    const res = await api.get("/fis/billing");

    setRecords(res.data || []);
  };

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

  const removeRow = (i) => {

    const updated = rows.filter(
      (_, idx) => idx !== i
    );

    setRows(updated);

    calculate(updated);
  };

  const calculate = (
    data = rows
  ) => {

    let t = 0;

    data.forEach(r => {

      const rate =
        Number(r.rate) || 0;

      const qty =
        Number(r.qty) || 1;

      t += rate * qty;
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

        amount:
          Number(final) || 0,

        lab_charge:
          Number(labCharge) || 0
      };

      await api.post(
        "/fis/billing",
        payload
      );

      alert("Saved ✅");

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

      loadData();

    } catch (err) {

      console.log(err);

      alert("Error ❌");
    }
  };

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

  // 🔥 SEARCH
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
            padding: 8
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

      {/* FINANCIAL SUMMARY */}
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
            marginRight: 10
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
        />

        <div style={{
          marginTop: 20
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

          <b>Owner:</b>
          {" "}Rs {owner}

        </div>

        <button
          onClick={save}
          style={{
            marginTop: 15,
            padding: "10px 20px",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 6
          }}
        >
          Save Billing
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
              padding: 10
            }}
          >

            <b>
              {r.patient_name}
            </b>

            <br/><br/>

            {(r.rows || []).map(
              (row, idx) => (

                <div
                  key={idx}
                  style={{
                    marginBottom: 8
                  }}
                >
                  • {row.treatment}
                  {" — "}
                  {row.doctor}
                  {" — Qty: "}
                  {row.qty}
                  {" — Rs "}
                  {row.rate}
                </div>

              )
            )}

            <br/>

            <b>
              Amount:
            </b>
            {" "}Rs {r.amount}

            <br/><br/>

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

    </Layout>
  );
}

export default FIS;