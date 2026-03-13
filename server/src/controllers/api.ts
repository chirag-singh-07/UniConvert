import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { FileRecord } from "../models/FileRecord";
import {
  convertToPdfWithLibreOffice,
  convertPdfToDocx,
  convertImageToPdf,
  convertTxtToPdf,
  convertPdfToTxt,
  convertDocxToTxt,
  convertDocxToHtml,
  convertPdfToHtml,
  convertXmlToJson,
  convertJsonToXml,
  convertCsvToJson,
  convertJsonToCsv,
  convertCsvToPdf,
  mergePdfs,
  compressPdf,
  splitPdf,
  rotatePdf,
  watermarkPdf,
  extractPdfPages,
  lockPdf,
  getFileSize,
  deleteFile,
} from "../services/converter";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const saveRecord = async (
  file: Express.Multer.File,
  conversionType: string,
) => {
  return FileRecord.create({
    originalName: file.originalname,
    fileName: file.filename,
    conversionType,
    fileSize: file.size,
    status: "processing",
  });
};

const successResponse = (res: Response, fileRecord: any, convertedPath: string, extra: Record<string, any> = {}) => {
  const convertedFileName = path.basename(convertedPath);
  return res.json({
    success: true,
    message: "Conversion completed successfully",
    data: {
      id: fileRecord._id,
      originalName: fileRecord.originalName,
      convertedFileName,
      originalSize: fileRecord.fileSize,
      convertedSize: getFileSize(convertedPath),
      downloadUrl: `/api/download/${convertedFileName}`,
      ...extra,
    },
  });
};

// ─── Single file convert ─────────────────────────────────────────────────────

export const convertFile = async (req: Request, res: Response) => {
  try {
    const { conversionType, extraParam } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });
    if (!conversionType) return res.status(400).json({ success: false, message: "Conversion type is required" });

    const fileRecord = await saveRecord(file, conversionType);
    const inputPath = file.path;

    try {
      let convertedPath: string;

      switch (conversionType) {
        // ── LibreOffice ──
        case "docx-to-pdf":
        case "ppt-to-pdf":
        case "excel-to-pdf":
          convertedPath = await convertToPdfWithLibreOffice(inputPath); break;

        case "pdf-to-docx":
          convertedPath = await convertPdfToDocx(inputPath); break;

        // ── image ──
        case "image-to-pdf":
          convertedPath = await convertImageToPdf(inputPath); break;

        // ── text & docs ──
        case "txt-to-pdf":
          convertedPath = await convertTxtToPdf(inputPath); break;

        case "pdf-to-txt":
          convertedPath = await convertPdfToTxt(inputPath); break;

        case "docx-to-txt":
          convertedPath = await convertDocxToTxt(inputPath); break;

        case "docx-to-html":
          convertedPath = await convertDocxToHtml(inputPath); break;

        case "pdf-to-html":
          convertedPath = await convertPdfToHtml(inputPath); break;

        // ── data formats ──
        case "xml-to-json":
          convertedPath = await convertXmlToJson(inputPath); break;

        case "json-to-xml":
          convertedPath = await convertJsonToXml(inputPath); break;

        case "csv-to-json":
          convertedPath = await convertCsvToJson(inputPath); break;

        case "json-to-csv":
          convertedPath = await convertJsonToCsv(inputPath); break;

        case "csv-to-pdf":
        case "csv-to-xlsx":     // treat as csv-to-pdf for now
          convertedPath = await convertCsvToPdf(inputPath); break;

        // ── PDF tools ──
        case "rotate-pdf":
          convertedPath = await rotatePdf(inputPath, extraParam || "90"); break;

        case "watermark-pdf":
          convertedPath = await watermarkPdf(inputPath, extraParam || "CONFIDENTIAL"); break;

        case "extract-pdf-pages":
          convertedPath = await extractPdfPages(inputPath, extraParam || "1"); break;

        case "lock-pdf":
          convertedPath = await lockPdf(inputPath, extraParam || "secret"); break;

        default:
          throw new Error(`Unsupported conversion type: ${conversionType}`);
      }

      fileRecord.convertedFileName = path.basename(convertedPath);
      fileRecord.convertedFileSize = getFileSize(convertedPath);
      fileRecord.status = "completed";
      await fileRecord.save();

      return successResponse(res, fileRecord, convertedPath);
    } catch (error: any) {
      fileRecord.status = "failed";
      fileRecord.errorMessage = error.message;
      await fileRecord.save();
      throw error;
    }
  } catch (error: any) {
    console.error("Conversion error:", error);
    res.status(500).json({ success: false, message: error.message || "Conversion failed" });
  }
};

// ─── Split PDF (special – multiple output files) ─────────────────────────────

export const splitPdfFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const fileRecord = await saveRecord(file, "split-pdf");
    try {
      const outPaths = await splitPdf(file.path);
      // Merge the split pages into a single downloadable zip-like PDF for simplicity
      // (return ref to first split page – TODO: zip all pages)
      const firstPage = outPaths[0];
      fileRecord.convertedFileName = path.basename(firstPage);
      fileRecord.convertedFileSize = outPaths.reduce((s, p) => s + getFileSize(p), 0);
      fileRecord.status = "completed";
      await fileRecord.save();

      res.json({
        success: true,
        message: `PDF split into ${outPaths.length} pages`,
        data: {
          id: fileRecord._id,
          originalName: fileRecord.originalName,
          convertedFileName: path.basename(firstPage),
          originalSize: fileRecord.fileSize,
          convertedSize: fileRecord.convertedFileSize,
          downloadUrl: `/api/download/${path.basename(firstPage)}`,
          pageCount: outPaths.length,
          allFiles: outPaths.map((p) => `/api/download/${path.basename(p)}`),
        },
      });
    } catch (error: any) {
      fileRecord.status = "failed";
      fileRecord.errorMessage = error.message;
      await fileRecord.save();
      throw error;
    }
  } catch (error: any) {
    console.error("Split error:", error);
    res.status(500).json({ success: false, message: error.message || "Split failed" });
  }
};

// ─── Merge PDFs ───────────────────────────────────────────────────────────────

export const mergePdfFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length < 2)
      return res.status(400).json({ success: false, message: "At least 2 PDF files are required" });

    const allPdfs = files.every((f) => path.extname(f.originalname).toLowerCase() === ".pdf");
    if (!allPdfs) return res.status(400).json({ success: false, message: "All files must be PDFs" });

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const fileRecord = await FileRecord.create({
      originalName: `${files.length} PDFs`,
      fileName: files.map((f) => f.filename).join(", "),
      conversionType: "merge-pdf",
      fileSize: totalSize,
      status: "processing",
    });

    try {
      const inputPaths = files.map((f) => f.path);
      const outputFileName = `merged-${Date.now()}.pdf`;
      const convertedPath = await mergePdfs(inputPaths, outputFileName);

      fileRecord.convertedFileName = path.basename(convertedPath);
      fileRecord.convertedFileSize = getFileSize(convertedPath);
      fileRecord.status = "completed";
      await fileRecord.save();

      res.json({
        success: true,
        message: "PDFs merged successfully",
        data: {
          id: fileRecord._id,
          convertedFileName: fileRecord.convertedFileName,
          originalName: `${files.length} PDF files`,
          originalSize: totalSize,
          convertedSize: fileRecord.convertedFileSize,
          downloadUrl: `/api/download/${fileRecord.convertedFileName}`,
        },
      });
    } catch (error: any) {
      fileRecord.status = "failed";
      fileRecord.errorMessage = error.message;
      await fileRecord.save();
      throw error;
    }
  } catch (error: any) {
    console.error("Merge error:", error);
    res.status(500).json({ success: false, message: error.message || "Merge failed" });
  }
};

// ─── Compress PDF ─────────────────────────────────────────────────────────────

export const compressPdfFile = async (req: Request, res: Response) => {
  try {
    const { compressionLevel } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });
    if (path.extname(file.originalname).toLowerCase() !== ".pdf")
      return res.status(400).json({ success: false, message: "Only PDF files can be compressed" });

    const level = compressionLevel || "medium";
    if (!["low", "medium", "high"].includes(level))
      return res.status(400).json({ success: false, message: "Invalid compression level" });

    const fileRecord = await saveRecord(file, "compress-pdf");
    try {
      const convertedPath = await compressPdf(file.path, level);
      fileRecord.convertedFileName = path.basename(convertedPath);
      fileRecord.convertedFileSize = getFileSize(convertedPath);
      fileRecord.status = "completed";
      await fileRecord.save();

      const compressionRatio = ((1 - fileRecord.convertedFileSize! / fileRecord.fileSize) * 100).toFixed(2);
      res.json({
        success: true,
        message: "PDF compressed successfully",
        data: {
          id: fileRecord._id,
          originalName: fileRecord.originalName,
          convertedFileName: fileRecord.convertedFileName,
          originalSize: fileRecord.fileSize,
          convertedSize: fileRecord.convertedFileSize,
          compressionRatio: `${compressionRatio}%`,
          downloadUrl: `/api/download/${fileRecord.convertedFileName}`,
        },
      });
    } catch (error: any) {
      fileRecord.status = "failed";
      fileRecord.errorMessage = error.message;
      await fileRecord.save();
      throw error;
    }
  } catch (error: any) {
    console.error("Compression error:", error);
    res.status(500).json({ success: false, message: error.message || "Compression failed" });
  }
};

// ─── Download ────────────────────────────────────────────────────────────────

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const convertedDir = process.env.CONVERTED_DIR || "./converted";
    const filePath = path.join(convertedDir, filename);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ success: false, message: "File not found" });

    const fileRecord = await FileRecord.findOne({ convertedFileName: filename });
    if (fileRecord) { fileRecord.downloadCount += 1; await fileRecord.save(); }
    res.download(filePath);
  } catch (error: any) {
    console.error("Download error:", error);
    res.status(500).json({ success: false, message: "Download failed" });
  }
};

// ─── History ─────────────────────────────────────────────────────────────────

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { limit = 50, status } = req.query;
    const query: any = {};
    if (status) query.status = status;
    const records = await FileRecord.find(query).sort({ createdAt: -1 }).limit(parseInt(limit as string));
    res.json({ success: true, data: records });
  } catch (error: any) {
    console.error("History error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
};
