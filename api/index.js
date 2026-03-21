import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// MongoDB connection with singleton pattern
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const cleanUri = uri.trim();
        const opts = {
            bufferCommands: false,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4
        };

        cached.promise = mongoose.connect(cleanUri, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// Models
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    googleId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) { next(error); }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const OwnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    googleId: { type: String },
    role: { type: String, default: "owner" },
    createdAt: { type: Date, default: Date.now }
});

OwnerSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) { next(error); }
});

const Owner = mongoose.models.Owner || mongoose.model('Owner', OwnerSchema);

const EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, lowercase: true },
    venue: { type: String, required: true },
    venueCity: { type: String, default: 'Delhi NCR' },
    attendees: { type: String, default: 'Upcoming' },
    image: { type: String, default: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14' },
    badge: { type: String, default: 'NEW' },
    createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

const waitlistSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
}, { timestamps: true });

const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', waitlistSchema);

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: String,
    message: String,
}, { timestamps: true });

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

const accessLogSchema = new mongoose.Schema({
    plateNumber: { type: String, required: true },
    location: { type: String, default: "Main Entrance" },
    timestamp: { type: Date, default: Date.now },
    imageUrl: String,
}, { timestamps: true });

const AccessLog = mongoose.models.AccessLog || mongoose.model('AccessLog', accessLogSchema);

// Main handler
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectDB();
        const { method, url } = req;
        const body = req.body || {};

        // Parking Info (Static JSON)
        if (url && url.includes('parking')) {
            try {
                // In Vercel, paths are relative to root. We'll check multiple locations.
                let dataPath = path.join(process.cwd(), 'backend', 'data', 'parkings.json');
                if (!fs.existsSync(dataPath)) {
                    dataPath = path.join(process.cwd(), 'data', 'parkings.json');
                }
                const rawData = fs.readFileSync(dataPath);
                return res.status(200).json(JSON.parse(rawData));
            } catch (e) {
                return res.status(500).json({ message: "Error loading parking data" });
            }
        }

        // Auth Endpoints (User)
        if (url && url.includes('auth')) {
            if (url.includes('signup') && method === 'POST') {
                const { name, email, password } = body;
                if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
                let user = await User.findOne({ email });
                if (user) return res.status(400).json({ message: "User already exists" });
                user = await User.create({ name, email, password });
                return res.status(201).json({ message: "Success", user: { name: user.name, email: user.email }});
            }
            if (url.includes('login') && method === 'POST') {
                const { email, password } = body;
                const user = await User.findOne({ email });
                if (!user || !user.password) return res.status(400).json({ message: "Invalid credentials" });
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
                return res.status(200).json({ message: "Logged in", user: { name: user.name, email: user.email }});
            }
            if (url.includes('google') && method === 'POST') {
                const { email, name, googleId } = body;
                let user = await User.findOne({ email });
                if (!user) user = await User.create({ name, email, googleId });
                else if (!user.googleId) { user.googleId = googleId; await user.save(); }
                return res.status(200).json({ message: "Google Auth Success", user: { name: user.name, email: user.email }});
            }
        }

        // Owner Endpoints
        if (url && url.includes('owner')) {
            if (url.includes('signup') && method === 'POST') {
                const { name, email, password } = body;
                let owner = await Owner.findOne({ email });
                if (owner) return res.status(400).json({ message: "Owner exists" });
                owner = await Owner.create({ name, email, password });
                return res.status(201).json({ message: "Success", user: { name: owner.name, email: owner.email }});
            }
            if (url.includes('login') && method === 'POST') {
                const { email, password } = body;
                const owner = await Owner.findOne({ email });
                if (!owner || !owner.password) return res.status(400).json({ message: "Invalid credentials" });
                const isMatch = await bcrypt.compare(password, owner.password);
                if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
                return res.status(200).json({ message: "Logged in", user: { name: owner.name, email: owner.email }});
            }
            if (url.includes('google') && method === 'POST') {
                const { email, name, googleId } = body;
                let owner = await Owner.findOne({ email });
                if (!owner) owner = await Owner.create({ name, email, googleId });
                else if (!owner.googleId) { owner.googleId = googleId; await owner.save(); }
                return res.status(200).json({ message: "Google Auth Success", user: { name: owner.name, email: owner.email }});
            }
        }

        // Events
        if (url && url.includes('events')) {
            if (method === 'GET') {
                const events = await Event.find().sort({ createdAt: -1 });
                return res.status(200).json(events);
            }
            if (method === 'POST') {
                const entry = await Event.create(body);
                return res.status(201).json(entry);
            }
        }

        // Logs
        if (url && url.includes('logs')) {
            if (method === 'GET') {
                const logs = await AccessLog.find().sort({ timestamp: -1 }).limit(50);
                return res.status(200).json(logs);
            }
            if (method === 'POST') {
                const entry = await AccessLog.create(body);
                return res.status(201).json(entry);
            }
        }

        // Waitlist & Contact (legacy support)
        if (url && url.includes('waitlist')) {
            if (method === 'POST') {
                const existing = await Waitlist.findOne({ email: body.email });
                if (existing) return res.status(409).json({ message: "Already on list" });
                const entry = await Waitlist.create({ email: body.email });
                return res.status(201).json(entry);
            }
            const list = await Waitlist.find().sort({ createdAt: -1 });
            return res.status(200).json(list);
        }

        if (url && url.includes('contact')) {
            if (method === 'POST') {
                const entry = await Contact.create(body);
                return res.status(201).json(entry);
            }
            const list = await Contact.find().sort({ createdAt: -1 });
            return res.status(200).json(list);
        }

        // Health Check
        return res.status(200).json({ status: "API Live", db: mongoose.connection.readyState === 1 });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

