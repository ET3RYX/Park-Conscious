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
    <div className="bg-darkBackground-800 border border-darkBackground-700 rounded-xl p-4 md:p-5 hover:border-premier-700 transition-all duration-200 group overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Top/Side bar: Votes and Mobile Meta */}
        <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-3 sm:gap-1 sm:min-w-[2.5rem] border-b sm:border-b-0 border-white/5 pb-3 sm:pb-0">
          <div className="flex sm:flex-col items-center gap-2 sm:gap-1">
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
          
          {/* Mobile-only image if exists */}
          {post.eventImage && (
            <img
              src={post.eventImage}
              alt={post.eventTitle}
              className="w-10 h-10 rounded object-cover sm:hidden"
            />
          )}
        </div>

        {/* Poster thumbnail (Desktop only) */}
        {post.eventImage && (
          <img
            src={post.eventImage}
            alt={post.eventTitle}
            className="w-12 h-16 rounded object-cover hidden sm:block flex-shrink-0"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-premier-700 bg-premier-900/30 px-3 py-1 rounded-full truncate max-w-[200px]">
                {post.eventTitle}
              </span>
              <StarRating rating={post.rating} />
            </div>

            <Link to={`/discussion/${post._id}`} className="block group-hover:text-premier-700 transition-colors">
              <p className="text-gray-100 text-sm leading-relaxed break-words line-clamp-3">
                {post.review}
              </p>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-white/5 text-[10px] text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <img 
                src={post.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName || 'User')}&background=random`} 
                alt={post.authorName} 
                className="w-4 h-4 rounded-full object-cover" 
              />
              <span className="text-gray-400 truncate max-w-[80px]">{post.authorName}</span>
            </div>
            <span className="text-gray-700 hidden sm:block">·</span>
            <span>{formatDate(post.createdAt)}</span>
            <span className="text-gray-700 hidden sm:block">·</span>
            <Link
              to={`/discussion/${post._id}`}
              className="flex items-center gap-1.5 hover:text-vibrantBlue transition-colors text-vibrantBlue/60"
            >
              <BiComment className="w-3.5 h-3.5" />
              {post.commentCount} <span className="hidden xs:inline">comments</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionPost;
