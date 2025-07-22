"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

// Form validation schema
const scholarshipSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(1000, "Description must not exceed 1000 characters"),
  provider: z.string().min(2, "Provider name is required"),
  amount: z.string().min(1, "Scholarship amount is required"),
  deadline: z.string().min(1, "Application deadline is required"),
  level: z
    .array(z.string())
    .min(1, "Please select at least one education level"),
  field: z.string().min(2, "Field of study is required"),
  location: z.string().min(2, "Location is required"),
  type: z.string().min(1, "Please select scholarship type"),
  eligibility: z
    .string()
    .min(20, "Eligibility criteria must be at least 20 characters"),
  applicationUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  contactEmail: z.string().email("Please enter a valid email address"),
  submitterName: z.string().min(2, "Your name is required"),
  submitterEmail: z.string().email("Please enter a valid email address"),
  submitterOrganization: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type ScholarshipFormData = z.infer<typeof scholarshipSchema>;

const educationLevels = [
  "Undergraduate",
  "Graduate",
  "Post Graduate",
  "PhD",
  "Certificate",
  "Diploma",
  "High School",
];

const scholarshipTypes = [
  { value: "International", label: "International" },
  { value: "Local", label: "Local (Uganda)" },
  { value: "Regional", label: "Regional (Africa)" },
];

export default function SubmitPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScholarshipFormData>({
    resolver: zodResolver(scholarshipSchema),
    defaultValues: {
      level: [],
    },
  });

  const watchedLevel = watch("level");

  const handleLevelChange = (level: string) => {
    const currentLevels = watchedLevel || [];
    if (currentLevels.includes(level)) {
      setValue(
        "level",
        currentLevels.filter((l) => l !== level)
      );
    } else {
      setValue("level", [...currentLevels, level]);
    }
  };

  const onSubmit = async (data: ScholarshipFormData) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Scholarship submission:", data);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4">
        <div className="max-w-sm sm:max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              Submission Successful!
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
              Thank you for submitting a scholarship opportunity. Our team will
              review your submission and contact you within 2-3 business days.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                window.location.reload();
              }}
              className="btn-primary w-full text-sm sm:text-base py-2.5 sm:py-3"
            >
              Submit Another Scholarship
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              Submit a Scholarship Opportunity
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-3 sm:px-0 leading-relaxed">
              Help other students discover scholarship opportunities by sharing
              information about scholarships you know about. All submissions are
              reviewed before publication.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {" "}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 sm:space-y-8"
        >
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Title */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Scholarship Title *
                </label>
                <input
                  type="text"
                  {...register("title")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Mastercard Foundation Scholars Program"
                />
                {errors.title && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Provider */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Provider/Organization *
                </label>
                <input
                  type="text"
                  {...register("provider")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.provider ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Mastercard Foundation"
                />
                {errors.provider && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.provider.message}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Scholarship Amount *
                </label>
                <input
                  type="text"
                  {...register("amount")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Full tuition + living expenses"
                />
                {errors.amount && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Application Deadline *
                </label>
                <input
                  type="date"
                  {...register("deadline")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.deadline ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.deadline && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.deadline.message}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Scholarship Type *
                </label>
                <select
                  {...register("type")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.type ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select type</option>
                  {scholarshipTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 sm:mt-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Description *
              </label>
              <textarea
                {...register("description")}
                rows={6}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Provide a detailed description of the scholarship, its purpose, and what it covers..."
                style={{ minHeight: "150px" }}
              />
              {errors.description && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>{" "}
          {/* Eligibility & Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Eligibility & Requirements
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Education Level */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Education Level *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {educationLevels.map((level) => (
                    <label
                      key={level}
                      className="flex items-center gap-2 cursor-pointer p-1"
                    >
                      <input
                        type="checkbox"
                        checked={watchedLevel?.includes(level) || false}
                        onChange={() => handleLevelChange(level)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.level && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.level.message}
                  </p>
                )}
              </div>

              {/* Field of Study */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Field of Study *
                </label>
                <input
                  type="text"
                  {...register("field")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.field ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., All fields, Engineering, Medicine, etc."
                />
                {errors.field && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.field.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Study Location *
                </label>
                <input
                  type="text"
                  {...register("location")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Uganda, United States, Global, etc."
                />
                {errors.location && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="mt-4 sm:mt-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Eligibility Criteria *
              </label>
              <textarea
                {...register("eligibility")}
                rows={6}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                  errors.eligibility ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe who is eligible to apply, academic requirements, nationality restrictions, etc..."
                style={{ minHeight: "150px" }}
              />
              {errors.eligibility && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  {errors.eligibility.message}
                </p>
              )}
            </div>
          </div>{" "}
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Application & Contact Details
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Application URL */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Application URL (Optional)
                </label>
                <input
                  type="url"
                  {...register("applicationUrl")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.applicationUrl ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="https://example.com/apply"
                />
                {errors.applicationUrl && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.applicationUrl.message}
                  </p>
                )}
              </div>

              {/* Contact Email */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  {...register("contactEmail")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.contactEmail ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="scholarship@example.com"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>
            </div>
          </div>{" "}
          {/* Submitter Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Your Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Submitter Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  {...register("submitterName")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.submitterName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                />
                {errors.submitterName && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.submitterName.message}
                  </p>
                )}
              </div>

              {/* Submitter Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  {...register("submitterEmail")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.submitterEmail ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="john@example.com"
                />
                {errors.submitterEmail && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.submitterEmail.message}
                  </p>
                )}
              </div>

              {/* Organization */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Organization (Optional)
                </label>
                <input
                  type="text"
                  {...register("submitterOrganization")}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Your school, organization, or company"
                />
              </div>

              {/* Additional Notes */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  {...register("additionalNotes")}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Any additional information or special instructions..."
                  style={{ minHeight: "120px" }}
                />
              </div>
            </div>
          </div>{" "}
          {/* Submit Button */}
          <div className="flex justify-center px-2 sm:px-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-sm sm:text-base lg:text-lg px-8 sm:px-10 lg:px-12 py-3 sm:py-3.5 lg:py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  <span className="text-sm sm:text-base lg:text-lg">
                    Submitting...
                  </span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base lg:text-lg">
                    Submit Scholarship
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
