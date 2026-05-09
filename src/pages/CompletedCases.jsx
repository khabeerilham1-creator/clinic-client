import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import api from "../api";

import Layout from "../components/Layout";

export default function CompletedCases() {

  const navigate =
    useNavigate();

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

  const reopenCase = async (
    id
  ) => {

    if (
      !window.confirm(
        "Reopen this case?"
      )
    ) return;

    await api.delete(
      "/completed-cases/" + id
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

      <button
        onClick={() =>
          navigate("/patients")
        }
        style={{
          marginBottom: 20,
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "12px 18px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "600"
        }}
      >
        + Complete Patient Manually
      </button>

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
                Mode
              </th>

              <th align="left">
                Status
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

                <td>
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
                      item.completed_mode === "AUTO"
                        ? "#dbeafe"
                        : "#fef3c7",

                    color:
                      item.completed_mode === "AUTO"
                        ? "#2563eb"
                        : "#ca8a04",

                    padding:
                      "5px 12px",

                    borderRadius: 20,

                    fontSize: 12,

                    fontWeight: "600"
                  }}>

                    {
                      item.completed_mode
                    }

                  </span>

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

                <td>

                  <button
                    onClick={() =>
                      reopenCase(
                        item._id
                      )
                    }
                    style={{
                      background:
                        "#dc2626",

                      color: "white",

                      border: "none",

                      padding:
                        "6px 12px",

                      borderRadius: 6,

                      cursor: "pointer"
                    }}
                  >
                    Reopen
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