"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  DollarSign,
  GraduationCap,
  Tag,
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

  // Analytics tracking hooks
  usePageTracking();
  useScrollTracking();

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
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading scholarship details...</p>
        </div>
      </div>
    );
  }
  if (error || !scholarship) {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--brand-error)' }} />
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
            {error || "Scholarship Not Found"}
          </h1>
          <p className="text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {error === "Scholarship not found"
              ? "The scholarship you're looking for doesn't exist or may have been removed."
              : error?.includes("Network")
              ? "There seems to be a connectivity issue. Please check your internet connection."
              : "Unable to load scholarship details. This might be a temporary issue."}
          </p>

          {/* Debug info for mobile */}
          {typeof window !== "undefined" && (
            <div className="text-xs mb-4 p-2 rounded" style={{ 
              color: 'var(--text-tertiary)', 
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-primary)'
            }}>
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
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = scholarship ? `${scholarship.title} - ${scholarship.amount} Scholarship` : "";  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      // Track copy link action
      if (scholarship) {
        trackEvents.scholarshipShare(scholarship.id, 'copy_link');
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      '_blank',
      'width=600,height=400'
    );
    // Track Facebook share
    if (scholarship) {
      trackEvents.scholarshipShare(scholarship.id, 'facebook');
    }
  };

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`,
      '_blank',
      'width=600,height=400'
    );
    // Track Twitter share
    if (scholarship) {
      trackEvents.scholarshipShare(scholarship.id, 'twitter');
    }
  };
  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      '_blank',
      'width=600,height=400'
    );
    // Track LinkedIn share
    if (scholarship) {
      trackEvents.scholarshipShare(scholarship.id, 'linkedin');
    }
  };

  const handleShareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${currentUrl}`)}`,
      '_blank',
      'width=600,height=400'
    );    // Track WhatsApp share
    if (scholarship) {
      trackEvents.scholarshipShare(scholarship.id, 'whatsapp');
    }  };

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
    <>      {/* Custom styles for glowing animation */}
      <style dangerouslySetInnerHTML={{
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
        `
      }} />
      
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {/* Fixed Share Button */}
        <div className="fixed top-20 right-4 sm:right-6 z-50">
          <button
            onClick={() => setShowSharePopup(true)}
            className="glow-button relative group bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
          >
            {/* Share icon */}
            <Share2 className="h-5 w-5 relative z-10" />
            
            {/* Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Share this scholarship
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
              </div>
            </div>
          </button>
        </div>      {/* Share Popup Modal */}
      {showSharePopup && (
        <>          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 z-40 backdrop-blur-md bg-white/40"
            onClick={() => setShowSharePopup(false)}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />
            {/* Modal content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="modal-enter bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform pointer-events-auto border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Share this scholarship</h3>
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
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Copy className="h-4 w-4" />
                {copySuccess ? 'Copied!' : 'Copy Link'}
              </button>
                {/* URL Preview */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Link to share:</p>
                <p className="text-sm text-gray-700 break-all">{currentUrl}</p>
              </div>
            </div>
          </div>
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-primary)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Back to Opportunities</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                {scholarship.type && (
                  <span
                    className={`badge text-xs sm:text-sm ${
                      scholarship.type === "International"
                        ? "badge-primary"
                        : scholarship.type === "Local"
                        ? "badge-success"
                        : "badge-warning"
                    }`}
                  >
                    {scholarship.type}
                  </span>
                )}
                {isUrgent && !isExpired && !isUndisclosed && (
                  <span className="badge badge-danger text-xs sm:text-sm">
                    <span className="hidden sm:inline">
                      Urgent - {daysRemaining} days left
                    </span>
                    <span className="sm:hidden">{daysRemaining} days left</span>
                  </span>
                )}
                {isExpired && !isUndisclosed && (
                  <span className="badge badge-gray text-xs sm:text-sm">
                    Application Closed
                  </span>
                )}
                {isUndisclosed && (
                  <span className="badge badge-success text-xs sm:text-sm">
                    Open Application
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                {scholarship.title}
              </h1>

              {scholarship.provider && (
                <p className="text-base sm:text-lg text-gray-600 mb-4">
                  Offered by{" "}
                  <span className="font-semibold text-gray-900">
                    {scholarship.provider}
                  </span>
                </p>
              )}
              {/* Description */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  About This Scholarship
                </h2>
                <div className="card">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {scholarship.description}
                  </p>
                </div>
              </section>
            </div>

            <div className="w-full lg:w-80">
              <div className="card">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Quick Facts
                </h3>
                <div className="space-y-3">
                  {/* Amount */}
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm text-gray-600">
                        Scholarship Value
                      </div>
                      <div className="font-semibold text-green-700 text-sm sm:text-base">
                        {scholarship.amount}
                      </div>
                    </div>
                  </div>
                  {/* Deadline */}
                  <div className="flex items-center gap-3">
                    <Calendar
                      className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                        isUndisclosed
                          ? "text-gray-500"
                          : isUrgent
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm text-gray-600">
                        Application Deadline
                      </div>
                      <div
                        className={`font-semibold text-sm sm:text-base ${
                          isUndisclosed
                            ? "text-gray-600"
                            : isUrgent
                            ? "text-red-700"
                            : "text-gray-900"
                        }`}
                      >
                        {formatDeadline(scholarship.deadline)}
                      </div>
                    </div>
                  </div>
                  {/* Level */}
                  {scholarship.level && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm text-gray-600">
                          Education Level
                        </div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                          {scholarship.level}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Location */}
                  {scholarship.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm text-gray-600">
                          Study Location
                        </div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                          {scholarship.location}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Field */}
                  {scholarship.fieldOfStudy && (
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm text-gray-600">
                          Field of Study
                        </div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                          {scholarship.fieldOfStudy}
                        </div>
                      </div>
                    </div>
                  )}
                </div>{" "}
                {/* Apply Button */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  {isExpired && !isUndisclosed ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="font-medium text-sm sm:text-base">
                          Application Period Closed
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        This scholarship is no longer accepting applications.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleApplyClick}
                      className="btn-primary w-full text-sm sm:text-base lg:text-lg py-2.5 sm:py-3 flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                      {scholarship.applicationUrl
                        ? "Apply Now"
                        : "View Application Details"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Eligibility */}
            {scholarship.eligibility && (
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Eligibility Criteria
                </h2>
                <div className="card">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {scholarship.eligibility}
                  </p>
                </div>
              </section>
            )}{" "}
            {/* Application Process */}
            <section id="application-section">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                How to Apply
              </h2>
              <div className="card">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Review Requirements
                      </h4>
                      <p className="text-gray-700 text-xs sm:text-sm">
                        Carefully read all eligibility criteria and required
                        documents.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Prepare Documents
                      </h4>
                      <p className="text-gray-700 text-xs sm:text-sm">
                        Gather all required documents such as transcripts,
                        essays, and references.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Submit Application
                      </h4>
                      <p className="text-gray-700 text-xs sm:text-sm">
                        {scholarship.applicationUrl
                          ? "Click the apply button above to be redirected to the official application page."
                          : "Contact the scholarship provider directly using the information below to apply."}
                      </p>
                    </div>
                  </div>
                </div>
                {!isExpired && !isUndisclosed && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <button
                      onClick={handleApplyClick}
                      className="btn-primary flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base py-2.5 sm:py-3"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {scholarship.applicationUrl
                        ? "Visit Official Application Page"
                        : "Get Application Details"}
                    </button>
                  </div>
                )}
                {isUndisclosed && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <button
                      onClick={handleApplyClick}
                      className="btn-primary flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base py-2.5 sm:py-3"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {scholarship.applicationUrl
                        ? "Visit Official Application Page"
                        : "Get Application Details"}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Additional sidebar content can go here */}
          </div>        </div>
      </div>
    </div>
    </>
  );
}
