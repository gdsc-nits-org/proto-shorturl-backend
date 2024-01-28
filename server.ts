import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createuser } from "src/controllers/createuser";
import { getuser } from "src/controllers/getusers";
import { getusermiddleware } from "src/middlewares/getuser";

const app = express();
const PORT = 5000;

app
    .use(cors())
    .use(helmet())
    .use(morgan("dev"))
    .use(express.json())

app.get("/", (req: Request, res: Response) => {
    return res
        .status(200)
        .json({
            "msg": "Success"
        })
})

app.post("/createuser", createuser)

app.post("/getuser", getusermiddleware, getuser)

app.listen(PORT, () => {
    console.log(`Service active on PORT ${PORT}`)
})