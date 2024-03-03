import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { nanoid } from "nanoid";
import prisma from "prisma/prismaClient";
import { validateInput } from "src/middlewares/middleware";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;
const secretKey = process.env.KEY;

app
  .use(cors())
  .use(helmet())
  .use(morgan("dev"))
  .use(express.json())
  .use(cookieParser());

//middleware
const isAuthenticated = async (req: Request, res: Response, next: Function) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, secretKey);
      req.user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (!req.user) {
        // User not found based on decoded user ID
        return res.status(401).json({ message: "Unauthorized - Invalid user" });
        // You can also redirect to the login page if needed
        // return res.redirect('/login');
      }
      next();
    } catch (error) {
      // console.error(error);
      if (error instanceof jwt.JsonWebTokenError) {
        // Invalid signature error
        return res.redirect("/logout");
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

app.get("/", async (req: Request, res: Response) => {
  const data = await prisma.url.findMany({
    // where: {
    //   userId:req.user.userId
    // }
  });

  return res.status(201).json({
    msg: "Success",
    request: req.body,
    data: data,
  });
});


app.listen(PORT, () => {
  console.log(`Service active on PORT ${PORT}`);
});

app.post(
  "/api/shorten",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const shortUrl = nanoid(6);
    const longUrl = req.body.originalUrl;
    const url = {
      longUrl,
      shortUrl,
    };

    const existingUrl = await prisma.url.findMany({
      where: {
        longUrl: longUrl,
        userId : req.user.id
      },
    });

    if (existingUrl[0] && existingUrl[0].userId === req.user.id) {
      return res.status(403).json({
        originalUrl: existingUrl[0].longUrl,
        shortUrl: `${req.baseUrl}/${existingUrl[0].shortUrl}`,
        data: existingUrl,
      });
    }

    try {
      const result = await prisma.url.create({
        data: {
          longUrl: url.longUrl,
          shortUrl: url.shortUrl,
          userId: req.user.id,
        },
      });

      if (result) {
        return res.status(201).json({
          message: "ShortUrl successfully created",
          url: result,
        });
      } else {
        return res.status(501).json({ error: "Couldn't create shortUrl" });
      }
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
);

app.get("/:shortUrl", async (req: Request, res: Response) => {
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
    return res.status(404).json({
      msg: "URL not found",
    });
  }
});

// Function to generate a random salt
function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

// Function to hash the password with salt
function hashPassword(password: string, salt: string): string {
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hashedPassword;
}

// Sign-up route
app.post("/signup", validateInput, async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Email already exists, redirect to the login page
      return res.redirect("/login");
    }

    // Generate a random salt
    const salt = generateSalt();

    // Hash the password with the generated salt
    const hashedPassword = hashPassword(password, salt);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        salt,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, secretKey, {
      expiresIn: "1h",
    });

    // Set cookie with the token
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });

    return res.json({
      message: "User signed up successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    // console.log(error);
    return res.json({ error });
  }
});

// Login route
app.post("/login", validateInput, async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user is already signed up
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: email }],
      },
    });

    if (!existingUser) {
      // User not found, display an error message
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    }

    // Hash the provided password with the stored salt
    const hashedPassword = hashPassword(password, existingUser.salt);

    // Check if the password is correct
    if (hashedPassword !== existingUser.password) {
      // Incorrect password, display an error message
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: existingUser.id }, secretKey, {
      expiresIn: "1h",
    });

    // Set cookie with the token
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });

    return res.json({ message: "Login successful", user: existingUser, token });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Logout route
app.get("/logout", ( res: Response) => {
  // Clear the JWT cookie on logout
  res.clearCookie("jwt");
  return res.json({ message: "Logout successful" });
});

app.post(
  "/api/manage",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const longUrl = data.originalUrl;
      const shortUrl = data.shortUrl;

      const existingShortUrl= await prisma.url.findFirst({
        where: {
          shortUrl: shortUrl
        }
      });

      if(existingShortUrl){
        return res.status(403).json({message : "Shortid already exists in our database. Sorry, Choose something else"})
      }

      const existingUrl = await prisma.url.findFirst({
        where: {
          longUrl: longUrl,
          userId: req.user.id,
        },
      });
      // console.log(existingUrl?.userId)
      // console.log( req.user)

      if (existingUrl && existingUrl.userId === req.user.id) {
        const updatedUrl = await prisma.url.update({
          where: {
            id:existingUrl.id
          },
          data: {
            shortUrl: shortUrl,
          },
        });
        // console.log(updatedUrl);

        return res.status(202).json({ message: "success", data: updatedUrl });
      }
      return res.status(404).json({ message: "URL does not exist" });
    } catch (error) {
      return res.status(500);
    }
  }
);
