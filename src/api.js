import axios from "axios";

const api = axios.create({
  baseURL: "https://pis-backend-final-1.onrender.com/api/api/api"
});

export default api;