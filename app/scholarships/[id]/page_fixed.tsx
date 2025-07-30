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

/*
 * SCHOLARSHIP CONTENT FORMATTING GUIDE
 * ===================================
 *
 * This component supports rich text formatting for scholarship descriptions and requirements.
 * Here's how to format content in the admin interface for best results:
 *
 * 1. PARAGRAPHS: Separate paragraphs with double line breaks (\n\n)
 *
 * 2. BULLET POINTS: Use any of these formats:
 *    • Item one
 *    - Item two
 *    * Item three
 *
 * 3. NUMBERED LISTS: Use standard numbering:
 *    1. First step
 *    2. Second step
 *
 * 4. DOCUMENT LISTS: Include keywords like "documents", "requirements", "certificates":
 *    Required documents:
 *    • Academic transcripts
 *    • Proof of language proficiency
 *    • Recommendation letters
 *
 * 5. STEP-BY-STEP INSTRUCTIONS: Use action words like "Click", "Visit", "Apply":
 *    To apply for this scholarship:
 *
 *    Visit the official website at [URL]
 *    Click on the application portal
 *    Complete the online form
 *    Submit required documents:
 *    • CV/Resume
 *    • Motivation letter
 *    • Academic transcripts
 *
 *    Submit your application before the deadline
 *
 * The system will automatically:
 * - Format paragraphs with proper spacing
 * - Convert bullets to styled list items
 * - Highlight document requirements with special styling
 * - Add visual indicators for step-by-step instructions
 * - Style headers and sub-sections appropriately
 */

// Custom logger that only logs in development
const isDevelopment = process.env.NODE_ENV === "development";
const logger = {
  log: (...args: unknown[]) => isDevelopment && console.log(...args),
  error: (...args: unknown[]) => isDevelopment && console.error(...args),
  warn: (...args: unknown[]) => isDevelopment && console.warn(...args),
};

// Enhanced component for application requirements with rich formatting and consistent styling
const ApplicationRequirement = ({
  requirement,
  index,
}: {
  requirement: string;
  index: number;
}) => {
  // Check if this is a complex requirement with multiple sections
  const hasStructuredContent =
    requirement.includes(":") &&
    (requirement.includes("\n") || requirement.length > 200);

  // Check if this looks like step-by-step instructions
  const isStepByStep =
    /\b(step|click|visit|choose|apply|prepare|submit)\b/i.test(requirement) &&
    requirement.split("\n").length > 3;

  if (hasStructuredContent || isStepByStep) {
    return (
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
          <span className="text-green-700 font-bold text-sm">{index + 1}</span>
        </div>
        <div className="flex-1">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="prose prose-sm max-w-none">
              {isStepByStep ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                        Application Steps
                      </span>
                    </div>
                    {formatRichContent(requirement)}
                  </div>
                </div>
              ) : (
                formatRichContent(requirement)
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For simple requirements, use consistent numbered list format
  return renderNumberedListItem(requirement, index, "green");
};

// Enhanced helper function to format rich text content with improved paragraph and bullet parsing
const formatRichContent = (content: string) => {
  if (!content) return null;

  // Clean up content: remove special symbols and normalize line breaks
  const cleanedContent = content
    .replace(/[";]/g, "") // Remove semicolon and quote symbols
    .replace(/\s*nest\s*/gi, "\n") // Replace "nest" with line break
    .replace(/\s*stop\s*/gi, "\n\n") // Replace "stop" with paragraph break
    .replace(/–bulletin/gi, "\n• ") // Replace "–bulletin" with bullet point
    .replace(/\s+/g, " ") // Normalize multiple spaces
    .trim();

  // Enhanced paragraph detection: split on existing line breaks, semicolons, and periods followed by capital letters
  let paragraphs = [];

  // First try splitting by existing double line breaks
  if (cleanedContent.includes("\n\n")) {
    paragraphs = cleanedContent.split(/\n\s*\n/).filter((para) => para.trim());
  } else {
    // Special handling for document lists and requirements
    // Look for patterns like "documents;" or "following:" followed by lists
    const documentListPattern =
      /(?:documents?|following|requirements?|submit|include|provide)[;:]/i;

    if (documentListPattern.test(cleanedContent)) {
      // Split at the document list introduction
      const parts = cleanedContent.split(documentListPattern);
      if (parts.length > 1) {
        // First part is the introduction
        const intro = parts[0].trim();
        if (intro) {
          paragraphs.push(intro);
        }

        // Second part contains the document list - convert to bullet points
        const documentList = parts[1].trim();

        // Split on common patterns that indicate new document items
        const documentItems = documentList
          .split(/(?:\s{2,}(?=[A-Z])|(?<=\.)\s+(?=[A-Z])|(?<=\))\s+(?=[A-Z]))/)
          .filter((item) => item.trim().length > 5)
          .map((item) => item.trim());

        if (documentItems.length > 1) {
          // Format as document list
          const listHeader = "Required documents:";
          const formattedList = documentItems
            .map((item) => `• ${item}`)
            .join("\n");
          paragraphs.push(`${listHeader}\n${formattedList}`);
        } else {
          // If splitting didn't work well, try sentence-based splitting
          const sentences = documentList
            .split(/(?<=[.!?])\s+(?=[A-Z])/)
            .filter((s) => s.trim());
          paragraphs.push(...sentences);
        }
      } else {
        paragraphs = [cleanedContent];
      }
    } else {
      // If no document list pattern, try other methods
      // Split on semicolons followed by space and capital letter, or period followed by space and capital letter
      const splitPattern =
        /(?:\.\s+(?=[A-Z])|;\s*(?=[A-Z])|(?<=\.)\s*-\s*Advertisement\s*-\s*)/g;
      paragraphs = cleanedContent
        .split(splitPattern)
        .filter((para) => para.trim());

      // If still one long paragraph, try splitting on sentences that are likely paragraph breaks
      if (paragraphs.length === 1) {
        const sentencePattern = /(?<=[.!?])\s+(?=[A-Z])/g;
        const sentences = cleanedContent.split(sentencePattern);

        // Group sentences into logical paragraphs (every 2-3 sentences)
        paragraphs = [];
        for (let i = 0; i < sentences.length; i += 2) {
          const paragraph = sentences
            .slice(i, i + 2)
            .join(" ")
            .trim();
          if (paragraph) {
            paragraphs.push(paragraph);
          }
        }
      }
    }
  }

  // Clean up paragraphs and remove artifacts
  paragraphs = paragraphs
    .map((para) => para.replace(/^\s*-\s*Advertisement\s*-\s*/i, "").trim())
    .filter((para) => para.length > 10); // Remove very short paragraphs

  return paragraphs.map((paragraph, paraIndex) => {
    const trimmedPara = paragraph.trim();

    // Handle special sections like "including:" or "should:" or "documents:" or application steps
    const hasColonHeader = /^[^:]+:$/.test(trimmedPara.split("\n")[0]);
    const isDocumentList =
      /\b(documents?|requirements?|certificates?|proof|form|prepare|submit|required documents|following)\b/i.test(
        trimmedPara
      );
    const isApplicationSteps =
      /\b(apply|click|visit|go to|choose|step|application)\b/i.test(
        trimmedPara
      );

    // Check if this paragraph has bullet points or document items
    const hasExplicitBullets =
      /^\s*[•\-\*]/.test(trimmedPara) || trimmedPara.includes("\n•");

    if (hasColonHeader || hasExplicitBullets) {
      const lines = trimmedPara.split("\n");
      const header = hasColonHeader ? lines[0] : "Required items:";
      const listItems = hasColonHeader
        ? lines.slice(1).filter((line) => line.trim())
        : lines;

      return (
        <div key={paraIndex} className="mb-6">
          {hasColonHeader && (
            <h4 className="font-semibold text-gray-900 mb-3 text-base flex items-center gap-2">
              {isDocumentList && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              {isApplicationSteps && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
              {header}
            </h4>
          )}
          {listItems.length > 0 && (
            <div
              className={
                isDocumentList
                  ? "bg-blue-50 rounded-lg p-4 border border-blue-100"
                  : isApplicationSteps
                  ? "bg-green-50 rounded-lg p-4 border border-green-100"
                  : ""
              }
            >
              <ul className="space-y-3 ml-4">
                {listItems.map((item, itemIndex) => {
                  const cleanItem = item
                    .replace(/^\s*[•\-\*]\s*/, "")
                    .replace(/^\s*\d+\.\s*/, "")
                    .trim();
                  return cleanItem ? (
                    <li
                      key={itemIndex}
                      className="text-gray-700 leading-relaxed flex items-start gap-3"
                    >
                      <span
                        className={`font-bold text-sm mt-1 flex-shrink-0 ${
                          isDocumentList
                            ? "text-blue-600"
                            : isApplicationSteps
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {isDocumentList ? "📄" : isApplicationSteps ? "▶" : "•"}
                      </span>
                      <span className="flex-1">{cleanItem}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
        </div>
      );
    }

    // Check if paragraph contains bullet points or numbered items
    const lines = trimmedPara.split("\n").filter((line) => line.trim());

    // If it's a single line, render as paragraph
    if (lines.length === 1) {
      // Check if it's a step or instruction
      const isStep =
        /^\d+\.\s/.test(trimmedPara) ||
        /^(step|click|visit|choose|apply)/i.test(trimmedPara);

      return (
        <div
          key={paraIndex}
          className={`mb-4 ${isStep ? "pl-4 border-l-2 border-blue-200" : ""}`}
        >
          <p className="text-gray-700 leading-relaxed">
            {isStep && (
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            )}
            {trimmedPara}
          </p>
        </div>
      );
    }

    // Check if lines are bullet points or numbered items
    const isBulletList = lines.some(
      (line) => /^\s*[•\-\*]\s/.test(line) || /^\s*\d+\.\s/.test(line)
    );

    if (isBulletList) {
      return (
        <div key={paraIndex} className="mb-4">
          <ul className="space-y-3 ml-4">
            {lines.map((line, lineIndex) => {
              const cleanLine = line
                .replace(/^\s*[•\-\*]\s*/, "")
                .replace(/^\s*\d+\.\s*/, "")
                .trim();
              return cleanLine ? (
                <li
                  key={lineIndex}
                  className="text-gray-700 leading-relaxed flex items-start gap-3"
                >
                  <span className="text-blue-600 font-bold text-sm mt-1 flex-shrink-0">
                    •
                  </span>
                  <span className="flex-1">{cleanLine}</span>
                </li>
              ) : null;
            })}
          </ul>
        </div>
      );
    }

    // For other multi-line content, render as separate paragraphs with step indicators
    return (
      <div key={paraIndex} className="mb-4 space-y-3">
        {lines.map((line, lineIndex) => {
          const trimmedLine = line.trim();
          const isStep =
            /^\d+\.\s/.test(trimmedLine) ||
            /^(step|click|visit|choose|apply)/i.test(trimmedLine);

          return trimmedLine ? (
            <div
              key={lineIndex}
              className={`${
                isStep
                  ? "pl-4 border-l-2 border-blue-200 bg-blue-50 rounded-r-lg py-2 pr-2"
                  : ""
              }`}
            >
              <p className="text-gray-700 leading-relaxed">
                {isStep && (
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                )}
                {trimmedLine}
              </p>
            </div>
          ) : null;
        })}
      </div>
    );
  });
};

// Enhanced helper function to render numbered list items with consistent formatting
const renderNumberedListItem = (
  content: string,
  index: number,
  colorScheme: "purple" | "green"
) => {
  const colorClasses = {
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-200",
      bgSection: "bg-purple-50",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
      bgSection: "bg-green-50",
    },
  };

  const colors = colorClasses[colorScheme];

  return (
    <div key={index} className="flex items-start gap-4">
      <div
        className={`flex-shrink-0 w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center mt-1`}
      >
        <span className={`${colors.text} font-bold text-sm`}>{index + 1}</span>
      </div>
      <div className="flex-1">
        <div
          className={`${colors.bgSection} rounded-lg p-4 border ${colors.border}`}
        >
          {formatRichContent(content)}
        </div>
      </div>
    </div>
  );
};

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
      logger.error("Firebase connection test failed:", error);
      return false;
    }
  };
  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        // Add debugging for mobile
        logger.log("Fetching scholarship with ID:", id);
        logger.log(
          "User agent:",
          typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"
        );
        logger.log(
          "Window dimensions:",
          typeof window !== "undefined"
            ? `${window.innerWidth}x${window.innerHeight}`
            : "Unknown"
        );
        // Test Firebase connection first on mobile devices or retries
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        if (isMobile || retryCount > 0) {
          logger.log("Testing Firebase connection...");
          const connectionOk = await testFirebaseConnection();
          if (!connectionOk) {
            throw new Error(
              "Firebase connection failed - please check your internet connection"
            );
          }
          logger.log("Firebase connection test passed");
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

        logger.log("Scholarship data received:", data ? "Success" : "No data");
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
          logger.log("No scholarship found for ID:", id);
          setError("Scholarship not found");
        }
      } catch (err) {
        logger.error("Error fetching scholarship:", err);
        logger.error("Error details:", {
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
      logger.error("Failed to copy: ", err);
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
          className="relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Vibrant Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/25 via-purple-500/20 via-fuchsia-500/15 to-pink-500/20"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-blue-500/20 to-indigo-600/15"></div>

          {/* Glass overlay */}
          <div className="relative backdrop-blur-sm border-b border-white/20">
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 group"
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
                            ? "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                            : scholarship.type === "Local"
                            ? "bg-green-500/20 text-green-200 border border-green-400/30"
                            : "bg-purple-500/20 text-purple-200 border border-purple-400/30"
                        }`}
                      >
                        <Globe className="h-4 w-4" />
                        {scholarship.type}
                      </div>
                    )}
                    {isUrgent && !isExpired && !isUndisclosed && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-200 border border-red-400/30 text-sm font-semibold animate-pulse">
                        <Clock className="h-4 w-4" />
                        Urgent - {daysRemaining} days left
                      </div>
                    )}
                    {isUndisclosed && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-sm font-semibold">
                        <CheckCircle className="h-4 w-4" />
                        Open Application
                      </div>
                    )}
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                      {scholarship.title}
                    </span>
                  </motion.h1>

                  {/* Provider */}
                  {scholarship.provider && (
                    <motion.div
                      className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <University className="h-5 w-5 text-blue-300" />
                      <span className="text-white font-medium">
                        Offered by{" "}
                        <span className="font-bold text-blue-200">
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
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                      <DollarSign className="h-6 w-6 text-green-400 mb-2" />
                      <div className="text-xs text-gray-300 mb-1">Value</div>
                      <div className="text-sm font-bold text-white truncate">
                        {scholarship.amount}
                      </div>
                    </div>
                    {scholarship.level && (
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                        <GraduationCap className="h-6 w-6 text-purple-400 mb-2" />
                        <div className="text-xs text-gray-300 mb-1">Level</div>
                        <div className="text-sm font-bold text-white truncate">
                          {scholarship.level}
                        </div>
                      </div>
                    )}
                    {scholarship.location && (
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                        <MapPin className="h-6 w-6 text-orange-400 mb-2" />
                        <div className="text-xs text-gray-300 mb-1">
                          Location
                        </div>
                        <div className="text-sm font-bold text-white truncate">
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
                    <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 mb-4">
                          <Award className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-semibold text-green-300">
                            Scholarship Opportunity
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                          Ready to Apply?
                        </h3>
                        <p className="text-sm text-gray-300">
                          Take the next step towards your academic future
                        </p>
                      </div>

                      {/* Application Deadline */}
                      <div className="bg-white/5 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <Calendar
                            className={`h-5 w-5 ${
                              isUndisclosed
                                ? "text-gray-400"
                                : isUrgent
                                ? "text-red-400"
                                : "text-blue-400"
                            }`}
                          />
                          <div>
                            <div className="text-xs text-gray-400 mb-1">
                              Application Deadline
                            </div>
                            <div
                              className={`font-semibold ${
                                isUndisclosed
                                  ? "text-gray-300"
                                  : isUrgent
                                  ? "text-red-300"
                                  : "text-white"
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
                  <div className="text-gray-700 leading-relaxed">
                    {formatRichContent(scholarship.description)}
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
                        (criteria: string, index: number) =>
                          renderNumberedListItem(criteria, index, "purple")
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
                        {scholarship.requirements.map(
                          (requirement: string, index: number) => (
                            <ApplicationRequirement
                              key={index}
                              requirement={requirement}
                              index={index}
                            />
                          )
                        )}
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
