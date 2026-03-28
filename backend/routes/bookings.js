import express from 'express';
import Booking from '../models/Booking.js';
import Parking from '../models/Parking.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
router.post('/', protect, async (req, res) => {
  try {
    const { parkingId, ownerId, locationName, vehicleType, vehicleNumber, startTime, endTime, amount } = req.body;
    
    if (!parkingId || !locationName || !vehicleNumber) {
        return res.status(400).json({ message: 'Parking ID, Location, and Vehicle Number are required' });
    }

    // Availability Check (Overbooking Prevention)
    const parking = await Parking.findById(parkingId).catch(() => null);
    if (parking && parking.TotalSlots !== null) {
      const activeBookingsCount = await Booking.countDocuments({ 
        parkingId: String(parkingId), 
        status: "Confirmed" 
      });
      
      if (activeBookingsCount >= parking.TotalSlots) {
        return res.status(400).json({ 
          message: `Parking is full. Only ${parking.TotalSlots} slots were available and all are currently booked.` 
        });
      }
    }
    
    const booking = await Booking.create({
        parkingId: String(parkingId),
        ownerId: ownerId ? String(ownerId) : null,
        userId: req.user._id, // Set from JWT protect middleware
        locationName,
        vehicleType,
        vehicleNumber,
        startTime,
        endTime,
        amount,
        status: "Confirmed"
    });
    
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    console.error("Booking Create Error:", err);
    res.status(500).json({ message: 'Failed to create booking', error: err.message });
  }
});

// @desc    Get bookings for the logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private (User)
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
});

// @desc    Get booking history for a specific user (Admin or Legacy)
// @route   GET /api/user/:userId/bookings
router.get('/user/:userId', protect, async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.userId) {
            return res.status(401).json({ message: "Not authorized to view these bookings" });
        }
        const history = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
    }
});

// @desc    Get owner's booking logs
// @route   GET /api/owner/:ownerId/logs
// @access  Private (Owner)
router.get('/owner/:ownerId', protect, async (req, res) => {
  try {
     if (req.user._id.toString() !== req.params.ownerId) {
        return res.status(401).json({ message: "Not authorized" });
     }
     const bookings = await Booking.find({ ownerId: req.params.ownerId }).sort({ createdAt: -1 });
     res.json(bookings);
  } catch (error) {
     res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private (User/Owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Authorization: User who made it or Owner of the parking can delete
    if (booking.userId.toString() !== req.user._id.toString() && booking.ownerId?.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized to delete this booking" });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete booking', error: err.message });
  }
});

export default router;
