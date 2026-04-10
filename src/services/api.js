import axios from "axios";

export const TOKEN_KEY = "token";
export const THEME_KEY = "fitness_theme";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
console.log("🔌 API URL configured:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout (increased from 10s)
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("📤 Request error:", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.config.method.toUpperCase()} ${response.config.url} -> ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`📥 Response error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error("  Status:", error.response?.status);
    console.error("  Message:", error.response?.data?.detail || error.message);
    return Promise.reject(error);
  }
);

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const decodeToken = () => {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(window.atob(padded));
    return decoded;
  } catch {
    return null;
  }
};

export const signupUser = ({ email, password }) =>
  api.post("/signup", {
    email: email.trim(),
    password,
  });

export const loginUser = ({ email, password }) =>
  api.post("/login", {
    email: email.trim(),
    password,
  });

export const getProfile = () => api.get("/profile");
export const getMyProfile = () => api.get("/profile");

export const updateProfile = (payload) => api.put("/profile", payload);
export const saveProfile = (payload) => api.put("/profile", payload);

export const getHistory = () => api.get("/history");
export const createHistoryEntry = (payload) => api.post("/history", payload);
export const getWorkoutLogs = () => api.get("/workout-log");
export const createWorkoutLog = (payload) => api.post("/workout-log", payload);
export const getWorkoutProgress = () => api.get("/workout-progress");
export const getNutritionPlan = () => api.get("/nutrition-plan");
export const searchNutrition = (query) => api.post("/nutrition", { query });
export const getNutritionLogs = () => api.get("/nutrition-log");
export const createNutritionLog = (payload) => api.post("/nutrition-log", payload);
export const getChatHistory = () => api.get("/chat-history");
export const saveChatHistory = (payload) => api.post("/chat-history", payload);
export const clearChatHistory = () => api.delete("/chat-history");

export const sendChatMessage = (message) =>
  api.post("/chat", {
    user_input: message,
  });

export async function resolvePostLoginRoute() {
  try {
    await getProfile();
    return "/dashboard";
  } catch (error) {
    if (error.response?.status === 404) {
      return "/profile";
    }
    throw error;
  }
}

export default api;
