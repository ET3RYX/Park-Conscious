import mongoose from 'mongoose';
import connectDB from './lib/mongodb.js';
import { User, Owner, Event, AccessLog, Waitlist, Contact, Parking, Booking, Discussion, Comment } from './lib/models.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import Busboy from 'busboy';
import axios from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_for_dev_mode";

// ─── Helper: Verify JWT Cookie ────────────────────────────────────
function verifyUser(req) {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch(err) {
        return null;
    }
}

// ─── Helper: Issue Cookie ───────────────────────────────────────
function issueCookie(res, req, userPayload) {
    const requestHost = req.headers.host || '';
    const cookieDomain = requestHost.includes('parkconscious.in') ? '.parkconscious.in' : undefined;
    const isSecure = requestHost.includes('parkconscious.in') || req.headers['x-forwarded-proto'] === 'https';
    
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    const cookie = serialize('token', token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        domain: cookieDomain,
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
    });
    res.setHeader('Set-Cookie', cookie);
    return token;
}

// ─── PhonePe Constants ──────────────────────────────────────────
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";
const SALT_KEY    = process.env.PHONEPE_SALT_KEY    || "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX  = process.env.PHONEPE_SALT_INDEX  || 1;
const BASE_URL    = process.env.PHONEPE_BASE_URL    || "https://api-preprod.phonepe.com/apis/pg-sandbox";

// ─── Helper ──────────────────────────────────────────────────────
function json(res, status, data) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = status;
    res.end(JSON.stringify(data));
}

// ─── Helper: Generate Checksum (PhonePe) ──────────────────────────
function generateChecksum(base64Payload, endpoint) {
  const hashInput = base64Payload + endpoint + SALT_KEY;
  const sha256    = crypto.createHash("sha256").update(hashInput).digest("hex");
  return `${sha256}###${SALT_INDEX}`;
}

// ── Cloudinary Config ───────────────────────────────────────────
if (process.env.CLOUDINARY_URL) {
    // console.log("[SYSTEM] Cloudinary auto-configured via CLOUDINARY_URL.");
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// ── Main Handler ────────────────────────────────────────────────
export default async function handler(req, res) {
    const allowed = [
        'https://events.parkconscious.in', 
        'https://admin.events.parkconscious.in',
        'http://localhost:5173'
    ];
    const origin = req.headers.origin;
    if (allowed.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', allowed[0]);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    const url = req.url || '';
    const method = req.method || 'GET';
    const contentType = req.headers['content-type'] || '';
    
    // Parse body manually for POST/PUT (only if NOT multipart)
    let body = req.body || {};
    if ((method === 'POST' || method === 'PUT') && !contentType.includes('multipart/form-data') && (!req.body || Object.keys(req.body).length === 0)) {
        try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const raw = Buffer.concat(chunks).toString();
            if (raw) body = JSON.parse(raw);
        } catch (e) { /* silent parse error */ }
    }

    try {
        await connectDB();
    } catch (dbErr) {
        return json(res, 500, { message: 'Database connection failed', error: dbErr.message });
    }

    try {
        // ── Health
        if (url === '/api' || url === '/api/' || url === '/api/health') {
            return json(res, 200, { status: 'API Live', db: 'Connected', timestamp: new Date().toISOString() });
        }

        // ── Auth: Me
        if (url.includes('/auth/me') && method === 'GET') {
            const decoded = verifyUser(req);
            if (!decoded) return json(res, 401, { authenticated: false });
            let user = await User.findById(decoded.id);
            let isOwner = false;
            if (!user) { user = await Owner.findById(decoded.id); isOwner = !!user; }
            if (!user) return json(res, 401, { authenticated: false });
            return json(res, 200, { authenticated: true, user: { id: user._id, email: user.email, name: user.name, role: isOwner ? 'admin' : 'user' } });
        }

        // ── Auth: Login
        if (url.includes('/auth/login') && method === 'POST') {
            const { email, password } = body;
            if (!email || !password) return json(res, 400, { message: 'Missing credentials' });
            const searchEmail = email.toLowerCase();
            let user = await User.findOne({ email: searchEmail });
            let isOwner = false;
            if (!user) { user = await Owner.findOne({ email: searchEmail }); isOwner = !!user; }
            if (!user || !user.password) return json(res, 401, { message: 'Authentication failed' });
            if (!await bcrypt.compare(password, user.password)) return json(res, 401, { message: 'Authentication failed' });
            
            const payload = { id: user._id, name: user.name, email: user.email, role: isOwner ? 'admin' : 'user' };
            const token = issueCookie(res, req, payload);
            return json(res, 200, { user: payload, token });
        }

        // ── Events
        if (url.includes('/events')) {
            if (method === 'GET') {
                const isAdmin = url.includes('/admin/all');
                const segments = url.split('?')[0].split('/');
                const potentialId = segments[segments.length - 1];
                if (potentialId && potentialId.length > 20 && potentialId !== 'all') {
                    const event = await Event.findById(potentialId);
                    if (!event) return json(res, 404, { message: 'Event not found' });
                    return json(res, 200, event);
                }
                const filter = isAdmin ? {} : { status: { $in: ['published', 'Published', 'draft'] } };
                let evts = await Event.find(filter).sort({ date: 1 });
                if (evts.length === 0 && !isAdmin) evts = await Event.find({}).limit(10).sort({ date: 1 }); // fallback
                return json(res, 200, evts);
            }
            
            if (url.includes('/upload') && method === 'POST') {
                return new Promise((resolve) => {
                    const bb = Busboy({ headers: req.headers });
                    bb.on('file', (fieldname, file) => {
                        const stream = cloudinary.uploader.upload_stream({ folder: 'park-conscious' }, (error, result) => {
                            if (error) return resolve(json(res, 500, { error: error.message }));
                            resolve(json(res, 200, { url: result.secure_url }));
                        });
                        file.pipe(stream);
                    });
                    req.pipe(bb);
                });
            }

            if (method === 'POST') {
                const newEvent = await Event.create({ ...body, status: body.status || 'draft' });
                return json(res, 201, newEvent);
            }

            if (method === 'PUT') {
                const id = url.split('/').pop();
                const updated = await Event.findByIdAndUpdate(id, { $set: body }, { new: true });
                return json(res, 200, updated);
            }
        }

        // ── Seed Admin
        if (url.includes('/auth/seed-admin') && method === 'GET') {
            const adminEmail = 'admin@parkconscious.com';
            const hashed = await bcrypt.hash('admin1234', 10);
            await User.deleteMany({ email: adminEmail });
            let owner = await Owner.findOne({ email: adminEmail });
            if (!owner) {
                owner = await Owner.create({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin' });
            } else {
                owner.password = hashed; owner.role = 'admin'; await owner.save();
            }
            return json(res, 200, { message: 'Admin seeded successfully' });
        }

        // ── 404 Fallback
        return json(res, 404, { message: 'Route not found', url });

    } catch (err) {
        console.error('[API ERROR]:', err);
        return json(res, 500, { message: 'Internal server failure', error: err.message });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
