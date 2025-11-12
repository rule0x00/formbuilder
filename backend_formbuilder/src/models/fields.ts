import mongoose, { Schema, Document } from "mongoose";

export interface fieldInterface {
    label: string;
    name: string;
    type: "text" | "textarea" | "number" | "email" | "date" | "checkbox" | "radio" | "select" | "file";
    required: boolean;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      regex?: string;
    };
    order: number;
    nestedFields?: fieldInterface[]; // For select/radio nested fields
  }

export const FieldSchema = new Schema<fieldInterface>({
    label: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: [String],
    validation: {
      min: Number,   //how does this work??
      max: Number,
      regex: String,
      fileTypes: [String],
      maxFileSizeMB: Number,
    },
    nestedFields: {type: [mongoose.Schema.Types.Mixed], default: [] },
    order: { type: Number, default: 0 },
  });
  