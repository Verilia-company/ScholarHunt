"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import NewsletterSubscription from "./NewsletterSubscription";
import { usePageTracking } from "../lib/analytics";
import { ToastContainer, useToast } from "./Toast";
import WhatsAppWidget from "./WhatsAppWidget";
import Image from "next/image";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Add page tracking
  usePageTracking();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
  const [signInLoading, setSignInLoading] = React.useState(false);

  // Toast system
  const { toasts, removeToast } = useToast();

  const {
    user,
    loading,
    signInWithGoogle,
    isAdmin,
    silentSignIn,
    initializeOneTap,
  } = useAuth();
  React.useEffect(() => {
    // Only access sessionStorage after component mounts to avoid hydration issues
    if (typeof window === "undefined") return;

    // Check if user previously chose to skip sign-in prompt
    const skipPrompt = sessionStorage.getItem("skipSignInPrompt"); // Show prompt if user is not signed in and hasn't skipped it
    if (!user && !loading && !skipPrompt) {
      // Wait for Google Identity Services to load
      const waitForGoogle = () => {
        if (window.google?.accounts?.id) {
          // Use Google One Tap (most seamless)
          try {
            console.log("Initializing Google One Tap...");
            initializeOneTap();
          } catch (error) {
            console.log("One Tap initialization failed:", error);
            // One Tap failed, but we'll rely on users manually signing in
            // No fallback to custom modal since One Tap is preferred
          }
        } else {
          // Retry if Google Identity Services isn't loaded yet
          setTimeout(waitForGoogle, 500);
        }
      }; // Start checking after a short delay to allow scripts to load
      const initTimer = setTimeout(waitForGoogle, 1000);

      // No fallback modal timer since One Tap is working well

      return () => {
        clearTimeout(initTimer);
      };
    }
  }, [user, loading, initializeOneTap]);

  // Close profile dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".profile-dropdown-container")) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileDropdown]);

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".mobile-menu-container")) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  const handleSignIn = async () => {
    try {
      setSignInLoading(true);

      // First try silent sign-in
      const silentSuccess = await silentSignIn();
      if (silentSuccess) {
        // setShowSignInPrompt(false); // This state was removed
        return;
      }

      // If silent sign-in fails, show popup
      await signInWithGoogle();
      // setShowSignInPrompt(false); // This state was removed
    } catch (error) {
      console.error("Sign in failed:", error);
      // You could show an error toast here
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async () => {
    // Same as sign-in for Google OAuth - it handles both cases
    try {
      setSignInLoading(true);

      // First try silent sign-in
      const silentSuccess = await silentSignIn();
      if (silentSuccess) {
        // setShowSignInPrompt(false); // This state was removed
        return;
      }

      // If silent sign-in fails, show popup
      await signInWithGoogle();
      // setShowSignInPrompt(false); // This state was removed
    } catch (error) {
      console.error("Sign up failed:", error);
      // You could show an error toast here
    } finally {
      setSignInLoading(false);
    }
  };

  // Commented out since custom modal is disabled in favor of One Tap
  // const handleContinueWithoutSignIn = () => {
  //   setShowSignInPrompt(false);
  //   // Store preference to not show prompt again for this session
  //   if (typeof window !== "undefined") {
  //     sessionStorage.setItem("skipSignInPrompt", "true");
  //   }
  // };

  const handleSignOut = () => {
    console.log("🔴 DIRECT SignOut clicked!");

    // Super direct approach - just clear everything and reload
    try {
      console.log("🧹 Clearing storage and reloading...");

      if (typeof window !== "undefined") {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Add a flag to indicate we want to be logged out
        sessionStorage.setItem("forceLogout", "true");

        // Reload the page
        window.location.reload();
      }
    } catch (error) {
      console.error("❌ Error in direct signout:", error);
      // Force reload anyway
      window.location.reload();
    }
  };
  return (
    <>
      {/* Modal animation styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Modal entrance animation */
          @keyframes modal-in {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          
          .modal-enter {
            animation: modal-in 0.2s ease-out;
          }

          /* Gradient shift animation */
          @keyframes gradient-shift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          /* Floating glow animations */
          @keyframes float-glow-1 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.2;
            }
            25% {
              transform: translate(20px, -15px) scale(1.1);
              opacity: 0.4;
            }
            50% {
              transform: translate(-10px, 10px) scale(0.9);
              opacity: 0.1;
            }
            75% {
              transform: translate(15px, 5px) scale(1.05);
              opacity: 0.3;
            }
          }

          @keyframes float-glow-2 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.3;
            }
            33% {
              transform: translate(-25px, -20px) scale(1.2);
              opacity: 0.5;
            }
            66% {
              transform: translate(15px, -10px) scale(0.8);
              opacity: 0.1;
            }
          }

          @keyframes float-glow-3 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.15;
            }
            20% {
              transform: translate(30px, 20px) scale(1.3);
              opacity: 0.4;
            }
            40% {
              transform: translate(-20px, -15px) scale(0.7);
              opacity: 0.05;
            }
            60% {
              transform: translate(10px, 25px) scale(1.1);
              opacity: 0.25;
            }
            80% {
              transform: translate(-15px, 10px) scale(0.9);
              opacity: 0.1;
            }
          }

          @keyframes float-glow-4 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.25;
            }
            50% {
              transform: translate(20px, -30px) scale(1.15);
              opacity: 0.45;
            }
          }

          @keyframes float-glow-5 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.2;
            }
            25% {
              transform: translate(-20px, 15px) scale(0.85);
              opacity: 0.35;
            }
            50% {
              transform: translate(25px, -20px) scale(1.25);
              opacity: 0.1;
            }
            75% {
              transform: translate(-10px, -10px) scale(0.95);
              opacity: 0.3;
            }
          }
        `,
        }}
      />

      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Clean Header */}
        <header
          className="sticky top-0 z-50 transition-all duration-300 relative backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(30, 64, 175, 0.9) 0%, rgba(59, 130, 246, 0.9) 25%, rgba(99, 102, 241, 0.9) 50%, rgba(139, 92, 246, 0.9) 75%, rgba(168, 85, 247, 0.9) 100%)",
            boxShadow: "0 4px 24px 0 rgba(80, 80, 180, 0.15)",
            borderBottom: "1.5px solid rgba(255,255,255,0.15)",
          }}
        >
          {" "}
          <div
            className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative"
            style={{ zIndex: 10 }}
          >
            <div className="flex justify-between items-center h-14 sm:h-16">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-2 group"
                style={{ minWidth: 0 }}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center overflow-hidden bg-white/20 border-2 border-white/30 shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <Image
                    src="/scholarHuntLogo.jpg"
                    alt="ScholarHunt Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-xl"
                    priority
                  />
                </div>
                <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-yellow-300 via-white to-green-200 bg-clip-text text-transparent tracking-tight drop-shadow-lg group-hover:opacity-90 transition-opacity duration-200">
                  ScholarHunt
                </span>
              </Link>
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-3 xl:space-x-4">
                {[
                  { href: "/", label: "Home", icon: "🏠" },
                  {
                    href: "/opportunities",
                    label: "Opportunities",
                    icon: "🎓",
                  },
                  { href: "/blog", label: "Blog", icon: "📝" },
                  { href: "/about", label: "About", icon: "ℹ️" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative px-4 py-2 font-semibold text-white/90 hover:text-yellow-300 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded-xl group"
                  >
                    <span className="mr-2 text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="absolute left-4 -bottom-1 w-6 h-1 bg-gradient-to-r from-yellow-300 to-green-200 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </Link>
                ))}
                {/* Admin Navigation Links */}
                {isAdmin && (
                  <>
                    <div className="w-1 h-8 bg-gradient-to-b from-yellow-300 to-green-200 rounded-full mx-2" />
                    <Link
                      href="/admin"
                      className="relative px-4 py-2 font-semibold text-green-200 hover:text-yellow-300 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded-xl group"
                    >
                      <span className="mr-2 text-lg">🛠️</span>
                      <span>Dashboard</span>
                      <span className="absolute left-4 -bottom-1 w-6 h-1 bg-gradient-to-r from-yellow-300 to-green-200 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200" />
                    </Link>
                  </>
                )}
              </nav>{" "}
              {/* Auth Buttons & CTA Button & Mobile Menu */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Authentication Buttons - Desktop only for space */}
                {!user ? (
                  <div className="hidden lg:flex items-center space-x-3">
                    <button
                      onClick={handleSignIn}
                      className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-yellow-300 to-green-300 text-gray-900 shadow-lg hover:from-yellow-400 hover:to-green-400 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
                      disabled={signInLoading}
                    >
                      {signInLoading ? "Signing in..." : "Login"}
                    </button>
                    <button
                      onClick={handleSignUp}
                      className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      disabled={signInLoading}
                    >
                      {signInLoading ? "Signing in..." : "Sign Up"}
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center space-x-3 relative profile-dropdown-container">
                    <div className="desktop-profile-section">
                      {/* Standalone Profile Avatar */}
                      <div
                        className="desktop-profile-avatar ring-2 ring-yellow-200/80 hover:ring-green-200/80 transition-all duration-200"
                        onClick={() =>
                          setShowProfileDropdown(!showProfileDropdown)
                        }
                        tabIndex={0}
                        role="button"
                        aria-label="Open profile menu"
                      >
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      {/* Separate Menu Button */}
                      <button
                        className={`desktop-profile-menu-button ${
                          showProfileDropdown ? "active" : ""
                        }`}
                        onClick={() =>
                          setShowProfileDropdown(!showProfileDropdown)
                        }
                        tabIndex={0}
                        aria-label="Toggle profile dropdown"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {/* Dropdown Menu */}
                      {showProfileDropdown && (
                        <div className="desktop-profile-dropdown bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-4 mt-2 absolute right-0 top-full z-50 min-w-[220px]">
                          {/* User Info Header */}
                          <div className="desktop-dropdown-header mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="desktop-dropdown-avatar">
                                {user.photoURL ? (
                                  <Image
                                    src={user.photoURL}
                                    alt="Profile"
                                    width={48}
                                    height={48}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="desktop-dropdown-name truncate font-bold text-gray-900">
                                  {user.displayName || "User"}
                                </p>
                                <p className="desktop-dropdown-email truncate text-xs text-gray-500">
                                  {user.email}
                                </p>
                                {isAdmin && (
                                  <span className="desktop-dropdown-admin-badge bg-gradient-to-r from-yellow-300 to-green-200 text-xs px-2 py-0.5 rounded-full ml-1 font-semibold text-gray-900">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Menu Items */}
                          <div className="py-1">
                            <Link
                              href="/profile"
                              className="desktop-dropdown-item flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50/80 transition-all duration-200 text-gray-700"
                              onClick={() => setShowProfileDropdown(false)}
                            >
                              <User className="desktop-dropdown-item-icon" />
                              <span className="desktop-dropdown-item-text">
                                Profile
                              </span>
                            </Link>
                            <Link
                              href="/settings"
                              className="desktop-dropdown-item flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50/80 transition-all duration-200 text-gray-700"
                              onClick={() => setShowProfileDropdown(false)}
                            >
                              <Settings className="desktop-dropdown-item-icon" />
                              <span className="desktop-dropdown-item-text">
                                Settings
                              </span>
                            </Link>
                            {isAdmin && (
                              <Link
                                href="/admin"
                                className="desktop-dropdown-item flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50/80 transition-all duration-200 text-gray-700"
                                onClick={() => setShowProfileDropdown(false)}
                              >
                                <Settings className="desktop-dropdown-item-icon" />
                                <span className="desktop-dropdown-item-text">
                                  Admin Dashboard
                                </span>
                              </Link>
                            )}
                          </div>
                          {/* Sign Out Section */}
                          <div className="desktop-dropdown-signout mt-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSignOut();
                                setShowProfileDropdown(false);
                              }}
                              className="desktop-dropdown-item w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50/80 transition-all duration-200 text-red-600 font-semibold"
                              type="button"
                            >
                              <LogOut className="desktop-dropdown-item-icon" />
                              <span className="desktop-dropdown-item-text">
                                Sign Out
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Mobile menu container */}
                <div className="relative lg:hidden mobile-menu-container">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="hamburger-button"
                  >
                    {isMenuOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </button>

                  {/* Top-right dropdown menu */}
                  {isMenuOpen && (
                    <div
                      className="absolute top-full right-0 mt-2 w-80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 lg:hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(30, 64, 175, 0.9) 0%, rgba(59, 130, 246, 0.9) 25%, rgba(99, 102, 241, 0.9) 50%, rgba(139, 92, 246, 0.9) 75%, rgba(168, 85, 247, 0.9) 100%)",
                        boxShadow: "0 8px 32px 0 rgba(80, 80, 180, 0.2)",
                      }}
                    >
                      <div className="p-4">
                        {/* Navigation Links - Compact List */}
                        <div className="space-y-1 mb-4">
                          <Link
                            href="/"
                            className="top-right-mobile-link flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 hover:bg-white/20 backdrop-blur-sm"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <span className="text-lg mr-3">🏠</span>
                            <span className="font-medium text-white text-sm">
                              Home
                            </span>
                          </Link>
                          <Link
                            href="/opportunities"
                            className="top-right-mobile-link flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 hover:bg-white/20 backdrop-blur-sm"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <span className="text-lg mr-3">🎓</span>
                            <span className="font-medium text-white text-sm">
                              Opportunities
                            </span>
                          </Link>
                          <Link
                            href="/blog"
                            className="top-right-mobile-link flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 hover:bg-white/20 backdrop-blur-sm"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <span className="text-lg mr-3">📝</span>
                            <span className="font-medium text-white text-sm">
                              Blog
                            </span>
                          </Link>
                          <Link
                            href="/about"
                            className="top-right-mobile-link flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 hover:bg-white/20 backdrop-blur-sm"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <span className="text-lg mr-3">ℹ️</span>
                            <span className="font-medium text-white text-sm">
                              About
                            </span>
                          </Link>
                        </div>

                        {/* Authentication Section */}
                        {!user ? (
                          <div className="space-y-2 border-t border-white/30 pt-3">
                            <button
                              onClick={() => {
                                handleSignIn();
                                setIsMenuOpen(false);
                              }}
                              className="top-right-auth-button w-full flex items-center justify-center px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 backdrop-blur-sm"
                              disabled={signInLoading}
                            >
                              <span className="text-sm mr-2">🔐</span>
                              <span className="font-medium text-white text-sm">
                                {signInLoading ? "Signing in..." : "Login"}
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                handleSignUp();
                                setIsMenuOpen(false);
                              }}
                              className="top-right-auth-button-primary w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-yellow-300 to-green-300 hover:from-yellow-400 hover:to-green-400 rounded-lg transition-all duration-300 text-gray-900"
                              disabled={signInLoading}
                            >
                              <span className="text-sm mr-2">✨</span>
                              <span className="font-medium text-gray-900 text-sm">
                                {signInLoading ? "Signing in..." : "Sign Up"}
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="border-t border-white/30 pt-3">
                            {/* Compact User Profile */}
                            <div className="top-right-user-profile bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-3">
                              <div className="flex items-center">
                                <div className="top-right-user-avatar relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-yellow-300 to-green-300 flex items-center justify-center">
                                  {user.photoURL ? (
                                    <Image
                                      src={user.photoURL}
                                      alt="Profile"
                                      width={32}
                                      height={32}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <User className="w-4 h-4 text-gray-900" />
                                  )}
                                  {/* Active status indicator */}
                                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full"></div>
                                </div>
                                <div className="ml-2 flex-1 min-w-0">
                                  <p className="font-semibold text-white text-xs truncate">
                                    {user.displayName || "User"}
                                  </p>
                                  <p className="text-blue-100 text-xs truncate">
                                    {user.email}
                                  </p>
                                  {isAdmin && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-300 text-gray-900 mt-0.5">
                                      Admin ⚡
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-1">
                              <Link
                                href="/profile"
                                className="top-right-action-link flex items-center px-3 py-2 hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <User className="w-4 h-4 mr-2 text-blue-100" />
                                <span className="font-medium text-white text-sm">
                                  Profile
                                </span>
                              </Link>
                              <Link
                                href="/settings"
                                className="top-right-action-link flex items-center px-3 py-2 hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <Settings className="w-4 h-4 mr-2 text-blue-100" />
                                <span className="font-medium text-white text-sm">
                                  Settings
                                </span>
                              </Link>
                              {isAdmin && (
                                <Link
                                  href="/admin"
                                  className="top-right-action-link flex items-center px-3 py-2 hover:bg-yellow-300/20 rounded-lg transition-all duration-300 backdrop-blur-sm"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <Settings className="w-4 h-4 mr-2 text-yellow-300" />
                                  <span className="font-medium text-yellow-200 text-sm">
                                    Admin Dashboard
                                  </span>
                                </Link>
                              )}
                              <button
                                onClick={() => {
                                  handleSignOut();
                                  setIsMenuOpen(false);
                                }}
                                className="top-right-action-link w-full flex items-center px-3 py-2 hover:bg-red-400/20 rounded-lg transition-all duration-300 backdrop-blur-sm"
                              >
                                <LogOut className="w-4 h-4 mr-2 text-red-300" />
                                <span className="font-medium text-red-200 text-sm">
                                  Sign Out
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1">{children}</main>
        {/* WhatsApp Widget for Expert Advice */}
        <WhatsAppWidget
          phoneNumber="+256759058245"
          message="Hi! I need expert advice about scholarships 🎓"
          position="bottom-right"
        />
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
        {/* Professional Footer */}
        <footer className="relative overflow-hidden">
          {/* Vibrant Professional Background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #1e40af 0%, #3b82f6 25%, #6366f1 50%, #8b5cf6 75%, #a855f7 100%)",
            }}
          />

          {/* Enhanced Brand Accent Layer */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `
                radial-gradient(ellipse 120% 80% at 25% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 60%),
                radial-gradient(ellipse 100% 60% at 75% 80%, rgba(168, 85, 247, 0.25) 0%, transparent 60%),
                radial-gradient(ellipse 80% 100% at 50% 0%, rgba(34, 197, 94, 0.15) 0%, transparent 50%)
              `,
            }}
          />

          {/* Dynamic Texture for Depth */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `
                linear-gradient(45deg, transparent 45%, rgba(255, 255, 255, 0.1) 50%, transparent 55%),
                linear-gradient(-45deg, transparent 45%, rgba(255, 255, 255, 0.08) 50%, transparent 55%),
                radial-gradient(circle at 30% 70%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
              `,
              backgroundSize: "80px 80px, 80px 80px, 200px 200px, 200px 200px",
            }}
          />

          {/* Content Readability Enhancement */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.4) 100%)",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
            {/* Main Footer Content */}
            <div className="py-16 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
                {/* Brand Section */}
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                        <Image
                          src="/scholarHuntLogo.jpg"
                          alt="ScholarHunt Logo"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          ScholarHunt
                        </h3>
                        <p className="text-blue-200 text-sm">Uganda</p>
                      </div>
                    </div>

                    <p className="text-blue-50 text-lg leading-relaxed mb-8 max-w-md">
                      Empowering students worldwide to achieve their academic
                      dreams through comprehensive scholarship discovery and
                      expert application support.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-300 mb-1">
                          500+
                        </div>
                        <div className="text-blue-200 text-sm font-medium">
                          Scholarships
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-300 mb-1">
                          10K+
                        </div>
                        <div className="text-blue-200 text-sm font-medium">
                          Students Helped
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-300 mb-1">
                          50+
                        </div>
                        <div className="text-blue-200 text-sm font-medium">
                          Countries
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex space-x-4">
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-blue-400 hover:scale-110 transition-all duration-300 group shadow-lg"
                      >
                        <svg
                          className="w-5 h-5 text-blue-100 group-hover:text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all duration-300 group shadow-lg"
                      >
                        <svg
                          className="w-5 h-5 text-blue-100 group-hover:text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-green-500 hover:scale-110 transition-all duration-300 group shadow-lg"
                      >
                        <svg
                          className="w-5 h-5 text-green-100 group-hover:text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                        </svg>
                      </a>
                    </div>
                  </motion.div>
                </div>

                {/* Navigation Links */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
                    {/* Opportunities */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <h3 className="text-white font-semibold text-lg mb-6">
                        Opportunities
                      </h3>
                      <div className="space-y-3">
                        <Link
                          href="/opportunities"
                          className="block text-slate-100 hover:text-blue-300 transition-colors duration-300 group"
                        >
                          <span className="flex items-center">
                            Browse Scholarships
                            <svg
                              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </span>
                        </Link>
                        <Link
                          href="/opportunities?type=undergraduate"
                          className="block text-blue-100 hover:text-yellow-300 transition-colors duration-300 font-medium"
                        >
                          Undergraduate Programs
                        </Link>
                        <Link
                          href="/opportunities?type=graduate"
                          className="block text-blue-100 hover:text-yellow-300 transition-colors duration-300 font-medium"
                        >
                          Graduate Programs
                        </Link>
                        <Link
                          href="/opportunities?type=research"
                          className="block text-blue-100 hover:text-yellow-300 transition-colors duration-300 font-medium"
                        >
                          Research Opportunities
                        </Link>
                        <Link
                          href="/submit"
                          className="block text-blue-100 hover:text-yellow-300 transition-colors duration-300 font-medium"
                        >
                          Submit Scholarship
                        </Link>
                      </div>
                    </motion.div>

                    {/* Resources */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <h3 className="text-white font-semibold text-lg mb-6">
                        Resources
                      </h3>
                      <div className="space-y-3">
                        <Link
                          href="/blog"
                          className="block text-blue-100 hover:text-green-300 transition-colors duration-300 font-medium"
                        >
                          Success Stories
                        </Link>
                        <Link
                          href="/blog?category=tips"
                          className="block text-blue-100 hover:text-green-300 transition-colors duration-300 font-medium"
                        >
                          Application Tips
                        </Link>
                        <Link
                          href="/blog?category=guides"
                          className="block text-blue-100 hover:text-green-300 transition-colors duration-300 font-medium"
                        >
                          Study Guides
                        </Link>
                        <Link
                          href="/about"
                          className="block text-blue-100 hover:text-green-300 transition-colors duration-300 font-medium"
                        >
                          About ScholarHunt
                        </Link>
                        <Link
                          href="#"
                          className="block text-blue-100 hover:text-green-300 transition-colors duration-300 font-medium"
                        >
                          Help Center
                        </Link>
                      </div>
                    </motion.div>

                    {/* Company */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <h3 className="text-white font-semibold text-lg mb-6">
                        Company
                      </h3>
                      <div className="space-y-3">
                        <Link
                          href="/about"
                          className="block text-blue-100 hover:text-purple-300 transition-colors duration-300 font-medium"
                        >
                          Our Mission
                        </Link>
                        <Link
                          href="#"
                          className="block text-blue-100 hover:text-purple-300 transition-colors duration-300 font-medium"
                        >
                          Contact Us
                        </Link>
                        <Link
                          href="/privacy-policy"
                          className="block text-blue-100 hover:text-purple-300 transition-colors duration-300 font-medium"
                        >
                          Privacy Policy
                        </Link>
                        <Link
                          href="/terms-of-service"
                          className="block text-blue-100 hover:text-purple-300 transition-colors duration-300 font-medium"
                        >
                          Terms of Service
                        </Link>
                        <Link
                          href="#"
                          className="block text-blue-100 hover:text-purple-300 transition-colors duration-300 font-medium"
                        >
                          Partnerships
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Section */}
            <motion.div
              className="py-12 border-t border-slate-700/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Never Miss an Opportunity
                </h3>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto font-medium">
                  Join 10,000+ students worldwide who get weekly scholarship
                  alerts and exclusive application tips.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <NewsletterSubscription
                  source="footer"
                  placeholder="Enter your email address"
                  buttonText="Get Weekly Updates"
                  compact={false}
                />
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-blue-200 text-sm font-medium">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
                  <svg
                    className="w-4 h-4 text-green-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-blue-100">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
                  <svg
                    className="w-4 h-4 text-yellow-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-blue-100">No Spam Guarantee</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
                  <svg
                    className="w-4 h-4 text-purple-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-blue-100">24/7 Support</span>
                </div>
              </div>
            </motion.div>

            {/* Bottom Bar */}
            <div className="py-6 border-t border-blue-700/30">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="text-blue-200 text-sm font-medium">
                  © 2025 ScholarHunt. All rights reserved. Made with ❤️ for
                  students worldwide.
                </div>
                <div className="flex items-center gap-6 text-blue-200 text-sm font-medium">
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <svg
                      className="w-4 h-4 text-green-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-blue-100">Global Platform</span>
                  </span>
                  <span className="text-blue-300">•</span>
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-100">
                      All Systems Operational
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>{" "}
        {/* Google Sign-In Prompt Modal - Disabled since One Tap is working */}
        {/* {showSignInPrompt && (
        <>
          <div 
            className="fixed inset-0 z-40 backdrop-blur-md bg-white/40"
            onClick={handleContinueWithoutSignIn}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            <div
              className="modal-enter relative max-w-sm sm:max-w-md w-full rounded-lg shadow-xl p-4 sm:p-6 pointer-events-auto transform border border-gray-200"
              style={{ backgroundColor: "var(--surface)" }}
            >
              <button
                onClick={handleContinueWithoutSignIn}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </button>

              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 sm:mb-6 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                
                <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-900">
                  Sign in to ScholarHunt
                </h3>
                <p className="text-sm sm:text-base mb-6 sm:mb-8 text-gray-600 leading-relaxed">
                  We detected you have a Google account. Sign in to save
                  scholarships, track applications, and get personalized
                  recommendations.
                </p>
                
                <button
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-md font-medium text-gray-700 text-sm sm:text-base"
                  style={{
                    boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15)'
                  }}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </>
      )} */}
      </div>
    </>
  );
}
