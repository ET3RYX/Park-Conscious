import mongoose from "mongoose";

// ─── Comment Schema ──────────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema(
  {
    discussionId: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion", required: true },
    text: { type: String, required: true, maxlength: 2000 },
    authorName: { type: String, required: true },
    authorPhoto: { type: String, default: "" },
    authorUid: { type: String, required: true },
    upvotes: { type: [String], default: [] },   // array of UIDs
    downvotes: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ─── Discussion Schema ────────────────────────────────────────────────────────
const discussionSchema = new mongoose.Schema(
  {
    movieTitle: { type: String, required: true },
    movieId: { type: Number },
    moviePosterPath: { type: String, default: "" },
    review: { type: String, required: true, maxlength: 5000 },
    rating: { type: Number, min: 1, max: 5, required: true },
    authorName: { type: String, required: true },
    authorPhoto: { type: String, default: "" },
    authorUid: { type: String, required: true },
    upvotes: { type: [String], default: [] },
    downvotes: { type: [String], default: [] },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Discussion =
  mongoose.models.Discussion ||
  mongoose.model("Discussion", discussionSchema);

export const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);
