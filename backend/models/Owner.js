import mongoose from "mongoose";
import bcrypt from "bcrypt";

const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  googleId: { type: String },
  role: { type: String, default: "owner" },
  createdAt: { type: Date, default: Date.now }
});

ownerSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) { next(error); }
});

export default mongoose.model("Owner", ownerSchema);
