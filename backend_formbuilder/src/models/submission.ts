// src/models/Submission.ts
import mongoose, { Schema, Document } from "mongoose";

export interface submissionInterface extends Document {
  formId: mongoose.Types.ObjectId;
  formVersionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  answers: Record<string, any>; //key val pair
  submittedAt: Date;
  files?: { fieldName: string; storageType: "disk" | "base64"; path?: string; base64?: string; mime?:string }[];
  ip?: string;
}


const SubmissionSchema = new Schema<submissionInterface>(
  {
    formId: { type: Schema.Types.ObjectId, ref: "forms", required: true },
    formVersionId: { type: Schema.Types.ObjectId, ref: "form_versions", required: true },
    answers: { type: Schema.Types.Mixed, required: true },
    userId: {type: Schema.Types.ObjectId, ref: "users", required: true},
    files: [
      {
        fieldName: String,
        storageType: { type: String, enum: ["disk", "base64"], default: "disk" },
        path: String,
        base64: String,
        mime: String
      }
    ],
    submittedAt: { type: Date, default: Date.now },
    ip: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<submissionInterface>("submissions", SubmissionSchema);
