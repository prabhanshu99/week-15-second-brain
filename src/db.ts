import  mongoose,{ model,Schema } from "mongoose";
import { required } from "zod/mini";

mongoose.connect("mongodb+srv://prabhanshuop:X0ZVCoVdF3X1Doob@cluster0.ho3qpjr.mongodb.net/second-brain")


const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String
})

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    type: String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true },
})

export const ContentModel = model("Content", ContentSchema);