import cron from "node-cron";
import fs from "fs";
import path from "path";
import { FileRecord } from "../models/FileRecord";

const uploadDir = process.env.UPLOAD_DIR || "./uploads";
const convertedDir = process.env.CONVERTED_DIR || "./converted";
const retentionHours = parseInt(process.env.FILE_RETENTION_HOURS || "1");

/**
 * Delete old files from the filesystem and database
 */
const cleanupOldFiles = async () => {
  try {
    console.log("🧹 Starting cleanup job...");

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - retentionHours);

    // Find old records
    const oldRecords = await FileRecord.find({
      createdAt: { $lt: cutoffTime },
    });

    let deletedCount = 0;

    for (const record of oldRecords) {
      // Delete original file
      const originalPath = path.join(uploadDir, record.fileName);
      if (fs.existsSync(originalPath)) {
        fs.unlinkSync(originalPath);
      }

      // Delete converted file
      if (record.convertedFileName) {
        const convertedPath = path.join(convertedDir, record.convertedFileName);
        if (fs.existsSync(convertedPath)) {
          fs.unlinkSync(convertedPath);
        }
      }

      // Delete database record
      await FileRecord.findByIdAndDelete(record._id);
      deletedCount++;
    }

    console.log(`✅ Cleanup completed: ${deletedCount} files deleted`);
  } catch (error) {
    console.error("❌ Cleanup job error:", error);
  }
};

/**
 * Start the cleanup cron job
 * Runs every hour
 */
export const startCleanupJob = () => {
  // Run every hour
  cron.schedule("0 * * * *", cleanupOldFiles);

  console.log("⏰ Cleanup job scheduled (runs every hour)");

  // Also run immediately on startup
  cleanupOldFiles();
};
