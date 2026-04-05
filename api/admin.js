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
        // -- TEMP: List all owners and reset password (REMOVE AFTER USE) --
        if (url.includes('/admin/debug-reset') && method === 'POST') {
            const owners = await Owner.find({}, 'email name').lean();
            const users = await User.find({ email: /admin/i }, 'email name').lean();
            const newHash = await bcrypt.hash('ParkAdmin@2026', 10);
            // Reset ALL owner passwords to the new one
            await Owner.updateMany({}, { password: newHash });
            return json(res, 200, { 
                owners, 
                adminUsers: users,
                message: 'All owner passwords reset to: ParkAdmin@2026',
                hint: 'Use any email from the owners list above to login'
            });
        }

        // -- Admin Attendees/Bookings List --
        if (url.includes('bookings/all') && method === 'GET') {
            if (!user) return json(res, 401, { message: 'Authentication required. Please log in again.' });
            if (user.role !== 'admin') return json(res, 403, { message: 'Access Denied: Admin role required' });
            
            const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
            console.log(`[ADMIN API] Bookings fetched: ${bookings.length}`);
            
            for (let b of bookings) {
                try {
                    const eid = String(b.eventId || '');
                    if (eid && eid.length === 24 && /^[a-f0-9]+$/i.test(eid)) {
                        const evt = await Event.findById(eid).lean();
                        if (evt) b.event = normalizeEvent(evt);
                    }
                    
                    let resolvedName = String(b.userId || 'Guest');
                    if (resolvedName.length === 24 && /^[a-f0-9]+$/i.test(resolvedName)) {
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
