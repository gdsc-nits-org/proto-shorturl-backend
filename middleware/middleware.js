const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl'); // Assuming you have a ShortUrl model

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/urlShortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware function
const urlShortenMiddleware = async (req, res, next) => {
  try {
    const userGivenUrl = req.body.url; // Assuming the user provides the URL in the request body

    // Check if the URL is already shortened
    const existingShortUrl = await ShortUrl.findOne({ originalUrl: userGivenUrl });

    if (existingShortUrl) {
      // URL is already shortened, respond with the existing short URL
      res.json({ shortUrl: existingShortUrl.shortUrl });
    } else {
      // URL is not yet shortened, generate a new short URL
      const newShortUrl = new ShortUrl({ originalUrl: userGivenUrl });

      // Save to the database
      await newShortUrl.save();

      // Respond with the new short URL
      res.json({ shortUrl: newShortUrl.shortUrl });
    }
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Example endpoint using the middleware
app.post('/api/shorten', urlShortenMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
