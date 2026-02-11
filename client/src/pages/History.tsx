import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Download, FileText, Loader2, AlertCircle } from "lucide-react";
import { getHistory, HistoryRecord, getDownloadUrl } from "../services/api";
import {
  formatBytes,
  formatDate,
  getConversionTypeLabel,
} from "../utils/helpers";
import toast from "react-hot-toast";

const History = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getHistory(50);
      if (response.success) {
        setRecords(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch history:", error);
      setError("Failed to load conversion history");
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "processing":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "failed":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Conversion History
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View your recent document conversions
          </p>
        </motion.div>

        {/* Records */}
        {records.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 rounded-2xl text-center"
          >
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              No conversions yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your conversion history will appear here
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {records.map((record, index) => (
              <motion.div
                key={record._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 rounded-xl hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  {/* File Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {record.originalName}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(record.createdAt)}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        {getConversionTypeLabel(record.conversionType)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full ${getStatusColor(record.status)}`}
                      >
                        {record.status.charAt(0).toUpperCase() +
                          record.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* File Sizes */}
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Original
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatBytes(record.fileSize)}
                      </p>
                    </div>
                    {record.convertedFileSize && (
                      <>
                        <div className="text-slate-400">→</div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            Converted
                          </p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatBytes(record.convertedFileSize)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Download Button */}
                  {record.status === "completed" &&
                    record.convertedFileName && (
                      <a
                        href={getDownloadUrl(record.convertedFileName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex items-center space-x-2 whitespace-nowrap"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    )}

                  {record.status === "failed" && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {record.errorMessage || "Conversion failed"}
                    </div>
                  )}
                </div>

                {/* Download Count */}
                {record.downloadCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Downloaded {record.downloadCount} time
                      {record.downloadCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
