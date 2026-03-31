import { Event } from '../lib/models.js';
import { sendJSON, sendError } from '../utils/responses.js';
import { uploadImage } from '../services/cloudinary.service.js';

export const handleEventsList = async (req, res, url) => {
    try {
        const parts = url.split('/');
        const lastPart = parts.pop() || parts.pop();
        
        // Fetch single event by ID if present
        if (lastPart && lastPart.length > 20 && lastPart !== 'events' && lastPart !== 'all') {
            const evt = await Event.findById(lastPart);
            if (!evt) return sendError(res, 404, 'Event not found');
            return sendJSON(res, 200, evt);
        }

        const isAdmin = url.includes('/admin/all');
        const filter = isAdmin ? {} : { status: 'published' };
        const evts = await Event.find(filter).sort({ date: 1 });
        return sendJSON(res, 200, evts);
    } catch (err) {
        return sendError(res, 500, 'Failed to fetch events', err.message);
    }
};

export const handleEventCreate = async (req, res, body) => {
    try {
        const { 
            title, description, date, endDate, locationName, locationAddress, lat, lng,
            images, category, price, capacity, status 
        } = body;
        
        const newEvent = await Event.create({
            title, description, date, endDate,
            location: {
                name: locationName,
                address: locationAddress,
                coordinates: { lat, lng }
            },
            images, category, 
            price: parseInt(price) || 0,
            capacity: parseInt(capacity) || 0,
            status: status || 'draft'
        });
        return sendJSON(res, 201, newEvent);
    } catch (err) {
        return sendError(res, 500, 'Failed to create event', err.message);
    }
};

export const handleEventUpdate = async (req, res, url, body) => {
    try {
        const id = url.split('/').pop();
        const updated = await Event.findByIdAndUpdate(id, {
            $set: {
                title: body.title,
                description: body.description,
                date: body.date,
                endDate: body.endDate,
                'location.name': body.locationName,
                'location.address': body.locationAddress,
                'location.coordinates.lat': body.lat,
                'location.coordinates.lng': body.lng,
                images: body.images,
                category: body.category,
                price: parseInt(body.price),
                capacity: parseInt(body.capacity),
                status: body.status
            }
        }, { new: true });
        
        if (!updated) return sendError(res, 404, 'Event not found');
        return sendJSON(res, 200, updated);
    } catch (err) {
        return sendError(res, 500, 'Failed to update event', err.message);
    }
};

export const handleImageUpload = async (req, res) => {
    try {
        const url = await uploadImage(req);
        return sendJSON(res, 200, { url });
    } catch (err) {
        const statusCode = err.message.includes('file detected') ? 400 : 500;
        return sendError(res, statusCode, err.message);
    }
};
