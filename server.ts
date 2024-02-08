import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import 'dotenv/config';
import { nanoid } from 'nanoid';



const app = express();
const PORT = process.env.PORT || 3000;

app
    .use(cors())
    .use(helmet())
    .use(morgan("dev"))

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

app.post("/api/shorten",( req:Request,res:Response)=>{

    // const shortid=nanoid(6);
    // console.log(shortid);
    const original =req.body;
    console.log(original);
    return res.status(200).json({
        "msg":"API Success"
    })
})
