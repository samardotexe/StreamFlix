//async handler  function that handles all the asynchronous activity
//we can also use nodejs async handler inbuilt function
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}