import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import PDFDocument from "pdfkit";

const execAsync = promisify(exec);

// Ensure converted directory exists
const convertedDir = process.env.CONVERTED_DIR || "./converted";
if (!fs.existsSync(convertedDir)) {
  fs.mkdirSync(convertedDir, { recursive: true });
}

/**
 * Convert DOCX/PPT/Excel to PDF using LibreOffice
 */
export const convertToPdfWithLibreOffice = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    // LibreOffice command
    const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;

    await execAsync(command);

    // Get the output file name
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(
      path.extname(inputFileName),
      ".pdf",
    );
    const outputPath = path.join(outputDir, outputFileName);

    // Verify file was created
    if (!fs.existsSync(outputPath)) {
      throw new Error("Conversion failed: Output file not created");
    }

    return outputPath;
  } catch (error: any) {
    console.error("LibreOffice conversion error:", error);
    throw new Error(`Conversion failed: ${error.message}`);
  }
};

/**
 * Convert PDF to DOCX using LibreOffice
 */
export const convertPdfToDocx = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    // LibreOffice can convert PDF to DOCX (with limitations)
    const command = `soffice --headless --convert-to docx --outdir "${outputDir}" "${inputPath}"`;

    await execAsync(command);

    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".pdf", ".docx");
    const outputPath = path.join(outputDir, outputFileName);

    if (!fs.existsSync(outputPath)) {
      throw new Error("Conversion failed: Output file not created");
    }

    return outputPath;
  } catch (error: any) {
    console.error("PDF to DOCX conversion error:", error);
    throw new Error(`Conversion failed: ${error.message}`);
  }
};

/**
 * Convert Image (JPG/PNG) to PDF using pdfkit
 */
export const convertImageToPdf = async (
  inputPath: string,
  outputDir: string = convertedDir,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const inputFileName = path.basename(inputPath);
      const outputFileName = inputFileName.replace(
        path.extname(inputFileName),
        ".pdf",
      );
      const outputPath = path.join(outputDir, outputFileName);

      const doc = new PDFDocument({ autoFirstPage: false });
      const writeStream = fs.createWriteStream(outputPath);

      doc.pipe(writeStream);

      // Get image dimensions
      const img = doc.openImage(inputPath);

      // Add page with image dimensions
      doc.addPage({ size: [img.width, img.height] });
      doc.image(inputPath, 0, 0, {
        width: img.width,
        height: img.height,
      });

      doc.end();

      writeStream.on("finish", () => {
        resolve(outputPath);
      });

      writeStream.on("error", (error) => {
        reject(new Error(`Image to PDF conversion failed: ${error.message}`));
      });
    } catch (error: any) {
      reject(new Error(`Image to PDF conversion failed: ${error.message}`));
    }
  });
};

/**
 * Merge multiple PDFs into one using pdf-lib
 */
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

/**
 * Compress PDF using Ghostscript
 */
export const compressPdf = async (
  inputPath: string,
  compressionLevel: "low" | "medium" | "high" = "medium",
  outputDir: string = convertedDir,
): Promise<string> => {
  try {
    const inputFileName = path.basename(inputPath);
    const outputFileName = inputFileName.replace(".pdf", "-compressed.pdf");
    const outputPath = path.join(outputDir, outputFileName);

    // Ghostscript compression settings
    const settings: { [key: string]: string } = {
      low: "/printer", // High quality
      medium: "/ebook", // Medium quality
      high: "/screen", // Low quality, high compression
    };

    const quality = settings[compressionLevel];

    // Ghostscript command (Windows uses gswin64c or gswin32c)
    const gsCommand = process.platform === "win32" ? "gswin64c" : "gs";

    const command = `${gsCommand} -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${quality} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

    await execAsync(command);

    if (!fs.existsSync(outputPath)) {
      throw new Error("Compression failed: Output file not created");
    }

    return outputPath;
  } catch (error: any) {
    console.error("PDF compression error:", error);
    throw new Error(`PDF compression failed: ${error.message}`);
  }
};

/**
 * Get file size in bytes
 */
export const getFileSize = (filePath: string): number => {
  const stats = fs.statSync(filePath);
  return stats.size;
};

/**
 * Delete file
 */
export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
