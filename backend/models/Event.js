import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['concert', 'festival', 'summit', 'culture'],
        lowercase: true
    },
    venue: {
        type: String,
        required: true,
        trim: true
    },
    venueCity: {
        type: String,
        default: 'Delhi NCR'
    },
    attendees: {
        type: String,
        default: 'Upcoming'
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'
    },
    badge: {
        type: String,
        default: 'NEW'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
