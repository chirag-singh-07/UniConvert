import { motion } from "framer-motion";

interface CompressionSelectorProps {
  selectedLevel: "low" | "medium" | "high";
  onSelectLevel: (level: "low" | "medium" | "high") => void;
}

const compressionLevels = [
  {
    id: "low" as const,
    label: "Low Compression",
    description: "Best quality, larger file size",
    quality: "High Quality",
  },
  {
    id: "medium" as const,
    label: "Medium Compression",
    description: "Balanced quality and size",
    quality: "Medium Quality",
  },
  {
    id: "high" as const,
    label: "High Compression",
    description: "Smaller file size, lower quality",
    quality: "Lower Quality",
  },
];

const CompressionSelector = ({
  selectedLevel,
  onSelectLevel,
}: CompressionSelectorProps) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
        Select Compression Level
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {compressionLevels.map((level, index) => (
          <motion.button
            key={level.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectLevel(level.id)}
            className={`glass-card p-4 rounded-xl text-left transition-all duration-300 ${
              selectedLevel === level.id
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "hover:shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                {level.label}
              </h4>
              {selectedLevel === level.id && (
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {level.description}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {level.quality}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CompressionSelector;
