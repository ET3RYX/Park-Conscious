import connectDB from './lib/mongodb.js';
import * as models from './lib/models.js';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import { json, setCors, getBody, verifyUser, issueCookie, normalizeUrl } from './lib/utils.js';

const { User, Owner } = models;

export default async function handler(req, res) {
    setCors(req, res);
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    await connectDB();
    const url = normalizeUrl(req.url);
    const method = req.method || 'GET';
    const body = await getBody(req);

    try {
        if (url.includes('/login') && method === 'POST') {
            const { email, password } = body;
            const rawEmail = (email || '').toLowerCase();
            let searchEmails = [rawEmail];
            if (rawEmail.endsWith('.com')) searchEmails.push(rawEmail.replace('.com', '.in'));
            else if (rawEmail.endsWith('.in')) searchEmails.push(rawEmail.replace('.in', '.com'));

            let u = null;
            let isOwner = false;
            for (const semail of searchEmails) {
                u = await User.findOne({ email: semail });
                if (!u) { u = await Owner.findOne({ email: semail }); isOwner = !!u; }
                if (u) break;
            }

            if (!u || !await bcrypt.compare(password, u.password)) return json(res, 401, { message: 'Invalid credentials' });
            
            const payload = { 
                id: String(u._id), 
                uid: String(u._id), // Backwards compatibility for Events project
                name: u.name, 
                email: u.email, 
                role: isOwner ? 'admin' : 'user' 
            };
            const token = issueCookie(req, res, payload);
            return json(res, 200, { user: payload, token });
        }

        if (url.includes('/logout') && method === 'POST') {
            const host = req.headers.host || '';
            const domain = host.includes('parkconscious.in') ? '.parkconscious.in' : undefined;
            res.setHeader('Set-Cookie', serialize('token', '', {
                httpOnly: true, secure: true, sameSite: 'lax', domain, maxAge: -1, path: '/'
            }));
            return json(res, 200, { message: 'Logged out successfully' });
        }

        if (url.includes('/google') && method === 'POST') {
            const { email, name, googleId } = body;
            if (!email) return json(res, 400, { message: 'Email required for Google Auth' });
            
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

            const payload = { 
                id: u._id, 
                uid: u._id, 
                name: u.name, 
                email: u.email, 
                role: isOwner ? 'admin' : 'user' 
            };
            const token = issueCookie(req, res, payload);
            return json(res, 200, { user: payload, token, message: 'Logged in with Google' });
        }

        if (url.includes('/me') && method === 'GET') {
            const decoded = verifyUser(req);
            if (!decoded) return json(res, 401, { authenticated: false });
            return json(res, 200, { authenticated: true, user: decoded });
        }

        // Legacy owner check
        if (url.includes('/owner/check-session')) {
            const email = new URLSearchParams(url.split('?')[1]).get('email');
            const owner = await Owner.findOne({ email: email?.toLowerCase() });
            if (!owner) return json(res, 404, { message: 'NotFound' });
            return json(res, 200, { user: { id: owner._id, name: owner.name, email: owner.email } });
        }

        return json(res, 404, { message: 'Auth endpoint not matched' });
    } catch (err) {
        console.error('[AUTH ERROR]:', err);
        return json(res, 500, { message: 'Internal Server Error', error: err.message });
    }
}
