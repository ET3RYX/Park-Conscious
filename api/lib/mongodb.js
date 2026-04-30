import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase(targetDb = 'backstage_events') {
  if (!MONGODB_URI) {
    const error = new Error("MONGODB_URI_MISSING");
    error.missingConfig = true;
    throw error;
  }

  // Use a separate cache entry for each database to prevent data mixing
  if (!global.mongooseCache) {
    global.mongooseCache = {};
  }
  
  if (!global.mongooseCache[targetDb]) {
    global.mongooseCache[targetDb] = { conn: null, promise: null };
  }

  const cache = global.mongooseCache[targetDb];

  // Robust check: Ensure the default connection is actually pointing to our target
  if (cache.conn && mongoose.connection.readyState === 1 && mongoose.connection.name === targetDb) {
    return cache.conn;
  }

  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
      dbName: targetDb, // Force the specific database name
    };

    console.log(`[MONGODB] Connecting to database: ${targetDb}`);
    cache.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }

  return cache.conn;
}

export default connectToDatabase;
