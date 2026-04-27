import connectDB from './lib/mongodb.js';
import * as models from './lib/models.js';
import { json, setCors, getBody } from './lib/utils.js';

const { Contact } = models;

export default async function handler(req, res) {
    setCors(req, res);
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    if (req.method !== 'POST') {
        return json(res, 405, { message: 'Method Not Allowed' });
    }

    try {
        await connectDB();
        const body = await getBody(req);
        const { name, email, message } = body;

        if (!name || !email || !message) {
            return json(res, 400, { message: 'Required fields missing: name, email, message' });
        }

        const contact = await Contact.create({ 
            name, email, message 
        });

        console.log(`[CONTACT API] Success: Created record ${contact._id}`);
        return json(res, 201, { success: true, id: contact._id });
    } catch (err) {
        console.error('[CONTACT ERROR]:', err);
        return json(res, 500, { message: 'Internal Server Error', error: err.message });
    }
}
