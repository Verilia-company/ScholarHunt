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
                className="flex items-center space-x-1.5 sm:space-x-2"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-white">
                  ScholarHunt
                </span>
              </Link>{" "}
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-3 xl:space-x-4">
                <Link href="/" className="desktop-nav-link">
                  🏠 Home
                </Link>
                <Link href="/opportunities" className="desktop-nav-link">
                  🎓 Opportunities
                </Link>
                <Link href="/blog" className="desktop-nav-link">
                  📝 Blog
                </Link>
                <Link href="/about" className="desktop-nav-link">
                  ℹ️ About
                </Link>
                {/* Admin Navigation Links */}
                {isAdmin && (
                  <>
                    <div className="nav-separator" />
                    <Link
                      href="/admin"
                      className="desktop-admin-link desktop-nav-link"
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
                    <button
                      onClick={handleSignIn}
                      className="desktop-auth-login"
                      disabled={signInLoading}
                    >
                      {signInLoading ? "Signing in..." : "Login"}
                    </button>
                    <button
                      onClick={handleSignUp}
                      className="desktop-auth-signup"
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
                        className="desktop-profile-avatar"
                        onClick={() =>
                          setShowProfileDropdown(!showProfileDropdown)
                        }
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
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {showProfileDropdown && (
                        <div className="desktop-profile-dropdown">
                          {/* User Info Header */}
                          <div className="desktop-dropdown-header">
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
                                <p className="desktop-dropdown-name truncate">
                                  {user.displayName || "User"}
                                </p>
                                <p className="desktop-dropdown-email truncate">
                                  {user.email}
                                </p>
                                {isAdmin && (
                                  <span className="desktop-dropdown-admin-badge">
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
                              className="desktop-dropdown-item"
                              onClick={() => setShowProfileDropdown(false)}
                            >
                              <User className="desktop-dropdown-item-icon" />
                              <span className="desktop-dropdown-item-text">
                                Profile
                              </span>
                            </Link>
                            <Link
                              href="/settings"
                              className="desktop-dropdown-item"
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
                                className="desktop-dropdown-item"
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
                          <div className="desktop-dropdown-signout">
                            <button
                              onClick={() => {
                                handleSignOut();
                                setShowProfileDropdown(false);
                              }}
                              className="desktop-dropdown-item w-full"
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
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="hamburger-button lg:hidden"
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
              <div className="mobile-menu-container lg:hidden py-6">
                <div className="flex flex-col space-y-3 px-4">
                  <Link
                    href="/"
                    className="mobile-menu-link px-4 py-3 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mobile-menu-link-text">🏠 Home</span>
                  </Link>
                  <Link
                    href="/opportunities"
                    className="mobile-menu-link px-4 py-3 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mobile-menu-link-text">
                      🎓 Opportunities
                    </span>
                  </Link>
                  <Link
                    href="/blog"
                    className="mobile-menu-link px-4 py-3 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mobile-menu-link-text">📝 Blog</span>
                  </Link>
                  <Link
                    href="/about"
                    className="mobile-menu-link px-4 py-3 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mobile-menu-link-text">ℹ️ About</span>
                  </Link>{" "}
                  {/* Admin Mobile Navigation */}
                  {isAdmin && (
                    <div className="mobile-admin-section p-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="mobile-admin-badge">
                          ⚡ Admin Access
                        </span>
                      </div>
                      <Link
                        href="/admin"
                        className="mobile-menu-link px-4 py-3 flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="mobile-menu-link-text">
                          🛠️ Dashboard
                        </span>
                      </Link>
                    </div>
                  )}{" "}
                  {/* Mobile Authentication */}
                  <div className="mt-6 pt-4">
                    {!user ? (
                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={() => {
                            handleSignIn();
                            setIsMenuOpen(false);
                          }}
                          className="mobile-auth-button px-6 py-3 text-center"
                          disabled={signInLoading}
                        >
                          <span className="mobile-auth-button-text">
                            {signInLoading ? "Signing in..." : "🔐 Login"}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            handleSignUp();
                            setIsMenuOpen(false);
                          }}
                          className="mobile-auth-button-primary px-6 py-3 text-center rounded-lg"
                          disabled={signInLoading}
                        >
                          {signInLoading ? "Signing in..." : "✨ Sign Up"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-4">
                        {/* Mobile User Info */}
                        <div className="mobile-user-profile p-4">
                          <div className="flex items-center">
                            <div className="mobile-user-avatar w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                              {user.photoURL ? (
                                <Image
                                  src={user.photoURL}
                                  alt="Profile"
                                  width={48}
                                  height={48}
                                />
                              ) : (
                                <User className="w-6 h-6 text-blue-600" />
                              )}
                            </div>
                            <div className="ml-4 flex-1 min-w-0">
                              <p className="text-white font-semibold text-lg truncate">
                                {user.displayName || "User"}
                              </p>
                              <p className="text-white/80 text-sm truncate">
                                {user.email}
                              </p>
                              {isAdmin && (
                                <span className="mobile-admin-badge mt-2 inline-block">
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Mobile Menu Items */}
                        <div className="flex flex-col space-y-2">
                          <Link
                            href="/profile"
                            className="mobile-menu-action flex items-center px-4 py-3"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <User className="w-5 h-5 mr-3" />
                            <span className="mobile-menu-action-text">
                              Profile
                            </span>
                          </Link>
                          <Link
                            href="/settings"
                            className="mobile-menu-action flex items-center px-4 py-3"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="w-5 h-5 mr-3" />
                            <span className="mobile-menu-action-text">
                              Settings
                            </span>
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="mobile-menu-action flex items-center px-4 py-3"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Settings className="w-5 h-5 mr-3" />
                              <span className="mobile-menu-action-text">
                                Admin Dashboard
                              </span>
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              handleSignOut();
                              setIsMenuOpen(false);
                            }}
                            className="mobile-menu-action flex items-center px-4 py-3 text-left"
                          >
                            <LogOut className="w-5 h-5 mr-3" />
                            <span className="mobile-menu-action-text">
                              Sign Out
                            </span>
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
