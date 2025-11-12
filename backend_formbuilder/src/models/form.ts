import mongoose, { Schema, Document } from "mongoose";
import { FieldSchema, fieldInterface } from "./fields";


export interface formInterface extends Document {
  title: string;
  description?: string;
  activeVersionId?: mongoose.Types.ObjectId;
  fields: fieldInterface[];
  createdAt: Date;
  updatedAt: Date;
}

const FormSchema = new Schema<formInterface>(
  {
    title: { type: String, required: true },
    description: String,
    activeVersionId: { type: Schema.Types.ObjectId, ref: "form_versions" },
    fields: [FieldSchema],
  },
  { timestamps: true }
);

export default mongoose.model<formInterface>("forms", FormSchema);
