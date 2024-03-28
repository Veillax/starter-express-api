const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port

const allowedOrigins = ['https://veillax.com', 'http://localhost:3000']; // Replace 3000 with your frontend port

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin (localhost development)
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  }
}));

app.get('/extract-urls', async (req, res) => {
  const albumUrl = req.query.url; // Get album URL from query parameter

  if (!albumUrl) {
    return res.status(400).send('Missing album URL');
  }

  try {
    const response = await axios.get(albumUrl);
    const $ = cheerio.load(response.data);

    const imageUrls = [];
    $('img[src]').each((i, element) => {
      const imageUrl = $(element).attr('src');
      imageUrls.push(imageUrl);
    });

    res.json({ imageUrls });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to extract URLs');
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
