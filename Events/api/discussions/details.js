const connectToDatabase = require("../lib/mongodb.js");
const { Discussion } = require("../lib/models.js");
const { requireAuth } = require("../lib/auth.js");
const mongoose = require("mongoose");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Valid ID required" });
  }

  await connectToDatabase();

  // ── GET: single discussion ────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const discussion = await Discussion.findById(id).lean();
      if (!discussion) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(discussion);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch discussion" });
    }
  }

  // ── PATCH: upvote / downvote ──────────────────────────────────────────────
  if (req.method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) return;

    const { action } = req.body;
    if (!["upvote", "downvote"].includes(action)) {
      return res.status(400).json({ error: "action must be upvote or downvote" });
    }

    try {
      const discussion = await Discussion.findById(id);
      if (!discussion) return res.status(404).json({ error: "Not found" });

      const { uid } = user;
      if (action === "upvote") {
        if (discussion.upvotes.includes(uid)) {
          discussion.upvotes.pull(uid);
        } else {
          discussion.upvotes.addToSet(uid);
          discussion.downvotes.pull(uid);
        }
      } else {
        if (discussion.downvotes.includes(uid)) {
          discussion.downvotes.pull(uid);
        } else {
          discussion.downvotes.addToSet(uid);
          discussion.upvotes.pull(uid);
        }
      }

      await discussion.save();
      return res.status(200).json({
        upvotes: discussion.upvotes,
        downvotes: discussion.downvotes,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update vote" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
