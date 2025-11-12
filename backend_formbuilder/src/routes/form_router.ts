import { Router, Request, Response } from "express";
import formModel from "../models/form"
import SubmissionModel from "../models/submission"
import { submitForm} from "../controllers/submissions"
import { authorize_user } from "../middleware/auth";
import { upload } from "../middleware/upload";
import FormModel from "../models/form"
import submissionModel from "../models/submission";

const router = Router()

interface Pagination {
  limit: number;
  skip: number;
}

//get all forms
router.get("/", authorize_user("NormalUser", "AdminUser"), async (req:Request, res:Response) => {
    try{

        const { filter, sort, pagination } = req.query; console.log('filters are', filter);

        const filterObj = filter ? JSON.parse(filter as string) : {};
        const sortObj = sort ? JSON.parse(sort as string) : {};
        const paginationObj: Pagination = pagination ? JSON.parse(pagination as string) : {};

        const data = await formModel.find(filterObj) .sort(sortObj) .limit(paginationObj.limit) .skip(paginationObj.skip);
        
        res.render("forms/list", { title: "Forms", message: req.query.message, data, user: (req as any).user });

    }catch(err: any){
        console.error("An error occured: ", err)  
        res.render("error", { title: "Error", message: err.message });
    }
})

// get form by id
router.get("/:id", authorize_user("NormalUser", "AdminUser"), async (req, res) => {
  try {
    const form = await formModel.findById(req.params.id);
    if (!form) return  res.render("error", { title: "Error", message: "Form not found." });

    res.render("forms/detail", {
      title: form.title,
      form,
      user: (req as any).user
    });
  } catch (err: any) {
    res.render("error", { title: "Error", message: err.message });
  }
});

//fill a form
router.get(
  "/:id/fill",
  authorize_user("NormalUser", "AdminUser"),
  async (req, res) => {
    try {
      const form = await formModel.findById(req.params.id).lean();

      if (!form) {
        return res.status(404).render("forms/fill", {
          title: "Error",
          message: "Form not found",
        });
      }

      const user = (req as any).user

      const already_submitted = await submissionModel.find({formId: form._id, userId: user.id})
      console.log(already_submitted)
  
      if(already_submitted){
        return res.render("forms/fill", {
          data: {},
          form,
          title: "Error",
          errors: {},
          fields: form.fields,
          message: "You have already submitted the Form",
          user,
        });
      }

      res.render("forms/fill", {
        title: form.title || "Fill Form",
        form,
        fields: form.fields,
        errors: {},   
        message: null,  
        user: (req as any).user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("error", {
        title: "Error",
        message: "Error loading form",
      });
    }
  }
);


// get user submission
router.get("/:id/mine", authorize_user("NormalUser", "AdminUser"), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const formId = req.params.id;

    // Fetch both form and user submission
    const [form, submission] = await Promise.all([
      FormModel.findById(formId).lean(),
      SubmissionModel.findOne({ formId, userId }).lean()
    ]);

    if (!submission) {
      return res.render("submissions/view", { 
        form,
        title: "Your Submissions",
        submission: null, 
        message: "No submission found for this form." 
      });
    }

    res.render("submissions/view", { title: "Your Submissions", form, submission, message: null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading submission");
  }
});

// submit a form
router.post("/:id/submit", upload.any(), authorize_user("NormalUser", "AdminUser"), submitForm);


export default router;

