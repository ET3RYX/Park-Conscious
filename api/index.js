import mongoose from 'mongoose';
import connectDB from './lib/mongodb.js';
import { sendJSON, sendError } from './utils/responses.js';

// ── HANDLER IMPORTS (TEMPORARILY DISABLED FOR ISOLATION) ─────
/*
import { handleEventsList, handleEventCreate, handleEventUpdate, handleImageUpload } from './handlers/events.handler.js';
import { handleUserSignup, handleUserLogin, handleGoogleLogin, handleOwnerSignup, handleOwnerLogin, handleOwnerGoogleLogin } from './handlers/auth.handler.js';
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

    // ── Emergency Health Check (Isolate from crashes) ───────────
    if (url.includes('/health')) {
        return sendJSON(res, 200, { 
            status: 'ISOLATION_GATEWAY_LIVE', 
            db: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected', 
            url: originalUrl,
            time: new Date().toISOString()
        });
    }

    console.log(`[API_REQUEST] ${method} ${originalUrl} -> ${url}`);

    // Robust Body Parsing
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
            return sendJSON(res, 200, { status: 'ISOLATION_GATEWAY_LIVE', db: 'Connected', version: '2.7-isolation' });
        }

        // ── Handlers are currently disabled for isolation check ──
        return sendError(res, 404, 'Route under maintenance (Isolation Mode)', `Path: ${originalUrl}`);

    } catch (error) {
        console.error(`[API_CRASH] ${url} ->`, error);
        return sendError(res, 500, 'Internal Server Error', error.message);
    }
}

export const config = {
    api: { bodyParser: false }
};
