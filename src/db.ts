import  mongoose,{ model,Schema } from "mongoose";
import { required } from "zod/mini";

mongoose.connect("mongodb+srv://prabhanshuop:X0ZVCoVdF3X1Doob@cluster0.ho3qpjr.mongodb.net/second-brain")


const UserSchema = new Schema({
    username:{type:String,unique:true},
    password:{
  type: String,
  required: true,
  select: false
}
})

export const UserModal =
  mongoose.models.User || mongoose.model("User", UserSchema);

const contentSchema = new Schema({
    title:String,
    link:String,
    tags: [{type:mongoose.Types.ObjectId, ref:"Tag"}],
    userId:{type:mongoose.Types.ObjectId, ref:"User", required:true }
})

export const ContentModel = model("User",contentSchema);