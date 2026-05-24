import axios from "axios";

const api = axios.create({

  baseURL:
    "https://api.drzaffariqbal.com"

});

export default api;