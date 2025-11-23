// MongoDB database initialization
import { connectMongoDB } from './mongodb.js';

// MongoDB connection initialization - models handle schema
export async function initDatabase() {
  try {
    await connectMongoDB();
    console.log('✅ MongoDB database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize MongoDB:', error);
    throw error;
  }
}

// Legacy exports for backwards compatibility (if needed)
export const db = null;
export const dbRun = null;
export const dbGet = null;
export const dbAll = null;

