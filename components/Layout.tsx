"use client";

import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { Menu, X, GraduationCap, User, LogOut, Settings } from "lucide-react";
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
  const [signInLoading, setSignInLoading] = React.useState(false);

  // Toast system
  const { toasts, removeToast } = useToast();

  const {
    user,
    loading,
    signInWithGoogle,
    logout,
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

  const handleSignOut = async () => {
    try {
      await logout();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("skipSignInPrompt");
      }
    } catch (error) {
      console.error("Sign out failed:", error);
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
          className="sticky top-0 z-50 transition-all duration-300 relative"
          style={{
            background: "var(--brand-primary)",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
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
                className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-white">
                  ScholarHunt
                </span>
              </Link>

              {/* Professional Navigation Links - Hidden on mobile, visible on desktop */}
              <nav className="flex-1 items-center justify-center space-x-2 lg:space-x-3 xl:space-x-4 2xl:space-x-6 max-md:hidden md:flex">
                <Link
                  href="/"
                  className="relative px-2 md:px-3 lg:px-4 xl:px-5 py-2 font-medium text-white/90 transition-all duration-300 hover:text-white hover:bg-white/10 rounded-lg group"
                >
                  <span className="relative z-10 text-sm lg:text-base xl:text-lg">
                    Home
                  </span>
                  <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  href="/opportunities"
                  className="relative px-2 md:px-3 lg:px-4 xl:px-5 py-2 font-medium text-white/90 transition-all duration-300 hover:text-white hover:bg-white/10 rounded-lg group"
                >
                  <span className="relative z-10 text-sm lg:text-base xl:text-lg">
                    Opportunities
                  </span>
                  <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  href="/blog"
                  className="relative px-2 md:px-3 lg:px-4 xl:px-5 py-2 font-medium text-white/90 transition-all duration-300 hover:text-white hover:bg-white/10 rounded-lg group"
                >
                  <span className="relative z-10 text-sm lg:text-base xl:text-lg">
                    Blog
                  </span>
                  <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  href="/about"
                  className="relative px-2 md:px-3 lg:px-4 xl:px-5 py-2 font-medium text-white/90 transition-all duration-300 hover:text-white hover:bg-white/10 rounded-lg group"
                >
                  <span className="relative z-10 text-sm lg:text-base xl:text-lg">
                    About
                  </span>
                  <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                {/* Admin Navigation Links */}
                {isAdmin && (
                  <>
                    <div className="w-px h-6 bg-white/30 mx-1 lg:mx-2 xl:mx-3" />
                    <Link
                      href="/admin"
                      className="relative px-2 md:px-3 lg:px-4 xl:px-5 py-2 font-medium text-orange-200 transition-all duration-300 hover:text-white hover:bg-orange-500/20 rounded-lg group"
                    >
                      <span className="relative z-10 text-sm lg:text-base xl:text-lg">
                        Dashboard
                      </span>
                      <div className="absolute inset-0 bg-orange-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  </>
                )}
              </nav>

              {/* Auth Buttons & Mobile Menu */}
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                {/* Professional Authentication Buttons - Hidden on mobile, visible on desktop */}
                {!user ? (
                  <div className="max-md:hidden md:flex items-center space-x-1 md:space-x-2 lg:space-x-3 xl:space-x-4">
                    <button
                      onClick={handleSignIn}
                      className="relative px-3 md:px-4 lg:px-5 xl:px-6 py-2 lg:py-2.5 xl:py-3 text-xs md:text-xs lg:text-sm xl:text-base font-medium text-white border-2 border-white/40 rounded-lg hover:border-white/60 hover:bg-white/10 transition-all duration-300 group overflow-hidden"
                      disabled={signInLoading}
                    >
                      <span className="relative z-10">
                        {signInLoading ? "Signing in..." : "Login"}
                      </span>
                      <div className="absolute inset-0 bg-white/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    </button>
                    <button
                      onClick={handleSignUp}
                      className="relative px-3 md:px-4 lg:px-6 xl:px-8 py-2 lg:py-2.5 xl:py-3 text-xs md:text-xs lg:text-sm xl:text-base font-medium bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 overflow-hidden group"
                      disabled={signInLoading}
                    >
                      <span className="relative z-10 font-semibold">
                        {signInLoading ? "Signing in..." : "Sign Up"}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </button>
                  </div>
                ) : (
                  <div className="max-md:hidden md:flex items-center space-x-3">
                    {/* Profile Picture - Only show on desktop */}
                    <div className="relative">
                      <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white/30 shadow-lg">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt={`${user.displayName || "User"}'s profile`}
                            width={36}
                            height={36}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        )}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                    </div>

                    {/* Sign Out Button - Only show on desktop */}
                    <button
                      onClick={handleSignOut}
                      className="relative px-3 md:px-4 lg:px-5 xl:px-6 py-2 lg:py-2.5 xl:py-3 text-xs md:text-xs lg:text-sm xl:text-base font-medium text-white border-2 border-white/40 rounded-lg hover:border-white/60 hover:bg-white/10 transition-all duration-300 group overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center">
                        <LogOut className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
                        Sign Out
                      </span>
                      <div className="absolute inset-0 bg-white/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    </button>
                  </div>
                )}{" "}
                {/* Enhanced Mobile menu button - Only show on small screens */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2.5 rounded-lg hover:bg-white/10 transition-all duration-300 text-white border border-white/30 hover:border-white/50"
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>{" "}
            {/* Enhanced Mobile Navigation - Only show on small screens */}
            {isMenuOpen && (
              <div
                className="md:hidden py-4 border-t backdrop-blur-sm"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <div className="flex flex-col space-y-2 px-3">
                  <Link
                    href="/"
                    className="font-medium py-3 px-4 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🏠 Home
                  </Link>
                  <Link
                    href="/opportunities"
                    className="font-medium py-3 px-4 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🎓 Opportunities
                  </Link>
                  <Link
                    href="/blog"
                    className="font-medium py-3 px-4 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📝 Blog
                  </Link>
                  <Link
                    href="/about"
                    className="font-medium py-3 px-4 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ℹ️ About
                  </Link>{" "}
                  {/* Admin Mobile Navigation */}
                  {isAdmin && (
                    <>
                      <div
                        className="border-t pt-2"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                          Admin
                        </span>
                      </div>
                      <Link
                        href="/admin"
                        className={clsx("font-medium ml-3", "text-blue-600")}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </>
                  )}{" "}
                  {/* Enhanced Mobile Authentication */}
                  <div
                    className="pt-4 border-t"
                    style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
                  >
                    {!user ? (
                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={() => {
                            handleSignIn();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center justify-center px-5 py-3.5 text-sm font-medium transition-all duration-300 hover:bg-white/10 border-2 border-white/40 rounded-lg disabled:opacity-50 text-white"
                          disabled={signInLoading}
                        >
                          <span className="mr-2">🔐</span>
                          {signInLoading ? "Signing in..." : "Login"}
                        </button>
                        <button
                          onClick={() => {
                            handleSignUp();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center justify-center px-5 py-3.5 text-sm font-medium bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 shadow-lg font-semibold"
                          disabled={signInLoading}
                        >
                          <span className="mr-2">✨</span>
                          {signInLoading ? "Signing in..." : "Sign Up"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-4">
                        {/* Improved Mobile User Info */}
                        <div className="flex items-center px-5 py-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-3 ring-white shadow-lg">
                              {user.photoURL ? (
                                <Image
                                  src={user.photoURL}
                                  alt={`${
                                    user.displayName || "User"
                                  }'s profile`}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                          </div>
                          <div className="ml-4 flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {user.displayName || "User"}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {user.email}
                            </p>
                            {isAdmin && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ring-1 ring-blue-600/20">
                                  <svg
                                    className="w-3 h-3 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Admin
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Improved Mobile Menu Items */}
                        <div className="flex flex-col space-y-1">
                          <Link
                            href="/profile"
                            className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200 group"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <User className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
                            <span className="font-medium">View Profile</span>
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200 group"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
                            <span className="font-medium">Settings</span>
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center px-5 py-3 text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-900 rounded-xl transition-all duration-200 group"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <svg
                                className="w-5 h-5 mr-3 text-blue-400 group-hover:text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="font-medium">
                                Admin Dashboard
                              </span>
                            </Link>
                          )}

                          {/* Mobile Logout Section */}
                          <div className="pt-2 mt-2 border-t border-gray-200">
                            <button
                              onClick={() => {
                                handleSignOut();
                                setIsMenuOpen(false);
                              }}
                              className="flex items-center w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 text-left group"
                            >
                              <LogOut className="w-5 h-5 mr-3 text-red-400 group-hover:text-red-600" />
                              <span className="font-medium">Sign Out</span>
                            </button>
                          </div>
                        </div>{" "}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>{" "}
        {/* Main Content */}
        <main className="flex-1">{children}</main>
        {/* WhatsApp Widget for Expert Advice */}
        <WhatsAppWidget
          phoneNumber="+256759058245"
          message="Hi! I need expert advice about scholarships 🎓"
          position="bottom-right"
        />
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onClose={removeToast} /> {/* Footer */}
        <footer
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.3), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.6)), linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://cdn.pixabay.com/photo/2021/10/30/17/54/desert-6755127_1280.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "var(--text-primary)", // Fallback color
          }}
          className="text-white relative"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Company Info */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold">
                    ScholarHunt
                  </span>
                </div>
                <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4 max-w-md">
                  Connecting Ugandan students with scholarship opportunities
                  worldwide. Your gateway to educational excellence and global
                  opportunities.
                </p>
                <div className="text-xs sm:text-sm text-gray-400">
                  © 2025 ScholarHunt. All rights reserved.
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">
                  Quick Links
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  <Link
                    href="/opportunities"
                    className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    Browse Scholarships
                  </Link>
                  <Link
                    href="/submit"
                    className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    Submit Opportunity
                  </Link>
                  <Link
                    href="/blog"
                    className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    Blog & Tips
                  </Link>
                  <Link
                    href="/about"
                    className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    About Us
                  </Link>
                </div>
              </div>

              {/* Legal */}
              <div>
                <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">
                  Legal
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  <Link
                    href="/privacy-policy"
                    className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms-of-service"
                    className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-700">
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Stay Updated
                </h3>
                <p className="text-gray-300 text-sm sm:text-base mb-4 max-w-lg mx-auto">
                  Get the latest scholarship opportunities delivered to your
                  inbox.
                </p>
                <div className="max-w-sm sm:max-w-md mx-auto">
                  <NewsletterSubscription
                    source="footer"
                    placeholder="Enter your email"
                    buttonText="Subscribe"
                    compact={true}
                  />
                </div>
              </div>
            </div>
            {/* AdSense Placeholder - Hidden on mobile to save space */}
            <div className="hidden sm:block mt-6 sm:mt-8 text-center">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-4">
                <small className="text-gray-500 text-xs sm:text-sm">
                  {/* AdSense Footer Ad will go here after approval */}
                  Advertisement Space
                </small>
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
