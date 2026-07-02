import axiosInstance from "../api/axiosInstance";

export const getMapData = async () => {
  const response = await axiosInstance.get("/data/getData");
  return response.data?.data || response.data;
};

export const getMuniGeojson = async () => {
  const res = await fetch(
    new URL("../data/nepal_municipalities.json", import.meta.url),
  );
  return res.json();
};

export const filterWards = async (body) => {
  console.log("wards covered body", body);
  const response = await axiosInstance.post("/ward/filter", body);
  return response.data;
};
