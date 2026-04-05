import apiClient from "../lib/apiClient";

export async function calculatePayroll(payload) {
  const response = await apiClient.post("/payrolls/calculate", payload);
  return response.data;
}

export async function sendPayrollEmail(payrollId) {
  const response = await apiClient.post(`/payrolls/${payrollId}/send-email`);
  return response.data;
}
