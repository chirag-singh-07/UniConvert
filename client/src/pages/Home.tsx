import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ConversionSelector, {
  conversionOptions,
} from "../components/ConversionSelector";
import FileUploader from "../components/FileUploader";
import CompressionSelector from "../components/CompressionSelector";
import ProgressBar from "../components/ProgressBar";
import DownloadCard from "../components/DownloadCard";
import {
  convertFile,
  mergePdfs,
  compressPdf,
  ConversionResponse,
} from "../services/api";
import { validateFileSize } from "../utils/helpers";
import { Sparkles } from "lucide-react";

const Home = () => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<ConversionResponse["data"] | null>(null);

  const handleFilesSelected = (files: File[]) => {
    // Validate file sizes
    const invalidFiles = files.filter((file) => !validateFileSize(file));
    if (invalidFiles.length > 0) {
      toast.error("Some files exceed the 10MB limit");
      return;
    }

    if (selectedType === "merge-pdf") {
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 10));
    } else {
      setSelectedFiles(files.slice(0, 1));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (!selectedType) {
      toast.error("Please select a conversion type");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    if (selectedType === "merge-pdf" && selectedFiles.length < 2) {
      toast.error("Please select at least 2 PDF files to merge");
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setStatus("Uploading...");
    setResult(null);

    try {
      // Simulate upload progress
      setProgress(30);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setStatus("Converting...");
      setProgress(60);

      let response: ConversionResponse;

      if (selectedType === "merge-pdf") {
        response = await mergePdfs(selectedFiles);
      } else if (selectedType === "compress-pdf") {
        response = await compressPdf(selectedFiles[0], compressionLevel);
      } else {
        response = await convertFile(selectedFiles[0], selectedType);
      }

      setProgress(100);
      setStatus("Completed!");

      if (response.success && response.data) {
        setResult(response.data);
        toast.success("Conversion completed successfully!");
      } else {
        throw new Error(response.message || "Conversion failed");
      }
    } catch (error: any) {
      console.error("Conversion error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Conversion failed",
      );
      setStatus("Failed");
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setSelectedType("");
    setSelectedFiles([]);
    setCompressionLevel("medium");
    setIsConverting(false);
    setProgress(0);
    setStatus("");
    setResult(null);
  };

  const selectedOption = conversionOptions.find(
    (opt) => opt.id === selectedType,
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Smart Document Converter
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            UniConvert
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Convert, merge, and compress your documents with ease. Fast, secure,
            and free.
          </p>
        </motion.div>

        {/* Main Content */}
        {!result ? (
          <div className="space-y-8">
            {/* Conversion Type Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ConversionSelector
                selectedType={selectedType}
                onSelectType={setSelectedType}
              />
            </motion.div>

            {/* File Uploader */}
            {selectedType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-2xl"
              >
                <FileUploader
                  onFilesSelected={handleFilesSelected}
                  selectedFiles={selectedFiles}
                  onRemoveFile={handleRemoveFile}
                  accept={selectedOption?.accept}
                  multiple={selectedType === "merge-pdf"}
                  maxFiles={selectedType === "merge-pdf" ? 10 : 1}
                />

                {/* Compression Level Selector */}
                {selectedType === "compress-pdf" &&
                  selectedFiles.length > 0 && (
                    <div className="mt-6">
                      <CompressionSelector
                        selectedLevel={compressionLevel}
                        onSelectLevel={setCompressionLevel}
                      />
                    </div>
                  )}

                {/* Convert Button */}
                {selectedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6"
                  >
                    <button
                      onClick={handleConvert}
                      disabled={isConverting}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConverting ? "Converting..." : "Convert Now"}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Progress Bar */}
            {isConverting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-2xl"
              >
                <ProgressBar progress={progress} status={status} />
              </motion.div>
            )}
          </div>
        ) : (
          /* Download Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <DownloadCard
              originalName={result.originalName}
              convertedFileName={result.convertedFileName}
              originalSize={result.originalSize}
              convertedSize={result.convertedSize}
              compressionRatio={result.compressionRatio}
            />
            <div className="text-center mt-6">
              <button onClick={handleReset} className="btn-secondary">
                Convert Another File
              </button>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "Fast & Secure",
              description:
                "Lightning-fast conversions with secure file handling",
            },
            {
              title: "Auto Cleanup",
              description:
                "Files automatically deleted after 1 hour for privacy",
            },
            {
              title: "Multiple Formats",
              description: "Support for DOCX, PDF, PPT, Excel, and images",
            },
          ].map((feature, index) => (
            <div key={index} className="glass-card p-6 rounded-xl text-center">
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
