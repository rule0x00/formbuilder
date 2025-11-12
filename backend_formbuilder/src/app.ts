import express, { Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import path from "path"
import connect_to_db from "./utils/db_connection"
import userRouter from "./routes/user_router"
import formRouter from "./routes/form_router"
import adminFormrouter from "./routes/admin_form_router"
import {authenticate_user} from "./middleware/auth"
import expressLayouts from "express-ejs-layouts";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";



dotenv.config()

//initializing express app
const app = express()

//cors middleware
app.use(cors())

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(cookieParser());

connect_to_db()

app.use((req, res, next) => {
    res.locals.user = (req as any).user || null;
    next();
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../src/views"));


app.use(expressLayouts);
app.set("layout", "layouts/layout"); // default layout file

// Static folder for CSS
app.use(express.static(path.join(__dirname, "../src/public")));

// Auth middleware
// app.use(authenticate_user)

app.use("/forms", authenticate_user, formRouter)
app.use("/admin/forms", authenticate_user, adminFormrouter);
app.use("/account", userRouter)
app.use("/",authenticate_user, (req: Request, res: Response) => {
    res.render("index", { title: "Home", user: (req as any).user });
})



export default app