import multer from "multer"; //multer middlewear for storage 

const storage = multer.diskStorage({
    //creates a temporary file in Public 
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb){
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        cb(null, file.originalname + "-" + uniqueSuffix)
    }
})


export const upload = multer({
    storage
})