import apiClient from "../lib/apiClient";

export async function uploadUserAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.put("/upload/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
