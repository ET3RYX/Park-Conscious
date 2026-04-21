import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    date: { type: String, required: true },
    endDate: String,
    location: {
      name: String,
      address: String,
      coordinates: { lat: Number, lng: Number }
    },
    images: [String],
    category: String,
    price: { type: Number, default: 0 },
    capacity: { type: Number, default: 0 },
    status: { type: String, default: 'published' },
    name: String,
    venue: String,
    image: String,
    badge: String
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const tedxId = 'tedx_ggsipu_2026';
        
        // We use a custom ID or just match by title for the slider
        const eventData = {
            title: "TEDx GGSIPU EDC | SANGAM",
            name: "TEDx GGSIPU EDC | SANGAM",
            description: "Theme: SANGAM — Where Ideas, Perspectives, and Voices Converge. The word SANGAM signifies a confluence... meaningful ideas emerge when disciplines interact, cultures engage, and personal experiences encounter new knowledge. Join us for a day of transformation.",
            date: "2026-04-06",
            location: {
                name: "East Delhi Campus (USAR)",
                address: "Guru Gobind Singh Indraprastha University",
                coordinates: { lat: 28.6505, lng: 77.3005 }
            },
            venue: "East Delhi Campus (USAR)",
            images: ["https://res.cloudinary.com/dlyx0r3nn/image/upload/v1741113063/park_conscious/tedx_hero.jpg"],
            image: "https://res.cloudinary.com/dlyx0r3nn/image/upload/v1741113063/park_conscious/tedx_hero.jpg",
            category: "Summits",
            price: 0,
            capacity: 500,
            status: "published",
            badge: "FEATURED"
        };

        // We'll update the existing test events or just add this one
        // To make it show up in the slider, we just need it in the collection
        await Event.findOneAndUpdate(
            { title: "TEDx GGSIPU EDC | SANGAM" },
            eventData,
            { upsert: true, new: true }
        );

        console.log('TEDx Event seeded successfully in production DB!');
        process.exit(0);
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
}

seed();
