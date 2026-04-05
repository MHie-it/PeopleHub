import apiClient from "../lib/apiClient";

export async function getUsers() {
  const response = await apiClient.get("/users");
  return response.data;
}

export async function updateUser(id, payload) {
  const response = await apiClient.put(`/users/${id}`, payload);
  return response.data;
}

export async function deleteUser(id) {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
}
