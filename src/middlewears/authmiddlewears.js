import jwt from "jsonwebtoken"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//verifying jwt token 
export const verifyJWT = asyncHandler(async (req, _, next) => {
    //requesting accesstoken from cookie pareser 
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer","")

    if (!token) {
        throw new ApiError(401, "Unauthorization")
    }
    try {
        //verifying the envToken and cookieToken in to decoded token just to find the user 
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //finding user by _id
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Unauthorized")
        }
        req.user = user
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid JWT Access Token")
    }

})