import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import connectDB from '../config/database.js';

dotenv.config();

const events = [
    { name: "YE (Kanye West) Live", category: "concert", venue: "Jawaharlal Nehru Stadium", venueCity: "Delhi", attendees: "70,000+", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745", badge: "Live Now" },
    { name: "Travis Scott: Maximus", category: "concert", venue: "Jawaharlal Nehru Stadium", venueCity: "Delhi", attendees: "50,000+", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30", badge: "Trending" },
    { name: "Comic Con India", category: "festival", venue: "NSIC Grounds", venueCity: "Okhla", attendees: "30,000+", image: "https://images.unsplash.com/photo-1540747913346-19e3adca174f", badge: "Viral" },
    { name: "Karan Aujla: P-POP", category: "concert", venue: "Indira Gandhi Arena", venueCity: "Delhi", attendees: "75,000+", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14", badge: "Selling Fast" },
    { name: "Global AI Summit (GPAI)", category: "summit", venue: "Bharat Mandapam", venueCity: "Delhi", attendees: "10,000+", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e", badge: "World Event" },
    { name: "Horn OK Please", category: "festival", venue: "Jawaharlal Nehru Stadium", venueCity: "Delhi", attendees: "25,000+", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1", badge: "Must Visit" },
    { name: "SATTE 2024", category: "summit", venue: "India Expo Mart", venueCity: "Greater Noida", attendees: "35,000+", image: "https://images.unsplash.com/photo-1511578314322-379afb476865", badge: "Business" },
    { name: "Sunburn Arena", category: "festival", venue: "Gurgaon Venue", venueCity: "Gurgaon", attendees: "40,000+", image: "https://images.unsplash.com/photo-1514525253361-bee8718a34a1", badge: "EDM" },
    { name: "Navratri Garba Night", category: "culture", venue: "Major Dhyan Chand", venueCity: "Delhi", attendees: "20,000+", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3", badge: "Tradition" },
    { name: "India Mobile Congress", category: "summit", venue: "Bharat Mandapam", venueCity: "Delhi", attendees: "100,000+", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c", badge: "Tech Leader" }
];

const seedData = async () => {
    try {
        await connectDB();
        
        // Clear existing events
        await Event.deleteMany({});
        console.log('Existing events cleared.');

        // Insert new events
        await Event.insertMany(events);
        console.log('Database seeded with initial events!');
        
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
