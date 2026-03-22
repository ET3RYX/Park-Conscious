import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import connectToDatabase from "../lib/mongodb.js";
import mongoose from "mongoose";

let client;
let User;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    console.log("Auth attempt: starting...");

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { token, userInfo } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    // Use our provided variable or fall back to standard CRA prefix if that's what's available
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId || googleClientId === "missing-client-id") {
      console.warn("Auth warning: No GOOGLE_CLIENT_ID configured on backend");
    }

    // Lazy initialization inside handler to catch errors
    if (!client) {
      console.log("Auth: Initializing OAuth client...");
      client = new OAuth2Client(googleClientId);
    }

    if (!User) {
      console.log("Auth: Initializing User model...");
      const userSchema = new mongoose.Schema({
        uid: { type: String, unique: true, required: true },
        name: String,
        email: String,
        picture: String,
      });
      User = mongoose.models.User || mongoose.model("User", userSchema);
    }

    let uid, name, email, picture;

    // If userInfo was pre-fetched by the client (access token flow), use it directly
    if (userInfo && userInfo.sub) {
      console.log("Auth: Using pre-fetched userInfo");
      ({ sub: uid, name, email, picture } = userInfo);
    } else {
      // Try to verify as Google ID token first
      try {
        console.log("Auth: Trying ID Token verification...");
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: googleClientId,
        });
        const payload = ticket.getPayload();
        ({ sub: uid, name, email, picture } = payload);
      } catch (verifyErr) {
        console.log("Auth: ID Token verification failed, falling back to Access Token flow...");
        // Fall back: treat token as access token, fetch userinfo from Google
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

    console.log("Auth: Connecting to database...");
    await connectToDatabase();

    // Upsert user in DB
    console.log(`Auth: Upserting user ${email || uid} in database...`);
    await User.findOneAndUpdate(
      { uid },
      { uid, name, email, picture },
      { upsert: true, new: true }
    );

    // Issue our own JWT (24h expiry)
    if (!process.env.JWT_SECRET) {
      throw new Error("Server configuration error: JWT_SECRET is missing");
    }

    const appToken = jwt.sign(
      { uid, name, email, picture },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Auth: Success!");
    return res.status(200).json({
      token: appToken,
      user: { uid, name, email, picture },
    });
  } catch (error) {
    console.error("Auth CRASH trace:", error);
    // Ensure we ALWAYS return JSON
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ 
      error: "Auth failed", 
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
}
