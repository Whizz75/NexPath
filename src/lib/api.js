// src/lib/api.js
import axios from "axios";

// Create a reusable Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send cookies for session auth
});

// Optional: Request interceptor (for adding tokens if needed)
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: Response interceptor for centralized error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

export default api;
