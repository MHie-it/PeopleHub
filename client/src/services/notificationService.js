import apiClient from "../lib/apiClient";

export async function getNotificationsByUser(userId) {
  const response = await apiClient.get(`/notifi/user/${userId}`);
  return response.data;
}

export async function createNotification(payload) {
  const response = await apiClient.post("/notifi", payload);
  return response.data;
}

export async function markNotificationRead(id) {
  const response = await apiClient.put(`/notifi/${id}/read`);
  return response.data;
}

export async function createGlobalNotification(payload) {
  const response = await apiClient.post("/notifi/send-all", payload);
  return response.data;
}

