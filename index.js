// Vercel Serverless entry point – reuses the same Express app
process.on('unhandledRejection', (reason) => {
  console.error('[Vercel Serverless] Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Vercel Serverless] Uncaught Exception:', err);
});

const app = require('../app');
module.exports = app;
