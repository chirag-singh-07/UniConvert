import { Router } from "express";
import { upload } from "../middleware/upload";
import {
  convertFile,
  mergePdfFiles,
  compressPdfFile,
  downloadFile,
  getHistory,
} from "../controllers/api";

const router = Router();

/**
 * POST /api/convert
 * Convert a single file
 */
router.post("/convert", upload.single("file"), convertFile);

/**
 * POST /api/merge
 * Merge multiple PDFs
 */
router.post("/merge", upload.array("files", 10), mergePdfFiles);

/**
 * POST /api/compress
 * Compress a PDF
 */
router.post("/compress", upload.single("file"), compressPdfFile);

/**
 * GET /api/download/:filename
 * Download a converted file
 */
router.get("/download/:filename", downloadFile);

/**
 * GET /api/history
 * Get conversion history
 */
router.get("/history", getHistory);

export default router;
