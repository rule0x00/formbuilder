// src/models/Submission.ts
import mongoose, { Schema, Document } from "mongoose";

export interface submissionInterface extends Document {
  formId: mongoose.Types.ObjectId;
  answers: Record<string, any>; //key val pair
  submittedAt: Date;
  ip?: string;
}

const SubmissionSchema = new Schema<submissionInterface>(
  {
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: true },
    answers: { type: Schema.Types.Mixed, required: true },
    submittedAt: { type: Date, default: Date.now },
    ip: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<submissionInterface>("submissions", SubmissionSchema);
