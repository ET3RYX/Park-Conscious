import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { Parking, Booking } from '../lib/models.js';
import { sendJSON, sendError } from '../utils/responses.js';

// ── Public Parking List ──────────────────────────────────────────
export const handleParkingList = async (req, res) => {
    try {
        const dbParkings = await Parking.find({});
        if (dbParkings && dbParkings.length > 0) {
            const mapped = dbParkings.map(p => ({
                _id: p._id,
                ID: p.ID || p._id.toString(),
                owner: p.owner,
                ownerId: p.owner || p.ownerId, // Backward compatibility
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
            return sendJSON(res, 200, mapped);
        }
    } catch (e) {
        console.warn("DB Parking fetch failed, falling back to JSON:", e.message);
    }
    
    let pPath = path.join(process.cwd(), 'backend', 'data', 'parkings.json');
    if (!fs.existsSync(pPath)) pPath = path.join(process.cwd(), 'data', 'parkings.json');
    if (fs.existsSync(pPath)) {
        return sendJSON(res, 200, JSON.parse(fs.readFileSync(pPath)));
    } else {
        return sendJSON(res, 200, []);
    }
};

// ── User Bookings ────────────────────────────────────────────────
export const handleUserBookings = async (req, res, url) => {
    try {
        const parts = url.split('/');
        const userIdx = parts.indexOf('user');
        const userId = parts[userIdx + 1];
        
        const history = await Booking.find({ userId }).sort({ createdAt: -1 });
        return sendJSON(res, 200, history);
    } catch (err) {
        return sendError(res, 500, 'Failed to fetch bookings', err.message);
    }
};

export const handleCreateBooking = async (req, res, body) => {
    try {
        const { parkingId, ownerId, userId, locationName, vehicleType, vehicleNumber, startTime, endTime, amount } = body;
        if (!parkingId || !locationName) {
            return sendError(res, 400, 'Parking ID and Location are required');
        }

        // Availability Check (Overbooking Prevention)
        const parking = await Parking.findById(parkingId).catch(() => null);
        if (parking && parking.TotalSlots !== null) {
            const activeCount = await Booking.countDocuments({ 
                parkingId: String(parkingId), 
                status: "Confirmed" 
            });
            
            if (activeCount >= parking.TotalSlots) {
                return sendError(res, 400, `Parking is full. Only ${parking.TotalSlots} slots were available.`);
            }
        }
        
        const b = await Booking.create({
            parkingId: String(parkingId),
            ownerId: ownerId ? String(ownerId) : null,
            userId: userId ? String(userId) : null,
            locationName,
            vehicleType,
            vehicleNumber,
            startTime,
            endTime,
            amount,
            status: "Confirmed"
        });
        return sendJSON(res, 201, { message: 'Booking created successfully', booking: b });
    } catch (err) {
        console.error("Booking Create Error Detailed:", err);
        const details = err.errors ? Object.keys(err.errors).map(k => err.errors[k].message) : null;
        return sendError(res, 500, 'Database Error - Unable to save booking', details || err.message);
    }
};

export const handleDeleteBooking = async (req, res, url) => {
    try {
        const parts = url.split('/');
        const bookingId = parts[parts.length - 1];
        
        const deleted = await Booking.findByIdAndDelete(bookingId);
        if (!deleted) return sendError(res, 404, 'Booking not found');
        return sendJSON(res, 200, { message: 'Booking removed successfully' });
    } catch (err) {
        return sendError(res, 500, 'Failed to delete booking', err.message);
    }
};

// ── Owner Parkings ───────────────────────────────────────────────
export const handleOwnerParkings = async (req, res, url, method, body) => {
    try {
        const parts = url.split('/');
        const ownerIdx = parts.indexOf('owner');
        const ownerId = parts[ownerIdx + 1];

        if (!ownerId || ownerId === 'parkings') return sendError(res, 400, 'Invalid owner ID');

        if (method === 'GET') {
            const parkings = await Parking.find({ owner: ownerId });
            return sendJSON(res, 200, parkings);
        }
        
        if (method === 'DELETE') {
            const parkingId = parts[parts.length - 1];
            const parking = await Parking.findById(parkingId);
            if (!parking) return sendError(res, 404, 'Parking not found');
            if (parking.owner?.toString() !== ownerId) return sendError(res, 401, 'Unauthorized');
            
            await Parking.findByIdAndDelete(parkingId);
            return sendJSON(res, 200, { message: 'Parking removed' });
        }
        
        if (method === 'POST') {
            const { Location, Latitude, Longitude, PricePerHour, TotalSlots, Type } = body;
            if (!Location || !Latitude || !Longitude) {
                return sendError(res, 400, "Location, Latitude, and Longitude are required.");
            }
            
            const parkingData = {
                owner: new mongoose.Types.ObjectId(ownerId),
                Location,
                Latitude: parseFloat(Latitude),
                Longitude: parseFloat(Longitude),
                PricePerHour: PricePerHour ? parseFloat(PricePerHour) : null,
                TotalSlots: TotalSlots ? parseInt(TotalSlots) : null,
                Type: Type || "Private Parking",
                Status: "Active",
                Authority: "Owner"
            };
            
            const newParking = new Parking(parkingData);
            newParking.ID = "OWNER_" + newParking._id.toString().substring(18);
            await newParking.save();
            
            return sendJSON(res, 201, { message: "Parking added successfully", parking: newParking });
        }
    } catch (err) {
        return sendError(res, 500, 'Owner parking operation failed', err.message);
    }
};
