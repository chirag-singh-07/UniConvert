import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  status: string;
}

const ProgressBar = ({ progress, status }: ProgressBarProps) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {status}
        </span>
        <span className="text-sm font-semibold text-blue-600">{progress}%</span>
      </div>
      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
        />
      </div>
    </div>
  );
};

export default ProgressBar;
