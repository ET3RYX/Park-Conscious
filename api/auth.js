import connectDB from './lib/mongodb.js';
import * as models from './lib/models.js';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import { json, setCors, getBody, verifyUser, issueCookie } from './lib/utils.js';

const { User, Owner } = models;

export default async function handler(req, res) {
    setCors(req, res);
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    const fullUrl = req.url || '/';
    const [pathPart, queryPart] = fullUrl.split('?');
    const url = pathPart.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    const method = req.method || 'GET';
    const body = await getBody(req);

    try {
        await connectDB();
        
        // -- Login --
        if ((url.includes('/login') || url.endsWith('/auth/login')) && method === 'POST') {
            const { email, password } = body;
            const search = (email || '').toLowerCase().trim();
            
            // PRIORITY: Check Owner first to ensure Admin role takes precedence
            let u = await Owner.findOne({ email: search });
            let isOwner = !!u;
            
            if (!u) {
                u = await User.findOne({ email: search });
                isOwner = false;
            }

            if (!u) return json(res, 401, { message: 'Invalid credentials' });
            if (u.password && !await bcrypt.compare(password, u.password)) {
                return json(res, 401, { message: 'Invalid credentials' });
            }
            
            const payload = { 
                id: String(u._id), 
                uid: String(u._id),
                name: u.name, 
                email: u.email, 
                role: isOwner ? (u.role || 'organizer').toLowerCase() : 'user' 
            };
            const token = issueCookie(req, res, payload);
            return json(res, 200, { user: payload, token });
        }

        // -- Logout --
        if (url.includes('/logout') && method === 'POST') {
            // Unconditionally clear from the root domain and the host
            const rootDomain = '.parkconscious.in';
            const clearHeaders = [
                serialize('token', '', { httpOnly: true, secure: true, sameSite: 'lax', domain: rootDomain, maxAge: -1, path: '/' }),
                serialize('token', '', { httpOnly: true, secure: true, sameSite: 'lax', maxAge: -1, path: '/' })
            ];

            res.setHeader('Set-Cookie', clearHeaders);
            return json(res, 200, { message: 'Logged out successfully globally' });
        }

        // -- Google Auth --
        if (url.includes('/google') && method === 'POST') {
            const { email, name, googleId } = body;
            if (!email) return json(res, 400, { message: 'Email required for Google Auth' });
            
            const search = email.toLowerCase();
            
            // PRIORITY: Check Owner first
            let u = await Owner.findOne({ email: search });
            let isOwner = !!u;
            
            if (!u) {
                u = await User.findOne({ email: search });
                isOwner = false;
            }

            if (!u) {
                u = await User.create({ name, email: search, googleId });
                isOwner = false;
            } else {
                let changed = false;
                if (!u.googleId) {
                    u.googleId = googleId;
                    changed = true;
                }
                // Unconditional name sync - force "Piyush" over placeholder names
                if (u.name !== name) {
                    u.name = name;
                    changed = true;
                }
                if (changed) await u.save();
            }

            const payload = { 
                id: String(u._id), 
                uid: String(u._id), 
                name: u.name, 
                email: u.email, 
                role: isOwner ? (u.role || 'organizer').toLowerCase() : 'user' 
            };
            const token = issueCookie(req, res, payload);
            return json(res, 200, { user: payload, token, message: 'Logged in with Google' });
        }

        // -- Session Check --
        if (url.includes('/me') && method === 'GET') {
            const decoded = verifyUser(req);
            if (!decoded) return json(res, 401, { authenticated: false });
            
            const host = req.headers.host || '';
            const isAdminHost = host.includes('admin.events');
            
            // Firewall: Ensure the user's role matches the portal they are accessing
            const isPortalAdmin = decoded.role === 'admin' || decoded.role === 'superadmin' || decoded.role === 'organizer' || decoded.role === 'owner';
            
            if (!isPortalAdmin && isAdminHost) {
                return json(res, 401, { authenticated: false, message: 'Public sessions not allowed on admin portal' });
            }

            return json(res, 200, { authenticated: true, user: decoded });
        }

        // -- Legacy owner check --
        if (url.includes('/owner/check-session')) {
            const params = new URLSearchParams(queryPart || '');
            const email = params.get('email');
            const owner = await Owner.findOne({ email: email?.toLowerCase() });
            if (!owner) return json(res, 404, { message: 'NotFound' });
            return json(res, 200, { user: { id: owner._id, name: owner.name, email: owner.email } });
        }

        return json(res, 404, { message: 'Auth endpoint not matched: ' + url });
    } catch (err) {
        if (err.missingConfig) {
             return json(res, 200, { authenticated: false, missingConfig: true, message: 'Database Connection Missing' });
        }
        console.error('[AUTH ERROR]:', err);
        return json(res, 500, { message: 'Internal Server Error', error: err.message });
    }
}
