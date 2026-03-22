import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { BiUpvote, BiDownvote, BiArrowBack } from "react-icons/bi";
import DefaultlayoutHoc from "../layout/Default.layout";
import { useAuth } from "../context/DiscussionAuth.context";
import { useGoogleLogin } from "@react-oauth/google";

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= rating ? "text-accentYellow text-lg" : "text-gray-600 text-lg"}>
        ★
      </span>
    ))}
  </div>
);

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

// Single comment row
const CommentItem = ({ comment, onVote, onReply, currentUser, isReply = false }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const score = comment.upvotes.length - comment.downvotes.length;
  const userUpvoted = currentUser && comment.upvotes.includes(currentUser.uid);
  const userDownvoted = currentUser && comment.downvotes.includes(currentUser.uid);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment._id, replyText.trim());
    setReplyText("");
    setShowReplyForm(false);
    setSubmitting(false);
  };

  return (
    <div className={`flex gap-3 py-4 ${isReply ? "ml-8 border-l-2 border-darkBackground-700 pl-4" : "border-b border-darkBackground-700"} last:border-0`}>
      <div className="flex flex-col items-center gap-1 min-w-[2rem]">
        <button
          onClick={() => onVote(comment._id, "upvote")}
          className={`transition-colors ${userUpvoted ? "text-premier-700" : "text-gray-600 hover:text-premier-700"}`}
        >
          <BiUpvote className="w-4 h-4" />
        </button>
        <span className={`text-xs font-bold ${score > 0 ? "text-premier-700" : score < 0 ? "text-red-400" : "text-gray-500"}`}>
          {score}
        </span>
        <button
          onClick={() => onVote(comment._id, "downvote")}
          className={`transition-colors ${userDownvoted ? "text-vibrantBlue" : "text-gray-600 hover:text-vibrantBlue"}`}
        >
          <BiDownvote className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {comment.authorPhoto && (
            <img src={comment.authorPhoto} alt={comment.authorName} className="w-5 h-5 rounded-full" />
          )}
          <span className="text-gray-300 text-sm font-medium">{comment.authorName}</span>
          <span className="text-gray-600 text-xs">· {formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mb-2">{comment.text}</p>
        
        {!isReply && currentUser && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-gray-500 hover:text-premier-700 font-semibold transition-colors"
          >
            {showReplyForm ? "Cancel" : "Reply"}
          </button>
        )}

        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-3">
            <textarea
              className="w-full bg-darkBackground-900 border border-darkBackground-700 text-gray-100 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:border-premier-700 transition-colors"
              rows={2}
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end mt-1">
              <button
                type="submit"
                disabled={submitting || !replyText.trim()}
                className="px-3 py-1 text-[10px] bg-premier-700 hover:bg-premier-600 text-white font-bold rounded transition-colors disabled:opacity-40"
              >
                {submitting ? "Posting..." : "Post Reply"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const DiscussionPage = () => {
  const { id } = useParams();
  const { user, token, signInWithGoogle } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await signInWithGoogle(tokenResponse.access_token);
        window.location.reload();
      } catch (err) {
        console.error("Login failed:", err);
        alert("Login failed: " + err.message);
      }
    },
    flow: "implicit",
  });

  const fetchPost = useCallback(async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        fetch(`/api/discussions/${id}`),
        fetch(`/api/discussions/${id}/comments`),
      ]);
      const [postData, commentsData] = await Promise.all([postRes.json(), commentsRes.json()]);
      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPost(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handlePostVote = async (action) => {
    if (!user) return googleLogin();
    const res = await fetch(`/api/discussions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (res.ok) setPost((p) => ({ ...p, upvotes: data.upvotes, downvotes: data.downvotes }));
  };

  const handleCommentVote = async (commentId, action) => {
    if (!user) return googleLogin();
    const res = await fetch(`/api/discussions/${id}/comments`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ commentId, action }),
    });
    const data = await res.json();
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, upvotes: data.upvotes, downvotes: data.downvotes } : c
        )
      );
    }
  };

  const submitComment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!user) return googleLogin();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: commentText.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data]);
        setCommentText("");
        setPost((p) => ({ ...p, commentCount: (p.commentCount || 0) + 1 }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId, text) => {
    if (!user) return googleLogin();
    try {
      const res = await fetch(`/api/discussions/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text, parentId }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data]);
        setPost((p) => ({ ...p, commentCount: (p.commentCount || 0) + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingPost) {
    return (
      <div className="bg-darkBackground-900 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-premier-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post || post.error) {
    return (
      <div className="bg-darkBackground-900 min-h-screen flex flex-col items-center justify-center text-gray-400 gap-4">
        <p className="text-xl">Discussion not found.</p>
        <Link to="/" className="text-premier-700 hover:underline flex items-center gap-1">
          <BiArrowBack /> Back to home
        </Link>
      </div>
    );
  }

  const score = post.upvotes.length - post.downvotes.length;
  const userUpvoted = user && post.upvotes.includes(user.uid);
  const userDownvoted = user && post.downvotes.includes(user.uid);

  // Group comments for nested rendering
  const parentComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId) => comments.filter(c => c.parentId === parentId);

  return (
    <div className="bg-darkBackground-900 min-h-screen pb-20">
      <div className="container mx-auto px-4 md:px-12 py-10 max-w-3xl">
        {/* Back */}
        <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-sm mb-8 transition-colors">
          <BiArrowBack /> Back to discussions
        </Link>
... (rest of the file)


        {/* Post */}
        <div className="bg-darkBackground-800 border border-darkBackground-700 rounded-2xl p-6 mb-8">
          <div className="flex gap-4">
            {/* Votes */}
            <div className="flex flex-col items-center gap-1 min-w-[2.5rem]">
              <button
                onClick={() => handlePostVote("upvote")}
                className={`p-1 rounded transition-colors ${userUpvoted ? "text-premier-700" : "text-gray-500 hover:text-premier-700"}`}
              >
                <BiUpvote className="w-6 h-6" />
              </button>
              <span className={`font-bold ${score > 0 ? "text-premier-700" : score < 0 ? "text-red-400" : "text-gray-400"}`}>
                {score}
              </span>
              <button
                onClick={() => handlePostVote("downvote")}
                className={`p-1 rounded transition-colors ${userDownvoted ? "text-vibrantBlue" : "text-gray-500 hover:text-vibrantBlue"}`}
              >
                <BiDownvote className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {post.moviePosterPath && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${post.moviePosterPath}`}
                    alt={post.movieTitle}
                    className="w-10 h-14 rounded object-cover"
                  />
                )}
                <div>
                  <span className="text-premier-700 font-semibold text-lg">{post.movieTitle}</span>
                  <div className="mt-1">
                    <StarRating rating={post.rating} />
                  </div>
                </div>
              </div>

              <p className="text-gray-200 leading-relaxed mb-4">{post.review}</p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                {post.authorPhoto && (
                  <img src={post.authorPhoto} alt={post.authorName} className="w-5 h-5 rounded-full" />
                )}
                <span className="text-gray-400">{post.authorName}</span>
                <span>·</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments header */}
        <h3 className="text-white font-bold text-lg mb-4">
          {comments.length} Comment{comments.length !== 1 ? "s" : ""}
        </h3>

        {/* Add comment */}
        <form onSubmit={submitComment} className="mb-8">
          <textarea
            className="w-full bg-darkBackground-800 border border-darkBackground-700 text-gray-100 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-premier-700 transition-colors"
            rows={3}
            maxLength={2000}
            placeholder={user ? "Add a comment..." : "Sign in to join the discussion"}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onClick={() => !user && googleLogin()}
            readOnly={!user}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="px-5 py-2 text-sm bg-premier-700 hover:bg-premier-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-40"
            >
              {user ? (submitting ? "Posting..." : "Comment") : "Sign in to comment"}
            </button>
          </div>
        </form>

        {/* Comments list */}
        <div className="bg-darkBackground-800 border border-darkBackground-700 rounded-2xl px-5 divide-y divide-darkBackground-700">
          {parentComments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10">
              No comments yet. Be the first!
            </p>
          ) : (
            parentComments.map((c) => (
              <React.Fragment key={c._id}>
                <CommentItem
                  comment={c}
                  onVote={handleCommentVote}
                  onReply={handleReply}
                  currentUser={user}
                />
                {getReplies(c._id).map((reply) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    onVote={handleCommentVote}
                    onReply={handleReply}
                    currentUser={user}
                    isReply={true}
                  />
                ))}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(DiscussionPage);
