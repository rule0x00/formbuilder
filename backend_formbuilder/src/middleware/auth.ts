import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import {userInterface} from "../models/user"
import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "abcd"

export const authenticate_user = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.headers)

    const token: string = req.headers["authorization"] as string

    if (!token?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }
    try{

    //get the bearer token
    const bearer_token = token.split(" ")[1];

    //decode the token
    const decoded_user = jwt.verify(bearer_token, JWT_SECRET) as userInterface
    
    if (!decoded_user) {
        return res.send("User not found. Invalid token payload.")
    }

    //set to req interface for role based permissions
    (req as any).user = decoded_user
    next()

    }catch(err: any){

        //check if token is expired
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
        }

        return res.status(401).json({
            message: "Invalid or malformed token. Please log in again.",
            error: err.message,
        });
    }
}

export const authorize_user = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;

      console.log("role is: ", user)
  
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message:"You don't have permission for this action" });
      }
  
      next();
    };
  };
  
