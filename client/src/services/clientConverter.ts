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
  const cw = w || img.naturalWidth;
  const ch = h || img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = cw; canvas.height = ch;
  canvas.getContext("2d")!.drawImage(img, x, y, cw, ch, 0, 0, cw, ch);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-cropped.png` };
}

export async function blurImage(file: File, blurAmount = 5): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = `blur(${blurAmount}px)`;
  ctx.drawImage(img, 0, 0);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-blurred.png` };
}

export async function invertImage(file: File): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = `invert(100%)`;
  ctx.drawImage(img, 0, 0);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-inverted.png` };
}

export async function sepiaImage(file: File): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = `sepia(100%)`;
  ctx.drawImage(img, 0, 0);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-sepia.png` };
}

export async function flipImage(file: File, direction = "horizontal"): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  if (direction === "horizontal") {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }
  ctx.drawImage(img, 0, 0);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-flipped.png` };
}

export async function pixelateImage(file: File, pixelSize = 10): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  
  // Scale down
  const sw = Math.max(1, Math.floor(canvas.width / pixelSize));
  const sh = Math.max(1, Math.floor(canvas.height / pixelSize));
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = sw; tempCanvas.height = sh;
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.drawImage(img, 0, 0, sw, sh);
  
  // Scale back up
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, 0, 0, sw, sh, 0, 0, canvas.width, canvas.height);
  
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-pixelated.png` };
}

export async function brightnessImage(file: File, amount = 1.2): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = `brightness(${amount * 100}%)`;
  ctx.drawImage(img, 0, 0);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-brightness.png` };
}

export async function contrastImage(file: File, amount = 1.2): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = `contrast(${amount * 100}%)`;
  ctx.drawImage(img, 0, 0);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-contrast.png` };
}

export async function sharpnessImage(file: File): Promise<ClientResult> {
  // Simple convolution filter for sharpening
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, w, h);
  const pixels = imageData.data;
  const side = Math.round(Math.sqrt(9));
  const halfSide = Math.floor(side / 2);
  const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const output = ctx.createImageData(w, h);
  const dst = output.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0;
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = y + cy - halfSide;
          const scx = x + cx - halfSide;
          if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
            const srcOff = (scy * w + scx) * 4;
            const wt = weights[cy * side + cx];
            r += pixels[srcOff] * wt;
            g += pixels[srcOff + 1] * wt;
            b += pixels[srcOff + 2] * wt;
          }
        }
      }
      const dstOff = (y * w + x) * 4;
      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = pixels[dstOff + 3];
    }
  }
  ctx.putImageData(output, 0, 0);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-sharp.png` };
}

export async function extractImageInfo(file: File): Promise<ClientResult> {
  const img = await loadImage(file);
  const info = {
    Filename: file.name,
    Type: file.type,
    Size: `${(file.size / 1024).toFixed(2)} KB`,
    Dimensions: `${img.naturalWidth} x ${img.naturalHeight} px`,
    AspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2),
    LastModified: new Date(file.lastModified).toLocaleString(),
  };
  
  const report = `Image Information — ${file.name}
${"=".repeat(40)}
${Object.entries(info).map(([k, v]) => `${k.padEnd(15)}: ${v}`).join("\n")}
`;

  const blob = new Blob([report], { type: "text/plain" });
  return { 
    blob, 
    filename: `${stripExt(file.name)}-info.txt`,
    specialData: info 
  };
}

export async function roundCorners(file: File, radius = 50): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(canvas.width - radius, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
  ctx.lineTo(canvas.width, canvas.height - radius);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
  ctx.lineTo(radius, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();
  
  ctx.drawImage(img, 0, 0);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-rounded.png` };
}

export async function imageBorder(file: File, borderSize = 20, color = "#000000"): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth + borderSize * 2;
  canvas.height = img.naturalHeight + borderSize * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, borderSize, borderSize);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-bordered.png` };
}

export async function vignetteImage(file: File, amount = 0.5): Promise<ClientResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  
  const outerRadius = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, outerRadius
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, `rgba(0,0,0,${amount})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return { blob: await canvasToBlob(canvas, "image/png"), filename: `${stripExt(file.name)}-vignette.png` };
}

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
  "watermark-image", "crop-image", "blur-image", "invert-image", "sepia-image", "flip-image",
  "brightness-image", "contrast-image", "sharpness-image", "pixelate-image", "image-info",
  "round-corners", "image-border", "vignette-image",
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
    case "crop-image": {
      const parts = (extraParam || "").split(",").map(Number);
      return cropImage(file, parts[0] || 0, parts[1] || 0, parts[2], parts[3]);
    }
    case "blur-image":       return blurImage(file, parseFloat(extraParam || "5"));
    case "invert-image":     return invertImage(file);
    case "sepia-image":      return sepiaImage(file);
    case "flip-image":       return flipImage(file, extraParam || "horizontal");
    case "brightness-image": return brightnessImage(file, parseFloat(extraParam || "1.2"));
    case "contrast-image":   return contrastImage(file, parseFloat(extraParam || "1.2"));
    case "sharpness-image":  return sharpnessImage(file);
    case "pixelate-image":   return pixelateImage(file, parseInt(extraParam || "10"));
    case "image-info":       return extractImageInfo(file);
    case "round-corners":    return roundCorners(file, parseInt(extraParam || "50"));
    case "image-border": {
      const [size, color] = (extraParam || "").split(",");
      return imageBorder(file, parseInt(size || "20"), color || "#000000");
    }
    case "vignette-image":   return vignetteImage(file, parseFloat(extraParam || "0.5"));
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
