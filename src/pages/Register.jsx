import React, { useState } from "react";
import axios from "axios";

function Register() {

  const [data, setData] = useState({
    username: "",
    password: "",
    role: "office"
  });

  const register = async () => {
    await axios.post("http://127.0.0.1:8000/register", data);
    alert("Registered");
  };

  return (
    <div style={{ padding: "50px" }}>
      <h1>Register</h1>

      <input placeholder="Username" onChange={e=>setData({...data, username:e.target.value})}/>
      <input type="password" placeholder="Password" onChange={e=>setData({...data, password:e.target.value})}/>

      <select onChange={e=>setData({...data, role:e.target.value})}>
        <option value="admin">Admin</option>
        <option value="office">Office</option>
      </select>

      <button onClick={register}>Register</button>
    </div>
  );
}

export default Register;