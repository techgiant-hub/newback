import { asynchandler } from "../utils/asynchandler.js";
import {apierror} from "../utils/apierror.js";
import {User } from "../models/user.model.js";
import {uploadoncloudinary} from "../utils/cloudinary.js";
import { apirespose } from "../utils/apirespose.js";

const registerUser= asynchandler(async(req,res)=>{
   //get user details from forntend
   //validation-not empty
   //check if user already exists:username,email
   //check for images ,check for avatar
   //upload them to cloudinary,avatar
   //create user object - create entry in db
   //remove password and refresh token field from response
   //check for user creation
   //return response

  const {fullname,email,username,password}= req.body
  console.log("email: ",email);
   if(
      [fullname,email,username,password].some((field)=>field?.trim()=="")
   )
   {
    throw new apierror(400,"all fields are required")
   }

    const existedUser= User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser)
    {
        throw new apierror(409,"user with email or username already exists ")
    }

   const avatarlocalpath= req.files?.avatar[0]?.path;
  const converImagelocalpath= req.files?.converimage[0]?.path;

  if(!avatarlocalpath)
  {
    throw new apierror(400,"avatar file is required")
  }

  const avatar = await uploadoncloudinary(avatarlocalpath)
  const converimage= await uploadoncloudinary(converImagelocalpath)

  if(!avatar)
  {
    throw new apierror(400,"avatar file is required ") 
  }

 const user= await User.create({
  fullname,
  avatar:avatar.url,
  coverimage:coverimage?.url || "",
  password,
  username:username.toLowerCase() 
 })

const createduser= await User.findById(user._id).select(
  "-password -refreshToken"
)

if(!createduser){
  throw new apierror("something went wrong while registeringt the user")
}

return res.status(201).json(
  new apirespose(200,createduser,"user registered successfully ")
)

  /*if(fullname=="")
  {
    throw new apierror(400,"fullname is required")
  }*/

})

export {registerUser,}
