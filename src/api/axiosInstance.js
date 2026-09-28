import axios from "axios";

const axiosInstance = axios.create({
  // Use the Vite proxy in development (configured by VITE_API_BASE_URL=/api)
  // so API requests do not depend on cross-origin browser access.
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 80000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      // ↓ Only redirect if the user had an active session.
      // A first-time visitor should never be pushed to /login.
      const wasLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (wasLoggedIn) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
