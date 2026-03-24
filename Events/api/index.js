import connectDB from './lib/mongodb.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// ─── CORS + JSON helper ──────────────────────────────────────────────────────
function json(res, status, data) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = status;
    res.end(JSON.stringify(data));
}

// ─── Main Handler ──────────────────────────────────────────────────────────
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    // req.url is the ORIGINAL URL even after Vercel rewrites
    const url    = req.url || '';
    const method = req.method || 'GET';
    const cleanUrl = url.split('?')[0];

    // Parse body for POST if not already done by Vercel
    let body = req.body;
    if (!body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const raw = Buffer.concat(chunks).toString();
            if (raw) body = JSON.parse(raw);
            req.body = body;
        } catch (e) { /* body might be empty */ }
    }

    try {

        // ── Health ──────────────────────────────────────────────────────────
        if (cleanUrl === '/api' || cleanUrl === '/api/' || cleanUrl === '/') {
            return json(res, 200, { status: 'API Live' });
        }

        // ── Payment routes — NO MongoDB needed, handle first ────────────────
        if (cleanUrl === '/api/pay') {
            const { default: h } = await import('./_routes/pay.js');
            return h(req, res);
        }
        if (cleanUrl === '/api/payment-callback') {
            const { default: h } = await import('./_routes/payment-callback.js');
            return h(req, res);
        }
        if (cleanUrl === '/api/callback') {
            const { default: h } = await import('./_routes/callback.js');
            return h(req, res);
        }

        // ── Routes that need MongoDB ────────────────────────────────────────
        if (cleanUrl === '/api/tickets') {
            const { default: h } = await import('./_routes/tickets.js');
            return h(req, res);
        }
        if (cleanUrl === '/api/discussions') {
            const { default: h } = await import('./_routes/discussions.js');
            return h(req, res);
        }
        if (cleanUrl === '/api/discussion-details') {
            const { default: h } = await import('./_routes/discussion-details.js');
            return h(req, res);
        }
        if (cleanUrl === '/api/discussion-comments') {
            const { default: h } = await import('./_routes/discussion-comments.js');
            return h(req, res);
        }
        if (cleanUrl === '/api/google-auth') {
            const { default: h } = await import('./_routes/google-auth.js');
            return h(req, res);
        }
        if (cleanUrl === '/api/debug-env') {
            const { default: h } = await import('./_routes/debug-env.js');
            return h(req, res);
        }

        // ── Legacy routes (need DB) ─────────────────────────────────────────
        await connectDB();
        const { User, Owner, Event, AccessLog, Waitlist, Contact } = await import('./lib/models.js');

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

        return json(res, 404, { message: 'Route not found', url, method });

    } catch (err) {
        console.error('Handler error:', err);
        return json(res, 500, { message: 'Server error', error: err.message });
    }
}
