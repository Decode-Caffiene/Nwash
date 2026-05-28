import axiosInstance from "./axiosInstance";

export const getServiceProviders = async () => {
  const response = await axiosInstance.get("/data/getData");
  return response.data?.data || [];
};

export const getServiceProviderDashboard = async () => {
  const response = await axiosInstance.get("/service-providers/dashboard");
  return response.data;
};

export const getProviderPerformance = async () => {
  const response = await axiosInstance.get("/service-providers/performance");
  return response.data;
};
