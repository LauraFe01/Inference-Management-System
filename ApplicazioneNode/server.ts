// Import necessary modules from express and body-parser
import express from 'express';
import bodyParser from 'body-parser';

// Import custom functions and modules
import { initModels } from './init_database';
import datasetRoutes from './Routes/datasetRoutes';
import userRoutes from './Routes/userRoutes';
import spectrogramRoutes from './Routes/spectrogramRoutes';
import * as dotenv from 'dotenv';
import errorHandler from './Errors/errorHandler';
import { checkValidJson } from './middleware';
import seed from './Seeders/userSeed';
import { cleanQueue } from './Utils/utils';

// Load environment variables from .env file
dotenv.config();

// Create an instance of the Express application
const app = express();

// Get the port from the .env configuration file and convert it to a number
const port: number = Number(process.env.SERVER_PORT);

// Command to populate the database
// seed()

//Command to clean queue
// cleanQueue()

// Configure the application to use body-parser for JSON requests
app.use(bodyParser.json());

// Middleware to check valid JSON format of incoming requests
app.use(checkValidJson);

// Add application routes
app.use(datasetRoutes);
app.use(userRoutes);
app.use(spectrogramRoutes);

// Middleware for error handling
app.use(errorHandler);

/**
 * Initializes database models and starts the server
 */
(async () => {
  try {
    // Initialize database models
    await initModels();
    
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
})();