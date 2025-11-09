import mongoose, { Schema, Document } from "mongoose";

export interface fieldInterface {
  label: string;
  name: string;
  type: "text" | "textarea" | "number" | "email" | "date" | "checkbox" | "radio" | "select";
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

export interface formInterface extends Document {
  title: string;
  description?: string;
  fields: fieldInterface[];
  createdAt: Date;
  updatedAt: Date;
}

const FieldSchema = new Schema<fieldInterface>({
  label: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [String],
  validation: {
    min: Number,   //how does this work??
    max: Number,
    regex: String,
  },
  order: { type: Number, default: 0 },
  nestedFields: [this], //what is this??
});

const FormSchema = new Schema<formInterface>(
  {
    title: { type: String, required: true },
    description: String,
    fields: [FieldSchema],
  },
  { timestamps: true }
);

export default mongoose.model<formInterface>("forms", FormSchema);
