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

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    const res = await api.get(
      "/pending-cases/"
    );

    setData(res.data || []);
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
        Pending Cases
      </h1>

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
                Address
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
                Lab
              </th>

              <th align="left">
                Status
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
                  {
                    item.address
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
                  Rs {
                    item.lab_charge
                  }
                </td>

                <td>

                  <span style={{
                    background:
                      "#dc2626",

                    color: "white",

                    padding:
                      "5px 12px",

                    borderRadius: 20,

                    fontSize: 12
                  }}>
                    Pending
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </Layout>
  );
}