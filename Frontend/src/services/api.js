import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    // ✅ Try both storage patterns safely
    const token =
      localStorage.getItem("token") ||
      JSON.parse(localStorage.getItem("userInfo"))?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------- AUTH API ----------------
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
};

// ---------------- EXPENSE API ----------------
export const expenseAPI = {
  create: (data) => api.post("/expenses", data),
  getAll: () => api.get("/expenses"),
  delete: (id) => api.delete(`/expenses/${id}`),
  getStats: () => api.get("/expenses/stats"),
  getInsights: () => api.get("/expenses/insights"),
};

export const aiAPI = {
  categorize: (description) =>
    api.post("/ai/categorize", { description }),
};
export const notificationAPI = {
  getAll: () => axios.get("/api/notifications")
};


export default api;

