import React, {
  useEffect,
  useState
} from "react";

import api from "../api";

import Layout from "../components/Layout";

function Permissions() {

  const [users, setUsers] =
    useState([]);

  const [editId, setEditId] =
    useState(null);

  const [form, setForm] =
    useState({

      username: "",

      password: "",

      role: "Receptionist"
    });

  const [permission, setPermission] =
    useState({

      username: "",

      module: "patients",

      access: "enabled"
    });

  const modules = [

    "dashboard",
    "patients",
    "visits",
    "checkup",
    "afi",
    "cis",
    "prescription",
    "fis",
    "invoice",
    "lvi",
    "acc",
    "hai",
    "debtors",
    "creditors",
    "bills",
    "reports",
    "patient_files"
  ];

  // =========================
  // LOAD USERS
  // =========================
  const loadUsers = async () => {

    try {

      const res =
        await api.get(
          "/permissions/users"
        );

      setUsers(
        res.data || []
      );

    } catch (err) {

      console.log(err);
    }
  };

  useEffect(() => {

    loadUsers();

  }, []);

  // =========================
  // CREATE / UPDATE
  // =========================
  const saveUser = async () => {

    try {

      if (
        !form.username
      ) {
        return alert(
          "Username required"
        );
      }

      if (editId) {

        await api.put(

          "/permissions/users/" + editId,

          form
        );

        alert("User Updated ✅");

      } else {

        await api.post(

          "/permissions/users",

          form
        );

        alert("User Created ✅");
      }

      setForm({

        username: "",

        password: "",

        role: "Receptionist"
      });

      setEditId(null);

      loadUsers();

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.detail ||
        "Error ❌"
      );
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteUser = async (id) => {

    if (
      !window.confirm(
        "Delete user?"
      )
    )
      return;

    try {

      await api.delete(

        "/permissions/users/" + id
      );

      alert("Deleted ✅");

      loadUsers();

    } catch (err) {

      console.log(err);
    }
  };

  // =========================
  // APPLY PERMISSION
  // =========================
  const applyPermission = async () => {

    try {

      await api.post(

        "/permissions/apply",

        permission
      );

      alert(
        "Permission Updated ✅"
      );

      loadUsers();

    } catch (err) {

      console.log(err);

      alert("Error ❌");
    }
  };

  return (

    <Layout>

      <h1 style={{
        marginBottom: 20
      }}>
        Permissions Management
      </h1>

      {/* CREATE USER */}
      <div style={card}>

        <h2>
          {editId
            ? "Edit User"
            : "Create User"}
        </h2>

        <Grid>

          <input
            placeholder="Username"
            value={form.username}
            onChange={(e)=>

              setForm({

                ...form,

                username:
                  e.target.value
              })
            }
            style={input}
          />

          <input
            placeholder="Password"
            value={form.password}
            onChange={(e)=>

              setForm({

                ...form,

                password:
                  e.target.value
              })
            }
            style={input}
          />

          <select
            value={form.role}
            onChange={(e)=>

              setForm({

                ...form,

                role:
                  e.target.value
              })
            }
            style={input}
          >

            <option>
              CEO
            </option>

            <option>
              Receptionist
            </option>

            <option>
              Dentist
            </option>

            <option>
              Assistant
            </option>

            <option>
              Accountant
            </option>

          </select>

        </Grid>

        <button
          onClick={saveUser}
          style={btn}
        >

          {editId
            ? "Update User"
            : "Create User"}

        </button>

      </div>

      {/* APPLY */}
      <div style={card}>

        <h2>
          Module Permissions
        </h2>

        <Grid>

          <select
            value={
              permission.username
            }

            onChange={(e)=>

              setPermission({

                ...permission,

                username:
                  e.target.value
              })
            }

            style={input}
          >

            <option value="">
              Select User
            </option>

            {users.map((u)=>(

              <option
                key={u._id}
                value={u.username}
              >
                {u.username}
              </option>

            ))}

          </select>

          <select
            value={
              permission.module
            }

            onChange={(e)=>

              setPermission({

                ...permission,

                module:
                  e.target.value
              })
            }

            style={input}
          >

            {modules.map((m)=>(

              <option key={m}>
                {m}
              </option>

            ))}

          </select>

          <select
            value={
              permission.access
            }

            onChange={(e)=>

              setPermission({

                ...permission,

                access:
                  e.target.value
              })
            }

            style={input}
          >

            <option value="enabled">
              Enabled
            </option>

            <option value="disabled">
              Disabled
            </option>

            <option value="hidden">
              Hidden
            </option>

          </select>

        </Grid>

        <button
          onClick={applyPermission}
          style={btn}
        >
          Apply Permission
        </button>

      </div>

      {/* USERS */}
      <div style={card}>

        <h2>
          Users
        </h2>

        <table style={{
          width: "100%",
          borderCollapse: "collapse"
        }}>

          <thead>

            <tr>

              <th style={th}>
                Username
              </th>

              <th style={th}>
                Role
              </th>

              <th style={th}>
                Permissions
              </th>

              <th style={th}>
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {users.map((u)=>(

              <tr key={u._id}>

                <td style={td}>
                  {u.username}
                </td>

                <td style={td}>
                  {u.role}
                </td>

                <td style={td}>

                  {Object.entries(
                    u.permissions || {}
                  ).map(([k, v])=>(

                    <div key={k}>
                      <b>{k}</b> → {v}
                    </div>

                  ))}

                </td>

                <td style={td}>

                  <button

                    onClick={() => {

                      setForm({

                        username:
                          u.username,

                        password: "",

                        role:
                          u.role
                      });

                      setEditId(
                        u._id
                      );
                    }}

                    style={{
                      marginRight: 10
                    }}
                  >
                    Edit
                  </button>

                  <button

                    onClick={() =>
                      deleteUser(
                        u._id
                      )
                    }
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

/* STYLES */

function Grid({
  children
}) {

  return (

    <div style={{

      display: "grid",

      gridTemplateColumns:
        "repeat(3,1fr)",

      gap: 10,

      marginBottom: 15

    }}>

      {children}

    </div>
  );
}

const card = {

  background: "white",

  padding: 20,

  borderRadius: 12,

  marginBottom: 20,

  boxShadow:
    "0 2px 6px rgba(0,0,0,0.05)"
};

const input = {

  padding: 10,

  border:
    "1px solid #ddd",

  borderRadius: 8
};

const btn = {

  padding:
    "10px 20px",

  background:
    "#2563eb",

  color: "white",

  border: "none",

  borderRadius: 8,

  cursor: "pointer"
};

const th = {

  border:
    "1px solid #ddd",

  padding: 10,

  background:
    "#f8fafc"
};

const td = {

  border:
    "1px solid #ddd",

  padding: 10,

  verticalAlign: "top"
};

export default Permissions;