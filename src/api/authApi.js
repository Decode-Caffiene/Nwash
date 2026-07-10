import axiosInstance from "./axiosInstance";

export const login = async ({ userName, password }) => {
  const response = await axiosInstance.post("/auth/adminLogin", {
    userName,
    password,
  });

  return response.data;
};

export const logout = async () => {
  return axiosInstance.post("/auth/logout");
};

export const refreshToken = async () => {
  const response = await axiosInstance.post("/auth/refresh");
  return response.data;
};
