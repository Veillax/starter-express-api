const googlePhotosAlbumImageUrlFetch = require("google-photos-album-image-url-fetch");
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const main = async (album) => {
    try {
        const re = await googlePhotosAlbumImageUrlFetch.fetchImageUrls(album);
        const photoUrls = re.map((item) => item.url); 
        return photoUrls;
    } catch (error) {
        console.error('Error fetching image URLs:', error.message);
    }
};

app.get('/extract', async (req, res) => {
    try {
        const albumUrl = req.query.url
        if (!albumUrl) {
            return res.status(400).json({ error: 'Missing album URL' })
        }
        const photoUrls = await main(albumUrl);
        return res.status(200).json({"photoUrls": photoUrls})

    } catch (err) { console.error(err) }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

