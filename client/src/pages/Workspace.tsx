import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import FileUploader from "../components/FileUploader";
import CompressionSelector from "../components/CompressionSelector";
import ProgressBar from "../components/ProgressBar";
import DownloadCard from "../components/DownloadCard";
import {
  conversionCategories,
  conversionOptions,
  ConversionOption,
} from "../components/ConversionSelector";
import { convertFile, mergePdfs, compressPdf, ConversionResponse } from "../services/api";
import { processClientSide, CLIENT_SIDE_TOOLS } from "../services/clientConverter";
import { validateFileSize } from "../utils/helpers";
import {
  Zap, CheckCircle2, ArrowRight, Save, ChevronRight,
  Sparkles, Info, Download,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import LoginModal from "../components/LoginModal";

// ─── Extra-param tools that need a prompt ───────────────────────────────────

const PARAM_TOOLS: Record<string, { label: string; placeholder: string; hint?: string }> = {
  "qr-code-gen":       { label: "Text or URL",       placeholder: "https://example.com",     hint: "Enter any URL or text to encode" },
  "watermark-image":   { label: "Watermark Text",    placeholder: "© My Company",            hint: "Text placed diagonally on the image" },
  "watermark-pdf":     { label: "Watermark Text",    placeholder: "CONFIDENTIAL",            hint: "Semi-transparent text on each page" },
  "rotate-image":      { label: "Angle (degrees)",   placeholder: "90",                      hint: "e.g. 90, 180, 270" },
  "rotate-pdf":        { label: "Angle (degrees)",   placeholder: "90",                      hint: "Applied to every page" },
  "resize-image":      { label: "Dimensions (WxH)",  placeholder: "1920x1080",               hint: "Width × Height in pixels" },
  "extract-pdf-pages": { label: "Pages",             placeholder: "1-3,5,7",                 hint: "Comma-separated ranges (1-indexed)" },
};

const SERVER_SPLIT_TOOL = "split-pdf";

// ─── Component ───────────────────────────────────────────────────────────────

const Workspace = () => {
  const [selectedType, setSelectedType]         = useState("");
  const [selectedFiles, setSelectedFiles]       = useState<File[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<"low" | "medium" | "high">("medium");
  const [isConverting, setIsConverting]         = useState(false);
  const [progress, setProgress]                 = useState(0);
  const [status, setStatus]                     = useState("");
  const [result, setResult]                     = useState<ConversionResponse["data"] | null>(null);
  const [clientResult, setClientResult]         = useState<{ blobUrl: string; filename: string; size: number } | null>(null);
  const [activeCategory, setActiveCategory]     = useState(conversionCategories[0].id);
  const [extraParam, setExtraParam]             = useState("");

  const { user, conversionCount, incrementConversion } = useAuth();
  const [showLoginModal, setShowLoginModal]     = useState(false);
  const [loginModalTitle, setLoginModalTitle]   = useState("Login Required");
  const [loginModalSubtitle, setLoginModalSubtitle] = useState("Sign in to continue");
  const [saveToAccount, setSaveToAccount]       = useState(false);

  const isClientTool = CLIENT_SIDE_TOOLS.has(selectedType);
  const isQrTool     = selectedType === "qr-code-gen";
  const paramConfig  = PARAM_TOOLS[selectedType];
  const selectedOption = conversionOptions.find((o) => o.id === selectedType);
  const currentCategory = conversionCategories.find((c) => c.id === activeCategory);
  const remainingFree   = user ? Infinity : Math.max(0, 3 - conversionCount);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectType = (type: string) => {
    const option = conversionOptions.find((o) => o.id === type);
    if (option?.badge === "Soon") {
      toast("Coming soon! This feature is currently in development.", { icon: "🚀" });
      return;
    }
    setSelectedType(type);
    setSelectedFiles([]);
    setResult(null);
    setClientResult(null);
    setExtraParam("");
    setProgress(0);
    setStatus("");
  };

  const handleFilesSelected = (files: File[]) => {
    const invalid = files.filter((f) => !validateFileSize(f));
    if (invalid.length > 0) { toast.error("Some files exceed the 10MB limit"); return; }
    if (selectedType === "merge-pdf") {
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 10));
    } else if (isQrTool) {
      // QR tool doesn't need a file — handled by extraParam
    } else {
      setSelectedFiles(files.slice(0, 1));
    }
  };

  const handleRemoveFile = (i: number) => setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && !user) {
      setLoginModalTitle("Create an account to save files");
      setLoginModalSubtitle("Log in or sign up to store converted files securely in your account.");
      setShowLoginModal(true);
      setSaveToAccount(false);
    } else {
      setSaveToAccount(e.target.checked);
    }
  };

  const handleConvert = async () => {
    if (!selectedType) { toast.error("Please select a tool"); return; }
    if (!isQrTool && selectedFiles.length === 0) { toast.error("Please upload a file"); return; }
    if (selectedType === "merge-pdf" && selectedFiles.length < 2) { toast.error("Please select at least 2 PDF files to merge"); return; }
    if (paramConfig && !extraParam.trim()) { toast.error(`Please fill in "${paramConfig.label}"`); return; }

    if (!user && conversionCount >= 3) {
      setLoginModalTitle("Usage Limit Reached");
      setLoginModalSubtitle("You've used your 3 free anonymous conversions. Log in or sign up to convert unlimited files for free!");
      setShowLoginModal(true);
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setStatus("Processing...");
    setResult(null);
    setClientResult(null);

    try {
      // ── Client-side path ──────────────────────────────────────────────────
      if (isClientTool) {
        setProgress(40);
        const res = await processClientSide(selectedType, selectedFiles, extraParam || undefined);
        setProgress(100);
        setStatus("Done!");

        if (res.blob && res.filename) {
          const blobUrl = URL.createObjectURL(res.blob);
          setClientResult({ blobUrl, filename: res.filename, size: res.blob.size });
          toast.success("Conversion completed!");
          incrementConversion();
        } else {
          throw new Error("Processing failed");
        }
        return;
      }

      // ── Server-side path ──────────────────────────────────────────────────
      setProgress(30);
      await new Promise((r) => setTimeout(r, 400));
      setStatus("Converting...");
      setProgress(60);

      let response: ConversionResponse;

      if (selectedType === "merge-pdf") {
        response = await mergePdfs(selectedFiles);
      } else if (selectedType === "compress-pdf") {
        response = await compressPdf(selectedFiles[0], compressionLevel);
      } else if (selectedType === SERVER_SPLIT_TOOL) {
        // Split goes to dedicated endpoint via generic convertFile with type flag
        response = await convertFile(selectedFiles[0], "split-pdf");
      } else {
        response = await convertFile(selectedFiles[0], selectedType, extraParam || undefined);
      }

      setProgress(100);
      setStatus("Completed!");

      if (response.success && response.data) {
        setResult(response.data);
        incrementConversion();
        toast.success(saveToAccount && user ? "Converted & saved to your account!" : "Conversion completed!");
      } else {
        throw new Error(response.message || "Conversion failed");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Conversion failed");
      setStatus("Failed");
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setSelectedType(""); setSelectedFiles([]); setCompressionLevel("medium");
    setIsConverting(false); setProgress(0); setStatus("");
    setResult(null); setClientResult(null); setExtraParam("");
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const showUploadPanel = selectedType && !result && !clientResult;
  const isDone = !!(result || clientResult);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[35%] h-[45%] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[35%] h-[45%] rounded-full bg-violet-400/10 dark:bg-violet-600/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-10 max-w-[1400px] mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">All-in-One Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Your File Toolkit</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">Convert, compress, merge and manage — all in one place.</p>
          </div>
          {!user && (
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl px-5 py-3 text-amber-700 dark:text-amber-400 text-sm shrink-0">
              <Info className="w-5 h-5 shrink-0" />
              <span>
                <strong>{remainingFree}</strong> free conversion{remainingFree !== 1 ? "s" : ""} left ·{" "}
                <button
                  onClick={() => { setLoginModalTitle("Unlimited Conversions"); setLoginModalSubtitle("Create a free account to enjoy unlimited file conversions."); setShowLoginModal(true); }}
                  className="font-bold underline underline-offset-2 hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
                >Login for unlimited</button>
              </span>
            </div>
          )}
        </motion.div>

        {/* Layout */}
        <div className="flex gap-6 items-start">

          {/* Sidebar */}
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex flex-col w-60 shrink-0 gap-1"
          >
            {conversionCategories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left w-full transition-all duration-200 font-semibold text-sm
                  ${activeCategory === cat.id ? `${cat.bgColor} ${cat.color} shadow-sm` : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"}`}
              >
                <span className={`${activeCategory === cat.id ? cat.color : "text-slate-400 dark:text-slate-500"} transition-colors`}>{cat.icon}</span>
                {cat.label}
                <ChevronRight className={`w-4 h-4 ml-auto transition-transform duration-200 ${activeCategory === cat.id ? "rotate-90 " + cat.color : "text-slate-300 dark:text-slate-600"}`} />
              </button>
            ))}
          </motion.aside>

          {/* Main */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Mobile tabs */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
              {conversionCategories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all
                    ${activeCategory === cat.id ? `${cat.bgColor} ${cat.color}` : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Tool grid */}
            <AnimatePresence mode="wait">
              <motion.div key={activeCategory} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-xl p-6"
              >
                {currentCategory && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-xl ${currentCategory.bgColor} ${currentCategory.color} flex items-center justify-center border ${currentCategory.borderColor}`}>
                        {currentCategory.icon}
                      </div>
                      <div>
                        <h2 className="font-bold text-lg">{currentCategory.label}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {currentCategory.options.filter((o) => !o.badge || o.badge !== "Soon").length} live ·{" "}
                          {currentCategory.options.filter((o) => o.badge === "Soon").length} coming soon
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {currentCategory.options.map((option: ConversionOption, i: number) => {
                        const isSoon = option.badge === "Soon";
                        const isSelected = selectedType === option.id;
                        return (
                          <motion.button key={option.id}
                            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                            onClick={() => handleSelectType(option.id)}
                            className={`group relative flex items-start gap-4 p-4 rounded-2xl text-left transition-all duration-200 border
                              ${isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10"
                                : isSoon ? "border-slate-100 dark:border-slate-700/50 opacity-55 cursor-not-allowed bg-slate-50 dark:bg-slate-800/30"
                                : "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5"}`}
                          >
                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                              ${isSelected ? "bg-blue-600 text-white" : `${currentCategory.bgColor} ${currentCategory.color}`}`}>
                              {option.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-semibold text-sm ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-slate-100"}`}>
                                  {option.label}
                                </span>
                                {option.badge && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                                    ${option.badge === "Soon" ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                                      : option.badge === "Multi" ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
                                      : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"}`}>
                                    {option.badge}
                                  </span>
                                )}
                                {!isSoon && isClientTool && selectedType !== option.id && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">Instant</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{option.description}</p>
                            </div>
                            {isSelected && <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Upload & Convert Panel */}
            <AnimatePresence>
              {showUploadPanel && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-xl p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-8 pb-5 border-b border-slate-100 dark:border-slate-700/50">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-base font-bold shadow">2</div>
                    <div>
                      <h3 className="font-bold text-lg">Upload & Convert</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Selected: <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedOption?.label}</span>
                        {isClientTool && <span className="ml-2 text-sky-500 font-bold">⚡ Runs Instantly in Browser</span>}
                      </p>
                    </div>
                    <button onClick={() => setSelectedType("")}
                      className="ml-auto text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg font-medium">
                      Change ✕
                    </button>
                  </div>

                  {/* Extra param input */}
                  {paramConfig && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{paramConfig.label}</label>
                      {paramConfig.hint && <p className="text-xs text-slate-400 mb-2">{paramConfig.hint}</p>}
                      <input
                        type="text"
                        value={extraParam}
                        onChange={(e) => setExtraParam(e.target.value)}
                        placeholder={paramConfig.placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm shadow-sm transition-all"
                      />
                    </div>
                  )}

                  {/* File uploader (skip for QR code) */}
                  {!isQrTool && (
                    <FileUploader
                      onFilesSelected={handleFilesSelected}
                      selectedFiles={selectedFiles}
                      onRemoveFile={handleRemoveFile}
                      accept={selectedOption?.accept}
                      multiple={selectedType === "merge-pdf" || selectedType === "zip-files"}
                      maxFiles={selectedType === "merge-pdf" ? 10 : selectedType === "zip-files" ? 50 : 1}
                    />
                  )}

                  {/* Compression level */}
                  <AnimatePresence>
                    {selectedType === "compress-pdf" && selectedFiles.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="mt-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" /> Compression Level
                        </h4>
                        <CompressionSelector selectedLevel={compressionLevel} onSelectLevel={setCompressionLevel} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Save checkbox — server tools only */}
                  {!isClientTool && (selectedFiles.length > 0 || isQrTool) && (
                    <motion.label initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-6 flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded accent-blue-600" checked={saveToAccount} onChange={handleCheckboxChange} />
                      <div>
                        <span className="font-semibold text-sm flex items-center gap-2 text-slate-700 dark:text-slate-200"><Save className="w-4 h-4 text-blue-500" /> Save converted file</span>
                        <span className="text-xs text-slate-400">Keep it in your account history for later</span>
                      </div>
                    </motion.label>
                  )}

                  {/* Convert button */}
                  {(selectedFiles.length > 0 || isQrTool) && !isConverting && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                      <button onClick={handleConvert}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-[0_8px_30px_-8px_rgba(79,70,229,0.5)] hover:shadow-[0_16px_40px_-10px_rgba(79,70,229,0.7)] transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-3 relative overflow-hidden group">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        {isClientTool ? <><Zap className="w-5 h-5 fill-current" /> Convert Instantly</> : <><Zap className="w-5 h-5 fill-current" /> Convert Now</>}
                      </button>
                    </motion.div>
                  )}

                  {/* Progress */}
                  <AnimatePresence>
                    {isConverting && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6">
                        <ProgressBar progress={progress} status={status} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Server result */}
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl border border-emerald-200 dark:border-emerald-800/40 shadow-xl p-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold mb-2">Done! 🎉</h2>
                    <p className="text-slate-500 dark:text-slate-400">Your file is ready to download.</p>
                  </div>
                  <DownloadCard
                    originalName={result.originalName}
                    convertedFileName={result.convertedFileName}
                    originalSize={result.originalSize}
                    convertedSize={result.convertedSize}
                    compressionRatio={result.compressionRatio}
                  />
                  <div className="text-center mt-8">
                    <button onClick={handleReset} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-100 dark:bg-slate-700 py-3 px-6 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600">
                      <ArrowRight className="w-5 h-5" /> Convert another file
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Client-side result */}
            <AnimatePresence>
              {clientResult && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl border border-emerald-200 dark:border-emerald-800/40 shadow-xl p-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold mb-2">Done! ⚡</h2>
                    <p className="text-slate-500 dark:text-slate-400">Processed instantly in your browser — no data was sent to any server.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 dark:border-slate-700/50">
                    <div>
                      <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{clientResult.filename}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {(clientResult.size / 1024).toFixed(1)} KB · Processed client-side
                      </p>
                    </div>
                    <a
                      href={clientResult.blobUrl}
                      download={clientResult.filename}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 shrink-0"
                    >
                      <Download className="w-5 h-5" /> Download
                    </a>
                  </div>
                  <div className="text-center mt-8">
                    <button onClick={handleReset} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-100 dark:bg-slate-700 py-3 px-6 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600">
                      <ArrowRight className="w-5 h-5" /> Convert another file
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {!selectedType && !isDone && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white/40 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-slate-700 dark:text-slate-300">Pick a tool to get started</h3>
                <p className="text-slate-400 dark:text-slate-500 max-w-xs mx-auto text-sm">Choose from 60+ tools above. Tools marked ⚡ <strong>Instant</strong> run directly in your browser — no uploads needed.</p>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} title={loginModalTitle} subtitle={loginModalSubtitle} />
    </div>
  );
};

export default Workspace;
