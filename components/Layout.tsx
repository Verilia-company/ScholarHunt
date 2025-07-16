"use client";

import React from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  Menu,
  X,
  GraduationCap,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import NewsletterSubscription from "./NewsletterSubscription";
import { usePageTracking } from "../lib/analytics";
import { ToastContainer, useToast } from "./Toast";
import WhatsAppWidget from "./WhatsAppWidget";

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
        {/* Revolutionary Header */}
        <header 
          className="sticky top-0 z-50 transition-all duration-300 relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)'
          }}
        >
          {/* Glowing overlay effect */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.4) 50%, rgba(236, 72, 153, 0.4) 100%)',
              filter: 'blur(20px)'
            }}
          />
          {/* Animated gradient overlay */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(236, 72, 153, 0.6) 100%)',
              animation: 'gradient-shift 8s ease-in-out infinite'
            }}
          />
          
          {/* Animated floating glow elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            {/* Glow element 1 */}
            <div 
              className="absolute w-32 h-32 rounded-full opacity-20 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)',
                animation: 'float-glow-1 12s ease-in-out infinite',
                top: '20%',
                left: '10%',
                zIndex: 0
              }}
            />
            
            {/* Glow element 2 */}
            <div 
              className="absolute w-24 h-24 rounded-full opacity-30 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
                animation: 'float-glow-2 15s ease-in-out infinite',
                top: '60%',
                right: '15%',
                zIndex: 0
              }}
            />
            
            {/* Glow element 3 */}
            <div 
              className="absolute w-40 h-40 rounded-full opacity-15 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, transparent 70%)',
                animation: 'float-glow-3 18s ease-in-out infinite',
                top: '30%',
                left: '70%',
                zIndex: 0
              }}
            />
            
            {/* Glow element 4 */}
            <div 
              className="absolute w-20 h-20 rounded-full opacity-25 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%)',
                animation: 'float-glow-4 10s ease-in-out infinite',
                bottom: '20%',
                left: '50%',
                zIndex: 0
              }}
            />
            
            {/* Glow element 5 */}
            <div 
              className="absolute w-28 h-28 rounded-full opacity-20 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, transparent 70%)',
                animation: 'float-glow-5 14s ease-in-out infinite',
                top: '10%',
                right: '40%',
                zIndex: 0
              }}
            />
          </div>
          {" "}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative" style={{ zIndex: 10 }}>
            <div className="flex justify-between items-center h-14 sm:h-16">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center space-x-1.5 sm:space-x-2"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span
                  className="text-lg sm:text-xl font-bold text-white"
                >
                  ScholarHunt
                </span>
              </Link>{" "}
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                <Link
                  href="/"
                  className="font-medium text-white transition-colors hover:opacity-80"
                >
                  Home
                </Link>
                <Link
                  href="/opportunities"
                  className="font-medium text-white transition-colors hover:opacity-80"
                >
                  Opportunities
                </Link>
                <Link
                  href="/blog"
                  className="font-medium text-white transition-colors hover:opacity-80"
                >
                  Blog
                </Link>
                <Link
                  href="/about"
                  className="font-medium text-white transition-colors hover:opacity-80"
                >
                  About
                </Link>
                {/* Admin Navigation Links */}
                {isAdmin && (
                  <>
                    <div className="w-px h-6 bg-white/30" /> {/* Separator */}
                    <Link
                      href="/admin"
                      className={clsx(
                        "font-medium text-white transition-colors hover:opacity-80"
                      )}
                    >
                      Dashboard
                    </Link>
                  </>
                )}
              </nav>{" "}
              {/* Auth Buttons & CTA Button & Mobile Menu */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Authentication Buttons - Desktop only for space */}
                {!user ? (
                  <div className="hidden lg:flex items-center space-x-3">
                    {" "}
                    <button
                      onClick={handleSignIn}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                      disabled={signInLoading}
                    >
                      {signInLoading ? "Signing in..." : "Login"}
                    </button>
                    <button
                      onClick={handleSignUp}
                      className="flex items-center px-3 py-1.5 text-sm font-medium bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                      disabled={signInLoading}
                    >
                      {signInLoading ? "Signing in..." : "Sign Up"}
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center space-x-3 relative">
                    <div className="relative profile-dropdown-container">
                      <button
                        onClick={() =>
                          setShowProfileDropdown(!showProfileDropdown)
                        }
                        className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        style={{
                          backgroundColor: showProfileDropdown
                            ? "var(--surface-hover)"
                            : "transparent",
                        }}
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt="Profile"
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            showProfileDropdown ? "rotate-180" : ""
                          }`}
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </button>
                      {/* Profile Dropdown */}
                      {showProfileDropdown && (
                        <div
                          className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg border py-2 z-50"
                          style={{
                            backgroundColor: "var(--surface)",
                            borderColor: "var(--border)",
                          }}
                        >
                          {/* User Info */}
                          <div
                            className="px-4 py-3 border-b"
                            style={{ borderColor: "var(--border)" }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                                {user.photoURL ? (
                                  <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm font-medium truncate"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {user.displayName || "User"}
                                </p>
                                <p
                                  className="text-xs truncate"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  {user.email}
                                </p>
                                {isAdmin && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
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
                              className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                              style={{ color: "var(--text-primary)" }}
                              onClick={() => setShowProfileDropdown(false)}
                            >
                              <User className="w-4 h-4 mr-3" />
                              Profile
                            </Link>
                            <Link
                              href="/settings"
                              className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                              style={{ color: "var(--text-primary)" }}
                              onClick={() => setShowProfileDropdown(false)}
                            >
                              <Settings className="w-4 h-4 mr-3" />
                              Settings
                            </Link>
                            {isAdmin && (
                              <Link
                                href="/admin"
                                className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                                style={{ color: "var(--text-primary)" }}
                                onClick={() => setShowProfileDropdown(false)}
                              >
                                <Settings className="w-4 h-4 mr-3" />
                                Admin Dashboard
                              </Link>
                            )}
                          </div>

                          <div
                            className="border-t py-1"
                            style={{ borderColor: "var(--border)" }}
                          >
                            <button
                              onClick={() => {
                                handleSignOut();
                                setShowProfileDropdown(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      )}{" "}
                    </div>
                  </div>
                )}{" "}
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: "var(--text-primary)" }}
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>{" "}
            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div
                className="lg:hidden py-4 border-t"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex flex-col space-y-4 px-3">
                  <Link
                    href="/"
                    className="font-medium py-2"
                    style={{ color: "var(--text-primary)" }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/opportunities"
                    className="font-medium py-2"
                    style={{ color: "var(--text-primary)" }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Opportunities
                  </Link>
                  <Link
                    href="/blog"
                    className="font-medium py-2"
                    style={{ color: "var(--text-primary)" }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Blog
                  </Link>
                  <Link
                    href="/about"
                    className="font-medium py-2"
                    style={{ color: "var(--text-primary)" }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
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
                  {/* Mobile Authentication */}
                  <div
                    className="pt-4 border-t"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {!user ? (
                      <div className="flex flex-col space-y-3">
                        {" "}
                        <button
                          onClick={() => {
                            handleSignIn();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors hover:opacity-80 border rounded-lg disabled:opacity-50"
                          style={{
                            color: "var(--text-primary)",
                            borderColor: "var(--border)",
                          }}
                          disabled={signInLoading}
                        >
                          {signInLoading ? "Signing in..." : "Login"}
                        </button>
                        <button
                          onClick={() => {
                            handleSignUp();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center justify-center px-4 py-3 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          disabled={signInLoading}
                        >
                          {signInLoading ? "Signing in..." : "Sign Up"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-3">
                        {/* Mobile User Info */}
                        <div
                          className="flex items-center px-4 py-3 rounded-lg"
                          style={{ backgroundColor: "var(--surface-hover)" }}
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p
                              className="text-sm font-medium truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {user.displayName || "User"}
                            </p>
                            <p
                              className="text-xs truncate"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {user.email}
                            </p>
                            {isAdmin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Mobile Menu Items */}
                        <div className="flex flex-col space-y-1">
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                            style={{ color: "var(--text-primary)" }}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <User className="w-4 h-4 mr-3" />
                            Profile
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                            style={{ color: "var(--text-primary)" }}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                              style={{ color: "var(--text-primary)" }}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Settings className="w-4 h-4 mr-3" />
                              Admin Dashboard
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              handleSignOut();
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors text-left"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
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
          phoneNumber="+256700000000"
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
