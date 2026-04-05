import connectDB from './lib/mongodb.js';
import * as models from './lib/models.js';
import { json, setCors, getBody, verifyUser, normalizeEvent, normalizeUrl } from './lib/utils.js';

const { Event, Discussion, Comment } = models;

export default async function handler(req, res) {
    setCors(req, res);
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    await connectDB();
    const url = normalizeUrl(req.url);
    const method = req.method || 'GET';
    const body = await getBody(req);
    const user = verifyUser(req);

    try {
        if (url.includes('/api/health')) {
            return json(res, 200, { status: 'ONLINE' });
        }

        // -- Event Management --
        if (url.includes('/events')) {
            const parts = url.split('/');
            const eventId = parts.pop();
            const isIndividual = eventId && eventId.length >= 24;

            if (url.endsWith('/upload') && method === 'POST') {
                return json(res, 501, { message: 'Image uploads are temporarily disabled. Please deploy the event without an image for now.' });
            }

            if (method === 'GET') {
                if (isIndividual) {
                    const event = await Event.findById(eventId).lean();
                    return json(res, 200, normalizeEvent(event));
                }
                const isAdmin = url.includes('/admin/all');
                // -- Main Events Discovery --
                if (url === '/api/events' && method === 'GET') {
                    let evts = await Event.find({ status: 'published' }).sort({ date: 1 }).lean();
                    if (!evts.length) {
                        console.log('[EVENTS API]: No published events, falling back to all catalog items');
                        evts = await Event.find().sort({ date: 1 }).limit(12).lean();
                    }
                    return json(res, 200, evts.map(normalizeEvent));
                }
                const filter = isAdmin ? {} : { status: { $in: ['published', 'Published'] } };
                const list = await Event.find(filter).sort({ date: 1 }).lean();
                return json(res, 200, list.map(normalizeEvent));
            }

            if (method === 'POST') {
                if (!user) return json(res, 401, { message: 'Auth required' });
                const event = await Event.create({ ...body, organizerId: user.id });
                return json(res, 201, normalizeEvent(event));
            }

            if (method === 'PUT' && isIndividual) {
                if (!user) return json(res, 401, { message: 'Auth required' });
                const updated = await Event.findByIdAndUpdate(eventId, body, { new: true }).lean();
                return json(res, 200, normalizeEvent(updated));
            }

            if (method === 'DELETE' && isIndividual) {
                if (!user) return json(res, 401, { message: 'Auth required' });
                await Event.findByIdAndDelete(eventId);
                return json(res, 200, { message: 'Event removed' });
            }
        }

        // -- Discussions & Comments --
        if (url.includes('/discussions')) {
            if (method === 'GET') {
                const id = new URLSearchParams(url.split('?')[1]).get('id');
                if (id) {
                    const disc = await Discussion.findById(id).lean();
                    const comms = await Comment.find({ discussionId: id }).sort({ createdAt: -1 }).lean();
                    return json(res, 200, { ...disc, comments: comms });
                }
                return json(res, 200, await Discussion.find().sort({ createdAt: -1 }));
            }
            if (method === 'POST') {
                if (!user) return json(res, 401, { message: 'Auth required' });
                const disc = await Discussion.create({ ...body, authorUid: user.id, authorName: user.name });
                return json(res, 201, disc);
            }
        }

        return json(res, 404, { message: 'Events/Discussions endpoint not matched' });
    } catch (err) {
        console.error('[EVENT ERROR]:', err);
        return json(res, 500, { message: 'Internal Server Error', error: err.message });
    }
}
