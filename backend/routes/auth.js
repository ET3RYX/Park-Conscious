import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Owner from '../models/Owner.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = await User.create({ name, email, password });
    res.status(201).json({
      message: "User created successfully",
      user: { 
        name: user.name, 
        email: user.email,
        token: generateToken(user._id)
      }
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.password) {
      return res.status(400).json({ message: "Please sign in using Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      message: "Logged in successfully",
      user: { 
        name: user.name, 
        email: user.email,
        token: generateToken(user._id)
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google OAuth Login for User
// @route   POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { token, name, email: clientEmail } = req.body;
    
    let email = clientEmail;
    let googleId = req.body.googleId;

    // Verify token if provided (New Security Standard)
    if (token) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload['email'];
      googleId = payload['sub'];
    }

    if (!email) return res.status(400).json({ message: 'Google authentication failed' });
    
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({ name, email, googleId });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
    
    res.json({
      message: "Logged in with Google",
      user: { 
        name: user.name, 
        email: user.email,
        token: generateToken(user._id)
      }
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: "Server error during Google authentication" });
  }
});

// --- OWNER AUTH ---

// @desc    Register a new owner
// @route   POST /api/auth/owner/signup
router.post('/owner/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
    
    let owner = await Owner.findOne({ email });
    if (owner) return res.status(400).json({ message: "Owner already exists" });

    owner = await Owner.create({ name, email, password });
    res.status(201).json({
      message: "Created successfully",
      user: { 
        id: owner._id, 
        name: owner.name, 
        email: owner.email,
        token: generateToken(owner._id)
      }
    });
  } catch (err) { 
    console.error("Owner Signup Error:", err);
    res.status(500).json({ message: "Server error" }); 
  }
});

// @desc    Authenticate owner & get token
// @route   POST /api/auth/owner/login
router.post('/owner/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });
    if (!owner) return res.status(400).json({ message: "Invalid credentials" });
    if (!owner.password) return res.status(400).json({ message: "Please sign in using Google." });

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      message: "Logged in successfully",
      user: { 
        id: owner._id, 
        name: owner.name, 
        email: owner.email,
        token: generateToken(owner._id)
      }
    });
  } catch (err) { 
    console.error("Owner Login Error:", err);
    res.status(500).json({ message: "Server error" }); 
  }
});

// @desc    Google OAuth Login for Owner
// @route   POST /api/auth/owner/google
router.post('/owner/google', async (req, res) => {
  try {
    const { token, name, email: clientEmail } = req.body;
    
    let email = clientEmail;
    let googleId = req.body.googleId;

    if (token) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload['email'];
      googleId = payload['sub'];
    }

    if (!email) return res.status(400).json({ message: 'Google authentication failed' });

    let owner = await Owner.findOne({ email: email.toLowerCase() });
    if (!owner) {
      owner = await Owner.create({ name, email, googleId });
    } else if (!owner.googleId) {
      owner.googleId = googleId;
      await owner.save();
    }
    
    res.json({
      message: "Logged in with Google",
      user: { 
        id: owner._id, 
        name: owner.name, 
        email: owner.email,
        token: generateToken(owner._id)
      }
    });
  } catch (err) {
    console.error("Owner Google Auth Error:", err);
    res.status(500).json({ message: "Server error during Google authentication" });
  }
});

export default router;
