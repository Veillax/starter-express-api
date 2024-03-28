const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const request = require('request');
const os = require('os');

// Define schema for photo data
const photoSchema = new mongoose.Schema({
  link: { type: String, required: true },
  title: String,
  description: String
});

// Create Mongoose Model for photos
const Photo = mongoose.model('Photo', photoSchema);

const uri = process.env.MONGO_URI;

// Connect to MongoDB database
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

const app = express();

app.use(express.json());
app.use(cors());

const verifyBasicAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
    if (req.headers.authorization.substring(6) === process.env.AUTH_PASSWORD) {
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
  console.log(`New Photo: ${req.body.link} - "${req.body.title}" - "${req.body.description}"`)
  newPhoto.save()
    .then(savedPhoto => res.json({ message: 'Photo added successfully', id: savedPhoto._id }))
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
        .on('response', function (response) {
          // Set the content type to the image's MIME type
          res.set('Content-Type', response.headers['content-type']);
        })
        .on('error', function (err) {
          // Handle any errors that occur during the request
          res.status(500).json({ error: err.message });
        })
        .pipe(res); // Pipe the image data to the response
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/ip', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = '127.0.0.1'; // Default to localhost

  // Iterate over network interfaces to find the external IP address
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      // Skip over non-IPv4 and internal (i.e., 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        ipAddress = net.address;
        break;
      }
    }
  }

  res.json({ ip: ipAddress });
});


app.listen(3000, () => console.log('Server listening on port 3000'));
