import apiClient from "../lib/apiClient";

export async function getDepartments() {
  const response = await apiClient.get("/departments/list");
  return response.data;
}

export async function createDepartment(payload) {
  const response = await apiClient.post("/departments/create", payload);
  return response.data;
}
