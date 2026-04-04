import apiClient from "../lib/apiClient";

export async function login(payload) {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
}

export async function register(payload) {
  const response = await apiClient.post("/auth/register", payload);
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get("/auth/me");
  return response.data;
}

export async function forgotPassword(payload) {
  const response = await apiClient.post("/auth/forgot-password", payload);
  return response.data;
}

export async function changePassword(payload) {
  const response = await apiClient.post("/auth/change-password", payload);
  return response.data;
}
