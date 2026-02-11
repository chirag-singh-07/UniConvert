import { Download, CheckCircle, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { formatBytes } from "../utils/helpers";
import { getDownloadUrl } from "../services/api";

interface DownloadCardProps {
  originalName: string;
  convertedFileName: string;
  originalSize: number;
  convertedSize: number;
  compressionRatio?: string;
}

const DownloadCard = ({
  originalName,
  convertedFileName,
  originalSize,
  convertedSize,
  compressionRatio,
}: DownloadCardProps) => {
  const handleDownload = () => {
    window.open(getDownloadUrl(convertedFileName), "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 rounded-2xl"
    >
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full"
        >
          <CheckCircle className="w-16 h-16 text-green-600" />
        </motion.div>
      </div>

      <h3 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-slate-100">
        Conversion Successful!
      </h3>
      <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
        Your file has been converted successfully
      </p>

      {/* File Info */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 space-y-3">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Original File
            </p>
            <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {originalName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Original Size
            </p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {formatBytes(originalSize)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Converted Size
            </p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {formatBytes(convertedSize)}
            </p>
          </div>
        </div>

        {compressionRatio && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Compression Ratio
            </p>
            <p className="font-semibold text-green-600">
              {compressionRatio} reduction
            </p>
          </div>
        )}
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        <Download className="w-5 h-5" />
        <span>Download File</span>
      </button>

      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
        Files are automatically deleted after 1 hour
      </p>
    </motion.div>
  );
};

export default DownloadCard;
