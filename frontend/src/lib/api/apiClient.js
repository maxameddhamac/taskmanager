import axios from "axios";
import useAuthStore from "../../auth/authStore";

// Get base URL and ensure it includes /api
const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
