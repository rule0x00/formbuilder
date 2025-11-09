// src/controllers/submission.controller.ts
import { Request, Response } from "express";
import formModel, {fieldInterface, formInterface} from "../models/form"
import submissionModel from "../models/submission"

// Validate single field
const validateField = (field: fieldInterface, value: any) => {
  if (field.required && (value === undefined || value === null || value === "")) {
    return `${field.label} is required`;
  }

  if (value !== undefined && value !== null) {
    switch (field.type) {
      case "number":
        if (typeof value !== "number") return `${field.label} must be a number`;
        if (field.validation?.min !== undefined && value < field.validation.min)
          return `${field.label} must be ≥ ${field.validation.min}`;
        if (field.validation?.max !== undefined && value > field.validation.max)
          return `${field.label} must be ≤ ${field.validation.max}`;
        break;
      case "email":
        const regex = field.validation?.regex
          ? new RegExp(field.validation.regex)
          : /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(value)) return `${field.label} is not a valid email`;
        break;
      case "text":
      case "textarea":
        if (field.validation?.min && value.length < field.validation.min)
          return `${field.label} must have at least ${field.validation.min} characters`;
        if (field.validation?.max && value.length > field.validation.max)
          return `${field.label} must have at most ${field.validation.max} characters`;
        break;
      case "checkbox":
        if (!Array.isArray(value)) return `${field.label} must be an array`;
        break;
      case "radio":
      case "select":
        if (field.options && !field.options.includes(value))
          return `${field.label} must be one of ${field.options.join(", ")}`;
        break;
    }
  }

  return null;
};

// Submit a form
export const submitForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // formId
    const answers = req.body;

    const form = await formModel.findById(id);
    if (!form) return res.status(404).json({ message: "Form not found" });

    // Validate all fields
    const errors: Record<string, string> = {};
    form.fields.forEach((field) => {
      const error = validateField(field, answers[field.name]);
      if (error) errors[field.name] = error;
    });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const submission = await submissionModel.create({
      formId: id,
      answers,
      ip: req.ip,
    });

    res.status(201).json({ message: "Form submitted successfully", submission });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// List submissions (admin)
export const listSubmissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // formId
    const submissions = await submissionModel.find({ formId: id });
    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
