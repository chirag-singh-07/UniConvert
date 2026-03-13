import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ConversionResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    originalName: string;
    convertedFileName: string;
    originalSize: number;
    convertedSize: number;
    compressionRatio?: string;
    downloadUrl: string;
  };
}

export interface HistoryRecord {
  _id: string;
  originalName: string;
  fileName: string;
  convertedFileName?: string;
  conversionType: string;
  fileSize: number;
  convertedFileSize?: number;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryResponse {
  success: boolean;
  data: HistoryRecord[];
}

/**
 * Convert a file
 */
export const convertFile = async (
  file: File,
  conversionType: string,
  extraParam?: string,
): Promise<ConversionResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("conversionType", conversionType);
  if (extraParam) formData.append("extraParam", extraParam);

  const response = await api.post<ConversionResponse>("/convert", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

/**
 * Merge PDFs
 */
export const mergePdfs = async (files: File[]): Promise<ConversionResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post<ConversionResponse>("/merge", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Compress PDF
 */
export const compressPdf = async (
  file: File,
  compressionLevel: "low" | "medium" | "high",
): Promise<ConversionResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("compressionLevel", compressionLevel);

  const response = await api.post<ConversionResponse>("/compress", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Get conversion history
 */
export const getHistory = async (
  limit: number = 50,
): Promise<HistoryResponse> => {
  const response = await api.get<HistoryResponse>("/history", {
    params: { limit },
  });

  return response.data;
};

/**
 * Get download URL
 */
export const getDownloadUrl = (filename: string): string => {
  return `${API_URL}/api/download/${filename}`;
};

export default api;
