// src/models/FormVersion.ts
import mongoose, { Schema, Document } from "mongoose";
import { fieldInterface, FieldSchema } from "./fields";

export interface FormVersionInterface extends Document {
  formId: mongoose.Types.ObjectId;
  version: number;
  fields: fieldInterface[];
  createdAt: Date;
}

const FormVersionSchema = new Schema<FormVersionInterface>({
  formId: { type: Schema.Types.ObjectId, ref: "forms", required: true, index: true },
  version: { type: Number, required: true },
  fields: { type: [FieldSchema], default: [] },
}, { timestamps: true });

FormVersionSchema.index({ formId: 1, version: -1 });

export default mongoose.model<FormVersionInterface>("form_versions", FormVersionSchema);
