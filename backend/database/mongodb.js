import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env file');
}

let cachedConnection = null;

export async function connectMongoDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      socketTimeoutMS: 45000,
    });

    cachedConnection = connection;
    
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${connection.connection.db.databaseName}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedConnection = null;
    });

    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectMongoDB() {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
    console.log('MongoDB disconnected');
  }
}

export async function testConnection() {
  try {
    const connection = await connectMongoDB();
    const collections = await connection.connection.db.listCollections().toArray();
    console.log(`📁 Collections in database: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

