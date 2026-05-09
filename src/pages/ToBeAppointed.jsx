import {
  useEffect,
  useState
} from "react";

import api from "../api";

import Layout from "../components/Layout";

export default function ToBeAppointed() {

  const [data, setData] =
    useState([]);

  const [form, setForm] =
    useState({

      patient_name: "",
      mobile_number: "",
      address: "",
      problem: "",
      appointment_date: "",
      status: "waiting"
    });

  const [editId, setEditId] =
    useState(null);

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    const res = await api.get(
      "/to-be-appointed/"
    );

    setData(res.data || []);
  };

  // =========================
  // SAVE
  // =========================
  const save = async () => {

    if (!form.patient_name)
      return alert(
        "Patient name required"
      );

    if (editId) {

      await api.put(
        "/to-be-appointed/" + editId,
        form
      );

      alert("Updated ✅");

      setEditId(null);

    } else {

      await api.post(
        "/to-be-appointed/",
        form
      );

      alert("Saved ✅");
    }

    setForm({

      patient_name: "",
      mobile_number: "",
      address: "",
      problem: "",
      appointment_date: "",
      status: "waiting"
    });

    loadData();
  };

  // =========================
  // EDIT
  // =========================
  const editItem = (item) => {

    setForm(item);

    setEditId(item._id);
  };

  // =========================
  // DELETE
  // =========================
  const deleteItem = async (id) => {

    if (!window.confirm(
      "Delete?"
    )) return;

    await api.delete(
      "/to-be-appointed/" + id
    );

    loadData();
  };

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        To Be Appointed 📅
      </h1>

      {/* FORM */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20
      }}>

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2,1fr)",
          gap: 10
        }}>

          <input
            placeholder="Patient Name"
            value={form.patient_name}
            onChange={(e)=>
              setForm({
                ...form,
                patient_name:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Mobile Number"
            value={form.mobile_number}
            onChange={(e)=>
              setForm({
                ...form,
                mobile_number:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Address"
            value={form.address}
            onChange={(e)=>
              setForm({
                ...form,
                address:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Problem"
            value={form.problem}
            onChange={(e)=>
              setForm({
                ...form,
                problem:
                  e.target.value
              })
            }
          />

          <input
            type="date"
            value={
              form.appointment_date
            }
            onChange={(e)=>
              setForm({
                ...form,
                appointment_date:
                  e.target.value
              })
            }
          />

          <select
            value={form.status}
            onChange={(e)=>
              setForm({
                ...form,
                status:
                  e.target.value
              })
            }
          >

            <option value="waiting">
              Waiting
            </option>

            <option value="appointed">
              Appointed
            </option>

            <option value="cancelled">
              Cancelled
            </option>

          </select>

        </div>

        <button
          onClick={save}
          style={{
            marginTop: 15,
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8
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
                Problem
              </th>

              <th align="left">
                Appointment
              </th>

              <th align="left">
                Status
              </th>

              <th align="left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {data.map((item)=>(

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
                    item.problem
                  }
                </td>

                <td>
                  {
                    item.appointment_date
                  }
                </td>

                <td>

                  <span style={{
                    background:
                      item.status ===
                      "appointed"
                      ? "#16a34a"
                      : item.status ===
                        "cancelled"
                      ? "#dc2626"
                      : "#ca8a04",

                    color: "white",

                    padding:
                      "5px 12px",

                    borderRadius: 20,

                    fontSize: 12
                  }}>

                    {
                      item.status
                    }

                  </span>

                </td>

                <td>

                  <button
                    onClick={()=>
                      editItem(item)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={()=>
                      deleteItem(
                        item._id
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

    </Layout>
  );
}