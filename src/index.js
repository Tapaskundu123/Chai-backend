// import express from 'express';
import dotenv from 'dotenv';
import ConnectDB from './db/index.js';
import app from './app.js';
dotenv.config(); // Load from .env file

// const App = express();

// MongoDB connection
ConnectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`✅ Server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
  });
