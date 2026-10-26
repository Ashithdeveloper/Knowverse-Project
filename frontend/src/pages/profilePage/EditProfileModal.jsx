import React, { useEffect, useState } from "react";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { HiOutlinePencil, HiX, HiLockClosed, HiGlobeAlt } from "react-icons/hi";

const EditProfileModal = ({ authUser }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName || "",
        username: authUser.username || "",
        email: authUser.email || "",
        bio: authUser.bio || "",
        link: authUser.links ? (Array.isArray(authUser.links) ? authUser.links[0] || "" : authUser.links) : "",
        newPassword: "",
        currentPassword: "",
      });
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-sm rounded-xl px-4 font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all flex items-center gap-1.5"
      >
        <HiOutlinePencil className="w-4 h-4 text-cyan-400" />
        <span>Edit Profile</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0B0F17] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/40">
              <h3 className="font-heading font-bold text-slate-100 text-lg">
                Edit Developer Profile
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    name="fullName"
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    name="username"
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  name="email"
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bio / Security Focus
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Offensive Security Researcher | Cloud Arch | Zero-Trust enthusiast"
                  value={formData.bio}
                  name="bio"
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <HiGlobeAlt className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Website / GitHub / Portfolio Link</span>
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/yourhandle"
                  value={formData.link}
                  name="link"
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              {/* Password update section */}
              <div className="pt-3 border-t border-slate-800/80">
                <p className="text-xs font-mono font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <HiLockClosed className="w-4 h-4 text-purple-400" />
                  <span>SECURITY CREDENTIALS (LEAVE BLANK TO KEEP UNCHANGED)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={formData.currentPassword}
                    name="currentPassword"
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                  <input
                    type="password"
                    placeholder="New Password (min 8 chars)"
                    value={formData.newPassword}
                    name="newPassword"
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-sm btn-ghost text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="btn btn-sm px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold border-none"
                >
                  {isUpdatingProfile ? (
                    <div className="flex items-center gap-1.5">
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfileModal;
