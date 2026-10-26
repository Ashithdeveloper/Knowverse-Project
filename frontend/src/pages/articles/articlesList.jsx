import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { baseUrl } from "../../constant/url";
import { formatPostDate } from "../../utils/date";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Icons
import { 
  HiOutlineTrash, 
  HiOutlineClock, 
  HiOutlineBookOpen,
  HiOutlineSparkles 
} from "react-icons/hi";

const ArticlesList = ({ selectedCategory = "All" }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const {
    data: articles = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/articles/getallarticle`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch articles");
      return res.json();
    },
  });

  const { mutate: deleteArticle, isPending: isDeleting } = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${baseUrl}/api/articles/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete article");
      return { id };
    },
    onSuccess: ({ id }) => {
      toast.success("Article deleted successfully");
      queryClient.setQueryData(["articles"], (oldArticles) => {
        if (!oldArticles) return [];
        return oldArticles.filter((a) => a._id !== id);
      });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete article");
    },
  });

  const filteredArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter(
          (a) =>
            a.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            a.title?.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  const calculateReadTime = (text) => {
    if (!text) return "2 min read";
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  };

  const fallbackCover =
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-rose-400 font-medium">Failed to load articles.</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["articles"] })}
          className="btn btn-sm btn-outline mt-3 rounded-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (filteredArticles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <HiOutlineBookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">
          No articles found {selectedCategory !== "All" ? `in "${selectedCategory}"` : ""}
        </h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Be the pioneer author! Click &quot;Write Article&quot; to publish technical research, tutorials, or guides.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {filteredArticles.map((article) => {
        const isOwner = authUser?._id === (article.user?._id || article.user);
        return (
          <div
            key={article._id}
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)] flex-1"
          >
            {/* Card Cover Image */}
            <div
              onClick={() => navigate(`/articleReads/${article._id}`)}
              className="relative h-44 w-full overflow-hidden cursor-pointer bg-slate-950"
            >
              <img
                src={article.img || fallbackCover}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackCover;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent opacity-80" />

              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                  {article.category || "General"}
                </span>
              </div>

              {/* Read Time */}
              <div className="absolute bottom-2.5 right-3 flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-md">
                <HiOutlineClock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{calculateReadTime(article.text)}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
              <div>
                {/* Author & Date Header */}
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={article.user?.profileImg || "/boy2.png"}
                    alt={article.user?.fullName}
                    className="w-6 h-6 rounded-full object-cover border border-slate-700"
                  />
                  <span className="text-xs font-medium text-slate-300 truncate">
                    {article.user?.fullName || "Security Researcher"}
                  </span>
                  <span className="text-slate-600 text-xs">•</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatPostDate(article.createdAt)}
                  </span>
                </div>

                {/* Article Title */}
                <h3
                  onClick={() => navigate(`/articleReads/${article._id}`)}
                  className="font-heading font-bold text-base sm:text-lg text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
                >
                  {article.title}
                </h3>

                {/* Snippet */}
                {article.text && (
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {article.text.replace(/\\n/g, " ").replace(/\n/g, " ")}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => navigate(`/articleReads/${article._id}`)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <span>Read Article</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>

                {isOwner && (
                  <button
                    onClick={() => deleteArticle(article._id)}
                    disabled={isDeleting}
                    title="Delete Article"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ArticlesList;