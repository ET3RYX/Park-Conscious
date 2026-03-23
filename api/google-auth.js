import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import connectToDatabase from "./lib/mongodb.js";
import { User } from "./lib/models.js";

let client;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    const { token, userInfo } = req.body || {};
    if (!token) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Token required" }));
      return;
    }

    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    if (!client) {
      client = new OAuth2Client(googleClientId);
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

    await User.findOneAndUpdate(
      { email: email },
      { uid, name, email, picture },
      { upsert: true, new: true }
    );

    const appToken = jwt.sign(
      { uid, name, email, picture },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      token: appToken,
      user: { uid, name, email, picture },
    }));
  } catch (error) {
    console.error("Auth CRASH:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Auth failed", message: error.message }));
  }
}
