import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Presentation,
  Merge,
  Minimize2,
  RotateCcw,
  Scissors,
  FileJson,
  FileCode,
  FileType,
  ArrowLeftRight,
  ImageIcon,
  SplitSquareHorizontal,
  Lock,
  Unlock,
  Stamp,
  Video,
  Music,
  Archive,
  Hash,
  QrCode,
  Globe,
  FileSignature,
  AlignLeft,
  BookOpen,
  Binary,
  Braces,
  Table,
  Barcode,
  Type,
  PenTool,
  Palette,
  ClipboardList,
} from "lucide-react";

export interface ConversionOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  accept: string;
  badge?: string;
}

export interface ConversionCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  options: ConversionOption[];
}

export const conversionCategories: ConversionCategory[] = [
  {
    id: "pdf-tools",
    label: "PDF Tools",
    icon: <FileText className="w-5 h-5" />,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    borderColor: "border-red-200 dark:border-red-800",
    options: [
      { id: "compress-pdf",      label: "Compress PDF",     description: "Shrink PDF file size intelligently",          icon: <Minimize2 className="w-5 h-5" />,            accept: ".pdf" },
      { id: "merge-pdf",         label: "Merge PDFs",       description: "Combine up to 10 PDFs into one file",         icon: <Merge className="w-5 h-5" />,                accept: ".pdf",               badge: "Multi" },
      { id: "split-pdf",         label: "Split PDF",        description: "Split PDF into individual pages",             icon: <SplitSquareHorizontal className="w-5 h-5" />, accept: ".pdf" },
      { id: "rotate-pdf",        label: "Rotate PDF",       description: "Rotate all or selected pages",                icon: <RotateCcw className="w-5 h-5" />,             accept: ".pdf" },
      { id: "crop-pdf",          label: "Crop PDF",         description: "Crop margins and whitespace",                 icon: <Scissors className="w-5 h-5" />,             accept: ".pdf",               badge: "Soon" },
      { id: "lock-pdf",          label: "Lock PDF",         description: "Password-protect your document",              icon: <Lock className="w-5 h-5" />,                 accept: ".pdf" },
      { id: "unlock-pdf",        label: "Unlock PDF",       description: "Remove password from a PDF",                  icon: <Unlock className="w-5 h-5" />,               accept: ".pdf",               badge: "Soon" },
      { id: "watermark-pdf",     label: "Watermark PDF",    description: "Add custom text watermarks",                  icon: <Stamp className="w-5 h-5" />,                accept: ".pdf" },
      { id: "sign-pdf",          label: "Sign PDF",         description: "Digitally sign your PDF document",            icon: <FileSignature className="w-5 h-5" />,         accept: ".pdf",               badge: "Soon" },
      { id: "extract-pdf-pages", label: "Extract Pages",    description: "Extract specific page ranges from PDF",       icon: <BookOpen className="w-5 h-5" />,             accept: ".pdf" },
      { id: "redact-pdf",        label: "Redact PDF",       description: "Permanently black out sensitive text",        icon: <AlignLeft className="w-5 h-5" />,            accept: ".pdf",               badge: "Soon" },
      { id: "flatten-pdf",       label: "Flatten PDF",      description: "Flatten form fields and annotations",         icon: <ClipboardList className="w-5 h-5" />,        accept: ".pdf",               badge: "Soon" },
    ],
  },
  {
    id: "convert-to-pdf",
    label: "To PDF",
    icon: <ArrowLeftRight className="w-5 h-5" />,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    options: [
      { id: "docx-to-pdf",   label: "DOCX → PDF",    description: "Microsoft Word to PDF",               icon: <FileText className="w-5 h-5" />,         accept: ".docx,.doc" },
      { id: "ppt-to-pdf",    label: "PPT → PDF",     description: "PowerPoint slides to PDF",            icon: <Presentation className="w-5 h-5" />,    accept: ".ppt,.pptx" },
      { id: "excel-to-pdf",  label: "Excel → PDF",   description: "Spreadsheets to PDF",                 icon: <FileSpreadsheet className="w-5 h-5" />, accept: ".xls,.xlsx" },
      { id: "image-to-pdf",  label: "Image → PDF",   description: "JPG, PNG, WEBP to PDF",               icon: <FileImage className="w-5 h-5" />,        accept: ".jpg,.jpeg,.png,.webp,.bmp,.gif" },
      { id: "txt-to-pdf",    label: "TXT → PDF",     description: "Plain text file to PDF",              icon: <FileType className="w-5 h-5" />,         accept: ".txt" },
      { id: "html-to-pdf",   label: "HTML → PDF",    description: "HTML web pages to PDF",               icon: <FileCode className="w-5 h-5" />,         accept: ".html,.htm",                        badge: "Soon" },
      { id: "md-to-pdf",     label: "Markdown → PDF",description: "Markdown documents to PDF",           icon: <FileCode className="w-5 h-5" />,         accept: ".md",                               badge: "Soon" },
      { id: "epub-to-pdf",   label: "EPUB → PDF",    description: "E-book format to PDF",                icon: <BookOpen className="w-5 h-5" />,         accept: ".epub",                             badge: "Soon" },
      { id: "odt-to-pdf",    label: "ODT → PDF",     description: "OpenDocument text to PDF",            icon: <FileText className="w-5 h-5" />,         accept: ".odt",                              badge: "Soon" },
      { id: "csv-to-pdf",    label: "CSV → PDF",     description: "CSV tables to a formatted PDF",       icon: <Table className="w-5 h-5" />,            accept: ".csv" },
    ],
  },
  {
    id: "convert-from-pdf",
    label: "PDF to Other",
    icon: <FileJson className="w-5 h-5" />,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    options: [
      { id: "pdf-to-docx",   label: "PDF → DOCX",   description: "PDF to editable Word document",       icon: <FileText className="w-5 h-5" />,         accept: ".pdf" },
      { id: "pdf-to-ppt",    label: "PDF → PPT",    description: "PDF to PowerPoint presentation",      icon: <Presentation className="w-5 h-5" />,    accept: ".pdf",  badge: "Soon" },
      { id: "pdf-to-excel",  label: "PDF → Excel",  description: "Extract tables to Excel",             icon: <FileSpreadsheet className="w-5 h-5" />, accept: ".pdf",  badge: "Soon" },
      { id: "pdf-to-txt",    label: "PDF → TXT",    description: "Extract all text from a PDF",         icon: <FileType className="w-5 h-5" />,         accept: ".pdf" },
      { id: "pdf-to-jpg",    label: "PDF → JPG",    description: "Each page becomes a JPEG image",      icon: <FileImage className="w-5 h-5" />,        accept: ".pdf",  badge: "Soon" },
      { id: "pdf-to-png",    label: "PDF → PNG",    description: "Each page becomes a PNG image",       icon: <FileImage className="w-5 h-5" />,        accept: ".pdf",  badge: "Soon" },
      { id: "pdf-to-html",   label: "PDF → HTML",   description: "Convert PDF to an HTML web page",     icon: <Globe className="w-5 h-5" />,            accept: ".pdf" },
      { id: "pdf-to-epub",   label: "PDF → EPUB",   description: "Convert PDF to e-book format",        icon: <BookOpen className="w-5 h-5" />,         accept: ".pdf",  badge: "Soon" },
      { id: "pdf-to-csv",    label: "PDF → CSV",    description: "Extract table data to CSV",           icon: <Table className="w-5 h-5" />,            accept: ".pdf",  badge: "Soon" },
      { id: "pdf-to-json",   label: "PDF → JSON",   description: "Parse PDF content to JSON",           icon: <Braces className="w-5 h-5" />,           accept: ".pdf",  badge: "Soon" },
    ],
  },
  {
    id: "image-tools",
    label: "Image Tools",
    icon: <ImageIcon className="w-5 h-5" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    options: [
      { id: "jpg-to-png",      label: "JPG → PNG",      description: "Lossless PNG with transparency support",   icon: <FileImage className="w-5 h-5" />, accept: ".jpg,.jpeg" },
      { id: "png-to-jpg",      label: "PNG → JPG",      description: "Smaller JPEG from PNG images",             icon: <FileImage className="w-5 h-5" />, accept: ".png" },
      { id: "webp-to-jpg",     label: "WEBP → JPG",     description: "Modern WebP to universal JPEG",             icon: <FileImage className="w-5 h-5" />, accept: ".webp" },
      { id: "jpg-to-webp",     label: "JPG → WEBP",     description: "Smaller WebP for modern browsers",          icon: <FileImage className="w-5 h-5" />, accept: ".jpg,.jpeg" },
      { id: "png-to-webp",     label: "PNG → WEBP",     description: "PNG to WebP with transparency",             icon: <FileImage className="w-5 h-5" />, accept: ".png" },
      { id: "gif-to-webp",     label: "GIF → WEBP",     description: "Animated GIF to efficient WebP",            icon: <FileImage className="w-5 h-5" />, accept: ".gif" },
      { id: "bmp-to-png",      label: "BMP → PNG",      description: "Bitmap images to efficient PNG",            icon: <FileImage className="w-5 h-5" />, accept: ".bmp" },
      { id: "ico-to-png",      label: "ICO → PNG",      description: "Windows icon to PNG image",                 icon: <FileImage className="w-5 h-5" />, accept: ".ico" },
      { id: "svg-to-png",      label: "SVG → PNG",      description: "Vector SVG to PNG raster image",            icon: <FileImage className="w-5 h-5" />, accept: ".svg" },
      { id: "resize-image",    label: "Resize Image",   description: "Resize to custom width and height",          icon: <ImageIcon className="w-5 h-5" />, accept: ".jpg,.jpeg,.png,.webp,.gif" },
      { id: "compress-img",    label: "Compress Image", description: "Reduce size without visible quality loss",   icon: <Minimize2 className="w-5 h-5" />, accept: ".jpg,.jpeg,.png,.webp" },
      { id: "crop-image",      label: "Crop Image",     description: "Crop to any dimensions or aspect ratio",    icon: <Scissors className="w-5 h-5" />,  accept: ".jpg,.jpeg,.png,.webp",     badge: "Soon" },
      { id: "rotate-image",    label: "Rotate Image",   description: "Rotate or flip your image",                  icon: <RotateCcw className="w-5 h-5" />, accept: ".jpg,.jpeg,.png,.webp,.gif" },
      { id: "grayscale-image", label: "Greyscale",      description: "Convert any image to black & white",         icon: <Palette className="w-5 h-5" />,   accept: ".jpg,.jpeg,.png,.webp" },
      { id: "watermark-image", label: "Watermark",      description: "Add text or logo watermark to an image",     icon: <Stamp className="w-5 h-5" />,     accept: ".jpg,.jpeg,.png,.webp" },
    ],
  },
  {
    id: "document-tools",
    label: "Document Tools",
    icon: <FileSignature className="w-5 h-5" />,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    options: [
      { id: "docx-to-txt",   label: "DOCX → TXT",    description: "Extract plain text from Word docs",         icon: <FileType className="w-5 h-5" />,         accept: ".docx,.doc" },
      { id: "docx-to-html",  label: "DOCX → HTML",   description: "Convert Word document to HTML web page",   icon: <FileCode className="w-5 h-5" />,         accept: ".docx,.doc" },
      { id: "txt-to-docx",   label: "TXT → DOCX",    description: "Convert plain text to Word document",      icon: <FileText className="w-5 h-5" />,         accept: ".txt",         badge: "Soon" },
      { id: "csv-to-xlsx",   label: "CSV → Excel",   description: "Convert CSV spreadsheet to Excel",         icon: <Table className="w-5 h-5" />,            accept: ".csv",         badge: "Soon" },
      { id: "xlsx-to-csv",   label: "Excel → CSV",   description: "Convert Excel spreadsheet to CSV",         icon: <FileSpreadsheet className="w-5 h-5" />, accept: ".xls,.xlsx",   badge: "Soon" },
      { id: "json-to-csv",   label: "JSON → CSV",    description: "Flatten JSON arrays to CSV table",         icon: <Table className="w-5 h-5" />,            accept: ".json" },
      { id: "csv-to-json",   label: "CSV → JSON",    description: "Convert CSV rows to JSON array",           icon: <Braces className="w-5 h-5" />,           accept: ".csv" },
      { id: "md-to-html",    label: "Markdown → HTML", description: "Render Markdown as HTML page",           icon: <Globe className="w-5 h-5" />,            accept: ".md" },
      { id: "html-to-md",    label: "HTML → Markdown", description: "Convert HTML back to Markdown",          icon: <FileCode className="w-5 h-5" />,         accept: ".html,.htm" },
      { id: "xml-to-json",   label: "XML → JSON",    description: "Parse XML and convert to JSON format",     icon: <Braces className="w-5 h-5" />,           accept: ".xml" },
      { id: "json-to-xml",   label: "JSON → XML",    description: "Convert JSON data to XML format",          icon: <Binary className="w-5 h-5" />,           accept: ".json" },
    ],
  },
  {
    id: "media-tools",
    label: "Media Tools",
    icon: <Video className="w-5 h-5" />,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    options: [
      { id: "mp4-to-mp3",    label: "MP4 → MP3",     description: "Extract audio from a video file",           icon: <Music className="w-5 h-5" />,  accept: ".mp4,.mov,.avi,.mkv",  badge: "Soon" },
      { id: "mp4-to-gif",    label: "MP4 → GIF",     description: "Turn a video clip into animated GIF",       icon: <Video className="w-5 h-5" />,  accept: ".mp4,.mov",            badge: "Soon" },
      { id: "gif-to-mp4",    label: "GIF → MP4",     description: "Convert animated GIF to MP4 video",         icon: <Video className="w-5 h-5" />,  accept: ".gif",                 badge: "Soon" },
      { id: "mp3-to-wav",    label: "MP3 → WAV",     description: "Convert MP3 audio to uncompressed WAV",      icon: <Music className="w-5 h-5" />,  accept: ".mp3",                 badge: "Soon" },
      { id: "wav-to-mp3",    label: "WAV → MP3",     description: "Compress WAV to smaller MP3 format",        icon: <Music className="w-5 h-5" />,  accept: ".wav",                 badge: "Soon" },
      { id: "mp4-to-webm",   label: "MP4 → WebM",    description: "Convert MP4 to web-optimised WebM",          icon: <Video className="w-5 h-5" />,  accept: ".mp4,.mov",            badge: "Soon" },
      { id: "webm-to-mp4",   label: "WebM → MP4",    description: "Convert WebM video to MP4 format",           icon: <Video className="w-5 h-5" />,  accept: ".webm",                badge: "Soon" },
      { id: "compress-video",label: "Compress Video", description: "Reduce video file size for sharing",         icon: <Minimize2 className="w-5 h-5" />, accept: ".mp4,.mov,.avi,.mkv", badge: "Soon" },
    ],
  },
  {
    id: "utility-tools",
    label: "Utilities",
    icon: <Hash className="w-5 h-5" />,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    borderColor: "border-slate-200 dark:border-slate-700",
    options: [
      { id: "qr-code-gen",     label: "QR Code Generator",  description: "Generate QR code from any URL or text",   icon: <QrCode className="w-5 h-5" />,       accept: "" },
      { id: "barcode-gen",     label: "Barcode Generator",  description: "Create standard barcodes (EAN, UPC, Code128)", icon: <Barcode className="w-5 h-5" />,  accept: "",    badge: "Soon" },
      { id: "word-count",      label: "Word Counter",       description: "Count words, characters, sentences",      icon: <Type className="w-5 h-5" />,         accept: ".txt,.md" },
      { id: "text-to-speech",  label: "Text to Speech",    description: "Convert text to downloadable MP3 speech",  icon: <Music className="w-5 h-5" />,        accept: ".txt,.pdf",           badge: "Soon" },
      { id: "speech-to-text",  label: "Speech to Text",    description: "Transcribe audio to text",                 icon: <AlignLeft className="w-5 h-5" />,    accept: ".mp3,.wav,.m4a",      badge: "Soon" },
      { id: "zip-files",       label: "Zip Files",          description: "Compress files into a .zip archive",       icon: <Archive className="w-5 h-5" />,      accept: "*" },
      { id: "unzip-files",     label: "Unzip Files",        description: "Extract contents of a .zip archive",       icon: <Archive className="w-5 h-5" />,      accept: ".zip,.rar,.7z" },
      { id: "base64-encode",   label: "Base64 Encode",      description: "Encode any file to Base64 string",         icon: <Binary className="w-5 h-5" />,       accept: "*" },
      { id: "hand-writing",    label: "Handwriting PDF",    description: "Turn text into handwritten-style PDF",      icon: <PenTool className="w-5 h-5" />,      accept: ".txt",                badge: "Soon" },
      { id: "ocr-pdf",         label: "OCR (Scan to Text)", description: "Extract text from scanned PDF or image",    icon: <FileSignature className="w-5 h-5" />, accept: ".pdf,.jpg,.jpeg,.png", badge: "Soon" },
    ],
  },
];

// Flat list kept for backward compatibility with API calls
export const conversionOptions = conversionCategories.flatMap((c) => c.options);

export default conversionOptions;
