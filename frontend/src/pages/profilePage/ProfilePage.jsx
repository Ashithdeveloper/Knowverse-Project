import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import YourArticle from "../articles/Yourarticle";
import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import { baseUrl } from "../../constant/url";
import { formatMemberSinceDate } from "../../utils/date";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Icons
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineLink,
  HiOutlineCamera,
  HiBadgeCheck,
  HiOutlineLogout,
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineDocumentText,
  HiCheck,
} from "react-icons/hi";

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts"); // "posts", "likes", "articles"

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { username } = useParams();
  const { follow, isPending: isFollowPending } = useFollow();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/users/profile/${username}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "User not found");
      return data;
    },
  });

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Logout failed");
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      queryClient.setQueryData(["authUser"], null);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

  const isMyProfile = authUser?._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following?.includes(user?._id);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  const defaultCover =
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80";

  return (
    <main className="flex-1 min-w-0 border-r border-slate-800/80 min-h-screen pb-20 sm:pb-8">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-[#080C14]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-1.5 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-heading font-bold text-base sm:text-lg text-slate-100 flex items-center gap-1.5">
              <span>{user?.fullName || username}</span>
              <HiBadgeCheck className="w-4 h-4 text-cyan-400" />
            </h1>
            <span className="text-xs text-slate-400">
              @{username}
            </span>
          </div>
        </div>

        {isMyProfile && (
          <button
            onClick={() => logout()}
            className="sm:hidden p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Logout"
          >
            <HiOutlineLogout className="w-5 h-5" />
          </button>
        )}
      </div>

      {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}

      {!isLoading && !isRefetching && !user && (
        <div className="py-24 text-center text-slate-400">
          <h2 className="text-xl font-bold text-slate-200">User Not Found</h2>
          <p className="text-sm mt-1 text-slate-500">
            The profile &quot;{username}&quot; does not exist on CyberHaven.
          </p>
          <Link to="/" className="btn btn-sm btn-outline mt-4 rounded-xl">
            Go Home
          </Link>
        </div>
      )}

      {!isLoading && !isRefetching && user && (
        <div className="flex flex-col">
          {/* Cover Banner */}
          <div className="relative h-44 sm:h-60 w-full overflow-hidden bg-slate-950 group">
            <img
              src={coverImg || user.coverImg || defaultCover}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-transparent to-transparent opacity-60" />

            {isMyProfile && (
              <button
                onClick={() => coverImgRef.current?.click()}
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 text-slate-200 hover:text-cyan-300 hover:bg-slate-900 transition-all border border-slate-700 backdrop-blur-md shadow-lg"
                title="Change Cover Banner"
              >
                <HiOutlineCamera className="w-5 h-5" />
              </button>
            )}

            <input
              type="file"
              hidden
              accept="image/*"
              ref={coverImgRef}
              onChange={(e) => handleImgChange(e, "coverImg")}
            />
            <input
              type="file"
              hidden
              accept="image/*"
              ref={profileImgRef}
              onChange={(e) => handleImgChange(e, "profileImg")}
            />
          </div>

          {/* Profile Details Header */}
          <div className="px-4 sm:px-6 relative">
            {/* Avatar & Action Button Row */}
            <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-4">
              {/* Avatar with edit overlay */}
              <div className="relative group">
                <img
                  src={profileImg || user.profileImg || "/boy2.png"}
                  alt={user.fullName}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-[#080C14] bg-[#0B0F17] shadow-xl"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#080C14] rounded-full" />

                {isMyProfile && (
                  <button
                    onClick={() => profileImgRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Change Profile Picture"
                  >
                    <HiOutlineCamera className="w-8 h-8 text-cyan-300" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isMyProfile && <EditProfileModal authUser={authUser} />}

                {!isMyProfile && (
                  <button
                    onClick={() => follow(user._id)}
                    disabled={isFollowPending}
                    className={`btn btn-sm rounded-xl px-5 font-semibold transition-all ${
                      amIFollowing
                        ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                        : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    }`}
                  >
                    {isFollowPending ? (
                      "Loading..."
                    ) : amIFollowing ? (
                      <span className="flex items-center gap-1.5">
                        <HiCheck className="w-4 h-4" /> Following
                      </span>
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}

                {(coverImg || profileImg) && (
                  <button
                    onClick={async () => {
                      await updateProfile({ coverImg, profileImg });
                      setProfileImg(null);
                      setCoverImg(null);
                      toast.success("Profile imagery updated!");
                    }}
                    disabled={isUpdatingProfile}
                    className="btn btn-sm rounded-xl px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold border-none"
                  >
                    {isUpdatingProfile ? "Saving..." : "Save Image"}
                  </button>
                )}
              </div>
            </div>

            {/* User Bio & Meta Details */}
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-100 flex items-center gap-2">
                  <span>{user.fullName}</span>
                  <HiBadgeCheck className="w-5 h-5 text-cyan-400" />
                </h2>
                <p className="text-sm text-slate-400 font-mono">@{user.username}</p>
              </div>

              {user.bio ? (
                <p className="text-sm text-slate-200 leading-relaxed max-w-2xl whitespace-pre-line">
                  {user.bio}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">No bio provided yet.</p>
              )}

              {/* Meta pills: Links & Join Date */}
              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400 pt-1">
                {user.links && (Array.isArray(user.links) ? user.links.length > 0 : user.links) && (
                  <div className="flex items-center gap-1.5">
                    <HiOutlineLink className="w-4 h-4 text-cyan-400" />
                    <a
                      href={Array.isArray(user.links) ? user.links[0] : user.links}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline truncate max-w-xs"
                    >
                      {Array.isArray(user.links) ? user.links[0] : user.links}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <HiOutlineCalendar className="w-4 h-4 text-slate-500" />
                  <span>Joined {memberSinceDate}</span>
                </div>
              </div>

              {/* Follower stats */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold font-mono text-sm text-slate-100">
                    {user.following?.length || 0}
                  </span>
                  <span className="text-xs text-slate-400">Following</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold font-mono text-sm text-slate-100">
                    {user.followers?.length || 0}
                  </span>
                  <span className="text-xs text-slate-400">Followers</span>
                </div>
              </div>
            </div>

            {/* Tab Bar */}
            <div className="flex w-full border-b border-slate-800/80 mt-6">
              <button
                type="button"
                onClick={() => setFeedType("posts")}
                className={`flex-1 py-3 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
                  feedType === "posts"
                    ? "text-cyan-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <HiOutlineSparkles className="w-4 h-4" />
                <span>Posts</span>
                {feedType === "posts" && (
                  <div className="absolute bottom-0 w-16 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setFeedType("likes")}
                className={`flex-1 py-3 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
                  feedType === "likes"
                    ? "text-cyan-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <HiOutlineHeart className="w-4 h-4" />
                <span>Likes</span>
                {feedType === "likes" && (
                  <div className="absolute bottom-0 w-16 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setFeedType("articles")}
                className={`flex-1 py-3 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
                  feedType === "articles"
                    ? "text-cyan-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <HiOutlineDocumentText className="w-4 h-4" />
                <span>Articles</span>
                {feedType === "articles" && (
                  <div className="absolute bottom-0 w-16 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8]" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {feedType === "articles" ? (
            <YourArticle id={user._id} />
          ) : (
            <Posts feedType={feedType} username={username} userId={user._id} />
          )}
        </div>
      )}
    </main>
  );
};

export default ProfilePage;
