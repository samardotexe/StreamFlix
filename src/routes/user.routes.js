import { Router } from "express"

import { registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser, updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory } from "../controllers/userController.js"

import {uploads} from "../middlewears/multer.middlewear.js"

import { verifyJWT } from "../middlewears/authmiddlewears.js"

//initiating router
const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);


//unsecured route
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get( verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)


export default router