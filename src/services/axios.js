import axios from "axios";

const api = axios.create({
  baseURL: "https://fsms-api.onrender.com",
  withCredentials: true,
});

export default api;
