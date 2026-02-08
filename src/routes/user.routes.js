import { Router } from "express";
import { loginUser, 
  logoutuser,
   registerUser,
   refreshAccessToken,
    changeCurrentPassword,
     getCurrentUser,
      updateAccountdetails,
       getUserChannelProfile,
        getwatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    // { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
);

router.post("/login", loginUser);

// Secured route
router.post("/logout", verifyJWT, logoutuser);
router.route("/refresh-Token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-accountdetails").patch(verifyJWT,updateAccountdetails)
//router.route("/avatar").patch(verifyJWT,upload.single("/avatar"),updateUserAvatar)

//router.route("/coverimage").patch(verifyJWT,upload.single("/coverImage"),updateusercoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getwatchHistory)


export default router;
