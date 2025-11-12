import { Router, Request, Response } from "express";
import { authorize_user } from "../middleware/auth";
import formModel from "../models/form";
import SubmissionModel from "../models/submission";
import FormVersionModel from "../models/form_versions";
import { Types } from "mongoose";

const router = Router();

// Admin (list all forms)
router.get("/", authorize_user("AdminUser"), async (req: Request, res: Response) => {
  try {
    const forms = await formModel.find().lean();
    res.render("admin/forms_list", {
      title: "All Forms",
      forms,
      user: (req as any).user,
      message: req.query.message || null
    });
  } catch (err: any) {
    console.error(err);
    res.render("error", { title: "Error", message: err.message });
  }
});

//  Render create form page
router.get("/new", authorize_user("AdminUser"), (req: Request, res: Response) => {
  res.render("admin/create_form", { title: "Create Form", user: (req as any).user });
});

//  Create new form
router.post("/new", authorize_user("AdminUser"), async (req: Request, res: Response) => {
  try {
    const { title, description, fields } = req.body;

    console.log(title, description, fields)
    const parsedFields = Array.isArray(fields)
      ? fields.map((f: any, i: number) => ({
          label: f.label,
          name: f.name,
          type: f.type,
          required: f.required === "on" || f.required === true,
          options: f.options ? f.options.split(",").map((o: string) => o.trim()) : [],
          order: i,
        }))
      : [];

    const newForm = await formModel.create({ title, description, fields: parsedFields });
    console.log("ran here")

    const newVersion = await FormVersionModel.create({
      formId: newForm._id,
      version: 1,
      fields,
    });

    newForm.activeVersionId = newVersion._id as Types.ObjectId;
    await newForm.save();
    
    res.redirect("/admin/forms?message=Form created successfully");
  } catch (err: any) {
    console.error(err);
    res.render("admin/create_form", {
      title: "Create Form",
      user: (req as any).user,
      error: err.message,
    });
  }
});

// Render Edit Form Page
router.get("/:id/edit", authorize_user("AdminUser"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const form = await formModel.findById(id);
    if (!form) {
      return res.status(404).render("404", { message: "Form not found", user: (req as any).user });
    }

    res.render("admin/edit_form", {
      title: `Edit Form - ${form.title}`,
      form,
      fields: form.fields,
      user: (req as any).user,
    });
  } catch (err: any) {
    console.error("Error rendering edit form:", err);
    res.status(500).render("error", { message: "Error loading edit form", user: (req as any).user });
  }
});


// Edit form 
router.put("/:id", authorize_user("AdminUser"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(id)

    const updatedFields = Array.isArray(req.body.fields)
      ? req.body.fields.map((f: any, index: number) => ({
          label: f.label,
          name: f.name,
          type: f.type,
          required: f.required === "on" || f.required === true,
          options: f.options ? f.options.split(",").map((o: string) => o.trim()) : [],
          order: index,
        }))
      : [];

    // Update the form
    const updatedForm = await formModel.findByIdAndUpdate(
      id,
      { ...req.body, fields: updatedFields },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Find latest version number
    const lastVersion = await FormVersionModel.findOne({ formId: id })
      .sort({ version: -1 })
      .lean();

    const nextVersion = (lastVersion?.version || 0) + 1;

    // Create new version document
    const newVersion = await FormVersionModel.create({
      formId: id,
      version: nextVersion,
      fields: updatedForm.fields,
    });

    // Update form’s activeVersionId
    updatedForm.activeVersionId = newVersion._id as Types.ObjectId;
    await updatedForm.save();

    res.redirect("/admin/forms?message=Form updated successfully");

  } catch (err: any) {
    console.error("Error updating form:", err);
    res.status(400).json({ message: err.message });
  }
});

// View all submissions for a form
router.get("/:id/submissions", authorize_user("AdminUser"), async (req: Request, res: Response) => {
  try {
    const form = await formModel.findById(req.params.id).lean();
    if (!form) return res.status(404).send("Form not found");

    const submissions = await SubmissionModel.find({ formId: req.params.id })
      .populate("userId", "name email")
      .lean();

    res.render("submissions/list", {
      title: `Submissions for ${form.title}`,
      form,
      submissions,
      user: (req as any).user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading submissions");
  }
});

// View submission by id
router.get("/:id/submissions/:submissionId", authorize_user("AdminUser"), async (req, res) => {
    try {
      const { id: formId, submissionId } = req.params; // rename `id` to `formId`
  
      console.log("Form ID:", formId);
  
      const form = await formModel.findById(formId).lean();
      if (!form) {
        return res.render("error", { title: "Error", message: "Form not found" });
      }
  
      const submission = await SubmissionModel.findById(submissionId)
        .populate("userId", "email name")
        .lean();
  
      if (!submission) return res.status(404).send("Submission not found");
  
      res.render("submissions/detail", {
        title: "Submission Details",
        form,
        submission,
        user: (req as any).user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error loading submission details");
    }
  });
  
// DELETE /admin/forms/:id
router.delete("/:id", authorize_user("AdminUser"), async (req: Request, res: Response) => {
    try {
      const formId = req.params.id;
  
      const deletedForm = await formModel.findByIdAndDelete(formId);
      if (!deletedForm) {
        return res.status(404).render("error", { title: "Error", message: "Form not found" });
      }
  
      // delete all submissions tied to the form
      await SubmissionModel.deleteMany({ formId });
  
      // if admin UI: redirect back to admin list with message
      return res.redirect("/admin/forms?message=Form+deleted+successfully");
    } catch (err: any) {
      console.error("Error deleting form:", err);
      return res.status(500).render("error", { title: "Error", message: "Error deleting form" });
    }
  });
  
export default router;
