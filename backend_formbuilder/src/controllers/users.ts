import { Request, Response } from "express";
import UserModel from "../models/user"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "abcd"
const SALT_ROUNDS = 2;

export const handle_user_signup = async (req: Request, res: Response) => {

    const {name, email, age, password} = req.body

    if(!name || !email || !password){
        res.json({message: "Missing required fields."})
    }

    const user = await UserModel.findOne({email: email})

    if(user){
        res.json({message: "Email is already in use"})
    }
    try{
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
       const user = await UserModel.create({
            name,
            email,
            age,
            password: hashedPassword,
            role: "NormalUser"
        })

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "2h"
            }
        )

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        });

        res.redirect("/forms");
    
    }catch(err: any){
        res.send(`An error occured: ${err.message}`)
    }
}

export const handle_user_login = async (req: Request, res: Response) => {
    const {email, password} = req.body

    if (!email || !password) {
        return res.render("account/login", {
            title: "Login",
            error: "Email and password are required",
        });
    }

    try{
        //get the user document
        const user = await UserModel.findOne({email: email})


        if (!user) {
            return res.render("account/login", {
                title: "Login",
                error: "User does not exist",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password as string)

        if (!isPasswordValid) {
            return res.render("account/login", {
                title: "Login",
                error: "Invalid password",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "2h"
            }
        )

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        });

        res.redirect("/forms");

    }catch(error: any){
        console.error("An error occurred: ",error.message)
        return res.render("account/login", {
            title: "Login",
            error: "Something went wrong. Please try again.",
        });
    }
}