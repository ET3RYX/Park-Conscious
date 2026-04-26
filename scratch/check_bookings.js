import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/piyush/Desktop/Park Conscious/apps/events/.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { Booking, Event } = (await import('/Users/piyush/Desktop/Park Conscious/api/lib/models.js'));
  const events = await Event.find().sort({createdAt: -1}).limit(1);
  const event = events[0];
  console.log("Latest Event:", event.title, "Capacity:", event.capacity);
  const bookings = await Booking.find({eventId: event._id});
  console.log("Bookings count:", bookings.length);
  process.exit(0);
}
check();
