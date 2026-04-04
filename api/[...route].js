// ─── FINAL LAST RESORT SAFE BOOT HANDLER ────────────────────────────
// This version uses Dynamic Imports to capture and report initialization errors.

export default async function handler(req, res) {
    // 1. Initial Headers (CORS)
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

    const json = (status, data) => {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = status;
        res.end(JSON.stringify(data));
    };

    try {
        // 2. Safe Dynamic Imports (Capture potential Module Initialization crashes)
        const [
            { default: mongoose },
            { default: connectDB },
            models,
            { default: bcrypt },
            jwt,
            { parse, serialize },
            { default: axios },
            { v2: cloudinary },
            { default: Busboy }
        ] = await Promise.all([
            import('mongoose'),
            import('./lib/mongodb.js'),
            import('./lib/models.js'),
            import('bcryptjs'),
            import('jsonwebtoken'),
            import('cookie'),
            import('axios'),
            import('cloudinary'),
            import('busboy')
        ]);

        const { User, Owner, Event, Parking, Booking, Discussion, Comment } = models;
        const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_for_dev_mode";

        // 3. Helper: Auth Verification
        const verifyUser = (r) => {
            const cookies = parse(r.headers.cookie || '');
            const token = cookies.token;
            if (!token) return null;
            try { return jwt.verify(token, JWT_SECRET); } catch(e) { return null; }
        };

        const issueCookie = (r, u) => {
            const host = r.headers.host || '';
            const domain = host.includes('parkconscious.in') ? '.parkconscious.in' : undefined;
            const secure = host.includes('parkconscious.in') || r.headers['x-forwarded-proto'] === 'https';
            const token = jwt.sign(u, JWT_SECRET, { expiresIn: '7d' });
            res.setHeader('Set-Cookie', serialize('token', token, {
                httpOnly: true, secure, sameSite: 'lax', domain, maxAge: 7 * 24 * 60 * 60, path: '/'
            }));
            return token;
        };

        const url = req.url || '';
        const method = req.method || 'GET';
        const contentType = req.headers['content-type'] || '';

        // 4. Body Parser (Non-blocking for Vercel)
        let body = req.body || {};
        if ((method === 'POST' || method === 'PUT') && !contentType.includes('multipart/form-data') && (!req.body || Object.keys(req.body).length === 0)) {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const raw = Buffer.concat(chunks).toString();
            if (raw) body = JSON.parse(raw);
        }

        // 5. DB Connectivity
        try { await connectDB(); } 
        catch (dbE) { return json(500, { status: "DB_FAILURE", error: dbE.message }); }

        // --- ROUTES ---

        // Health check
        if (url.includes('/api/health') || url === '/api' || url === '/api/') {
            return json(200, { 
                status: 'API SAFE BOOT ACTIVE', 
                db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
                timestamp: new Date().toISOString()
            });
        }

        // Auth: Me
        if (url.includes('/auth/me') && method === 'GET') {
            const decoded = verifyUser(req);
            if (!decoded) return json(401, { authenticated: false });
            let user = await User.findById(decoded.id);
            let isOwner = false;
            if (!user) { user = await Owner.findById(decoded.id); isOwner = !!user; }
            if (!user) return json(401, { authenticated: false });
            return json(200, { authenticated: true, user: { id: user._id, email: user.email, name: user.name, role: isOwner ? 'admin' : 'user' } });
        }

        // Auth: Login
        if (url.includes('/auth/login') && method === 'POST') {
            const { email, password } = body;
            const searchEmail = (email || '').toLowerCase();
            let user = await User.findOne({ email: searchEmail });
            let isOwner = false;
            if (!user) { user = await Owner.findOne({ email: searchEmail }); isOwner = !!user; }
            if (!user || !user.password) return json(401, { message: 'Authentication failed' });
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return json(401, { message: 'Authentication failed' });
            
            const payload = { id: user._id, name: user.name, email: user.email, role: isOwner ? 'admin' : 'user' };
            const token = issueCookie(req, payload);
            return json(200, { user: payload, token });
        }

        // Events: Grid Fetch
        if (url.includes('/events') && method === 'GET') {
            const isAdmin = url.includes('/admin/all');
            const filter = isAdmin ? {} : { status: { $in: ['published', 'Published', 'draft'] } };
            let evts = await Event.find(filter).sort({ date: 1 });
            if (evts.length === 0 && !isAdmin) evts = await Event.find({}).limit(10).sort({ date: 1 });
            return json(200, evts);
        }

        // Admin Seed
        if (url.includes('/auth/seed-admin') && method === 'GET') {
            const hashed = await bcrypt.hash('admin1234', 10);
            const adminEmail = 'admin@parkconscious.com';
            await User.deleteMany({ email: adminEmail });
            let owner = await Owner.findOne({ email: adminEmail });
            if (!owner) owner = await Owner.create({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin' });
            else { owner.password = hashed; owner.role = 'admin'; await owner.save(); }
            return json(200, { message: 'Admin seeded successfully' });
        }

        // Fallback
        return json(404, { message: 'Route not found in Safe Boot Handler' });

    } catch (bootError) {
        // --- CRITICAL ERROR CAPTURE ---
        // This is THE most important block. It ensures a JSON error instead of a 500 crash.
        console.error('[SAFE BOOT CRASH]:', bootError);
        return json(500, { 
            status: "SAFE_BOOT_FAILURE", 
            message: "A critical initialization error prevented the API from booting.",
            error: bootError.message,
            stack: bootError.stack
        });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
