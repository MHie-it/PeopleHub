import apiClient from "../lib/apiClient";

export async function getMyEmployeeProfile() {
  const response = await apiClient.get("/employees/me");
  return response.data;
}

export async function getEmployees() {
  const response = await apiClient.get("/employees");
  return response.data;
}

export async function getEmployeeById(id) {
  const response = await apiClient.get(`/employees/${id}`);
  return response.data;
}

export async function createEmployee(payload) {
  const response = await apiClient.post("/employees/create", payload);
  return response.data;
}

export async function updateEmployee(id, payload) {
  const response = await apiClient.put(`/employees/${id}`, payload);
  return response.data;
}

export async function deleteEmployee(id) {
  const response = await apiClient.delete(`/employees/${id}`);
  return response.data;
}
