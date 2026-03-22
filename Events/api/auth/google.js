import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import connectToDatabase from "../lib/mongodb.js";
import mongoose from "mongoose";

const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

// Simple User model (inline to keep things light)
const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true, required: true },
  name: String,
  email: String,
  picture: String,
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, userInfo } = req.body;
  if (!token) return res.status(400).json({ error: "Token required" });

  try {
    const { token, userInfo } = req.body;
    if (!token) {
      console.error("Auth error: No token provided");
      return res.status(400).json({ error: "Token required" });
    }

    console.log("Auth attempt: starting verification...");

    let uid, name, email, picture;

    // Use our provided variable or fall back to standard CRA prefix if that's what's available
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId || googleClientId === "missing-client-id") {
      console.error("Auth error: No GOOGLE_CLIENT_ID configured on backend");
    }

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
        try {
          const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!userinfoRes.ok) throw new Error(`Google Userinfo API returned ${userinfoRes.status}`);
          const data = await userinfoRes.json();
          uid = data.sub;
          name = data.name;
          email = data.email;
          picture = data.picture;
        } catch (fetchErr) {
          console.error("Auth error: Both ID Token and Access Token verification failed:", fetchErr.message);
          throw new Error("Unable to verify Google token: " + fetchErr.message);
        }
      }
    }

    if (!uid) throw new Error("Could not determine user ID from Google response");

    console.log("Auth: Connecting to database...");
    await connectToDatabase();

    // Upsert user in DB
    console.log(`Auth: Upserting user ${email} in database...`);
    await User.findOneAndUpdate(
      { uid },
      { uid, name, email, picture },
      { upsert: true, new: true }
    );

    // Issue our own JWT (24h expiry)
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL: JWT_SECRET is missing on the server!");
      throw new Error("Server configuration error (JWT)");
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
    console.error("Auth complete crash trace:", error);
    return res.status(500).json({ error: "Auth failed: " + error.message });
  }
}
