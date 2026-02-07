import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apirespose } from "../utils/apirespose.js";
import { User } from "../models/user.model.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";


const registerUser = asynchandler(async (req, res) => {//We use asyncHandler to avoid repetitive try-catch blocks
  console.log("REQ.BODY:", req.body);
  console.log("REQ.FILES:", req.files);

  const { fullname, email, username, password } = req.body || {};

  // 1️⃣ Validation
  if ([fullname, email, username, password].some(f => !f?.trim())) //Checks if any field is empty or missing
    throw new apierror(400, "All fields are required");

  // 2️⃣ Check existing user
  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
  });
  if (existedUser) throw new apierror(409, "User with email or username already exists");

  // 3️⃣ Check avatar file
 // const avatarPath = req.files?.avatar?.[0]?.path;
 // if (!avatarPath) throw new apierror(400, "Avatar is required");

  const coverPath = req.files?.coverImage?.[0]?.path;

  // 4️⃣ Upload avatar
//  let avatar;
 // try {
 //   avatar = await uploadoncloudinary(avatarPath);
 // } catch (err) {
 //   throw new apierror(500, "Avatar upload failed");
  //}
  //if (!avatar) throw new apierror(500, "Avatar upload failed");

  // 5️⃣ Upload cover image if exists
  let coverImage = null;
  if (coverPath) {
    try {
      coverImage = await uploadoncloudinary(coverPath);
    } catch (err) {
      console.warn("Cover image upload failed, continuing without it");
    }
  }

  // 6️⃣ Create user
  const user = await User.create({
    fullname,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password,
    //avatar: avatar.secure_url || avatar.url,
    coverImage: coverImage?.secure_url || coverImage?.url || ""
  });

  // 7️⃣ Remove sensitive fields
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  return res.status(201).json(
    new apirespose(201, createdUser, "User registered successfully")
  );
});

const generateAccessAndRefreshTokens=async(userId)=>
{
  try {
   const user= await User.findById(userId)
   const accessToken=user.generateAccessToken()
  const refreshToken= user.generateRefreshToken()

  user.refreshToken= refreshToken

 await user.save({validateBeforeSave:false })
return {accessToken,refreshToken}
  } catch (error) {
    throw new apierror(500,"something went wrong while generating refresh and access tokken")
  }
}

const loginUser = asynchandler(async(req,res)=>{
//req body-> data
//username or email
//find the user
//password check
//access and refreshtoken 
//send cookies

const {email,username,password}= req.body

if(!username && !email)
{
  throw new apierror(400,"username or password is required ")
}


const user = await User.findOne({
  $or: [
    { username: username?.toLowerCase() },
    { email: email?.toLowerCase() }
  ]
})


if(!user){
  throw new apierror(400,"user does not exist ")
}
//User ye mongoose db ka object hai
   const ispasswordvalid= await user.isPasswordcorrect(password)

   if(!ispasswordvalid){
    throw new apierror(401,"invalid user credentials")
   }
   
const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

const loggedinuser=await User.findById(user._id).select("-password -refreshToken")

//sending cookies

const options={
  httpOnly:true,
  secure:true
}

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
  new apirespose(
    200,
    {
      user:loggedinuser,accessToken,
      refreshToken
    },
"User logged in successfully"
  )
)








})

const logoutuser= asynchandler(async(req,res)=>{
 await User.findByIdAndUpdate(req.user._id,{
    $set:{refreshToken:undefined}
  },
  {
    new:true
  }
)
const options={
  httpOnly:true,
  secure:true
}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new apirespose(200,{},"user logged out "))




})

const refreshAccessToken=asynchandler(async(req,res)=>{
  const incomingrefreshToken=req.cookies.refreshToken || req.body.refreshToken

  if(!incomingrefreshToken)
  {
    throw new apierror(401,"unauthorized request ")
  }

 try {
  const decodedToken= jwt.verify(
     incomingrefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   )
 
   const user= await User.findById(decodedToken?._id)
 
   if(!user)
   {
     throw new apierror(401,"invalid refresh token ")
   }
 
   if(incomingrefreshToken != user?.refreshToken){
     throw new apierror(401,"refresh token is expired or used")
   }
 
   const aptions={
     httpOnly:true,
     secure:true
   }
 
 const {accessToken,newrefreshToken}= await generateAccessAndRefreshTokens(user._id)
 
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newrefreshToken,options)
  .json(
   new apirespose(
     200,
     {accessToken,refreshToken:newrefreshToken},
     "access token refreshed"
   )
  )
 } catch (error) {
  throw new apierror(401,error?.message || "invalid refresh Token")
 }
})

const changeCurrentPassword= asynchandler(async(req,res)=>{
  const {oldPassword,newPassword}= req.body
//const {oldPassword,newPassword,confirmpassword}= req.body
//if(!newpassword === confirmpassword ){
//}


  const user = await User.findById(req.user?._id)

 const isPasswordcorrect= await  user.isPasswordcorrect(oldPassword)

 if(!isPasswordcorrect)
 {
  throw new apierror(400,"invalid old password ")
 }

 user.password=newPassword

await user.save({validateBeforeSave:false})

return res
.status(200)
.json(new apirespose(200,{},"password changed successfully"))
})

const getCurrentUser= asynchandler(async(req,res)=>{
  return res.status(200).json(200,req.user,"current user fetched successfully ")
})

const updateAccountdetails = asynchandler(async(req,res)=>{
  const {fullname,email}= req.body
  if(!fullname || !email)
  {
    throw new apierror(400,"all fields are required ")

  }

 const user= User.findByIdAndUpdate(req.user?._id,
    { 
      $set:{
        fullname,
        email: email,
      }
    },
    {new:true}

  ).select("-password")

  return res
  .status(200)
  .json(new apirespose(200,user,"account details updated successfully "))
})

/*const updateUserAvatar=asynchandler(async(req,res)=>{
 const avatarlocalPath =req.file?.path

 if(!avatarlocalPath)
 {
  throw new apierror(400,"avatar file is missing")
 }

const avatar=await uploadoncloudinary(avatarlocalPath)

if(!avatar.url)
{
  throw new apierror(400,"error while uploading on avatar")
}

const user= await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
      avatar:avatar.url
    }
  },
  {new:true}
).select("-password")

return res
.status(200)
.json(
new apirespose(200,user,"cover image updated successfully ")
})*/
//same process for coverimage

export { registerUser,
  loginUser,
  logoutuser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
updateAccountdetails,
//updateUserAvatar 
};
