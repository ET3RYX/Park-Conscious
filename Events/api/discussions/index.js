const connectToDatabase = require("../lib/mongodb.js");
const { Discussion } = require("../lib/models.js");
const { requireAuth } = require("../lib/auth.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") return res.status(200).end();

  await connectToDatabase();

  if (req.method === "GET") {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [discussions, total] = await Promise.all([
        Discussion.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Discussion.countDocuments(),
      ]);

      return res.status(200).json({
        discussions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch discussions" });
    }
  }

  if (req.method === "POST") {
    const user = requireAuth(req, res);
    if (!user) return;

    const { movieTitle, movieId, moviePosterPath, review, rating } = req.body;

    if (!movieTitle || !review || !rating) {
      return res.status(400).json({ error: "movieTitle, review, and rating are required" });
    }

    try {
      const discussion = await Discussion.create({
        movieTitle,
        movieId,
        moviePosterPath,
        review,
        rating,
        authorName: user.name,
        authorPhoto: user.picture,
        authorUid: user.uid,
      });

      return res.status(201).json(discussion);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create discussion" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
