import apiClient from "../lib/apiClient";

export async function getRoles() {
  const response = await apiClient.get("/role");
  return response.data;
}

export async function createRole(payload) {
  const response = await apiClient.post("/role", payload);
  return response.data;
}

export async function updateRole(id, payload) {
  const response = await apiClient.put(`/role/${id}`, payload);
  return response.data;
}

export async function deleteRole(id) {
  const response = await apiClient.delete(`/role/${id}`);
  return response.data;
}
