import React, { useState, useEffect } from "react";
import { baseUrl } from "../../constant/url";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "../common/LoadingSpinner";

// Icons
import {
  HiOutlineSearch,
  HiX,
  HiBadgeCheck,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiCheck,
  HiSparkles,
} from "react-icons/hi";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("all"); // "all", "users", "articles"

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { follow, isPending: isFollowPending } = useFollow();

  // Keep URL query in sync
  useEffect(() => {
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  }, [query, setSearchParams]);

  // Query users
  const {
    data: userResults = [],
    isLoading: isUsersLoading,
  } = useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await fetch(
        `${baseUrl}/api/users/search?q=${encodeURIComponent(query.trim())}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to search users");
      return res.json();
    },
    enabled: query.trim().length > 0,
  });

  // Query articles
  const {
    data: articleResults = [],
    isLoading: isArticlesLoading,
  } = useQuery({
    queryKey: ["searchArticles", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await fetch(
        `${baseUrl}/api/articles/article/search?q=${encodeURIComponent(query.trim())}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: query.trim().length > 0,
  });

  const isLoading = (isUsersLoading || isArticlesLoading) && query.trim().length > 0;

  const popularSearches = [
    "ZeroDay",
    "Security",
    "DevOps",
    "Cloud",
    "AI",
    "Exploit",
    "Kubernetes",
    "Rust",
  ];

  return (
    <main className="flex-1 min-w-0 border-r border-slate-800/80 min-h-screen pb-20 sm:pb-8">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-20 bg-[#080C14]/85 backdrop-blur-xl border-b border-slate-800/80 p-4">
        <h1 className="text-lg font-heading font-bold text-slate-100 mb-3 flex items-center gap-2">
          <HiOutlineSearch className="w-5 h-5 text-cyan-400" />
          <span>Explore KnowVerse Network</span>
        </h1>

        {/* Search Input Box */}
        <div className="relative w-full">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, handle, topic, or article..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-11 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 shadow-inner"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <HiX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Filters (when query is active) */}
        {query.trim() && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/60">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Results ({userResults.length + articleResults.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "users"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Engineers ({userResults.length})
            </button>
            <button
              onClick={() => setActiveTab("articles")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "articles"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Articles ({articleResults.length})
            </button>
          </div>
        )}
      </div>

      {/* Suggested Topics when search is empty */}
      {!query.trim() && (
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-3">
            <HiSparkles className="w-4 h-4" />
            <span>DISCOVER TOPICS</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 hover:bg-slate-800/60 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>

          <div className="mt-12 text-center text-slate-500 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-3">
              <HiOutlineSearch className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              Find Anyone or Anything on KnowVerse
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Search by username, full name, or search technical research articles.
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Results View */}
      {!isLoading && query.trim() && (
        <div className="p-4 flex flex-col gap-6">
          {/* Engineers / Users Section */}
          {(activeTab === "all" || activeTab === "users") && userResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <HiOutlineUserGroup className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Engineers & Researchers ({userResults.length})
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                {userResults.map((u) => {
                  const isFollowing = authUser?.following?.includes(u._id);
                  const isMe = authUser?._id === u._id;
                  return (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/30 transition-all duration-200"
                    >
                      <Link
                        to={`/profile/${u.username}`}
                        className="flex items-center gap-3 min-w-0 flex-1 group"
                      >
                        <img
                          src={u.profileImg || "/boy2.png"}
                          alt={u.fullName}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-700 group-hover:border-cyan-400 transition-colors"
                        />
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors truncate flex items-center gap-1">
                            {u.fullName}
                            <HiBadgeCheck className="w-4 h-4 text-cyan-400" />
                          </span>
                          <span className="text-xs text-slate-400 truncate">
                            @{u.username}
                          </span>
                          {u.bio && (
                            <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {u.bio}
                            </span>
                          )}
                        </div>
                      </Link>

                      {!isMe && (
                        <button
                          onClick={() => follow(u._id)}
                          disabled={isFollowPending}
                          className={`btn btn-xs rounded-xl px-3 font-semibold transition-all ${
                            isFollowing
                              ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-rose-500/20 hover:text-rose-300"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950"
                          }`}
                        >
                          {isFollowing ? (
                            <span className="flex items-center gap-1">
                              <HiCheck className="w-3.5 h-3.5" /> Following
                            </span>
                          ) : (
                            "Follow"
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Articles Section */}
          {(activeTab === "all" || activeTab === "articles") && articleResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <HiOutlineDocumentText className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Knowledge & Research Articles ({articleResults.length})
                </h3>
              </div>

              <div className="flex flex-col gap-2.5">
                {articleResults.map((article) => (
                  <Link
                    key={article._id}
                    to={`/articleReads/${article._id}`}
                    className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-200 group flex items-start justify-between gap-3"
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[11px] font-mono text-purple-400 uppercase font-semibold">
                        {article.category || "Article"}
                      </span>
                      <h4 className="font-heading font-bold text-sm sm:text-base text-slate-100 group-hover:text-purple-300 transition-colors mt-0.5 line-clamp-1">
                        {article.title}
                      </h4>
                      {article.text && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {article.text.replace(/\\n/g, " ").replace(/\n/g, " ")}
                        </p>
                      )}
                    </div>
                    {article.img && (
                      <img
                        src={article.img}
                        alt={article.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty search results */}
          {userResults.length === 0 && articleResults.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <p className="text-base font-semibold text-slate-200">
                No results found for &quot;{query}&quot;
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Check your spelling or try different technical keywords.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Search;
