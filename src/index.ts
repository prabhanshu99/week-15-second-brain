import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcrypt";
import { ContentModel, UserModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js";
import { userMiddleware } from "./middleware.js";


const app = express();
app.use(express.json());

// ZOD VALIDATION

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

app.post("/api/v1/signup", async (req,res)=>{

    const { username, password } = signupSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
        username:username,
        password:hashedPassword
    })

    res.json({
        message:"user signed up"
    })
})

app.post("/api/v1/signin", async (req,res)=>{
    const username=req.body.username;
    const password=req.body.password;

    const existingUser = await UserModel.findOne({ username }).select("+password");

        if (!existingUser) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }

        const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD);

        res.json({ token });

})

app.post("/api/v1/content", userMiddleware, async (req,res)=>{
    const link = req.body.link;
    const type = req.body.type;

    ContentModel.create({
        link,
        type,
        //@ts-ignore
        userId: req.userId,
        tags: []
    })

    res.json({
        message:"content added"
    })

})

app.get("/api/v1/content",userMiddleware, async (req,res)=>{
    //@ts-ignore
    const userId=req.userId;
    const content = await ContentModel.find({
        userId:userId
    }).populate("userId","username")
    res.json({
        content
    })
})

app.delete("/api/v1/content",userMiddleware, async (req,res)=>{
    const contentId = req.body.contentId;
    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId:req.userId

    })

    res.json({
        message:"Deleted"
    })

})

app.post("/api/v1/brain/share", async (req,res)=>{
    
})

app.get("/api/v1/brain/:shareLink", async (req,res)=>{
    
})

app.listen(3000);


