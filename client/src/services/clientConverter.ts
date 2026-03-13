/**
 * Client-side file processing — runs entirely in the browser,
 * no server needed. Returns a {blob, filename} result or special data.
 */

import QRCode from "qrcode";
import JSZip from "jszip";
import { marked } from "marked";

export interface ClientResult {
  blob?: Blob;
  filename?: string;
  /** For special outputs (word count, QR code PNG, etc.) */
  specialData?: Record<string, any>;
}

// ─── Image tool helpers ───────────────────────────────────────────────────────

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))), mimeType, quality);
  });
}

function getExt(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function stripExt(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

// ─── Image conversions ───────────────────────────────────────────────────────

async function imageConvert(
  file: File,
  toMime: string,
  toExt: string,
  quality = 0.92,
  transform?: (ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) => void,
): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  if (transform) transform(ctx, img, canvas.width, canvas.height);
  const blob = await canvasToBlob(canvas, toMime, quality);
  return { blob, filename: `${stripExt(file.name)}.${toExt}` };
}

export async function jpgToPng(file: File): Promise<ClientResult> {
  return imageConvert(file, "image/png", "png");
}
export async function pngToJpg(file: File): Promise<ClientResult> {
  return imageConvert(file, "image/jpeg", "jpg", 0.92);
}
export async function webpToJpg(file: File): Promise<ClientResult> {
  return imageConvert(file, "image/jpeg", "jpg", 0.92);
}
export async function jpgToWebp(file: File): Promise<ClientResult> {
  return imageConvert(file, "image/webp", "webp", 0.88);
}
export async function pngToWebp(file: File): Promise<ClientResult> {
  return imageConvert(file, "image/webp", "webp", 0.88);
}
export async function gifToWebp(file: File): Promise<ClientResult> {
  return imageConvert(file, "image/webp", "webp", 0.88);
}
export async function bmpToPng(file: File): Promise<ClientResult> {
  return imageConvert(file, "image/png", "png");
}
export async function icoToPng(file: File): Promise<ClientResult> {
  return imageConvert(file, "image/png", "png");
}
export async function svgToPng(file: File): Promise<ClientResult> {
  return imageConvert(file, "image/png", "png");
}

export async function resizeImage(file: File, widthStr: string, heightStr: string): Promise<ClientResult> {
  const img = await loadImage(file);
  const w = parseInt(widthStr) || img.naturalWidth;
  const h = parseInt(heightStr) || img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  const ext = ["jpg", "jpeg"].includes(getExt(file.name)) ? "jpg" : "png";
  const mime = ext === "jpg" ? "image/jpeg" : "image/png";
  return { blob: await canvasToBlob(canvas, mime, 0.92), filename: `${stripExt(file.name)}-${w}x${h}.${ext}` };
}

export async function compressImage(file: File, quality = 0.7): Promise<ClientResult> {
  return imageConvert(file, "image/jpeg", "jpg", quality);
}

export async function rotateImage(file: File, angleDeg = 90): Promise<ClientResult> {
  const img = await loadImage(file);
  const rad = (angleDeg * Math.PI) / 180;
  const w = Math.abs(img.naturalWidth * Math.cos(rad)) + Math.abs(img.naturalHeight * Math.sin(rad));
  const h = Math.abs(img.naturalWidth * Math.sin(rad)) + Math.abs(img.naturalHeight * Math.cos(rad));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w); canvas.height = Math.round(h);
  const ctx = canvas.getContext("2d")!;
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-rotated.png` };
}

export async function grayscaleImage(file: File): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = "grayscale(100%)";
  ctx.drawImage(img, 0, 0);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-grayscale.png` };
}

export async function watermarkImage(file: File, text = "© UniConvert"): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const fontSize = Math.max(24, Math.floor(canvas.width / 18));
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 6;
  ctx.textAlign = "center";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.fillText(text, 0, 0);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-watermarked.png` };
}

export async function cropImage(file: File, x = 0, y = 0, w?: number, h?: number): Promise<ClientResult> {
  const img = await loadImage(file);
  const cw = w ?? img.naturalWidth - x;
  const ch = h ?? img.naturalHeight - y;
  const canvas = document.createElement("canvas");
  canvas.width = cw; canvas.height = ch;
  canvas.getContext("2d")!.drawImage(img, x, y, cw, ch, 0, 0, cw, ch);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-cropped.png` };
}

// ─── QR Code ─────────────────────────────────────────────────────────────────

export async function generateQrCode(text: string): Promise<ClientResult> {
  const dataUrl = await QRCode.toDataURL(text, { width: 400, margin: 2, color: { dark: "#1e293b", light: "#ffffff" } });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return {
    blob,
    filename: `qrcode-${Date.now()}.png`,
    specialData: { qrDataUrl: dataUrl },
  };
}

// ─── Word counter ─────────────────────────────────────────────────────────────

export async function wordCount(file: File): Promise<ClientResult> {
  const text = await file.text();
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
  const lines = text.split("\n").length;

  const report = `Word Count Report — ${file.name}
${"=".repeat(40)}
Words:              ${words.toLocaleString()}
Characters:         ${chars.toLocaleString()}
Characters (no sp): ${charsNoSpace.toLocaleString()}
Sentences:          ${sentences.toLocaleString()}
Paragraphs:         ${paragraphs.toLocaleString()}
Lines:              ${lines.toLocaleString()}
Avg word length:    ${words > 0 ? (charsNoSpace / words).toFixed(2) : "0"} chars
`;

  const blob = new Blob([report], { type: "text/plain" });
  return {
    blob,
    filename: `${stripExt(file.name)}-word-count.txt`,
    specialData: { words, chars, charsNoSpace, sentences, paragraphs, lines },
  };
}

// ─── Base64 Encode ───────────────────────────────────────────────────────────

export async function base64Encode(file: File): Promise<ClientResult> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const b64 = btoa(binary);
  const output = `data:${file.type};base64,${b64}`;
  const blob = new Blob([output], { type: "text/plain" });
  return { blob, filename: `${stripExt(file.name)}-base64.txt` };
}

// ─── Markdown → HTML ──────────────────────────────────────────────────────────

export async function mdToHtml(file: File): Promise<ClientResult> {
  const md = await file.text();
  const body = await marked.parse(md);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${stripExt(file.name)}</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:860px;margin:2rem auto;padding:0 1.5rem;line-height:1.75;color:#1e293b}
  h1,h2,h3{color:#1e40af;margin-top:2rem}
  code{background:#f1f5f9;padding:0.15em 0.4em;border-radius:4px;font-size:0.9em}
  pre{background:#0f172a;color:#e2e8f0;padding:1.5rem;border-radius:8px;overflow:auto}
  blockquote{border-left:4px solid #3b82f6;margin:0;padding:0.5rem 1rem;background:#eff6ff;border-radius:0 8px 8px 0}
  table{border-collapse:collapse;width:100%}th,td{border:1px solid #e2e8f0;padding:0.5rem 1rem;text-align:left}
  th{background:#f8fafc;font-weight:600}
</style>
</head>
<body>${body}</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  return { blob, filename: `${stripExt(file.name)}.html` };
}

// ─── HTML → Markdown ──────────────────────────────────────────────────────────

export async function htmlToMd(file: File): Promise<ClientResult> {
  const html = await file.text();
  // Basic HTML→Markdown via DOM parsing
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const md = htmlNodeToMd(doc.body);
  const blob = new Blob([md], { type: "text/markdown" });
  return { blob, filename: `${stripExt(file.name)}.md` };
}

function htmlNodeToMd(node: Element | null): string {
  if (!node) return "";
  let out = "";
  node.childNodes.forEach((child: ChildNode) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.textContent ?? "";
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      switch (el.tagName.toLowerCase()) {
        case "h1": out += `\n# ${el.textContent}\n`; break;
        case "h2": out += `\n## ${el.textContent}\n`; break;
        case "h3": out += `\n### ${el.textContent}\n`; break;
        case "p":  out += `\n${htmlNodeToMd(el)}\n`; break;
        case "strong": case "b": out += `**${el.textContent}**`; break;
        case "em": case "i": out += `*${el.textContent}*`; break;
        case "code": out += `\`${el.textContent}\``; break;
        case "pre":  out += `\n\`\`\`\n${el.textContent}\n\`\`\`\n`; break;
        case "a": out += `[${el.textContent}](${el.getAttribute("href") ?? ""})`; break;
        case "li": out += `- ${htmlNodeToMd(el)}\n`; break;
        case "ul": case "ol": case "div": case "section": case "article": case "main": case "body":
          out += htmlNodeToMd(el); break;
        case "br": out += "\n"; break;
        case "hr": out += "\n---\n"; break;
        default: out += el.textContent ?? "";
      }
    }
  });
  return out;
}

// ─── CSV ↔ JSON (client-side) ────────────────────────────────────────────────

export async function csvToJson(file: File): Promise<ClientResult> {
  const text = await file.text();
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const data = lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  return { blob, filename: `${stripExt(file.name)}.json` };
}

export async function jsonToCsv(file: File): Promise<ClientResult> {
  const text = await file.text();
  const data: Record<string, any>[] = JSON.parse(text);
  if (!Array.isArray(data) || !data.length) throw new Error("JSON must be a non-empty array of objects");
  const headers = Object.keys(data[0]);
  const csv = [
    headers.map((h) => `"${h}"`).join(","),
    ...data.map((row) => headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  return { blob, filename: `${stripExt(file.name)}.csv` };
}

export async function xmlToJson(file: File): Promise<ClientResult> {
  const text = await file.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");
  const json = xmlNodeToObj(xmlDoc.documentElement);
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
  return { blob, filename: `${stripExt(file.name)}.json` };
}

function xmlNodeToObj(node: Element): any {
  if (node.children.length === 0) return node.textContent ?? "";
  const obj: Record<string, any> = {};
  Array.from(node.children).forEach((child) => {
    const key = child.tagName;
    const val = xmlNodeToObj(child);
    if (obj[key]) {
      if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
      obj[key].push(val);
    } else {
      obj[key] = val;
    }
  });
  return obj;
}

export async function jsonToXml(file: File): Promise<ClientResult> {
  const text = await file.text();
  const data = JSON.parse(text);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>${objToXml(data)}</root>`;
  const blob = new Blob([xml], { type: "application/xml" });
  return { blob, filename: `${stripExt(file.name)}.xml` };
}

function objToXml(obj: any, tagName = "item"): string {
  if (typeof obj !== "object" || obj === null) return `<${tagName}>${String(obj)}</${tagName}>`;
  if (Array.isArray(obj)) return obj.map((i) => objToXml(i, tagName)).join("");
  return Object.entries(obj)
    .map(([k, v]) => (Array.isArray(v) ? v.map((i) => objToXml(i, k)).join("") : `<${k}>${typeof v === "object" ? objToXml(v) : String(v)}</${k}>`))
    .join("");
}

// ─── ZIP files ───────────────────────────────────────────────────────────────

export async function zipFiles(files: File[]): Promise<ClientResult> {
  const zip = new JSZip();
  for (const file of files) {
    const buf = await file.arrayBuffer();
    zip.file(file.name, buf);
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return { blob, filename: `archive-${Date.now()}.zip` };
}

export async function unzipFile(file: File): Promise<ClientResult> {
  const buf = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  // Return first file for simplicity; a real solution would show a picker
  const entries = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  if (!entries.length) throw new Error("Empty zip file");
  const firstEntry = zip.files[entries[0]];
  const blob = await firstEntry.async("blob");
  return { blob, filename: entries[0] };
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

/**
 * Set of tool IDs that run entirely on the client.
 */
export const CLIENT_SIDE_TOOLS = new Set([
  "jpg-to-png", "png-to-jpg", "webp-to-jpg", "jpg-to-webp", "png-to-webp",
  "gif-to-webp", "bmp-to-png", "ico-to-png", "svg-to-png",
  "resize-image", "compress-img", "rotate-image", "grayscale-image",
  "watermark-image", "crop-image",
  "qr-code-gen",
  "word-count",
  "base64-encode",
  "md-to-html", "html-to-md",
  "csv-to-json", "json-to-csv", "xml-to-json", "json-to-xml",
  "zip-files", "unzip-files",
]);

export async function processClientSide(
  toolId: string,
  files: File[],
  extraParam?: string,
): Promise<ClientResult> {
  const file = files[0];
  switch (toolId) {
    case "jpg-to-png":       return jpgToPng(file);
    case "png-to-jpg":       return pngToJpg(file);
    case "webp-to-jpg":      return webpToJpg(file);
    case "jpg-to-webp":      return jpgToWebp(file);
    case "png-to-webp":      return pngToWebp(file);
    case "gif-to-webp":      return gifToWebp(file);
    case "bmp-to-png":       return bmpToPng(file);
    case "ico-to-png":       return icoToPng(file);
    case "svg-to-png":       return svgToPng(file);
    case "resize-image": {
      const [w, h] = (extraParam || "").split("x");
      return resizeImage(file, w, h);
    }
    case "compress-img":     return compressImage(file, parseFloat(extraParam || "0.7"));
    case "rotate-image":     return rotateImage(file, parseFloat(extraParam || "90"));
    case "grayscale-image":  return grayscaleImage(file);
    case "watermark-image":  return watermarkImage(file, extraParam || "© UniConvert");
    case "crop-image":       return cropImage(file);
    case "qr-code-gen":      return generateQrCode(extraParam || file.name);
    case "word-count":       return wordCount(file);
    case "base64-encode":    return base64Encode(file);
    case "md-to-html":       return mdToHtml(file);
    case "html-to-md":       return htmlToMd(file);
    case "csv-to-json":      return csvToJson(file);
    case "json-to-csv":      return jsonToCsv(file);
    case "xml-to-json":      return xmlToJson(file);
    case "json-to-xml":      return jsonToXml(file);
    case "zip-files":        return zipFiles(files);
    case "unzip-files":      return unzipFile(file);
    default:
      throw new Error(`Unknown client-side tool: ${toolId}`);
  }
}
