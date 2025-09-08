import axios from "axios";

const api = axios.create({
  baseURL: "https://fsms-api.onrender.com" || "http://localhost:3002",
  withCredentials: true,
});

export default api;
