import apiClient from "../lib/apiClient";

export async function checkIn(payload = {}) {
  const response = await apiClient.post("/attendance/check-in", payload);
  return response.data;
}

export async function checkOut(payload = {}) {
  const response = await apiClient.post("/attendance/check-out", payload);
  return response.data;
}
