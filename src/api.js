import axios from "axios";

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

const getDefaultBaseURL = () => {
  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  const { hostname, protocol } = window.location;
  const isLocalHost = !hostname || hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocalHost) {
    return "http://localhost:8000";
  }

  if (protocol === "https:") {
    return "https://api.drzaffariqbal.com";
  }

  return `http://${hostname}:8000`;
};

const api = axios.create({

  baseURL:
    stripTrailingSlash(process.env.REACT_APP_API_URL || getDefaultBaseURL()),

  timeout:
    15000

});

api.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
