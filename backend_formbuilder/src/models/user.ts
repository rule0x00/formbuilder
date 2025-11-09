// src/models/Submission.ts
import mongoose, { Schema, Document } from "mongoose";

export interface userInterface extends Document {
    name: string;
    email: string;
    age: string;
    password?: string;
    role: string
}

const UserSchema = new Schema<userInterface>(
  {
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    age: {type: String},
    password: {type: String, required: true},
    role: {type: String, enum:["AdminUser", "NormalUser"]}
  },
  { timestamps: true }
);

export default mongoose.model<userInterface>("users", UserSchema);
