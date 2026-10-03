const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI || mongoURI === 'your_mongodb_atlas_uri_here') {
    console.log('⚠️  No MongoDB URI provided. Running in demo mode with in-memory fallback.');
    console.log('   Set MONGO_URI in .env for persistent storage.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Falling back to in-memory mode for demo.');
    return false;
  }
};

module.exports = connectDB;
