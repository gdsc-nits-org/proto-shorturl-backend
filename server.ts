import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import 'dotenv/config';
import bodyParser from "body-parser";
import { nanoid } from 'nanoid';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const app = express();
const PORT = process.env.PORT || 3000;

app
    .use(cors())
    .use(helmet())
    .use(morgan("dev"))
    .use(bodyParser.json());
    

app.get("/", (req: Request, res: Response) => {
    return res
        .status(200)
        .json({
            "msg": "Success"
        })
})

app.listen(PORT, () => {
    console.log(`Service active on PORT ${PORT}`)
})





app.post("/api/shorten",async ( req:Request,res:Response)=>{

    const url= await prisma.user.findUnique({})

    const shortid=nanoid(6);
    console.log(shortid);
    const originalUrl =req.body.originalUrl;
    console.log(originalUrl);
    return res.status(200).json({
        "msg":"API Success"
    })
})
