import axios from "axios";

const api = axios.create({
  baseURL: "https://pis-backend-final-1.onrender.com/api"
});

export default api;