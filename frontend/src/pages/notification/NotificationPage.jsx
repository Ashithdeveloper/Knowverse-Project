import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { baseUrl } from "../../constant/url";
import { formatPostDate } from "../../utils/date";

// Icons
import {
  HiOutlineBell,
  HiOutlineHeart,
  HiOutlineUserAdd,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiBadgeCheck,
  HiX,
} from "react-icons/hi";

const NotificationPage = () => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("all"); // "all", "like", "follow"
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/notifications`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load notifications");
      return data;
    },
  });

  const { mutate: deleteNotifications, isPending: isClearing } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseUrl}/api/notifications`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clear notifications");
      return data;
    },
    onSuccess: () => {
      toast.success("Notifications cleared");
      setShowConfirmClear(false);
      queryClient.setQueryData(["notifications"], []);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  return (
    <main className="flex-1 min-w-0 border-r border-slate-800/80 min-h-screen pb-20 sm:pb-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-[#080C14]/85 backdrop-blur-xl border-b border-slate-800/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineBell className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-heading font-bold text-slate-100">
              Activity & Notifications
            </h1>
            {notifications.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {notifications.length}
              </span>
            )}
          </div>

          {notifications.length > 0 && (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 p-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
              title="Clear All Notifications"
            >
              <HiOutlineTrash className="w-4 h-4" />
              <span className="hidden sm:inline">Clear all</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/60">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === "all"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter("like")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === "like"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Likes ({notifications.filter((n) => n.type === "like").length})
          </button>
          <button
            onClick={() => setActiveFilter("follow")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === "follow"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Follows ({notifications.filter((n) => n.type === "follow").length})
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredNotifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <HiOutlineCheckCircle className="w-7 h-7" />
          </div>
          <p className="text-base font-semibold text-slate-200">You&apos;re all caught up!</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            No new activity or alerts right now. When users interact with your posts or articles, you will see notifications here.
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && filteredNotifications.length > 0 && (
        <div className="divide-y divide-slate-800/80">
          {filteredNotifications.map((notification) => {
            const sender = notification.from || {};
            const isFollow = notification.type === "follow";
            const isLike = notification.type === "like";

            return (
              <div
                key={notification._id}
                className="flex items-center gap-4 p-4 hover:bg-slate-900/30 transition-colors"
              >
                {/* Type Icon Badge */}
                <div className="relative shrink-0">
                  <Link to={`/profile/${sender.username}`}>
                    <img
                      src={sender.profileImg || "/boy2.png"}
                      alt={sender.fullName}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                    />
                  </Link>
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0B0F17] shadow-sm ${
                      isLike ? "bg-rose-500 text-white" : "bg-cyan-500 text-slate-950"
                    }`}
                  >
                    {isLike ? (
                      <HiOutlineHeart className="w-3 h-3 fill-current" />
                    ) : (
                      <HiOutlineUserAdd className="w-3 h-3 stroke-[3]" />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="text-sm text-slate-300 leading-normal">
                    <Link
                      to={`/profile/${sender.username}`}
                      className="font-bold text-slate-100 hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                    >
                      <span>{sender.fullName || "User"}</span>
                      <HiBadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                    </Link>{" "}
                    <span className="text-slate-400">
                      {isFollow ? "started following your security research" : "liked your post broadcast"}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 mt-1">
                    {formatPostDate(notification.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Clear Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0B0F17] border border-slate-800 p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-slate-100 text-base mb-2">
              Clear All Notifications?
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              This will remove all notification records from your feed. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="btn btn-sm btn-ghost text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteNotifications()}
                disabled={isClearing}
                className="btn btn-sm bg-rose-500 hover:bg-rose-600 text-white font-semibold border-none rounded-xl"
              >
                {isClearing ? "Clearing..." : "Yes, Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default NotificationPage;
