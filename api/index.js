// Vercel serverless entry point for the Express backend.
// Vercel imports this file as a module and calls it as a serverless function,
// so we just export the Express app — no app.listen() needed here.
require('dotenv').config();

const app = require('../backend/src/server');

module.exports = app;
