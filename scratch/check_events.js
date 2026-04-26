import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/piyush/Desktop/Park Conscious/apps/events/.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { Booking, Event } = (await import('/Users/piyush/Desktop/Park Conscious/api/lib/models.js'));
  const events = await Event.find().sort({createdAt: -1}).limit(3);
  for(let e of events) {
    console.log(`Event: ${e.title}, Capacity: ${e.capacity}, Created: ${e.createdAt}`);
  }
  process.exit(0);
}
check();
