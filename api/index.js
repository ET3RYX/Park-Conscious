import mongoose from 'mongoose';
import connectDB from './lib/mongodb.js';
import { sendJSON, sendError } from './utils/responses.js';

// Import Handlers
import { handleEventsList, handleEventCreate, handleEventUpdate, handleImageUpload } from './handlers/events.handler.js';
import { handleUserSignup, handleUserLogin, handleGoogleLogin, handleOwnerSignup, handleOwnerLogin, handleOwnerGoogleLogin } from './handlers/auth.handler.js';
import { handleParkingList, handleUserBookings, handleCreateBooking, handleDeleteBooking, handleOwnerParkings } from './handlers/parking.handler.js';
import { handleAccessLogs, handleWaitlist, handleContact, handleDebugEnv } from './handlers/misc.handler.js';
import { handleDiscussionsList, handleDiscussionDetails, handleDiscussionComments } from './handlers/discussion.handler.js';

export default async function handler(req, res) {
    // ── CORS & Preflight ──────────────────────────────────────────
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    // ── Request Parsing ──────────────────────────────────────────
    const url = req.url || '';
    const method = req.method || 'GET';
    const contentType = req.headers['content-type'] || '';
    
    console.log(`[API_REQUEST] ${method} ${url}`);
    
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

    // ── Database Connection ──────────────────────────────────────
    try {
        await connectDB();
    } catch (e) {
        console.error(`[DB_CRASH] Error: ${e.message}`);
        return sendError(res, 500, 'DB connection failed', e.message);
    }

    try {
        // ── Health Check & Diagnostics ───────────────────────────
        if (url === '/api/health' || url === '/api/health/') {
            return sendJSON(res, 200, { 
                status: 'API Live', 
                db: 'Connected', 
                host: req.headers.host,
                url: url,
                mongo: !!process.env.MONGODB_URI ? 'CONFIGURED' : 'MISSING',
                time: new Date().toISOString()
            });
        }

        if (url === '/api' || url === '/api/' || url === '/') {
            return sendJSON(res, 200, { status: 'API Live', db: 'Connected', version: '2.0-modular' });
        }

        // ── Events Router ────────────────────────────────────────
        if (url.includes('upload') && method === 'POST') {
            return await handleImageUpload(req, res);
        }
        if (url.includes('/events')) {
            if (method === 'GET') return await handleEventsList(req, res, url);
            if (method === 'POST') return await handleEventCreate(req, res, body);
            if (method === 'PUT') return await handleEventUpdate(req, res, url, body);
        }

        // ── Auth Router (Users) ──────────────────────────────────
        if (url.includes('/auth/signup') && method === 'POST') return await handleUserSignup(req, res, body);
        if (url.includes('/auth/login') && method === 'POST') return await handleUserLogin(req, res, body);
        if (url.includes('/auth/google') && method === 'POST') return await handleGoogleLogin(req, res, body);

        // ── Auth Router (Owners) ─────────────────────────────────
        if (url.includes('/owner/signup') && method === 'POST') return await handleOwnerSignup(req, res, body);
        if (url.includes('/owner/login') && method === 'POST') return await handleOwnerLogin(req, res, body);
        if (url.includes('/owner/google') && method === 'POST') return await handleOwnerGoogleLogin(req, res, body);

        // ── Parking & Booking Router ──────────────────────────────
        if (url === '/api/parking' || url === '/api/parking/') return await handleParkingList(req, res);
        
        if (url.includes('/api/user/') && url.includes('/bookings') && method === 'GET') {
            return await handleUserBookings(req, res, url);
        }
        if (url.includes('/api/bookings')) {
            if (method === 'POST') return await handleCreateBooking(req, res, body);
            if (method === 'DELETE') return await handleDeleteBooking(req, res, url);
        }
        if (url.includes('/owner/') && url.includes('/parkings') && !url.includes('/dashboard')) {
            return await handleOwnerParkings(req, res, url, method, body);
        }

        // ── Misc Router ──────────────────────────────────────────
        if (url.includes('/logs')) return await handleAccessLogs(req, res, method, body);
        if (url.includes('/waitlist') && method === 'POST') return await handleWaitlist(req, res, body);
        if (url.includes('/contact') && method === 'POST') return await handleContact(req, res, body);
        if (url.includes('/debug')) return await handleDebugEnv(req, res);

        // ── Discussions Router ───────────────────────────────────
        if (url.includes('/discussions/comments')) return await handleDiscussionComments(req, res, url, method, body);
        if (url.includes('/discussions/details')) return await handleDiscussionDetails(req, res, url, method, body);
        if (url.includes('/discussions')) return await handleDiscussionsList(req, res, url);

        // ── 404 Fallback ─────────────────────────────────────────
        return sendError(res, 404, 'Route not found', `Path: ${url}, Method: ${method}`);

    } catch (err) {
        console.error('Handler error:', err);
        return sendError(res, 500, 'Server error', err.message);
    }
}

export const config = {
    api: { bodyParser: false }
};
