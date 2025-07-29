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
        className={compact ? "flex gap-3" : "space-y-4"}
      >
        <div className={compact ? "flex-1" : "flex-1"}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border-0 focus:ring-2 focus:outline-none text-sm rounded-lg transition-all focus:ring-opacity-50 ${
              compact ? "rounded-lg" : "rounded-lg"
            } ${inputClassName}`}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className={`px-6 py-3 font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
            compact
              ? "whitespace-nowrap rounded-lg"
              : "w-full sm:w-auto rounded-lg"
          } ${
            buttonClassName || "btn btn-primary"
          } flex items-center justify-center gap-2`}
        >
          {isSubmitting ? (
            <>
              <div
                className="animate-spin rounded-full h-4 w-4 border-b-2"
                style={{ borderColor: "currentColor" }}
              ></div>
              <span className="hidden sm:inline">Subscribing...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              {buttonText}
            </>
          )}
        </button>
      </form>

      {/* Professional Message Display */}
      {message && (
        <div
          className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm shadow-sm ${
            message.type === "success" ? "border" : "border"
          }`}
          style={{
            background:
              message.type === "success"
                ? "rgba(var(--success-rgb), 0.1)"
                : "rgba(var(--error-rgb), 0.1)",
            border:
              message.type === "success"
                ? "1px solid var(--success)"
                : "1px solid var(--error)",
            color:
              message.type === "success" ? "var(--success)" : "var(--error)",
          }}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
