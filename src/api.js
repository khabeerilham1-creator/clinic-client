import axios from "axios";

const api = axios.create({
  baseURL: "https://pis-backend-final-1.onrender.com"
});

// ✅ attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN:", token); // DEBUG

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;