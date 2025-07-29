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
      return Infinity; // Return infinity for undisclosed deadlines
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
    <motion.div
      className="group h-full"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        className="card-glass h-full flex flex-col overflow-hidden group-hover:border-opacity-50 transition-all duration-500"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-primary)",
        }}
      >
        {/* Clean Header */}
        <div className="relative p-6 pb-4">
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2 flex-wrap">
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

            {/* Title and Provider */}
            <div className="mb-6">
              <h3
                className="text-title font-bold mb-3 group-hover:text-gradient transition-all duration-300 line-clamp-2 leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {scholarship.title}
              </h3>
              {scholarship.provider && (
                <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 flex-grow flex flex-col">
          <p
            className="text-body line-clamp-3 leading-relaxed mb-8 flex-grow"
            style={{ color: "var(--text-secondary)" }}
          >
            {scholarship.description}
          </p>

          {/* Premium Information Grid */}
          <div className="space-y-4 mb-8">
            {/* Amount */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "var(--brand-accent)" }}
              >
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p
                  className="text-micro uppercase tracking-wider font-semibold mb-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Scholarship Value
                </p>
                <p
                  className="font-bold text-lg"
                  style={{ color: "var(--brand-accent)" }}
                >
                  {scholarship.amount}
                </p>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: isUndisclosed
                    ? "var(--text-quaternary)"
                    : isUrgent
                    ? "var(--brand-error)"
                    : "var(--brand-primary)",
                }}
              >
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p
                  className="text-micro uppercase tracking-wider font-semibold mb-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Application Deadline
                </p>
                <p
                  className={`font-bold text-lg ${
                    isUndisclosed ? "" : isUrgent ? "" : ""
                  }`}
                  style={{
                    color: isUndisclosed
                      ? "var(--text-secondary)"
                      : isUrgent
                      ? "var(--brand-error)"
                      : "var(--text-primary)",
                  }}
                >
                  {formatDeadline(scholarship.deadline)}
                  {!isExpired && !isUndisclosed && (
                    <span
                      className="block text-sm font-normal mt-1"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {daysRemaining} days remaining
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Level and Location */}
            {(scholarship.level || scholarship.location) && (
              <div className="grid grid-cols-1 gap-4">
                {scholarship.level && (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ background: "var(--brand-secondary)" }}
                    >
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-micro uppercase tracking-wider font-semibold mb-1"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Education Level
                      </p>
                      <p
                        className="font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {scholarship.level}
                      </p>
                    </div>
                  </div>
                )}
                {scholarship.location && (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ background: "var(--brand-primary)" }}
                    >
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-micro uppercase tracking-wider font-semibold mb-1"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Study Location
                      </p>
                      <p
                        className="font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {scholarship.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Premium Action Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-auto"
          >
            <Link
              href={`/scholarships/${scholarship.id}`}
              onClick={handleCardClick}
              className={`group/btn flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                isExpired && !isUndisclosed
                  ? "cursor-not-allowed opacity-50"
                  : "btn btn-primary"
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
      </div>
    </motion.div>
  );
}
