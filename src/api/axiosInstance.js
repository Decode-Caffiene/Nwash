import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://dashboardbackend-1-zbud.onrender.com",
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
