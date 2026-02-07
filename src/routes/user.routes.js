import { Router } from "express";
import { loginUser, logoutuser, registerUser,refreshAccessToken } from "../controllers/user.controller.js";
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



export default router;
