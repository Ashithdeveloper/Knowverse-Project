import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../../../constant/url";
import toast from "react-hot-toast";
import CyberLogo from "../../../components/common/CyberLogo";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

// Icons
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineIdentification,
  HiOutlineShieldCheck,
  HiOutlineTerminal,
  HiOutlineSparkles,
} from "react-icons/hi";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const queryClient = useQueryClient();

  const {
    mutate: signupMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ email, username, fullName, password }) => {
      const res = await fetch(`${baseUrl}/api/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, username, fullName, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      if (data.token) {
        localStorage.setItem("cyberhaven_token", data.token);
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success("Account created successfully! Welcome to CyberHaven.");
      queryClient.setQueryData(["authUser"], data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create account");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    signupMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const benefits = [
    {
      icon: HiOutlineTerminal,
      title: "Interactive Code & Threat Feed",
      desc: "Post security advisories, code snippets, and research.",
    },
    {
      icon: HiOutlineShieldCheck,
      title: "Verified Developer Badging",
      desc: "Gain recognition from security teams & engineering peers.",
    },
    {
      icon: HiOutlineSparkles,
      title: "Technical Knowledge Hub",
      desc: "Publish and read comprehensive research guides.",
    },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#080C14]">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Brand & Value Props (desktop) */}
        <div className="p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-black/60">
          <div>
            <CyberLogo size="lg" showText={true} />

            <div className="mt-10 sm:mt-14">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                JOIN THE ELITE NETWORK
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-100 mt-4 leading-tight">
                Connect with the World&apos;s Foremost Cyber Minds
              </h2>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Create your developer identity, publish technical discoveries, and stay ahead of zero-day exploits.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              {benefits.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-slate-800/60 text-cyan-400 border border-slate-700/60 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>NO SPAM • PRIVACY FIRST</span>
            <span>END-TO-END VERIFIED</span>
          </div>
        </div>

        {/* Right Column: Sign Up Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h3 className="font-heading font-black text-2xl text-slate-100 mb-1">
              Create your account
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Enter your details to register on CyberHaven
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <HiOutlineIdentification className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Alex Mercer"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username *
                  </label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="username"
                      placeholder="alex_sec"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    placeholder="alex@domain.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Password *
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Min. 8 characters</span>
                </div>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff className="w-4 h-4" />
                    ) : (
                      <HiOutlineEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="btn w-full mt-2 rounded-xl py-3 font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 border-none shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 disabled:opacity-50"
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Registering Security Profile...</span>
                  </div>
                ) : (
                  "Create Free Account"
                )}
              </button>

              {isError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
                  {error.message}
                </div>
              )}
            </form>

            {/* Switch to Sign In */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
              <p className="text-xs sm:text-sm text-slate-400">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
