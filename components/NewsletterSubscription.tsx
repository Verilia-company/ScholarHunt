"use client";

import React, { useState } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { newsletterService } from "@/lib/firebase/services";

interface NewsletterSubscriptionProps {
  placeholder?: string;
  buttonText?: string;
  source?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  compact?: boolean;
}

export default function NewsletterSubscription({
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  source = "website",
  className = "",
  inputClassName = "",
  buttonClassName = "",
  compact = false,
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await newsletterService.subscribe(email, source);
      setMessage({
        type: "success",
        text: "Successfully subscribed! You'll receive our latest scholarship updates.",
      });
      setEmail("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (errorMessage === "Email already subscribed") {
        setMessage({
          type: "error",
          text: "This email is already subscribed to our newsletter.",
        });
      } else {
        setMessage({
          type: "error",
          text: "Failed to subscribe. Please try again later.",
        });
      }
      console.error("Newsletter subscription error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        className={compact ? "flex gap-2" : "space-y-3 sm:space-y-4"}
      >
        <div className={compact ? "flex-1" : "flex-1"}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            spellCheck="false"
            autoComplete="email"
            className={`input-google ${compact ? "" : ""} ${inputClassName}`}
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium text-sm sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            compact
              ? "whitespace-nowrap rounded-lg"
              : "w-full sm:w-auto rounded-lg"
          } ${
            buttonClassName || "btn-accent"
          } flex items-center justify-center gap-1.5 sm:gap-2`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
              <span className="hidden sm:inline">Subscribing...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
              {buttonText}
            </>
          )}
        </button>
      </form>

      {/* Message Display */}
      {message && (
        <div
          className={`mt-2 sm:mt-3 p-2.5 sm:p-3 rounded-lg flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
