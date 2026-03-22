import React from "react";
import { BiUpvote, BiDownvote, BiComment } from "react-icons/bi";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/DiscussionAuth.context";

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= rating ? "text-accentYellow" : "text-gray-600"}>
        ★
      </span>
    ))}
  </div>
);

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const DiscussionPost = ({ post, onVote }) => {
  const { user } = useAuth();
  const score = post.upvotes.length - post.downvotes.length;
  const userUpvoted = user && post.upvotes.includes(user.uid);
  const userDownvoted = user && post.downvotes.includes(user.uid);

  return (
    <div className="bg-darkBackground-800 border border-darkBackground-700 rounded-xl p-5 hover:border-premier-700 transition-all duration-200 group">
      <div className="flex gap-4">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 min-w-[2.5rem]">
          <button
            onClick={() => onVote(post._id, "upvote")}
            className={`p-1 rounded transition-colors ${userUpvoted ? "text-premier-700" : "text-gray-500 hover:text-premier-700"}`}
          >
            <BiUpvote className="w-5 h-5" />
          </button>
          <span className={`font-bold text-sm ${score > 0 ? "text-premier-700" : score < 0 ? "text-red-400" : "text-gray-400"}`}>
            {score}
          </span>
          <button
            onClick={() => onVote(post._id, "downvote")}
            className={`p-1 rounded transition-colors ${userDownvoted ? "text-vibrantBlue" : "text-gray-500 hover:text-vibrantBlue"}`}
          >
            <BiDownvote className="w-5 h-5" />
          </button>
        </div>

        {/* Poster thumbnail */}
        {post.moviePosterPath && (
          <img
            src={`https://image.tmdb.org/t/p/w92${post.moviePosterPath}`}
            alt={post.movieTitle}
            className="w-12 h-16 rounded object-cover hidden sm:block flex-shrink-0"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-premier-700 bg-premier-900/30 px-2 py-0.5 rounded-full">
              {post.movieTitle}
            </span>
            <StarRating rating={post.rating} />
          </div>

          <Link to={`/discussion/${post._id}`} className="block group-hover:text-premier-700 transition-colors">
            <p className="text-gray-100 line-clamp-2 text-sm leading-relaxed">
              {post.review}
            </p>
          </Link>

          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            {post.authorPhoto && (
              <img src={post.authorPhoto} alt={post.authorName} className="w-5 h-5 rounded-full" />
            )}
            <span className="text-gray-400">{post.authorName}</span>
            <span>·</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>·</span>
            <Link
              to={`/discussion/${post._id}`}
              className="flex items-center gap-1 hover:text-vibrantBlue transition-colors"
            >
              <BiComment className="w-3.5 h-3.5" />
              {post.commentCount} comments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionPost;
