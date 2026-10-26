import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiHome,
  HiOutlineSearch,
  HiSearch,
  HiOutlineDocumentText,
  HiDocumentText,
  HiOutlineBell,
  HiBell,
  HiOutlineUser,
  HiUser,
} from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";

const BottomNavbar = ({ authUser }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const { data: notifications } = useQuery({ queryKey: ["notifications"] });
  const unreadCount = notifications?.length || 0;

  const navItems = [
    {
      to: "/",
      label: "Home",
      iconOutline: HiOutlineHome,
      iconSolid: HiHome,
      isActive: currentPath === "/",
    },
    {
      to: "/search",
      label: "Explore",
      iconOutline: HiOutlineSearch,
      iconSolid: HiSearch,
      isActive: currentPath === "/search",
    },
    {
      to: "/articles",
      label: "Articles",
      iconOutline: HiOutlineDocumentText,
      iconSolid: HiDocumentText,
      isActive: currentPath.startsWith("/articles") || currentPath.startsWith("/articleReads"),
    },
    {
      to: "/notifications",
      label: "Alerts",
      iconOutline: HiOutlineBell,
      iconSolid: HiBell,
      isActive: currentPath === "/notifications",
      hasBadge: unreadCount > 0,
    },
    {
      to: `/profile/${authUser?.username}`,
      label: "Profile",
      iconOutline: HiOutlineUser,
      iconSolid: HiUser,
      isActive: currentPath === `/profile/${authUser?.username}`,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-[#080C14]/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.isActive ? item.iconSolid : item.iconOutline;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative ${
                item.isActive ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" : ""}`} />
                {item.hasBadge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_6px_#38BDF8]" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">
                {item.label}
              </span>
              {item.isActive && (
                <div className="w-4 h-0.5 bg-cyan-400 rounded-full mt-0.5 shadow-[0_0_4px_#38BDF8]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
