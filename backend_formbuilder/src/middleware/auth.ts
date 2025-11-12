import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import {userInterface} from "../models/user"
import dotenv from "dotenv"
import UserModel from "../models/user"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "abcd"

export const authenticate_user = (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies.token

    if (!token) {
        return res.redirect("/account/login");
    }

    // if (!token?.startsWith("Bearer ")) {
    //     return res.status(401).json({ message: "Invalid Authorization header" });
    // }

    try{

        //get the bearer token
        // const bearer_token = token.split(" ")[1];

        //decode the token
        const decoded_user = jwt.verify(token, JWT_SECRET) as userInterface
        
        if (!decoded_user) {
            return res.redirect("/account/login");
        }

        //set to req interface for role based permissions
        (req as any).user = decoded_user

        next()

    }catch(err: any){
        //check if token is expired
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        }

        return res.redirect("/account/login");
    }
}

export const authorize_user = (...allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;

      // const user = await UserModel.findById(userr.id)

      if(!user){
        return null
      }
  
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message:"You don't have permission for this action" });
      }
  
      next();
    };
  };
  
