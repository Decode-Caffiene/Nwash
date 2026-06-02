import axiosInstance from "./axiosInstance";

export const getRegulatoryRoadmap = async () => {
  const response = await axiosInstance.get("/regulatory-roadmap");
  return response.data;
};

export const getRoadmapSummary = async () => {
  const response = await axiosInstance.get("/regulatory-roadmap/summary");
  return response.data;
};

export const getMilestones = async () => {
  const response = await axiosInstance.get("/regulatory-roadmap/milestones");
  // Normalize possible backend shapes:
  // - response.data
  // - response.data.data
  // - response.data.milestones
  return response.data?.data ?? response.data?.milestones ?? response.data;
};
