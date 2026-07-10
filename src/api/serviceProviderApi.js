import axiosInstance from "./axiosInstance";
import mastersheetData from "../data/mastersheet.json";

const hasChartIndices = (record) => {
  const summary = record?.Summary_Index;
  return summary?.SPI != null && summary?.OEI != null;
};

// The backend database can lag behind the KPI mastersheet (records with a
// null/partial Summary_Index). Fill those gaps from the bundled mastersheet,
// keeping any non-null values the backend already has.
const mergeWithMastersheet = (backendData) => {
  const localRecords = Array.isArray(mastersheetData) ? mastersheetData : [];
  const localById = new Map();
  localRecords.forEach((record) => {
    if (record?.WSUC_ID != null) {
      localById.set(Number(record.WSUC_ID), record);
    }
  });

  return backendData.map((record) => {
    if (hasChartIndices(record)) return record;

    const local = localById.get(Number(record?.WSUC_ID));
    if (!local?.Summary_Index) return record;

    const backendSummaryEntries = Object.entries(
      record?.Summary_Index || {},
    ).filter(([, value]) => value != null);

    return {
      ...record,
      Summary_Index: {
        ...local.Summary_Index,
        ...Object.fromEntries(backendSummaryEntries),
      },
    };
  });
};

export const getServiceProviders = async () => {
  try {
    const response = await axiosInstance.get("/data/getData");
    const backendData = response.data?.data || [];
    if (Array.isArray(backendData) && backendData.length > 0) {
      return mergeWithMastersheet(backendData);
    }
  } catch (error) {
    console.warn("Falling back to local mastersheet data for analytics", error);
  }

  return Array.isArray(mastersheetData) ? mastersheetData : [];
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

export const saveServiceProviderForm = async (payload, rawValues = {}) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) return;
    if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof File)
    ) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  console.log("=== FORM DATA SENT ===");
  for (const [key, val] of formData.entries()) {
    console.log(`${key}:`, val instanceof File ? `File(${val.name})` : val);
  }

  const response = await axiosInstance.post("/form/upload", formData);
  return response.data;
};
