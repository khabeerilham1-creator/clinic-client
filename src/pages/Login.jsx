import React, { useState } from "react";

import api from "../api";

function Login({ onLogin }) {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async () => {

    try {

      setLoading(true);

      const response =
        await api.post(
          "/login",
          {
            username:
              username.trim(),

            password:
              password.trim(),
          }
        );

      console.log(response.data);

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "role",
        response.data.role
      );

      if (onLogin) {

        onLogin(
          response.data.token
        );

      } else {

        window.location.reload();

      }

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.detail
        ||
        "Login Failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white rounded-[35px] shadow-2xl overflow-hidden border">

        {/* TOP */}
        <div className="bg-gradient-to-r from-[#02152d] to-[#0d4fc9] text-white p-12 text-center">

          <div className="text-7xl mb-5">
            🦷
          </div>

          <h1 className="text-5xl font-bold">
            HDC Dental
          </h1>

          <p className="mt-3 text-white/80 text-lg">
            Clinic Management System
          </p>

        </div>

        {/* FORM */}
        <div className="p-10">

          <div className="space-y-6">

            {/* USERNAME */}
            <div>

              <label className="block mb-3 font-semibold text-gray-700">
                Username
              </label>

              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e)=>
                  setUsername(
                    e.target.value
                  )
                }
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-2xl
                  p-4
                  text-lg
                  outline-none
                  focus:border-[#176bff]
                "
              />

            </div>

            {/* PASSWORD */}
            <div>

              <label className="block mb-3 font-semibold text-gray-700">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e)=>
                    setPassword(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-2xl
                    p-4
                    pr-16
                    text-lg
                    outline-none
                    focus:border-[#176bff]
                  "
                />

                <button
                  type="button"
                  onClick={()=>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-2xl
                  "
                >

                  {
                    showPassword
                      ? "🙈"
                      : "👁️"
                  }

                </button>

              </div>

            </div>

            {/* LOGIN BUTTON */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="
                w-full
                bg-[#176bff]
                hover:bg-[#0f58d6]
                text-white
                py-4
                rounded-2xl
                text-xl
                font-semibold
                transition
                shadow-xl
              "
            >

              {
                loading
                  ? "Logging in..."
                  : "Login"
              }

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Login;