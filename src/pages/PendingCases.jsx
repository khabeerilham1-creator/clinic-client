import {
  useEffect,
  useState
} from "react";

import api from "../api";

import Layout from "../components/Layout";

export default function PendingCases() {

  const [data, setData] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState({

      patient_name: "",
      mobile_number: "",
      address: "",
      amount: "",
      paid: "",
      balance: "",
      lab_charge: ""
    });

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    const res = await api.get(
      "/pending-cases/"
    );

    setData(res.data || []);
  };

  // =========================
  // MANUAL ADD
  // =========================
  const saveManual = async () => {

    await api.post(
      "/pending-cases/",
      form
    );

    alert("Pending case added ✅");

    setForm({

      patient_name: "",
      mobile_number: "",
      address: "",
      amount: "",
      paid: "",
      balance: "",
      lab_charge: ""
    });

    loadData();
  };

  // =========================
  // DELETE
  // =========================
  const deleteCase = async (
    id,
    source
  ) => {

    if (source === "auto") {

      return alert(
        "Auto tracked cases cannot be deleted"
      );
    }

    if (!window.confirm(
      "Delete case?"
    )) return;

    await api.delete(
      "/pending-cases/" + id
    );

    loadData();
  };

  const filtered = data.filter(
    (item) =>

      item.patient_name
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
        Pending Cases ⏳
      </h1>

      {/* MANUAL FORM */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20
      }}>

        <h3>
          Add Manual Pending Case
        </h3>

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2,1fr)",
          gap: 10
        }}>

          <input
            placeholder="Patient Name"
            value={form.patient_name}
            onChange={(e)=>
              setForm({
                ...form,
                patient_name:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Mobile"
            value={form.mobile_number}
            onChange={(e)=>
              setForm({
                ...form,
                mobile_number:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Address"
            value={form.address}
            onChange={(e)=>
              setForm({
                ...form,
                address:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Amount"
            value={form.amount}
            onChange={(e)=>
              setForm({
                ...form,
                amount:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Paid"
            value={form.paid}
            onChange={(e)=>
              setForm({
                ...form,
                paid:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Balance"
            value={form.balance}
            onChange={(e)=>
              setForm({
                ...form,
                balance:
                  e.target.value
              })
            }
          />

        </div>

        <button
          onClick={saveManual}
          style={{
            marginTop: 15,
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8
          }}
        >
          Save Pending Case
        </button>

      </div>

      {/* SEARCH */}
      <div style={{
        background: "white",
        padding: 15,
        borderRadius: 12,
        marginBottom: 20
      }}>

        <input
          placeholder="Search patient..."
          value={search}
          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border:
              "1px solid #cbd5e1"
          }}
        />

      </div>

      {/* TABLE */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12
      }}>

        <table style={{
          width: "100%"
        }}>

          <thead>

            <tr>

              <th align="left">
                Patient
              </th>

              <th align="left">
                Mobile
              </th>

              <th align="left">
                Amount
              </th>

              <th align="left">
                Paid
              </th>

              <th align="left">
                Balance
              </th>

              <th align="left">
                Source
              </th>

              <th align="left">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filtered.map((item)=> (

              <tr
                key={item._id}
                style={{
                  borderTop:
                    "1px solid #eee"
                }}
              >

                <td>
                  {
                    item.patient_name
                  }
                </td>

                <td>
                  {
                    item.mobile_number
                  }
                </td>

                <td>
                  Rs {
                    item.amount
                  }
                </td>

                <td>
                  Rs {
                    item.paid
                  }
                </td>

                <td style={{
                  color: "#dc2626",
                  fontWeight: "bold"
                }}>
                  Rs {
                    item.balance
                  }
                </td>

                <td>

                  <span style={{
                    background:
                      item.source === "auto"
                      ? "#16a34a"
                      : "#2563eb",

                    color: "white",

                    padding:
                      "5px 12px",

                    borderRadius: 20,

                    fontSize: 12
                  }}>

                    {
                      item.source
                    }

                  </span>

                </td>

                <td>

                  <button
                    onClick={()=>
                      deleteCase(
                        item._id,
                        item.source
                      )
                    }
                    style={{
                      background:
                        "#ef4444",

                      color: "white",

                      border: "none",

                      padding:
                        "6px 12px",

                      borderRadius: 6
                    }}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </Layout>
  );
}