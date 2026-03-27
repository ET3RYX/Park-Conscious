import connectToDatabase from "../lib/mongodb.js";
import { Discussion } from "../lib/models.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  await connectToDatabase();

  if (req.method === "GET") {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [discussions, total] = await Promise.all([
        Discussion.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Discussion.countDocuments(),
      ]);

      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          discussions,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        })
      );
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Failed to fetch discussions" }));
    }
  } else if (req.method === "POST") {
    // Handling new post creation (if needed here)
    // For now, keeping it simple
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
  } else {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
  }
}
