import React, {
  useEffect,
  useState
} from "react";

import api from "../api";

import Layout from "../components/Layout";

function PatientAccountStatus() {

  const [records, setRecords] = useState([]);

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

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        Patient Account Status 💳
      </h1>

      <div style={{
        display: "grid",
        gap: 20
      }}>

        {records.map((r, i) => (

          <div
            key={i}
            style={{
              background: "white",
              padding: 20,
              borderRadius: 12,
              boxShadow:
                "0 2px 6px rgba(0,0,0,0.05)"
            }}
          >

            <h2>
              {r.patient_name}
            </h2>

            <div style={{
              marginTop: 15,
              lineHeight: 2
            }}>

              <div>
                <b>Total:</b>
                {" "}Rs {r.total}
              </div>

              <div>
                <b>Paid:</b>
                {" "}Rs {r.paid}
              </div>

              <div>
                <b>Balance:</b>
                {" "}Rs {r.balance}
              </div>

              <div>
                <b>Discount:</b>
                {" "}Rs {r.discount}
              </div>

              <div>
                <b>Doctor Share:</b>
                {" "}Rs {r.doctor_share}
              </div>

              <div>
                <b>Owner Profit:</b>
                {" "}Rs {r.owner_profit}
              </div>

            </div>

          </div>

        ))}

      </div>

    </Layout>
  );
}

export default PatientAccountStatus;