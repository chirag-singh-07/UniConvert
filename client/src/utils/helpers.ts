/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Format date to readable format
 */
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

/**
 * Validate file size (max 10MB)
 */
export const validateFileSize = (file: File): boolean => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSize;
};

/**
 * Get conversion type label
 */
export const getConversionTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    "docx-to-pdf": "DOCX → PDF",
    "pdf-to-docx": "PDF → DOCX",
    "ppt-to-pdf": "PPT → PDF",
    "excel-to-pdf": "Excel → PDF",
    "image-to-pdf": "Image → PDF",
    "merge-pdf": "Merge PDFs",
    "compress-pdf": "Compress PDF",
  };
  return labels[type] || type;
};
