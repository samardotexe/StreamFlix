import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { deleteFromCloudinary } from "../utils/cloudinary.js"
import { configDotenv } from "dotenv"
import jwt from "jsonwebtoken"


try {
    const generateAccessAndRefreshToken = async (userId) => {
        const user = User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
        return {accessToken, refreshToken}
        
    }
} catch (error) {
    throw new ApiError(500,"Can't generate refresh token ")
}

const registerUser = asyncHandler( async (req, res) => {
    const { fullname, email, username, password } = req.body

    //validation
    if(
        [fullname, email, username, password].some((field) => field?.trim()=== "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser){
        throw new ApiError(400, "User already exists")
    }

    console.warn(req.files)
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.cover?.[0]?.path

    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar file not found")
    }


    const avatar = await uploadCloudinary(avatarLocalPath)
    if (coverLocalPath){
        const coverImage = await uploadCloudinary(coverLocalPath)
    }



    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage.url,
            email,
            password,
            username: username.toLowerCase()
        })
    
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if(!createdUser){
            throw new ApiError(500, "something went wrong")
        }
    
        return res
        .status(201)
        .json( new ApiResponse(201,createduser, "User Registered"))
    } catch (error) {
        console.log("User creation failed")
    }
    
    if(avatar){
        await deleteFromCloudinary(avatar.public_id)
    }
    if(coverImage){
        await deleteFromCloudinary(coverImage.public_id)
    }
    throw new ApiError(500, "something went wrong data deleted")

})




const loginUser = asyncHandler( async (req,res) => {
    const {username, email, password} = req.body
    //validation
    if (!email) {
        throw new ApiError(400, "Email required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if (!user) {
        throw new ApiError(400, "user not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "invalid password")
    }


    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        httpsOnly : true,
        secure: process.env.NODE_ENV === "production"
    }


    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", accessToken, options)
    .json(new ApiResponse(200,
        loggedInUser, {user: accessToken, refreshToken, loggedInUser},
        "User logged in successfully"))
})


const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {new: true}
    )
    const options = {
        httpsOnly : true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"user logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401,"RefreshToken required")
    }

    try {
        jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh tokem ")
        }

        if(incomingRefreshToken !== user?.refreshToken ){
            throw new ApiError(401,"Invalid Refresh tokem")
        }

        const options = {
            httpsOnly : true,
            secure: process.env.NODE_ENV === "production"
        }

        const {refreshToken, accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)


        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", accessToken, options)
        .json(new ApiResponse(200, 
            {accessToken, refreshToken, newRefreshToken},
            "Access code refreshed "))

        
    } catch (error) {
        throw new ApiError(401, "RefreshToken verification failed")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordValid) {
        throw new ApiError(401,"Old Password is incorrect")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})
    return res
    .status(201)
    .json(new ApiResponse(201,"password changed succesfully"))

})
const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(201)
    .json(new ApiResponse(201,"Current User details"))
})
const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullname, email} = req.body
    if (!fullname || !email) {
        throw new ApiError(401,"Empty Credentials")
    }

    const user = await User.findByIdAndUpdatee(req.user?._id,{$set: {
        fullname,
        email: email
    }},
    {new: true}).select("-password -refreshToken")
    return res
    .status(201)
    .json(new ApiResponse(201,"Account Details Updated succsfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(401,"File is required")
    }
    const avatar = await uploadCloudinary(avatarLocalPath)
    if (avatar.url) {
        throw new ApiError(401,"Avatar uploading error")
    }
    const user = await User.findById(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")
    return res
    .status(201)
    .json(new ApiResponse(201,"Avatar Details Updated succsfully"))
})
const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(401,"File is required")
    }
    const coverImage = await uploadCloudinary(coverImageLocalPath)
    if (coverImage.url) {
        throw new ApiError(401,"CoverImage uploading error")
    }
    const user = await User.findById(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")
    return res
    .status(201)
    .json(new ApiResponse(201,"CoverImage Details Updated succsfully"))
})


const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {username} = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "Username is required ")
    }
    const channel = await User.aggregrate(
        [
            {
                $match : {
                username : username.toLowerCase(),
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup : {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribers"
                }
            },
            {
                $addFields : {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelsSubscribedToCount: {
                        $size: $subscribedTo
                    },
                    isSubscribed: {
                        $condition: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project:{
                    fullname : 1,
                    username : 1,
                    avatar: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    coverImage: 1,
                    email: 1,
                }
            }
        ]
    )
    if(!channel?.length){
        throw new ApiError(401, "Channel not found ")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,"Channel profile fetched succesfully"))
})

const getWatchHistory = asyncHandler(async(req,res) => {
    const user = await User.aggregate(
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user?._id)
            },
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                    $lookup:{
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline:[
                            {
                            $project:{
                                from: "users",
                                localField: "owner",
                                 foreignField: "_id",
                                as: "owner"
                            }
                        }
                    ]
                    }
                    }
                ]
            }
        }
    )
})


export { registerUser, loginUser, refreshAccessToken, logoutUser, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory}