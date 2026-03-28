import express from 'express';
import Parking from '../models/Parking.js';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/authMiddleware.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// @desc    Get all parkings
// @route   GET /api/parking
router.get('/', async (req, res) => {
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
    // Fallback to local JSON if DB is unavailable (Consider disabling in true production)
    if (process.env.NODE_ENV !== 'production') {
       try {
        const dataPath = path.join(process.cwd(), "data", "parkings.json");
        const parkings = JSON.parse(fs.readFileSync(dataPath));
        return res.json(parkings);
      } catch (e) {
        console.error("Fallback JSON Error:", e);
      }
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Get dashboard stats for owner
// @route   GET /api/owner/:ownerId/dashboard
// @access  Private (Owner)
router.get('/owner/:ownerId/dashboard', protect, async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    // Authorization Check: Ensure the logged in owner is the one requested
    if (req.user._id.toString() !== ownerId) {
       return res.status(401).json({ message: "Not authorized to view these stats" });
    }

    const parkings = await Parking.find({ owner: ownerId });
    const parkingIds = parkings.map(p => p._id);
    const bookings = await Booking.find({ parkingId: { $in: parkingIds } });
    
    let todayRevenue = 0;
    let todayEntries = 0;
    
    bookings.forEach(b => {
      todayEntries += 1;
      // Safer numeric handling
      let amt = 0;
      if (typeof b.amount === 'number') {
        amt = b.amount;
      } else if (typeof b.amount === 'string') {
        amt = Number(b.amount.replace(/[^0-9.]/g, '')) || 0;
      }
      todayRevenue += amt;
    });
    
    res.json({
      totalParkings: parkings.length,
      totalEntries: todayEntries,
      revenueToday: todayRevenue,
      parkings: parkings
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Add new parking location
// @route   POST /api/owner/:ownerId/parkings
// @access  Private (Owner)
router.post('/owner/:ownerId/parkings', protect, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { Location, Latitude, Longitude, PricePerHour, TotalSlots, Type } = req.body;
    
    if (req.user._id.toString() !== ownerId) {
       return res.status(401).json({ message: "Not authorized to add parking for this ID" });
    }

    if (!Location || Latitude === undefined || Longitude === undefined) {
       return res.status(400).json({ message: "Location, Latitude, and Longitude are required." });
    }

    // Basic range validation for coordinates
    const lat = parseFloat(Latitude);
    const lng = parseFloat(Longitude);
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
       return res.status(400).json({ message: "Invalid Latitude or Longitude coordinates." });
    }
    
    const newParking = await Parking.create({
       owner: ownerId,
       Location,
       Latitude: lat,
       Longitude: lng,
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

// @desc    Get owner's parkings
// @route   GET /api/owner/:ownerId/parkings
// @access  Private (Owner)
router.get('/owner/:ownerId/parkings', protect, async (req, res) => {
  try {
     if (req.user._id.toString() !== req.params.ownerId) {
        return res.status(401).json({ message: "Not authorized" });
     }
     const parkings = await Parking.find({ owner: req.params.ownerId });
     res.json(parkings);
  } catch (err) { 
    res.status(500).json({ message: "Server Error" }); 
  }
});

export default router;
