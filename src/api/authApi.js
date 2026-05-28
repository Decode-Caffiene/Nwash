import axiosInstance from "./axiosInstance";

export const login = async ({ username, password }) => {
  const response = await axiosInstance.post("/auth/login", {
    username,
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
