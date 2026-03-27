import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import Waitlist from "./models/Waitlist.js";
import Contact from "./models/Contact.js";
import User from "./models/User.js";
import Owner from "./models/Owner.js";
import Parking from "./models/Parking.js";
import Booking from "./models/Booking.js";
import bcrypt from "bcrypt";

dotenv.config();

// Connect to MongoDB
// Only connect if MONGODB_URI is provided to avoid crashing if user hasn't set it yet
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.log("⚠️  MONGODB_URI not found in .env. Database features will not work.");
}

const app = express();
app.use(cors());
app.use(express.json());

// serve parking data - from MongoDB (all parkings: seeded + owner-added)
app.get("/api/parking", async (req, res) => {
  try {
    const dbParkings = await Parking.find({});
    const mapped = dbParkings.map(p => ({
      ID: p.ID || p._id.toString(),
      Location: p.Location,
      Latitude: p.Latitude,
      Longitude: p.Longitude,
      Authority: p.Authority,
      Zone: p.Zone,
      Status: p.Status,
      Type: p.Type,
      PricePerHour: p.PricePerHour,
      TotalSlots: p.TotalSlots,
    }));
    res.json(mapped);
  } catch (error) {
    console.error("Fetch Parkings Error:", error);
    // Fallback to local JSON if DB is unavailable
    try {
      const dataPath = path.join(process.cwd(), "data", "parkings.json");
      const parkings = JSON.parse(fs.readFileSync(dataPath));
      res.json(parkings);
    } catch {
      res.status(500).json({ message: "Server Error" });
    }
  }
});

// Waitlist API
app.post("/api/waitlist", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const start = Date.now();
    // Check if email already exists
    const existing = await Waitlist.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already on waitlist" });
    }

    const waitlistEntry = await Waitlist.create({ email });
    res.status(201).json({ message: "Successfully joined waitlist", data: waitlistEntry });
  } catch (error) {
    console.error("Waitlist Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get Waitlist Data
app.get("/api/waitlist", async (req, res) => {
  try {
    const list = await Waitlist.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Contact API
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, role, message } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    const contactEntry = await Contact.create({
      name,
      email,
      role,
      message
    });

    res.status(201).json({ message: "Message sent successfully", data: contactEntry });
  } catch (error) {
    console.error("Contact Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Contact Data
app.get("/api/contact", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Event API
import Event from "./models/Event.js";

// Get All Events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("Fetch Events Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Create Event
app.post("/api/events", async (req, res) => {
  try {
    const { name, category, venue, venueCity, attendees, image, badge } = req.body;

    if (!name || !category || !venue) {
      return res.status(400).json({ message: "Name, category, and venue are required" });
    }

    const eventEntry = await Event.create({
      name,
      category,
      venue,
      venueCity,
      attendees,
      image,
      badge
    });

    res.status(201).json({ message: "Event created successfully", data: eventEntry });
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// User Authentication APIs
// Standard Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = await User.create({ name, email, password });
    res.status(201).json({ message: "User created successfully", user: { name: user.name, email: user.email }});
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Standard Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.password) {
      return res.status(400).json({ message: "Please sign in using Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Logged in successfully", user: { name: user.name, email: user.email }});
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Google OAuth Login
app.post("/api/auth/google", async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, googleId });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
    
    res.json({ message: "Logged in with Google", user: { name: user.name, email: user.email }});
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Owner Authentication APIs
app.post("/api/owner/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
    
    let owner = await Owner.findOne({ email });
    if (owner) return res.status(400).json({ message: "Owner already exists" });

    owner = await Owner.create({ name, email, password });
    res.status(201).json({ message: "Created successfully", user: { id: owner._id, name: owner.name, email: owner.email }});
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/owner/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });
    if (!owner) return res.status(400).json({ message: "Invalid credentials" });
    if (!owner.password) return res.status(400).json({ message: "Please sign in using Google." });

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Logged in successfully", user: { id: owner._id, name: owner.name, email: owner.email }});
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/owner/google", async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    let owner = await Owner.findOne({ email });
    if (!owner) {
      owner = await Owner.create({ name, email, googleId });
    } else if (!owner.googleId) {
      owner.googleId = googleId;
      await owner.save();
    }
    res.json({ message: "Logged in with Google", user: { id: owner._id, name: owner.name, email: owner.email }});
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// Advanced Owner Features
// 1. Dashboard Stats
app.get("/api/owner/:ownerId/dashboard", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const parkings = await Parking.find({ owner: ownerId });
    
    // Extract parking IDs to find related bookings
    const parkingIds = parkings.map(p => p._id);
    const bookings = await Booking.find({ parkingId: { $in: parkingIds } });
    
    // Mocking revenue processing logic
    let todayRevenue = 0;
    let todayEntries = 0;
    
    // For realism, let's tally all completed/confirmed bookings
    bookings.forEach(b => {
      todayEntries += 1;
      let amtStr = b.amount || '0';
      amtStr = amtStr.replace(/[^0-9]/g, '');
      todayRevenue += Number(amtStr);
    });
    
    res.json({
      totalParkings: parkings.length,
      totalEntries: todayEntries,
      revenueToday: todayRevenue,
      parkings: parkings
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// 2. Manage Parkings
app.post("/api/owner/:ownerId/parkings", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { Location, Latitude, Longitude, PricePerHour, TotalSlots, Type } = req.body;
    
    if (!Location || !Latitude || !Longitude) {
       return res.status(400).json({ message: "Location, Latitude, and Longitude are required." });
    }
    
    const newParking = await Parking.create({
       owner: ownerId,
       Location,
       Latitude: parseFloat(Latitude),
       Longitude: parseFloat(Longitude),
       PricePerHour: PricePerHour ? parseFloat(PricePerHour) : null,
       TotalSlots: TotalSlots ? parseInt(TotalSlots) : null,
       Type: Type || "Private Parking"
    });
    
    res.status(201).json({ message: "Parking added successfully", parking: newParking });
  } catch (error) {
    console.error("Add Parking Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/owner/:ownerId/parkings", async (req, res) => {
  try {
     const parkings = await Parking.find({ owner: req.params.ownerId });
     res.json(parkings);
  } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

// 3. View Booking Logs
app.get("/api/owner/:ownerId/logs", async (req, res) => {
  try {
     const bookings = await Booking.find({ ownerId: req.params.ownerId }).sort({ createdAt: -1 });
     res.json(bookings);
  } catch (error) {
     res.status(500).json({ message: "Server Error" });
  }
});


// health check
app.get("/", (req, res) => res.send("✅ ParkFinder backend running!"));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
