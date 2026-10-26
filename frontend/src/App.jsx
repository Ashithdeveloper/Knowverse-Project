import React from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import HomePage from "./pages/Home/Home";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profilePage/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "./constant/url";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Articles from "./pages/articles/articles";
import Search from "./components/searching/Search";
import BottomNavbar from "./components/common/BottomNavbar";
import MobileTopHeader from "./components/common/MobileTopHeader";
import ArticlesReads from "./pages/articles/ArticlesReads";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("cyberhaven_token");
        const headers = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${baseUrl}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          headers,
        });

        const data = await res.json();
        if (data.error || !res.ok) {
          return null;
        }

        return data;
      } catch {
        return null;
      }
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 justify-center items-center h-screen bg-[#080C14] text-slate-100">
        <LoadingSpinner size="lg" />
        <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
          Initializing CyberHaven...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col justify-between">
      {/* Mobile Top Header */}
      {authUser && <MobileTopHeader authUser={authUser} />}

      {/* Main Container */}
      <div className="flex w-full max-w-7xl mx-auto flex-1 min-w-0">
        {authUser ? <Sidebar /> : null}

        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/notifications"
            element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/articles"
            element={authUser ? <Articles /> : <Navigate to="/login" />}
          />
          <Route
            path="/articleReads/:id"
            element={authUser ? <ArticlesReads /> : <Navigate to="/login" />}
          />
          <Route
            path="/search"
            element={authUser ? <Search /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile/:username"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {authUser ? <RightPanel /> : null}
      </div>

      {/* Mobile Bottom Navigation */}
      {authUser ? <BottomNavbar authUser={authUser} /> : null}

      {/* Modern Dark Toaster */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#0F172A",
            color: "#F8FAFC",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: "14px",
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.8)",
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
          },
          success: {
            iconTheme: {
              primary: "#38BDF8",
              secondary: "#0F172A",
            },
          },
          error: {
            iconTheme: {
              primary: "#F43F5E",
              secondary: "#0F172A",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
