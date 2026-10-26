import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";
import { baseUrl } from "../../constant/url";
import { HiOutlineTrendingUp, HiShieldCheck, HiSparkles, HiCheck } from "react-icons/hi";

const RightPanel = () => {
  const navigate = useNavigate();
  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/users/suggested`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong!");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  const { follow, isPending } = useFollow();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const trendingTopics = [
    { tag: "ZeroDayExploits", category: "Cybersecurity", posts: "2.4k posts" },
    { tag: "CloudArchitecture", category: "DevOps & Cloud", posts: "1.8k posts" },
    { tag: "LLMSecurity", category: "AI Research", posts: "3.1k posts" },
    { tag: "RustSystems", category: "Systems Dev", posts: "950 posts" },
    { tag: "EthicalHacking", category: "InfoSec", posts: "4.2k posts" },
  ];

  return (
    <div className="hidden lg:block w-72 xl:w-80 px-4 py-4 shrink-0">
      <div className="sticky top-4 flex flex-col gap-5">
        {/* Trending Tech Topics */}
        <div className="rounded-2xl p-4 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineTrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="font-heading font-bold text-slate-100 text-sm tracking-wide">
              Trending in Tech & Security
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {trendingTopics.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/search?q=${item.tag}`)}
                className="group cursor-pointer p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{item.category}</span>
                  <span className="font-mono text-[11px] text-slate-500">{item.posts}</span>
                </div>
                <div className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
                  #{item.tag}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Who to Follow */}
        <div className="rounded-2xl p-4 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiShieldCheck className="w-5 h-5 text-purple-400" />
              <h3 className="font-heading font-bold text-slate-100 text-sm tracking-wide">
                Security Engineers & Devs
              </h3>
            </div>
            <Link to="/search" className="text-xs text-cyan-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading && (
              <>
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
              </>
            )}

            {!isLoading && suggestedUsers?.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-2">
                No new recommendations right now.
              </p>
            )}

            {!isLoading &&
              suggestedUsers?.map((user) => {
                const isFollowing = authUser?.following?.includes(user._id);
                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-800/40 transition-colors"
                  >
                    <Link
                      to={`/profile/${user.username}`}
                      className="flex items-center gap-2.5 min-w-0 flex-1 group"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={user.profileImg || "/boy2.png"}
                          alt={user.fullName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700/80 group-hover:border-cyan-400/60 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 pr-1">
                        <span className="font-semibold text-xs text-slate-200 group-hover:text-cyan-300 transition-colors truncate flex items-center gap-1">
                          {user.fullName}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          @{user.username}
                        </span>
                      </div>
                    </Link>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        follow(user._id);
                      }}
                      disabled={isPending}
                      className={`btn btn-xs rounded-lg px-3 text-xs font-semibold transition-all duration-200 ${
                        isFollowing
                          ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                          : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                      }`}
                    >
                      {isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : isFollowing ? (
                        <span className="flex items-center gap-1"><HiCheck className="w-3 h-3" /> Following</span>
                      ) : (
                        "Follow"
                      )}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Footer info & CyberHaven telemetry badge */}
        <div className="px-2 text-[11px] text-slate-500 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10B981]" />
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
              Network Online • TLS 1.3
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-500">
            <Link to="/articles" className="hover:text-cyan-400 transition-colors">Knowledge Base</Link>
            <Link to="/search" className="hover:text-cyan-400 transition-colors">Security Directory</Link>
            <span>•</span>
            <span>© 2026 CyberHaven</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
