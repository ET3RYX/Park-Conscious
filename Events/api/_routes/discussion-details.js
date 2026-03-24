import connectToDatabase from "../lib/mongodb.js";
import { Discussion } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  const { id } = req.query;
  if (!id) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "ID required" }));
    return;
  }

  await connectToDatabase();

  if (req.method === "GET") {
    try {
      const discussion = await Discussion.findById(id).lean();
      if (!discussion) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Not found" }));
        return;
      }
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(discussion));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Failed to fetch discussion" }));
    }
  } else if (req.method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const { action } = req.body || {}; // Note: body might need manual parsing if not handled by Vercel
      // Vercel @vercel/node USUALLY parses JSON body automatically
      
      const discussion = await Discussion.findById(id);
      if (!discussion) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Not found" }));
        return;
      }

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
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        upvotes: discussion.upvotes,
        downvotes: discussion.downvotes,
      }));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Failed to update vote" }));
    }
  }
}
