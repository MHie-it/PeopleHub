import apiClient from "../lib/apiClient";

export async function setSalary(payload) {
  const response = await apiClient.post("/salary", payload);
  return response.data;
}

export async function getSalaryHistory(employeeId) {
  const response = await apiClient.get(`/salary/${employeeId}`);
  return response.data;
}
