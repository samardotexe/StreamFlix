import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

//config dotenv to access env variables
dotenv.config()

//config cloudinary 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

//uploading on cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        console.log("cloudinary config : ", {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,

        })
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"})
            console.log("file uploaded on cloudinary " + response.url)
            fs.unlinkSync(localFilePath)
            return response
        } catch (error) {
            fs.unlinkSync(localFilePath)
            return null 
        }
}


//deleting from cloudinary from the given public id
const deleteFromCloudinary = async (publicId) => {
    try{
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("deleted from cloudinary ");
    } catch (error){
        console.log("error deleting from cloudinary")
    }
}

export { uploadOnCloudinary, deleteFromCloudinary}