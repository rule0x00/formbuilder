import express from "express"
import { handle_user_login, handle_user_signup } from "../controllers/users"

const router = express.Router()

router.post("/signup", handle_user_signup)
router.post("/login", handle_user_login)


export default router