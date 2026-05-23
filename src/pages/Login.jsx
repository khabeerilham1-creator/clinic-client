import React, { useState } from "react";
import api from "../api";

function Login() {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = async () => {

    try {

      const response =
        await api.post(
          "/login",
          {
            username,
            password,
          }
        );

      localStorage.setItem(
        "token",
        response.data.token
      );

      window.location.href = "/";

    } catch (error) {

      alert("Invalid Credentials");

    }

  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">

      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl">

        <h1 className="text-4xl font-bold text-center mb-3">
          HDC Dental
        </h1>

        <p className="text-center text-gray-500 mb-10">
          Clinic Management System
        </p>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e)=>
              setUsername(
                e.target.value
              )
            }
            className="w-full border p-4 rounded-2xl"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>
              setPassword(
                e.target.value
              )
            }
            className="w-full border p-4 rounded-2xl"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-[#176bff] text-white py-4 rounded-2xl text-lg font-semibold"
          >
            Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;