// src/lib/api.js
import axios from "axios";
import { auth } from "@/lib/firebase";

// Base URL from environment or fallback to localhost
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/";

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Firebase Auth token to every request
api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;

  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Failed to get Firebase ID token:", error);
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
