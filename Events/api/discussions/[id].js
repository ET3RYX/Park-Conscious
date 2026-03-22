import connectToDatabase from "../../lib/mongodb.js";
import { Discussion } from "../../lib/models.js";
import { requireAuth } from "../../lib/auth.js";
import mongoose from "mongoose";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
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

    const { action } = req.body; // "upvote" | "downvote"
    if (!["upvote", "downvote"].includes(action)) {
      return res.status(400).json({ error: "action must be upvote or downvote" });
    }

    try {
      const discussion = await Discussion.findById(id);
      if (!discussion) return res.status(404).json({ error: "Not found" });

      const { uid } = user;
      const alreadyUpvoted = discussion.upvotes.includes(uid);
      const alreadyDownvoted = discussion.downvotes.includes(uid);

      if (action === "upvote") {
        if (alreadyUpvoted) {
          // toggle off
          discussion.upvotes.pull(uid);
        } else {
          discussion.upvotes.addToSet(uid);
          discussion.downvotes.pull(uid);
        }
      } else {
        if (alreadyDownvoted) {
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
