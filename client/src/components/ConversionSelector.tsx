import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Presentation,
  Merge,
  Minimize2,
} from "lucide-react";
import { motion } from "framer-motion";

interface ConversionOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  accept: string;
}

interface ConversionSelectorProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

const conversionOptions: ConversionOption[] = [
  {
    id: "docx-to-pdf",
    label: "DOCX to PDF",
    description: "Convert Word documents to PDF",
    icon: <FileText className="w-6 h-6" />,
    accept: ".docx,.doc",
  },
  {
    id: "pdf-to-docx",
    label: "PDF to DOCX",
    description: "Convert PDF to Word document",
    icon: <FileText className="w-6 h-6" />,
    accept: ".pdf",
  },
  {
    id: "ppt-to-pdf",
    label: "PPT to PDF",
    description: "Convert PowerPoint to PDF",
    icon: <Presentation className="w-6 h-6" />,
    accept: ".ppt,.pptx",
  },
  {
    id: "excel-to-pdf",
    label: "Excel to PDF",
    description: "Convert Excel spreadsheet to PDF",
    icon: <FileSpreadsheet className="w-6 h-6" />,
    accept: ".xls,.xlsx",
  },
  {
    id: "image-to-pdf",
    label: "Image to PDF",
    description: "Convert JPG/PNG to PDF",
    icon: <FileImage className="w-6 h-6" />,
    accept: ".jpg,.jpeg,.png",
  },
  {
    id: "merge-pdf",
    label: "Merge PDFs",
    description: "Combine multiple PDFs into one",
    icon: <Merge className="w-6 h-6" />,
    accept: ".pdf",
  },
  {
    id: "compress-pdf",
    label: "Compress PDF",
    description: "Reduce PDF file size",
    icon: <Minimize2 className="w-6 h-6" />,
    accept: ".pdf",
  },
];

const ConversionSelector = ({
  selectedType,
  onSelectType,
}: ConversionSelectorProps) => {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
        Select Conversion Type
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversionOptions.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectType(option.id)}
            className={`glass-card p-6 rounded-2xl text-left transition-all duration-300 transform hover:scale-105 ${
              selectedType === option.id
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "hover:shadow-xl"
            }`}
          >
            <div
              className={`inline-flex p-3 rounded-xl mb-4 ${
                selectedType === option.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {option.icon}
            </div>
            <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">
              {option.label}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {option.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ConversionSelector;
export { conversionOptions };
