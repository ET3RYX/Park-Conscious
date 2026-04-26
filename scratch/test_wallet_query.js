import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/piyush/Desktop/Park Conscious/apps/events/.env.local' });

async function testFetch() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { Booking, Owner, User, Event } = (await import('/Users/piyush/Desktop/Park Conscious/api/lib/models.js'));
  
  const targetEmail = "kumarpiyush2k6@gmail.com";
  const userId = "69bff106e4898e7be1fa910b"; // From earlier check

  let query = { status: { $in: ["Confirmed", "confirmed"] } };
            
  const allOwners = await Owner.find({ email: targetEmail }).select('_id uid').lean();
  const allUsers = await User.find({ email: targetEmail }).select('_id uid').lean();
  
  const allIds = new Set();
  if (userId && userId !== 'undefined') allIds.add(String(userId));
  [...allOwners, ...allUsers].forEach(u => {
      if (u._id) allIds.add(String(u._id));
      if (u.uid) allIds.add(String(u.uid));
  });
  
  query.$or = [
      { userId: { $in: Array.from(allIds) } },
      { email: new RegExp(`^${targetEmail}$`, 'i') }
  ];

  console.log("Executing Query:", JSON.stringify(query, null, 2));

  const bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();
  console.log("Bookings returned:", bookings.length);
  for(let b of bookings) {
      console.log(`- Booking ID: ${b._id}, Event ID: ${b.eventId}, Status: ${b.status}`);
  }
  
  process.exit(0);
}
testFetch();
