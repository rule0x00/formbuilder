import { Router, Request, Response } from "express";
import formModel from "../models/form"
import { submitForm, listSubmissions } from "../controllers/submissions"
import { authorize_user } from "../middleware/auth";

const router = Router()

//get all forms
router.get("/", authorize_user("NormalUser", "AdminUser"), async (req:Request, res:Response) => {
    try{
        const forms = await formModel.find()
        res.status(200).json({
            forms: forms
        })
    }catch(err: any){
        console.error("An error occured: ", err)
        res.status(500).json({ message: err.message });
    }
})

// get form by id
router.get("/:id", authorize_user("NormalUser", "Adminuser"), async (req: Request, res: Response) => {
    try {
      const form = await formModel.findById(req.params.id);
      if (!form) return res.status(404).json({ message: "Form not found" });
      res.status(200).json(form)
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
});

// post a new form
router.post("/", authorize_user("Adminuser"), async (req: Request, res: Response) => {
    try {
      const form = await formModel.create(req.body);
      res.status(201).json(form);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
});

// edit a form
router.put("/:id",authorize_user("Adminuser"), async (req: Request, res: Response) => {
    try {
      const form = await formModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!form) return res.status(404).json({ message: "Form not found" });
      res.json(form);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
});



//delete a form
router.delete("/:id", authorize_user("Adminuser"), async (req: Request, res: Response) => {
    try {
      const form = await formModel.findByIdAndDelete(req.params.id);
      if (!form) return res.status(404).json({ message: "Form not found" });
      res.json({ message: "Form deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
});

// submit a form
router.post("/:id/submit", authorize_user("NormalUser", "Adminuser"), submitForm);

//list all submissions
router.get("/forms/:id/submissions", authorize_user("Adminuser"), listSubmissions);



export default router;

