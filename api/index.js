import connectDB from './lib/mongodb.js';
import { User, Owner, Event, AccessLog, Waitlist, Contact, Parking, Booking } from './lib/models.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// ─── Helper ──────────────────────────────────────────────────────
function json(res, status, data) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = status;
    res.end(JSON.stringify(data));
}

// ─── Main Handler ────────────────────────────────────────────────
export default async function handler(req, res) {
    // CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    const url = req.url || '';
    const method = req.method || 'GET';
    
    // Parse body manually for POST/PUT
    let body = {};
    if (method === 'POST' || method === 'PUT') {
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

        // ── Parking data ──────────────────────────────────────────
        // Changed to exact match or start match to avoid intercepting /owner/X/parkings
        if (url === '/api/parking' || url === '/api/parking/') {
            try {
                // Try fetching from DB first
                const dbParkings = await Parking.find({});
                if (dbParkings && dbParkings.length > 0) {
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
            return json(res, 201, { user: { name: user.name, email: user.email } });
        }

        // ── User login ────────────────────────────────────────────
        if (url.includes('/auth/login') && method === 'POST') {
            const { email, password } = body;
            const user = await User.findOne({ email });
            if (!user || !user.password) return json(res, 400, { message: 'Invalid credentials' });
            if (!await bcrypt.compare(password, user.password)) return json(res, 400, { message: 'Invalid credentials' });
            return json(res, 200, { user: { name: user.name, email: user.email } });
        }

        // ── User Google login ─────────────────────────────────────
        if (url.includes('/auth/google') && method === 'POST') {
            const { email, name, googleId } = body;
            let user = await User.findOne({ email });
            if (!user) user = await User.create({ name, email, googleId });
            return json(res, 200, { user: { name: user.name, email: user.email } });
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
            const { email, name, googleId } = body;
            let owner = await Owner.findOne({ email });
            if (!owner) owner = await Owner.create({ name, email, googleId });
            return json(res, 200, { user: { id: owner._id, name: owner.name, email: owner.email } });
        }

        // ── Owner Dashboard Stats ─────────────────────────────────
        if (url.includes('/owner/') && url.includes('/dashboard') && method === 'GET') {
            const ownerId = url.split('/')[3];
            const parkings = await Parking.find({ owner: ownerId });
            const parkingIds = parkings.map(p => p._id);
            const bookings = await Booking.find({ ownerId: ownerId });
            
            let todayRevenue = 0;
            let todayEntries = bookings.length;
            
            bookings.forEach(b => {
                let amtStr = b.amount || '0';
                amtStr = amtStr.replace(/[^0-9]/g, '');
                todayRevenue += Number(amtStr);
            });
            
            return json(res, 200, {
                totalParkings: parkings.length,
                totalEntries: todayEntries,
                revenueToday: todayRevenue,
                parkings: parkings
            });
        }

        // ── Manage Owner Parkings ─────────────────────────────────
        if (url.includes('/owner/') && url.includes('/parkings') && !url.includes('/dashboard')) {
            const ownerId = url.split('/')[3];
            if (method === 'GET') {
                const parkings = await Parking.find({ owner: ownerId });
                return json(res, 200, parkings);
            }
            if (method === 'POST') {
                const { Location, Latitude, Longitude, PricePerHour, TotalSlots, Type } = body;
                if (!Location || !Latitude || !Longitude) {
                    return json(res, 400, { message: "Location, Latitude, and Longitude are required." });
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
                return json(res, 201, { message: "Parking added successfully", parking: newParking });
            }
        }

        // ── Owner Booking Logs ────────────────────────────────────
        if (url.includes('/owner/') && url.includes('/logs') && method === 'GET') {
            const ownerId = url.split('/')[3];
            const bookings = await Booking.find({ ownerId }).sort({ createdAt: -1 });
            return json(res, 200, bookings);
        }

        // ── Events ────────────────────────────────────────────────
        if (url.includes('/events')) {
            if (method === 'GET') return json(res, 200, await Event.find().sort({ createdAt: -1 }));
            if (method === 'POST') return json(res, 201, await Event.create(body));
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
