// Import required modules
const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require('cors');
require("dotenv").config();
const authRoutes = require("./Routes/AuthRoutes");

// Create an Express app
const app = express();
app.use(express.json());
// Dynamic CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins
    callback(null, origin);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  credentials: true, // Allow credentials to be included in requests
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Set up static file serving in production
const __dirname1 = path.resolve();
if (process.env.DEPLOYMENT === 'true') {
  app.use(express.static(path.join(__dirname1, '/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname1, "build", "index.html"));
  });
}

// Define a route for authentication
app.use("/", authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Start the server and listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
