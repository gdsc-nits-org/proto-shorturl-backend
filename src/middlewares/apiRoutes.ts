import { Router, Request, Response } from 'express';

import prisma from "prisma/prismaClient";
import { isAuthenticated } from "src/middlewares/isAuthenticate";

const router = Router();


router.post("/api/manage", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const longUrl = data.originalUrl;
      const shortUrl = data.shortUrl;
      const existingUrl = await prisma.url.findFirst({
        where: {
          longUrl: longUrl,
          userId: req.user.userId
        },
      });
  
      if (existingUrl ) {
  
        const updatedUrl = await prisma.url.updateMany({
          where: {
            longUrl: longUrl,
            userId: req.user.userId
          },
          data: {
            shortUrl: shortUrl,
          },
        });
        return res.status(202).json({ message: "success" , data:updatedUrl});
      }
      return res.status(404).json({message:"URL does not exist"})
    } catch (error) {
      return res.status(500);
    }
  });

  export default router;
  