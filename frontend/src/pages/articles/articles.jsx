import React, { useState, useRef } from "react";
import { baseUrl } from "../../constant/url";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ArticlesList from "./articlesList";
import ArticleSearchResults from "./ArticleSearchResults";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Icons
import {
  HiPlus,
  HiOutlineSearch,
  HiX,
  HiOutlinePhotograph,
  HiOutlineBookOpen,
} from "react-icons/hi";

const Articles = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Cybersecurity");
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const categories = [
    "All",
    "Cybersecurity",
    "DevOps & Cloud",
    "AI & ML",
    "Zero-Day & Exploits",
    "Web3 & Crypto",
    "Systems Programming",
  ];

  const { mutate: createArticleMutation, isPending: isPublishing } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("text", text);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(`${baseUrl}/api/articles/create`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to publish article");
      }
      return data;
    },
    onSuccess: (newArticle) => {
      toast.success("Article published to KnowVerse Knowledge Base!");
      setImage(null);
      setText("");
      setTitle("");
      setIsModalOpen(false);
      queryClient.setQueryData(["articles"], (old) => {
        if (!old) return [newArticle];
        return [newArticle, ...old];
      });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to publish article");
    },
  });

  const handlePublish = (e) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !text.trim()) {
      toast.error("Please fill in title, category, and article content.");
      return;
    }
    createArticleMutation();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error("Cover image should be under 15MB");
        return;
      }
      setImage(file);
    }
  };

  return (
    <main className="flex-1 min-w-0 border-r border-slate-800/80 min-h-screen pb-20 sm:pb-8">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-[#080C14]/85 backdrop-blur-xl border-b border-slate-800/80 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2">
              <HiOutlineBookOpen className="w-6 h-6 text-cyan-400" />
              <span>Knowledge Base & Articles</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              In-depth research, tutorials, and security engineering disclosures
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-slate-900/70 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <HiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar (only when not searching) */}
        {!query.trim() && (
          <div className="flex items-center gap-2 overflow-x-auto pt-3 no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-semibold"
                    : "bg-slate-900/40 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button: Publish Article */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 sm:bottom-8 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <HiPlus className="w-5 h-5 text-slate-950" />
        <span className="hidden sm:inline">Write Article</span>
      </button>

      {/* Main Articles View */}
      {query.trim() !== "" ? (
        <ArticleSearchResults query={query} />
      ) : (
        <ArticlesList selectedCategory={selectedCategory} />
      )}

      {/* Modern Publish Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0B0F17] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/40">
              <div>
                <h2 className="font-heading font-bold text-slate-100 text-lg">
                  Publish Technical Article
                </h2>
                <p className="text-xs text-slate-400">
                  Share research, threat reports, or engineering deep-dives
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePublish} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cover Image (Optional)
                </label>
                {image ? (
                  <div className="relative h-40 rounded-xl overflow-hidden border border-slate-700 bg-black/40 group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-28 rounded-xl border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/20 flex flex-col items-center justify-center cursor-pointer transition-colors p-4 text-center"
                  >
                    <HiOutlinePhotograph className="w-8 h-8 text-cyan-400/80 mb-1" />
                    <span className="text-xs text-slate-300 font-medium">
                      Click to upload article cover image
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">PNG, JPG, WEBP up to 15MB</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dissecting CVE-2026-1082: Zero-Day Architecture Analysis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  required
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60"
                >
                  <option value="Cybersecurity">Cybersecurity & SecOps</option>
                  <option value="Zero-Day & Exploits">Zero-Day & Exploits</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="AI & ML">AI & Machine Learning</option>
                  <option value="Web3 & Crypto">Web3 & Cryptography</option>
                  <option value="Systems Programming">Systems Programming</option>
                  <option value="General Tech">General Tech</option>
                </select>
              </div>

              {/* Article Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Article Content *
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Use double Enter for paragraphs
                  </span>
                </div>
                <textarea
                  rows={8}
                  placeholder="Write your article markdown or full text here. Separate paragraphs with a blank line for optimal readability..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 leading-relaxed font-sans"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-sm btn-ghost text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing || !title.trim() || !text.trim()}
                  className="btn btn-sm px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold border-none disabled:opacity-40"
                >
                  {isPublishing ? (
                    <div className="flex items-center gap-1.5">
                      <LoadingSpinner size="sm" />
                      <span>Publishing...</span>
                    </div>
                  ) : (
                    "Publish Article"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Articles;
