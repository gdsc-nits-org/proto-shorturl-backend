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
// import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()).use(helmet()).use(morgan("dev")).use(express.json());

app.get("/",async (req: Request, res: Response) => {
  

  const data=await prisma.url.findMany({});
  
  return res.status(201).json({
    msg: "Success",
    request: req.body,
    data:data
  });
});

app.post("/createuser", createuser);

app.post("/getuser", getusermiddleware, getuser);

app.listen(PORT, () => {
  console.log(`Service active on PORT ${PORT}`);
});

app.post("/api/shorten", async (req: Request, res: Response) => {
  const shortUrl = nanoid(6);
  const longUrl = req.body.originalUrl;
  const url = {
    longUrl,
    shortUrl,
  };

  const existingUrl = await prisma.url.findMany({
    where: {
      longUrl: longUrl
    },
  });

  console.log(existingUrl)
  if(existingUrl){
    return res.status(403).json({
      originalUrl: existingUrl[0].longUrl,
      shortUrl: existingUrl[0].shortUrl,
      data: existingUrl
      
    })
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
    const updatedUrl=await prisma.url.update({
      where:{
        shortUrl: shortUrl
      },
      data:{
        clickCount: url.clickCount +1,
      }
    })
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
app.post('/signup', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // Check if the email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    // Email already exists, redirect to the login page
    return res.status(403);
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

  // console.log(newUser);
  return res.json({ message: 'User signed up successfully', user: newUser });
  } catch (error) {
    console.log(error);
    return res.json({error})

  }

  
});


app.post('/login', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  // Check if the user is already signed up
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username },
        { email: email },
      ],
    },
  });

  if (!existingUser) {
    // User not found, display an error message
    return res.status(401).json({ message: 'Incorrect username or password' });
  }

  // Check if the password is correct
  const passwordMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordMatch) {
    // Incorrect password, display an error message
    return res.status(401).json({ message: 'Incorrect username or password' });
  }

  // Redirect to the /api/shorten route on successful login
   // Replace with your desired URL
});

