import React, { useEffect } from "react";
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../../constant/url";
import { HiOutlineSparkles } from "react-icons/hi";

const Posts = ({ feedType, username, userId }) => {
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return `${baseUrl}/api/posts/all`;
      case "following":
        return `${baseUrl}/api/posts/following`;
      case "posts":
        return `${baseUrl}/api/posts/user/${username}`;
      case "likes":
        return `${baseUrl}/api/posts/likes/${userId}`;
      default:
        return `${baseUrl}/api/posts/all`;
    }
  };

  const POST_ENDPOINT = getPostEndpoint();

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", feedType, username, userId],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load posts");
        }
        return data;
      } catch (error) {
        throw new Error(error.message || "Failed to load posts");
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, username, userId, refetch]);

  return (
    <div className="flex flex-col">
      {(isLoading || isRefetching) && (
        <div className="flex flex-col">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {!isLoading && !isRefetching && posts?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <HiOutlineSparkles className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-slate-200">No posts in this feed yet</p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            {feedType === "following"
              ? "Follow other engineers and security researchers to see their broadcasts here!"
              : "Be the first to post a discussion topic or security advisory."}
          </p>
        </div>
      )}

      {!isLoading && !isRefetching && posts && (
        <div className="divide-y divide-slate-800/80">
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;
