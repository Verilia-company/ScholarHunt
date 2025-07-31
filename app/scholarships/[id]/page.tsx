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
import {
  trackEvents,
  usePageTracking,
  useScrollTracking,
} from "@/lib/analytics";

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

  usePageTracking();
  useScrollTracking();

  useEffect(() => {
    setIsClient(true);
    setCurrentUrl(window.location.href);
  }, []);

  const handleApplyClick = () => {
    if (scholarship) {
      trackEvents.scholarshipApply({
        scholarshipId: scholarship.id,
        scholarshipName: scholarship.title,
        provider: scholarship.provider,
        type: scholarship.type,
      });
      if (scholarship.applicationUrl) {
        window.open(
          scholarship.applicationUrl,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        const applicationSection = document.getElementById(
          "application-section"
        );
        if (applicationSection) {
          applicationSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };
  const retryFetch = () => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    setLoading(true);
  };

  const testFirebaseConnection = async () => {
    try {
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
        setError(null);
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        if (isMobile || retryCount > 0) {
          const connectionOk = await testFirebaseConnection();
          if (!connectionOk) {
            throw new Error(
              "Firebase connection failed - please check your internet connection"
            );
          }
        }
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
        const data = (await Promise.race([
          scholarshipService.getScholarship(id),
          timeoutPromise,
        ])) as Scholarship | null;
        if (data) {
          setScholarship(data);
          trackEvents.scholarshipView({
            scholarshipId: data.id,
            scholarshipName: data.title,
            provider: data.provider,
            type: data.type,
          });
          try {
            await scholarshipService.incrementViews(id);
          } catch (viewError) {
            // continue
          }
        } else {
          setError("Scholarship not found");
        }
      } catch (err) {
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
  }, [id, retryCount]);

  useEffect(() => {
    const startTime = Date.now();
    return () => {
      if (scholarship) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
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
                Screen:{" "}
                {typeof window !== "undefined"
                  ? `${window.innerWidth}×${window.innerHeight}`
                  : "?"}
              </p>
              <p>Retries: {retryCount}</p>
              <p>
                UA:{" "}
                {typeof navigator !== "undefined" &&
                navigator.userAgent.includes("Mobile")
                  ? "Mobile"
                  : "Desktop"}
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

  // --- Professional eligibility/requirements rendering ---
  // --- Restored default criteria list renderers ---
  function renderEligibilityList(list: string[]) {
    return (
      <ul className="list-disc pl-5 space-y-2 text-gray-800">
        {list.map((item, idx) => (
          <li key={idx} className="text-base sm:text-lg leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  function renderRequirementsList(list: string[]) {
    return (
      <div className="space-y-4">
        {list.map((item, idx) => {
          const lines = item.split(/\n+/);
          return (
            <div key={idx} className="mb-2">
              {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                const isNested = /^(- |• |\s{2,}|\t)/.test(line);
                if (i === 0 && !isNested) {
                  return (
                    <p
                      key={i}
                      className="text-gray-800 font-medium text-base sm:text-lg mb-1 leading-relaxed"
                    >
                      {trimmed}
                    </p>
                  );
                }
                return (
                  <div
                    key={i}
                    className="flex flex-row items-center gap-2 ml-4"
                  >
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                    <span className="text-gray-800 text-base sm:text-base md:text-lg leading-relaxed">
                      {trimmed.replace(/^(- |• |\s{2,}|\t)/, "")}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // --- End professional rendering ---

  // --- Begin full scholarship detail layout ---
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
      return Infinity;
    }
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const daysRemaining = getDaysRemaining(scholarship.deadline);
  const isUndisclosed =
    scholarship.deadline === "Undisclosed" || !scholarship.deadline;
  const isUrgent = !isUndisclosed && daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = !isUndisclosed && daysRemaining < 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Hero, stats, action card, etc. */}
      <div className="relative w-full max-w-full">
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-8 lg:py-12">
          <div
            className="mb-8 w-full"
            style={{ opacity: 1, transform: "none" }}
          >
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 transition-all duration-200 group w-full max-w-full"
              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-left h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200"
                aria-hidden="true"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              <span className="font-medium">Back to Opportunities</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 w-full max-w-full">
            <div className="lg:col-span-2 w-full max-w-full">
              <div
                className="flex flex-wrap gap-3 mb-6 w-full max-w-full"
                style={{ opacity: 1, transform: "none" }}
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-clock h-4 w-4"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Urgent - {daysRemaining} days left
                  </div>
                )}
                {isUndisclosed && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    Open Application
                  </div>
                )}
              </div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900 w-full max-w-full break-words whitespace-normal"
                style={{
                  opacity: 1,
                  transform: "none",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {scholarship.title}
              </h1>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 w-full max-w-full"
                style={{ opacity: 1, transform: "none" }}
              >
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full max-w-full">
                  <DollarSign className="h-6 w-6 text-green-600 mb-2" />
                  <div className="text-xs text-gray-500 mb-1">Value</div>
                  <div className="text-sm font-bold text-gray-900 break-words whitespace-normal w-full max-w-full">
                    {scholarship.amount}
                  </div>
                </div>
                {scholarship.level && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full max-w-full">
                    <GraduationCap className="h-6 w-6 text-purple-600 mb-2" />
                    <div className="text-xs text-gray-500 mb-1">Level</div>
                    <div className="text-sm font-bold text-gray-900 break-words whitespace-normal w-full max-w-full">
                      {scholarship.level}
                    </div>
                  </div>
                )}
                {scholarship.location && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full max-w-full">
                    <MapPin className="h-6 w-6 text-orange-600 mb-2" />
                    <div className="text-xs text-gray-500 mb-1">Location</div>
                    <div className="text-sm font-bold text-gray-900 break-words whitespace-normal w-full max-w-full">
                      {scholarship.location}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div
              className="lg:col-span-1 w-full max-w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="sticky top-24 w-full max-w-full">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg w-full max-w-full">
                  <div className="text-center mb-6 w-full max-w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-300 mb-4">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        Scholarship Opportunity
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 break-words whitespace-normal w-full max-w-full">
                      Ready to Apply?
                    </h3>
                    <p className="text-sm text-gray-600 break-words whitespace-normal w-full max-w-full">
                      Take the next step towards your academic future
                    </p>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-4 mb-6 w-full max-w-full">
                    <div className="flex items-center gap-3 w-full max-w-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`lucide lucide-calendar h-5 w-5 ${
                          isUndisclosed
                            ? "text-gray-500"
                            : isUrgent
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                        aria-hidden="true"
                      >
                        <path d="M8 2v4"></path>
                        <path d="M16 2v4"></path>
                        <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                        <path d="M3 10h18"></path>
                      </svg>
                      <div className="w-full max-w-full">
                        <div className="text-xs text-gray-500 mb-1">
                          Application Deadline
                        </div>
                        <div
                          className={`font-semibold w-full max-w-full ${
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
                  {isExpired && !isUndisclosed ? (
                    <div className="text-center p-4 bg-red-500/10 border border-red-400/30 rounded-xl w-full max-w-full">
                      <AlertTriangle className="h-5 w-5 text-red-400 mx-auto mb-2" />
                      <div className="text-sm font-medium text-red-300 mb-1">
                        Application Period Closed
                      </div>
                      <div className="text-xs text-red-400">
                        This scholarship is no longer accepting applications.
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleApplyClick}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 break-words whitespace-normal max-w-full"
                      tabIndex={0}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-external-link h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M15 3h6v6"></path>
                        <path d="M10 14 21 3"></path>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      </svg>
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
        className=""
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <div
          className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-10 lg:py-12"
          style={{
            maxWidth: "100vw",
            overflowX: "hidden",
            margin: "0px auto",
            boxSizing: "border-box",
          }}
        >
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12"
            style={{
              maxWidth: "100vw",
              overflowX: "hidden",
              boxSizing: "border-box",
            }}
          >
            {/* Eligibility Criteria Section */}
            {scholarship.eligibility && scholarship.eligibility.length > 0 && (
              <div
                className="min-w-0 w-full"
                style={{
                  maxWidth: "100%",
                  overflowX: "hidden",
                  boxSizing: "border-box",
                  opacity: 1,
                  transform: "none",
                }}
              >
                <h2
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-800 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 break-words mobile-text-force"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-users h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0 mt-1"
                    aria-hidden="true"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                  </svg>
                  <span className="break-words leading-tight min-w-0 mobile-text-force">
                    Eligibility Criteria
                  </span>
                </h2>
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 lg:p-8 border border-purple-200 shadow-lg">
                  {renderEligibilityList(scholarship.eligibility)}
                </div>
              </div>
            )}
            {/* Application Requirements Section */}
            {scholarship.requirements &&
              scholarship.requirements.length > 0 && (
                <div
                  className="min-w-0 w-full"
                  style={{
                    maxWidth: "100%",
                    overflowX: "hidden",
                    boxSizing: "border-box",
                    opacity: 1,
                    transform: "none",
                  }}
                >
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 break-words mobile-text-force">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-circle-check-big h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0 mt-1"
                      aria-hidden="true"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>
                    <span className="break-words leading-tight min-w-0 mobile-text-force">
                      Application Requirements
                    </span>
                  </h2>
                  <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 lg:p-8 border border-green-200 shadow-lg">
                    {renderRequirementsList(scholarship.requirements)}
                  </div>
                </div>
              )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
