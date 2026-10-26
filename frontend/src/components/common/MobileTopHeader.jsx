import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineBell, HiOutlineSearch } from "react-icons/hi";
import CyberLogo from "./CyberLogo";

const MobileTopHeader = ({ authUser }) => {
  const { data: notifications } = useQuery({ queryKey: ["notifications"] });
  const unreadCount = notifications?.length || 0;

  return (
    <header className="sm:hidden sticky top-0 left-0 right-0 z-40 bg-[#080C14]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center">
        <CyberLogo size="sm" showText={true} />
      </Link>

      <div className="flex items-center gap-2">
        <Link
          to="/search"
          className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
          title="Search"
        >
          <HiOutlineSearch className="w-5 h-5" />
        </Link>

        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
          title="Notifications"
        >
          <HiOutlineBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#38BDF8]" />
          )}
        </Link>

        {authUser && (
          <Link to={`/profile/${authUser?.username}`} className="ml-1">
            <img
              src={authUser?.profileImg || "/boy2.png"}
              alt={authUser?.fullName}
              className="w-8 h-8 rounded-lg object-cover border border-cyan-500/40"
            />
          </Link>
        )}
      </div>
    </header>
  );
};

export default MobileTopHeader;
