import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminUsers() {

  const [users, setUsers] = useState([]);

  const BASE_URL = "https://pis-backend-final-1.onrender.com";

  const load = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users/pending`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      await axios.put(`${BASE_URL}/users/approve/${id}`);
      load();
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pending Users Approval Panel ✅</h1>

      <p>
        This section allows admin to approve newly registered users.
        Only approved users will be able to access the system.
      </p>

      {users.length === 0 && <p>No pending users found.</p>}

      {users.map(u => (
        <div
          key={u._id}
          style={{
            border: "1px solid #ccc",
            margin: "10px 0",
            padding: "10px",
            borderRadius: "8px"
          }}
        >
          <p><strong>Username:</strong> {u.username}</p>
          <p><strong>Role:</strong> {u.role}</p>

          <button onClick={() => approve(u._id)}>
            Approve User
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminUsers;