import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  parkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parking",
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Optional reference if booking is tied to an account
    required: false,
  },
  locationName: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  amount: {
    type: String, // e.g., '₹120' or 'Contact'
    required: true,
  },
  status: {
    type: String,
    default: "Confirmed",
  }
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
