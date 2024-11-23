import mongoose, {Schema}  from "mongoose"

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "password is required"]
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)


userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next()

    //hasing the user password through bcrypt
    this.password = bcrypt.hash(this.password, 10)
    next()

})

//comparing the old password and the new password with a monogdb method
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}


//generate access token for a individual user through jwt 
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}


//generating the refresh token for user
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    },
    process.env.Refresh_TOKEN_SECRET,
    { expiresIn: process.env.Refresh_TOKEN_EXPIRY }
    )
}



export const User = mongoose.model("User", userSchema)