require('dotenv').config();
const mongoose = require('mongoose');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const TARGET_ADMIN_ID = "69ceca5e49786720204265ac"; // System Administrator

async function runMigration() {
  console.log('--- STARTING EVENT OWNERSHIP REPAIR ---');
  
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // We use direct collection access to avoid schema validation issues during migration
    const EventCollection = conn.connection.db.collection('events');
    const BookingCollection = conn.connection.db.collection('bookings');

    // 1. Identify orphaned events
    const orphanedEvents = await EventCollection.find({ 
      $or: [
        { organizerId: { $exists: false } },
        { organizerId: null },
        { organizerId: "" }
      ] 
    }).toArray();

    console.log(`Found ${orphanedEvents.length} orphaned events.`);

    if (orphanedEvents.length > 0) {
      const eventIds = orphanedEvents.map(e => e._id);
      
      // 2. Update Events
      const eventResult = await EventCollection.updateMany(
        { _id: { $in: eventIds } },
        { 
          $set: { 
            organizerId: new mongoose.Types.ObjectId(TARGET_ADMIN_ID),
            updatedAt: new Date()
          } 
        }
      );
      console.log(`Successfully updated ${eventResult.modifiedCount} event records.`);

      // 3. Update related bookings (to ensure they surface for the same organizer)
      // Note: In some schemas, bookings also track organizerId or derive it.
      // We will update organizerId in bookings if it exists and is null.
      const bookingResult = await BookingCollection.updateMany(
        { 
          eventId: { $in: eventIds },
          $or: [
            { organizerId: { $exists: false } },
            { organizerId: null }
          ]
        },
        { 
          $set: { 
            organizerId: new mongoose.Types.ObjectId(TARGET_ADMIN_ID)
          } 
        }
      );
      console.log(`Successfully updated ${bookingResult.modifiedCount} related booking records.`);
    }

    console.log('--- REPAIR COMPLETE ---');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runMigration();
