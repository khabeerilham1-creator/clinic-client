import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminUsers() {

  const [users, setUsers] = useState([]);

  const load = async () => {
    const res = await axios.get("http://127.0.0.1:8000/users/pending");
    setUsers(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await axios.put(`http://127.0.0.1:8000/users/approve/${id}`);
    load();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pending Users</h1>

      {users.map(u => (
        <div key={u._id} style={{ border: "1px solid", margin: "10px", padding: "10px" }}>
          <p>{u.username}</p>
          <p>{u.role}</p>

          <button onClick={() => approve(u._id)}>
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminUsers;