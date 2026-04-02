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
        sameSite: 'none',
        domain: cookieDomain,
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
    });
    res.setHeader('Set-Cookie', cookie);
}


// ─── PhonePe Constants ──────────────────────────────────────────
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";
const SALT_KEY    = process.env.PHONEPE_SALT_KEY    || "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX  = process.env.PHONEPE_SALT_INDEX  || 1;
const BASE_URL    = process.env.PHONEPE_BASE_URL    || "https://api-preprod.phonepe.com/apis/pg-sandbox";
const APP_URL     = "https://events.parkconscious.in"; // Redirect target

// ─── Helper ──────────────────────────────────────────────────────
function json(res, status, data) {
    res.setHeader('Content-Type', 'application/json');
    // Using the previously set CORS headers from handler, but can enforce again if needed
    res.statusCode = status;
    res.end(JSON.stringify(data));
}

// ─── Helper: Generate Checksum (PhonePe) ──────────────────────────
function generateChecksum(base64Payload, endpoint) {
  const hashInput = base64Payload + endpoint + SALT_KEY;
  const sha256    = crypto.createHash("sha256").update(hashInput).digest("hex");
  return `${sha256}###${SALT_INDEX}`;
}

// ─── Helper: Check Payment Status (PhonePe) ─────────────────────────
async function checkPaymentStatus(txnId) {
  const endpoint  = `/pg/v1/status/${MERCHANT_ID}/${txnId}`;
  const hashInput = endpoint + SALT_KEY;
  const sha256    = crypto.createHash("sha256").update(hashInput).digest("hex");
  const checksum  = `${sha256}###${SALT_INDEX}`;

  const response = await axios.get(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type":  "application/json",
      "X-VERIFY":       checksum,
      "X-MERCHANT-ID":  MERCHANT_ID,
      "accept":         "application/json"
    }
  });

  return response.data;
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
    const allowed = ['https://events.parkconscious.in', 'https://www.parkconscious.in', 'http://localhost:3000', 'http://localhost:5173'];
    const origin = req.headers.origin;
    if (allowed.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://events.parkconscious.in');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    const url = req.url || '';
    const method = req.method || 'GET';
    const contentType = req.headers['content-type'] || '';
    
    // Parse body manually for POST/PUT (only if NOT multipart)
    let body = req.body || {};
    if ((method === 'POST' || method === 'PUT') && !contentType.includes('multipart/form-data') && Object.keys(body).length === 0) {
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
        if (url.includes('upload') && method === 'POST') {
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
                try {
                    const isAdmin = url.includes('/admin/all');
                    
                    // CHECK: Is it a single ID fetch? (e.g. /api/events/65af...)
                    const segments = url.split('?')[0].split('/');
                    const potentialId = segments[segments.length - 1];
                    const isId = potentialId && potentialId.length > 20 && potentialId !== 'all';

                    if (isId) {
                        console.log(`[API] Fetching single event: id=${potentialId}`);
                        const event = await Event.findById(potentialId);
                        if (!event) return json(res, 404, { message: 'Event not found' });
                        return json(res, 200, event);
                    }

                    const filter = isAdmin ? {} : { status: 'published' };
                    console.log(`[API] Fetching event list: admin=${isAdmin}, filter=`, filter);
                    const evts = await Event.find(filter).sort({ date: 1 });
                    return json(res, 200, evts);
                } catch (evtErr) {
                    console.error('[API] Events Fetch Error:', evtErr);
                    return json(res, 500, { message: 'Failed to fetch events from database', error: evtErr.message });
                }
            }
            // POST: Upload event image
            if (url.includes('/upload') && method === 'POST') {
                return new Promise((resolve) => {
                    const bb = Busboy({ headers: req.headers });
                    let fileHandled = false;
            
                    bb.on('file', (fieldname, file) => {
                        fileHandled = true;
                        const stream = cloudinary.uploader.upload_stream({ folder: 'park-conscious-events' }, (error, result) => {
                            if (error) {
                                console.error('CLOUDINARY_ERR:', error.message);
                                json(res, 500, { message: 'Cloudinary Transmission Error', error: error.message });
                                return resolve();
                            }
                            json(res, 200, { url: result.secure_url });
                            resolve();
                        });
                        file.pipe(stream);
                    });
            
                    bb.on('error', (err) => {
                        console.error('BUSBOY_ERR:', err.message);
                        json(res, 500, { message: 'Busboy Parsing Error', error: err.message });
                        resolve();
                    });
            
                    bb.on('finish', () => { 
                        if (!fileHandled) { 
                            json(res, 400, { message: 'No file detected in request.' }); 
                            resolve(); 
                        } 
                    });
            
                    req.pipe(bb);
                });
            }

            // POST: Create event
            if (method === 'POST') {
                try {
                    const { 
                        title, description, date, endDate, locationName, locationAddress, lat, lng,
                        images, category, price, capacity, status 
                    } = body;

                    console.log('[API] Create Event payload:', { title, date, status, locationName });

                    if (!title) return json(res, 400, { message: 'Title is required' });
                    if (!date) return json(res, 400, { message: 'Event date is required. Please fill the Timeline section.' });

                    const newEvent = await Event.create({
                        title,
                        description: description || '',
                        date,
                        endDate: endDate || '',
                        location: {
                            name: locationName || '',
                            address: locationAddress || '',
                            coordinates: {
                                lat: parseFloat(lat) || 0,
                                lng: parseFloat(lng) || 0
                            }
                        },
                        images: images || [],
                        category: Array.isArray(category) ? category.join(', ') : (category || ''),
                        price: parseInt(price) || 0,
                        capacity: parseInt(capacity) || 0,
                        status: status || 'draft'
                    });
                    console.log('[API] Event created successfully:', newEvent._id);
                    return json(res, 201, newEvent);
                } catch (createErr) {
                    console.error('[API] Event Create Error:', createErr);
                    // Surface Mongoose validation errors clearly
                    const validationErrors = createErr.errors 
                        ? Object.values(createErr.errors).map(e => e.message).join(', ')
                        : null;
                    return json(res, 400, { 
                        message: validationErrors || createErr.message || 'Failed to create event',
                        detail: createErr.code === 11000 ? 'Duplicate entry detected' : validationErrors
                    });
                }
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
                         images: body.images || [],
                         category: Array.isArray(body.category) ? body.category.join(', ') : (body.category || ''),
                         price: parseInt(body.price) || 0,
                         capacity: parseInt(body.capacity),
                         status: body.status
                     }
                 }, { new: true });
                 return json(res, 200, updated);
            }
        }

        // ── User Bookings Fetching ────────────────────────────────
        if (url.match(/\/api\/bookings\/([a-zA-Z0-9_\-]+)/) && method === 'GET') {
            const userId = url.match(/\/api\/bookings\/([a-zA-Z0-9_\-]+)/)[1];
            try {
                // Fetch confirmed bookings for user
                const userBookings = await Booking.find({ userId, status: "Confirmed" }).sort({ date: -1 });
                // Gather eventIds to fetch event details
                const eventIds = [...new Set(userBookings.map(b => b.eventId).filter(Boolean))];
                const events = await Event.find({ _id: { $in: eventIds } });
                
                // Map event details into booking objects
                const populatedBookings = userBookings.map(b => {
                    const eventDetail = events.find(e => e._id.toString() === b.eventId);
                    return {
                        _id: b._id,
                        transactionId: b.transactionId,
                        amount: b.amount,
                        date: b.date,
                        status: b.status,
                        event: eventDetail ? {
                            title: eventDetail.title || eventDetail.name,
                            location: eventDetail.location?.name || eventDetail.venue,
                            date: eventDetail.date,
                            image: (eventDetail.images && eventDetail.images[0]) || eventDetail.image
                        } : null
                    };
                });
                return json(res, 200, populatedBookings);
            } catch (err) {
                console.error("Fetch bookings Error:", err);
                return json(res, 500, { message: "Failed to fetch bookings" });
            }
        }

        // ── PhonePe Checkout (Initiate Purchase) ──────────────────
        if (url.includes('/api/pay') && method === 'POST') {
            try {
                const { name, amount, phone, userId, orderId } = body;
                if (!amount || !phone) return json(res, 400, { message: 'Missing amount or phone' });

                const merchantTransactionId = "TXN_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
                
                // Track booking in DB as Initiated
                await Booking.create({
                     parkingId: orderId || "EVENT", 
                     eventId: orderId,
                     transactionId: merchantTransactionId,
                     userId: userId || null,
                     amount: amount,
                     status: "Initiated"
                });
                const amountInPaise = parseInt(amount) * 100;

                const payload = {
                    merchantId:            MERCHANT_ID,
                    merchantTransactionId: merchantTransactionId,
                    merchantUserId:        "USER_" + phone,
                    amount:                amountInPaise,
                    // ⚠️ Must point to the API backend, NOT the React frontend
                    redirectUrl:           `https://www.parkconscious.in/api/payment-callback?txnId=${merchantTransactionId}`,
                    redirectMode:          "REDIRECT",
                    callbackUrl:           `https://www.parkconscious.in/api/payment-callback`,
                    mobileNumber:          phone,
                    paymentInstrument: { type: "PAY_PAGE" }
                };

                const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
                const checksum      = generateChecksum(base64Payload, "/pg/v1/pay");

                const response = await axios.post(
                    `${BASE_URL}/pg/v1/pay`,
                    { request: base64Payload },
                    {
                        headers: {
                            "Content-Type":  "application/json",
                            "X-VERIFY":       checksum,
                            "X-MERCHANT-ID":  MERCHANT_ID,
                            "accept":         "application/json"
                        }
                    }
                );

                const { success, data } = response.data;
                if (success && data?.instrumentResponse?.redirectInfo?.url) {
                    return json(res, 200, {
                        success:       true,
                        redirectUrl:   data.instrumentResponse.redirectInfo.url,
                        transactionId: merchantTransactionId
                    });
                }
                return json(res, 400, { success: false, message: "Transaction initialization failed" });
            } catch (payErr) {
                console.error("PhonePe Initiation Error Detailed:", payErr.response?.data || payErr.message);
                return json(res, 500, { success: false, message: "System Overload: Unable to initiate PhonePe transaction." });
            }
        }

        // ── PhonePe Callback (Status Redirect) ───────────────────
        // PhonePe calls this endpoint after payment. We verify status
        // then redirect the user to the correct React page.
        if (url.includes('/payment-callback')) {
            const query = url.split('?')[1] || '';
            const txnId = new URLSearchParams(query).get("txnId");
            const FRONTEND = "https://events.parkconscious.in";

            if (!txnId) {
                return res.writeHead(302, { Location: `${FRONTEND}/payment-failure?error=NO_TXN_ID` }).end();
            }

            try {
                const result = await checkPaymentStatus(txnId);
                const { success, code, data } = result;
                const state = data?.state;
                const isSuccess = success === true && (state === "COMPLETED" || code === "PAYMENT_SUCCESS");

                if (isSuccess) {
                    const amt = (data?.amount || 0) / 100;
                    console.log(`[PhonePe] ✅ Payment success: txnId=${txnId}, amount=₹${amt}`);
                    await Booking.findOneAndUpdate(
                         { transactionId: txnId },
                         { $set: { status: "Confirmed" } }
                    ).catch(e => console.error("Could not update booking status:", e.message));
                    
                    return res.writeHead(302, { Location: `${FRONTEND}/payment-success?txnId=${txnId}&amount=${amt}` }).end();
                } else {
                    console.log(`[PhonePe] ❌ Payment failed: txnId=${txnId}, state=${state}, code=${code}`);
                    await Booking.findOneAndUpdate(
                         { transactionId: txnId },
                         { $set: { status: "Failed" } }
                    ).catch(e => console.error("Could not update booking status:", e.message));
                    return res.writeHead(302, { Location: `${FRONTEND}/payment-failure?txnId=${txnId}&error=${state || code || 'PAYMENT_FAILED'}` }).end();
                }
            } catch (cbErr) {
                console.error("Callback verification failed:", cbErr.message);
                return res.writeHead(302, { Location: `https://events.parkconscious.in/payment-failure?txnId=${txnId}&error=VERIFICATION_FAILED` }).end();
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

        // ── Auth: Verify Session ──────────────────────────────────
        if (url.includes('/auth/me') && method === 'GET') {
            const user = verifyUser(req);
            if (!user) return json(res, 401, { message: 'Unauthorized' });
            return json(res, 200, { user });
        }

        // ── User signup ───────────────────────────────────────────
        if (url.includes('/auth/signup') && method === 'POST') {
            const { name, email, password } = body;
            if (!name || !email || !password) return json(res, 400, { message: 'Missing fields' });
            if (await User.findOne({ email })) return json(res, 400, { message: 'User already exists' });
            const hashed = await bcrypt.hash(password, 10);
            const user = await User.create({ name, email, password: hashed });
            
            const payload = { id: user._id, name: user.name, email: user.email };
            issueCookie(res, req, payload);
            return json(res, 201, { user: payload });
        }

        // ── User / Admin login ────────────────────────────────────
        if (url.includes('/auth/login') && method === 'POST') {
            const { email, password } = body;
            
            let user = await User.findOne({ email });
            let isOwner = false;
            
            if (!user) {
                user = await Owner.findOne({ email });
                isOwner = !!user;
            }

            if (!user || !user.password) return json(res, 400, { message: 'Invalid credentials' });
            if (!await bcrypt.compare(password, user.password)) return json(res, 400, { message: 'Invalid credentials' });
            
            // Generate cross-domain authentication session
            const payload = { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                role: isOwner ? (user.role || 'admin') : 'user'
            };
            
            issueCookie(res, req, payload);
            return json(res, 200, { user: payload });
        }
        // ── User Google login ─────────────────────────────────────
        if ((url.includes('/auth/google') || url.endsWith('/google')) && (method === 'POST' || method === 'GET')) {
            try {
                const { email, name, googleId } = body;
                
                // If it's a GET request with no data, it's likely a misdirected browser navigation
                if (method === 'GET' && !email) {
                    console.log("[Auth] GET request to auth/google with no data. Redirecting back to Events site.");
                    return res.writeHead(302, { Location: 'https://events.parkconscious.in/' }).end();
                }

                if (!email) return json(res, 400, { message: 'Google email missing' });
                
                let user = await User.findOne({ email: email.toLowerCase() });
                if (!user) {
                    user = await User.create({ name, email, googleId });
                } else if (!user.googleId && googleId) {
                    // Link google account to existing email
                    user.googleId = googleId;
                    await user.save();
                }
                
                const payload = { id: user._id, name: user.name, email: user.email };
                issueCookie(res, req, payload);
                return json(res, 200, { user: payload });
            } catch (authErr) {
                console.error("User Google Auth Error:", authErr);
                if (method === 'GET') {
                    return res.writeHead(302, { Location: 'https://events.parkconscious.in/?auth_error=true' }).end();
                }
                return json(res, 500, { message: "Auth processing failed", error: authErr.message });
            }
        }

        // ── Discussions Flow ───────────────────────────────────────
        if (url.includes('/api/discussions')) {
            const isCommentsRoute = url.includes('/comments');
            const isDetailsRoute = url.includes('/details');
            
            const handleVoteLogic = (doc, uid, action) => {
                if (action === 'upvote') {
                    if (doc.upvotes.includes(uid)) {
                        doc.upvotes = doc.upvotes.filter(id => id !== uid);
                    } else {
                        doc.upvotes.push(uid);
                        doc.downvotes = doc.downvotes.filter(id => id !== uid);
                    }
                } else if (action === 'downvote') {
                    if (doc.downvotes.includes(uid)) {
                        doc.downvotes = doc.downvotes.filter(id => id !== uid);
                    } else {
                        doc.downvotes.push(uid);
                        doc.upvotes = doc.upvotes.filter(id => id !== uid);
                    }
                }
            };
            
            if (method === 'GET') {
                try {
                    if (isDetailsRoute) {
                        const id = new URLSearchParams(url.split('?')[1]).get('id');
                        const discussion = await Discussion.findById(id);
                        if (!discussion) return json(res, 404, { error: 'Not found' });
                        return json(res, 200, discussion);
                    } else if (isCommentsRoute) {
                        const id = new URLSearchParams(url.split('?')[1]).get('id');
                        const comments = await Comment.find({ discussionId: id }).sort({ createdAt: 1 });
                        return json(res, 200, comments);
                    } else {
                        // Base /api/discussions
                        const paramsObj = new URLSearchParams(url.split('?')[1] || "");
                        const page = parseInt(paramsObj.get('page')) || 1;
                        const limit = parseInt(paramsObj.get('limit')) || 6;
                        const skip = (page - 1) * limit;
                        
                        const discussions = await Discussion.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
                        const total = await Discussion.countDocuments();
                        return json(res, 200, {
                            discussions,
                            totalPages: Math.ceil(total / limit),
                            currentPage: page
                        });
                    }
                } catch(err) {
                    return json(res, 500, { error: 'Failed to fetch' });
                }
            }

            if (method === 'POST') {
                const user = verifyUser(req);
                if (!user) return json(res, 401, { error: 'Unauthorized.' });
                
                try {
                    if (isCommentsRoute) {
                        const id = new URLSearchParams(url.split('?')[1]).get('id');
                        const { text, parentId } = body;
                        if (!text) return json(res, 400, { error: 'Missing text' });
                        
                        const newComment = await Comment.create({
                            discussionId: id,
                            text, parentId: parentId || null,
                            authorName: user.name, authorUid: user.id,
                            authorPhoto: user.picture || ""
                        });
                        
                        await Discussion.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });
                        return json(res, 201, newComment);
                        
                    } else {
                        // Base POST /api/discussions (New Main Post)
                        const { movieTitle, movieId, moviePosterPath, review, rating } = body;
                        if (!movieTitle || !review || !rating) return json(res, 400, { error: 'Missing fields' });
                        const newPost = await Discussion.create({
                            movieTitle, movieId, moviePosterPath, review, rating,
                            authorName: user.name, authorUid: user.id,
                            authorPhoto: user.picture || ""
                        });
                        return json(res, 201, newPost);
                    }
                } catch(err) {
                    return json(res, 500, { error: 'Create failed' });
                }
            }
            
            if (method === 'PATCH' || method === 'PUT') {
                const user = verifyUser(req);
                if (!user) return json(res, 401, { error: 'Unauthorized.' });
                
                try {
                    if (isCommentsRoute) {
                        const { commentId, action } = body;
                        const comment = await Comment.findById(commentId);
                        if (!comment) return json(res, 404, { error: 'Not found' });
                        
                        handleVoteLogic(comment, user.id, action);
                        await comment.save();
                        return json(res, 200, comment);
                        
                    } else if (isDetailsRoute) {
                        const id = new URLSearchParams(url.split('?')[1]).get('id');
                        const { action } = body;
                        const discussion = await Discussion.findById(id);
                        if (!discussion) return json(res, 404, { error: 'Not found' });
                        
                        handleVoteLogic(discussion, user.id, action);
                        await discussion.save();
                        return json(res, 200, discussion);
                        
                    } else if (url.includes('/upvote')) {
                        const match = url.match(/\/discussions\/([a-zA-Z0-9_]+)\/upvote/);
                        if (!match) return json(res, 400, { error: 'Invalid ID.' });
                        const discussionId = match[1];
                        
                        const discussion = await Discussion.findById(discussionId);
                        if (!discussion) return json(res, 404, { error: 'Not found' });
                        
                        handleVoteLogic(discussion, user.id, 'upvote');
                        await discussion.save();
                        return json(res, 200, discussion);
                    }
                } catch(err) {
                    return json(res, 500, { error: 'Vote failed' });
                }
            }

            return json(res, 405, { error: 'Method Not Allowed' });
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
