import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { baseUrl } from "../../constant/url";

// Icons
import {
  HiOutlineChatAlt2,
  HiOutlineHeart,
  HiHeart,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineTrash,
  HiOutlineShare,
  HiBadgeCheck,
  HiX,
} from "react-icons/hi";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const postOwner = post.user || {};
  const isLiked = post.likes?.includes(authUser?._id);
  const isMyPost = authUser?._id === postOwner._id;
  const formattedDate = formatPostDate(post.createdAt);

  // Delete Post Mutation
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseUrl}/api/posts/${post._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");
      return data;
    },
    onSuccess: ({ id }) => {
      queryClient.setQueryData(["posts"], (oldPosts) => {
        if (!oldPosts) return [];
        return oldPosts.filter((p) => p._id !== (id || post._id));
      });
      toast.success("Post deleted successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete post");
    },
  });

  // Like / Unlike Mutation
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseUrl}/api/posts/like/${post._id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to like post");
      return data;
    },
    onSuccess: (updatedLikes) => {
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Comment Mutation
  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseUrl}/api/posts/comment/${post._id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add comment");
      return data;
    },
    onSuccess: (data) => {
      const newComment = data.comment;
      toast.success("Comment added");
      setComment("");
      queryClient.setQueryData(["posts"], (oldPosts) => {
        if (!oldPosts) return oldPosts;
        return oldPosts.map((p) =>
          p._id === post._id
            ? { ...p, comments: [...(p.comments || []), newComment] }
            : p
        );
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!comment.trim() || isCommenting) return;
    commentPost();
  };

  const handleToggleBookmark = () => {
    setIsBookmarked((prev) => !prev);
    if (!isBookmarked) {
      toast.success("Saved to your bookmarks");
    } else {
      toast.success("Removed from bookmarks");
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
      toast.success("Post link copied to clipboard!");
    } else {
      toast.success("Link ready to share!");
    }
  };

  // Render text with clickable #hashtags
  const renderFormattedText = (content) => {
    if (!content) return null;
    const parts = content.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <Link
            key={index}
            to={`/search?q=${part.slice(1)}`}
            className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <article className="border-b border-slate-800/80 p-4 sm:p-5 hover:bg-slate-900/20 transition-all duration-200">
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* User Avatar */}
        <Link to={`/profile/${postOwner.username}`} className="relative shrink-0">
          <img
            src={postOwner.profileImg || "/boy2.png"}
            alt={postOwner.fullName}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-slate-700/80 hover:border-cyan-400 transition-colors"
          />
        </Link>

        {/* Post Content Body */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Post Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <Link
                to={`/profile/${postOwner.username}`}
                className="font-bold text-sm sm:text-base text-slate-100 hover:text-cyan-400 transition-colors truncate flex items-center gap-1"
              >
                <span>{postOwner.fullName}</span>
                <HiBadgeCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              </Link>
              <Link
                to={`/profile/${postOwner.username}`}
                className="text-xs sm:text-sm text-slate-400 truncate hover:text-slate-300"
              >
                @{postOwner.username}
              </Link>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-xs text-slate-400 font-mono">{formattedDate}</span>
            </div>

            {/* Owner Delete Action */}
            {isMyPost && (
              <button
                onClick={() => deletePost()}
                disabled={isDeleting}
                title="Delete Post"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                {isDeleting ? <LoadingSpinner size="sm" /> : <HiOutlineTrash className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Post Text */}
          <div className="mt-2 text-slate-200 text-sm sm:text-base leading-relaxed break-words whitespace-pre-line">
            {renderFormattedText(post.text)}
          </div>

          {/* Media Attachments */}
          {post.img && !post.media && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-slate-800 bg-black/40">
              <img
                src={post.img}
                alt="Post Media"
                className="w-full max-h-[480px] object-contain rounded-2xl"
                loading="lazy"
              />
            </div>
          )}

          {post.media && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-slate-800 bg-black/40">
              {post.media.endsWith(".mp4") || post.media.includes("video") ? (
                <video
                  className="w-full max-h-[480px] object-contain rounded-2xl"
                  controls
                  preload="metadata"
                >
                  <source src={post.media} type="video/mp4" />
                  Your browser does not support HTML5 video.
                </video>
              ) : (
                <img
                  src={post.media}
                  alt="Post Attachment"
                  className="w-full max-h-[480px] object-contain rounded-2xl"
                  loading="lazy"
                />
              )}
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between mt-4 pt-2 text-slate-400 max-w-md">
            {/* Comments Button */}
            <button
              onClick={() => setShowCommentsModal(true)}
              className="flex items-center gap-1.5 group text-xs sm:text-sm hover:text-cyan-400 transition-colors"
            >
              <div className="p-2 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
                <HiOutlineChatAlt2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="font-mono text-xs">{post.comments?.length || 0}</span>
            </button>

            {/* Like Button */}
            <button
              onClick={() => !isLiking && likePost()}
              disabled={isLiking}
              className={`flex items-center gap-1.5 group text-xs sm:text-sm transition-colors ${
                isLiked ? "text-rose-500" : "hover:text-rose-400"
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-colors ${
                  isLiked
                    ? "bg-rose-500/15"
                    : "group-hover:bg-rose-500/10"
                }`}
              >
                {isLiked ? (
                  <HiHeart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                ) : (
                  <HiOutlineHeart className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <span className="font-mono text-xs font-semibold">{post.likes?.length || 0}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleToggleBookmark}
              title={isBookmarked ? "Remove bookmark" : "Save bookmark"}
              className={`flex items-center gap-1.5 group text-xs sm:text-sm transition-colors ${
                isBookmarked ? "text-amber-400" : "hover:text-amber-400"
              }`}
            >
              <div className="p-2 rounded-xl group-hover:bg-amber-500/10 transition-colors">
                {isBookmarked ? (
                  <HiBookmark className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                ) : (
                  <HiOutlineBookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              title="Share post"
              className="flex items-center gap-1.5 group text-xs sm:text-sm hover:text-emerald-400 transition-colors"
            >
              <div className="p-2 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
                <HiOutlineShare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Comments Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0B0F17] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/40">
              <h3 className="font-heading font-bold text-slate-100 text-base flex items-center gap-2">
                <span>Comments</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {post.comments?.length || 0}
                </span>
              </h3>
              <button
                onClick={() => setShowCommentsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              {(!post.comments || post.comments.length === 0) && (
                <div className="py-12 text-center text-slate-500">
                  <p className="text-sm font-medium">No comments yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Be the first to share your thoughts!</p>
                </div>
              )}

              {post.comments?.map((c, idx) => (
                <div key={c._id || idx} className="flex gap-3 items-start p-2.5 rounded-xl bg-slate-900/30 border border-slate-800/50">
                  <img
                    src={c.user?.profileImg || "/boy2.png"}
                    alt={c.user?.fullName}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-200">
                        {c.user?.fullName}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        @{c.user?.username}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed break-words">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment Input Form */}
            <form
              onSubmit={handlePostComment}
              className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                disabled={isCommenting || !comment.trim()}
                className="btn btn-sm px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold border-none disabled:opacity-40"
              >
                {isCommenting ? <LoadingSpinner size="sm" /> : "Post"}
              </button>
            </form>
          </div>
        </div>
      )}
    </article>
  );
};

export default Post;
