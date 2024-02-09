import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createuser } from "src/controllers/createuser";
import { getuser } from "src/controllers/getusers";
import { getusermiddleware } from "src/middlewares/getuser";
import { nanoid } from "nanoid";
import prisma from "prisma/prismaClient";
// import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()).use(helmet()).use(morgan("dev")).use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.status(201).json({
    msg: "Success",
    request: req.body,
  });
});

app.post("/createuser", createuser);

app.post("/getuser", getusermiddleware, getuser);

app.listen(PORT, () => {
  console.log(`Service active on PORT ${PORT}`);
});

app.post("/api/shorten", async (req: Request, res: Response) => {
  const shortUrl = nanoid(6);
  // console.log(shortid);
  const longUrl = req.body.originalUrl;
  const url = {
    longUrl,
    shortUrl,
  };

  try {
    const result = await prisma.url.create({
      data: {
        longUrl: url.longUrl,
        shortUrl: url.shortUrl,
      },
    });
    if (result) {
      return res.status(201).json({
        message: "ShortUrl successfully created",
        originalUrl: result.longUrl,
        shortUrl: result.shortUrl,
      });
    } else {
      return res.status(501).json({ error: "Couldn't create shortUrl" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Something went wrong.Its not you, its us" });
  }
});

app.get("/api/shortUrl/:shortUrl", async (req: Request, res: Response) => {
  const shortUrl = req.params.shortUrl;
  const url = await prisma.url.findUnique({
    where: {
      shortUrl: shortUrl,
    },
  });
  if (url) {
    return res.redirect(url.longUrl);
  } else {
    return res
      .status(404)
      .json({
        msg: "URL not found",
      })
      .redirect("https://google.com");
  }
});
