import { AccessLog, Waitlist, Contact } from '../lib/models.js';
import { sendJSON, sendError } from '../utils/responses.js';

export const handleAccessLogs = async (req, res, method, body) => {
    try {
        if (method === 'GET') {
            const logs = await AccessLog.find().sort({ timestamp: -1 }).limit(50);
            return sendJSON(res, 200, logs);
        }
        if (method === 'POST') {
            const newLog = await AccessLog.create(body);
            return sendJSON(res, 201, newLog);
        }
    } catch (err) {
        return sendError(res, 500, 'Failed to process access log', err.message);
    }
};

export const handleWaitlist = async (req, res, body) => {
    try {
        if (!body.email) return sendError(res, 400, 'Email is required for waitlist');
        
        const existing = await Waitlist.findOne({ email: body.email });
        if (existing) return sendError(res, 409, 'Already on waitlist');
        
        const entry = await Waitlist.create({ email: body.email });
        return sendJSON(res, 201, entry);
    } catch (err) {
        return sendError(res, 500, 'Failed to join waitlist', err.message);
    }
};

export const handleContact = async (req, res, body) => {
    try {
        const contactMessage = await Contact.create(body);
        return sendJSON(res, 201, contactMessage);
    } catch (err) {
        return sendError(res, 500, 'Failed to submit contact form', err.message);
    }
};
