import { Discussion, Comment } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";
import { sendJSON, sendError } from "../utils/responses.js";

/**
 * Handle Discussion Listing
 */
export async function handleDiscussionsList(req, res, url) {
    if (req.method !== "GET") return sendError(res, 405, "Method not allowed");
    
    try {
        const query = new URL(url, `http://${req.headers.host}`).searchParams;
        const page = parseInt(query.get("page")) || 1;
        const limit = parseInt(query.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const [discussions, total] = await Promise.all([
            Discussion.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Discussion.countDocuments(),
        ]);

        return sendJSON(res, 200, {
            discussions,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        return sendError(res, 500, "Failed to fetch discussions", error.message);
    }
}

/**
 * Handle Discussion Details & Voting
 */
export async function handleDiscussionDetails(req, res, url, method, body) {
    const id = url.split("/").pop(); // Assumes /api/discussions/details?id=... or /api/discussions/id
    // Wait, the original code used req.query.id. We need to parse searchParams if not in URL path.
    const searchParams = new URL(url, `http://${req.headers.host}`).searchParams;
    const discussionId = id.includes("?") ? searchParams.get("id") : id;

    if (!discussionId) return sendError(res, 400, "Discussion ID required");

    if (method === "GET") {
        try {
            const discussion = await Discussion.findById(discussionId).lean();
            if (!discussion) return sendError(res, 404, "Discussion not found");
            return sendJSON(res, 200, discussion);
        } catch (error) {
            return sendError(res, 500, "Failed to fetch discussion", error.message);
        }
    }

    if (method === "PATCH") {
        const user = requireAuth(req, res);
        if (!user) return; // requireAuth handles response

        try {
            const { action } = body || {};
            const discussion = await Discussion.findById(discussionId);
            if (!discussion) return sendError(res, 404, "Discussion not found");

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
            return sendJSON(res, 200, {
                upvotes: discussion.upvotes,
                downvotes: discussion.downvotes,
            });
        } catch (error) {
            return sendError(res, 500, "Failed to update vote", error.message);
        }
    }

    return sendError(res, 405, "Method not allowed");
}

/**
 * Handle Discussion Comments
 */
export async function handleDiscussionComments(req, res, url, method, body) {
    const searchParams = new URL(url, `http://${req.headers.host}`).searchParams;
    const discussionId = searchParams.get("id");

    if (!discussionId) return sendError(res, 400, "Discussion ID required");

    if (method === "GET") {
        try {
            const comments = await Comment.find({ discussionId }).sort({ createdAt: 1 }).lean();
            return sendJSON(res, 200, comments);
        } catch (error) {
            return sendError(res, 500, "Failed to fetch comments", error.message);
        }
    }

    if (method === "POST") {
        const user = requireAuth(req, res);
        if (!user) return;

        try {
            const { text, parentId } = body || {};
            if (!text) return sendError(res, 400, "Comment text required");

            const [comment] = await Promise.all([
                Comment.create({
                    discussionId,
                    parentId: parentId || null,
                    text: text.trim(),
                    authorName: user.name,
                    authorPhoto: user.picture,
                    authorUid: user.uid,
                }),
                Discussion.findByIdAndUpdate(discussionId, { $inc: { commentCount: 1 } }),
            ]);

            return sendJSON(res, 201, comment);
        } catch (error) {
            return sendError(res, 500, "Failed to post comment", error.message);
        }
    }

    if (method === "PATCH") {
        const user = requireAuth(req, res);
        if (!user) return;

        try {
            const { commentId, action } = body || {};
            const comment = await Comment.findById(commentId);
            if (!comment) return sendError(res, 404, "Comment not found");

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
            return sendJSON(res, 200, {
                upvotes: comment.upvotes,
                downvotes: comment.downvotes,
            });
        } catch (error) {
            return sendError(res, 500, "Failed to update comment vote", error.message);
        }
    }

    return sendError(res, 405, "Method not allowed");
}
