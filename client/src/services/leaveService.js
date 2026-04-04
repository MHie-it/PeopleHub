import apiClient from "../lib/apiClient";

export async function createLeave(payload) {
  const response = await apiClient.post("/leaves", payload);
  return response.data;
}

export async function getLeaves() {
  const response = await apiClient.get("/leaves");
  return response.data;
}

export async function leaderActionLeave(id, payload) {
  const response = await apiClient.put(`/leaves/${id}/leader`, payload);
  return response.data;
}

export async function bossActionLeave(id, payload) {
  const response = await apiClient.put(`/leaves/${id}/boss`, payload);
  return response.data;
}
