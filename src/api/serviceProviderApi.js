import axiosInstance from "./axiosInstance";

export const getServiceProviders = async () => {
  const response = await axiosInstance.get("/data/getData");
  return response.data?.data || [];
};

export const getServiceProviderDashboard = async () => {
  const response = await axiosInstance.get("/service-providers/dashboard");
  // Normalize possible backend shapes:
  // - response.data
  // - response.data.data
  return response.data?.data ?? response.data;
};

export const getProviderPerformance = async () => {
  const response = await axiosInstance.get("/service-providers/performance");
  return response.data;
};

export const saveServiceProviderForm = async (formData) => {
  const response = await axiosInstance.post("/data/saveData", formData);
  return response.data;
};
