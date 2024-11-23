import mongoose from "mongoose";
//db_name stored in constants.js

//connecting db with try and catch
const connectDB = async () => {
    try {
        //MongoDB url stored in Env Folder 
        const connectionInstance = await mongoose.connect(`${ process.env.MONGODB_URI }`);
        console.log(`MongoDB connected ! DB Host : ${connectionInstance.connection.host}`);
        
    } catch (error){
        console.log("MongoDB connection error", error)
        //to exit the process of error
        process.exit(1)
    }
}

//exporting the connectDB function to be used in other files
export default connectDB