import React from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  DollarSign,
  GraduationCap,
  Clock,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { Scholarship } from "@/lib/firebase/services";
import { trackEvents } from "@/lib/analytics";

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  // Handle click tracking for scholarship card clicks
  const handleCardClick = () => {
    trackEvents.scholarshipCardClick({
      scholarshipId: scholarship.id,
      scholarshipTitle: scholarship.title,
      scholarshipProvider: scholarship.provider || "Unknown",
      scholarshipType: scholarship.type || "Unknown",
      scholarshipAmount: scholarship.amount,
      daysRemaining: getDaysRemaining(scholarship.deadline),
    });
  };

  // Format deadline
  const formatDeadline = (dateString: string) => {
    if (dateString === "Undisclosed" || !dateString) {
      return "Undisclosed";
    }
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
    <motion.article
      className="group h-full"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        className="card-glass h-full flex flex-col overflow-hidden group-hover:border-opacity-50 transition-all duration-500"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-primary)",
          padding: "12px", // Increased outer spacing for more breathing room from main box
        }}
      >
        {/* Inner container to prevent content touching borders */}
        <div className="h-full flex flex-col bg-transparent rounded-lg overflow-hidden m-2">
          {/* Header Section with Badges */}
          <div className="p-6 pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 flex-wrap">
                {scholarship.type && (
                  <span
                    className={`badge ${
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
                  <span className="badge badge-error animate-pulse">
                    <Clock className="w-3 h-3" />
                    Urgent
                  </span>
                )}
                {isExpired && !isUndisclosed && (
                  <span
                    className="badge"
                    style={{
                      background: "var(--bg-glass)",
                      color: "var(--text-tertiary)",
                      border: "1px solid var(--border-primary)",
                    }}
                  >
                    Expired
                  </span>
                )}
                {isUndisclosed && (
                  <span className="badge badge-warning">Open Application</span>
                )}
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-title font-bold mb-3 group-hover:text-gradient transition-all duration-300 line-clamp-2 leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {scholarship.title}
            </h3>

            {/* Provider */}
            {scholarship.provider && (
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--brand-primary)" }}
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {scholarship.provider}
                </p>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="px-6 pb-6 flex-grow flex flex-col">
            {/* Description */}
            <p
              className="text-body line-clamp-3 leading-relaxed mb-6 flex-grow"
              style={{ color: "var(--text-secondary)" }}
            >
              {scholarship.description}
            </p>

            {/* Information Grid - Clean Layout with consistent structure */}
            <div className="space-y-5 mb-6">
              {/* Scholarship Value - Always show */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-transparent hover:bg-opacity-50 transition-colors">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ background: "var(--brand-accent)" }}
                >
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-micro uppercase tracking-wider font-semibold mb-1"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Scholarship Value
                  </p>
                  <p
                    className="font-medium text-sm leading-relaxed"
                    style={{ color: "var(--brand-accent)" }}
                  >
                    {scholarship.amount}
                  </p>
                </div>
              </div>

              {/* Application Deadline - Always show */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-transparent hover:bg-opacity-50 transition-colors">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{
                    background: isUndisclosed
                      ? "var(--text-quaternary)"
                      : isUrgent
                      ? "var(--brand-error)"
                      : "var(--brand-primary)",
                  }}
                >
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-micro uppercase tracking-wider font-semibold mb-1"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Application Deadline
                  </p>
                  <p
                    className="font-medium text-sm leading-relaxed"
                    style={{
                      color: isUndisclosed
                        ? "var(--text-secondary)"
                        : isUrgent
                        ? "var(--brand-error)"
                        : "var(--text-primary)",
                    }}
                  >
                    {formatDeadline(scholarship.deadline)}
                    {!isExpired && !isUndisclosed && daysRemaining && (
                      <span
                        className="block text-xs font-normal mt-1"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {daysRemaining} days remaining
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Education Level - Always show with fallback */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-transparent hover:bg-opacity-50 transition-colors">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ background: "var(--brand-secondary)" }}
                >
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-micro uppercase tracking-wider font-semibold mb-1"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Education Level
                  </p>
                  <p
                    className="font-medium text-sm leading-relaxed"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {scholarship.level || "All Levels"}
                  </p>
                </div>
              </div>

              {/* Study Location - Always show with fallback */}
              {scholarship.location && (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-transparent hover:bg-opacity-50 transition-colors">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{ background: "var(--brand-primary)" }}
                  >
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-micro uppercase tracking-wider font-semibold mb-1"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Study Location
                    </p>
                    <p
                      className="font-medium text-sm leading-relaxed"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {scholarship.location}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <motion.div
              className="mt-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={`/scholarships/${scholarship.id}`}
                onClick={handleCardClick}
                className={`btn btn-primary w-full group/btn ${
                  isExpired && !isUndisclosed
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                style={{
                  ...(isExpired && !isUndisclosed
                    ? {
                        background: "var(--bg-glass)",
                        color: "var(--text-tertiary)",
                        border: "1px solid var(--border-primary)",
                      }
                    : {}),
                }}
              >
                {isExpired && !isUndisclosed ? (
                  "Application Closed"
                ) : (
                  <>
                    View Details
                    <ExternalLink className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </Link>
            </motion.div>
          </div>
        </div>{" "}
        {/* Close inner container */}
      </div>
    </motion.article>
  );
}
