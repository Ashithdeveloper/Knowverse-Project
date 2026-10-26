import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant/url";

// Icons
import { 
  HiOutlineHome, 
  HiHome, 
  HiOutlineSearch, 
  HiSearch,
  HiOutlineBell,
  HiBell,
  HiOutlineUser,
  HiUser,
  HiOutlineDocumentText,
  HiDocumentText,
  HiOutlineLogout,
  HiSparkles
} from "react-icons/hi";
import CyberLogo from "./CyberLogo";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Logout failed");
      }
      return data;
    },
    onSuccess: () => {
      localStorage.removeItem("knowverse_token");
      localStorage.removeItem("cyberhaven_token");
      toast.success("Logged out successfully");
      queryClient.setQueryData(["authUser"], null);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => {
      toast.error(err.message || "Logout failed");
    },
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { data: notifications } = useQuery({ queryKey: ["notifications"] });
  const unreadCount = notifications?.length || 0;

  const currentPath = location.pathname;

  const navItems = [
    {
      label: "Home",
      to: "/",
      iconOutline: HiOutlineHome,
      iconSolid: HiHome,
      isActive: currentPath === "/",
    },
    {
      label: "Explore",
      to: "/search",
      iconOutline: HiOutlineSearch,
      iconSolid: HiSearch,
      isActive: currentPath === "/search",
    },
    {
      label: "Articles",
      to: "/articles",
      iconOutline: HiOutlineDocumentText,
      iconSolid: HiDocumentText,
      isActive: currentPath.startsWith("/articles") || currentPath.startsWith("/articleReads"),
    },
    {
      label: "Notifications",
      to: "/notifications",
      iconOutline: HiOutlineBell,
      iconSolid: HiBell,
      isActive: currentPath === "/notifications",
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      label: "Profile",
      to: `/profile/${authUser?.username}`,
      iconOutline: HiOutlineUser,
      iconSolid: HiUser,
      isActive: currentPath === `/profile/${authUser?.username}`,
    },
  ];

  return (
    <aside className="hidden sm:flex flex-col w-20 xl:w-64 h-screen sticky top-0 px-2 xl:px-4 py-4 border-r border-slate-800/80 bg-[#080C14]/90 backdrop-blur-xl z-30 select-none justify-between shrink-0">
      {/* Top Branding */}
      <div>
        <Link
          to="/"
          className="flex items-center justify-center xl:justify-start px-2 py-3 rounded-2xl hover:bg-slate-800/40 transition-all duration-200 group"
        >
          <div className="hidden xl:block">
            <CyberLogo size="md" showText={true} />
          </div>
          <div className="xl:hidden">
            <CyberLogo size="md" showText={false} />
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="mt-6 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.isActive ? item.iconSolid : item.iconOutline;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center justify-center xl:justify-start gap-4 px-3.5 py-3 rounded-xl font-medium transition-all duration-200 group ${
                  item.isActive
                    ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                {/* Active Indicator Bar on desktop */}
                {item.isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full hidden xl:block shadow-[0_0_8px_#38BDF8]" />
                )}

                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-transform duration-200 group-hover:scale-110 ${
                      item.isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-cyan-500 text-black rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>

                <span className="hidden xl:block text-[15px] tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Action Button */}
        <div className="mt-6 px-1">
          <Link
            to="/articles"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98]"
          >
            <HiSparkles className="w-5 h-5 shrink-0 text-slate-950" />
            <span className="hidden xl:block tracking-wide">Write Article</span>
          </Link>
        </div>
      </div>

      {/* User Footer Profile */}
      {authUser && (
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200">
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex items-center gap-3 min-w-0 flex-1 group"
            >
              <div className="relative shrink-0">
                <img
                  src={authUser?.profileImg || "/boy2.png"}
                  alt={authUser?.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30 group-hover:border-cyan-400 transition-colors"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#080C14] rounded-full" />
              </div>

              <div className="hidden xl:flex flex-col min-w-0 pr-2">
                <span className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                  {authUser?.fullName}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  @{authUser?.username}
                </span>
              </div>
            </Link>

            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <HiOutlineLogout className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
