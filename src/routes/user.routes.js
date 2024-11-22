import { Router } from "express"

import { registerUser, logoutUser, loginUser, refreshAccessToken } from "../controllers/userController.js"

import {uploads} from "../middlewears/multer.middlewear.js"

import { verifyJWT } from "../middlewears/authmiddlewears.js"


const router = Router()
//when someone hits /api/v1/healthcheck/test

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
router.route("logout").post(verifyJWT,logoutUser)


export default router