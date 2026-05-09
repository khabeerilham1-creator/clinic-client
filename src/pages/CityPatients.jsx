import React, {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import api from "../api";

import Layout from "../components/Layout";

function CityPatients() {

  const navigate = useNavigate();

  const [data, setData] = useState([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    const res = await api.get(
      "/city-patients/"
    );

    setData(res.data || []);
  };

  const filtered = data.filter(c =>

    c.city
      .toLowerCase()
      .includes(
        search.toLowerCase()
      )
  );

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        🌍 City Wise Patient List
      </h1>

      {/* SEARCH */}
      <div style={card}>

        <input
          placeholder="Search City..."
          value={search}
          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }
          style={input}
        />

      </div>

      {/* CITY LIST */}
      {filtered.map((c, i) => (

        <div
          key={i}
          style={cityCard}
        >

          {/* HEADER */}
          <div style={{
            display: "flex",
            justifyContent:
              "space-between",
            marginBottom: 15
          }}>

            <h2>
              {c.city}
            </h2>

            <div style={{
              background:
                "#2563eb",
              color: "white",
              padding:
                "6px 14px",
              borderRadius: 20
            }}>

              {c.count} Patients

            </div>

          </div>

          {/* TABLE */}
          <table style={{
            width: "100%"
          }}>

            <thead>

              <tr>

                <th align="left">
                  Reg No
                </th>

                <th align="left">
                  Name
                </th>

                <th align="left">
                  Mobile
                </th>

                <th align="left">
                  Address
                </th>

                <th align="right">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {c.patients.map((p, idx) => (

                <tr
                  key={idx}
                  style={{
                    borderTop:
                      "1px solid #eee"
                  }}
                >

                  <td>
                    {p.reg_no}
                  </td>

                  <td>
                    {p.name}
                  </td>

                  <td>
                    {p.mobile}
                  </td>

                  <td>
                    {p.address}
                  </td>

                  <td align="right">

                    <button
                      onClick={() =>
                        navigate(
                          "/timeline/" +
                          p._id
                        )
                      }
                      style={btn}
                    >
                      Open
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      ))}

    </Layout>
  );
}

const card = {

  background: "white",

  padding: 15,

  borderRadius: 12,

  marginBottom: 20
};

const cityCard = {

  background: "white",

  padding: 20,

  borderRadius: 14,

  marginBottom: 20,

  boxShadow:
    "0 2px 8px rgba(0,0,0,0.05)"
};

const input = {

  width: "100%",

  padding: 12,

  borderRadius: 8,

  border:
    "1px solid #cbd5e1"
};

const btn = {

  background: "#2563eb",

  color: "white",

  border: "none",

  padding: "8px 14px",

  borderRadius: 8,

  cursor: "pointer"
};

export default CityPatients;