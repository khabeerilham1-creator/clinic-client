import {
  useEffect,
  useState
} from "react";

import api from "../api";

import Layout from "../components/Layout";

export default function CompletedCases() {

  const [data, setData] =
    useState([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    const res = await api.get(
      "/completed-cases/"
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

  const getColor = (type) => {

    if (type === "friends")
      return "#16a34a";

    if (type === "relatives")
      return "#2563eb";

    if (type === "neighbours")
      return "#ca8a04";

    if (type === "non_affording")
      return "#ea580c";

    if (type === "compassionate")
      return "#dc2626";

    return "#16a34a";
  };

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        Completed Cases
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
                    item.lab_charge
                  }
                </td>

                <td>

                  <span style={{
                    background:
                      getColor(
                        item.colour_code
                      ),

                    color: "white",

                    padding:
                      "5px 12px",

                    borderRadius: 20,

                    fontSize: 12
                  }}>
                    Completed
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