import axiosInstance from "./axiosInstance";

export const getFormData = async () => {
  const response = await axiosInstance.get("/form/getFormData");
  return response.data?.data ?? response.data;
};

export const acceptFormSubmission = async (id, userEmail) => {
  const response = await axiosInstance.patch("/admin/approve", { id, userEmail });
  return response.data;
};

export const rejectFormSubmission = async (id, reason, userEmail) => {
  const response = await axiosInstance.patch(`/admin/reject/${id}`, { reason, userEmail });
  return response.data;
};
