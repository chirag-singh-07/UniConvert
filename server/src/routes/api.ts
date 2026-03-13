import { Router } from "express";
import { upload } from "../middleware/upload";
import {
  convertFile,
  splitPdfFile,
  mergePdfFiles,
  compressPdfFile,
  downloadFile,
  getHistory,
} from "../controllers/api";

const router = Router();

/** POST /api/convert – single file, any type */
router.post("/convert", upload.single("file"), convertFile);

/** POST /api/merge – merge multiple PDFs */
router.post("/merge", upload.array("files", 10), mergePdfFiles);

/** POST /api/compress – compress a PDF */
router.post("/compress", upload.single("file"), compressPdfFile);

/** POST /api/split – split a PDF into pages */
router.post("/split", upload.single("file"), splitPdfFile);

/** GET /api/download/:filename – download a converted file */
router.get("/download/:filename", downloadFile);

/** GET /api/history – get conversion history */
router.get("/history", getHistory);

export default router;
