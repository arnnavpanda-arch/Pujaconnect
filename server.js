const app = require('./app');
const { connectDB } = require('./lib/db');
const PORT = process.env.PORT || 5500;

// Connect to MongoDB immediately on server startup
connectDB()
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
  })
  .catch((err) => {
    console.error('⚠️ Initial MongoDB connection error (will retry automatically on request):', err.message);
  });

app.listen(PORT, () => {
  console.log(`ॐ PujaConnect running on http://localhost:${PORT}`);
});
