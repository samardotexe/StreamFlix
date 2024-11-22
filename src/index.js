import { app } from "./app.js"; //where server is established 
import dotenv from "dotenv";
import connectDB from "./db/index.js";


//configure dotenv port path
dotenv.config({
    path: "./.env"
})

//declaring port
const PORT = process.env.PORT || 5000;

//connecting DB with index.js. When db gets connected the server is deployed else it yields an error

connectDB()
.then(() => {
    //server deployment
    app.listen(PORT, () => {
        console.log(`The server is running on ${PORT}`)
    })
})
.catch((err) => {
    console.log(`MongoDB connection error`)
})