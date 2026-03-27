import mongoose from "mongoose";

const parkingSchema = new mongoose.Schema({
  // Stored ID from original JSON (for deduplication during seeding)
  ID: { type: String, default: null },

  // Owner (null for seeded public parkings)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
    default: null,
  },
  Location: { type: String, required: true },
  Latitude: { type: Number, required: true },
  Longitude: { type: Number, required: true },
  PricePerHour: { type: Number, default: null },
  TotalSlots: { type: Number, default: null },
  Type: { type: String, default: "Public Parking" },
  Authority: { type: String, default: "Public" },
  Zone: { type: String, default: null },
  Status: { type: String, default: "Active" },
}, { timestamps: true });

export default mongoose.models.Parking || mongoose.model("Parking", parkingSchema);
