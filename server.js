import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
const PORT = 5000;

app
    .use(cors())
    .use(helmet())
    .use(morgan("dev"))

app.get("/", (req, res) => {
    return res
        .status(200)
        .json({
            "msg": "Success"
        })
})

app.listen(PORT, () => {
    console.log(`Service active on PORT ${PORT}`)
})