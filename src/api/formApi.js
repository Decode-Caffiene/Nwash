import axiosInstance from "./axiosInstance";

export const getFormData = async () => {
  const response = await axiosInstance.get("/form/getFormData");
  return response.data?.data ?? response.data;
};

// NOTE: update these paths to match your backend's accept/reject endpoints
export const acceptFormSubmission = async (id) => {
  const response = await axiosInstance.patch(`/form/updateStatus/${id}`, {
    status: "accepted",
  });
  return response.data;
};

export const rejectFormSubmission = async (id) => {
  const response = await axiosInstance.patch(`/form/updateStatus/${id}`, {
    status: "rejected",
  });
  return response.data;
};
