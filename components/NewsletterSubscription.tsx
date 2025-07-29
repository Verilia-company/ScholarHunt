"use client";

import React, { useState } from "react";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
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
  buttonText = "Subscribe Now",
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

  if (compact) {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white font-medium disabled:opacity-50"
              disabled={isSubmitting}
            />
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <motion.button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Subscribing...</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                {buttonText}
              </>
            )}
          </motion.button>
        </form>

        {/* Message Display */}
        {message && (
          <motion.div
            className={`mt-3 p-3 rounded-xl flex items-center gap-2 text-sm shadow-sm border ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
            )}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </div>
    );
  }

  // Full newsletter component
  return (
    <motion.div
      className={`max-w-4xl mx-auto ${className}`}
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Card Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-8 border-b border-gray-100">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              Join Our Newsletter
            </h3>
          </div>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">
            Get exclusive scholarship opportunities and expert tips delivered
            straight to your inbox.
          </p>
        </div>

        {/* Newsletter Form */}
        <div className="px-8 py-12">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Email Input with Icon */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  disabled={isSubmitting}
                  className="w-full pl-16 pr-6 py-6 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Subscribe Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="lg:w-auto w-full px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    {buttonText}
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Status Message */}
            {message && (
              <motion.div
                className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">{message.text}</span>
              </motion.div>
            )}
          </form>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium">5,000+ Active Subscribers</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium">No Spam, Unsubscribe Anytime</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium">Weekly Updates</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
