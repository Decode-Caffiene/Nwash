import axiosInstance from "./axiosInstance";
import mastersheetData from "../data/mastersheet.json";

export const getServiceProviders = async () => {
  try {
    const response = await axiosInstance.get("/data/getData");
    const backendData = response.data?.data || [];
    if (Array.isArray(backendData) && backendData.length > 0) {
      return backendData;
    }
  } catch (error) {
    console.warn(
      "Service-provider API unavailable; using local mastersheet data",
      error?.message || error,
    );
  }

  // Keep analytics and the registry usable when the remote API is unavailable
  // (for example, while the backend deployment or route is being restored).
  return Array.isArray(mastersheetData) ? mastersheetData : [];
};

export const saveServiceProviderForm = async (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) return;

    if (typeof value === "string" && value === "undefined") return;

    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === "object") {
      try {
        const jsonStr = JSON.stringify(value);
        if (jsonStr !== undefined && jsonStr !== "undefined") {
          formData.append(key, jsonStr);
        }
      } catch (error) {
        console.warn(`Failed to stringify ${key}:`, error);
      }
    } else {
      const strValue = String(value);
      if (strValue !== "undefined") {
        formData.append(key, strValue);
      }
    }
  });

  console.log("=== FORM DATA SENT ===");
  for (const [key, val] of formData.entries()) {
    console.log(`${key}:`, val instanceof File ? `File(${val.name})` : val);
  }

  const response = await axiosInstance.postForm("/form/upload", formData);
  return response.data;
};
