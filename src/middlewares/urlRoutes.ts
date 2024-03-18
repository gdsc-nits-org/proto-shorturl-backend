import { Router, Request, Response } from 'express';
import { nanoid } from "nanoid";

import prisma from "prisma/prismaClient";

import { isAuthenticated } from "src/middlewares/isAuthenticate";

const router = Router();


router.post(
    "/api/shorten",
    isAuthenticated,
    async (req: Request, res: Response) => {
      const shortUrl = nanoid(6);
      const longUrl = req.body.originalUrl;
      const url = {
        longUrl,
        shortUrl,
      };
      // console.log(longUrl)
  
      const existingUrl = await prisma.url.findMany({
        where: {
          longUrl: longUrl,
        },
      });
  
      if (existingUrl[0]) {
        
        return res.status(403).json({
          originalUrl: existingUrl[0].longUrl,
          shortUrl: existingUrl[0].shortUrl,
          data: existingUrl,
        });
      }
  
      try {
        const result = await prisma.url.create({
          data: {
            longUrl: url.longUrl,
            shortUrl: url.shortUrl,
            userId: req.user.id
          },
        });
  
        if (result) {
          return res.status(201).json({
            message: "ShortUrl successfully created",
            url: result
          });
        } else {
          return res.status(501).json({ error: "Couldn't create shortUrl" });
        }
      } catch (error) {
        return res
          .status(500)
          .json({ error});
      }
    }
  );
  
  router.get("/api/shortUrl/:shortUrl", async (req: Request, res: Response) => {
    const shortUrl = req.params.shortUrl;
    const url = await prisma.url.findUnique({
      where: {
        shortUrl: shortUrl,
      },
    });
    if (url) {
      const updatedUrl = await prisma.url.update({
        where: {
          shortUrl: shortUrl,
        },
        data: {
          clickCount: url.clickCount + 1,
          // updatedtAt : new Date(),
        },
      });
      return res.redirect(updatedUrl.longUrl);
    } else {
      return res
        .status(404)
        .json({
          msg: "URL not found",
        })
        .redirect("https://google.com");
    }
  });
  
  export default router;
