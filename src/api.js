import axios from "axios";

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

const getDefaultBaseURL = () => {
  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  const { hostname } = window.location;
  const isLocalHost = !hostname || hostname === "localhost" || hostname === "127.0.0.1";
  const isPrivateNetwork =
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

  if (isLocalHost) {
    return "http://localhost:8000";
  }

  if (isPrivateNetwork) {
    return `http://${hostname}:8000`;
  }

  return "https://api.drzaffariqbal.com";
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
