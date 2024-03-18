import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


import prisma from "prisma/prismaClient";
import  authRoutes  from "src/controllers/authRoutes";
import urlRoutes from "src/middlewares/urlRoutes";
import apiRoutes from "src/middlewares/apiRoutes";



import cookieParser from "cookie-parser";


const app = express();
const PORT = process.env.PORT || 3000;

app
  .use(cors())
  .use(helmet())
  .use(morgan("dev"))
  .use(express.json())
  .use(cookieParser());

  app.use(authRoutes);
  app.use(urlRoutes);
  app.use(apiRoutes);


app.get("/", async (req: Request, res: Response) => {
  const data = await prisma.url.findMany({});

  return res.status(201).json({
    msg: "Success",
    request: req.body,
    data: data,
  });
});



app.listen(PORT, () => {
  console.log(`Service active on PORT ${PORT}`);
});



