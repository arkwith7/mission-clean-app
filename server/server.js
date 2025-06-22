const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('./database'); // Initializes database connection and tables

const bookingRoutes = require('./routes/booking');
// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MissionClean API',
    version: '1.0.0',
    description: 'API documentation for Mission Clean aircon cleaning service backend'
  },
  servers: [
    { url: `http://localhost:${process.env.PORT || 3001}` }
  ],
};
const swaggerOptions = {
  swaggerDefinition,
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

const app = express();
const PORT = process.env.PORT || 3001;

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// API Routes
app.use('/api/bookings', bookingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Mission Clean API is running...');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});