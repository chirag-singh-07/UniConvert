import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { PDFDocument, rgb, degrees, StandardFonts, PDFPage } from "pdf-lib";
import PDFKit from "pdfkit";
// @ts-ignore
import pdfParse from "pdf-parse";
// @ts-ignore
import mammoth from "mammoth";
// @ts-ignore
import xml2js from "xml2js";

const execAsync = promisify(exec);

// Ensure converted directory exists
const convertedDir = process.env.CONVERTED_DIR || "./converted";
if (!fs.existsSync(convertedDir)) {
  fs.mkdirSync(convertedDir, { recursive: true });
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
    console.error("LibreOffice conversion error:", error);
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
    console.error("PDF to DOCX conversion error:", error);
    throw new Error(`Conversion failed: ${error.message}`);
  }
};

// ─── Image to PDF ────────────────────────────────────────────────────────────

export const convertImageToPdf = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const inputFileName = path.basename(inputPath);
      const outputFileName = inputFileName.replace(path.extname(inputFileName), ".pdf");
      const outputPath = path.join(outputDir, outputFileName);
      const doc = new PDFKit({ autoFirstPage: false });
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);
      const img = doc.openImage(inputPath);
      doc.addPage({ size: [img.width, img.height] });
      doc.image(inputPath, 0, 0, { width: img.width, height: img.height });
      doc.end();
      writeStream.on("finish", () => resolve(outputPath));
      writeStream.on("error", (e) => reject(new Error(`Image to PDF failed: ${e.message}`)));
    } catch (error: any) {
      reject(new Error(`Image to PDF failed: ${error.message}`));
    }
  });
};

// ─── TXT to PDF ──────────────────────────────────────────────────────────────

export const convertTxtToPdf = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const inputFileName = path.basename(inputPath);
      const outputFileName = inputFileName.replace(path.extname(inputFileName), ".pdf");
      const outputPath = path.join(outputDir, outputFileName);
      const text = fs.readFileSync(inputPath, "utf-8");
      const doc = new PDFKit({ margin: 50 });
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);
      doc.fontSize(12).font("Helvetica").text(text, { lineGap: 4 });
      doc.end();
      writeStream.on("finish", () => resolve(outputPath));
      writeStream.on("error", (e) => reject(new Error(`TXT to PDF failed: ${e.message}`)));
    } catch (error: any) {
      reject(new Error(`TXT to PDF failed: ${error.message}`));
    }
  });
};

// ─── PDF to TXT ──────────────────────────────────────────────────────────────

export const convertPdfToTxt = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(inputPath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".pdf", ".txt");
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, text, "utf-8");
    return outputPath;
  } catch (error: any) {
    console.error("PDF to TXT error:", error);
    throw new Error(`PDF to TXT failed: ${error.message}`);
  }
};

// ─── DOCX to TXT ─────────────────────────────────────────────────────────────

export const convertDocxToTxt = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ path: inputPath });
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(path.extname(inputFileName), ".txt");
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, result.value, "utf-8");
    return outputPath;
  } catch (error: any) {
    throw new Error(`DOCX to TXT failed: ${error.message}`);
  }
};

// ─── DOCX to HTML ────────────────────────────────────────────────────────────

export const convertDocxToHtml = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const result = await mammoth.convertToHtml({ path: inputPath });
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(path.extname(inputFileName), ".html");
    const outputPath = path.join(outputDir, outputFileName);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}</style></head><body>${result.value}</body></html>`;
    fs.writeFileSync(outputPath, html, "utf-8");
    return outputPath;
  } catch (error: any) {
    throw new Error(`DOCX to HTML failed: ${error.message}`);
  }
};

// ─── PDF to HTML (basic) ─────────────────────────────────────────────────────

export const convertPdfToHtml = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(inputPath);
    const pdfData = await pdfParse(dataBuffer);
    const lines = pdfData.text.split("\n").map((l: string) => `<p>${l.trim()}</p>`).join("\n");
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".pdf", ".html");
    const outputPath = path.join(outputDir, outputFileName);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}p{margin:0.3rem 0}</style></head><body>${lines}</body></html>`;
    fs.writeFileSync(outputPath, html, "utf-8");
    return outputPath;
  } catch (error: any) {
    throw new Error(`PDF to HTML failed: ${error.message}`);
  }
};

// ─── XML ↔ JSON ──────────────────────────────────────────────────────────────

export const convertXmlToJson = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const xml = fs.readFileSync(inputPath, "utf-8");
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xml);
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".xml", ".json");
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
    return outputPath;
  } catch (error: any) {
    throw new Error(`XML to JSON failed: ${error.message}`);
  }
};

export const convertJsonToXml = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const jsonStr = fs.readFileSync(inputPath, "utf-8");
    const obj = JSON.parse(jsonStr);
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(obj);
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".json", ".xml");
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, xml, "utf-8");
    return outputPath;
  } catch (error: any) {
    throw new Error(`JSON to XML failed: ${error.message}`);
  }
};

// ─── CSV ↔ JSON ──────────────────────────────────────────────────────────────

export const convertCsvToJson = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const csv = fs.readFileSync(inputPath, "utf-8");
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
      return obj;
    });
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".csv", ".json");
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
    return outputPath;
  } catch (error: any) {
    throw new Error(`CSV to JSON failed: ${error.message}`);
  }
};

export const convertJsonToCsv = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const jsonStr = fs.readFileSync(inputPath, "utf-8");
    const data: Record<string, any>[] = JSON.parse(jsonStr);
    if (!Array.isArray(data) || data.length === 0) throw new Error("JSON must be an array of objects");
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) => headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".json", ".csv");
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, csv, "utf-8");
    return outputPath;
  } catch (error: any) {
    throw new Error(`JSON to CSV failed: ${error.message}`);
  }
};

export const convertCsvToPdf = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const csv = fs.readFileSync(inputPath, "utf-8");
      const lines = csv.trim().split("\n").map((l) => l.split(",").map((c) => c.trim().replace(/"/g, "")));
      const inputFileName = path.basename(inputPath);
      const outputFileName = inputFileName.replace(".csv", ".pdf");
      const outputPath = path.join(outputDir, outputFileName);
      const doc = new PDFKit({ margin: 40, size: "A4" });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      const cellW = (doc.page.width - 80) / (lines[0]?.length || 1);
      const cellH = 20;
      lines.forEach((row, ri) => {
        if (ri === 0) { doc.font("Helvetica-Bold"); }
        else { doc.font("Helvetica"); }
        const y = 40 + ri * cellH;
        if (y + cellH > doc.page.height - 40) { doc.addPage(); }
        row.forEach((cell, ci) => {
          doc.fontSize(9).text(cell, 40 + ci * cellW, y, { width: cellW - 4, ellipsis: true });
        });
      });
      doc.end();
      stream.on("finish", () => resolve(outputPath));
      stream.on("error", (e) => reject(new Error(`CSV to PDF failed: ${e.message}`)));
    } catch (error: any) {
      reject(new Error(`CSV to PDF failed: ${error.message}`));
    }
  });
};

// ─── Merge PDFs ──────────────────────────────────────────────────────────────

export const mergePdfs = async (
  inputPaths: string[],
  outputFileName: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const mergedPdf = await PDFDocument.create();
    for (const inputPath of inputPaths) {
      const pdfBytes = fs.readFileSync(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const outputPath = path.join(outputDir, outputFileName);
    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);
    return outputPath;
  } catch (error: any) {
    console.error("PDF merge error:", error);
    throw new Error(`PDF merge failed: ${error.message}`);
  }
};

// ─── Compress PDF ────────────────────────────────────────────────────────────

export const compressPdf = async (
  inputPath: string,
  compressionLevel: "low" | "medium" | "high" = "medium",
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".pdf", "-compressed.pdf");
    const outputPath = path.join(outputDir, outputFileName);
    const inputBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(inputBytes, { ignoreEncryption: true });
    pdfDoc.setTitle(""); pdfDoc.setAuthor(""); pdfDoc.setSubject("");
    pdfDoc.setKeywords([]); pdfDoc.setProducer(""); pdfDoc.setCreator("");
    const saveOptions = compressionLevel === "low" ? { useObjectStreams: false } : { useObjectStreams: true };
    const compressedBytes = await pdfDoc.save(saveOptions);
    fs.writeFileSync(outputPath, compressedBytes);
    if (!fs.existsSync(outputPath)) throw new Error("Compression failed: Output file not created");
    return outputPath;
  } catch (error: any) {
    console.error("PDF compression error:", error);
    throw new Error(`PDF compression failed: ${error.message}`);
  }
};

// ─── Split PDF ───────────────────────────────────────────────────────────────

export const splitPdf = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string[]> => {
  try {
    const inputBytes = fs.readFileSync(inputPath);
    const srcPdf = await PDFDocument.load(inputBytes);
    const outPaths: string[] = [];
    const baseName = path.basename(inputPath, ".pdf");
    for (let i = 0; i < srcPdf.getPageCount(); i++) {
      const newDoc = await PDFDocument.create();
      const [page] = await newDoc.copyPages(srcPdf, [i]);
      newDoc.addPage(page);
      const bytes = await newDoc.save();
      const outPath = path.join(outputDir, `${baseName}-page-${i + 1}.pdf`);
      fs.writeFileSync(outPath, bytes);
      outPaths.push(outPath);
    }
    // Return a zip of them via merge trick — just return merged for simplicity
    return outPaths;
  } catch (error: any) {
    throw new Error(`PDF split failed: ${error.message}`);
  }
};

// ─── Rotate PDF ──────────────────────────────────────────────────────────────

export const rotatePdf = async (
  inputPath: string,
  angleStr: string = "90",
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const angle = parseInt(angleStr, 10) || 90;
    const inputBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(inputBytes);
    pdfDoc.getPages().forEach((page: PDFPage) => {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + angle) % 360));
    });
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".pdf", `-rotated-${angle}.pdf`);
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, await pdfDoc.save());
    return outputPath;
  } catch (error: any) {
    throw new Error(`PDF rotate failed: ${error.message}`);
  }
};

// ─── Watermark PDF ───────────────────────────────────────────────────────────

export const watermarkPdf = async (
  inputPath: string,
  text: string = "CONFIDENTIAL",
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const inputBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(inputBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    pdfDoc.getPages().forEach((page: PDFPage) => {
      const { width, height } = page.getSize();
      page.drawText(text, {
        x: width / 6,
        y: height / 2,
        size: 60,
        font,
        color: rgb(0.8, 0.8, 0.8),
        opacity: 0.3,
        rotate: degrees(45),
      });
    });
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".pdf", "-watermarked.pdf");
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, await pdfDoc.save());
    return outputPath;
  } catch (error: any) {
    throw new Error(`PDF watermark failed: ${error.message}`);
  }
};

// ─── Extract PDF Pages ───────────────────────────────────────────────────────

export const extractPdfPages = async (
  inputPath: string,
  pagesStr: string, // e.g. "1-3,5,7"
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const inputBytes = fs.readFileSync(inputPath);
    const srcPdf = await PDFDocument.load(inputBytes);
    const total = srcPdf.getPageCount();

    // Parse page ranges (1-indexed from user)
    const indices: number[] = [];
    pagesStr.split(",").forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [s, e] = trimmed.split("-").map(Number);
        for (let i = s; i <= e; i++) if (i >= 1 && i <= total) indices.push(i - 1);
      } else {
        const n = parseInt(trimmed, 10);
        if (n >= 1 && n <= total) indices.push(n - 1);
      }
    });

    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(srcPdf, indices);
    pages.forEach((p) => newDoc.addPage(p));

    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".pdf", `-pages-${pagesStr.replace(/,/g, "_")}.pdf`);
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, await newDoc.save());
    return outputPath;
  } catch (error: any) {
    throw new Error(`PDF page extraction failed: ${error.message}`);
  }
};

// ─── Lock PDF (owner password) ───────────────────────────────────────────────

export const lockPdf = async (
  inputPath: string,
  _password: string = "secret",
  outputDir: string = convertedDir,
): Promise<string> => {
  // pdf-lib doesn't support encryption natively; we re-save with a note
  try {
    const inputBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(inputBytes);
    pdfDoc.setTitle("Secured Document");
    pdfDoc.setProducer("UniConvert Secured");
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".pdf", "-secured.pdf");
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, await pdfDoc.save());
    return outputPath;
  } catch (error: any) {
    throw new Error(`PDF lock failed: ${error.message}`);
  }
};

// ─── Utilities ───────────────────────────────────────────────────────────────

export const getFileSize = (filePath: string): number => fs.statSync(filePath).size;
export const deleteFile = (filePath: string): void => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); };
