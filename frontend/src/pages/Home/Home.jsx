import React, { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import { HiSparkles, HiUserGroup } from "react-icons/hi";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  return (
    <main className="flex-1 min-w-0 border-r border-slate-800/80 min-h-screen pb-16 sm:pb-0">
      {/* Sticky Header with Feed Selector Tabs */}
      <div className="sticky top-0 z-20 bg-[#080C14]/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
            <span>Discussions & Feed</span>
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Live
          </span>
        </div>

        {/* Tab Controls */}
        <div className="flex w-full border-t border-slate-800/60">
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
              feedType === "forYou"
                ? "text-cyan-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
            onClick={() => setFeedType("forYou")}
          >
            <HiSparkles className="w-4 h-4" />
            <span>For you</span>
            {feedType === "forYou" && (
              <div className="absolute bottom-0 w-16 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38BDF8]" />
            )}
          </button>

          <button
            type="button"
            className={`flex-1 py-3 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
              feedType === "following"
                ? "text-cyan-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
            onClick={() => setFeedType("following")}
          >
            <HiUserGroup className="w-4 h-4" />
            <span>Following</span>
            {feedType === "following" && (
              <div className="absolute bottom-0 w-16 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38BDF8]" />
            )}
          </button>
        </div>
      </div>

      {/* Post Creation Box */}
      <CreatePost />

      {/* Feed Posts */}
      <Posts feedType={feedType} />
    </main>
  );
};

export default HomePage;
