import connectToDatabase from "./lib/mongodb.js";
import { Discussion, Comment } from "./lib/models.js";
import { requireAuth } from "./lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  const { id } = req.query; // Discussion ID
  if (!id) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Discussion ID required" }));
    return;
  }

  await connectToDatabase();

  if (req.method === "GET") {
    try {
      const comments = await Comment.find({ discussionId: id }).sort({ createdAt: 1 }).lean();
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(comments));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Failed to fetch comments" }));
    }
  } else if (req.method === "POST") {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const { text, parentId } = req.body || {};
      if (!text) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Text required" }));
        return;
      }

      const [comment] = await Promise.all([
        Comment.create({
          discussionId: id,
          parentId: parentId || null,
          text: text.trim(),
          authorName: user.name,
          authorPhoto: user.picture,
          authorUid: user.uid,
        }),
        Discussion.findByIdAndUpdate(id, { $inc: { commentCount: 1 } }),
      ]);

      res.statusCode = 201;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(comment));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Failed to post comment" }));
    }
  } else if (req.method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const { commentId, action } = req.body || {};
      const comment = await Comment.findById(commentId);
      if (!comment) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Not found" }));
        return;
      }

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
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
      }));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Failed to update comment vote" }));
    }
  }
}
