import axios from "axios";

const api = axios.create({
  baseURL: "https://pis-backend-clean-new.onrender.com"
});

export default api;