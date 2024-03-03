// middleware.ts
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
import  { Request, Response } from "express";


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



