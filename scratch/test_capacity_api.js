import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config({ path: '/Users/piyush/Desktop/Park Conscious/apps/events/.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { Event } = (await import('/Users/piyush/Desktop/Park Conscious/api/lib/models.js'));
  
  // Create a dummy event directly in DB
  const newEvent = await Event.create({
    title: "TEST CAPACITY",
    description: "TEST",
    date: "2026-05-05",
    capacity: 100,
    status: "published"
  });
  
  console.log("Created in DB with capacity:", newEvent.capacity);
  
  // Now fetch it via the API
  try {
     const { data } = await axios.get(`http://localhost:3000/api/events/${newEvent._id}`);
     console.log("Fetched via API capacity:", data.capacity);
  } catch (err) {
     console.error("API Fetch Error:", err.message);
  }
  
  // Clean up
  await Event.findByIdAndDelete(newEvent._id);
  console.log("Cleaned up");
  process.exit(0);
}
check();
