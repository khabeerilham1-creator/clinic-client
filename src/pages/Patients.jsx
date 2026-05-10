import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

function Patients() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);

  const [months, setMonths] = useState([]);

  const [selectedMonth, setSelectedMonth] =
    useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({

    reg_no: "",

    date:
      new Date()
      .toISOString()
      .split("T")[0],

    title: "Mr.",

    name: "",

    birth_date: "",

    age: "",

    gender: "",

    occupation: "",

    address: "",

    email: "",

    ptcl_number: "",

    mobile_number: "",

    emergency_number: "",

    referred_by: "",

    category: "",

    colour_code: "friends",

    purpose_of_visit: "",

    consultation_fee_paid: "No",

    conditions: "",

    complaints: "segmental"
  });

  const [editId, setEditId] =
    useState(null);

  // =========================
  // LOAD PATIENTS
  // =========================
  const loadPatients = async () => {

    try {

      const res = await api.get(
        "/patients/"
      );

      setPatients(res.data || []);

      const nextNo = String(
        (res.data?.length || 0) + 1
      ).padStart(5, "0");

      setForm(prev => ({
        ...prev,
        reg_no: nextNo
      }));

    } catch (err) {

      console.log(err);

    }
  };

  // =========================
  // LOAD MONTHS
  // =========================
  const loadMonths = async () => {

    try {

      const res = await api.get(
        "/patients/months"
      );

      setMonths(res.data || []);

    } catch (err) {

      console.log(err);

    }
  };

  // =========================
  // LOAD MONTH PATIENTS
  // =========================
  const loadMonthPatients = async (
    year,
    month
  ) => {

    try {

      const res = await api.get(
        `/patients/month/${year}/${month}`
      );

      setPatients(res.data || []);

    } catch (err) {

      console.log(err);

    }
  };

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (!token) {

      navigate("/");

      return;
    }

    loadPatients();

    loadMonths();

  }, [navigate]);

  // =========================
  // AUTO AGE
  // =========================
  useEffect(() => {

    if (!form.birth_date) return;

    const birth = new Date(
      form.birth_date
    );

    const today = new Date();

    let age =
      today.getFullYear()
      - birth.getFullYear();

    const m =
      today.getMonth()
      - birth.getMonth();

    if (
      m < 0 ||
      (
        m === 0 &&
        today.getDate()
        < birth.getDate()
      )
    ) {
      age--;
    }

    setForm(prev => ({
      ...prev,
      age: age.toString()
    }));

  }, [form.birth_date]);

  // =========================
  // CHANGE
  // =========================
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value
    });
  };

  // =========================
  // SAVE
  // =========================
  const savePatient = async () => {

    try {

      let res;

      if (editId) {

        res = await api.put(
          "/patients/" + editId,
          form
        );

        alert("Updated ✅");

        setPatients(prev =>
          prev.map(p =>
            p._id === editId
              ? res.data
              : p
          )
        );

        setEditId(null);

      } else {

        res = await api.post(
          "/patients/",
          form
        );

        alert("Saved ✅");

        setPatients(prev => [
          res.data,
          ...prev
        ]);
      }

      loadMonths();

      setForm({

        reg_no: String(
          (patients.length || 0) + 1
        ).padStart(5, "0"),

        date:
          new Date()
          .toISOString()
          .split("T")[0],

        title: "Mr.",

        name: "",

        birth_date: "",

        age: "",

        gender: "",

        occupation: "",

        address: "",

        email: "",

        ptcl_number: "",

        mobile_number: "",

        emergency_number: "",

        referred_by: "",

        category: "",

        colour_code: "friends",

        purpose_of_visit: "",

        consultation_fee_paid: "No",

        conditions: "",

        complaints: "segmental"
      });

    } catch (err) {

      console.log(err);

      alert("Save Error ❌");

    }
  };

  // =========================
  // DELETE
  // =========================
  const deletePatient = async (id) => {

    if (!window.confirm("Delete?"))
      return;

    try {

      await api.delete(
        "/patients/" + id
      );

      setPatients(prev =>
        prev.filter(
          p => p._id !== id
        )
      );

      loadMonths();

    } catch (err) {

      console.log(err);

    }
  };

  // =========================
  // SEARCH
  // =========================
  const filteredPatients =
    patients.filter((p) => {

      const q =
        search.toLowerCase();

      return (

        p.name
          ?.toLowerCase()
          .includes(q)

        ||

        p.mobile_number
          ?.toLowerCase()
          .includes(q)

        ||

        p.reg_no
          ?.toLowerCase()
          .includes(q)

      );
    });

  return (

    <Layout>

      <div style={{
        display: "grid",
        gridTemplateColumns:
          "260px 1fr",
        gap: 20
      }}>

        {/* SIDEBAR */}
        <div style={{
          background: "white",
          padding: 15,
          borderRadius: 14,
          height: "fit-content",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.05)"
        }}>

          <h3>
            Monthly Archive 📅
          </h3>

          <button
            onClick={() => {

              setSelectedMonth(null);

              loadPatients();

            }}
            style={{
              width: "100%",
              padding: 10,
              border: "none",
              borderRadius: 8,
              background: "#2563eb",
              color: "white",
              marginBottom: 15
            }}
          >
            All Patients
          </button>

          {months.map((m, i)=> (

            <div
              key={i}
              onClick={() => {

                setSelectedMonth(m);

                loadMonthPatients(
                  m.year,
                  m.month
                );

              }}
              style={{
                padding: 12,
                borderRadius: 10,
                marginBottom: 10,
                cursor: "pointer",

                background:
                  selectedMonth?.month === m.month
                  &&
                  selectedMonth?.year === m.year
                    ? "#2563eb"
                    : "#f1f5f9",

                color:
                  selectedMonth?.month === m.month
                  &&
                  selectedMonth?.year === m.year
                    ? "white"
                    : "#0f172a"
              }}
            >

              <div>
                {m.month_name}
              </div>

              <small>
                {m.year}
              </small>

              <div>
                {m.count} Patients
              </div>

            </div>

          ))}

        </div>

        {/* MAIN */}
        <div>

          <h1 style={{
            marginBottom: 20
          }}>
            Patient Entry
          </h1>

          {/* SEARCH */}
          <div style={{
            background: "white",
            padding: 15,
            borderRadius: 14,
            marginBottom: 20
          }}>

            <input
              type="text"
              placeholder="Search Patient..."
              value={search}
              onChange={(e)=>
                setSearch(
                  e.target.value
                )
              }
              style={fullInput}
            />

          </div>

          {/* FORM */}
          <div style={{
            background: "white",
            padding: 25,
            borderRadius: 14,
            marginBottom: 20
          }}>

            <Grid>

              <Input
                label="Entry Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />

              <Input
                label="Registration Number"
                name="reg_no"
                value={form.reg_no}
                readOnly
              />

              <Input
                label="Patient Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />

              <Input
                label="Mobile Number"
                name="mobile_number"
                value={form.mobile_number}
                onChange={handleChange}
              />

              <Input
                label="Birth Date"
                name="birth_date"
                type="date"
                value={form.birth_date}
                onChange={handleChange}
              />

              <Input
                label="Age"
                value={form.age}
                readOnly
              />

              <Input
                label="Occupation"
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
              />

              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />

            </Grid>

            <button
              onClick={savePatient}
              style={{
                marginTop: 20,
                padding: "12px 24px",
                border: "none",
                borderRadius: 10,
                background: "#2563eb",
                color: "white",
                fontWeight: "bold"
              }}
            >
              {editId
                ? "Update"
                : "Save"}
            </button>

          </div>

          {/* LIST */}
          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 14
          }}>

            <h2>
              Patients List
            </h2>

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

                  <th align="right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredPatients.map((p)=> (

                  <tr
                    key={p._id}
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
                      {p.mobile_number}
                    </td>

                    <td align="right">

                      <button
                        onClick={() =>
                          navigate(
                            "/timeline/" + p._id
                          )
                        }
                      >
                        History
                      </button>

                      <button
                        onClick={() => {

                          setForm({
                            ...p
                          });

                          setEditId(
                            p._id
                          );

                        }}
                        style={{
                          marginLeft: 10
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deletePatient(
                            p._id
                          )
                        }
                        style={{
                          marginLeft: 10
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

        </div>

      </div>

    </Layout>
  );
}

function Grid({ children }) {

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(2,1fr)",
      gap: 16
    }}>
      {children}
    </div>
  );
}

function Input({
  label,
  ...props
}) {

  return (

    <div>

      <label style={labelStyle}>
        {label}
      </label>

      <input
        {...props}
        style={input}
      />

    </div>

  );
}

const labelStyle = {

  display: "block",

  marginBottom: 6,

  fontWeight: "600",

  fontSize: 13
};

const input = {

  width: "100%",

  padding: 10,

  borderRadius: 8,

  border: "1px solid #cbd5e1"
};

const fullInput = {

  width: "100%",

  padding: 12,

  borderRadius: 8,

  border: "1px solid #cbd5e1"
};

export default Patients;