// middleware.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import express , { Request, Response } from "express";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"



// Middleware for input validation
export const validateInput = (req: Request, res: Response, next ) => {
  const { username, email, password } = req.body;

  // Check if username is invalid (null, undefined, or blank)
  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ message: 'Invalid username' });
  }

  // Check if email is invalid (null, undefined, or not a valid email format)
  if (!email || typeof email !== 'string' || !validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  // Check if password is invalid (null, undefined, or blank)
  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ message: 'Invalid password' });
  }

  // If all input is valid, proceed to the next middleware or route handler
  next();
};

// Function to validate email format
 const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

//middleware
export const isAuthenticated = async (req: Request, res: Response, next: Function) => {
  const { token } = req.cookies;
  if (token) {
    try {
      const decoded: any= jwt.verify(token, 'your-secret-key');
      req.user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      next();
    } catch (error) {
      console.error(error);
     return res.redirect('/login');
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' });
   return res.redirect('/login');
  }
};


// // Example usage of the middleware in the /login route
// app.post('/login', validateInput, async (req: Request, res: Response) => {
//   // The request will only reach here if the input is valid
//   const { username, email, password } = req.body;

//   // Your login logic here
//   // ...
  
//   res.json({ message: 'Login successful' });
// });



// const urlShortenMiddleware = async (req: any, res: any, next: any) => {
//   try {
//     const userGivenUrl = req.body.url;
        
//     // Check if the URL is already shortened
//     const existingShortUrl = await prisma.url.findUnique({
//       where : { longUrl : userGivenUrl },
//     });

//     if (existingShortUrl) {
//       // URL is already shortened, respond with the existing short URL
//       res.json({ shortUrl: existingShortUrl.shortUrl });
//     } else {
//       // URL is not yet shortened, generate a new short URL
//       const shortUrl = nanoid(6); // Implement your logic for generating short URLs

//       // Create a new URL entry in the database
//       const newUrl = await prisma.url.create({
//         data: { longUrl: userGivenUrl, shortUrl },
//       });

//       // Respond with the new short URL
//       res.json({ shortUrl: newUrl.shortUrl });
//     }
//   } catch (error) {
//     // Handle errors
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
