import bcrypt from 'bcryptjs';
import connectDB from './lib/mongodb.js';
import * as models from './lib/models.js';
import crypto from 'crypto';
import { json, setCors, getBody, verifyUser, normalizeEvent } from './lib/utils.js';

const { Booking, Event, User, Owner, Parking } = models;

export default async function handler(req, res) {
    setCors(req, res);
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    await connectDB();

    const fullUrl = req.url || '/';
    const url = fullUrl.split('?')[0].replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    const method = req.method || 'GET';
    const body = await getBody(req);
    const user = verifyUser(req);

    try {
        // -- Admin Attendees/Bookings List --
        if (url.includes('bookings/all') && method === 'GET') {
            if (!user) return json(res, 401, { message: 'Authentication required. Please log in again.' });
            if (user.role !== 'admin') return json(res, 403, { message: 'Access Denied: Admin role required' });
            
            const bookings = await Booking.find().sort({ createdAt: -1 }).limit(200).lean();
            console.log(`[ADMIN API] Bookings fetched: ${bookings.length}`);
            
            // Gather unique IDs to fetch in bulk
            const eventIds = new Set();
            const userOwnerIds = new Set();
            for (let b of bookings) {
                const eid = String(b.eventId || '');
                if (eid && eid.length === 24 && /^[a-f0-9]+$/i.test(eid)) eventIds.add(eid);
                const uid = String(b.userId || '');
                if (uid && uid.length === 24 && /^[a-f0-9]+$/i.test(uid)) userOwnerIds.add(uid);
            }
            
            // Fetch everything in parallel
            const [eventsList, usersList, ownersList] = await Promise.all([
               Event.find({ _id: { $in: Array.from(eventIds) } }).lean(),
               User.find({ _id: { $in: Array.from(userOwnerIds) } }).lean(),
               Owner.find({ _id: { $in: Array.from(userOwnerIds) } }).lean()
            ]);
            
            // Build fast lookup maps
            const eventMap = {};
            eventsList.forEach(e => eventMap[String(e._id)] = normalizeEvent(e));
            
            const userMap = {};
            usersList.forEach(u => userMap[String(u._id)] = u.name);
            ownersList.forEach(o => userMap[String(o._id)] = o.name);
            
            // Assemble final response
            for (let b of bookings) {
                const eid = String(b.eventId || '');
                if (eventMap[eid]) b.event = eventMap[eid];
                
                let resolvedName = String(b.userId || 'Guest');
                if (userMap[resolvedName]) resolvedName = userMap[resolvedName];

                b.user = { 
                    name: resolvedName, 
                    email: b.email || b.phone || 'N/A' 
                };
            }
            
            return json(res, 200, bookings);
        }

        // -- Parking Management (Admin/Owner) --
        if (url.includes('/owner/') && url.includes('/parkings')) {
             if (!user) return json(res, 401, { message: 'Auth required' });
             
             const parts = url.split('/');
             const ownerId = parts[parts.indexOf('owner') + 1];
             
             if (method === 'GET') return json(res, 200, await Parking.find({ owner: ownerId }).lean());
             if (method === 'POST') {
                 const p = await Parking.create({ 
                     ...body, 
                     owner: ownerId, 
                     ID: "PRK_" + crypto.randomUUID().slice(0, 6).toUpperCase() 
                 });
                 return json(res, 201, p.toObject());
             }
        }

        return json(res, 404, { message: 'Admin endpoint not matched: ' + url });
    } catch (err) {
        console.error('[ADMIN ERROR]:', err);
        return json(res, 500, { message: 'Internal Server Error', error: err.message });
    }
}
