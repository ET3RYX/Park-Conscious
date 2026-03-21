import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection with singleton pattern
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is missing');
        cached.promise = mongoose.connect(uri.trim(), {
            bufferCommands: false,
            connectTimeoutMS: 10000,
        }).then(m => m);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

// Models
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String }
}, { timestamps: true }));

const Owner = mongoose.models.Owner || mongoose.model('Owner', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    role: { type: String, default: "owner" }
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
    location: { type: String, default: "Main Entrance" },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true }));

const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', new mongoose.Schema({
    email: { type: String, required: true, unique: true }
}, { timestamps: true }));

const Contact = mongoose.models.Contact || mongoose.model('Contact', new mongoose.Schema({
    name: String, email: String, role: String, message: String
}, { timestamps: true }));

// DB Connection Middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ message: "Database Connection Error", error: err.message });
    }
});

// Helper to match routes with or without /api prefix
const apiRoute = (path) => [`/api${path}`, path];

// Routes
app.get(apiRoute('/parking'), (req, res) => {
    try {
        let dataPath = path.join(process.cwd(), 'backend', 'data', 'parkings.json');
        if (!fs.existsSync(dataPath)) dataPath = path.join(process.cwd(), 'data', 'parkings.json');
        res.json(JSON.parse(fs.readFileSync(dataPath)));
    } catch (e) { res.status(500).json({ message: "Data Error" }); }
});

app.post(apiRoute('/auth/signup'), async (req, res) => {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ user: { name: user.name, email: user.email }});
});

app.post(apiRoute('/auth/login'), async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    res.json({ user: { name: user.name, email: user.email }});
});

app.post(apiRoute('/auth/google'), async (req, res) => {
    const { email, name, googleId } = req.body;
    let user = await User.findOne({ email });
    if (!user) user = await User.create({ name, email, googleId });
    res.json({ user: { name: user.name, email: user.email }});
});

app.post(apiRoute('/owner/signup'), async (req, res) => {
    const { name, email, password } = req.body;
    let owner = await Owner.findOne({ email });
    if (owner) return res.status(400).json({ message: "Owner exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    owner = await Owner.create({ name, email, password: hashedPassword });
    res.status(201).json({ user: { name: owner.name, email: owner.email }});
});

app.post(apiRoute('/owner/login'), async (req, res) => {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });
    if (!owner || !owner.password) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    res.json({ user: { name: owner.name, email: owner.email }});
});

app.post(apiRoute('/owner/google'), async (req, res) => {
    const { email, name, googleId } = req.body;
    let owner = await Owner.findOne({ email });
    if (!owner) owner = await Owner.create({ name, email, googleId });
    res.json({ user: { name: owner.name, email: owner.email }});
});

app.get(apiRoute('/events'), async (req, res) => {
    res.json(await Event.find().sort({ createdAt: -1 }));
});

app.post(apiRoute('/events'), async (req, res) => {
    res.status(201).json(await Event.create(req.body));
});

app.get(apiRoute('/logs'), async (req, res) => {
    res.json(await AccessLog.find().sort({ timestamp: -1 }).limit(50));
});

app.post(apiRoute('/logs'), async (req, res) => {
    res.status(201).json(await AccessLog.create(req.body));
});

app.post(apiRoute('/waitlist'), async (req, res) => {
    const existing = await Waitlist.findOne({ email: req.body.email });
    if (existing) return res.status(409).json({ message: "Already on list" });
    res.status(201).json(await Waitlist.create({ email: req.body.email }));
});

app.post(apiRoute('/contact'), async (req, res) => {
    res.status(201).json(await Contact.create(req.body));
});

app.get(['/api', '/api/'], (req, res) => {
    res.json({ 
        status: "API Live", 
        db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        databaseName: mongoose.connection.name,
        requestedUrl: req.url,
        method: req.method
    });
});

// Catch-all to help debug 404/405
app.all('/api/*', (req, res) => {
    res.status(404).json({ 
        message: "Route not found", 
        url: req.url, 
        method: req.method,
        note: "This is the catch-all handler"
    });
});

export default app;

