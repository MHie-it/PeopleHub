import apiClient from "../lib/apiClient";

export async function getPositions() {
  const response = await apiClient.get("/positions");
  return response.data;
}

export async function createPosition(payload) {
  const response = await apiClient.post("/positions", payload);
  return response.data;
}

export async function updatePosition(id, payload) {
  const response = await apiClient.put(`/positions/${id}`, payload);
  return response.data;
}

export async function deletePosition(id) {
  const response = await apiClient.delete(`/positions/${id}`);
  return response.data;
}
