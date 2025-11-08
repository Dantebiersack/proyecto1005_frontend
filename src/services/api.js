import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://nearbizbackend2.onrender.com/api",
});

// Leer token del storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nearbiz_token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export default api;
