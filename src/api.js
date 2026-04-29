import axios from "axios";

await axios.post(
  "https://pis-backend-final-1.onrender.com/auth/login",
  { username, password }
);