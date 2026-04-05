import connectDB from './lib/mongodb.js';
import * as models from './lib/models.js';
import crypto from 'crypto';
import { json, setCors, getBody, verifyUser, normalizeEvent } from './lib/utils.js';

const { Booking, Event, User, Owner, Parking } = models;

export default async function handler(req, res) {
    setCors(req, res);
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    await connectDB();
    const url = req.url || '';
    const method = req.method || 'GET';
    const body = await getBody(req);
    const user = verifyUser(req);

    try {
        // -- Admin Attendees Management --
        if (url.includes('bookings/all') && method === 'GET') {
            if (!user || user.role !== 'admin') return json(res, 401, { message: 'Admin Auth required' });
            
            const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
            console.log(`[ADMIN API] Bookings fetched: ${bookings.length}`);
            
            // Rich enrichment: Hex-ID Resolution + Event Normalization with Safety Guards
            for (let b of bookings) {
                try {
                    const eid = String(b.eventId || '');
                    if (eid && eid.length === 24) {
                        const evt = await Event.findById(eid).lean();
                        if (evt) b.event = normalizeEvent(evt);
                    }
                    
                    let resolvedName = String(b.userId || 'Guest');
                    if (resolvedName.length === 24) {
                        const u = await User.findById(resolvedName).lean();
                        if (u && u.name) resolvedName = u.name;
                        else {
                            const o = await Owner.findById(resolvedName).lean();
                            if (o && o.name) resolvedName = o.name;
                        }
                    }

                    b.user = { 
                        name: resolvedName, 
                        email: b.email || b.phone || 'N/A' 
                    };
                } catch(e) {
                    console.error('[ADMIN LIST ENRICHMENT ERROR]:', e);
                    b.user = { name: String(b.userId || 'Guest'), email: 'N/A' };
                }
            }
            
            return json(res, 200, bookings);
        }

        // -- Parking Management (Admin/Owner) --
        if (url.includes('/owner/') && url.includes('/parkings')) {
             if (!user) return json(res, 401, { message: 'Auth required' });
             
             const parts = url.split('/');
             const ownerId = parts[parts.indexOf('owner') + 1];
             
             if (method === 'GET') return json(res, 200, await Parking.find({ owner: ownerId }));
             if (method === 'POST') {
                 const p = await Parking.create({ 
                     ...body, 
                     owner: ownerId, 
                     ID: "PRK_" + crypto.randomUUID().slice(0, 6).toUpperCase() 
                 });
                 return json(res, 201, p);
             }
        }

        return json(res, 404, { message: 'Admin/Parking endpoint not matched' });
    } catch (err) {
        console.error('[ADMIN ERROR]:', err);
        return json(res, 500, { message: 'Internal Server Error', error: err.message });
    }
}
