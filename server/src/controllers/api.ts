import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { FileRecord } from "../models/FileRecord";
import {
  convertToPdfWithLibreOffice, convertPdfToDocx,
  convertImageToPdf, convertTxtToPdf, convertMdToPdf, convertHtmlToPdfAsRenderer,
  convertPdfToTxt, convertPdfToHtml, convertPdfToCsv, convertPdfToJson, convertPdfToEpub,
  convertPdfToPpt, convertPdfToExcel, convertPdfToRtf, convertPdfToMd, convertPdfToXml,
  convertDocxToTxt, convertDocxToHtml,
  convertXmlToJson, convertJsonToXml, convertCsvToJson, convertJsonToCsv, convertCsvToPdf,
  mergePdfs, compressPdf,
  splitPdf, rotatePdf, watermarkPdf, extractPdfPages, lockPdf,
  unlockPdf, flattenPdf, repairPdf, signPdf, redactPdf, cropPdf,
  addPageNumbers, pdfToGrayscale, nUpPdf, addHeaderFooter, editPdfMetadata,
  removeBlankPages, optimizePdfForWeb, reorderPdfPages,
  getFileSize,
} from "../services/converter";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeRecord = (file: Express.Multer.File, type: string) =>
  FileRecord.create({
    originalName: file.originalname,
    fileName: file.filename,
    conversionType: type,
    fileSize: file.size,
    status: "processing",
  });

const ok = (res: Response, record: any, outPath: string, extra: Record<string, any> = {}) => {
  const name = path.basename(outPath);
  record.convertedFileName = name;
  record.convertedFileSize = getFileSize(outPath);
  record.status = "completed";
  record.save();
  res.json({
    success: true,
    message: "Conversion completed successfully",
    data: {
      id: record._id,
      originalName: record.originalName,
      convertedFileName: name,
      originalSize: record.fileSize,
      convertedSize: record.convertedFileSize,
      downloadUrl: `/api/download/${name}`,
      ...extra,
    },
  });
};

const fail = async (res: Response, record: any, error: any) => {
  record.status = "failed";
  record.errorMessage = error.message;
  await record.save();
  console.error("Conversion error:", error);
  res.status(500).json({ success: false, message: error.message || "Conversion failed" });
};

// ─── Single file convert ─────────────────────────────────────────────────────

export const convertFile = async (req: Request, res: Response) => {
  const { conversionType, extraParam } = req.body;
  const file = req.file;
  if (!file)           return res.status(400).json({ success: false, message: "No file uploaded" });
  if (!conversionType) return res.status(400).json({ success: false, message: "Conversion type required" });

  const record = await makeRecord(file, conversionType);
  const inp    = file.path;

  try {
    let out: string;
    switch (conversionType) {
      // ── LibreOffice ──────────────────────────────────────────────────────
      case "docx-to-pdf": case "ppt-to-pdf": case "excel-to-pdf": case "odt-to-pdf": case "epub-to-pdf": case "rtf-to-pdf": case "xml-to-pdf": case "pub-to-pdf":
        out = await convertToPdfWithLibreOffice(inp); break;
      case "pdf-to-docx":
        out = await convertPdfToDocx(inp); break;

      // ── Image & Text ────────────────────────────────────────────────────
      case "image-to-pdf":   out = await convertImageToPdf(inp); break;
      case "txt-to-pdf":     out = await convertTxtToPdf(inp); break;
      case "md-to-pdf":      out = await convertMdToPdf(inp); break;
      case "html-to-pdf":    out = await convertHtmlToPdfAsRenderer(inp); break;

      // ── PDF → Other ─────────────────────────────────────────────────────
      case "pdf-to-txt":     out = await convertPdfToTxt(inp); break;
      case "pdf-to-html":    out = await convertPdfToHtml(inp); break;
      case "pdf-to-csv":     out = await convertPdfToCsv(inp); break;
      case "pdf-to-json":    out = await convertPdfToJson(inp); break;
      case "pdf-to-epub":    out = await convertPdfToEpub(inp); break;
      case "pdf-to-ppt":     out = await convertPdfToPpt(inp); break;
      case "pdf-to-excel":   out = await convertPdfToExcel(inp); break;
      case "pdf-to-rtf":     out = await convertPdfToRtf(inp); break;
      case "pdf-to-md":      out = await convertPdfToMd(inp); break;
      case "pdf-to-xml":     out = await convertPdfToXml(inp); break;

      // ── DOCX tools ──────────────────────────────────────────────────────
      case "docx-to-txt":    out = await convertDocxToTxt(inp); break;
      case "docx-to-html":   out = await convertDocxToHtml(inp); break;

      // ── Data formats ────────────────────────────────────────────────────
      case "xml-to-json":    out = await convertXmlToJson(inp); break;
      case "json-to-xml":    out = await convertJsonToXml(inp); break;
      case "csv-to-json":    out = await convertCsvToJson(inp); break;
      case "json-to-csv":    out = await convertJsonToCsv(inp); break;
      case "csv-to-pdf": case "csv-to-xlsx":
        out = await convertCsvToPdf(inp); break;

      // ── PDF editing ─────────────────────────────────────────────────────
      case "rotate-pdf":     out = await rotatePdf(inp, extraParam || "90"); break;
      case "watermark-pdf":  out = await watermarkPdf(inp, extraParam || "CONFIDENTIAL"); break;
      case "extract-pdf-pages": out = await extractPdfPages(inp, extraParam || "1"); break;
      case "lock-pdf":       out = await lockPdf(inp, extraParam || "secret"); break;
      case "unlock-pdf":     out = await unlockPdf(inp); break;
      case "flatten-pdf":    out = await flattenPdf(inp); break;
      case "repair-pdf":     out = await repairPdf(inp); break;
      case "sign-pdf":       out = await signPdf(inp, extraParam || "Signed by UniConvert"); break;
      case "redact-pdf":     out = await redactPdf(inp, extraParam || ""); break;
      case "crop-pdf":       out = await cropPdf(inp, extraParam || "50"); break;
      case "add-page-numbers": out = await addPageNumbers(inp, (extraParam || "bottom") as any); break;
      case "pdf-grayscale":  out = await pdfToGrayscale(inp); break;
      case "n-up-pdf":       out = await nUpPdf(inp, parseInt(extraParam || "2", 10)); break;
      case "add-header-footer": {
        const [header, footer] = (extraParam || "|Page").split("|");
        out = await addHeaderFooter(inp, header, footer);
        break;
      }
      case "pdf-metadata":   out = await editPdfMetadata(inp, extraParam || "{}"); break;
      case "remove-blank-pages": out = await removeBlankPages(inp); break;
      case "optimize-pdf":   out = await optimizePdfForWeb(inp); break;
      case "reorder-pages":  out = await reorderPdfPages(inp, extraParam || "1"); break;

      default:
        throw new Error(`Unsupported conversion type: ${conversionType}`);
    }

    await (record as any).populate ? record : record.save();
    return ok(res, record, out);
  } catch (error: any) { return fail(res, record, error); }
};

// ─── Split PDF ────────────────────────────────────────────────────────────────

export const splitPdfFile = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

  const record = await makeRecord(file, "split-pdf");
  try {
    const outPaths = await splitPdf(file.path);
    record.convertedFileName = path.basename(outPaths[0]);
    record.convertedFileSize = outPaths.reduce((s, p) => s + getFileSize(p), 0);
    record.status = "completed";
    await record.save();
    res.json({
      success: true,
      message: `PDF split into ${outPaths.length} pages`,
      data: {
        id: record._id,
        originalName: record.originalName,
        convertedFileName: path.basename(outPaths[0]),
        originalSize: record.fileSize,
        convertedSize: record.convertedFileSize,
        downloadUrl: `/api/download/${path.basename(outPaths[0])}`,
        pageCount: outPaths.length,
        allFiles: outPaths.map((p) => `/api/download/${path.basename(p)}`),
      },
    });
  } catch (error: any) { return fail(res, record, error); }
};

// ─── Merge PDFs ───────────────────────────────────────────────────────────────

export const mergePdfFiles = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length < 2)
    return res.status(400).json({ success: false, message: "At least 2 PDF files required" });

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const record = await FileRecord.create({
    originalName: `${files.length} PDFs merged`,
    fileName: files.map((f) => f.filename).join(", "),
    conversionType: "merge-pdf", fileSize: totalSize, status: "processing",
  });
  try {
    const outputFileName = `merged-${Date.now()}.pdf`;
    const out = await mergePdfs(files.map((f) => f.path), outputFileName);
    record.convertedFileName = path.basename(out);
    record.convertedFileSize = getFileSize(out);
    record.status = "completed";
    await record.save();
    res.json({
      success: true, message: "PDFs merged successfully",
      data: {
        id: record._id,
        originalName: record.originalName,
        convertedFileName: record.convertedFileName,
        originalSize: totalSize,
        convertedSize: record.convertedFileSize,
        downloadUrl: `/api/download/${record.convertedFileName}`,
      },
    });
  } catch (error: any) { return fail(res, record, error); }
};

// ─── Compress PDF ─────────────────────────────────────────────────────────────

export const compressPdfFile = async (req: Request, res: Response) => {
  const { compressionLevel } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

  const level = (compressionLevel || "medium") as "low" | "medium" | "high";
  const record = await makeRecord(file, "compress-pdf");
  try {
    const out = await compressPdf(file.path, level);
    record.convertedFileName = path.basename(out);
    record.convertedFileSize = getFileSize(out);
    record.status = "completed";
    await record.save();
    const ratio = ((1 - record.convertedFileSize! / record.fileSize) * 100).toFixed(2);
    res.json({
      success: true, message: "PDF compressed successfully",
      data: {
        id: record._id,
        originalName: record.originalName,
        convertedFileName: record.convertedFileName,
        originalSize: record.fileSize,
        convertedSize: record.convertedFileSize,
        compressionRatio: `${ratio}%`,
        downloadUrl: `/api/download/${record.convertedFileName}`,
      },
    });
  } catch (error: any) { return fail(res, record, error); }
};

// ─── Download ─────────────────────────────────────────────────────────────────

export const downloadFile = async (req: Request, res: Response) => {
  const { filename } = req.params;
  const dir  = process.env.CONVERTED_DIR || "./converted";
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath))
    return res.status(404).json({ success: false, message: "File not found" });
  const record = await FileRecord.findOne({ convertedFileName: filename });
  if (record) { record.downloadCount += 1; await record.save(); }
  res.download(filePath);
};

// ─── History ──────────────────────────────────────────────────────────────────

export const getHistory = async (req: Request, res: Response) => {
  const { limit = 50, status } = req.query;
  const q: any = {};
  if (status) q.status = status;
  const records = await FileRecord.find(q).sort({ createdAt: -1 }).limit(parseInt(limit as string));
  res.json({ success: true, data: records });
};
