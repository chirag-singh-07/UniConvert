import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { FileRecord } from "../models/FileRecord";
import {
  convertToPdfWithLibreOffice,
  convertPdfToDocx,
  convertImageToPdf,
  mergePdfs,
  compressPdf,
  getFileSize,
  deleteFile,
} from "../services/converter";

/**
 * Convert a single file
 */
export const convertFile = async (req: Request, res: Response) => {
  try {
    const { conversionType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!conversionType) {
      return res.status(400).json({
        success: false,
        message: "Conversion type is required",
      });
    }

    // Create file record
    const fileRecord = await FileRecord.create({
      originalName: file.originalname,
      fileName: file.filename,
      conversionType,
      fileSize: file.size,
      status: "processing",
    });

    try {
      let convertedPath: string;
      const inputPath = file.path;

      // Perform conversion based on type
      switch (conversionType) {
        case "docx-to-pdf":
        case "ppt-to-pdf":
        case "excel-to-pdf":
          convertedPath = await convertToPdfWithLibreOffice(inputPath);
          break;

        case "pdf-to-docx":
          convertedPath = await convertPdfToDocx(inputPath);
          break;

        case "image-to-pdf":
          convertedPath = await convertImageToPdf(inputPath);
          break;

        default:
          throw new Error("Invalid conversion type");
      }

      // Update record with success
      fileRecord.convertedFileName = path.basename(convertedPath);
      fileRecord.convertedFileSize = getFileSize(convertedPath);
      fileRecord.status = "completed";
      await fileRecord.save();

      res.json({
        success: true,
        message: "Conversion completed successfully",
        data: {
          id: fileRecord._id,
          originalName: fileRecord.originalName,
          convertedFileName: fileRecord.convertedFileName,
          originalSize: fileRecord.fileSize,
          convertedSize: fileRecord.convertedFileSize,
          downloadUrl: `/api/download/${fileRecord.convertedFileName}`,
        },
      });
    } catch (error: any) {
      // Update record with failure
      fileRecord.status = "failed";
      fileRecord.errorMessage = error.message;
      await fileRecord.save();

      throw error;
    }
  } catch (error: any) {
    console.error("Conversion error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Conversion failed",
    });
  }
};

/**
 * Merge multiple PDFs
 */
export const mergePdfFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 PDF files are required",
      });
    }

    // Verify all files are PDFs
    const allPdfs = files.every(
      (file) => path.extname(file.originalname).toLowerCase() === ".pdf",
    );
    if (!allPdfs) {
      return res.status(400).json({
        success: false,
        message: "All files must be PDFs",
      });
    }

    const inputPaths = files.map((file) => file.path);
    const outputFileName = `merged-${Date.now()}.pdf`;

    // Create file record
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const fileRecord = await FileRecord.create({
      originalName: `${files.length} PDFs`,
      fileName: files.map((f) => f.filename).join(", "),
      conversionType: "merge-pdf",
      fileSize: totalSize,
      status: "processing",
    });

    try {
      const convertedPath = await mergePdfs(inputPaths, outputFileName);

      // Update record
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
          originalSize: fileRecord.fileSize,
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
    res.status(500).json({
      success: false,
      message: error.message || "Merge failed",
    });
  }
};

/**
 * Compress a PDF
 */
export const compressPdfFile = async (req: Request, res: Response) => {
  try {
    const { compressionLevel } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Verify file is PDF
    if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
      return res.status(400).json({
        success: false,
        message: "Only PDF files can be compressed",
      });
    }

    const level = compressionLevel || "medium";
    if (!["low", "medium", "high"].includes(level)) {
      return res.status(400).json({
        success: false,
        message: "Invalid compression level. Use: low, medium, or high",
      });
    }

    // Create file record
    const fileRecord = await FileRecord.create({
      originalName: file.originalname,
      fileName: file.filename,
      conversionType: "compress-pdf",
      fileSize: file.size,
      status: "processing",
    });

    try {
      const convertedPath = await compressPdf(file.path, level);

      // Update record
      fileRecord.convertedFileName = path.basename(convertedPath);
      fileRecord.convertedFileSize = getFileSize(convertedPath);
      fileRecord.status = "completed";
      await fileRecord.save();

      const compressionRatio = (
        (1 - fileRecord.convertedFileSize! / fileRecord.fileSize) *
        100
      ).toFixed(2);

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
    res.status(500).json({
      success: false,
      message: error.message || "Compression failed",
    });
  }
};

/**
 * Download a converted file
 */
export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    const convertedDir = process.env.CONVERTED_DIR || "./converted";
    const filePath = path.join(convertedDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Update download count
    const fileRecord = await FileRecord.findOne({
      convertedFileName: filename,
    });
    if (fileRecord) {
      fileRecord.downloadCount += 1;
      await fileRecord.save();
    }

    res.download(filePath);
  } catch (error: any) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Download failed",
    });
  }
};

/**
 * Get conversion history
 */
export const getHistory = async (req: Request, res: Response) => {
  try {
    const { limit = 50, status } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const records = await FileRecord.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    console.error("History error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch history",
    });
  }
};
