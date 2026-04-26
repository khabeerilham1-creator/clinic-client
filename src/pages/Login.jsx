const login = async () => {
  try {
    const res = await api.post("/auth/login", {
      username,
      password,
    });

    console.log("SUCCESS RESPONSE:", res.data);

    // ✅ IMPORTANT FIX
    if (res.data && res.data.access_token) {
      localStorage.setItem("token", res.data.access_token);

      alert("Login Success ✅");
      navigate("/dashboard");
    } else {
      alert("Invalid credentials ❌");
    }

  } catch (err) {
    console.log("FULL ERROR:", err);

    // 🔥 IMPORTANT: show real backend error
    if (err.response) {
      console.log("ERROR RESPONSE:", err.response.data);
      alert(err.response.data.detail || "Login Failed ❌");
    } else {
      alert("Network Error ❌");
    }
  }
};