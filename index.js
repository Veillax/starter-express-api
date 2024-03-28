const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const request = require('request');

// Define schema for photo data
const photoSchema = new mongoose.Schema({
  link: { type: String, required: true },
  title: String,
  description: String
});

// Create Mongoose Model for photos
const Photo = mongoose.model('Photo', photoSchema);

const uri = "mongodb+srv://veillax:to84acY0H4SuUF9b@veillax.8tjjxqb.mongodb.net/Web?retryWrites=true&w=majority&appName=veillax";

// Connect to MongoDB database
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

const app = express();

app.use(express.json());
app.use(cors());

const verifyBasicAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
    if (req.headers.authorization.substring(6) === "MDE4ZTgyNmUtMzQ0My03MDY2LWFhYWYtZTE1NmFlNzk4MGZhOjAxOGU4MjY0LTk2NzktNzYzNi1iYzI0LTQyY2YyNzAwYjYxNC0wMThlODI2ZS03OTU3LTc4YTktYjk1Yy1mZmM1ODI5NDMyNTUtMDE4ZTgyNmUtNzk1Ny03M2EwLTljYTgtYTRiNjM2MDBlOGExLTAxOGU4MjZlLTc5NTctNzk1Zi1iNjlhLWNmM2RlYzhjOGVlOA0K") {
      next();
    } else { return res.status(401).send({ message: 'Unauthorized!' }); }
  }
};


// Add Photo (replace with actual logic for authentication and data validation)
app.post('/api/photos', verifyBasicAuth, (req, res) => {
  const newPhoto = new Photo({
    link: req.body.link,
    title: req.body.title,
    description: req.body.description
  });
  newPhoto.save()
    .then(savedPhoto => res.json({ message: 'Photo added successfully', id: savedPhoto._id }))
    .then(savedPhoto => console.log(`New Photo: ${req.body.link} - "${req.body.title}" - "${req.body.description}"`))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Edit Photo (find by id and update)
app.put('/api/photos/:id', verifyBasicAuth, (req, res) => {
  const photoId = req.params.id;
  const update = req.body;
  Photo.findByIdAndUpdate(photoId, update, { new: true })
    .then(photo => {
      if (!photo) {
        return res.status(404).json({ message: 'Photo not found' });
      }
      res.json(photo);
      console.log(`Updated Photo: ${req.params.id} - ${req.body}`)
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Delete Photo (find by id and remove)
app.delete('/api/photos/:id', verifyBasicAuth, (req, res) => {
  const photoId = req.params.id;
  Photo.findByIdAndDelete(photoId)
    .then(photo => {
      if (!photo) {
        return res.status(404).json({ message: 'Photo not found' });
      }
      res.json({ message: 'Photo deleted successfully' });
      console.log(`Deleted Photo: ${req.params.id}`)
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/photos', (req, res) => {
  Photo.find({})
    .then(photos => res.json(photos))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Get a single photo by ID
app.get('/api/photos/:id', (req, res) => {
  const photoId = req.params.id;
  Photo.findById(photoId)
     .then(photo => {
       if (!photo) {
         return res.status(404).json({ message: 'Photo not found' });
       }
       console.log(`Image: ${req.params.id} - ${photo.link}`)
       // Use the 'request' library to fetch the image
       request.get(photo.link)
         .on('response', function(response) {
           // Set the content type to the image's MIME type
           res.set('Content-Type', response.headers['content-type']);
         })
         .on('error', function(err) {
           // Handle any errors that occur during the request
           res.status(500).json({ error: err.message });
         })
         .pipe(res); // Pipe the image data to the response
     })
     .catch(err => res.status(500).json({ error: err.message }));
 });
 
app.listen(3000, () => console.log('Server listening on port 3000'));
