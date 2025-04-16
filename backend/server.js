// app.js
require('dotenv').config();
require('express-async-errors');

// Express
const express = require('express');
const app = express();

// Security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

// Database
const connectDB = require('./db/connect');

// Authentication middleware
const authenticateUser = require('./middleware/authentication');

// Routers
const authRouter = require('./routes/auth');
const transactionsRouter = require('./routes/transactions');
const budgetsRouter = require('./routes/budgets');

// Error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// Security Middleware
app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());

// Express middleware
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/transactions', authenticateUser, transactionsRouter);
app.use('/api/v1/budgets', authenticateUser, budgetsRouter);

// Home route
app.get('/', (req, res) => {
  res.send('<h1>Financial Tracker API</h1><a href="/api-docs">Documentation</a>');
});

// Error handling middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
