import apiClient from "../lib/apiClient";

export async function getDepartments() {
  const response = await apiClient.get("/departments/list");
  return response.data;
}

export async function createDepartment(payload) {
  const response = await apiClient.post("/departments/create", payload);
  return response.data;
}

export async function updateDepartment(id, payload) {
  const response = await apiClient.put(`/departments/update/${id}`, payload);
  return response.data;
}

export async function deleteDepartment(id) {
  const response = await apiClient.delete(`/departments/delete/${id}`);
  return response.data;
}
