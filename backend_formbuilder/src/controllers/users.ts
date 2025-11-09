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

        res.json({message: "Account created!", token: token})
    
    }catch(err: any){
        res.send(`An error occured: ${err.message}`)
    }
}

export const handle_user_login = async (req: Request, res: Response) => {
    const {email, password} = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try{
        //get the user document
        const user = await UserModel.findOne({email: email})

        if (!user) {
            return res.status(400).json({ message: "User does not exist." });
        }

        const isPasswordValid = bcrypt.compare(password, user.password as string)

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password." });
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

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
            id: user._id,
            username: user.name,
            email: user.email,
            role: user.role,
            },
        });
    }catch(error: any){
        console.error("An error occurred: ",error.message)
        res.status(500).send(`An error occured: ${error.message}`)
    }
}