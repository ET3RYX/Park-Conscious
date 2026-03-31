import mongoose from 'mongoose';
import connectDB from './lib/mongodb.js';
import { sendJSON, sendError } from './utils/responses.js';

// ── HANDLERS (ISO PHASE 3: EVENTS + AUTH) ───────────────────
import { handleEventsList, handleEventCreate, handleEventUpdate, handleImageUpload } from './handlers/events.handler.js';
import { handleUserSignup, handleUserLogin, handleGoogleLogin, handleOwnerSignup, handleOwnerLogin, handleOwnerGoogleLogin } from './handlers/auth.handler.js';

/*
import { handleParkingList, handleUserBookings, handleCreateBooking, handleDeleteBooking, handleOwnerParkings } from './handlers/parking.handler.js';
import { handleAccessLogs, handleWaitlist, handleContact, handleDebugEnv } from './handlers/misc.handler.js';
import { handleDiscussionsList, handleDiscussionDetails, handleDiscussionComments } from './handlers/discussion.handler.js';
*/

export default async function handler(req, res) {
    // ── CORS & Preflight ──────────────────────────────────────────
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    // ── Request Parsing ──────────────────────────────────────────
    let url = req.url || '';
    const method = req.method || 'GET';
    const contentType = req.headers['content-type'] || '';
    
    // Normalize URL
    const originalUrl = url;
    if (!url.startsWith('/api') && url !== '/') {
        url = '/api' + (url.startsWith('/') ? '' : '/') + url;
    }

    // ── Health Check ─────────────────────────────────────────────
    if (url.includes('/health')) {
        return sendJSON(res, 200, { 
            status: 'ISOLATION_ZERO_MODEL_LIVE', 
            db: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Offline', 
            url: originalUrl,
            time: new Date().toISOString()
        });
    }

    // ── Body Parsing ─────────────────────────────────────────────
    let body = {};
    if (['POST', 'PUT', 'PATCH'].includes(method) && !contentType.includes('multipart/form-data')) {
        try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const raw = Buffer.concat(chunks).toString();
            if (raw) body = JSON.parse(raw);
        } catch (e) { console.error("[PARSE_ERROR]", e.message); }
    }

    // ── Database Connection ──────────────────────────────────────
    try {
        await connectDB();
    } catch (e) {
        console.error(`[DB_CRASH] ${e.message}`);
        return sendError(res, 500, 'DB connection failed', e.message);
    }

    try {
        // ── Root / Version ───────────────────────────────────────
        if (url === '/api' || url === '/api/' || url === '/') {
            return sendJSON(res, 200, { status: 'ISOLATION_AUTH_TEST', db: 'Connected', version: '2.9-auth-test' });
        }

        // ── Auth Router ──────────────────────────────────────────
        if (url.includes('/auth/signup')) return await handleUserSignup(req, res, body);
        if (url.includes('/auth/login')) return await handleUserLogin(req, res, body);
        if (url.includes('/auth/google')) return await handleGoogleLogin(req, res, body);
        if (url.includes('/auth/owner/signup')) return await handleOwnerSignup(req, res, body);
        if (url.includes('/auth/owner/login')) return await handleOwnerLogin(req, res, body);
        if (url.includes('/auth/owner/google')) return await handleOwnerGoogleLogin(req, res, body);

        // ── Events Router ────────────────────────────────────────
        if (url.includes('/events/upload')) return await handleImageUpload(req, res);
        if (url.includes('/events') && method === 'POST') return await handleEventCreate(req, res, body);
        if (url.includes('/events') && method === 'PUT') return await handleEventUpdate(req, res, url, body);
        if (url.includes('/events')) return await handleEventsList(req, res, url);

        // ── Handlers are currently disabled for isolation check ──
        return sendError(res, 404, 'Route under maintenance (Auth Phase)', `Path: ${originalUrl}`);

    } catch (error) {
        console.error(`[API_CRASH] ${url} ->`, error);
        return sendError(res, 500, 'Internal Server Error', error.message);
    }
}

export const config = {
    api: { bodyParser: false }
};
