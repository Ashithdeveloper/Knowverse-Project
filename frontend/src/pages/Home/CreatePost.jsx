import React, { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { baseUrl } from "../../constant/url";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Icons
import { 
  HiOutlinePhotograph, 
  HiOutlineVideoCamera, 
  HiOutlineHashtag, 
  HiX,
  HiOutlineSparkles
} from "react-icons/hi";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const mediaRef = useRef(null);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, media }) => {
      const formData = new FormData();
      formData.append("text", text);
      if (media) formData.append("media", media);

      const res = await fetch(`${baseUrl}/api/posts/create`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");
      return data;
    },
    onSuccess: (newPost) => {
      setText("");
      setMedia(null);
      if (mediaRef.current) mediaRef.current.value = "";
      toast.success("Broadcast posted to KnowVerse!");
      queryClient.setQueryData(["posts"], (oldPosts) => {
        if (!oldPosts) return [newPost];
        return [newPost, ...oldPosts];
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create post");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !media) {
      toast.error("Please provide some text or media for your post!");
      return;
    }
    createPost({ text, media });
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast.error("Media file must be under 25MB");
        return;
      }
      setMedia(file);
    }
  };

  const insertTag = (tag) => {
    setText((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const suggestedTags = ["#Knowledge", "#DevOps", "#WebDev", "#AI", "#Security"];

  return (
    <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/30 backdrop-blur-md">
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* User Avatar */}
        <div className="relative shrink-0">
          <img
            src={authUser?.profileImg || "/boy2.png"}
            alt={authUser?.fullName}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-cyan-500/30"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0B0F17] rounded-full" />
        </div>

        {/* Input Form */}
        <form className="flex flex-col gap-3 flex-1 min-w-0" onSubmit={handleSubmit}>
          <textarea
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-base sm:text-lg resize-none focus:outline-none min-h-[70px] leading-relaxed"
            placeholder="Share an insight, research discovery, or code breakthrough..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
          />

          {/* Media Preview Box */}
          {media && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-black/40 max-h-80 w-full group">
              <button
                type="button"
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-rose-500 transition-colors z-10"
                onClick={() => {
                  setMedia(null);
                  if (mediaRef.current) mediaRef.current.value = "";
                }}
              >
                <HiX className="w-5 h-5" />
              </button>

              {media.type.startsWith("video/") ? (
                <video
                  src={URL.createObjectURL(media)}
                  className="w-full max-h-80 object-contain rounded-xl"
                  controls
                />
              ) : (
                <img
                  src={URL.createObjectURL(media)}
                  alt="Preview"
                  className="w-full max-h-80 object-contain rounded-xl"
                />
              )}
            </div>
          )}

          {/* Quick Tag Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
              <HiOutlineHashtag className="w-3.5 h-3.5" /> Tags:
            </span>
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => insertTag(tag)}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/60 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Footer Controls & Post Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => mediaRef.current?.click()}
                title="Add Image or Video"
                className="flex items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              >
                <HiOutlinePhotograph className="w-5 h-5" />
                <span className="text-xs font-medium hidden sm:inline">Media</span>
              </button>

              <button
                type="button"
                onClick={() => mediaRef.current?.click()}
                title="Add Video"
                className="flex items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
              >
                <HiOutlineVideoCamera className="w-5 h-5" />
                <span className="text-xs font-medium hidden sm:inline">Video</span>
              </button>
            </div>

            <input
              type="file"
              accept="image/*,video/*"
              hidden
              ref={mediaRef}
              onChange={handleMediaChange}
            />

            <button
              type="submit"
              disabled={isPending || (!text.trim() && !media)}
              className="btn btn-sm px-5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="flex items-center gap-1.5">
                  <LoadingSpinner size="sm" />
                  <span>Posting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>Post</span>
                </div>
              )}
            </button>
          </div>

          {isError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
