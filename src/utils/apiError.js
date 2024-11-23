class ApiError extends Error{
    //constructor function 
    constructor(
        //function params
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        
        super(message)
        this.statusCode = statusCode
        this.data = null 
        this.message = message
        this.success = false
        this.errors = this.errors;

        //checking if stack is present or not
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}


export { ApiError }