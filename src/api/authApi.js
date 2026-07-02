import axiosInstance from "./axiosInstance";

export const login = async ({ userName, password }) => {
  console.log("username and password", userName);
  console.log("username and password", password);
  const response = await axiosInstance.post("/auth/adminLogin", {
    userName,
    password,
  });

  console.log("response ", response.data);
  return response.data;
};

export const logout = async () => {
  return axiosInstance.post("/auth/logout");
};

export const refreshToken = async () => {
  const response = await axiosInstance.post("/auth/refresh");
  return response.data;
};
