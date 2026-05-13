import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Patients() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({

    reg_no: "",

    date: new Date()
      .toISOString()
      .split("T")[0],

    title: "Mr.",

    name: "",

    husband_name: "",

    birth_year: "",

    age: "",

    occupation: "",

    address: "",

    email: "",

    ptcl_number: "",

    mobile_number: "",

    emergency_number: "",

    referred_by: "",

    category: "Referred",

    consultation_fee_paid: "No"

  });

  // =========================
  // LOAD PATIENTS
  // =========================

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (!token) {

      navigate("/");

      return;

    }

    loadPatients();

  }, [navigate]);

  const loadPatients = async () => {

    try {

      const res =
        await api.get("/patients/");

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

      alert(
        "Failed to load patients ❌"
      );

    }

  };

  // =========================
  // INPUT CHANGE
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

      setForm({

        reg_no: String(
          (patients.length || 0) + 1
        ).padStart(5, "0"),

        date: new Date()
          .toISOString()
          .split("T")[0],

        title: "Mr.",

        name: "",

        husband_name: "",

        birth_year: "",

        age: "",

        occupation: "",

        address: "",

        email: "",

        ptcl_number: "",

        mobile_number: "",

        emergency_number: "",

        referred_by: "",

        category: "Referred",

        consultation_fee_paid: "No"

      });

    } catch (err) {

      console.log(err);

      alert(
        "Backend save error ❌"
      );

    }

  };

  // =========================
  // DELETE
  // =========================

  const deletePatient = async (id) => {

    try {

      await api.delete(
        "/patients/" + id
      );

      setPatients(prev =>
        prev.filter(
          p => p._id !== id
        )
      );

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

      <h1 style={{
        marginBottom: 20,
        fontSize: 28
      }}>
        Patient Entry
      </h1>

      {/* SEARCH */}

      <div style={card}>

        <input
          type="text"
          placeholder="🔍 Search by Name / Mobile / Reg No"
          value={search}
          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }
          style={input}
        />

      </div>

      {/* FORM */}

      <div style={card}>

        <h2 style={{
          marginBottom: 20
        }}>
          Patient Information
        </h2>

        <Grid>

          <Row label="Date">

            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              style={input}
            />

          </Row>

          <Row label="Reg No">

            <input
              name="reg_no"
              value={form.reg_no}
              readOnly
              style={{
                ...input,
                background:
                  "#f1f5f9"
              }}
            />

          </Row>

          <Row label="Title">

            <select
              name="title"
              value={form.title}
              onChange={handleChange}
              style={input}
            >

              <option>
                Mr.
              </option>

              <option>
                Mrs.
              </option>

              <option>
                Miss
              </option>

              <option>
                Dr.
              </option>

            </select>

          </Row>

          <Row label="Patient Name">

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={input}
            />

          </Row>

          {form.title ===
            "Mrs." && (

            <Row label="Husband Name">

              <input
                name="husband_name"
                value={
                  form.husband_name
                }
                onChange={
                  handleChange
                }
                style={input}
              />

            </Row>

          )}

          <Row label="Birth Year">

            <input
              type="number"
              name="birth_year"
              placeholder="1990"
              value={
                form.birth_year
              }
              onChange={(e)=>{

                const year =
                  e.target.value;

                const currentYear =
                  new Date()
                    .getFullYear();

                const age =
                  year
                    ? currentYear -
                      Number(year)
                    : "";

                setForm({
                  ...form,
                  birth_year:
                    year,
                  age:
                    age.toString()
                });

              }}
              style={input}
            />

          </Row>

          <Row label="Age">

            <input
              value={form.age}
              readOnly
              style={{
                ...input,
                background:
                  "#f1f5f9"
              }}
            />

          </Row>

          <Row label="Occupation">

            <input
              name="occupation"
              value={
                form.occupation
              }
              onChange={
                handleChange
              }
              style={input}
            />

          </Row>

          <Row label="Address">

            <textarea
              name="address"
              value={
                form.address
              }
              onChange={
                handleChange
              }
              style={{
                ...input,
                minHeight: 80
              }}
            />

          </Row>

          <Row label="Email">

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              style={input}
            />

          </Row>

          <Row label="PTCL Number">

            <input
              name="ptcl_number"
              value={
                form.ptcl_number
              }
              onChange={
                handleChange
              }
              style={input}
            />

          </Row>

          <Row label="Mobile Number">

            <input
              name="mobile_number"
              value={
                form.mobile_number
              }
              onChange={
                handleChange
              }
              style={input}
            />

          </Row>

          <Row label="Emergency Number">

            <input
              name="emergency_number"
              value={
                form.emergency_number
              }
              onChange={
                handleChange
              }
              style={input}
            />

          </Row>

          <Row label="Referred By">

            <input
              name="referred_by"
              value={
                form.referred_by
              }
              onChange={
                handleChange
              }
              style={input}
            />

          </Row>

          <Row label="Category">

            <select
              name="category"
              value={
                form.category
              }
              onChange={
                handleChange
              }
              style={input}
            >

              <option>
                Referred
              </option>

              <option>
                Relatives
              </option>

              <option>
                Neighbours
              </option>

              <option>
                Friends
              </option>

            </select>

          </Row>

          <Row label="Consultation Fee">

            <select
              name="consultation_fee_paid"
              value={
                form.consultation_fee_paid
              }
              onChange={
                handleChange
              }
              style={input}
            >

              <option value="Yes">
                Paid
              </option>

              <option value="No">
                Pending
              </option>

            </select>

          </Row>

        </Grid>

        <button
          onClick={savePatient}
          style={saveBtn}
        >

          {editId
            ? "Update"
            : "Save"}

        </button>

      </div>

      {/* LIST */}

      <div style={card}>

        <h2>
          Patients List
        </h2>

        <table style={{
          width: "100%",
          marginTop: 10
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
                Category
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

                  {p.title}

                  {" "}

                  {p.name}

                </td>

                <td>
                  {p.mobile_number}
                </td>

                <td>
                  {p.category}
                </td>

                <td align="right">

                  <button
                    onClick={()=>
                      navigate(
                        "/timeline/" +
                        p._id
                      )
                    }
                  >
                    History
                  </button>

                  <button
                    onClick={()=>{

                      setForm({
                        ...p
                      });

                      setEditId(
                        p._id
                      );

                    }}
                    style={{
                      marginLeft: 8
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={()=>
                      deletePatient(
                        p._id
                      )
                    }
                    style={{
                      marginLeft: 8
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

/* GRID */

function Grid({
  children
}) {

  return (

    <div style={{
      display: "grid",
      gridTemplateColumns:
        "1fr",
      gap: 14
    }}>

      {children}

    </div>

  );

}

/* ROW */

function Row({
  label,
  children
}) {

  return (

    <div style={{
      display: "grid",
      gridTemplateColumns:
        "220px 1fr",
      alignItems: "center",
      gap: 14
    }}>

      <label style={{
        fontWeight: "600",
        color: "#334155"
      }}>

        {label}

      </label>

      {children}

    </div>

  );

}

/* STYLES */

const card = {

  background: "white",

  padding: 25,

  borderRadius: 14,

  marginBottom: 20,

  boxShadow:
    "0 2px 8px rgba(0,0,0,0.06)"

};

const input = {

  width: "100%",

  padding: 10,

  borderRadius: 8,

  border:
    "1px solid #cbd5e1",

  outline: "none",

  boxSizing: "border-box"

};

const saveBtn = {

  marginTop: 25,

  padding: "12px 24px",

  background: "#2563eb",

  color: "white",

  border: "none",

  borderRadius: 8,

  cursor: "pointer",

  fontWeight: "600"

};

export default Patients;