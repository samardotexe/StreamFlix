import express from "express"
import cors from "cors" //middlewear
import cookieParser from "cookie-parser"


//establishing the app 
const app = express()

//middlewear establishment
app.use(
    cors({
        orgin: process.env.CORS_ORIGIN,
        credentials: true
    })
)


//adding middlewears via express
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limits: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// bringng routes and importing them here
import healthCheckRouter from "./routes/healthCheckRoutes.js"
import userRoutes from "../src/routes/user.routes.js"
import { errorHandler } from "./middlewears/error.middlewears.js"

//routes 

app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api.v1/users",userRouter)




app.use(errorHandler)
//exporting the created server app {mainly to use it in index,js}
export { app }