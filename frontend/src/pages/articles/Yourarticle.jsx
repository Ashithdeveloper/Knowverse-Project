import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { baseUrl } from "../../constant/url";
import { formatPostDate } from "../../utils/date";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { HiOutlineTrash, HiOutlineBookOpen } from "react-icons/hi";

const YourArticle = ({ id }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const {
    data: articles = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userArticles", id],
    queryFn: async () => {
      if (!id) return [];
      const res = await fetch(`${baseUrl}/api/articles/userarticle/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch user articles");
      return res.json();
    },
    enabled: !!id,
  });

  const { mutate: deleteArticle } = useMutation({
    mutationFn: async (articleId) => {
      const res = await fetch(`${baseUrl}/api/articles/${articleId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete article");
      return { articleId };
    },
    onSuccess: ({ articleId }) => {
      toast.success("Article deleted successfully");
      queryClient.setQueryData(["userArticles", id], (old) =>
        old ? old.filter((a) => a._id !== articleId) : []
      );
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete article");
    },
  });

  const fallbackCover =
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-slate-400">
        Unable to load user articles.
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
          <HiOutlineBookOpen className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-200">No published articles yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Articles published by this user will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {articles.map((article) => {
        const isOwner = authUser?._id === (article.user?._id || article.user);
        return (
          <div
            key={article._id}
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300"
          >
            <div
              onClick={() => navigate(`/articleReads/${article._id}`)}
              className="relative h-40 w-full overflow-hidden cursor-pointer bg-slate-950"
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
                <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {article.category || "Article"}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-500">
                  {formatPostDate(article.createdAt)}
                </span>
                <h3
                  onClick={() => navigate(`/articleReads/${article._id}`)}
                  className="font-heading font-bold text-base text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 cursor-pointer mt-1"
                >
                  {article.title}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                <button
                  onClick={() => navigate(`/articleReads/${article._id}`)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  Read Now →
                </button>
                {isOwner && (
                  <button
                    onClick={() => deleteArticle(article._id)}
                    title="Delete Article"
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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

export default YourArticle;
