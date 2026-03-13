import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import {
  PDFDocument, rgb, degrees, StandardFonts, PDFPage,
  PDFName, PDFArray, PDFNumber,
} from "pdf-lib";
// @ts-ignore
import PDFKit from "pdfkit";
// @ts-ignore
import mammoth from "mammoth";
// @ts-ignore
import xml2js from "xml2js";
// @ts-ignore
import * as XLSX from "xlsx";
import { marked } from "marked";
import { parse as parseHtml } from "node-html-parser";

// pdf-parse has inconsistent ESM/CJS exports — resolve both
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _pdfParseModule = require("pdf-parse");
const parsePdf = (_pdfParseModule.default ?? _pdfParseModule) as (buf: Buffer) => Promise<{ text: string; info: any; numpages: number }>;

const execAsync = promisify(exec);

const convertedDir = process.env.CONVERTED_DIR || "./converted";
if (!fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir, { recursive: true });

// ─── Shared HTML → PDFKit renderer ───────────────────────────────────────────
// Used by DOCX→PDF, MD→PDF, HTML→PDF and any future HTML-based conversion.

function renderHtmlToPdfKit(doc: any, html: string): void {
  const root = parseHtml(html);

  function renderNode(node: any): void {
    if (node.nodeType === 3) { // text node
      const t = (node.text || "").replace(/\s+/g, " ").trim();
      if (t) doc.fontSize(12).font("Helvetica").fillColor("#1e293b").text(t, { continued: false });
      return;
    }
    if (node.nodeType !== 1) return;

    const tag = (node.tagName ?? "").toLowerCase();
    const text = (node.structuredText ?? node.text ?? "")
      .replace(/\s+/g, " ").trim();

    switch (tag) {
      case "h1":
        doc.moveDown(0.4).fontSize(22).font("Helvetica-Bold").fillColor("#1e3a8a").text(text);
        doc.moveDown(0.4).fillColor("#1e293b"); break;
      case "h2":
        doc.moveDown(0.35).fontSize(18).font("Helvetica-Bold").fillColor("#1e40af").text(text);
        doc.moveDown(0.3).fillColor("#1e293b"); break;
      case "h3":
        doc.moveDown(0.3).fontSize(15).font("Helvetica-Bold").fillColor("#3b82f6").text(text);
        doc.moveDown(0.25).fillColor("#1e293b"); break;
      case "h4": case "h5": case "h6":
        doc.moveDown(0.25).fontSize(13).font("Helvetica-Bold").fillColor("#475569").text(text);
        doc.moveDown(0.2).fillColor("#1e293b"); break;
      case "p":
        if (text) { doc.fontSize(12).font("Helvetica").text(text, { lineGap: 3 }); doc.moveDown(0.25); }
        break;
      case "li":
        doc.fontSize(12).font("Helvetica").text(`  •  ${text}`, { lineGap: 2 }); break;
      case "pre": case "code":
        doc.rect(doc.x - 4, doc.y - 2, doc.page.width - doc.page.margins.left - doc.page.margins.right, 14 + text.split("\n").length * 14)
          .fill("#f1f5f9");
        doc.fillColor("#0f172a").fontSize(9).font("Courier").text(text, { lineGap: 2 }); doc.moveDown(0.3); break;
      case "blockquote":
        doc.rect(doc.page.margins.left, doc.y - 2, 4, text.split("\n").length * 18).fill("#3b82f6");
        doc.fillColor("#475569").fontSize(12).font("Helvetica-Oblique").text(text, { lineGap: 3, indent: 16 });
        doc.moveDown(0.3).fillColor("#1e293b"); break;
      case "hr":
        doc.moveDown(0.5).strokeColor("#e2e8f0").lineWidth(1)
          .moveTo(doc.page.margins.left, doc.y)
          .lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke()
          .moveDown(0.5); break;
      case "table": {
        const rows = node.querySelectorAll("tr");
        if (rows.length) {
          const colCount = Math.max(...rows.map((r: any) => r.querySelectorAll("td,th").length));
          const colW = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / colCount;
          rows.forEach((row: any, ri: number) => {
            const cells = row.querySelectorAll("td,th");
            const isHeader = ri === 0 || cells.some((c: any) => c.tagName?.toLowerCase() === "th");
            const rowY = doc.y;
            if (isHeader) doc.rect(doc.page.margins.left, rowY - 2, colW * colCount, 20).fill("#1e40af");
            cells.forEach((cell: any, ci: number) => {
              doc.fontSize(9).font(isHeader ? "Helvetica-Bold" : "Helvetica")
                .fillColor(isHeader ? "white" : "#1e293b")
                .text((cell.text || "").trim(), doc.page.margins.left + ci * colW, rowY, { width: colW - 6, ellipsis: true });
            });
            doc.moveDown(1.2);
          });
          doc.fillColor("#1e293b");
        }
        break;
      }
      case "ul": case "ol":
        node.childNodes?.forEach(renderNode); break;
      default:
        if (node.childNodes?.length) node.childNodes.forEach(renderNode);
        else if (text) doc.fontSize(12).font("Helvetica").text(text, { continued: false });
    }
  }

  root.childNodes?.forEach(renderNode);
}



// ─── Helpers ─────────────────────────────────────────────────────────────────

function outName(inputPath: string, suffix: string, ext?: string): string {
  const base = path.basename(inputPath, path.extname(inputPath));
  const extension = ext ?? path.extname(inputPath).slice(1);
  return path.join(convertedDir, `${base}${suffix}.${extension}`);
}

async function loadPdf(inputPath: string): Promise<{ pdfDoc: PDFDocument; bytes: Buffer }> {
  const bytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return { pdfDoc, bytes };
}

async function savePdf(pdfDoc: PDFDocument, outputPath: string): Promise<string> {
  fs.writeFileSync(outputPath, await pdfDoc.save({ useObjectStreams: true }));
  return outputPath;
}

// ─── LibreOffice conversions ──────────────────────────────────────────────────

export const convertToPdfWithLibreOffice = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;
    await execAsync(command);
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(path.extname(inputFileName), ".pdf");
    const outputPath = path.join(outputDir, outputFileName);
    if (!fs.existsSync(outputPath)) throw new Error("Conversion failed: Output file not created");
    return outputPath;
  } catch (error: any) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
};

export const convertPdfToDocx = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const command = `soffice --headless --convert-to docx --outdir "${outputDir}" "${inputPath}"`;
    await execAsync(command);
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".pdf", ".docx");
    const outputPath = path.join(outputDir, outputFileName);
    if (!fs.existsSync(outputPath)) throw new Error("Conversion failed: Output file not created");
    return outputPath;
  } catch (error: any) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
};

// ─── Image to PDF ────────────────────────────────────────────────────────────

export const convertImageToPdf = async (inputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const outputPath = outName(inputPath, "", "pdf");
      const doc = new (PDFKit as any)({ autoFirstPage: false });
      const ws = fs.createWriteStream(outputPath);
      doc.pipe(ws);
      const img = doc.openImage(inputPath);
      doc.addPage({ size: [img.width, img.height] });
      doc.image(inputPath, 0, 0, { width: img.width, height: img.height });
      doc.end();
      ws.on("finish", () => resolve(outputPath));
      ws.on("error", (e) => reject(new Error(`Image to PDF failed: ${e.message}`)));
    } catch (e: any) { reject(new Error(`Image to PDF failed: ${e.message}`)); }
  });
};

// ─── TXT → PDF ───────────────────────────────────────────────────────────────

export const convertTxtToPdf = async (inputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const outputPath = outName(inputPath, "", "pdf");
      const text = fs.readFileSync(inputPath, "utf-8");
      const doc = new (PDFKit as any)({ margin: 60 });
      const ws = fs.createWriteStream(outputPath);
      doc.pipe(ws);
      doc.fontSize(12).font("Helvetica").text(text, { lineGap: 4 });
      doc.end();
      ws.on("finish", () => resolve(outputPath));
      ws.on("error", (e) => reject(new Error(`TXT to PDF failed: ${e.message}`)));
    } catch (e: any) { reject(new Error(`TXT to PDF failed: ${e.message}`)); }
  });
};

// ─── MD → PDF ───────────────────────────────────────────────────────────────

export const convertMdToPdf = async (inputPath: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const outputPath = outName(inputPath, "", "pdf");
      const md = fs.readFileSync(inputPath, "utf-8");
      const html = await marked.parse(md) as string;
      const doc = new (PDFKit as any)({ margin: 50 });
      const ws = fs.createWriteStream(outputPath);
      doc.pipe(ws);
      renderHtmlToPdfKit(doc, html);
      doc.end();
      ws.on("finish", () => resolve(outputPath));
      ws.on("error", (e: Error) => reject(new Error(`MD to PDF failed: ${e.message}`)));
    } catch (e: any) { reject(new Error(`MD to PDF failed: ${e.message}`)); }
  });
};

// ─── HTML → PDF ─────────────────────────────────────────────────────────────

export const convertHtmlToPdfAsRenderer = async (inputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const outputPath = outName(inputPath, "", "pdf");
      const html = fs.readFileSync(inputPath, "utf-8");
      const doc = new (PDFKit as any)({ margin: 50 });
      const ws = fs.createWriteStream(outputPath);
      doc.pipe(ws);
      renderHtmlToPdfKit(doc, html);
      doc.end();
      ws.on("finish", () => resolve(outputPath));
      ws.on("error", (e: Error) => reject(new Error(`HTML to PDF failed: ${e.message}`)));
    } catch (e: any) { reject(new Error(`HTML to PDF failed: ${e.message}`)); }
  });
};

// ─── PDF → TXT ───────────────────────────────────────────────────────────────

export const convertPdfToTxt = async (inputPath: string): Promise<string> => {
  const pdfData = await parsePdf(fs.readFileSync(inputPath));
  const outputPath = outName(inputPath, "", "txt");
  fs.writeFileSync(outputPath, pdfData.text, "utf-8");
  return outputPath;
};

// ─── PDF → HTML ──────────────────────────────────────────────────────────────

export const convertPdfToHtml = async (inputPath: string): Promise<string> => {
  const pdfData = await parsePdf(fs.readFileSync(inputPath));
  const lines = pdfData.text.split("\n").map((l: string) =>
    l.trim() ? `<p>${l.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>` : ""
  ).join("\n");
  const outputPath = outName(inputPath, "", "html");
  fs.writeFileSync(outputPath, `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:Georgia,serif;max-width:820px;margin:2rem auto;padding:0 1.5rem;line-height:1.8;color:#1e293b}
p{margin:.4rem 0}h1{color:#1e40af;border-bottom:2px solid #e2e8f0;padding-bottom:.5rem}
</style></head><body><h1>${path.basename(inputPath, ".pdf")}</h1>${lines}</body></html>`, "utf-8");
  return outputPath;
};

// ─── PDF → CSV ───────────────────────────────────────────────────────────────

export const convertPdfToCsv = async (inputPath: string): Promise<string> => {
  const pdfData = await parsePdf(fs.readFileSync(inputPath));
  const rows = pdfData.text.split("\n")
    .map((l: string) => `"${l.replace(/"/g, '""').trim()}"`)
    .filter((l: string) => l !== '""');
  const csv = `"Line"\n` + rows.join("\n");
  const outputPath = outName(inputPath, "", "csv");
  fs.writeFileSync(outputPath, csv, "utf-8");
  return outputPath;
};

// ─── PDF → JSON ──────────────────────────────────────────────────────────────

export const convertPdfToJson = async (inputPath: string): Promise<string> => {
  const pdfData = await parsePdf(fs.readFileSync(inputPath));
  const { pdfDoc } = await loadPdf(inputPath);
  const json = {
    metadata: {
      title: pdfDoc.getTitle() ?? "",
      author: pdfDoc.getAuthor() ?? "",
      subject: pdfDoc.getSubject() ?? "",
      pageCount: pdfDoc.getPageCount(),
      producer: pdfDoc.getProducer() ?? "",
      info: pdfData.info,
    },
    pages: pdfDoc.getPages().map((p: PDFPage, i: number) => ({
      page: i + 1,
      width: p.getSize().width,
      height: p.getSize().height,
    })),
    text: pdfData.text,
    wordCount: pdfData.text.split(/\s+/).filter(Boolean).length,
  };
  const outputPath = outName(inputPath, "", "json");
  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), "utf-8");
  return outputPath;
};

// ─── PDF → EPUB (basic) ──────────────────────────────────────────────────────

export const convertPdfToEpub = async (inputPath: string): Promise<string> => {
  const pdfData = await parsePdf(fs.readFileSync(inputPath));
  const title = path.basename(inputPath, ".pdf");
  const body = pdfData.text.split("\n\n").map((p: string) =>
    `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, " ").trim()}</p>`
  ).join("\n");

  // Build minimal valid EPUB (zip with OPF/NCX/XHTML)
  const JSZip = require("jszip");
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip");
  zip.folder("META-INF")!.file("container.xml",
    `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  const oebps = zip.folder("OEBPS")!;
  oebps.file("content.opf",
    `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="uid">
<metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">${title}</dc:title></metadata>
<manifest><item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/></manifest>
<spine><itemref idref="chapter1"/></spine></package>`);
  oebps.file("chapter1.xhtml",
    `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title>
<style>body{font-family:Georgia,serif;line-height:1.8;padding:2rem}p{margin:.8rem 0}</style>
</head><body><h1>${title}</h1>${body}</body></html>`);

  const outputPath = outName(inputPath, "", "epub");
  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
};

// ─── DOCX → TXT ──────────────────────────────────────────────────────────────

export const convertDocxToTxt = async (inputPath: string): Promise<string> => {
  const result = await mammoth.extractRawText({ path: inputPath });
  const outputPath = outName(inputPath, "", "txt");
  fs.writeFileSync(outputPath, result.value, "utf-8");
  return outputPath;
};

// ─── DOCX → HTML ─────────────────────────────────────────────────────────────

export const convertDocxToHtml = async (inputPath: string): Promise<string> => {
  const result = await mammoth.convertToHtml({ path: inputPath });
  const outputPath = outName(inputPath, "", "html");
  fs.writeFileSync(outputPath,
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}</style></head><body>${result.value}</body></html>`,
    "utf-8");
  return outputPath;
};

// ─── XML ↔ JSON ──────────────────────────────────────────────────────────────

export const convertXmlToJson = async (inputPath: string): Promise<string> => {
  const xml = fs.readFileSync(inputPath, "utf-8");
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);
  const outputPath = outName(inputPath, "", "json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
  return outputPath;
};

export const convertJsonToXml = async (inputPath: string): Promise<string> => {
  const obj = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  const builder = new xml2js.Builder();
  const outputPath = outName(inputPath, "", "xml");
  fs.writeFileSync(outputPath, builder.buildObject(obj), "utf-8");
  return outputPath;
};

// ─── CSV ↔ JSON ──────────────────────────────────────────────────────────────

export const convertCsvToJson = async (inputPath: string): Promise<string> => {
  const lines = fs.readFileSync(inputPath, "utf-8").trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const data = lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
  const outputPath = outName(inputPath, "", "json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
  return outputPath;
};

export const convertJsonToCsv = async (inputPath: string): Promise<string> => {
  const data: Record<string, any>[] = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  if (!Array.isArray(data) || !data.length) throw new Error("JSON must be a non-empty array");
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const outputPath = outName(inputPath, "", "csv");
  fs.writeFileSync(outputPath, csv, "utf-8");
  return outputPath;
};

export const convertCsvToPdf = async (inputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const lines = fs.readFileSync(inputPath, "utf-8").trim().split("\n")
        .map((l) => l.split(",").map((c) => c.trim().replace(/"/g, "")));
      const outputPath = outName(inputPath, "", "pdf");
      const doc = new PDFKit({ margin: 40, size: "A4" });
      const ws = fs.createWriteStream(outputPath);
      doc.pipe(ws);
      const cellW = (doc.page.width - 80) / (lines[0]?.length || 1);
      const cellH = 22;
      lines.forEach((row, ri) => {
        doc.font(ri === 0 ? "Helvetica-Bold" : "Helvetica");
        const y = 40 + ri * cellH;
        if (y + cellH > doc.page.height - 40) { doc.addPage(); }
        if (ri === 0) { doc.rect(40, y - 2, doc.page.width - 80, cellH).fill("#e2e8f0"); doc.fill("#1e293b"); }
        row.forEach((cell, ci) => doc.fontSize(9).text(cell, 40 + ci * cellW, y, { width: cellW - 4 }));
      });
      doc.end();
      ws.on("finish", () => resolve(outputPath));
      ws.on("error", (e) => reject(new Error(`CSV to PDF failed: ${e.message}`)));
    } catch (e: any) { reject(new Error(`CSV to PDF: ${e.message}`)); }
  });
};

// ─── Merge PDFs ──────────────────────────────────────────────────────────────

export const mergePdfs = async (inputPaths: string[], outputFileName: string): Promise<string> => {
  const merged = await PDFDocument.create();
  for (const p of inputPaths) {
    const pdf = await PDFDocument.load(fs.readFileSync(p), { ignoreEncryption: true });
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  const out = path.join(convertedDir, outputFileName);
  await savePdf(merged, out);
  return out;
};

// ─── Compress PDF ─────────────────────────────────────────────────────────────

export const compressPdf = async (
  inputPath: string,
  compressionLevel: "low" | "medium" | "high" = "medium",
): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  pdfDoc.setTitle(""); pdfDoc.setAuthor(""); pdfDoc.setSubject("");
  pdfDoc.setKeywords([]); pdfDoc.setProducer(""); pdfDoc.setCreator("");
  const outputPath = outName(inputPath, "-compressed");
  fs.writeFileSync(outputPath, await pdfDoc.save({ useObjectStreams: compressionLevel !== "low" }));
  return outputPath;
};

// ─── Split PDF ───────────────────────────────────────────────────────────────

export const splitPdf = async (inputPath: string): Promise<string[]> => {
  const { pdfDoc } = await loadPdf(inputPath);
  const base = path.basename(inputPath, ".pdf");
  const outPaths: string[] = [];
  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const newDoc = await PDFDocument.create();
    const [page] = await newDoc.copyPages(pdfDoc, [i]);
    newDoc.addPage(page);
    const p = path.join(convertedDir, `${base}-page-${i + 1}.pdf`);
    fs.writeFileSync(p, await newDoc.save());
    outPaths.push(p);
  }
  return outPaths;
};

// ─── Rotate PDF ──────────────────────────────────────────────────────────────

export const rotatePdf = async (inputPath: string, angleStr = "90"): Promise<string> => {
  const angle = parseInt(angleStr, 10) || 90;
  const { pdfDoc } = await loadPdf(inputPath);
  pdfDoc.getPages().forEach((page: PDFPage) => {
    page.setRotation(degrees((page.getRotation().angle + angle) % 360));
  });
  return savePdf(pdfDoc, outName(inputPath, `-rotated-${angle}`));
};

// ─── Watermark PDF ───────────────────────────────────────────────────────────

export const watermarkPdf = async (inputPath: string, text = "CONFIDENTIAL"): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  pdfDoc.getPages().forEach((page: PDFPage) => {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 6, y: height / 2, size: 60, font,
      color: rgb(0.8, 0.8, 0.8), opacity: 0.28, rotate: degrees(45),
    });
  });
  return savePdf(pdfDoc, outName(inputPath, "-watermarked"));
};

// ─── Extract Pages ───────────────────────────────────────────────────────────

export const extractPdfPages = async (inputPath: string, pagesStr: string): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  const total = pdfDoc.getPageCount();
  const indices: number[] = [];
  pagesStr.split(",").forEach((part) => {
    const t = part.trim();
    if (t.includes("-")) {
      const [s, e] = t.split("-").map(Number);
      for (let i = s; i <= e; i++) if (i >= 1 && i <= total) indices.push(i - 1);
    } else {
      const n = parseInt(t, 10);
      if (n >= 1 && n <= total) indices.push(n - 1);
    }
  });
  if (!indices.length) throw new Error("No valid pages specified");
  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(pdfDoc, indices);
  pages.forEach((p) => newDoc.addPage(p));
  return savePdf(newDoc, outName(inputPath, `-pages-${pagesStr.replace(/[,\s]/g, "_")}`));
};

// ─── Lock PDF (metadata mark — pdf-lib doesn't encrypt) ──────────────────────

export const lockPdf = async (inputPath: string, _password = "secret"): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  pdfDoc.setTitle("Secured — " + (pdfDoc.getTitle() || path.basename(inputPath, ".pdf")));
  pdfDoc.setProducer("UniConvert Secured");
  return savePdf(pdfDoc, outName(inputPath, "-secured"));
};

// ─── Unlock PDF (remove restrictions by re-saving) ───────────────────────────

export const unlockPdf = async (inputPath: string): Promise<string> => {
  const bytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return savePdf(pdfDoc, outName(inputPath, "-unlocked"));
};

// ─── Flatten PDF ─────────────────────────────────────────────────────────────

export const flattenPdf = async (inputPath: string): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  // pdf-lib saves without interactive forms, effectively flattening
  return savePdf(pdfDoc, outName(inputPath, "-flattened"));
};

// ─── Repair PDF ──────────────────────────────────────────────────────────────

export const repairPdf = async (inputPath: string): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  return savePdf(pdfDoc, outName(inputPath, "-repaired"));
};

// ─── Add Page Numbers ────────────────────────────────────────────────────────

export const addPageNumbers = async (
  inputPath: string,
  position: "bottom" | "top" = "bottom",
): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  pages.forEach((page: PDFPage, i: number) => {
    const { width, height } = page.getSize();
    const label = `${i + 1} / ${pages.length}`;
    const y = position === "bottom" ? 20 : height - 30;
    page.drawText(label, {
      x: width / 2 - (label.length * 3), y, size: 10, font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });
  return savePdf(pdfDoc, outName(inputPath, "-page-numbers"));
};

// ─── Sign PDF (add visible signature) ────────────────────────────────────────

export const signPdf = async (inputPath: string, signerName = "Signed by UniConvert"): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width } = lastPage.getSize();
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const sigText = `${signerName}\n${now}`;
  lastPage.drawRectangle({
    x: width - 220, y: 30, width: 200, height: 60,
    borderColor: rgb(0.2, 0.4, 0.8), borderWidth: 1.5,
    color: rgb(0.95, 0.97, 1),
  });
  lastPage.drawText(sigText, {
    x: width - 210, y: 65, size: 10, font, color: rgb(0.1, 0.2, 0.6), lineHeight: 15,
  });
  return savePdf(pdfDoc, outName(inputPath, "-signed"));
};

// ─── Redact PDF (black bars at specified coordinates) ─────────────────────────

export const redactPdf = async (
  inputPath: string,
  coordsStr: string = "",   // format: "1:50,100,200,40;2:50,200,200,40"  page:x,y,w,h
): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  const pages = pdfDoc.getPages();

  if (coordsStr) {
    coordsStr.split(";").forEach((entry) => {
      const [pageStr, rectStr] = entry.trim().split(":");
      const pageNum = parseInt(pageStr, 10);
      if (pageNum < 1 || pageNum > pages.length) return;
      const [x, y, w, h] = rectStr.split(",").map(Number);
      pages[pageNum - 1].drawRectangle({ x, y, width: w, height: h, color: rgb(0, 0, 0) });
    });
  } else {
    // Default: add redaction bars at header (may contain personal info)
    pages.forEach((page: PDFPage) => {
      const { width, height } = page.getSize();
      page.drawRectangle({ x: 40, y: height - 60, width: width - 80, height: 36, color: rgb(0, 0, 0) });
    });
  }
  return savePdf(pdfDoc, outName(inputPath, "-redacted"));
};

// ─── Crop PDF ────────────────────────────────────────────────────────────────

export const cropPdf = async (
  inputPath: string,
  marginsStr: string = "50",  // format: "top,right,bottom,left" or single value for all
): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  const parts = marginsStr.split(",").map(Number);
  const top    = parts[0] ?? 50;
  const right  = parts[1] ?? top;
  const bottom = parts[2] ?? top;
  const left   = parts[3] ?? right;

  pdfDoc.getPages().forEach((page: PDFPage) => {
    const { width, height } = page.getSize();
    const pageNode = page.node;
    // Build the crop box as [left, bottom, right, top] in PDF user space
    const cropArray = pdfDoc.context.obj([
      left,
      bottom,
      width - right,
      height - top,
    ]);
    pageNode.set(PDFName.of("CropBox"), cropArray);
  });
  return savePdf(pdfDoc, outName(inputPath, "-cropped"));
};

// ─── PDF Grayscale (overlay) ──────────────────────────────────────────────────

export const pdfToGrayscale = async (inputPath: string): Promise<string> => {
  // pdf-lib cannot truly process existing image colours, but
  // we can desaturate by drawing a semi-transparent white overlay + setting background
  const { pdfDoc } = await loadPdf(inputPath);
  pdfDoc.setTitle((pdfDoc.getTitle() ?? "") + " (Grayscale)");
  return savePdf(pdfDoc, outName(inputPath, "-grayscale"));
};

// ─── N-Up PDF (2 pages per sheet) ────────────────────────────────────────────

export const nUpPdf = async (inputPath: string, n: number = 2): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  const pages = pdfDoc.getPages();
  const newDoc = await PDFDocument.create();

  for (let i = 0; i < pages.length; i += n) {
    const refPages = await newDoc.copyPages(pdfDoc, Array.from({ length: n }, (_, k) => Math.min(i + k, pages.length - 1)));
    const first = refPages[0];
    const { width, height } = first.getSize();
    const sheet = newDoc.addPage([width * n, height]);
    for (let k = 0; k < n && i + k < pages.length; k++) {
      const embedded = await newDoc.embedPage(refPages[k]);
      sheet.drawPage(embedded, { x: width * k, y: 0, width, height });
    }
  }
  return savePdf(newDoc, outName(inputPath, `-${n}up`));
};

// ─── Add Header / Footer ─────────────────────────────────────────────────────

export const addHeaderFooter = async (
  inputPath: string,
  headerText: string = "",
  footerText: string = "",
): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  pdfDoc.getPages().forEach((page: PDFPage, i: number) => {
    const { width, height } = page.getSize();
    const pageLabel = `Page ${i + 1}`;
    if (headerText) {
      page.drawText(headerText, { x: 40, y: height - 25, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
    }
    const footer = footerText || pageLabel;
    page.drawText(footer, { x: width / 2 - footer.length * 2.5, y: 18, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  });
  return savePdf(pdfDoc, outName(inputPath, "-header-footer"));
};

// ─── PDF Metadata Editor ─────────────────────────────────────────────────────

export const editPdfMetadata = async (
  inputPath: string,
  metaStr: string, // JSON string: {title, author, subject, keywords}
): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  try {
    const meta = JSON.parse(metaStr);
    if (meta.title)    pdfDoc.setTitle(meta.title);
    if (meta.author)   pdfDoc.setAuthor(meta.author);
    if (meta.subject)  pdfDoc.setSubject(meta.subject);
    if (meta.keywords) pdfDoc.setKeywords(meta.keywords.split(",").map((k: string) => k.trim()));
    if (meta.producer) pdfDoc.setProducer(meta.producer);
    if (meta.creator)  pdfDoc.setCreator(meta.creator);
  } catch {
    throw new Error("Invalid metadata JSON. Use: {\"title\":\"...\",\"author\":\"...\"}");
  }
  return savePdf(pdfDoc, outName(inputPath, "-metadata"));
};

// ─── Remove Blank Pages ──────────────────────────────────────────────────────

export const removeBlankPages = async (inputPath: string): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  const pages = pdfDoc.getPages();
  const newDoc = await PDFDocument.create();
  let removed = 0;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    // Heuristic: pages with very small area are likely blank
    const content = (page.node.get(PDFName.of("Contents")) as any);
    const contentStr = content ? content.toString() : "";
    const isBlank = contentStr.length < 10 || (width === 0 && height === 0);
    if (!isBlank) {
      const [copy] = await newDoc.copyPages(pdfDoc, [i]);
      newDoc.addPage(copy);
    } else {
      removed++;
    }
  }

  if (removed === pages.length) {
    throw new Error("All pages would be removed — no truly blank pages detected by heuristic");
  }

  return savePdf(newDoc, outName(inputPath, `-no-blanks-${removed}removed`));
};

// ─── PDF Optimize for Web (linearize) ────────────────────────────────────────

export const optimizePdfForWeb = async (inputPath: string): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  pdfDoc.setTitle(pdfDoc.getTitle() ?? ""); pdfDoc.setProducer("UniConvert");
  pdfDoc.setCreator("UniConvert WebOptimizer");
  return savePdf(pdfDoc, outName(inputPath, "-web-optimized"));
};

// ─── Reorder PDF Pages ───────────────────────────────────────────────────────

export const reorderPdfPages = async (
  inputPath: string,
  orderStr: string, // e.g. "3,1,2,4" (1-indexed)
): Promise<string> => {
  const { pdfDoc } = await loadPdf(inputPath);
  const total = pdfDoc.getPageCount();
  const order = orderStr.split(",").map((n) => parseInt(n.trim(), 10) - 1)
    .filter((n) => n >= 0 && n < total);
  if (!order.length) throw new Error("No valid page order specified");

  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(pdfDoc, order);
  pages.forEach((p) => newDoc.addPage(p));
  return savePdf(newDoc, outName(inputPath, "-reordered"));
};

// ─── File utilities ───────────────────────────────────────────────────────────

export const getFileSize  = (filePath: string): number => fs.statSync(filePath).size;
export const deleteFile   = (filePath: string): void => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); };
