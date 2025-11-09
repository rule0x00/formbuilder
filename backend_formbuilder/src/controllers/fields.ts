// src/controllers/field.controller.ts
import { Request, Response } from "express";
import FormModel, { fieldInterface } from "../models/form";


// Add a new field to a FormModel
export const addField = async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const field: fieldInterface = req.body;

    // Ensure unique field name within the form
    const existingForm = await FormModel.findOne({ _id: formId, "fields.name": field.name });
    if (existingForm) {
      return res.status(400).json({ message: "Field name must be unique" });
    }

    const updatedForm = await FormModel.findByIdAndUpdate(
      formId,
      { $push: { fields: field } },
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(201).json({ message: "Field added successfully", form: updatedForm });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Update a field inside a form
export const updateField = async (req: Request, res: Response) => {
  try {
    const { formId, fieldName } = req.params;
    const updatedField: Partial<fieldInterface> = req.body;

    const form = await FormModel.findOneAndUpdate(
      { _id: formId, "fields.name": fieldName },
      { $set: { "fields.$": { ...updatedField, name: fieldName } } },
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({ message: "Form or Field not found" });
    }

    res.json({ message: "Field updated successfully", form });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a field from a form
export const deleteField = async (req: Request, res: Response) => {
  try {
    const { formId, fieldName } = req.params;

    const updatedForm = await FormModel.findByIdAndUpdate(
      formId,
      { $pull: { fields: { name: fieldName } } },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json({ message: "Field deleted successfully", form: updatedForm });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Reorder fields
export const reorderFields = async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const { order }: { order: string[] } = req.body; // array of field names in new order

    const form = await FormModel.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const reorderedFields = order
      .map(name => form.fields.find(f => f.name === name))
      .filter(Boolean) as fieldInterface[];

    const updatedForm = await FormModel.findByIdAndUpdate(
      formId,
      { $set: { fields: reorderedFields } },
      { new: true }
    );

    res.json({ message: "Fields reordered successfully", form: updatedForm });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
