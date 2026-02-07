//yeh sirf verify karega ki user hai ya nahi hai

import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT= asynchandler(async(req, _,next)=>{
 try {
    // const token=  req.cookies?.accessToken || req.header("authorization")?.replace("Bearer","")
   const authHeader = req.header("authorization");
const token = req.cookies?.accessToken || (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);



     if(!token){
       throw new apierror(401,"unauthorized request ")
     }
   
   const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   
   const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
   
   //if(!user){
    //   throw new apierror(401,"invalid access token ")
   //}

   if (error.name === "TokenExpiredError") {
  throw new apierror(401, "Access token expired");
} else {
  throw new apierror(401, "Invalid access token");
}

   
   req.user= user;
   next()
 } catch (error) {
    throw new apierror(401,error?.message || "invalid access token")
 }
})