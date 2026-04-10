export const getErrorMessage = (err) => {
  if (!err) return "Unknown error";

  if (err.response?.data?.detail) {
    const detail = err.response.data.detail;

    if (Array.isArray(detail)) {
      return detail[0]?.msg || "Validation error";
    }

    if (typeof detail === "string") {
      return detail;
    }
  }

  if (typeof err === "string") {
    return err;
  }

  return err.message || "Something went wrong";
};
