import React, {
  useEffect,
  useState
} from "react";

import api from "../api";

import Layout from "../components/Layout";

function ARS() {

  const [alerts, setAlerts] =
    useState([]);

  const [form, setForm] =
    useState({

      patient_name: "",

      type: "Appointment",

      priority: "medium",

      date: "",

      message: ""
    });

  // =========================
  // LOAD
  // =========================
  const loadAlerts = async () => {

    try {

      const res =
        await api.get("/ars/");

      setAlerts(res.data || []);

    } catch (err) {

      console.log(err);

    }
  };

  useEffect(() => {

    loadAlerts();

  }, []);

  // =========================
  // CREATE
  // =========================
  const createAlert =
    async () => {

      try {

        await api.post(
          "/ars/",
          form
        );

        alert(
          "Alert Created ✅"
        );

        setForm({

          patient_name: "",

          type: "Appointment",

          priority: "medium",

          date: "",

          message: ""
        });

        loadAlerts();

      } catch (err) {

        console.log(err);

        alert("Error ❌");
      }
    };

  // =========================
  // COMPLETE
  // =========================
  const completeAlert =
    async (id) => {

      await api.put(
        "/ars/" + id
      );

      loadAlerts();
    };

  // =========================
  // DELETE
  // =========================
  const deleteAlert =
    async (id) => {

      if (
        !window.confirm(
          "Delete alert?"
        )
      )
        return;

      await api.delete(
        "/ars/" + id
      );

      loadAlerts();
    };

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        🚨 Alert & Reminder System
      </h1>

      {/* CREATE */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20
      }}>

        <h2>
          Create Reminder
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2,1fr)",
          gap: 12
        }}>

          <input
            placeholder="Patient Name"
            value={
              form.patient_name
            }
            onChange={(e)=>
              setForm({

                ...form,

                patient_name:
                  e.target.value
              })
            }
            style={input}
          />

          <input
            type="date"
            value={form.date}
            onChange={(e)=>
              setForm({

                ...form,

                date:
                  e.target.value
              })
            }
            style={input}
          />

          <select
            value={form.type}
            onChange={(e)=>
              setForm({

                ...form,

                type:
                  e.target.value
              })
            }
            style={input}
          >

            <option>
              Appointment
            </option>

            <option>
              Payment
            </option>

            <option>
              Birthday
            </option>

            <option>
              Follow Up
            </option>

            <option>
              Treatment
            </option>

          </select>

          <select
            value={
              form.priority
            }
            onChange={(e)=>
              setForm({

                ...form,

                priority:
                  e.target.value
              })
            }
            style={input}
          >

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>

          </select>

        </div>

        <textarea
          placeholder="Reminder Message..."
          value={form.message}
          onChange={(e)=>
            setForm({

              ...form,

              message:
                e.target.value
            })
          }
          style={{
            ...input,
            marginTop: 12,
            minHeight: 100,
            width: "100%"
          }}
        />

        <button
          onClick={createAlert}
          style={{
            marginTop: 15,
            padding:
              "10px 20px",
            border: "none",
            background:
              "#dc2626",
            color: "white",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Create Alert
        </button>

      </div>

      {/* LIST */}
      <div style={{
        display: "grid",
        gap: 15
      }}>

        {alerts.map((a)=>(

          <div
            key={a._id}
            style={{

              background: "white",

              padding: 20,

              borderRadius: 12,

              borderLeft:
                a.priority === "high"
                  ? "6px solid red"
                  : a.priority === "medium"
                  ? "6px solid orange"
                  : "6px solid green"
            }}
          >

            <div style={{
              display: "flex",
              justifyContent:
                "space-between"
            }}>

              <div>

                <h3>
                  {a.patient_name}
                </h3>

                <p>
                  <b>Type:</b>
                  {" "}
                  {a.type}
                </p>

                <p>
                  <b>Date:</b>
                  {" "}
                  {a.date}
                </p>

                <p>
                  <b>Status:</b>
                  {" "}
                  {a.status}
                </p>

                <p>
                  {a.message}
                </p>

              </div>

              <div>

                {a.status !==
                  "done" && (

                  <button
                    onClick={()=>
                      completeAlert(
                        a._id
                      )
                    }
                    style={{
                      ...btn,
                      background:
                        "#16a34a"
                    }}
                  >
                    Complete
                  </button>

                )}

                <button
                  onClick={()=>
                    deleteAlert(
                      a._id
                    )
                  }
                  style={{
                    ...btn,
                    background:
                      "#dc2626"
                  }}
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </Layout>
  );
}

const input = {

  padding: 12,

  border:
    "1px solid #ddd",

  borderRadius: 8
};

const btn = {

  padding:
    "8px 15px",

  border: "none",

  color: "white",

  borderRadius: 8,

  marginLeft: 10,

  cursor: "pointer"
};

export default ARS;