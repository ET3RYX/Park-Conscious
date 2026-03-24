import connectDB from './lib/mongodb.js';
import { User, Owner, Event, AccessLog, Waitlist, Contact } from './lib/models.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Import all hidden routes
import callbackHandler from './_routes/callback.js';
import debugEnvHandler from './_routes/debug-env.js';
import discussionCommentsHandler from './_routes/discussion-comments.js';
import discussionDetailsHandler from './_routes/discussion-details.js';
import discussionsHandler from './_routes/discussions.js';
import googleAuthHandler from './_routes/google-auth.js';
import payHandler from './_routes/pay.js';
import paymentCallbackHandler from './_routes/payment-callback.js';
import ticketsHandler from './_routes/tickets.js';

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
    
    // Parse body manually for legacy routes if req.body is not already populated by Vercel
    let body = req.body;
    if (!body && (method === 'POST' || method === 'PUT')) {
        try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const raw = Buffer.concat(chunks).toString();
            if (raw) body = JSON.parse(raw);
            req.body = body; // Attach to req for nested handlers
        } catch (e) { console.error("Body parse error:", e); }
    }

    try {
        await connectDB();
    } catch (e) {
        return json(res, 500, { message: 'DB connection failed', error: e.message });
    }

    try {
        // ── Nested Router Dispatch ────────────────────────────────
        const cleanUrl = url.split('?')[0]; // Remove query params for routing

        if (cleanUrl === '/api/pay') return payHandler(req, res);
        if (cleanUrl === '/api/payment-callback') return paymentCallbackHandler(req, res);
        if (cleanUrl === '/api/callback') return callbackHandler(req, res);
        if (cleanUrl === '/api/tickets') return ticketsHandler(req, res);
        if (cleanUrl === '/api/discussions') return discussionsHandler(req, res);
        if (cleanUrl === '/api/discussion-details') return discussionDetailsHandler(req, res);
        if (cleanUrl === '/api/discussion-comments') return discussionCommentsHandler(req, res);
        if (cleanUrl === '/api/google-auth') return googleAuthHandler(req, res);
        if (cleanUrl === '/api/debug-env') return debugEnvHandler(req, res);

        // ── Legacy Routes ─────────────────────────────────────────

        if (url === '/api' || url === '/api/' || url === '/') {
            return json(res, 200, { status: 'API Live', db: 'Connected' });
        }

        if (url.includes('/parking')) {
            let p = path.join(process.cwd(), 'backend', 'data', 'parkings.json');
            if (!fs.existsSync(p)) p = path.join(process.cwd(), 'data', 'parkings.json');
            return json(res, 200, JSON.parse(fs.readFileSync(p)));
        }

        if (url.includes('/auth/signup') && method === 'POST') {
            const { name, email, password } = body;
            if (!name || !email || !password) return json(res, 400, { message: 'Missing fields' });
            if (await User.findOne({ email })) return json(res, 400, { message: 'User already exists' });
            const hashed = await bcrypt.hash(password, 10);
            const user = await User.create({ name, email, password: hashed });
            return json(res, 201, { user: { name: user.name, email: user.email } });
        }

        if (url.includes('/auth/login') && method === 'POST') {
            const { email, password } = body;
            const user = await User.findOne({ email });
            if (!user || !user.password) return json(res, 400, { message: 'Invalid credentials' });
            if (!await bcrypt.compare(password, user.password)) return json(res, 400, { message: 'Invalid credentials' });
            return json(res, 200, { user: { name: user.name, email: user.email } });
        }

        if (url.includes('/auth/google') && method === 'POST') {
            const { email, name, googleId } = body;
            let user = await User.findOne({ email });
            if (!user) user = await User.create({ name, email, googleId });
            return json(res, 200, { user: { name: user.name, email: user.email } });
        }

        if (url.includes('/owner/signup') && method === 'POST') {
            const { name, email, password } = body;
            if (await Owner.findOne({ email })) return json(res, 400, { message: 'Owner already exists' });
            const hashed = await bcrypt.hash(password, 10);
            const owner = await Owner.create({ name, email, password: hashed });
            return json(res, 201, { user: { name: owner.name, email: owner.email } });
        }

        if (url.includes('/owner/login') && method === 'POST') {
            const { email, password } = body;
            const owner = await Owner.findOne({ email });
            if (!owner || !owner.password) return json(res, 400, { message: 'Invalid credentials' });
            if (!await bcrypt.compare(password, owner.password)) return json(res, 400, { message: 'Invalid credentials' });
            return json(res, 200, { user: { name: owner.name, email: owner.email } });
        }

        if (url.includes('/owner/google') && method === 'POST') {
            const { email, name, googleId } = body;
            let owner = await Owner.findOne({ email });
            if (!owner) owner = await Owner.create({ name, email, googleId });
            return json(res, 200, { user: { name: owner.name, email: owner.email } });
        }

        if (url.includes('/events')) {
            if (method === 'GET') return json(res, 200, await Event.find().sort({ createdAt: -1 }));
            if (method === 'POST') return json(res, 201, await Event.create(body));
        }

        if (url.includes('/logs')) {
            if (method === 'GET') return json(res, 200, await AccessLog.find().sort({ timestamp: -1 }).limit(50));
            if (method === 'POST') return json(res, 201, await AccessLog.create(body));
        }

        if (url.includes('/waitlist') && method === 'POST') {
            if (await Waitlist.findOne({ email: body.email })) return json(res, 409, { message: 'Already on waitlist' });
            return json(res, 201, await Waitlist.create({ email: body.email }));
        }

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
