import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connect_to_db from "./utils/db_connection"
import userRouter from "./routes/user_router"
import formRouter from "./routes/form_router"
import {authenticate_user} from "./middleware/auth"

dotenv.config()

//initializing express app
const app = express()

//cors middleware
app.use(cors())

//json body parser
app.use(express.json());

connect_to_db()

// Auth middleware
// app.use(authenticate_user)

app.use("/forms", authenticate_user, formRouter)
app.use("/account", userRouter)
app.use("/", (_req, res) => {
    res.send("FORMBUILDER")
})



export default app