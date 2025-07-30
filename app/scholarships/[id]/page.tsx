"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  DollarSign,
  GraduationCap,
  ExternalLink,
  ArrowLeft,
  AlertTriangle,
  Share2,
  X,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Award,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  Globe,
  University,
  FileText,
  Star,
} from "lucide-react";
import { scholarshipService, Scholarship } from "@/lib/firebase/services";
// ShareButtons component removed as it's not being used
import {
  trackEvents,
  usePageTracking,
  useScrollTracking,
} from "@/lib/analytics"; // Added for analytics tracking

export default function ScholarshipDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // Analytics tracking hooks
  usePageTracking();
  useScrollTracking();

  // Client-side hydration fix
  useEffect(() => {
    setIsClient(true);
    setCurrentUrl(window.location.href);
  }, []);

  // Function to handle apply button click
  const handleApplyClick = () => {
    if (scholarship) {
      // Track the apply action
      trackEvents.scholarshipApply({
        scholarshipId: scholarship.id,
        scholarshipName: scholarship.title,
        provider: scholarship.provider,
        type: scholarship.type,
      });

      // Open application URL if available, otherwise show fallback message
      if (scholarship.applicationUrl) {
        window.open(
          scholarship.applicationUrl,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        // Fallback: scroll to application instructions
        const applicationSection = document.getElementById(
          "application-section"
        );
        if (applicationSection) {
          applicationSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };
  // Function to retry fetching scholarship
  const retryFetch = () => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    setLoading(true);
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      // Simple connection test by trying to get any collection
      await scholarshipService.getScholarships({ limit: 1 });
      return true;
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      return false;
    }
  };
  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        // Add debugging for mobile
        console.log("Fetching scholarship with ID:", id);
        console.log(
          "User agent:",
          typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"
        );
        console.log(
          "Window dimensions:",
          typeof window !== "undefined"
            ? `${window.innerWidth}x${window.innerHeight}`
            : "Unknown"
        );
        // Test Firebase connection first on mobile devices or retries
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        if (isMobile || retryCount > 0) {
          console.log("Testing Firebase connection...");
          const connectionOk = await testFirebaseConnection();
          if (!connectionOk) {
            throw new Error(
              "Firebase connection failed - please check your internet connection"
            );
          }
          console.log("Firebase connection test passed");
        }

        // Create a timeout promise for mobile networks
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error(
                  "Request timeout - this may be due to poor mobile connection"
                )
              ),
            15000
          );
        });

        // Race between the actual request and timeout
        const data = (await Promise.race([
          scholarshipService.getScholarship(id),
          timeoutPromise,
        ])) as Scholarship | null;

        console.log("Scholarship data received:", data ? "Success" : "No data");
        if (data) {
          setScholarship(data);
          // Track scholarship view
          trackEvents.scholarshipView({
            scholarshipId: data.id,
            scholarshipName: data.title,
            provider: data.provider,
            type: data.type,
          });

          // Increment view count - don't fail the whole component if this fails
          try {
            await scholarshipService.incrementViews(id);
          } catch (viewError) {
            console.warn("Failed to increment views:", viewError);
            // Continue without failing
          }
        } else {
          console.log("No scholarship found for ID:", id);
          setError("Scholarship not found");
        }
      } catch (err) {
        console.error("Error fetching scholarship:", err);
        console.error("Error details:", {
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : "No stack trace",
          cause: err instanceof Error ? err.cause : "No cause",
        }); // Provide more detailed error message
        if (err instanceof Error) {
          if (err.message.includes("Firebase connection failed")) {
            setError(
              "Connection to database failed. Please check your internet connection and try again."
            );
          } else if (err.message.includes("timeout")) {
            setError(
              "Request timed out. Please check your connection and try again."
            );
          } else if (
            err.message.includes("network") ||
            err.message.includes("fetch")
          ) {
            setError(
              "Network error. Please check your connection and try again."
            );
          } else if (
            err.message.includes("permission") ||
            err.message.includes("unauthorized")
          ) {
            setError("Access denied. Please refresh the page and try again.");
          } else {
            setError(`Failed to load scholarship: ${err.message}`);
          }
        } else {
          setError("Failed to load scholarship");
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchScholarship();
    }
  }, [id, retryCount]); // Add retryCount as dependency

  // Track time spent on page for engagement analytics
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      if (scholarship) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        // Only track if user spent at least 10 seconds on page
        if (timeSpent >= 10) {
          trackEvents.timeOnPage(timeSpent);
        }
      }
    };
  }, [scholarship]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-3 sm:px-4"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center max-w-md">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--brand-primary)" }}
          ></div>
          <p style={{ color: "var(--text-secondary)" }}>
            Loading scholarship details...
          </p>
        </div>
      </div>
    );
  }
  if (error || !scholarship) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-3 sm:px-4"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center max-w-md">
          <AlertTriangle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "var(--brand-error)" }}
          />
          <h1
            className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {error || "Scholarship Not Found"}
          </h1>
          <p
            className="text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {error === "Scholarship not found"
              ? "The scholarship you're looking for doesn't exist or may have been removed."
              : error?.includes("Network")
              ? "There seems to be a connectivity issue. Please check your internet connection."
              : "Unable to load scholarship details. This might be a temporary issue."}
          </p>

          {/* Debug info for mobile */}
          {isClient && (
            <div
              className="text-xs mb-4 p-2 rounded"
              style={{
                color: "var(--text-tertiary)",
                background: "var(--bg-glass)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <p>Debug Info:</p>
              <p>ID: {id}</p>
              <p>
                Screen: {window.innerWidth}×{window.innerHeight}
              </p>
              <p>Retries: {retryCount}</p>
              <p>
                UA:{" "}
                {navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={retryFetch}
              className="btn btn-secondary w-full sm:w-auto text-sm sm:text-base py-2.5 sm:py-3"
              disabled={loading}
            >
              {loading ? "Retrying..." : "Try Again"}
            </button>
            <Link
              href="/opportunities"
              className="btn btn-primary w-full sm:w-auto text-sm sm:text-base py-2.5 sm:py-3"
            >
              Browse All Scholarships
            </Link>
          </div>
        </div>
      </div>
    );
  }
  // Format deadline
  const formatDeadline = (dateString: string) => {
    if (dateString === "Undisclosed" || !dateString) {
      return "Undisclosed";
    }
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  // Calculate days remaining
  const getDaysRemaining = (deadline: string) => {
    if (deadline === "Undisclosed" || !deadline) {
      return Infinity; // Return infinity for undisclosed deadlines
    }
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Share functions
  const shareTitle = scholarship
    ? `${scholarship.title} - ${scholarship.amount} Scholarship`
    : "";
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      // Track copy link action
      if (scholarship) {
        trackEvents.scholarshipShare(scholarship.id, "copy_link");
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank",
      "width=600,height=400"
    );
    // Track Facebook share
    if (scholarship) {
      trackEvents.scholarshipShare(scholarship.id, "facebook");
    }
  };

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        currentUrl
      )}&text=${encodeURIComponent(shareTitle)}`,
      "_blank",
      "width=600,height=400"
    );
    // Track Twitter share
    if (scholarship) {
      trackEvents.scholarshipShare(scholarship.id, "twitter");
    }
  };
  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank",
      "width=600,height=400"
    );
    // Track LinkedIn share
    if (scholarship) {
      trackEvents.scholarshipShare(scholarship.id, "linkedin");
    }
  };

  const handleShareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        `${shareTitle} - ${currentUrl}`
      )}`,
      "_blank",
      "width=600,height=400"
    ); // Track WhatsApp share
    if (scholarship) {
      trackEvents.scholarshipShare(scholarship.id, "whatsapp");
    }
  };

  // Only proceed with rendering if scholarship exists
  if (!scholarship) {
    return null;
  }

  const daysRemaining = getDaysRemaining(scholarship.deadline);
  const isUndisclosed =
    scholarship.deadline === "Undisclosed" || !scholarship.deadline;
  const isUrgent = !isUndisclosed && daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = !isUndisclosed && daysRemaining < 0;

  return (
    <>
      {/* Custom styles for glowing animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes glow-pulse {
            0%, 100% {
              box-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.2);
            }
            50% {
              box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4);
            }
          }
          
          .glow-button {
            animation: glow-pulse 2s ease-in-out infinite;
          }
          
          .glow-button:hover {
            animation: glow-pulse 0.5s ease-in-out infinite;
          }
          
          /* Enhanced backdrop blur styles */
          .backdrop-blur-custom {
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            background: rgba(255, 255, 255, 0.1);
          }
          
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
        `,
        }}
      />
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        {/* Fixed Share Button */}
        <motion.div
          className="fixed top-20 right-4 sm:right-6 z-50"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.button
            onClick={() => setShowSharePopup(true)}
            className="glow-button relative group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-full shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="h-5 w-5 relative z-10" />
            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Share this scholarship
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Share Popup Modal */}
        {showSharePopup && (
          <>
            {/* Backdrop with blur effect */}
            <div
              className="fixed inset-0 z-40 backdrop-blur-md bg-white/40"
              onClick={() => setShowSharePopup(false)}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            />
            {/* Modal content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="modal-enter bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform pointer-events-auto border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Share this scholarship
                  </h3>
                  <button
                    onClick={() => setShowSharePopup(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Social Media Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleShareFacebook}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </button>

                    <button
                      onClick={handleShareTwitter}
                      className="flex items-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </button>

                    <button
                      onClick={handleShareLinkedIn}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </button>

                    <button
                      onClick={handleShareWhatsApp}
                      className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </button>
                  </div>

                  {/* Copy Link Button - Full Width */}
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center justify-center gap-2 px-4 py-3 w-full rounded-lg transition-all duration-200 hover:scale-105 ${
                      copySuccess
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <Copy className="h-4 w-4" />
                    {copySuccess ? "Copied!" : "Copy Link"}
                  </button>
                  {/* URL Preview */}
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Link to share:</p>
                    <p className="text-sm text-gray-700 break-all">
                      {currentUrl}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Enhanced Hero Section */}
        <motion.div
          className="relative overflow-hidden bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Content overlay */}
          <div className="relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
              {/* Breadcrumb Navigation */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="font-medium">Back to Opportunities</span>
                </Link>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Main Hero Content */}
                <div className="lg:col-span-2">
                  {/* Status Badges */}
                  <motion.div
                    className="flex flex-wrap gap-3 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {scholarship.type && (
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                          scholarship.type === "International"
                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                            : scholarship.type === "Local"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-purple-100 text-purple-700 border border-purple-300"
                        }`}
                      >
                        <Globe className="h-4 w-4" />
                        {scholarship.type}
                      </div>
                    )}
                    {isUrgent && !isExpired && !isUndisclosed && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 border border-red-300 text-sm font-semibold animate-pulse">
                        <Clock className="h-4 w-4" />
                        Urgent - {daysRemaining} days left
                      </div>
                    )}
                    {isUndisclosed && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 text-sm font-semibold">
                        <CheckCircle className="h-4 w-4" />
                        Open Application
                      </div>
                    )}
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    {scholarship.title}
                  </motion.h1>

                  {/* Provider */}
                  {scholarship.provider && (
                    <motion.div
                      className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gray-100 border border-gray-300 mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <University className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-700 font-medium">
                        Offered by{" "}
                        <span className="font-bold text-blue-600">
                          {scholarship.provider}
                        </span>
                      </span>
                    </motion.div>
                  )}

                  {/* Quick Stats */}
                  <motion.div
                    className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <DollarSign className="h-6 w-6 text-green-600 mb-2" />
                      <div className="text-xs text-gray-500 mb-1">Value</div>
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {scholarship.amount}
                      </div>
                    </div>
                    {scholarship.level && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <GraduationCap className="h-6 w-6 text-purple-600 mb-2" />
                        <div className="text-xs text-gray-500 mb-1">Level</div>
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {scholarship.level}
                        </div>
                      </div>
                    )}
                    {scholarship.location && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <MapPin className="h-6 w-6 text-orange-600 mb-2" />
                        <div className="text-xs text-gray-500 mb-1">
                          Location
                        </div>
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {scholarship.location}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Action Card */}
                <motion.div
                  className="lg:col-span-1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className="sticky top-24">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-300 mb-4">
                          <Award className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700">
                            Scholarship Opportunity
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Ready to Apply?
                        </h3>
                        <p className="text-sm text-gray-600">
                          Take the next step towards your academic future
                        </p>
                      </div>

                      {/* Application Deadline */}
                      <div className="bg-gray-100 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <Calendar
                            className={`h-5 w-5 ${
                              isUndisclosed
                                ? "text-gray-500"
                                : isUrgent
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          />
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Application Deadline
                            </div>
                            <div
                              className={`font-semibold ${
                                isUndisclosed
                                  ? "text-gray-700"
                                  : isUrgent
                                  ? "text-red-700"
                                  : "text-gray-900"
                              }`}
                            >
                              {formatDeadline(scholarship.deadline)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Apply Button */}
                      {isExpired && !isUndisclosed ? (
                        <div className="text-center p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
                          <AlertTriangle className="h-5 w-5 text-red-400 mx-auto mb-2" />
                          <div className="text-sm font-medium text-red-300 mb-1">
                            Application Period Closed
                          </div>
                          <div className="text-xs text-red-400">
                            This scholarship is no longer accepting
                            applications.
                          </div>
                        </div>
                      ) : (
                        <motion.button
                          onClick={handleApplyClick}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ExternalLink className="h-5 w-5" />
                          {scholarship.applicationUrl
                            ? "Apply Now"
                            : "View Application Details"}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          className="relative bg-white"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  About This Scholarship
                </h2>
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {scholarship.description}
                  </div>
                </div>
              </div>

              {/* Additional Info Card */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Key Details
                  </h3>
                  <div className="space-y-4">
                    {scholarship.fieldOfStudy && (
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Field of Study
                          </div>
                          <div className="font-semibold text-gray-900">
                            {scholarship.fieldOfStudy}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Eligibility and Requirements Section */}
        <motion.div
          className="bg-gradient-to-br from-gray-50 to-blue-50/50"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Eligibility Criteria */}
              {scholarship.eligibility && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Users className="h-8 w-8 text-purple-600" />
                    Eligibility Criteria
                  </h2>
                  <div className="bg-white rounded-2xl p-8 border border-purple-200 shadow-lg">
                    <div className="space-y-4">
                      {scholarship.eligibility.map(
                        (criteria: string, index: number) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-700 font-bold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed flex-1">
                              {criteria}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Application Requirements */}
              {scholarship.requirements &&
                scholarship.requirements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      Application Requirements
                    </h2>
                    <div className="bg-white rounded-2xl p-8 border border-green-200 shadow-lg">
                      <div className="space-y-4">
                        {scholarship.requirements.map((requirement, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-700 font-bold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed flex-1">
                              {requirement}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
