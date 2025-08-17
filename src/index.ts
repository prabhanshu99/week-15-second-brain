import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcrypt";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js";
import { userMiddleware } from "./middleware.js";
import { random } from "./utils.js";


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

    const existingUser:any = await UserModel.findOne({ username }).select("+password");

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

    await ContentModel.create({
        link,
        type,
        title: req.body.title,
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

app.post("/api/v1/brain/share",userMiddleware, async (req,res)=>{
    const share = req.body.share;
    if (share) {
            const existingLink = await LinkModel.findOne({
                //@ts-ignore
                userId: req.userId
            });

            if (existingLink) {
                res.json({
                    hash: existingLink.hash
                })
                return;
            }
            const hash = random(10);
            await LinkModel.create({
                //@ts-ignore
                userId: req.userId,
                hash: hash
            })

            res.json({
                hash
            })
    } else {
        await LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        });

        res.json({
            message: "Removed link"
        })
    }
})

app.get("/api/v1/brain/:shareLink", async (req,res)=>{
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash
    });

    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
    }
    
    const content = await ContentModel.find({
        userId: link.userId
    })

    console.log(link);
    const user = await UserModel.findOne({
        _id: link.userId
    })

    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }

    res.json({
        username: user.username,
        content: content
    })
})

app.listen(3000);


