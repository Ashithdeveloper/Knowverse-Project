import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { baseUrl } from "../../constant/url";
import { formatPostDate } from "../../utils/date";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { HiOutlineTrash, HiOutlineClock, HiOutlineSearch } from "react-icons/hi";

const ArticleSearchResults = ({ query }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const {
    data: results = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["articleSearch", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await fetch(
        `${baseUrl}/api/articles/article/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: !!query.trim(),
  });

  const { mutate: deleteArticle } = useMutation({
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
      toast.success("Article deleted");
      queryClient.setQueryData(["articleSearch", query], (old) =>
        old ? old.filter((a) => a._id !== id) : []
      );
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });

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
      <div className="p-8 text-center text-rose-400">
        Search encountered an error. Please try again.
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <HiOutlineSearch className="w-6 h-6" />
        </div>
        <p className="text-base font-semibold text-slate-300">
          No articles matching &quot;{query}&quot;
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Try searching for keywords like &quot;security&quot;, &quot;network&quot;, or &quot;cloud&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {results.map((article) => {
        const isOwner = authUser?._id === (article.user?._id || article.user);
        return (
          <div
            key={article._id}
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)]"
          >
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
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                  {article.category || "General"}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
              <div>
                <h3
                  onClick={() => navigate(`/articleReads/${article._id}`)}
                  className="font-heading font-bold text-base sm:text-lg text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
                >
                  {article.title}
                </h3>
                {article.text && (
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {article.text.replace(/\\n/g, " ").replace(/\n/g, " ")}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => navigate(`/articleReads/${article._id}`)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <span>Read Article</span>
                  <span>→</span>
                </button>
                {isOwner && (
                  <button
                    onClick={() => deleteArticle(article._id)}
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

export default ArticleSearchResults;