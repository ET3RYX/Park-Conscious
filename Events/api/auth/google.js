const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const connectToDatabase = require("../lib/mongodb.js");
const mongoose = require("mongoose");

let client;
let User;

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { token, userInfo } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;

    if (!client) {
      client = new OAuth2Client(googleClientId);
    }

    if (!User) {
      const userSchema = new mongoose.Schema({
        uid: { type: String, unique: true, required: true },
        name: String,
        email: String,
        picture: String,
      });
      User = mongoose.models.User || mongoose.model("User", userSchema);
    }

    let uid, name, email, picture;

    if (userInfo && userInfo.sub) {
      ({ sub: uid, name, email, picture } = userInfo);
    } else {
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: googleClientId,
        });
        const payload = ticket.getPayload();
        ({ sub: uid, name, email, picture } = payload);
      } catch (verifyErr) {
        // Use global fetch (Node 18+) or a polyfill if needed
        const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userinfoRes.ok) throw new Error(`Google Userinfo API returned ${userinfoRes.status}`);
        const data = await userinfoRes.json();
        uid = data.sub;
        name = data.name;
        email = data.email;
        picture = data.picture;
      }
    }

    if (!uid) throw new Error("Could not determine user ID from Google response");

    await connectToDatabase();

    // Upsert user in DB using EMAIL as the unique identifier since the DB index requires it
    console.log(`Auth: Upserting user ${email || uid} in database...`);
    await User.findOneAndUpdate(
      { email: email }, // Try to find by email first
      { uid, name, email, picture },
      { upsert: true, new: true }
    );

    if (!process.env.JWT_SECRET) {
      throw new Error("Server configuration error: JWT_SECRET is missing");
    }

    const appToken = jwt.sign(
      { uid, name, email, picture },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      token: appToken,
      user: { uid, name, email, picture },
    });
  } catch (error) {
    console.error("Auth CRASH trace:", error);
    res.setHeader("Content-Type", "application/json");
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: "Auth failed", 
        message: error.message 
      });
    }
  }
};
