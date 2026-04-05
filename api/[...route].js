import mongoose from 'mongoose';
import connectDB from './lib/mongodb.js';
import * as models from './lib/models.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';
import axios from 'axios';
import crypto from 'crypto';


// ─── STABLE ESM API ARCHITECTURE ───────────────────────────────────────────
// This version uses top-level imports and a robust normalizer to eliminate
// "Initialization failure" and "Untitled Experience" data mismatches.

const { User, Owner, Event, Booking, Discussion, Comment, Waitlist, Contact, Parking } = models;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_65271829";

// ─── DATA NORMALIZATION HELPER ─────────────────────────────────────────────
// Ensures frontend compatibility regardless of which field names exist in DB
function normalizeEvent(evt) {
    if (!evt) return null;
    const e = evt.toObject ? evt.toObject() : evt;
    
    // Title/Name Sync
    e.name = e.name || e.title || "Untitled Experience";
    e.title = e.title || e.name || "Untitled Experience";
    
    // Location/Venue Sync
    const locName = e.location?.name || e.locationName || e.venue || "TBA";
    const locAddr = e.location?.address || e.locationAddress || e.venueCity || "Delhi NCR, India";
    
    e.venue = locName;
    e.locationName = locName;
    e.locationAddress = locAddr;
    e.venueCity = locAddr;
    
    if (!e.location) {
        e.location = { 
            name: locName, 
            address: locAddr, 
            coordinates: { lat: 0, lng: 0 } 
        };
    }

    // Pricing Sync
    e.price = e.price || e.regularPrice || 0;
    e.regularPrice = e.regularPrice || e.price || 0;
    
    // Image Sync
    e.image = e.image || (e.images && e.images[0]) || "";
    if (e.image && (!e.images || e.images.length === 0)) e.images = [e.image];
    
    e.badge = e.badge || (e.status === 'published' ? 'LIVE' : '');
    
    return e;
}

export default async function handler(req, res) {
    // 1. Initial CORS
    const allowed = [
        'https://events.parkconscious.in', 'https://admin.events.parkconscious.in', 'http://localhost:5173', 'https://parkconscious.in'
    ];
    const origin = req.headers.origin;
    if (allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
    else res.setHeader('Access-Control-Allow-Origin', allowed[0]);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    const json = (status, data) => {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = status;
        res.end(JSON.stringify(data));
    };

    try {
        const url = req.url || '';
        const method = req.method || 'GET';
        const contentType = req.headers['content-type'] || '';

        // 2. Resilient Body Parser
        let body = req.body || {};
        if ((method === 'POST' || method === 'PUT') && !contentType.includes('multipart/form-data') && (!req.body || Object.keys(req.body).length === 0)) {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const raw = Buffer.concat(chunks).toString();
            if (raw) try { body = JSON.parse(raw); } catch(e){}
        }

        // 3. DB Connection
        await connectDB();

        // 4. Auth Helpers
        const verifyUser = (r) => {
            const cookies = parse(r.headers.cookie || '');
            const token = cookies.token;
            if (!token) return null;
            try { return jwt.verify(token, JWT_SECRET); } catch(e) { return null; }
        };

        const issueCookie = (u) => {
            const host = req.headers.host || '';
            const domain = host.includes('parkconscious.in') ? '.parkconscious.in' : undefined;
            const token = jwt.sign(u, JWT_SECRET, { expiresIn: '7d' });
            res.setHeader('Set-Cookie', serialize('token', token, {
                httpOnly: true, secure: true, sameSite: 'lax', domain, maxAge: 7 * 24 * 60 * 60, path: '/'
            }));
            return token;
        };

        // 5. Routes
        console.log(`[STABLE API v4] Path: ${method} ${url}`);

        if (url.includes('/api/health') || url === '/api' || url === '/api/') {
            return json(200, { status: 'ONLINE', db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
        }

        // -- Event Management (Normalized) --
        if (url.includes('/events')) {
            const user = verifyUser(req);
            const parts = url.split('/');
            const eventId = parts.pop();
            const isIndividual = eventId && eventId.length >= 24;

            // Media Upload Route
            if (url.endsWith('/upload') && method === 'POST') {
                return new Promise((resolve) => {
                    return resolve(json(501, { message: 'Image uploads are temporarily disabled. Please deploy the event without an image for now.' }));
                });
            }

            if (method === 'GET') {
                if (isIndividual) {
                    const event = await Event.findById(eventId).lean();
                    return json(200, normalizeEvent(event));
                }
                const isAdmin = url.includes('/admin/all');
                const filter = isAdmin ? {} : { status: { $in: ['published', 'Published'] } };
                const list = await Event.find(filter).sort({ date: 1 }).lean();
                return json(200, list.map(normalizeEvent));
            }

            if (method === 'POST') {
                if (!user) return json(401, { message: 'Auth required' });
                const event = await Event.create({ ...body, organizerId: user.id });
                return json(201, normalizeEvent(event));
            }

            if (method === 'PUT' && isIndividual) {
                if (!user) return json(401, { message: 'Auth required' });
                const updated = await Event.findByIdAndUpdate(eventId, body, { new: true }).lean();
                return json(200, normalizeEvent(updated));
            }

            if (method === 'DELETE' && isIndividual) {
                if (!user) return json(401, { message: 'Auth required' });
                await Event.findByIdAndDelete(eventId);
                return json(200, { message: 'Event removed' });
            }
        }

        // -- Authentication --
        if (url.includes('/auth/login') && method === 'POST') {
            const { email, password } = body;
            const search = (email || '').toLowerCase();
            let u = await User.findOne({ email: search });
            let isOwner = false;
            if (!u) { u = await Owner.findOne({ email: search }); isOwner = !!u; }
            if (!u || !await bcrypt.compare(password, u.password)) return json(401, { message: 'Invalid credentials' });
            
            const payload = { id: u._id, name: u.name, email: u.email, role: isOwner ? 'admin' : 'user' };
            issueCookie(payload);
            return json(200, { user: payload });
        }

        if (url.includes('/auth/logout') && method === 'POST') {
            const host = req.headers.host || '';
            const domain = host.includes('parkconscious.in') ? '.parkconscious.in' : undefined;
            res.setHeader('Set-Cookie', serialize('token', '', {
                httpOnly: true, secure: true, sameSite: 'lax', domain, maxAge: -1, path: '/'
            }));
            return json(200, { message: 'Logged out successfully' });
        }

        if (url.includes('/auth/google') && method === 'POST') {
            const { email, name, googleId } = body;
            if (!email) return json(400, { message: 'Email required for Google Auth' });
            
            const search = email.toLowerCase();
            let u = await User.findOne({ email: search });
            let isOwner = false;
            
            if (!u) { 
                u = await Owner.findOne({ email: search }); 
                isOwner = !!u; 
            }
            
            if (!u) {
                u = await User.create({ name, email: search, googleId });
            } else if (!u.googleId) {
                u.googleId = googleId;
                await u.save();
            }

            const payload = { id: u._id, name: u.name, email: u.email, role: isOwner ? 'admin' : 'user' };
            issueCookie(payload);
            return json(200, { user: payload, message: 'Logged in with Google' });
        }

        if (url.includes('/auth/me') && method === 'GET') {
            const decoded = verifyUser(req);
            if (!decoded) return json(401, { authenticated: false });
            return json(200, { authenticated: true, user: decoded });
        }

        // -- Discussions & Comments --
        if (url.includes('/discussions')) {
            if (method === 'GET') {
                const id = new URLSearchParams(url.split('?')[1]).get('id');
                if (id) {
                    const disc = await Discussion.findById(id).lean();
                    const comms = await Comment.find({ discussionId: id }).sort({ createdAt: -1 }).lean();
                    return json(200, { ...disc, comments: comms });
                }
                return json(200, await Discussion.find().sort({ createdAt: -1 }));
            }
            if (method === 'POST') {
                const user = verifyUser(req);
                if (!user) return json(401, { message: 'Auth required' });
                const disc = await Discussion.create({ ...body, authorUid: user.id, authorName: user.name });
                return json(201, disc);
            }
        }

        // -- Admin Attendees --
        if (url.includes('/admin/bookings/all') && method === 'GET') {
            const user = verifyUser(req);
            if (!user || user.role !== 'admin') return json(401, { message: 'Admin Auth required' });
            // Fetch bookings and populate event details if needed. 
            // In a pure ESM handler, we can just aggregate or fetch manually.
            const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
            
            // To make it rich, append event info
            for (let b of bookings) {
                if (b.eventId) {
                    const evt = await Event.findById(b.eventId).lean();
                    if (evt) b.event = normalizeEvent(evt);
                }
                
                let resolvedName = b.userId || 'Unknown';
                // If it's an abstract Hex ID, perform a stealth lookup cross-reference
                if (typeof resolvedName === 'string' && resolvedName.length === 24) {
                    try {
                        const u = await User.findById(resolvedName).lean();
                        if (u && u.name) resolvedName = u.name;
                        else {
                            const o = await Owner.findById(resolvedName).lean();
                            if (o && o.name) resolvedName = o.name;
                        }
                    } catch(e) { } // Ignore lookup errors and fallback to hex
                }

                b.user = { 
                    name: resolvedName, 
                    email: b.phone || 'N/A' 
                };
            }
            
            return json(200, bookings);
        }

        // -- PhonePe Payment & Booking --
        if (url.includes('/api/pay') && method === 'POST') {
            const { name, amount, phone, eventId, orderId, userId } = body;
            const targetEventId = eventId || orderId;
            const targetUserId = name || userId || "Guest";
            
            const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";
            const SALT_KEY = process.env.PHONEPE_SALT_KEY || "96434309-7796-489d-8924-ab56988a6076";
            const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
            const ENV_BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
            
            const txId = "TXN_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
            const host = req.headers.host || "events.parkconscious.in";
            const appUrl = `https://${host}`;

            const payload = {
                merchantId: MERCHANT_ID,
                merchantTransactionId: txId,
                merchantUserId: "USER_" + (phone || "GUEST"),
                amount: parseInt(amount) * 100,
                redirectUrl: `${appUrl}/api/payment-callback?txnId=${txId}`,
                redirectMode: "REDIRECT",
                callbackUrl: `${appUrl}/api/payment-callback`,
                mobileNumber: phone,
                paymentInstrument: { type: "PAY_PAGE" }
            };

            const base64 = Buffer.from(JSON.stringify(payload)).toString("base64");
            const checksum = crypto.createHash("sha256").update(base64 + "/pg/v1/pay" + SALT_KEY).digest("hex") + "###" + SALT_INDEX;

            await Booking.create({ transactionId: txId, eventId: targetEventId, userId: targetUserId, amount, status: "Initiated" });

            const response = await axios.post(`${ENV_BASE_URL}/pg/v1/pay`, { request: base64 }, {
                headers: { "Content-Type": "application/json", "X-VERIFY": checksum, "X-MERCHANT-ID": MERCHANT_ID }
            });

            if (response.data.success) return json(200, { success: true, redirectUrl: response.data.data.instrumentResponse.redirectInfo.url });
            return json(500, { message: "Failed to initiate payment" });
        }

        if (url.includes('/api/payment-callback')) {
            const txId = new URLSearchParams(url.split('?')[1]).get('txnId') || body.merchantTransactionId;
            const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";
            const SALT_KEY = process.env.PHONEPE_SALT_KEY || "96434309-7796-489d-8924-ab56988a6076";
            const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
            const ENV_BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

            const checkSum = crypto.createHash("sha256").update(`/pg/v1/status/${MERCHANT_ID}/${txId}` + SALT_KEY).digest("hex") + "###" + SALT_INDEX;
            const response = await axios.get(`${ENV_BASE_URL}/pg/v1/status/${MERCHANT_ID}/${txId}`, {
                headers: { "X-VERIFY": checkSum, "X-MERCHANT-ID": MERCHANT_ID }
            });

            const success = response.data.success && response.data.data.state === "COMPLETED";
            const host = req.headers.host || "events.parkconscious.in";
            if (success) {
                await Booking.findOneAndUpdate({ transactionId: txId }, { $set: { status: "Confirmed", ticketId: "TK-" + crypto.randomUUID().slice(0, 8).toUpperCase() } });
                res.setHeader('Location', `https://${host}/success?txnId=${txId}`);
            } else {
                res.setHeader('Location', `https://${host}/failure?txnId=${txId}`);
            }
            res.statusCode = 302; res.end(); return;
        }

        // -- Legacy Owner Session Bridge --
        if (url.includes('/owner/check-session')) {
            const email = new URLSearchParams(url.split('?')[1]).get('email');
            const owner = await Owner.findOne({ email: email?.toLowerCase() });
            if (!owner) return json(404, { message: 'NotFound' });
            return json(200, { user: { id: owner._id, name: owner.name, email: owner.email } });
        }

        if (url.includes('/owner/') && url.includes('/parkings')) {
             const parts = url.split('/');
             const ownerId = parts[parts.indexOf('owner') + 1];
             if (method === 'GET') return json(200, await Parking.find({ owner: ownerId }));
             if (method === 'POST') {
                 const p = await Parking.create({ ...body, owner: ownerId, ID: "PRK_" + crypto.randomUUID().slice(0, 6) });
                 return json(201, p);
             }
        }

        return json(404, { message: 'Path not matched' });

    } catch (err) {
        console.error('[FINAL STABLE ERROR]:', err);
        return json(500, { status: 'ERROR', message: 'Internal Server Error', error: err.message });
    }
}

export const config = { api: { bodyParser: false } };
