import express from "express"
import { handle_user_login, handle_user_signup } from "../controllers/users"

const router = express.Router()

router.get("/login", (_req, res) => {
    res.render("account/login", { title: "Login", error: null });
});

// Render signup page
router.get("/signup", (_req, res) => {
    res.render("account/signup", { title: "Signup", error: null });
});

router.post("/signup", handle_user_signup)
router.post("/login", handle_user_login)


export default router