import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// ─── DB Connection ───────────────────────────────────────────────
let cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

async function connectDB() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not set');
        cached.promise = mongoose.connect(uri, { bufferCommands: false, connectTimeoutMS: 10000 });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

// ─── Models ──────────────────────────────────────────────────────
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: String,
    googleId: String
}, { timestamps: true }));

const Owner = mongoose.models.Owner || mongoose.model('Owner', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: String,
    googleId: String,
    role: { type: String, default: 'owner' }
}, { timestamps: true }));

const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    venue: { type: String, required: true },
    venueCity: { type: String, default: 'Delhi NCR' },
    attendees: { type: String, default: 'Upcoming' },
    image: { type: String, default: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14' },
    badge: { type: String, default: 'NEW' }
}, { timestamps: true }));

const AccessLog = mongoose.models.AccessLog || mongoose.model('AccessLog', new mongoose.Schema({
    plateNumber: { type: String, required: true },
    location: { type: String, default: 'Main Entrance' },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true }));

const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', new mongoose.Schema({
    email: { type: String, required: true, unique: true }
}, { timestamps: true }));

const Contact = mongoose.models.Contact || mongoose.model('Contact', new mongoose.Schema({
    name: String, email: String, role: String, message: String
}, { timestamps: true }));

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
        // (Vercel routes /api to index.js or [...slug].js automatically)
        if (url === '/api' || url === '/api/' || url === '/') {
            return json(res, 200, { status: 'API Live', db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected', databaseName: mongoose.connection.name });
        }

        // ── Parking data ──────────────────────────────────────────
        if (url.includes('/parking')) {
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
            return json(res, 201, { user: { name: owner.name, email: owner.email } });
        }

        // ── Owner login ───────────────────────────────────────────
        if (url.includes('/owner/login') && method === 'POST') {
            const { email, password } = body;
            const owner = await Owner.findOne({ email });
            if (!owner || !owner.password) return json(res, 400, { message: 'Invalid credentials' });
            if (!await bcrypt.compare(password, owner.password)) return json(res, 400, { message: 'Invalid credentials' });
            return json(res, 200, { user: { name: owner.name, email: owner.email } });
        }

        // ── Owner Google login ────────────────────────────────────
        if (url.includes('/owner/google') && method === 'POST') {
            const { email, name, googleId } = body;
            let owner = await Owner.findOne({ email });
            if (!owner) owner = await Owner.create({ name, email, googleId });
            return json(res, 200, { user: { name: owner.name, email: owner.email } });
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
