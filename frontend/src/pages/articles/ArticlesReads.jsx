import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../../constant/url";
import { formatPostDate } from "../../utils/date";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFollow from "../../hooks/useFollow";
import toast from "react-hot-toast";

// Icons
import {
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineShare,
  HiOutlineCalendar,
  HiBadgeCheck,
  HiOutlineBookmark,
  HiBookmark,
} from "react-icons/hi";

const ArticlesReads = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { follow, isPending: isFollowPending } = useFollow();

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/articles/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Article not found");
      return res.json();
    },
    enabled: !!id,
  });

  const fallbackCover =
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80";

  const calculateReadTime = (text) => {
    if (!text) return "2 min read";
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    } else {
      toast.success("Ready to share!");
    }
  };

  const author = article?.user || {};
  const isAuthor = authUser?._id === author._id;
  const isFollowing = authUser?.following?.includes(author._id);

  if (isLoading) {
    return (
      <div className="flex-1 min-w-0 border-r border-slate-800/80 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="flex-1 min-w-0 border-r border-slate-800/80 min-h-screen p-8 text-center">
        <h2 className="text-lg font-bold text-slate-100">Article not found</h2>
        <p className="text-xs text-slate-400 mt-1">
          The requested article may have been removed or is unavailable.
        </p>
        <button
          onClick={() => navigate("/articles")}
          className="btn btn-sm btn-outline rounded-xl mt-4"
        >
          Return to Knowledge Base
        </button>
      </div>
    );
  }

  return (
    <article className="flex-1 min-w-0 border-r border-slate-800/80 min-h-screen pb-24 sm:pb-16 bg-[#080C14]">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-20 bg-[#080C14]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/articles")}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors p-1.5 rounded-xl hover:bg-slate-800/50"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              toast.success(isBookmarked ? "Removed bookmark" : "Bookmarked article!");
            }}
            className={`p-2 rounded-xl transition-colors ${
              isBookmarked
                ? "text-amber-400 bg-amber-500/10"
                : "text-slate-400 hover:text-amber-400 hover:bg-slate-800"
            }`}
            title="Bookmark Article"
          >
            {isBookmarked ? <HiBookmark className="w-4 h-4" /> : <HiOutlineBookmark className="w-4 h-4" />}
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            title="Share Article"
          >
            <HiOutlineShare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Cover Image */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden bg-slate-950">
        <img
          src={article.img || fallbackCover}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackCover;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/40 to-transparent" />
      </div>

      {/* Article Content Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 -mt-16 relative z-10">
        {/* Meta Header */}
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <span className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
            {article.category || "Cybersecurity"}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <HiOutlineClock className="w-3.5 h-3.5 text-cyan-400" />
            {calculateReadTime(article.text)}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <HiOutlineCalendar className="w-3.5 h-3.5 text-slate-500" />
            {formatPostDate(article.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-heading font-black text-2xl sm:text-4xl text-slate-100 leading-tight tracking-tight">
          {article.title}
        </h1>

        {/* Author Card */}
        <div className="flex items-center justify-between p-4 my-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <Link
            to={`/profile/${author.username}`}
            className="flex items-center gap-3 group"
          >
            <img
              src={author.profileImg || "/boy2.png"}
              alt={author.fullName}
              className="w-11 h-11 rounded-xl object-cover border border-cyan-500/30 group-hover:border-cyan-400 transition-colors"
            />
            <div>
              <div className="font-bold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                <span>{author.fullName || "KnowVerse Author"}</span>
                <HiBadgeCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-xs text-slate-400">
                @{author.username}
              </span>
            </div>
          </Link>

          {!isAuthor && author._id && (
            <button
              onClick={() => follow(author._id)}
              disabled={isFollowPending}
              className={`btn btn-xs rounded-xl px-3 font-semibold transition-all ${
                isFollowing
                  ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-rose-500/20 hover:text-rose-300"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {/* Article Body */}
        <div className="prose prose-invert max-w-none text-slate-200 text-base sm:text-lg leading-relaxed space-y-6 pt-2 pb-12 font-sans font-normal border-b border-slate-800">
          {article.text &&
            article.text
              .replace(/\\n/g, "\n")
              .split("\n\n")
              .map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;
                // If paragraph looks like code snippet or bullet
                if (trimmed.startsWith("```") || trimmed.startsWith("$ ")) {
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-sm text-cyan-300 overflow-x-auto my-4"
                    >
                      <pre className="whitespace-pre-wrap">{trimmed.replace(/```/g, "")}</pre>
                    </div>
                  );
                }
                return (
                  <p key={index} className="leading-8 text-slate-300 break-words">
                    {trimmed}
                  </p>
                );
              })}
        </div>

        {/* Article Footer Note */}
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>Published on KnowVerse Knowledge Network</p>
          <button
            onClick={handleShare}
            className="btn btn-sm btn-outline rounded-xl text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
          >
            Share this Article
          </button>
        </div>
      </div>
    </article>
  );
};

export default ArticlesReads;
