import apiClient from "../lib/apiClient";

export async function getMyContracts() {
  const { data } = await apiClient.get("/contracts/me");
  return data;
}
