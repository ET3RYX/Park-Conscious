import bcrypt from 'bcryptjs';
import connectDB from './lib/mongodb.js';
import * as models from './lib/models.js';
import crypto from 'crypto';
import { json, setCors, getBody, verifyUser, normalizeEvent } from './lib/utils.js';
import { Resend } from 'resend';

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
            
            const bookings = await Booking.find({ status: "Confirmed" }).sort({ createdAt: -1 }).limit(200).lean();
            console.log(`[ADMIN API] Confirmed bookings fetched: ${bookings.length}`);
            
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
            usersList.forEach(u => userMap[String(u._id)] = { name: u.name, email: u.email });
            ownersList.forEach(o => userMap[String(o._id)] = { name: o.name, email: o.email });
            
            // Assemble final response
            for (let b of bookings) {
                const eid = String(b.eventId || '');
                
                // Handle special string event IDs used by custom booking pages
                if (eid === 'tedx_ggsipu_2026') {
                    b.event = { title: 'TEDx GGSIPU SANGAM', date: new Date('2026-04-10T10:00:00Z') };
                } else if (eid === 'farewell_2024' || eid === 'afsana_2026') {
                    b.event = { title: 'AFSANA 2026 Farewell', date: new Date('2026-05-25T18:00:00Z') };
                } else if (eventMap[eid]) {
                    b.event = eventMap[eid];
                }
                
                let resolvedName = String(b.userId || 'Guest');
                let resolvedEmail = b.email || b.phone || 'N/A';

                if (userMap[resolvedName]) {
                    const profile = userMap[resolvedName];
                    resolvedName = profile.name;
                    if (resolvedEmail === 'N/A' || !resolvedEmail) resolvedEmail = profile.email;
                }

                b.user = { 
                    name: resolvedName, 
                    email: resolvedEmail
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

        // -- Bulk Emailing --
        if (url.includes('email-batch') && method === 'POST') {
            if (!user || user.role !== 'admin') return json(res, 403, { message: 'Access Denied' });
            
            const { bookingIds } = body;
            if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
                return json(res, 400, { message: 'bookingIds array required' });
            }

            const RESEND_API_KEY = process.env.RESEND_API_KEY;
            if (!RESEND_API_KEY) {
                return json(res, 500, { success: false, message: 'RESEND_API_KEY is not configured in the environment.' });
            }

            const resend = new Resend(RESEND_API_KEY);
            const bookings = await Booking.find({ _id: { $in: bookingIds }, emailSent: { $ne: true } }).lean();
            
            if (bookings.length === 0) {
                return json(res, 200, { success: true, sent: 0, message: 'All requested bookings have already been emailed or not found.' });
            }

            const emailsToSend = [];
            for (let b of bookings) {
                if (!b.email) continue;
                
                const ticketNumber = b.ticketId || b.transactionId || String(b._id).slice(-8);
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticketNumber)}&ecc=L&margin=0`;
                
                let eventName = "Park Events";
                if (b.eventId === "tedx_ggsipu_2026") eventName = "TEDx GGSIPU SANGAM";
                if (b.eventId === "farewell_2024") eventName = "AFSANA '26 Farewell";

                const bName = b.user?.name || "Attendee";
                const htmlContent = `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #050507; color: #ffffff; padding: 40px; border-radius: 16px; text-align: center; border: 1px solid #1f2937;">
                     <div style="margin-bottom: 30px;">
                        <span style="background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Verified Ticket</span>
                     </div>
                     
                     <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">YOUR ENTRY PASS</h1>
                     <p style="color: #9ca3af; margin-bottom: 30px; font-size: 14px;">Hi ${bName}, we are excited to see you at ${eventName}!</p>
                     
                     <div style="background-color: #ffffff; padding: 25px; border-radius: 20px; display: inline-block; margin-bottom: 30px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);">
                        <img src="${qrUrl}" alt="Ticket QR Code" width="220" height="220" style="display: block;" />
                     </div>
                     
                     <div style="background-color: #111827; border: 1px solid #374151; padding: 20px; border-radius: 12px; text-align: left; margin: 0 20px;">
                        <div style="margin-bottom: 12px;">
                           <p style="color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: bold;">Attendee Name</p>
                           <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0;">${bName}</p>
                        </div>
                        <div style="margin-bottom: 12px;">
                           <p style="color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: bold;">Event Title</p>
                           <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0;">${eventName}</p>
                        </div>
                        <div>
                           <p style="color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: bold;">Ticket ID</p>
                           <p style="color: #10b981; font-family: monospace; font-size: 18px; font-weight: bold; margin: 0;">${ticketNumber}</p>
                        </div>
                     </div>
                     
                     <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #1f2937;">
                        <p style="color: #666666; font-size: 11px; margin: 0;">This pass is valid for one person. Do not share this QR code.</p>
                        <p style="color: #4b5563; font-size: 12px; margin-top: 15px; font-weight: 600;">Powered by Park Conscious</p>
                     </div>
                  </div>
                `;

                emailsToSend.push({
                   from: process.env.EMAIL_FROM || 'Park Events <onboarding@resend.dev>',
                   to: b.email,
                   subject: `Your Ticket for ${eventName}`,
                   html: htmlContent
                });
            }

            if (emailsToSend.length === 0) {
               return json(res, 200, { success: true, sent: 0, message: 'No valid emails found.' });
            }

            try {
               const { data, error } = await resend.batch.send(emailsToSend);
               if (error) {
                   console.error("Resend Batch Error:", error);
                   return json(res, 500, { success: false, message: error.message || 'Resend error occurred', details: error });
               }

               const actualEmailedIds = bookings.filter(b => b.email).map(b => b._id);
               await Booking.updateMany(
                   { _id: { $in: actualEmailedIds } },
                   { $set: { emailSent: true } }
               );

               return json(res, 200, { success: true, sent: emailsToSend.length });
            } catch (err) {
               console.error("Email Sending Exception:", err);
               return json(res, 500, { success: false, message: 'Error processing batch', error: String(err) });
            }
        }

        // -- Delete Booking (Admin Only) --
        if (url.includes('bookings/') && method === 'DELETE') {
            if (!user || user.role !== 'admin') return json(res, 403, { message: 'Access Denied' });
            
            const bookingId = url.split('/').pop();
            const booking = await Booking.findById(bookingId);
            if (!booking) return json(res, 404, { message: 'Booking not found' });

            // Restore capacity if it was a real event and was confirmed
            if (booking.status === "Confirmed" && booking.eventId && booking.eventId.length === 24) {
               await Event.findByIdAndUpdate(booking.eventId, { $inc: { capacity: 1 } });
            }

            await Booking.findByIdAndDelete(bookingId);
            return json(res, 200, { success: true, message: 'Booking removed successfully' });
        }

        return json(res, 404, { message: 'Admin endpoint not matched: ' + url });
    } catch (err) {
        console.error('[ADMIN ERROR]:', err);
        return json(res, 500, { message: 'Internal Server Error', error: err.message });
    }
}
