/**
 * seedParkings.js
 * Run: node backend/data/seedParkings.js
 * Seeds the parkings.json file into the MongoDB `parkings` collection.
 * Safe to run multiple times — it checks for duplicate IDs first.
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

if (!process.env.MONGODB_URI) {
  console.error("❌  MONGODB_URI not found in .env");
  process.exit(1);
}

// Inline the schema so we don't import from backend
const parkingSchema = new mongoose.Schema({
  ID: String,
  Location: { type: String, required: true },
  Latitude: { type: Number, required: true },
  Longitude: { type: Number, required: true },
  Authority: String,
  Zone: String,
  Status: String,
  PricePerHour: Number,
  TotalSlots: Number,
  Type: String,
}, { timestamps: false });

const Parking = mongoose.model("Parking", parkingSchema);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅  Connected to MongoDB");

  const jsonPath = path.join(__dirname, "parkings.json");
  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`📂  Loaded ${raw.length} records from parkings.json`);

  let inserted = 0, skipped = 0;

  for (const p of raw) {
    const existingId = p.ID?.toString();
    // Skip if already in DB
    const exists = await Parking.findOne({ ID: existingId });
    if (exists) { skipped++; continue; }

    await Parking.create({
      ID: existingId,
      Location: p.Location,
      Latitude: Number(p.Latitude),
      Longitude: Number(p.Longitude),
      Authority: p.Authority || "Public",
      Zone: p.Zone || null,
      Status: p.Status || "Active",
      PricePerHour: p.PricePerHour ? Number(p.PricePerHour) : null,
      TotalSlots: p.TotalSlots ? Number(p.TotalSlots) : null,
      Type: p.Type || "Public Parking",
    });
    inserted++;
  }

  console.log(`✅  Inserted: ${inserted} | Skipped (already existed): ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
