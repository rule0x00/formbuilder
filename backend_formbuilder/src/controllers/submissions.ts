// src/controllers/submission.controller.ts
import { Request, Response } from "express";
import formModel, {formInterface} from "../models/form"
import { fieldInterface } from "../models/fields";
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

export const submitForm = async (req: Request, res: Response) => {
  try {
    const { id: formId } = req.params;
    const user = (req as any).user;

    //Fetch form
    const form = await formModel.findById(formId);
    if (!form) {
      return res.status(404).render("error", {
        title: "Error",
        message: "Form not found",
        user,
      });
    }

    // Extract answers
    const answers: Record<string, any> = { ...req.body };

    // --- Normalize checkbox fields
    for (const key in answers) {
      if (key.endsWith("[]")) {
        const cleanKey = key.slice(0, -2);
        answers[cleanKey] = Array.isArray(answers[key]) ? answers[key] : [answers[key]];
        delete answers[key];
      }
    }

    // Collect files metadata
    const filesMeta: any[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        filesMeta.push({
          fieldName: file.fieldname,
          storageType: "disk",
          path: file.path,
          mime: file.mimetype,
        });
      }
    }

    const errors: Record<string, string> = {};
    form.fields.forEach((field: fieldInterface) => {
      let value = answers[field.name];

      // Cast numbers
      if (field.type === "number" && value !== undefined && value !== null) {
        value = Number(value);
        answers[field.name] = value;
      }

      const error = validateField(field, value);
      if (error) errors[field.name] = error;
    });

    if (Object.keys(errors).length > 0) {
      return res.status(400).render("forms/fill", {
        title: form.title || "Fill Form",
        form,
        fields: form.fields,
        errors,
        message: "Please fix the highlighted errors below.",
        user,
      });
    }

    // --- Create submission
    await submissionModel.create({
      formId,
      formVersionId: form.activeVersionId || formId,
      userId: user.id,
      answers,
      ip: req.ip,
      files: filesMeta,
    });

    // --- Redirect or API response
    const contentType = req.headers["content-type"] || "";
    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      return res.redirect("/forms?message=Form+submitted+successfully!");
    }

  } catch (err: any) {
    console.error("Error in submitForm:", err);
    return res.status(500).render("error", {
      title: "Error",
      message: "Internal Server Error",
    });
  }
};



// List submissions (admin)
export const listSubmissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // formId

    const form = await formModel.findById(id).lean();
    if (!form) return res.status(404).send("Form not found");

    const submissions = await submissionModel
      .find({ formId: id })
      .populate("userId", "email name") // populate user email/name
      .lean();

    res.render("submissions/list", {
      title: `Submissions - ${form.title}`,
      form,
      submissions,
      user: (req as any).user,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).send("Error loading submissions");
  }
};
