import React, { useState } from "react";

import api from "../api";

import {
  useNavigate
} from "react-router-dom";

function Login() {

  const navigate =
    useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  // =========================
  // LOGIN
  // =========================
  const login = async () => {

    try {

      const res =
        await api.post(

          "/auth/login",

          {
            username,
            password
          },

          {
            headers: {
              "Content-Type":
                "application/json"
            }
          }
        );

      // =========================
      // SAVE
      // =========================
      localStorage.setItem(
        "token",
        res.data.access_token
      );

      localStorage.setItem(
        "role",
        res.data.role
      );

      localStorage.setItem(
        "username",
        res.data.username
      );

      // 🔥 SAVE PERMISSIONS
      localStorage.setItem(

        "permissions",

        JSON.stringify(
          res.data.permissions || {}
        )
      );

      alert(
        "Login Successful ✅"
      );

      navigate("/dashboard");

    } catch (err) {

      console.log(
        "LOGIN ERROR:",
        err.response?.data
      );

      alert(

        err.response?.data?.detail ||

        "Login failed ❌"
      );
    }
  };

  return (

    <div style={{

      display: "flex",

      minHeight: "100vh",

      background: "#f8fafc"

    }}>

      {/* LEFT */}
      <div style={{

        width: 260,

        background: "#0f172a",

        color: "white",

        padding: 30,

        display: "flex",

        flexDirection: "column",

        justifyContent: "center",

        borderRight:
          "1px solid #1e293b"

      }}>

        <h1 style={{

          fontSize: 40,

          marginBottom: 10

        }}>
          HDC
        </h1>

        <p style={{

          color: "#94a3b8",

          lineHeight: 1.7

        }}>
          Holistic Domain of Creativity
        </p>

      </div>

      {/* RIGHT */}
      <div style={{

        flex: 1,

        display: "flex",

        justifyContent: "center",

        alignItems: "center"

      }}>

        <div style={{

          background: "white",

          padding: 35,

          borderRadius: 14,

          width: 360,

          boxShadow:
            "0 4px 20px rgba(0,0,0,0.08)"

        }}>

          <h2 style={{

            marginBottom: 25,

            color: "#0f172a"

          }}>
            Login
          </h2>

          <input
            placeholder="Username"

            value={username}

            onChange={(e)=>

              setUsername(
                e.target.value
              )
            }

            style={{

              width: "100%",

              padding: 12,

              marginBottom: 18,

              borderRadius: 10,

              border:
                "1px solid #cbd5e1",

              outline: "none",

              boxSizing:
                "border-box"

            }}
          />

          <div style={{
            position: "relative"
          }}>

            <input

              type={
                showPassword
                  ? "text"
                  : "password"
              }

              placeholder="Password"

              value={password}

              onChange={(e)=>

                setPassword(
                  e.target.value
                )
              }

              style={{

                width: "100%",

                padding: 12,

                marginBottom: 20,

                borderRadius: 10,

                border:
                  "1px solid #cbd5e1",

                outline: "none",

                boxSizing:
                  "border-box"

              }}
            />

            <button

              type="button"

              onClick={() =>

                setShowPassword(
                  !showPassword
                )
              }

              style={{

                position: "absolute",

                right: 10,

                top: 8,

                border: "none",

                background:
                  "transparent",

                cursor: "pointer",

                fontSize: 18

              }}
            >

              {showPassword
                ? "🙈"
                : "👁️"}

            </button>

          </div>

          <button

            onClick={login}

            style={{

              width: "100%",

              padding: 12,

              background: "#0f172a",

              color: "white",

              border: "none",

              borderRadius: 10,

              cursor: "pointer",

              fontWeight: "bold"

            }}
          >
            Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;