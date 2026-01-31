import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apirespose } from "../utils/apirespose.js";
import { User } from "../models/user.model.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";

const registerUser = asynchandler(async (req, res) => {
  console.log("REQ.BODY:", req.body);
  console.log("REQ.FILES:", req.files);

  const { fullname, email, username, password } = req.body || {};

  // 1️⃣ Validation
  if ([fullname, email, username, password].some(f => !f?.trim()))
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

export { registerUser };
