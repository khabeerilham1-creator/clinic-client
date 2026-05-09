import React, {
  useEffect,
  useState
} from "react";

import api from "../api";

import Layout from "../components/Layout";

function PatientAccountStatus() {

  const [records, setRecords] = useState([]);

  const [search, setSearch] = useState("");

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    const res = await api.get(
      "/account-status/"
    );

    setRecords(
      res.data || []
    );
  };

  const filtered = records.filter(r =>

    r.patient_name
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      )
  );

  return (

    <Layout>

      {/* HEADER */}
      <div style={{
        marginBottom: 25
      }}>

        <h1 style={{
          marginBottom: 5
        }}>
          Patient Account Status 💳
        </h1>

        <p style={{
          color: "#64748b"
        }}>
          Professional Financial Ledger
        </p>

      </div>

      {/* SEARCH */}
      <div style={{
        background: "white",
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.05)"
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
            padding: 12,
            borderRadius: 8,
            border:
              "1px solid #cbd5e1",
            outline: "none"
          }}
        />

      </div>

      {/* TABLE */}
      <div style={{
        background: "white",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.05)"
      }}>

        <table style={{
          width: "100%",
          borderCollapse: "collapse"
        }}>

          <thead>

            <tr style={{
              background: "#0f172a",
              color: "white"
            }}>

              <th style={th}>
                Date
              </th>

              <th style={th}>
                Patient
              </th>

              <th style={th}>
                Total
              </th>

              <th style={th}>
                Discount
              </th>

              <th style={th}>
                Lab Charges
              </th>

              <th style={th}>
                Paid
              </th>

              <th style={th}>
                Balance
              </th>

              <th style={th}>
                Doctor Share
              </th>

              <th style={th}>
                Owner Profit
              </th>

              <th style={th}>
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {filtered.map((r, i) => {

              const balance =
                Number(r.balance || 0);

              return (

                <tr
                  key={i}
                  style={{
                    borderBottom:
                      "1px solid #e2e8f0"
                  }}
                >

                  <td style={td}>
                    {
                      new Date()
                      .toLocaleDateString()
                    }
                  </td>

                  <td style={tdBold}>
                    {r.patient_name}
                  </td>

                  <td style={td}>
                    Rs {r.total}
                  </td>

                  <td style={td}>
                    Rs {r.discount || 0}
                  </td>

                  <td style={td}>
                    Rs {r.lab_charge || 0}
                  </td>

                  <td style={td}>
                    Rs {r.paid}
                  </td>

                  <td style={{
                    ...td,
                    color:
                      balance > 0
                        ? "#dc2626"
                        : "#16a34a",
                    fontWeight: "bold"
                  }}>
                    Rs {balance}
                  </td>

                  <td style={td}>
                    Rs {r.doctor_share}
                  </td>

                  <td style={td}>
                    Rs {r.owner_profit}
                  </td>

                  <td style={td}>

                    <span style={{
                      background:
                        balance > 0
                          ? "#fee2e2"
                          : "#dcfce7",

                      color:
                        balance > 0
                          ? "#dc2626"
                          : "#16a34a",

                      padding:
                        "5px 12px",

                      borderRadius: 20,

                      fontSize: 12,

                      fontWeight: "600"
                    }}>

                      {balance > 0
                        ? "Pending"
                        : "Paid"}

                    </span>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </Layout>
  );
}

const th = {

  padding: 14,

  textAlign: "left",

  fontSize: 13
};

const td = {

  padding: 14,

  fontSize: 14
};

const tdBold = {

  padding: 14,

  fontWeight: "600",

  fontSize: 14
};

export default PatientAccountStatus;