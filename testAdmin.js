import mongoose from 'mongoose';
import connectDB from './api/lib/mongodb.js';
import { User, Owner } from './api/lib/models.js';

async function check() {
  await connectDB();
  const u = await User.findOne({ email: 'admin@parkconscious.com' });
  console.log("User:", u ? u.email : "Not found in User");
  const o = await Owner.findOne({ email: 'admin@parkconscious.com' });
  console.log("Owner:", o ? o.email : "Not found in Owner");
  mongoose.disconnect();
}
check();
