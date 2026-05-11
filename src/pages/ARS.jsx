import React, {
  useEffect,
  useState
} from "react";

import api from "../api";

import Layout from "../components/Layout";

function ARS() {

  const [alerts, setAlerts] =
    useState([]);

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

    // AUTO REFRESH
    const interval =
      setInterval(() => {

        loadAlerts();

      }, 10000);

    return () =>
      clearInterval(interval);

  }, []);

  const priorityColor = (
    priority
  ) => {

    if (
      priority === "critical"
    ) return "#dc2626";

    if (
      priority === "high"
    ) return "#ea580c";

    if (
      priority === "medium"
    ) return "#2563eb";

    return "#16a34a";
  };

  return (

    <Layout>

      <div style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        marginBottom: 25
      }}>

        <div>

          <h1 style={{
            margin: 0
          }}>
            🚨 Alert &
            Reminder System
          </h1>

          <p style={{
            color: "#64748b"
          }}>
            Live clinic reminders
          </p>

        </div>

        <div style={{
          background: "#dc2626",
          color: "white",
          padding:
            "10px 18px",
          borderRadius: 12,
          fontWeight: "bold"
        }}>

          {alerts.length}
          {" "}
          Alerts

        </div>

      </div>

      {/* ALERTS */}
      <div style={{
        display: "grid",
        gap: 15
      }}>

        {alerts.map((a, i) => (

          <div
            key={i}
            style={{

              background:
                "white",

              borderLeft:
                `8px solid ${priorityColor(a.priority)}`,

              borderRadius: 12,

              padding: 20,

              boxShadow:
                "0 2px 10px rgba(0,0,0,0.05)"

            }}
          >

            <div style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center"
            }}>

              <div>

                <h3 style={{
                  margin: 0
                }}>
                  {a.title}
                </h3>

                <p style={{
                  marginTop: 8,
                  color: "#475569"
                }}>
                  {a.message}
                </p>

              </div>

              <div style={{
                textAlign: "right"
              }}>

                <div style={{
                  fontWeight: "bold",
                  color:
                    priorityColor(
                      a.priority
                    )
                }}>
                  {a.priority}
                </div>

                <div style={{
                  color: "#64748b",
                  marginTop: 5
                }}>
                  {a.date}
                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* EMPTY */}
      {!alerts.length && (

        <div style={{
          background: "white",
          padding: 40,
          borderRadius: 14,
          textAlign: "center",
          color: "#64748b"
        }}>

          No alerts 🎉

        </div>

      )}

    </Layout>
  );
}

export default ARS;