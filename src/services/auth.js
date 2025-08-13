import api from "./axios";

// Persist token in localStorage for simplicity. Switch to cookies/HttpOnly in production.
const TOKEN_KEY = "fsms_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function login({ email, password }) {
  const response = await api.post(`/api/auth/login`, { email, password });
  const { token, user } = response.data || {};
  if (token) setToken(token);
  return { token, user };
}

export async function register(payload) {
  // payload: { fullName, branch, email, phone, password, confirmPassword, role, department }
  const response = await api.post(`/api/auth/register`, payload);
  const { token, user } = response.data || {};
  if (token) setToken(token);
  return { token, user };
}

export async function logout() {
  try {
    await api.post(`/api/auth/logout`);
  } finally {
    setToken(null);
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get(`/api/auth/profile`);
    return response.data;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

// Attach token to requests if available
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
