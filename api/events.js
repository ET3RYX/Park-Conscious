import connectDB from './lib/mongodb.js';
import * as models from './lib/models.js';
import { json, setCors, getBody, verifyUser, normalizeEvent } from './lib/utils.js';

const { Event, Discussion, Comment } = models;

export default async function handler(req, res) {
    setCors(req, res);
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    await connectDB();

    // Parse URL cleanly — preserve query string separately
    const fullUrl = req.url || '/';
    const [pathPart, queryPart] = fullUrl.split('?');
    const url = pathPart.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    const method = req.method || 'GET';
    const body = await getBody(req);
    const user = verifyUser(req);

    try {
        // -- Health Check --
        if (url.includes('/health')) {
            return json(res, 200, { status: 'ONLINE', timestamp: new Date().toISOString() });
        }

        // -- Event Management --
        if (url.includes('/events')) {
            const parts = url.split('/');
            const lastPart = parts[parts.length - 1];
            // An individual event is being requested if the last segment looks like a MongoDB ObjectId
            const isIndividual = lastPart && lastPart.length >= 24 && /^[a-f0-9]+$/i.test(lastPart);
            const eventId = isIndividual ? lastPart : null;

            if (url.endsWith('/upload') && method === 'POST') {
                return json(res, 501, { message: 'Image uploads are temporarily disabled.' });
            }

            if (method === 'GET') {
                // Fetch single event
                if (isIndividual) {
                    const event = await Event.findById(eventId).lean();
                    if (!event) return json(res, 404, { message: 'Event not found' });
                    return json(res, 200, normalizeEvent(event));
                }

                // Admin: fetch all events (restricted by role)
                if (url.includes('admin/all')) {
                    if (!user) {
                        console.warn(`[EVENT API] Unauthorized access attempt from ${req.headers.host}`);
                        return json(res, 401, { message: 'Auth required' });
                    }
                    
                    console.log(`[EVENT API] Session: ${user.email} (${user.role}) fetching admin registry`);
                    
                    let query = {};
                    if (user.role !== 'superadmin' && user.role !== 'admin') {
                        query.organizerId = user.id;
                        console.log(`[EVENT API] Scope restricted to UID: ${user.id}`);
                    }

                    const list = await Event.find(query).sort({ date: 1 }).lean();
                    console.log(`[EVENT API] Successfully resolved ${list.length} events for ${user.role}`);
                    return json(res, 200, list.map(normalizeEvent));
                }

                // Public: fetch published events, fallback to all
                let evts = await Event.find({ status: { $in: ['published', 'Published'] } }).sort({ date: 1 }).lean();
                if (!evts.length) {
                    evts = await Event.find().sort({ createdAt: -1 }).limit(20).lean();
                }
                return json(res, 200, evts.map(normalizeEvent));
            }

            if (method === 'POST') {
                if (!user) return json(res, 401, { message: 'Auth required' });
                const event = await Event.create({ ...body, organizerId: user.id });
                return json(res, 201, normalizeEvent(event.toObject()));
            }

            if (method === 'PUT' && isIndividual) {
                if (!user) return json(res, 401, { message: 'Auth required' });
                
                const event = await Event.findById(eventId);
                if (!event) return json(res, 404, { message: 'Event not found' });
                
                // Permission Check: Superadmin or the exact organizer
                if (user.role !== 'superadmin' && String(event.organizerId) !== String(user.id)) {
                    return json(res, 403, { message: 'Access Denied: You do not own this event' });
                }

                const updated = await Event.findByIdAndUpdate(eventId, body, { new: true }).lean();
                return json(res, 200, normalizeEvent(updated));
            }

            if (method === 'DELETE' && isIndividual) {
                if (!user) return json(res, 401, { message: 'Auth required' });
                
                const event = await Event.findById(eventId);
                if (!event) return json(res, 404, { message: 'Event not found' });

                // Permission Check: Superadmin or the exact organizer
                if (user.role !== 'superadmin' && String(event.organizerId) !== String(user.id)) {
                    return json(res, 403, { message: 'Access Denied: You do not own this event' });
                }

                await Event.findByIdAndDelete(eventId);
                return json(res, 200, { message: 'Event removed' });
            }
        }
        // -- Parkings (Public) --
        if (url.includes('/parking') && method === 'GET') {
            const parkings = await models.Parking.find({ 
                Status: { $in: ["Active", "Recommended", "active"] } 
            }).lean();
            return json(res, 200, parkings);
        }

        // -- Discussions & Comments --
        if (url.includes('/discussions')) {
            if (method === 'GET') {
                const params = new URLSearchParams(queryPart || '');
                const id = params.get('id');
                if (id) {
                    const disc = await Discussion.findById(id).lean();
                    const comms = await Comment.find({ discussionId: id }).sort({ createdAt: -1 }).lean();
                    return json(res, 200, { ...disc, comments: comms });
                }
                return json(res, 200, await Discussion.find().sort({ createdAt: -1 }).lean());
            }
            if (method === 'POST') {
                if (!user) return json(res, 401, { message: 'Auth required' });
                const disc = await Discussion.create({ ...body, authorUid: user.id, authorName: user.name });
                return json(res, 201, disc.toObject());
            }
        }

        return json(res, 404, { message: 'Events endpoint not matched: ' + url });
    } catch (err) {
        console.error('[EVENT ERROR]:', err);
        return json(res, 500, { message: 'Internal Server Error', error: err.message });
    }
}
