import express from 'express';
import Waitlist from '../models/Waitlist.js';
import Contact from '../models/Contact.js';
import Event from '../models/Event.js';

const router = express.Router();

// --- WAITLIST ---
router.post('/waitlist', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const existing = await Waitlist.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already on waitlist" });
    const waitlistEntry = await Waitlist.create({ email });
    res.status(201).json({ message: "Successfully joined waitlist", data: waitlistEntry });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get('/waitlist', async (req, res) => {
  try {
    const list = await Waitlist.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// --- CONTACT ---
router.post('/contact', async (req, res) => {
  try {
    const { name, email, role, message } = req.body;
    if (!email || !name) return res.status(400).json({ message: "Name and Email are required" });
    const contactEntry = await Contact.create({ name, email, role, message });
    res.status(201).json({ message: "Message sent successfully", data: contactEntry });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get('/contact', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// --- EVENTS ---
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post('/events', async (req, res) => {
  try {
    const eventEntry = await Event.create(req.body);
    res.status(201).json({ message: "Event created successfully", data: eventEntry });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
