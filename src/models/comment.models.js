import mongoose, {Schema}  from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


//commentSchema using ER Diagram
const commentSchema = new Schema(
    {
        content:{
            type: String,
            required: true
        },
        video : {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
)

commentSchema.plugin(mongooseAggregatePaginate)


export const User = mongoose.model("Comment", commentSchema)