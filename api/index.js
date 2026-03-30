import mongoose from 'mongoose';
import connectDB from './lib/mongodb.js';
import { User, Owner, Event, AccessLog, Waitlist, Contact, Parking, Booking } from './lib/models.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import Busboy from 'busboy';

// ─── Helper ──────────────────────────────────────────────────────
function json(res, status, data) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = status;
    res.end(JSON.stringify(data));
}


// ── Cloudinary Config ───────────────────────────────────────────
if (process.env.CLOUDINARY_URL) {
    // Auto-configures from URL
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// ── Main Handler ────────────────────────────────────────────────
export default async function handler(req, res) {
    // CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    const url = req.url || '';
    const method = req.method || 'GET';
    const contentType = req.headers['content-type'] || '';
    
    // Parse body manually for POST/PUT (only if NOT multipart)
    let body = {};
    if ((method === 'POST' || method === 'PUT') && !contentType.includes('multipart/form-data')) {
        try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const raw = Buffer.concat(chunks).toString();
            if (raw) body = JSON.parse(raw);
        } catch (e) { console.error("Body parse error:", e); }
    }

    try {
        await connectDB();
    } catch (e) {
        return json(res, 500, { message: 'DB connection failed', error: e.message });
    }

    try {
        // ── Health check ──────────────────────────────────────────
        if (url === '/api' || url === '/api/' || url === '/') {
            return json(res, 200, { status: 'API Live', db: 'Connected' });
        }

        // ── Events Upload (Image) ─────────────────────────────────
        if (url.includes('/events/upload') && method === 'POST') {
             return new Promise((resolve) => {
                try {
                    const bb = Busboy({ headers: req.headers });
                    let fileHandled = false;

                    bb.on('file', (fieldname, file, info) => {
                        fileHandled = true;
                        const { filename, encoding, mimeType } = info;
                        const stream = cloudinary.uploader.upload_stream(
                            { folder: 'park-conscious-events' },
                            (error, result) => {
                                if (error) return json(res, 500, { message: 'Cloudinary error', error: error.message });
                                json(res, 200, { url: result.secure_url });
                                resolve();
                            }
                        );
                        file.pipe(stream);
                    });

                    bb.on('finish', () => {
                        if (!fileHandled) {
                            json(res, 400, { message: 'No file uploaded' });
                            resolve();
                        }
                    });

                    req.pipe(bb);
                } catch (err) {
                    json(res, 400, { message: 'Form parse error: ' + err.message });
                    resolve();
                }
            });
        }

        // ── Events Data ───────────────────────────────────────────
        if (url.includes('/events')) {
            // GET: Fetch events (Filter for public vs admin if needed)
            if (method === 'GET') {
                const isAdmin = url.includes('/admin/all');
                const filter = isAdmin ? {} : { status: 'published' };
                const evts = await Event.find(filter).sort({ date: 1 });
                return json(res, 200, evts);
            }
            
            // POST: Create event
            if (method === 'POST') {
                const { 
                    title, description, date, endDate, locationName, locationAddress, lat, lng,
                    images, category, price, capacity, status 
                } = body;
                
                const newEvent = await Event.create({
                    title, description, date, endDate,
                    location: {
                        name: locationName,
                        address: locationAddress,
                        coordinates: { lat, lng }
                    },
                    images, category, 
                    price: parseInt(price) || 0,
                    capacity: parseInt(capacity) || 0,
                    status: status || 'draft'
                });
                return json(res, 201, newEvent);
            }

            // PUT: Update event
            if (method === 'PUT') {
                 const id = url.split('/').pop();
                 const updated = await Event.findByIdAndUpdate(id, {
                     $set: {
                         title: body.title,
                         description: body.description,
                         date: body.date,
                         endDate: body.endDate,
                         'location.name': body.locationName,
                         'location.address': body.locationAddress,
                         'location.coordinates.lat': body.lat,
                         'location.coordinates.lng': body.lng,
                         images: body.images,
                         category: body.category,
                         price: parseInt(body.price),
                         capacity: parseInt(body.capacity),
                         status: body.status
                     }
                 }, { new: true });
                 return json(res, 200, updated);
            }
        }

        // ── Parking data ──────────────────────────────────────────
        // ... (remaining handler code stays roughly the same)
        if (url === '/api/parking' || url === '/api/parking/') {
            try {
                // Try fetching from DB first
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
                    return json(res, 200, mapped);
                }
            } catch (e) {
                console.warn("DB Parking fetch failed, falling back to JSON:", e);
            }
            
            let p = path.join(process.cwd(), 'backend', 'data', 'parkings.json');
            if (!fs.existsSync(p)) p = path.join(process.cwd(), 'data', 'parkings.json');
            return json(res, 200, JSON.parse(fs.readFileSync(p)));
        }

        // ── User signup ───────────────────────────────────────────
        if (url.includes('/auth/signup') && method === 'POST') {
            const { name, email, password } = body;
            if (!name || !email || !password) return json(res, 400, { message: 'Missing fields' });
            if (await User.findOne({ email })) return json(res, 400, { message: 'User already exists' });
            const hashed = await bcrypt.hash(password, 10);
            const user = await User.create({ name, email, password: hashed });
            return json(res, 201, { user: { id: user._id, name: user.name, email: user.email } });
        }

        // ── User login ────────────────────────────────────────────
        if (url.includes('/auth/login') && method === 'POST') {
            const { email, password } = body;
            const user = await User.findOne({ email });
            if (!user || !user.password) return json(res, 400, { message: 'Invalid credentials' });
            if (!await bcrypt.compare(password, user.password)) return json(res, 400, { message: 'Invalid credentials' });
            return json(res, 200, { user: { id: user._id, name: user.name, email: user.email } });
        }
        // ── User Google login ─────────────────────────────────────
        if (url.includes('/auth/google') && method === 'POST') {
            try {
                const { email, name, googleId } = body;
                if (!email) return json(res, 400, { message: 'Google email missing' });
                
                let user = await User.findOne({ email: email.toLowerCase() });
                if (!user) {
                    user = await User.create({ name, email, googleId });
                } else if (!user.googleId && googleId) {
                    // Link google account to existing email
                    user.googleId = googleId;
                    await user.save();
                }
                
                return json(res, 200, { 
                    user: { 
                        id: user._id, 
                        name: user.name, 
                        email: user.email 
                    } 
                });
            } catch (authErr) {
                console.error("User Google Auth Error:", authErr);
                return json(res, 500, { message: "Auth processing failed", error: authErr.message });
            }
        }

        // ── User Bookings Fetch ──────────────────────────────────
        if (url.includes('/api/user/') && url.includes('/bookings') && method === 'GET') {
            const parts = url.split('/');
            const userIdx = parts.indexOf('user');
            const userId = parts[userIdx + 1];
            try {
                const history = await Booking.find({ userId }).sort({ createdAt: -1 });
                return json(res, 200, history);
            } catch (err) {
                return json(res, 500, { message: 'Failed to fetch bookings', error: err.message });
            }
        }

        // ── Create Booking ───────────────────────────────────────
        if (url.includes('/api/bookings') && method === 'POST') {
            try {
                const { parkingId, ownerId, userId, locationName, vehicleType, vehicleNumber, startTime, endTime, amount } = body;
                if (!parkingId || !locationName) {
                    return json(res, 400, { message: 'Parking ID and Location are required' });
                }

                // Availability Check (Overbooking Prevention)
                const parking = await Parking.findById(parkingId).catch(() => null);
                if (parking && parking.TotalSlots !== null) {
                    const activeCount = await Booking.countDocuments({ 
                        parkingId: String(parkingId), 
                        status: "Confirmed" 
                    });
                    
                    if (activeCount >= parking.TotalSlots) {
                        return json(res, 400, { 
                            message: `Parking is full. Only ${parking.TotalSlots} slots were available and all are currently booked.` 
                        });
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
                return json(res, 201, { message: 'Booking created successfully', booking: b });
            } catch (err) {
                console.error("Booking Create Error Detailed:", err);
                return json(res, 500, { 
                    message: 'Database Error - Unable to save booking', 
                    error: err.message,
                    details: err.errors ? Object.keys(err.errors).map(k => err.errors[k].message) : null
                });
            }
        }

        // ── Delete Booking ───────────────────────────────────────
        if (url.includes('/api/bookings/') && method === 'DELETE') {
            const parts = url.split('/');
            const bookingId = parts[parts.length - 1];
            try {
                const deleted = await Booking.findByIdAndDelete(bookingId);
                if (!deleted) return json(res, 404, { message: 'Booking not found' });
                return json(res, 200, { message: 'Booking removed successfully' });
            } catch (err) {
                return json(res, 500, { message: 'Failed to delete booking', error: err.message });
            }
        }

        // ── Owner signup ──────────────────────────────────────────
        if (url.includes('/owner/signup') && method === 'POST') {
            const { name, email, password } = body;
            if (await Owner.findOne({ email })) return json(res, 400, { message: 'Owner already exists' });
            const hashed = await bcrypt.hash(password, 10);
            const owner = await Owner.create({ name, email, password: hashed });
            return json(res, 201, { user: { id: owner._id, name: owner.name, email: owner.email } });
        }

        // ── Owner login ───────────────────────────────────────────
        if (url.includes('/owner/login') && method === 'POST') {
            const { email, password } = body;
            const owner = await Owner.findOne({ email });
            if (!owner || !owner.password) return json(res, 400, { message: 'Invalid credentials' });
            if (!await bcrypt.compare(password, owner.password)) return json(res, 400, { message: 'Invalid credentials' });
            return json(res, 200, { user: { id: owner._id, name: owner.name, email: owner.email } });
        }

        // ── Owner Google login ────────────────────────────────────
        if (url.includes('/owner/google') && method === 'POST') {
            try {
                const { email, name, googleId } = body;
                let owner = await Owner.findOne({ email });
                if (!owner) owner = await Owner.create({ name, email, googleId });
                return json(res, 200, { user: { id: owner._id, name: owner.name, email: owner.email } });
            } catch (err) {
                return json(res, 500, { message: 'Google login failed', error: err.message });
            }
        }

        // ── Manage Owner Parkings ─────────────────────────────────
        if (url.includes('/owner/') && url.includes('/parkings') && !url.includes('/dashboard')) {
            const parts = url.split('/');
            const ownerIdx = parts.indexOf('owner');
            const ownerId = parts[ownerIdx + 1];

            if (!ownerId || ownerId === 'parkings') return json(res, 400, { message: 'Invalid owner ID' });

            if (method === 'GET') {
                const parkings = await Parking.find({ owner: ownerId });
                return json(res, 200, parkings);
            }
            if (method === 'DELETE') {
                const parkingId = parts[parts.length - 1];
                const parking = await Parking.findById(parkingId);
                if (!parking) return json(res, 404, { message: 'Parking not found' });
                if (parking.owner?.toString() !== ownerId) return json(res, 401, { message: 'Unauthorized' });
                await Parking.findByIdAndDelete(parkingId);
                return json(res, 200, { message: 'Parking removed' });
            }
            if (method === 'POST') {
                const { Location, Latitude, Longitude, PricePerHour, TotalSlots, Type } = body;
                if (!Location || !Latitude || !Longitude) {
                    return json(res, 400, { message: "Location, Latitude, and Longitude are required." });
                }
                try {
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
                    
                    return json(res, 201, { message: "Parking added successfully", parking: newParking });
                } catch (err) {
                    return json(res, 500, { message: "Database Error", error: err.message });
                }
            }
        }

        // ── Access logs ───────────────────────────────────────────
        if (url.includes('/logs')) {
            if (method === 'GET') return json(res, 200, await AccessLog.find().sort({ timestamp: -1 }).limit(50));
            if (method === 'POST') return json(res, 201, await AccessLog.create(body));
        }

        // ── Waitlist ──────────────────────────────────────────────
        if (url.includes('/waitlist') && method === 'POST') {
            if (await Waitlist.findOne({ email: body.email })) return json(res, 409, { message: 'Already on waitlist' });
            return json(res, 201, await Waitlist.create({ email: body.email }));
        }

        // ── Contact ───────────────────────────────────────────────
        if (url.includes('/contact') && method === 'POST') {
            return json(res, 201, await Contact.create(body));
        }

        // ── 404 fallback ──────────────────────────────────────────
        return json(res, 404, { message: 'Route not found', url, method });

    } catch (err) {
        console.error('Handler error:', err);
        return json(res, 500, { message: 'Server error', error: err.message });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
