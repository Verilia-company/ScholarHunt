"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  DollarSign,
  GraduationCap,
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle,
  Globe,
  FileText,
  Star,
} from "lucide-react";
import { scholarshipService, Scholarship } from "@/lib/firebase/services";
import {
  trackEvents,
  usePageTracking,
  useScrollTracking,
} from "@/lib/analytics";

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
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
          <span className="text-green-700 font-bold text-xs sm:text-sm">
            {index + 1}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
            <div className="prose prose-sm max-w-none">
              {isStepByStep ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm font-semibold text-green-700 uppercase tracking-wide break-words">
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
    <div key={index} className="flex items-start gap-4 mobile-container">
      <div
        className={`flex-shrink-0 w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center mt-1`}
      >
        <span className={`${colors.text} font-bold text-sm mobile-text`}>
          {index + 1}
        </span>
      </div>
      <div className="flex-1 mobile-container">
        <div
          className={`${colors.bgSection} rounded-lg p-4 border ${colors.border} mobile-card`}
        >
          <div className="mobile-text-force">{formatRichContent(content)}</div>
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
  const [isClient, setIsClient] = useState(false);

  usePageTracking();
  useScrollTracking();

  useEffect(() => {
    setIsClient(true);

    setCurrentUrl(window.location.href);

    // Force viewport handling for mobile devices
    let viewportMeta = document.querySelector(
      'meta[name="viewport"]'
    ) as HTMLMetaElement;
    if (viewportMeta) {
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no"
      );
    } else {
      viewportMeta = document.createElement("meta") as HTMLMetaElement;
      viewportMeta.name = "viewport";
      viewportMeta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no";
      document.head.appendChild(viewportMeta);
    }

    // Force body styles for mobile
    document.body.style.overflowX = "hidden";
    document.body.style.maxWidth = "100vw";
    document.body.style.width = "100vw";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    // Force html styles for mobile
    document.documentElement.style.overflowX = "hidden";
    document.documentElement.style.maxWidth = "100vw";
    document.documentElement.style.width = "100vw";

    // Add emergency CSS injection for Samsung devices
    const isSamsung =
      /samsung/i.test(navigator.userAgent) || /SM-/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 414;

    if (isSamsung || isSmallScreen) {
      const emergencyStyle = document.createElement("style");
      emergencyStyle.textContent = `
        * { 
          max-width: 100% !important; 
          overflow-x: hidden !important; 
          word-wrap: break-word !important; 
          box-sizing: border-box !important; 
        }
        div, section, article { 
          max-width: 96% !important; 
          width: 96% !important; 
          margin: 0 auto !important; 
        }
        h1, h2, h3, p, span {
          max-width: 94% !important;
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
        }
      `;
      document.head.appendChild(emergencyStyle);
    }

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
      logger.error("Firebase connection test failed:", error);
      return false;
    }
  };
  useEffect(() => {
    const fetchScholarship = async () => {
      try {

        setError(null);
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        if (isMobile || retryCount > 0) {

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



        logger.log("Scholarship data received:", data ? "Success" : "No data");

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
          } catch {
            // continue
          }
        } else {
          setError("Scholarship not found");
        }
      } catch (err) {

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
  // Universal bulletin renderer for both eligibility and requirements
  // Professional paragraph renderer for both eligibility and requirements
  function renderParagraphList(list: string[]) {
    // Flatten all lines, remove dashes, and join as paragraphs
    const paragraphs: string[] = [];
    list.forEach((item) => {
      item.split(/\n+/).forEach((line) => {
        const trimmed = line.trim().replace(/^[-•]\s*/, "");
        if (trimmed) paragraphs.push(trimmed);
      });
    });
    return (
      <div className="space-y-3">
        {paragraphs.map((text, idx) => (
          <p
            key={idx}
            className="text-gray-800 text-base sm:text-lg leading-relaxed"
          >
            {text}
          </p>
        ))}
      </div>
    );
  }

  const renderRequirementsList = renderParagraphList;
  const renderEligibilityList = renderParagraphList;

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
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Hero, stats, action card, etc. */}
      <div className="relative w-full max-w-full">
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-8 lg:py-12">
          <div
            className="mb-8 w-full"
            style={{ opacity: 1, transform: "none" }}

    <>
      {/* Custom styles for mobile text handling */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Ultra-aggressive mobile text handling for Samsung S8 and iPhone 11 */
          @media (max-width: 375px) {
            * {
              box-sizing: border-box !important;
            }
            
            .break-words {
              word-wrap: break-word !important;
              word-break: break-word !important;
              hyphens: auto !important;
              overflow-wrap: break-word !important;
              white-space: normal !important;
              max-width: 100% !important;
            }
            
            .text-overflow-mobile {
              display: -webkit-box !important;
              -webkit-line-clamp: 2 !important;
              -webkit-box-orient: vertical !important;
              overflow: hidden !important;
              word-break: break-word !important;
              max-height: 2.6em !important;
              text-overflow: ellipsis !important;
            }
            
            /* Force container to be responsive with strict width control */
            .mobile-container {
              max-width: calc(100vw - 16px) !important;
              width: 100% !important;
              overflow-x: hidden !important;
              padding-left: 6px !important;
              padding-right: 6px !important;
              margin-left: auto !important;
              margin-right: auto !important;
            }
            
            /* Ultra-small mobile text with strict width limits */
            .mobile-text {
              font-size: 9px !important;
              line-height: 1.1 !important;
              max-width: 100% !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
            }
            
            /* Mobile card fixes with width constraints */
            .mobile-card {
              padding: 6px !important;
              margin: 2px 0 !important;
              border-radius: 6px !important;
              max-width: 100% !important;
              overflow: hidden !important;
              width: 100% !important;
            }
            
            /* Mobile button fixes with text truncation */
            .mobile-button {
              font-size: 9px !important;
              padding: 6px 8px !important;
              min-height: 32px !important;
              max-width: 100% !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
            }
            
            /* Mobile title fixes with aggressive truncation */
            .mobile-title {
              font-size: 10px !important;
              line-height: 1.0 !important;
              max-height: 2.0em !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              display: -webkit-box !important;
              -webkit-line-clamp: 2 !important;
              -webkit-box-orient: vertical !important;
            }
            
            /* Force all text elements to respect container width */
            .mobile-text-force {
              max-width: calc(100vw - 32px) !important;
              word-break: break-all !important;
              overflow-wrap: anywhere !important;
            }
          }
          
          /* Specific fixes for Samsung Galaxy S8+ (360px-412px viewport) */
          @media (min-width: 361px) and (max-width: 412px) {
            .mobile-container {
              max-width: calc(100vw - 20px) !important;
              padding-left: 8px !important;
              padding-right: 8px !important;
            }
            
            .mobile-text-force {
              max-width: calc(100vw - 40px) !important;
              word-break: break-all !important;
              overflow-wrap: anywhere !important;
            }
            
            .mobile-card {
              padding: 8px !important;
              max-width: calc(100% - 4px) !important;
            }
            
            .mobile-button {
              font-size: 10px !important;
              padding: 8px 10px !important;
              max-width: calc(100% - 4px) !important;
            }
            
            .mobile-title {
              font-size: 11px !important;
              max-width: calc(100vw - 40px) !important;
            }
            
            .mobile-text {
              font-size: 10px !important;
              max-width: calc(100% - 8px) !important;
            }
          }
          
          /* Additional fixes for very small viewports with right-side cutoff prevention */
          @media (max-width: 320px) {
            .break-words {
              font-size: 8px !important;
              line-height: 1.0 !important;
              max-width: calc(100vw - 24px) !important;
            }
            
            .mobile-container {
              padding-left: 4px !important;
              padding-right: 4px !important;
              max-width: calc(100vw - 8px) !important;
            }
            
            .mobile-card {
              padding: 4px !important;
              font-size: 8px !important;
            }
            
            .mobile-button {
              font-size: 8px !important;
              padding: 4px 6px !important;
              min-height: 28px !important;
            }
            
            .mobile-title {
              font-size: 9px !important;
              line-height: 1.0 !important;
              max-height: 1.8em !important;
            }
            
            /* Force strict width on all mobile text elements */
            .mobile-text-force {
              max-width: calc(100vw - 16px) !important;
            }
          }
          
          /* Samsung Galaxy devices specific fixes - targeting S8, S8+, S9 */
          @media screen and (min-device-width: 360px) and (max-device-width: 414px) and (-webkit-device-pixel-ratio: 3) {
            .mobile-container {
              max-width: calc(100vw - 24px) !important;
              padding-left: 8px !important;
              padding-right: 8px !important;
              overflow-x: hidden !important;
            }
            
            .mobile-text-force {
              max-width: calc(100vw - 48px) !important;
              word-break: break-all !important;
              overflow-wrap: anywhere !important;
            }
            
            .mobile-card {
              max-width: calc(100% - 8px) !important;
              margin-left: 4px !important;
              margin-right: 4px !important;
            }
            
            .mobile-button {
              max-width: calc(100% - 8px) !important;
              margin-left: 4px !important;
              margin-right: 4px !important;
            }
            
            /* Force text to stay within boundaries */
            .break-words, .mobile-title, .mobile-text {
              max-width: calc(100vw - 48px) !important;
              word-wrap: break-word !important;
              word-break: break-all !important;
            }
          }
          
          /* Universal Samsung fix - catch all Samsung devices */
          @media screen and (-webkit-device-pixel-ratio: 3) and (max-width: 450px) {
            body, html {
              overflow-x: hidden !important;
            }
            
            * {
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
            
            .mobile-container {
              max-width: calc(100vw - 20px) !important;
              width: calc(100vw - 20px) !important;
              padding-left: 6px !important;
              padding-right: 6px !important;
              margin: 0 auto !important;
            }
            
            .mobile-text-force {
              max-width: calc(100vw - 40px) !important;
              word-break: break-all !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
            }
            
            .mobile-card {
              max-width: calc(100% - 12px) !important;
              padding: 6px !important;
              overflow: hidden !important;
            }
            
            .mobile-button {
              max-width: calc(100% - 12px) !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
            }
            
            /* Aggressive text wrapping for Samsung */
            span, div, p, h1, h2, h3 {
              word-wrap: break-word !important;
              word-break: break-all !important;
              overflow-wrap: anywhere !important;
              max-width: 100% !important;
            }
          }
          
          /* ULTRA-AGGRESSIVE Global fixes for ALL content - prevent ANY right-side cutoff */
          @media (max-width: 450px) {
            /* Force viewport to never exceed screen width */
            html, body {
              max-width: 100vw !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Force EVERY single element to respect boundaries */
            * {
              max-width: 100% !important;
              box-sizing: border-box !important;
              word-wrap: break-word !important;
              overflow-wrap: anywhere !important;
              word-break: break-word !important;
            }
            
            /* SPECIFIC FIXES for the problematic HTML structure you provided */
            
            /* Target the main container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 */
            div[class*="max-w-7xl"][class*="mx-auto"] {
              max-width: calc(100vw - 16px) !important;
              width: calc(100vw - 16px) !important;
              margin: 0 auto !important;
              padding: 8px !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Target grid containers: grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 */
            div[class*="grid"][class*="grid-cols-1"] {
              max-width: calc(100vw - 24px) !important;
              gap: 6px !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Target the scholarship title: text-3xl sm:text-4xl lg:text-5xl */
            h1[class*="text-3xl"], h1[class*="text-4xl"], h1[class*="text-5xl"] {
              font-size: 14px !important;
              line-height: 1.2 !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              max-width: calc(100vw - 48px) !important;
              hyphens: auto !important;
              display: block !important;
            }
            
            /* Target the info cards: bg-gray-50 border border-gray-200 rounded-xl p-4 */
            div[class*="bg-gray-50"][class*="border"][class*="rounded-xl"] {
              max-width: calc(100% - 8px) !important;
              padding: 6px !important;
              margin: 2px auto !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Target the sticky sidebar: sticky top-24 */
            div[class*="sticky"] {
              max-width: calc(100vw - 32px) !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Target the apply button: w-full bg-gradient-to-r */
            button[class*="w-full"][class*="bg-gradient-to-r"] {
              max-width: calc(100% - 8px) !important;
              padding: 8px !important;
              font-size: 12px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              word-break: break-word !important;
              white-space: normal !important;
              box-sizing: border-box !important;
            }
            
            /* Target breadcrumb links: inline-flex items-center gap-2 */
            a[class*="inline-flex"][class*="items-center"] {
              max-width: calc(100% - 16px) !important;
              padding: 6px 8px !important;
              font-size: 11px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              flex-wrap: wrap !important;
              box-sizing: border-box !important;
            }
            
            /* Target status badges: inline-flex items-center gap-2 px-4 py-2 rounded-full */
            div[class*="inline-flex"][class*="rounded-full"] {
              max-width: calc(100% - 16px) !important;
              padding: 4px 8px !important;
              font-size: 10px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              margin: 2px !important;
              box-sizing: border-box !important;
            }
            
            /* Target all SVG icons to be smaller */
            svg {
              width: 12px !important;
              height: 12px !important;
              flex-shrink: 0 !important;
            }
            
            /* Target truncated text specifically */
            div[class*="truncate"], span[class*="truncate"] {
              max-width: calc(100vw - 64px) !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              word-break: break-word !important;
            }
            
            /* Force all containers to be ultra-restrictive */
            .max-w-7xl, .max-w-6xl, .max-w-5xl, .max-w-4xl, .max-w-3xl, .max-w-2xl, .max-w-xl, .max-w-lg, .max-w-md, .max-w-sm {
              max-width: calc(100vw - 32px) !important;
              width: calc(100vw - 32px) !important;
              margin: 0 auto !important;
              padding-left: 12px !important;
              padding-right: 12px !important;
              overflow-x: hidden !important;
            }
            
            /* Apply ultra-mobile styles to ALL containers */
            div, section, article, main, aside, header, footer, nav {
              max-width: calc(100vw - 16px) !important;
              overflow-x: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL text elements to stay within bounds */
            h1, h2, h3, h4, h5, h6, p, span, div, a, button, input, textarea, label {
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              max-width: calc(100vw - 48px) !important;
              box-sizing: border-box !important;
            }
            
            /* Ultra-restrictive card elements */
            div[class*="bg-"], div[class*="border"], div[class*="rounded"], div[class*="shadow"] {
              max-width: calc(100vw - 24px) !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              margin-left: auto !important;
              margin-right: auto !important;
              box-sizing: border-box !important;
            }
            
            /* Ultra-restrictive button elements */
            button, a[class*="btn"], div[class*="button"], input[type="button"], input[type="submit"] {
              max-width: calc(100vw - 32px) !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              word-break: break-word !important;
              white-space: normal !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL grid and flex containers to be restrictive */
            div[class*="grid"], div[class*="flex"], .grid, .flex {
              max-width: calc(100vw - 16px) !important;
              overflow-x: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Ultra-force ALL gradient text */
            span[class*="gradient"], span[class*="bg-clip-text"], .bg-gradient-to-r, .bg-clip-text {
              word-break: break-all !important;
              overflow-wrap: anywhere !important;
              max-width: calc(100vw - 48px) !important;
              display: block !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL formatted content to be ultra-mobile-friendly */
            .formatRichContent *, [class*="formatRichContent"] * {
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              max-width: calc(100vw - 48px) !important;
              box-sizing: border-box !important;
            }
            
            /* Apply to ANY content with text classes */
            [class*="text-"], [class*="leading-"], [class*="mb-"], [class*="mt-"], [class*="px-"], [class*="py-"] {
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              max-width: calc(100vw - 48px) !important;
              box-sizing: border-box !important;
            }
            
            /* Force motion divs and animated elements */
            [class*="motion"], .motion-div, div[style*="transform"] {
              max-width: calc(100vw - 16px) !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Ultra-force all Tailwind containers */
            .container, .mx-auto, [class*="mx-auto"] {
              max-width: calc(100vw - 32px) !important;
              margin-left: auto !important;
              margin-right: auto !important;
              padding-left: 12px !important;
              padding-right: 12px !important;
              box-sizing: border-box !important;
            }
            
            /* FINAL NUCLEAR OPTION - Force EVERYTHING to stay within screen */
            * {
              position: relative !important;
              right: auto !important;
              left: auto !important;
            }
            
            /* Prevent ANY horizontal overflow whatsoever */
            body {
              position: relative !important;
              overflow-x: hidden !important;
              width: 100vw !important;
              max-width: 100vw !important;
            }
            
            /* UNIVERSAL MOBILE CONTAINER FIXES - Target ALL possible containers */
            .max-w-7xl, .max-w-6xl, .max-w-5xl, .max-w-4xl, .max-w-3xl, .max-w-2xl, .max-w-xl, .max-w-lg, .max-w-md, .max-w-sm,
            div[class*="max-w-"], section[class*="max-w-"], article[class*="max-w-"] {
              max-width: calc(100vw - 24px) !important;
              width: calc(100vw - 24px) !important;
              margin: 0 auto !important;
              padding-left: 8px !important;
              padding-right: 8px !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL mx-auto containers to be mobile-friendly */
            .mx-auto, div[class*="mx-auto"], section[class*="mx-auto"] {
              max-width: calc(100vw - 24px) !important;
              margin-left: auto !important;
              margin-right: auto !important;
              padding-left: 8px !important;
              padding-right: 8px !important;
              box-sizing: border-box !important;
            }
            
            /* Target ALL padding classes that might cause overflow */
            .px-4, .px-6, .px-8, .sm\\:px-6, .lg\\:px-8, 
            div[class*="px-4"], div[class*="px-6"], div[class*="px-8"] {
              padding-left: 6px !important;
              padding-right: 6px !important;
            }
            
            /* Force ALL grid containers to be mobile-friendly */
            .grid, .grid-cols-1, .grid-cols-2, .grid-cols-3, .lg\\:grid-cols-3, .lg\\:grid-cols-2,
            div[class*="grid"], div[class*="grid-cols"] {
              max-width: calc(100vw - 32px) !important;
              overflow-x: hidden !important;
              gap: 8px !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL gap classes to be smaller on mobile */
            .gap-8, .gap-12, .lg\\:gap-12, .gap-6, .gap-4, .gap-3,
            div[class*="gap-"] {
              gap: 6px !important;
            }
            
            /* Force ALL card-like containers */
            .bg-gray-50, .bg-gray-100, .bg-white, div[class*="bg-gray"], div[class*="bg-white"],
            div[class*="border"], div[class*="rounded"], div[class*="shadow"] {
              max-width: calc(100% - 12px) !important;
              margin-left: auto !important;
              margin-right: auto !important;
              padding: 8px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL text content to wrap properly */
            h1, h2, h3, h4, h5, h6, p, span, div, a, button {
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              max-width: calc(100vw - 48px) !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL large text headings to be smaller and wrap */
            .text-3xl, .text-4xl, .text-5xl, .sm\\:text-4xl, .lg\\:text-5xl,
            h1[class*="text-"], h2[class*="text-"], h3[class*="text-"] {
              font-size: 14px !important;
              line-height: 1.2 !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              max-width: calc(100vw - 48px) !important;
              display: block !important;
            }
            
            /* Force ALL buttons to be mobile-friendly */
            button, .btn, a[class*="bg-"], input[type="button"], input[type="submit"] {
              max-width: calc(100vw - 32px) !important;
              padding: 8px 12px !important;
              font-size: 12px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              word-break: break-word !important;
              white-space: normal !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL flex containers */
            .flex, .inline-flex, div[class*="flex"] {
              max-width: calc(100% - 8px) !important;
              overflow-x: hidden !important;
              flex-wrap: wrap !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL sticky/positioned elements */
            .sticky, .fixed, .absolute, .relative, div[class*="sticky"], div[class*="fixed"] {
              max-width: calc(100vw - 16px) !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL margin and padding classes */
            .mb-6, .mb-8, .py-4, .py-8, .lg\\:py-12, .p-4, .p-6,
            div[class*="mb-"], div[class*="py-"], div[class*="p-"] {
              margin-bottom: 8px !important;
              padding: 6px !important;
            }
            
            /* ULTRA-AGGRESSIVE: Force every single div to be constrained */
            div {
              max-width: calc(100vw - 16px) !important;
              overflow-x: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL text truncation where needed */
            .truncate, span[class*="truncate"], div[class*="truncate"] {
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              max-width: calc(100vw - 48px) !important;
              word-break: break-word !important;
            }
            
            /* NUCLEAR OPTION: Override EVERYTHING with viewport width constraints */
            * {
              max-width: calc(100vw - 8px) !important;
              overflow-x: hidden !important;
              word-wrap: break-word !important;
              overflow-wrap: anywhere !important;
              word-break: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force body and html to never exceed viewport */
            html {
              overflow-x: hidden !important;
              max-width: 100vw !important;
              width: 100vw !important;
            }
            
            body {
              overflow-x: hidden !important;
              max-width: 100vw !important;
              width: 100vw !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* Force ALL possible container selectors */
            div, span, p, h1, h2, h3, h4, h5, h6, section, article, main, aside, header, footer, nav, 
            button, a, input, textarea, label, form, ul, ol, li, table, tr, td, th {
              max-width: calc(100vw - 12px) !important;
              overflow-x: hidden !important;
              word-wrap: break-word !important;
              overflow-wrap: anywhere !important;
              word-break: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL Tailwind utility classes */
            [class*="max-w"], [class*="w-"], [class*="min-w"], [class*="flex"], [class*="grid"],
            [class*="px-"], [class*="py-"], [class*="p-"], [class*="m-"], [class*="mx-"], [class*="my-"],
            [class*="text-"], [class*="font-"], [class*="leading-"], [class*="tracking-"] {
              max-width: calc(100vw - 16px) !important;
              overflow-x: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL background and border classes */
            [class*="bg-"], [class*="border"], [class*="rounded"], [class*="shadow"] {
              max-width: calc(100vw - 20px) !important;
              margin-left: auto !important;
              margin-right: auto !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL positioning classes */
            [class*="absolute"], [class*="relative"], [class*="fixed"], [class*="sticky"] {
              max-width: calc(100vw - 12px) !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL display classes */
            [class*="flex"], [class*="grid"], [class*="block"], [class*="inline"] {
              max-width: calc(100vw - 16px) !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* EMERGENCY OVERRIDE: If NOTHING else works, use these */
            * {
              position: relative !important;
              right: 0 !important;
              left: 0 !important;
              transform: none !important;
              width: auto !important;
              min-width: 0 !important;
            }
          }
          
          /* EMERGENCY MOBILE FIX - For devices where nothing else works */
          @media (max-width: 480px) {
            /* Nuclear option: Force EVERYTHING to be constrained */
            *, *::before, *::after {
              max-width: calc(100vw - 4px) !important;
              width: auto !important;
              min-width: 0 !important;
              overflow-x: hidden !important;
              word-wrap: break-word !important;
              overflow-wrap: anywhere !important;
              word-break: break-all !important;
              hyphens: auto !important;
              box-sizing: border-box !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding-left: 2px !important;
              padding-right: 2px !important;
              position: relative !important;
              right: 0 !important;
              left: 0 !important;
              transform: none !important;
            }
            
            /* Force body and html to be ultra-constrained */
            html, body {
              max-width: 100vw !important;
              width: 100vw !important;
              overflow-x: hidden !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* Force ALL containers to be micro-sized */
            div, section, article, main, aside, header, footer {
              max-width: calc(100vw - 8px) !important;
              width: calc(100vw - 8px) !important;
              margin: 0 auto !important;
              padding: 1px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL text to be micro-sized and wrapped */
            h1, h2, h3, h4, h5, h6, p, span, div, a, button, input, label {
              font-size: 10px !important;
              line-height: 1.1 !important;
              max-width: calc(100vw - 12px) !important;
              word-break: break-all !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              white-space: normal !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL buttons to be micro-sized */
            button, input[type="button"], input[type="submit"], a[role="button"] {
              max-width: calc(100vw - 16px) !important;
              width: calc(100vw - 16px) !important;
              font-size: 9px !important;
              padding: 4px !important;
              margin: 1px auto !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              word-break: break-word !important;
              white-space: normal !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL flex and grid containers */
            [class*="flex"], [class*="grid"], .flex, .grid {
              max-width: calc(100vw - 12px) !important;
              width: calc(100vw - 12px) !important;
              margin: 0 auto !important;
              gap: 2px !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
              flex-wrap: wrap !important;
            }
            
            /* Force ALL cards and bordered elements */
            [class*="border"], [class*="rounded"], [class*="shadow"], [class*="bg-"] {
              max-width: calc(100vw - 16px) !important;
              width: calc(100vw - 16px) !important;
              margin: 1px auto !important;
              padding: 2px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force SVGs to be tiny */
            svg {
              width: 8px !important;
              height: 8px !important;
              max-width: 8px !important;
              max-height: 8px !important;
              flex-shrink: 0 !important;
            }
            
            /* Force ALL positioning to be safe */
            [class*="absolute"], [class*="fixed"], [class*="sticky"] {
              max-width: calc(100vw - 8px) !important;
              right: 4px !important;
              left: auto !important;
              top: auto !important;
              bottom: auto !important;
              transform: none !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
          }
          
          /* LAST RESORT: Ultra-tiny screen emergency fixes */
          @media (max-width: 360px) {
            /* Make EVERYTHING even smaller */
            * {
              max-width: calc(100vw - 2px) !important;
              font-size: 8px !important;
              padding: 1px !important;
              margin: 0 !important;
              overflow: hidden !important;
              word-break: break-all !important;
              box-sizing: border-box !important;
            }
            
            /* Ultra-micro containers */
            div, section {
              max-width: calc(100vw - 4px) !important;
              width: calc(100vw - 4px) !important;
              margin: 0 auto !important;
              overflow: hidden !important;
            }
            
            /* Ultra-micro text */
            h1, h2, h3, p, span {
              font-size: 7px !important;
              line-height: 1.0 !important;
              max-width: calc(100vw - 6px) !important;
              word-break: break-all !important;
            }
          }
          
          /* ULTIMATE SOLUTION: Force absolutely everything to fit within viewport */
          @media screen and (max-width: 500px) {
            /* Remove ALL potential sources of horizontal overflow */
            html {
              overflow-x: hidden !important;
              max-width: 100vw !important;
              width: 100vw !important;
              position: relative !important;
            }
            
            body {
              overflow-x: hidden !important;
              max-width: 100vw !important;
              width: 100vw !important;
              margin: 0 !important;
              padding: 0 !important;
              position: relative !important;
            }
            
            /* NUCLEAR: Force every element to be absolutely constrained */
            * {
              max-width: 100vw !important;
              width: auto !important;
              min-width: 0 !important;
              overflow-x: hidden !important;
              overflow-wrap: break-word !important;
              word-wrap: break-word !important;
              word-break: break-all !important;
              hyphens: auto !important;
              box-sizing: border-box !important;
              position: relative !important;
              left: 0 !important;
              right: 0 !important;
              transform: none !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
            
            /* Force containers to never exceed screen */
            div, section, article, main, aside, header, footer, nav {
              max-width: 100vw !important;
              width: 100% !important;
              overflow-x: hidden !important;
              margin: 0 auto !important;
              padding: 2px !important;
              box-sizing: border-box !important;
            }
            
            /* Force text elements to wrap aggressively */
            h1, h2, h3, h4, h5, h6, p, span, div, a, button, input, textarea, label {
              max-width: 95vw !important;
              word-break: break-all !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              white-space: normal !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              box-sizing: border-box !important;
              display: block !important;
              width: 100% !important;
            }
            
            /* Force ALL Tailwind containers */
            .container, .max-w-7xl, .max-w-6xl, .max-w-5xl, .max-w-4xl, .max-w-3xl, .max-w-2xl, .max-w-xl, .max-w-lg, .max-w-md, .max-w-sm,
            [class*="max-w-"], [class*="container"] {
              max-width: 95vw !important;
              width: 95vw !important;
              margin: 0 auto !important;
              padding: 4px !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL margin/padding classes */
            [class*="mx-auto"], [class*="px-"], [class*="py-"], [class*="p-"], [class*="m-"] {
              margin-left: 2px !important;
              margin-right: 2px !important;
              padding-left: 2px !important;
              padding-right: 2px !important;
              max-width: 95vw !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL grid and flex layouts */
            [class*="grid"], [class*="flex"], .grid, .flex {
              max-width: 95vw !important;
              width: 95vw !important;
              margin: 0 auto !important;
              gap: 4px !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
              flex-wrap: wrap !important;
            }
            
            /* Force ALL cards and bordered elements */
            [class*="bg-"], [class*="border"], [class*="rounded"], [class*="shadow"] {
              max-width: 90vw !important;
              width: 90vw !important;
              margin: 2px auto !important;
              padding: 4px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force ALL buttons */
            button, [role="button"], input[type="button"], input[type="submit"], .btn {
              max-width: 90vw !important;
              width: 90vw !important;
              margin: 2px auto !important;
              padding: 6px !important;
              font-size: 11px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              word-break: break-word !important;
              white-space: normal !important;
              box-sizing: border-box !important;
              display: block !important;
            }
            
            /* Force ALL text sizing classes */
            [class*="text-"], .text-3xl, .text-4xl, .text-5xl, .sm\\:text-4xl, .lg\\:text-5xl {
              font-size: 12px !important;
              line-height: 1.2 !important;
              word-break: break-all !important;
              overflow-wrap: anywhere !important;
              max-width: 90vw !important;
              box-sizing: border-box !important;
            }
            
            /* Force positioning elements */
            [class*="absolute"], [class*="fixed"], [class*="sticky"], [class*="relative"] {
              max-width: 95vw !important;
              left: 2.5vw !important;
              right: auto !important;
              transform: none !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Force SVG icons */
            svg {
              width: 10px !important;
              height: 10px !important;
              max-width: 10px !important;
              max-height: 10px !important;
              flex-shrink: 0 !important;
            }
            
            /* Remove ALL transforms that might cause overflow */
            [style*="transform"], .transform {
              transform: none !important;
              -webkit-transform: none !important;
            }
            
            /* Remove ALL negative margins */
            [class*="-m"], [style*="margin: -"] {
              margin: 0 !important;
            }
            
            /* Force viewport meta compliance */
            @-ms-viewport {
              width: device-width;
            }
          }
          
          /* Ultra-aggressive Samsung S8+ specific fix */
          @media screen and (min-width: 360px) and (max-width: 412px) and (orientation: portrait) {
            * {
              max-width: 100% !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
            }
            
            body, html {
              overflow-x: hidden !important;
              max-width: 100vw !important;
            }
            
            /* Force ALL containers */
            div, section, article, main, aside {
              max-width: calc(100vw - 20px) !important;
              overflow-x: hidden !important;
              word-wrap: break-word !important;
            }
            
            /* Force ALL text content */
            h1, h2, h3, h4, h5, h6, p, span, div, li, td, th {
              word-break: break-all !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              max-width: calc(100vw - 40px) !important;
            }
          }
          
          /* SAMSUNG-SPECIFIC VIEWPORT FIXES - Target known Samsung viewport bugs */
          @media screen and (min-width: 360px) and (max-width: 414px) and (orientation: portrait) {
            /* Samsung devices have viewport calculation issues - force absolute constraints */
            html {
              overflow-x: hidden !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            
            body {
              overflow-x: hidden !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* Samsung-specific container fixes */
            * {
              max-width: 100% !important;
              overflow-x: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Force all containers to use percentage widths instead of vw on Samsung */
            div, section, article, main, aside {
              max-width: 98% !important;
              width: 98% !important;
              margin: 0 auto !important;
              overflow-x: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Samsung text handling - use smaller units */
            h1, h2, h3, h4, h5, h6, p, span, div, li, td, th {
              word-break: break-all !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              max-width: 95% !important;
              width: 95% !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Samsung button fixes */
            button, .btn, [role="button"] {
              max-width: 95% !important;
              width: 95% !important;
              margin: 2px auto !important;
              display: block !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              word-break: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Samsung grid/flex fixes */
            [class*="grid"], [class*="flex"] {
              max-width: 98% !important;
              width: 98% !important;
              margin: 0 auto !important;
              overflow-x: hidden !important;
              gap: 4px !important;
              box-sizing: border-box !important;
            }
            
            /* Samsung card fixes */
            [class*="bg-"], [class*="border"], [class*="rounded"] {
              max-width: 95% !important;
              width: 95% !important;
              margin: 2px auto !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
            
            /* Samsung padding/margin overrides */
            [class*="px-"], [class*="py-"], [class*="p-"], [class*="mx-"], [class*="my-"], [class*="m-"] {
              padding-left: 4px !important;
              padding-right: 4px !important;
              margin-left: 2px !important;
              margin-right: 2px !important;
              box-sizing: border-box !important;
            }
          }
          
          /* IPHONE 11 SPECIFIC FIXES */
          @media screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) {
            /* iPhone 11 specific viewport handling */
            * {
              max-width: 100% !important;
              overflow-x: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            div, section, article {
              max-width: 96% !important;
              width: 96% !important;
              margin: 0 auto !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            
            h1, h2, h3, p, span {
              max-width: 94% !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              box-sizing: border-box !important;
            }
          }
          
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
          
          /* SPECIFIC FIXES for problematic containers borrowing from working designs */
          @media (max-width: 500px) {
            /* Fix for the scholarship title - borrow from working h2 design */
            h1[class*="text-3xl"] {
              font-size: 16px !important;
              line-height: 1.3 !important;
              max-width: calc(100vw - 32px) !important;
              padding: 8px !important;
              margin: 8px auto !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              box-sizing: border-box !important;
              display: block !important;
            }
            
            /* Fix for the apply now card - borrow from working rounded-2xl design */
            div[class*="bg-gray-50"][class*="border"][class*="rounded-2xl"] {
              max-width: calc(100vw - 32px) !important;
              width: calc(100vw - 32px) !important;
              margin: 8px auto !important;
              padding: 12px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
              border-radius: 12px !important;
            }
            
            /* Fix for level and value info cards - borrow from working design */
            div[class*="bg-gray-50"][class*="border"][class*="rounded-xl"][class*="p-4"] {
              max-width: calc(100% - 16px) !important;
              width: calc(100% - 16px) !important;
              margin: 4px auto !important;
              padding: 8px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
              border-radius: 8px !important;
            }
            
            /* Fix for apply now button - borrow from working button styles */
            button[class*="w-full"][class*="bg-gradient-to-r"] {
              max-width: calc(100% - 16px) !important;
              width: calc(100% - 16px) !important;
              margin: 8px auto !important;
              padding: 12px 8px !important;
              font-size: 14px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              word-break: break-word !important;
              white-space: normal !important;
              box-sizing: border-box !important;
              display: block !important;
              border-radius: 8px !important;
            }
            
            /* Fix for scholarship opportunity badge */
            div[class*="inline-flex"][class*="rounded-full"][class*="bg-green-100"] {
              max-width: calc(100% - 32px) !important;
              padding: 6px 12px !important;
              font-size: 12px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              margin: 4px auto !important;
              box-sizing: border-box !important;
              display: inline-flex !important;
              flex-wrap: wrap !important;
            }
            
            /* Fix for deadline info container */
            div[class*="bg-gray-100"][class*="rounded-xl"] {
              max-width: calc(100% - 16px) !important;
              width: calc(100% - 16px) !important;
              margin: 4px auto !important;
              padding: 8px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
              border-radius: 8px !important;
            }
            
            /* Fix for icon and text combinations */
            div[class*="flex"][class*="items-center"][class*="gap-3"] {
              max-width: calc(100% - 8px) !important;
              overflow: hidden !important;
              flex-wrap: wrap !important;
              gap: 6px !important;
              box-sizing: border-box !important;
            }
            
            /* Fix for truncated text inside cards */
            div[class*="truncate"] {
              max-width: calc(100% - 16px) !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              word-break: break-word !important;
              font-size: 12px !important;
              line-height: 1.2 !important;
              box-sizing: border-box !important;
            }
            
            /* Fix for SVG icons to be smaller */
            svg[class*="lucide"] {
              width: 14px !important;
              height: 14px !important;
              max-width: 14px !important;
              max-height: 14px !important;
              flex-shrink: 0 !important;
            }
            
            /* Fix for text content inside cards */
            div[class*="text-center"] {
              max-width: calc(100% - 8px) !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Fix for heading text inside cards */
            h3[class*="text-lg"] {
              font-size: 14px !important;
              line-height: 1.2 !important;
              max-width: calc(100% - 8px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              margin: 4px 0 !important;
              box-sizing: border-box !important;
            }
            
            /* Fix for paragraph text inside cards */
            p[class*="text-sm"] {
              font-size: 11px !important;
              line-height: 1.2 !important;
              max-width: calc(100% - 8px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              margin: 2px 0 !important;
              box-sizing: border-box !important;
            }
            
            /* Fix for small label text */
            div[class*="text-xs"] {
              font-size: 10px !important;
              line-height: 1.1 !important;
              max-width: calc(100% - 4px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              box-sizing: border-box !important;
            }
            
            /* Fix for font-bold text inside cards */
            div[class*="font-bold"], span[class*="font-bold"] {
              font-size: 12px !important;
              line-height: 1.2 !important;
              max-width: calc(100% - 4px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              box-sizing: border-box !important;
            }
            
            /* ULTRA-SPECIFIC FIXES for the exact containers mentioned */
            
            /* Title fix - University of Notre Dame Graduate Scholarships */
            h1.text-3xl, h1[class*="text-3xl"] {
              font-size: 16px !important;
              line-height: 1.3 !important;
              max-width: calc(100vw - 32px) !important;
              padding: 8px !important;
              margin: 8px auto !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              box-sizing: border-box !important;
              display: block !important;
              text-align: left !important;
            }
            
            /* Apply card container fix */
            div.bg-gray-50.border.border-gray-200.rounded-2xl {
              max-width: calc(100vw - 24px) !important;
              width: calc(100vw - 24px) !important;
              margin: 8px auto !important;
              padding: 12px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
              border-radius: 12px !important;
            }
            
            /* Level info card fix */
            div.bg-gray-50.border.border-gray-200.rounded-xl.p-4:has(svg.lucide-graduation-cap) {
              max-width: calc(100% - 12px) !important;
              width: calc(100% - 12px) !important;
              margin: 4px auto !important;
              padding: 8px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
              border-radius: 8px !important;
            }
            
            /* Value info card fix */
            div.bg-gray-50.border.border-gray-200.rounded-xl.p-4:has(svg.lucide-dollar-sign) {
              max-width: calc(100% - 12px) !important;
              width: calc(100% - 12px) !important;
              margin: 4px auto !important;
              padding: 8px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
              border-radius: 8px !important;
            }
            
            /* Apply button fix */
            button.w-full.bg-gradient-to-r {
              max-width: calc(100% - 12px) !important;
              width: calc(100% - 12px) !important;
              margin: 8px auto !important;
              padding: 12px 8px !important;
              font-size: 14px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              word-break: break-word !important;
              white-space: normal !important;
              box-sizing: border-box !important;
              display: block !important;
              border-radius: 8px !important;
            }
            
            /* Scholarship opportunity badge fix */
            div.inline-flex.items-center.gap-2.px-4.py-2.rounded-full.bg-green-100 {
              max-width: calc(100% - 24px) !important;
              padding: 6px 12px !important;
              font-size: 12px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              margin: 4px auto !important;
              box-sizing: border-box !important;
              display: inline-flex !important;
              flex-wrap: wrap !important;
            }
            
            /* Deadline info fix */
            div.bg-gray-100.rounded-xl.p-4 {
              max-width: calc(100% - 12px) !important;
              width: calc(100% - 12px) !important;
              margin: 4px auto !important;
              padding: 8px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
              border-radius: 8px !important;
            }
            
            /* Text content fixes for card internals */
            div.text-center.mb-6 {
              max-width: calc(100% - 8px) !important;
              margin-bottom: 12px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            h3.text-lg.font-bold {
              font-size: 14px !important;
              line-height: 1.2 !important;
              max-width: calc(100% - 8px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              margin: 4px 0 !important;
              box-sizing: border-box !important;
            }
            
            span.text-sm.font-semibold {
              font-size: 11px !important;
              line-height: 1.2 !important;
              max-width: calc(100% - 4px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              box-sizing: border-box !important;
            }
            
            div.text-sm.font-bold.text-gray-900.truncate {
              font-size: 11px !important;
              line-height: 1.2 !important;
              max-width: calc(100% - 8px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              white-space: normal !important;
              overflow: visible !important;
              text-overflow: unset !important;
              box-sizing: border-box !important;
            }
            
            /* Icon fixes */
            svg.lucide-award, svg.lucide-calendar, svg.lucide-graduation-cap, svg.lucide-dollar-sign, svg.lucide-external-link {
              width: 12px !important;
              height: 12px !important;
              max-width: 12px !important;
              max-height: 12px !important;
              flex-shrink: 0 !important;
            }
            
            /* Apply mobile-friendly classes to problematic containers */
            .mobile-apply-card {
              max-width: calc(100vw - 24px) !important;
              width: calc(100vw - 24px) !important;
              margin: 8px auto !important;
              padding: 12px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
              border-radius: 12px !important;
            }
            
            .mobile-info-card {
              max-width: calc(100% - 12px) !important;
              width: calc(100% - 12px) !important;
              margin: 4px auto !important;
              padding: 8px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
              border-radius: 8px !important;
            }
            
            .mobile-apply-button {
              max-width: calc(100% - 12px) !important;
              width: calc(100% - 12px) !important;
              margin: 8px auto !important;
              padding: 12px 8px !important;
              font-size: 14px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              word-break: break-word !important;
              white-space: normal !important;
              box-sizing: border-box !important;
              display: block !important;
              border-radius: 8px !important;
            }
            
            .mobile-badge {
              max-width: calc(100% - 24px) !important;
              padding: 6px 12px !important;
              font-size: 12px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              margin: 4px auto !important;
              box-sizing: border-box !important;
              display: inline-flex !important;
              flex-wrap: wrap !important;
            }
            
            .mobile-title-large {
              font-size: 16px !important;
              line-height: 1.3 !important;
              max-width: calc(100vw - 32px) !important;
              padding: 8px !important;
              margin: 8px auto !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              box-sizing: border-box !important;
              display: block !important;
              text-align: left !important;
            }
            
            .mobile-icon-small {
              width: 12px !important;
              height: 12px !important;
              max-width: 12px !important;
              max-height: 12px !important;
              flex-shrink: 0 !important;
            }
            
            .mobile-text-truncate-fix {
              font-size: 11px !important;
              line-height: 1.2 !important;
              max-width: calc(100% - 8px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              white-space: normal !important;
              overflow: visible !important;
              text-overflow: unset !important;
              box-sizing: border-box !important;
            }
            
            /* EXACT REPLICATION CSS - Copy working design patterns precisely */
            
            /* Make h1 title exactly like working h2 "About This Scholarship" */
            h1.text-3xl.sm\\:text-4xl.lg\\:text-5xl,
            h1[class*="text-3xl"][class*="sm:text-4xl"][class*="lg:text-5xl"] {
              /* Copy exact styles from working h2.text-3xl.font-bold */
              font-size: 18px !important;
              font-weight: bold !important;
              color: rgb(17, 24, 39) !important; /* text-gray-900 */
              margin-bottom: 24px !important; /* mb-6 */
              display: flex !important;
              align-items: center !important;
              gap: 12px !important;
              max-width: calc(100vw - 32px) !important;
              width: calc(100vw - 32px) !important;
              margin-left: auto !important;
              margin-right: auto !important;
              padding: 0 8px !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              box-sizing: border-box !important;
              line-height: 1.25 !important;
              leading-tight: true !important;
            }
            
            /* Apply cards - replicate working rounded-2xl design exactly */
            div.bg-gray-50.border.border-gray-200.rounded-2xl.p-6.shadow-lg,
            div[class*="bg-gray-50"][class*="border-gray-200"][class*="rounded-2xl"][class*="p-6"][class*="shadow-lg"] {
              /* Copy exact styles from working bg-gray-50 rounded-2xl p-8 border border-gray-200 */
              background-color: rgb(249, 250, 251) !important; /* bg-gray-50 */
              border-radius: 16px !important; /* rounded-2xl */
              padding: 16px !important; /* p-4 for mobile instead of p-8 */
              border: 1px solid rgb(229, 231, 235) !important; /* border-gray-200 */
              max-width: calc(100vw - 32px) !important;
              width: calc(100vw - 32px) !important;
              margin: 0 auto !important;
              margin-bottom: 16px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; /* shadow-lg */
            }
            
            /* Info cards - replicate working rounded-xl design exactly */
            div.bg-gray-50.border.border-gray-200.rounded-xl.p-4:has(svg.lucide-graduation-cap),
            div.bg-gray-50.border.border-gray-200.rounded-xl.p-4:has(svg.lucide-dollar-sign),
            div[class*="bg-gray-50"][class*="border-gray-200"][class*="rounded-xl"][class*="p-4"]:has(svg[class*="lucide-graduation-cap"]),
            div[class*="bg-gray-50"][class*="border-gray-200"][class*="rounded-xl"][class*="p-4"]:has(svg[class*="lucide-dollar-sign"]) {
              /* Copy exact styles from working rounded-2xl containers */
              background-color: rgb(249, 250, 251) !important; /* bg-gray-50 */
              border-radius: 12px !important; /* rounded-xl */
              padding: 12px !important; /* p-3 for mobile instead of p-4 */
              border: 1px solid rgb(229, 231, 235) !important; /* border-gray-200 */
              max-width: calc(100% - 16px) !important;
              width: calc(100% - 16px) !important;
              margin: 0 auto !important;
              margin-bottom: 8px !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Center content in apply cards - replicate working text layout */
            div.text-center.mb-6 {
              text-align: center !important;
              margin-bottom: 16px !important; /* reduce from 24px to 16px for mobile */
              max-width: calc(100% - 16px) !important;
              margin-left: auto !important;
              margin-right: auto !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Badge styling - replicate working design */
            div.inline-flex.items-center.gap-2.px-4.py-2.rounded-full.bg-green-100.border.border-green-300,
            div[class*="inline-flex"][class*="items-center"][class*="gap-2"][class*="px-4"][class*="py-2"][class*="rounded-full"][class*="bg-green-100"] {
              display: inline-flex !important;
              align-items: center !important;
              gap: 6px !important; /* reduce from 8px to 6px for mobile */
              padding: 6px 12px !important; /* reduce from 16px 16px to 6px 12px */
              border-radius: 9999px !important; /* rounded-full */
              background-color: rgb(220, 252, 231) !important; /* bg-green-100 */
              border: 1px solid rgb(134, 239, 172) !important; /* border-green-300 */
              margin-bottom: 12px !important; /* reduce from 16px to 12px */
              max-width: calc(100% - 24px) !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
              flex-wrap: wrap !important;
            }
            
            /* Card headings - replicate working text styling */
            h3.text-lg.font-bold.text-gray-900.mb-2,
            h3[class*="text-lg"][class*="font-bold"][class*="text-gray-900"][class*="mb-2"] {
              font-size: 16px !important; /* reduce from 18px to 16px for mobile */
              font-weight: bold !important;
              color: rgb(17, 24, 39) !important; /* text-gray-900 */
              margin-bottom: 8px !important; /* reduce from 8px to 6px */
              max-width: calc(100% - 16px) !important;
              margin-left: auto !important;
              margin-right: auto !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              box-sizing: border-box !important;
              line-height: 1.25 !important;
            }
            
            /* Card paragraphs - replicate working text styling */
            p.text-sm.text-gray-600,
            p[class*="text-sm"][class*="text-gray-600"] {
              font-size: 13px !important; /* reduce from 14px to 13px for mobile */
              color: rgb(75, 85, 99) !important; /* text-gray-600 */
              max-width: calc(100% - 16px) !important;
              margin-left: auto !important;
              margin-right: auto !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              box-sizing: border-box !important;
              line-height: 1.4 !important;
            }
            
            /* Deadline info container - replicate working design */
            div.bg-gray-100.rounded-xl.p-4.mb-6,
            div[class*="bg-gray-100"][class*="rounded-xl"][class*="p-4"][class*="mb-6"] {
              background-color: rgb(243, 244, 246) !important; /* bg-gray-100 */
              border-radius: 12px !important; /* rounded-xl */
              padding: 12px !important; /* reduce from 16px to 12px for mobile */
              margin-bottom: 16px !important; /* reduce from 24px to 16px */
              max-width: calc(100% - 16px) !important;
              margin-left: auto !important;
              margin-right: auto !important;
              overflow: hidden !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Apply button - replicate working button design */
            button.w-full.bg-gradient-to-r.from-blue-600.to-indigo-600,
            button[class*="w-full"][class*="bg-gradient-to-r"][class*="from-blue-600"][class*="to-indigo-600"] {
              width: calc(100% - 16px) !important;
              max-width: calc(100% - 16px) !important;
              margin: 0 auto !important;
              display: block !important;
              background: linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229)) !important; /* bg-gradient-to-r from-blue-600 to-indigo-600 */
              color: white !important;
              font-weight: bold !important;
              padding: 12px 16px !important; /* reduce from 16px 24px to 12px 16px */
              border-radius: 12px !important; /* rounded-xl */
              transition: all 0.3s ease !important;
              border: none !important;
              cursor: pointer !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              word-break: break-word !important;
              white-space: normal !important;
              box-sizing: border-box !important;
              font-size: 14px !important;
              line-height: 1.25 !important;
            }
            
            /* Flex containers inside cards - replicate working flex design */
            div.flex.items-center.gap-3,
            div[class*="flex"][class*="items-center"][class*="gap-3"] {
              display: flex !important;
              align-items: center !important;
              gap: 8px !important; /* reduce from 12px to 8px for mobile */
              max-width: calc(100% - 8px) !important;
              overflow: hidden !important;
              flex-wrap: wrap !important;
              word-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            
            /* Small label text - replicate working text styling */
            div.text-xs.text-gray-500.mb-1,
            div[class*="text-xs"][class*="text-gray-500"][class*="mb-1"] {
              font-size: 11px !important; /* reduce from 12px to 11px for mobile */
              color: rgb(107, 114, 128) !important; /* text-gray-500 */
              margin-bottom: 4px !important;
              max-width: calc(100% - 8px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              box-sizing: border-box !important;
              line-height: 1.3 !important;
            }
            
            /* Bold text values - replicate working text styling and fix truncation */
            div.text-sm.font-bold.text-gray-900.truncate,
            div[class*="text-sm"][class*="font-bold"][class*="text-gray-900"][class*="truncate"] {
              font-size: 12px !important; /* reduce from 14px to 12px for mobile */
              font-weight: bold !important;
              color: rgb(17, 24, 39) !important; /* text-gray-900 */
              max-width: calc(100% - 8px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              hyphens: auto !important;
              white-space: normal !important; /* override truncate */
              overflow: visible !important; /* override truncate */
              text-overflow: unset !important; /* override truncate */
              box-sizing: border-box !important;
              line-height: 1.3 !important;
            }
            
            /* Badge text - replicate working text styling */
            span.text-sm.font-semibold.text-green-700,
            span[class*="text-sm"][class*="font-semibold"][class*="text-green-700"] {
              font-size: 12px !important; /* reduce from 14px to 12px for mobile */
              font-weight: 600 !important; /* font-semibold */
              color: rgb(21, 128, 61) !important; /* text-green-700 */
              max-width: calc(100% - 8px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              box-sizing: border-box !important;
              line-height: 1.3 !important;
            }
            
            /* Semibold text - replicate working text styling */
            div.font-semibold.text-gray-700,
            div[class*="font-semibold"][class*="text-gray-700"] {
              font-weight: 600 !important; /* font-semibold */
              color: rgb(55, 65, 81) !important; /* text-gray-700 */
              font-size: 13px !important;
              max-width: calc(100% - 8px) !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
              box-sizing: border-box !important;
              line-height: 1.3 !important;
            }
            
            /* SVG icons - replicate working icon sizes */
            svg.lucide-award, svg.lucide-calendar, svg.lucide-graduation-cap, 
            svg.lucide-dollar-sign, svg.lucide-external-link,
            svg[class*="lucide-award"], svg[class*="lucide-calendar"], 
            svg[class*="lucide-graduation-cap"], svg[class*="lucide-dollar-sign"], 
            svg[class*="lucide-external-link"] {
              width: 14px !important; /* reduce from original size */
              height: 14px !important;
              max-width: 14px !important;
              max-height: 14px !important;
              flex-shrink: 0 !important;
              display: inline-block !important;
            }
            
            /* Button flex content - replicate working flex design */
            button[class*="flex"][class*="items-center"][class*="justify-center"][class*="gap-2"] {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 6px !important; /* reduce from 8px to 6px for mobile */
              flex-wrap: wrap !important;
              max-width: calc(100% - 16px) !important;
              margin: 0 auto !important;
              box-sizing: border-box !important;
            }
          }
          }
          }
          }
        `,
        }}
      />
      <div
        className="min-h-screen mobile-container"
        style={{
          background: "var(--bg-primary)",
          maxWidth: "calc(100vw - 8px)",
          width: "calc(100vw - 8px)",
          overflowX: "hidden",
          margin: "0 auto",
          padding: "0 4px",
          boxSizing: "border-box",
        }}
      >
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
            <div
              className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 mobile-container"
              style={{
                maxWidth: "calc(100vw - 16px)",
                overflowX: "hidden",
                margin: "0 auto",
                boxSizing: "border-box",
              }}
            >
              {/* Breadcrumb Navigation */}
              <motion.div
                className="mb-6 sm:mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  maxWidth: "calc(100vw - 32px)",
                  overflowX: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 group text-sm sm:text-base mobile-text mobile-text-force"
                  style={{
                    maxWidth: "calc(100% - 8px)",
                    overflowX: "hidden",
                    wordWrap: "break-word",
                    boxSizing: "border-box",
                  }}
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span
                    className="font-medium mobile-text mobile-text-force"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      maxWidth: "calc(100% - 24px)",
                    }}
                  >
                    Back to Opportunities
                  </span>
                </Link>
              </motion.div>

              <div
                className="grid grid-cols-1 xl:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 xl:gap-8 mobile-container"
                style={{
                  maxWidth: "calc(100vw - 32px)",
                  overflowX: "hidden",
                  margin: "0 auto",
                  boxSizing: "border-box",
                }}
              >
                {/* Main Hero Content */}
                <div className="xl:col-span-2 min-w-0">
                  {/* Status Badges */}
                  <motion.div
                    className="flex flex-wrap gap-2 mb-3 sm:mb-4 lg:mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {scholarship.type && (
                      <div
                        className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                          scholarship.type === "International"
                            ? "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                            : scholarship.type === "Local"
                            ? "bg-green-500/20 text-green-200 border border-green-400/30"
                            : "bg-purple-500/20 text-purple-200 border border-purple-400/30"
                        }`}
                      >
                        <Globe className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate min-w-0">
                          {scholarship.type}
                        </span>
                      </div>
                    )}
                    {isUrgent && !isExpired && !isUndisclosed && (
                      <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-red-500/20 text-red-200 border border-red-400/30 text-xs font-semibold animate-pulse flex-shrink-0">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate min-w-0">
                          Urgent - {daysRemaining} days left
                        </span>
                      </div>
                    )}
                    {isUndisclosed && (
                      <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold flex-shrink-0">
                        <CheckCircle className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate min-w-0">
                          Open Application
                        </span>
                      </div>
                    )}
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    className="text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 leading-tight break-words mobile-title mobile-text-force"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{
                      maxWidth: "calc(100vw - 64px)",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      hyphens: "auto",
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent break-words text-overflow-mobile mobile-text-force"
                      style={{
                        wordBreak: "break-all",
                        overflowWrap: "anywhere",
                        maxWidth: "calc(100vw - 64px)",
                        display: "block",
                        boxSizing: "border-box",
                      }}
                    >
                      {scholarship.title}
                    </span>
                  </motion.h1>

                  {/* Provider */}
                  {scholarship.provider && (
                    <motion.div
                      className="inline-flex items-start gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 sm:mb-6 max-w-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <University className="h-4 w-4 text-blue-300 flex-shrink-0 mt-0.5" />
                      <span className="text-white font-medium text-sm break-words leading-tight min-w-0">
                        Offered by{" "}
                        <span className="font-bold text-blue-200">
                          {scholarship.provider}
                        </span>
                      </span>
                    </motion.div>
                  )}

                  {/* Quick Stats */}
                  <motion.div
                    className="grid grid-cols-1 gap-2 mb-3 sm:mb-4 mobile-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl mobile-card">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 mb-1 flex-shrink-0" />
                      <div className="text-xs text-gray-300 mb-1 mobile-text">
                        Value
                      </div>
                      <div className="text-xs font-bold text-white break-words leading-tight overflow-hidden text-overflow-mobile mobile-text-force">
                        {scholarship.amount}
                      </div>
                    </div>
                    {scholarship.level && (
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl mobile-card">
                        <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 mb-1 flex-shrink-0" />
                        <div className="text-xs text-gray-300 mb-1 mobile-text">
                          Level
                        </div>
                        <div className="text-xs font-bold text-white break-words leading-tight overflow-hidden text-overflow-mobile mobile-text-force">
                          {scholarship.level}
                        </div>
                      </div>
                    )}
                    {scholarship.location && (
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl mobile-card">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400 mb-1 flex-shrink-0" />
                        <div className="text-xs text-gray-300 mb-1 mobile-text">
                          Location
                        </div>
                        <div className="text-xs font-bold text-white break-words leading-tight overflow-hidden text-overflow-mobile mobile-text-force">
                          {scholarship.location}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Action Card */}
                <motion.div
                  className="xl:col-span-1 w-full"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className="xl:sticky xl:top-24 w-full mobile-container">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-lg sm:rounded-xl mobile-card shadow-2xl w-full">
                      <div className="text-center mb-2 sm:mb-3">
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 mb-1 sm:mb-2 flex-shrink-0">
                          <Award className="h-2 w-2 sm:h-3 sm:w-3 text-green-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-green-300 whitespace-nowrap mobile-text">
                            Scholarship
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white mb-1 break-words mobile-text mobile-text-force">
                          Ready to Apply?
                        </h3>
                        <p className="text-xs text-gray-300 break-words leading-tight hidden sm:block mobile-text-force">
                          Take the next step towards your academic future
                        </p>
                      </div>

                      {/* Application Deadline */}
                      <div className="bg-white/5 rounded-lg mobile-card mb-2 sm:mb-3">
                        <div className="flex items-start gap-1 sm:gap-2">
                          <Calendar
                            className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5 ${
                              isUndisclosed
                                ? "text-gray-400"
                                : isUrgent
                                ? "text-red-400"
                                : "text-blue-400"
                            }`}
                          />
                          <div className="min-w-0 flex-1 mobile-text-force">
                            <div className="text-xs text-gray-400 mb-1 mobile-text">
                              Deadline
                            </div>
                            <div
                              className={`font-semibold text-xs break-words leading-tight text-overflow-mobile mobile-text-force ${
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
                        <div className="text-center mobile-card bg-red-500/10 border border-red-400/30 rounded-lg mobile-text-force">
                          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 mx-auto mb-1 flex-shrink-0" />
                          <div className="text-xs font-medium text-red-300 mb-1 break-words leading-tight mobile-text mobile-text-force">
                            Closed
                          </div>
                          <div className="text-xs text-red-400 break-words leading-tight hidden sm:block mobile-text-force">
                            No longer accepting applications
                          </div>
                        </div>
                      ) : (
                        <motion.button
                          onClick={handleApplyClick}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold mobile-button rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-1 text-overflow-mobile mobile-text-force"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          <span className="break-words text-center leading-tight text-overflow-mobile mobile-text mobile-text-force">
                            {scholarship.applicationUrl
                              ? "Apply Now"
                              : "View Details"}
                          </span>
                        </motion.button>
                      )}

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

        </motion.div>

        {/* About Section */}
        <motion.div
          className="relative bg-white mobile-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{
            maxWidth: "calc(100vw - 8px)",
            overflowX: "hidden",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          <div
            className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 mobile-container"
            style={{
              maxWidth: "calc(100vw - 32px)",
              overflowX: "hidden",
              margin: "0 auto",
              boxSizing: "border-box",
            }}
          >
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mobile-container"
              style={{
                maxWidth: "calc(100vw - 48px)",
                overflowX: "hidden",
                boxSizing: "border-box",
              }}
            >
              <div
                className="lg:col-span-2 min-w-0 mobile-container"
                style={{
                  maxWidth: "calc(100% - 16px)",
                  overflowX: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <h2
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 break-words mobile-text-force"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    maxWidth: "calc(100vw - 64px)",
                    boxSizing: "border-box",
                  }}
                >
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0 mt-1" />
                  <span
                    className="break-words leading-tight min-w-0 mobile-text-force"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      maxWidth: "calc(100% - 32px)",
                    }}
                  >
                    About This Scholarship
                  </span>
                </h2>
                <div
                  className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 mobile-card"
                  style={{
                    maxWidth: "calc(100% - 8px)",
                    overflowX: "hidden",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    className="text-gray-700 leading-relaxed text-sm sm:text-base break-words mobile-text-force"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      maxWidth: "calc(100vw - 80px)",
                      boxSizing: "border-box",
                    }}
                  >
                    {formatRichContent(scholarship.description)}
                  </div>
                </div>
              </div>

              {/* Additional Info Card */}
              <div
                className="lg:col-span-1 min-w-0 mobile-container"
                style={{
                  maxWidth: "calc(100% - 16px)",
                  overflowX: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200 mobile-card"
                  style={{
                    maxWidth: "calc(100% - 8px)",
                    overflowX: "hidden",
                    boxSizing: "border-box",
                  }}
                >
                  <h3
                    className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-start gap-2 break-words mobile-text-force"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      maxWidth: "calc(100vw - 64px)",
                      boxSizing: "border-box",
                    }}
                  >
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span
                      className="break-words leading-tight min-w-0 mobile-text-force"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        maxWidth: "calc(100% - 24px)",
                      }}
                    >
                      Key Details
                    </span>
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {scholarship.fieldOfStudy && (
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1 mobile-container">
                          <div className="text-xs sm:text-sm text-gray-600 mb-1 mobile-text">
                            Field of Study
                          </div>
                          <div className="font-semibold text-gray-900 text-sm sm:text-base break-words leading-tight mobile-text-force">
                            {scholarship.fieldOfStudy}
                          </div>

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

        </motion.div>

        {/* Eligibility and Requirements Section */}
        <motion.div
          className="bg-gradient-to-br from-gray-50 to-blue-50/50 mobile-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          style={{
            maxWidth: "calc(100vw - 8px)",
            overflowX: "hidden",
            margin: "0 auto",

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

            className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 mobile-container"
            style={{
              maxWidth: "calc(100vw - 32px)",
              overflowX: "hidden",
              margin: "0 auto",
              boxSizing: "border-box",
            }}
          >
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mobile-container"
              style={{
                maxWidth: "calc(100vw - 48px)",
                overflowX: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* Eligibility Criteria */}
              {scholarship.eligibility && (
                <motion.div
                  className="min-w-0 mobile-container"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  style={{
                    maxWidth: "calc(100% - 16px)",
                    overflowX: "hidden",
                    boxSizing: "border-box",
                  }}
                >
                  <h2
                    className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 break-words mobile-text-force"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      maxWidth: "calc(100vw - 64px)",
                      boxSizing: "border-box",
                    }}
                  >
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0 mt-1" />
                    <span className="break-words leading-tight min-w-0 mobile-text-force">
                      Eligibility Criteria
                    </span>
                  </h2>
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-200 shadow-lg mobile-card">
                    <div className="space-y-3 sm:space-y-4">
                      {scholarship.eligibility.map(
                        (criteria: string, index: number) =>
                          renderNumberedListItem(criteria, index, "purple")
                      )}
                    </div>

                  </div>
                </div>
              )}


              {/* Application Requirements */}
              {scholarship.requirements &&
                scholarship.requirements.length > 0 && (
                  <motion.div
                    className="min-w-0 mobile-container"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 break-words mobile-text-force">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0 mt-1" />
                      <span className="break-words leading-tight min-w-0 mobile-text-force">
                        Application Requirements
                      </span>
                    </h2>
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-green-200 shadow-lg mobile-card">
                      <div className="space-y-3 sm:space-y-4">
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
        </div>
      </motion.div>
    </div>
  );
}
