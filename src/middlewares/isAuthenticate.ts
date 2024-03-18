import {  Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import prisma from "prisma/prismaClient";





//middleware
export const isAuthenticated = async (req: Request, res: Response, next: Function) => {

    const token = req.cookies.jwt;
    
    if (token) {
      try {
        const decoded: any = jwt.verify(token, "eahr;idbnpean/pwerinolg");
        req.user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });
        if (!req.user) {
          // User not found based on decoded user ID
          return res.status(401).json({ message: 'Unauthorized - Invalid user' });
          // You can also redirect to the login page if needed
          // return res.redirect('/login');
        }
        next();
      } catch (error) {
        // console.error(error);
        if (error instanceof jwt.JsonWebTokenError) {
          // Invalid signature error
         return res.redirect('/logout');
         // return res.status(401).json({ message: 'Unauthorized - Invalid token signature' });
          // You can also redirect to the login page if needed
          // return res.redirect('/login');
        }
        //  return res.redirect('/login');
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
      //  return res.redirect('/login');
    }
  };

  