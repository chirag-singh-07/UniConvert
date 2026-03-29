import {
  FileText, FileImage, FileSpreadsheet, Presentation, Merge, Minimize2,
  RotateCcw, Scissors, FileJson, FileCode, FileType, ArrowLeftRight,
  ImageIcon, SplitSquareHorizontal, Lock, Unlock, Stamp, Video, Music,
  Archive, Hash, QrCode, Globe, FileSignature, AlignLeft, BookOpen,
  Binary, Braces, Table, Barcode, Type, PenTool, Palette, ClipboardList,
  Hash as Layers, ListOrdered, Settings, FileX, Wifi, ArrowUpDown,
  Eraser, ScanLine, Eye, Droplet, Contrast, Sun, FlipHorizontal,
  SunMedium, Activity, Grid3X3, Info as InfoIcon, CornerUpRight, Frame,
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
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "pdf-tools",
    label: "PDF Tools",
    icon: <FileText className="w-5 h-5" />,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    borderColor: "border-red-200 dark:border-red-800",
    options: [
      { id: "compress-pdf",       label: "Compress PDF",        description: "Reduce file size intelligently",                   icon: <Minimize2 className="w-5 h-5" />,            accept: ".pdf" },
      { id: "merge-pdf",          label: "Merge PDFs",           description: "Combine up to 10 PDFs into one file",             icon: <Merge className="w-5 h-5" />,                accept: ".pdf",               badge: "Multi" },
      { id: "split-pdf",          label: "Split PDF",            description: "Split every page into a separate PDF",            icon: <SplitSquareHorizontal className="w-5 h-5" />, accept: ".pdf" },
      { id: "rotate-pdf",         label: "Rotate PDF",           description: "Rotate all pages 90°, 180° or 270°",              icon: <RotateCcw className="w-5 h-5" />,             accept: ".pdf" },
      { id: "watermark-pdf",      label: "Watermark PDF",        description: "Add diagonal text watermark to every page",       icon: <Stamp className="w-5 h-5" />,                accept: ".pdf" },
      { id: "lock-pdf",           label: "Lock PDF",             description: "Mark document as secured",                        icon: <Lock className="w-5 h-5" />,                 accept: ".pdf" },
      { id: "unlock-pdf",         label: "Unlock PDF",           description: "Re-save PDF stripping restrictions",              icon: <Unlock className="w-5 h-5" />,               accept: ".pdf" },
      { id: "sign-pdf",           label: "Sign PDF",             description: "Add a visible text signature to the last page",   icon: <FileSignature className="w-5 h-5" />,         accept: ".pdf" },
      { id: "redact-pdf",         label: "Redact PDF",           description: "Black out header area or specific coordinates",   icon: <Eraser className="w-5 h-5" />,               accept: ".pdf" },
      { id: "crop-pdf",           label: "Crop PDF",             description: "Set crop box with custom margins",                icon: <Scissors className="w-5 h-5" />,             accept: ".pdf" },
      { id: "flatten-pdf",        label: "Flatten PDF",          description: "Flatten form fields and annotations",             icon: <ClipboardList className="w-5 h-5" />,        accept: ".pdf" },
      { id: "repair-pdf",         label: "Repair PDF",           description: "Re-save PDF to fix structural issues",            icon: <Settings className="w-5 h-5" />,             accept: ".pdf" },
      { id: "extract-pdf-pages",  label: "Extract Pages",        description: "Extract a page range e.g. 1-3,5,7",              icon: <BookOpen className="w-5 h-5" />,             accept: ".pdf" },
      { id: "add-page-numbers",   label: "Add Page Numbers",     description: "Stamp page numbers in footer",                   icon: <ListOrdered className="w-5 h-5" />,          accept: ".pdf" },
      { id: "pdf-grayscale",      label: "PDF Grayscale",        description: "Mark PDF as grayscale / remove colour intent",    icon: <Palette className="w-5 h-5" />,              accept: ".pdf" },
      { id: "n-up-pdf",           label: "N-Up (2-per-sheet)",   description: "Put 2 pages side-by-side on one sheet",          icon: <Layers className="w-5 h-5" />,              accept: ".pdf" },
      { id: "add-header-footer",  label: "Header / Footer",      description: "Add custom header and automatic page footer",    icon: <AlignLeft className="w-5 h-5" />,            accept: ".pdf" },
      { id: "pdf-metadata",       label: "Edit Metadata",        description: "Change title, author, subject, keywords",        icon: <Eye className="w-5 h-5" />,                  accept: ".pdf" },
      { id: "remove-blank-pages", label: "Remove Blank Pages",   description: "Automatically detect and remove empty pages",    icon: <FileX className="w-5 h-5" />,                accept: ".pdf" },
      { id: "optimize-pdf",       label: "Optimize for Web",     description: "Linearise/optimise PDF for fast web viewing",    icon: <Wifi className="w-5 h-5" />,                 accept: ".pdf" },
      { id: "reorder-pages",      label: "Reorder Pages",        description: "Specify a custom page order e.g. 3,1,2,4",       icon: <ArrowUpDown className="w-5 h-5" />,          accept: ".pdf" },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "convert-to-pdf",
    label: "To PDF",
    icon: <ArrowLeftRight className="w-5 h-5" />,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    options: [
      { id: "docx-to-pdf",   label: "DOCX → PDF",      description: "Microsoft Word to PDF",              icon: <FileText className="w-5 h-5" />,          accept: ".docx,.doc" },
      { id: "ppt-to-pdf",    label: "PPT → PDF",        description: "PowerPoint slides to PDF",           icon: <Presentation className="w-5 h-5" />,     accept: ".ppt,.pptx" },
      { id: "excel-to-pdf",  label: "Excel → PDF",      description: "Spreadsheets to PDF",                icon: <FileSpreadsheet className="w-5 h-5" />,  accept: ".xls,.xlsx" },
      { id: "image-to-pdf",  label: "Image → PDF",      description: "JPG, PNG, WEBP, BMP to PDF",         icon: <FileImage className="w-5 h-5" />,         accept: ".jpg,.jpeg,.png,.webp,.bmp,.gif" },
      { id: "txt-to-pdf",    label: "TXT → PDF",        description: "Plain text file to PDF",             icon: <FileType className="w-5 h-5" />,          accept: ".txt" },
      { id: "csv-to-pdf",    label: "CSV → PDF",        description: "CSV table to a formatted PDF",       icon: <Table className="w-5 h-5" />,             accept: ".csv" },
      { id: "html-to-pdf",   label: "HTML → PDF",       description: "HTML web pages to PDF",              icon: <FileCode className="w-5 h-5" />,          accept: ".html,.htm" },
      { id: "md-to-pdf",     label: "Markdown → PDF",   description: "Markdown documents to PDF",          icon: <FileCode className="w-5 h-5" />,          accept: ".md" },
      { id: "epub-to-pdf",   label: "EPUB → PDF",       description: "E-book to PDF",                      icon: <BookOpen className="w-5 h-5" />,          accept: ".epub" },
      { id: "odt-to-pdf",    label: "ODT → PDF",        description: "OpenDocument text to PDF",           icon: <FileText className="w-5 h-5" />,          accept: ".odt" },
      { id: "rtf-to-pdf",    label: "RTF → PDF",        description: "Rich Text Format to PDF",            icon: <FileText className="w-5 h-5" />,          accept: ".rtf" },
      { id: "xml-to-pdf",    label: "XML → PDF",        description: "Extensible Markup to PDF",           icon: <FileCode className="w-5 h-5" />,          accept: ".xml" },
      { id: "pub-to-pdf",    label: "PUB → PDF",        description: "Publisher document to PDF",          icon: <BookOpen className="w-5 h-5" />,          accept: ".pub" },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "convert-from-pdf",
    label: "PDF to Other",
    icon: <FileJson className="w-5 h-5" />,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    options: [
      { id: "pdf-to-docx",  label: "PDF → DOCX",  description: "Editable Word document",             icon: <FileText className="w-5 h-5" />,          accept: ".pdf" },
      { id: "pdf-to-txt",   label: "PDF → TXT",   description: "Extract all text content",           icon: <FileType className="w-5 h-5" />,          accept: ".pdf" },
      { id: "pdf-to-html",  label: "PDF → HTML",  description: "Convert to HTML web page",           icon: <Globe className="w-5 h-5" />,             accept: ".pdf" },
      { id: "pdf-to-csv",   label: "PDF → CSV",   description: "Export text lines as CSV rows",      icon: <Table className="w-5 h-5" />,             accept: ".pdf" },
      { id: "pdf-to-json",  label: "PDF → JSON",  description: "Metadata + full text as JSON",       icon: <Braces className="w-5 h-5" />,            accept: ".pdf" },
      { id: "pdf-to-epub",  label: "PDF → EPUB",  description: "Convert to e-book EPUB format",      icon: <BookOpen className="w-5 h-5" />,          accept: ".pdf" },
      { id: "pdf-to-jpg",   label: "PDF → JPG",   description: "Each page to JPEG (browser)",        icon: <FileImage className="w-5 h-5" />,         accept: ".pdf",  badge: "Instant" },
      { id: "pdf-to-png",   label: "PDF → PNG",   description: "Each page to PNG (browser)",         icon: <FileImage className="w-5 h-5" />,         accept: ".pdf",  badge: "Instant" },
      { id: "pdf-to-ppt",   label: "PDF → PPT",   description: "PDF to PowerPoint presentation",     icon: <Presentation className="w-5 h-5" />,     accept: ".pdf" },
      { id: "pdf-to-excel", label: "PDF → Excel", description: "Extract tables to Excel",            icon: <FileSpreadsheet className="w-5 h-5" />,  accept: ".pdf" },
      { id: "pdf-to-rtf",   label: "PDF → RTF",   description: "Editable Rich Text Format",          icon: <FileText className="w-5 h-5" />,          accept: ".pdf" },
      { id: "pdf-to-md",    label: "PDF → MD",    description: "Extract text to Markdown",           icon: <FileCode className="w-5 h-5" />,          accept: ".pdf" },
      { id: "pdf-to-xml",   label: "PDF → XML",   description: "Structure content as XML",           icon: <FileCode className="w-5 h-5" />,          accept: ".pdf" },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "image-tools",
    label: "Image Tools",
    icon: <ImageIcon className="w-5 h-5" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    options: [
      { id: "jpg-to-png",      label: "JPG → PNG",      description: "Lossless PNG with transparency",        icon: <FileImage className="w-5 h-5" />,   accept: ".jpg,.jpeg",          badge: "Instant" },
      { id: "png-to-jpg",      label: "PNG → JPG",       description: "Smaller JPEG from PNG",                icon: <FileImage className="w-5 h-5" />,   accept: ".png",                badge: "Instant" },
      { id: "webp-to-jpg",     label: "WEBP → JPG",      description: "WebP to universal JPEG",               icon: <FileImage className="w-5 h-5" />,   accept: ".webp",               badge: "Instant" },
      { id: "jpg-to-webp",     label: "JPG → WEBP",      description: "Smaller WebP for modern browsers",     icon: <FileImage className="w-5 h-5" />,   accept: ".jpg,.jpeg",          badge: "Instant" },
      { id: "png-to-webp",     label: "PNG → WEBP",      description: "PNG to WebP with transparency",        icon: <FileImage className="w-5 h-5" />,   accept: ".png",                badge: "Instant" },
      { id: "gif-to-webp",     label: "GIF → WEBP",      description: "Animated GIF to WebP",                 icon: <FileImage className="w-5 h-5" />,   accept: ".gif",                badge: "Instant" },
      { id: "bmp-to-png",      label: "BMP → PNG",       description: "Bitmap to efficient PNG",              icon: <FileImage className="w-5 h-5" />,   accept: ".bmp",                badge: "Instant" },
      { id: "ico-to-png",      label: "ICO → PNG",        description: "Windows icon to PNG",                  icon: <FileImage className="w-5 h-5" />,   accept: ".ico",                badge: "Instant" },
      { id: "svg-to-png",      label: "SVG → PNG",        description: "Vector SVG to raster PNG",             icon: <FileImage className="w-5 h-5" />,   accept: ".svg",                badge: "Instant" },
      { id: "resize-image",    label: "Resize Image",    description: "Custom width × height in pixels",      icon: <ImageIcon className="w-5 h-5" />,   accept: ".jpg,.jpeg,.png,.webp,.gif",   badge: "Instant" },
      { id: "compress-img",    label: "Compress Image",  description: "Reduce size without quality loss",     icon: <Minimize2 className="w-5 h-5" />,   accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "rotate-image",    label: "Rotate Image",    description: "Rotate by custom angle",               icon: <RotateCcw className="w-5 h-5" />,   accept: ".jpg,.jpeg,.png,.webp,.gif",   badge: "Instant" },
      { id: "grayscale-image", label: "Greyscale",       description: "Convert to black & white",             icon: <Palette className="w-5 h-5" />,     accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "watermark-image", label: "Watermark Image", description: "Add text watermark diagonally",        icon: <Stamp className="w-5 h-5" />,       accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "crop-image",      label: "Crop Image",      description: "Crop to custom rectangle",             icon: <Scissors className="w-5 h-5" />,    accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "blur-image",      label: "Blur Image",      description: "Apply Gaussian blur filter",           icon: <Droplet className="w-5 h-5" />,     accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "invert-image",    label: "Invert Colours",  description: "Negative colour inversion",            icon: <Contrast className="w-5 h-5" />,    accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "sepia-image",     label: "Sepia Filter",    description: "Apply a vintage sepia tint",           icon: <Sun className="w-5 h-5" />,         accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "flip-image",      label: "Flip Image",      description: "Flip horizontally or vertically",      icon: <FlipHorizontal className="w-5 h-5" />, accept: ".jpg,.jpeg,.png,.webp",     badge: "Instant" },
      { id: "brightness-image",label: "Brightness",      description: "Adjust image brightness",               icon: <SunMedium className="w-5 h-5" />,   accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "contrast-image",  label: "Contrast",        description: "Adjust image contrast",                 icon: <Activity className="w-5 h-5" />,    accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "sharpness-image", label: "Sharpness",       description: "Sharpen image details",                 icon: <Activity className="w-5 h-5" />,    accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "pixelate-image",  label: "Pixelate",        description: "Apply a pixel art effect",             icon: <Grid3X3 className="w-5 h-5" />,     accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "image-info",      label: "Image Info",      description: "Extract resolution & metadata",        icon: <InfoIcon className="w-5 h-5" />,    accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "round-corners",   label: "Round Corners",   description: "Add rounded edges to image",           icon: <CornerUpRight className="w-5 h-5" />, accept: ".jpg,.jpeg,.png,.webp",      badge: "Instant" },
      { id: "image-border",    label: "Image Border",    description: "Add customized frame/border",           icon: <Frame className="w-5 h-5" />,    accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
      { id: "vignette-image",  label: "Vignette",        description: "Add soft dark edges effect",           icon: <Palette className="w-5 h-5" />,     accept: ".jpg,.jpeg,.png,.webp",        badge: "Instant" },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "document-tools",
    label: "Document Tools",
    icon: <FileSignature className="w-5 h-5" />,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    options: [
      { id: "docx-to-txt",  label: "DOCX → TXT",       description: "Extract plain text from Word",        icon: <FileType className="w-5 h-5" />,          accept: ".docx,.doc" },
      { id: "docx-to-html", label: "DOCX → HTML",       description: "Word document to HTML page",          icon: <FileCode className="w-5 h-5" />,          accept: ".docx,.doc" },
      { id: "csv-to-json",  label: "CSV → JSON",        description: "Spreadsheet rows to JSON array",      icon: <Braces className="w-5 h-5" />,            accept: ".csv",        badge: "Instant" },
      { id: "json-to-csv",  label: "JSON → CSV",        description: "Flatten JSON array to CSV",           icon: <Table className="w-5 h-5" />,             accept: ".json",       badge: "Instant" },
      { id: "xml-to-json",  label: "XML → JSON",        description: "Parse XML to JSON format",            icon: <Braces className="w-5 h-5" />,            accept: ".xml",        badge: "Instant" },
      { id: "json-to-xml",  label: "JSON → XML",        description: "Convert JSON to XML format",          icon: <Binary className="w-5 h-5" />,            accept: ".json",       badge: "Instant" },
      { id: "md-to-html",   label: "Markdown → HTML",   description: "Render Markdown as HTML",             icon: <Globe className="w-5 h-5" />,             accept: ".md",         badge: "Instant" },
      { id: "html-to-md",   label: "HTML → Markdown",   description: "Convert HTML to Markdown",            icon: <FileCode className="w-5 h-5" />,          accept: ".html,.htm",  badge: "Instant" },
      { id: "txt-to-docx",  label: "TXT → DOCX",        description: "Plain text to Word document",         icon: <FileText className="w-5 h-5" />,          accept: ".txt",        badge: "Soon" },
      { id: "csv-to-xlsx",  label: "CSV → Excel",       description: "CSV to Excel spreadsheet",            icon: <Table className="w-5 h-5" />,             accept: ".csv",        badge: "Soon" },
      { id: "xlsx-to-csv",  label: "Excel → CSV",       description: "Excel to CSV spreadsheet",            icon: <FileSpreadsheet className="w-5 h-5" />,   accept: ".xls,.xlsx",  badge: "Soon" },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "media-tools",
    label: "Media Tools",
    icon: <Video className="w-5 h-5" />,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    options: [
      { id: "mp4-to-mp3",     label: "MP4 → MP3",      description: "Extract audio from video",            icon: <Music className="w-5 h-5" />,        accept: ".mp4,.mov,.avi,.mkv",  badge: "Soon" },
      { id: "mp4-to-gif",     label: "MP4 → GIF",      description: "Video clip to animated GIF",          icon: <Video className="w-5 h-5" />,        accept: ".mp4,.mov",            badge: "Soon" },
      { id: "gif-to-mp4",     label: "GIF → MP4",      description: "Animated GIF to MP4 video",           icon: <Video className="w-5 h-5" />,        accept: ".gif",                 badge: "Soon" },
      { id: "mp3-to-wav",     label: "MP3 → WAV",      description: "Compressed audio to WAV",             icon: <Music className="w-5 h-5" />,        accept: ".mp3",                 badge: "Soon" },
      { id: "wav-to-mp3",     label: "WAV → MP3",      description: "WAV to smaller MP3",                  icon: <Music className="w-5 h-5" />,        accept: ".wav",                 badge: "Soon" },
      { id: "mp4-to-webm",    label: "MP4 → WebM",     description: "Web-optimised video format",          icon: <Video className="w-5 h-5" />,        accept: ".mp4,.mov",            badge: "Soon" },
      { id: "compress-video", label: "Compress Video", description: "Reduce video file size",              icon: <Minimize2 className="w-5 h-5" />,    accept: ".mp4,.mov,.avi,.mkv",  badge: "Soon" },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "utility-tools",
    label: "Utilities",
    icon: <Hash className="w-5 h-5" />,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    borderColor: "border-slate-200 dark:border-slate-700",
    options: [
      { id: "qr-code-gen",    label: "QR Code Generator", description: "Generate QR code from any URL or text", icon: <QrCode className="w-5 h-5" />,    accept: "",                    badge: "Instant" },
      { id: "word-count",     label: "Word Counter",      description: "Count words, chars, sentences",         icon: <Type className="w-5 h-5" />,      accept: ".txt,.md",            badge: "Instant" },
      { id: "base64-encode",  label: "Base64 Encode",     description: "Encode any file to Base64 string",      icon: <Binary className="w-5 h-5" />,    accept: "*",                   badge: "Instant" },
      { id: "zip-files",      label: "Zip Files",         description: "Bundle multiple files into .zip",        icon: <Archive className="w-5 h-5" />,   accept: "*",                   badge: "Instant" },
      { id: "unzip-files",    label: "Unzip File",        description: "Extract contents of a .zip",            icon: <Archive className="w-5 h-5" />,   accept: ".zip",                badge: "Instant" },
      { id: "barcode-gen",    label: "Barcode Generator", description: "Barcode from any text/number",           icon: <Barcode className="w-5 h-5" />,  accept: "",                    badge: "Soon" },
      { id: "text-to-speech", label: "Text to Speech",   description: "Convert text to audible speech",         icon: <Music className="w-5 h-5" />,     accept: ".txt",                badge: "Soon" },
      { id: "speech-to-text", label: "Speech to Text",   description: "Transcribe audio to text",               icon: <AlignLeft className="w-5 h-5" />, accept: ".mp3,.wav,.m4a",      badge: "Soon" },
      { id: "ocr-pdf",        label: "OCR (Scan→Text)",  description: "Extract text from scanned image",        icon: <ScanLine className="w-5 h-5" />,  accept: ".pdf,.jpg,.jpeg,.png", badge: "Soon" },
      { id: "hand-writing",   label: "Handwriting PDF",  description: "Text to handwritten-style PDF",          icon: <PenTool className="w-5 h-5" />,   accept: ".txt",                badge: "Soon" },
    ],
  },
];

// Flat list for API lookup
export const conversionOptions = conversionCategories.flatMap((c) => c.options);

export default conversionOptions;
