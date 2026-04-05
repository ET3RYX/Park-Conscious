import jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_65271829";

export function normalizeEvent(evt) {
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

export const json = (res, status, data) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = status;
    res.end(JSON.stringify(data));
};

export const verifyUser = (req) => {
    const cookies = parse(req.headers.cookie || '');
    let token = cookies.token;
    
    // Fallback: Check Authorization header (used by AdminPanel)
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    if (!token) return null;
    try { return jwt.verify(token, JWT_SECRET); } catch(e) { return null; }
};

export const issueCookie = (req, res, u) => {
    const host = req.headers.host || '';
    const domain = host.includes('parkconscious.in') ? '.parkconscious.in' : undefined;
    
    // Core payload stabilization: Ensure both id and uid exist
    const payload = { 
        ...u, 
        id: u.id || u._id, 
        uid: u.uid || u.id || u._id 
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.setHeader('Set-Cookie', serialize('token', token, {
        httpOnly: true, secure: true, sameSite: 'lax', domain, maxAge: 7 * 24 * 60 * 60, path: '/'
    }));
    return token;
};

export const setCors = (req, res) => {
    const allowed = [
        'https://events.parkconscious.in', 'https://admin.events.parkconscious.in', 'http://localhost:5173', 'https://parkconscious.in'
    ];
    const origin = req.headers.origin;
    if (allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
    else res.setHeader('Access-Control-Allow-Origin', allowed[0]);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
};

export const getBody = async (req) => {
    const contentType = req.headers['content-type'] || '';
    const method = req.method || 'GET';
    if ((method === 'POST' || method === 'PUT') && !contentType.includes('multipart/form-data')) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString();
        if (raw) {
            try { return JSON.parse(raw); } catch(e) { return {}; }
        }
    }
    return {};
};
