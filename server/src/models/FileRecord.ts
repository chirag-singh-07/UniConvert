import mongoose, { Document, Schema } from "mongoose";

export interface IFileRecord extends Document {
  originalName: string;
  fileName: string;
  convertedFileName?: string;
  conversionType: string;
  fileSize: number;
  convertedFileSize?: number;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FileRecordSchema = new Schema<IFileRecord>(
  {
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    convertedFileName: {
      type: String,
    },
    conversionType: {
      type: String,
      required: true,
      enum: [
        "docx-to-pdf",
        "pdf-to-docx",
        "ppt-to-pdf",
        "excel-to-pdf",
        "image-to-pdf",
        "merge-pdf",
        "compress-pdf",
      ],
    },
    fileSize: {
      type: Number,
      required: true,
    },
    convertedFileSize: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    errorMessage: {
      type: String,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
FileRecordSchema.index({ createdAt: -1 });
FileRecordSchema.index({ status: 1 });

export const FileRecord = mongoose.model<IFileRecord>(
  "FileRecord",
  FileRecordSchema,
);
