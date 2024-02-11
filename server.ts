import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createuser } from "src/controllers/createuser";
import { getuser } from "src/controllers/getusers";
import { getusermiddleware } from "src/middlewares/getuser";
import { nanoid } from "nanoid";
import prisma from "prisma/prismaClient";
import { validateInput } from "src/middlewares/middleware";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from "src/middlewares/middleware";
import cookieParser from "cookie-parser";
// import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app
  .use(cors())
  .use(helmet())
  .use(morgan("dev"))
  .use(express.json())
  .use(cookieParser());

app.get("/", async (req: Request, res: Response) => {
  const data = await prisma.url.findMany({});

  return res.status(201).json({
    msg: "Success",
    request: req.body,
    data: data,
  });
});

app.post("/createuser", createuser);

app.post("/getuser", getusermiddleware, getuser);

app.listen(PORT, () => {
  console.log(`Service active on PORT ${PORT}`);
});

app.post("/api/shorten", isAuthenticated, async (req: Request, res: Response) => {
  const shortUrl = nanoid(6);
  const longUrl = req.body.originalUrl;
  const url = {
    longUrl,
    shortUrl,
  };

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

// Sign-up route
app.post("/signup", validateInput, async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.render("/login");
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, "your-secret-key", {
      expiresIn: "1h",
    });

    // Set cookie with the token
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 }); // maxAge is in milliseconds (1 hour in this case)

    // console.log(newUser);
    return res.json({
      message: "User signed up successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
});

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

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      // Incorrect password, display an error message
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: existingUser.id }, "your-secret-key", {
      expiresIn: "1h",
    });

    // Set cookie with the token
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 }); // maxAge is in milliseconds (1 hour in this case)

    // Redirect to the /api/shorten route on successful login
    // Replace with your desired URL
    // res.redirect('/api/shorten'); // Replace with your desired URL

    return res.json({ message: "Login successful", user: existingUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Logout route
app.post("/logout", (req: Request, res: Response) => {
  // Clear the JWT cookie on logout
  res.clearCookie("jwt");
  return res.json({ message: "Logout successful" });
});

app.post("/api/manage", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const longUrl = data.originalUrl;
    const shortUrl = data.shortUrl;
    const existingUrl = await prisma.url.findMany({
      where: {
        longUrl: longUrl,
      },
    });

    if (existingUrl) {
      console.log(existingUrl);

      const updatedUrl = await prisma.url.updateMany({
        where: {
          longUrl: longUrl,
        },
        data: {
          shortUrl: shortUrl,
        },
      });
      return res.status(202).json({ message: "success" });
    }
    return res.status(404).json({message:"URL does not exist"})
  } catch (error) {
    return res.status(500);
  }
});
