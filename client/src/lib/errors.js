export function normalizeValidationErrors(errors) {
  if (!Array.isArray(errors)) {
    return null;
  }

  const messages = errors
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }

      if (entry && typeof entry === "object") {
        const pair = Object.entries(entry)[0];
        if (pair) {
          return `${pair[0]}: ${pair[1]}`;
        }
      }

      return null;
    })
    .filter(Boolean);

  return messages.length > 0 ? messages.join(" | ") : null;
}

export function extractErrorMessage(error, fallback = "Unexpected error") {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  const validationMessage = normalizeValidationErrors(responseData);
  if (validationMessage) {
    return validationMessage;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
}
