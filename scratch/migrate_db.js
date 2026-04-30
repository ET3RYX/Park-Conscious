import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing!");
  process.exit(1);
}

async function migrate() {
  try {
    console.log("Connecting to source cluster...");
    // Use the primary connection to get the source DB
    const conn = await mongoose.connect(MONGODB_URI);
    const sourceDb = conn.connection.db;
    
    const oldDbName = conn.connection.name || 'test';
    console.log(`Source Database: ${oldDbName}`);

    // Create separate connections for the targets
    const eventsConn = conn.connection.useDb('backstage_events');
    const parkingConn = conn.connection.useDb('park_conscious');

    const collections = await sourceDb.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`Found ${collectionNames.length} collections. Starting migration...`);

    for (const name of collectionNames) {
      // Skip system collections
      if (name.startsWith('system.')) continue;
      
      console.log(`Processing collection: ${name}...`);
      const data = await sourceDb.collection(name).find({}).toArray();
      
      if (data.length === 0) {
        console.log(`- ${name} is empty, skipping.`);
        continue;
      }

      // Logic for splitting collections
      if (name.toLowerCase() === 'bookings') {
        const eventBookings = data.filter(b => (b.eventId || b.ticketId) && !b.parkingId);
        const parkingBookings = data.filter(b => b.parkingId);
        const ambiguousBookings = data.filter(b => !b.eventId && !b.parkingId && !b.ticketId);

        if (eventBookings.length > 0) {
          await eventsConn.collection(name).insertMany(eventBookings);
          console.log(`  -> Moved ${eventBookings.length} bookings to backstage_events`);
        }
        if (parkingBookings.length > 0) {
          await parkingConn.collection(name).insertMany(parkingBookings);
          console.log(`  -> Moved ${parkingBookings.length} bookings to park_conscious`);
        }
        if (ambiguousBookings.length > 0) {
          await eventsConn.collection(name).insertMany(ambiguousBookings);
          console.log(`  -> Moved ${ambiguousBookings.length} untagged bookings to backstage_events (Safe Default)`);
        }
      } 
      else if (['parkings', 'accesslogs'].includes(name.toLowerCase())) {
        await parkingConn.collection(name).insertMany(data);
        console.log(`  -> Moved ${data.length} records to park_conscious`);
      }
      else if (['events', 'owners', 'users', 'eventrequests', 'systemlogs', 'contacts', 'comments', 'discussions'].includes(name.toLowerCase())) {
        await eventsConn.collection(name).insertMany(data);
        console.log(`  -> Moved ${data.length} records to backstage_events`);
      }
      else {
        // Copy others to both or events
        await eventsConn.collection(name).insertMany(data);
        console.log(`  -> Defaulted ${data.length} records to backstage_events`);
      }
    }

    console.log("\n------------------------------------");
    console.log("MIGRATION SUCCESSFUL");
    console.log("Your data has been split into 'backstage_events' and 'park_conscious'.");
    console.log("------------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("Migration Failed:", err);
    process.exit(1);
  }
}

migrate();
