import mongoose, {Schema}  from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const subscriptionSchema = new Schema(
    //subscriber
    {
        subscriber:{
            type: Schema.Types.ObjectId,
            ref: "User" //one who is a subscriber
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref:"User" //one who is subscribed to
        }
    },
    {
        timestamps: true
    }
)

subscriptionSchema.plugin(mongooseAggregatePaginate)


export const User = mongoose.model("Subscription", subscriptionSchema)