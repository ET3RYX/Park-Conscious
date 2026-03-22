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
    let uid, name, email, picture;

    // If userInfo was pre-fetched by the client (access token flow), use it directly
    if (userInfo && userInfo.sub) {
      ({ sub: uid, name, email, picture } = userInfo);
    } else {
      // Try to verify as Google ID token first
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        ({ sub: uid, name, email, picture } = payload);
      } catch {
        // Fall back: treat token as access token, fetch userinfo from Google
        const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userinfoRes.ok) throw new Error("Invalid token");
        const data = await userinfoRes.json();
        uid = data.sub;
        name = data.name;
        email = data.email;
        picture = data.picture;
      }
    }

    await connectToDatabase();

    // Upsert user in DB
    await User.findOneAndUpdate(
      { uid },
      { uid, name, email, picture },
      { upsert: true, new: true }
    );

    // Issue our own JWT (24h expiry)
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
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}
