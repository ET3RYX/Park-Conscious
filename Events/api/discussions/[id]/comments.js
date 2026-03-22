import connectToDatabase from "../../../lib/mongodb.js";
import { Comment, Discussion } from "../../../lib/models.js";
import { requireAuth } from "../../../lib/auth.js";
import mongoose from "mongoose";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
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

  // ── GET: list comments for a discussion ──────────────────────────────────
  if (req.method === "GET") {
    try {
      const comments = await Comment.find({ discussionId: id })
        .sort({ createdAt: 1 })
        .lean();
      return res.status(200).json(comments);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch comments" });
    }
  }

  // ── POST: add a comment ───────────────────────────────────────────────────
  if (req.method === "POST") {
    const user = requireAuth(req, res);
    if (!user) return;

    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Comment text required" });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: "Comment too long (max 2000 chars)" });
    }

    try {
      const [comment] = await Promise.all([
        Comment.create({
          discussionId: id,
          text: text.trim(),
          authorName: user.name,
          authorPhoto: user.picture,
          authorUid: user.uid,
        }),
        Discussion.findByIdAndUpdate(id, { $inc: { commentCount: 1 } }),
      ]);

      return res.status(201).json(comment);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to add comment" });
    }
  }

  // ── PATCH: upvote/downvote a comment (query: ?commentId=...) ────────────
  if (req.method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) return;

    const { commentId, action } = req.body;
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ error: "Valid commentId required" });
    }
    if (!["upvote", "downvote"].includes(action)) {
      return res.status(400).json({ error: "action must be upvote or downvote" });
    }

    try {
      const comment = await Comment.findById(commentId);
      if (!comment) return res.status(404).json({ error: "Comment not found" });

      const { uid } = user;
      if (action === "upvote") {
        if (comment.upvotes.includes(uid)) {
          comment.upvotes.pull(uid);
        } else {
          comment.upvotes.addToSet(uid);
          comment.downvotes.pull(uid);
        }
      } else {
        if (comment.downvotes.includes(uid)) {
          comment.downvotes.pull(uid);
        } else {
          comment.downvotes.addToSet(uid);
          comment.upvotes.pull(uid);
        }
      }

      await comment.save();
      return res.status(200).json({
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update comment vote" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
