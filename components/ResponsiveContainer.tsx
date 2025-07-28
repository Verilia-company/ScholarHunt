"use client";

import React from "react";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
}

/**
 * ResponsiveContainer - A utility component for consistent responsive design
 * Ensures proper content width and padding across all screen sizes
 */
export default function ResponsiveContainer({
  children,
  className = "",
  fullWidth = false,
  noPadding = false,
}: ResponsiveContainerProps) {
  const baseClasses = fullWidth
    ? "w-full max-w-full"
    : "w-full max-w-7xl mx-auto";

  const paddingClasses = noPadding ? "" : "px-4 sm:px-6 lg:px-8";

  return (
    <div className={`${baseClasses} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
}

/**
 * PageWrapper - Wrapper for entire page content
 * Ensures proper minimum height and responsive behavior
 */
export function PageWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${className}`}>
      {children}
    </div>
  );
}

/**
 * ContentSection - For main content sections with proper spacing
 */
export function ContentSection({
  children,
  className = "",
  spacing = "default",
}: {
  children: React.ReactNode;
  className?: string;
  spacing?: "none" | "sm" | "default" | "lg" | "xl";
}) {
  const spacingClasses = {
    none: "",
    sm: "py-4 sm:py-6",
    default: "py-8 sm:py-12",
    lg: "py-12 sm:py-16",
    xl: "py-16 sm:py-20",
  };

  return (
    <section className={`w-full ${spacingClasses[spacing]} ${className}`}>
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </section>
  );
}

/**
 * GridContainer - Responsive grid container
 */
export function GridContainer({
  children,
  columns = "auto",
  gap = "default",
  className = "",
}: {
  children: React.ReactNode;
  columns?: "auto" | 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "none" | "sm" | "default" | "lg";
  className?: string;
}) {
  const columnClasses = {
    auto: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    12: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-12",
  };

  const gapClasses = {
    none: "gap-0",
    sm: "gap-4",
    default: "gap-6 lg:gap-8",
    lg: "gap-8 lg:gap-12",
  };

  return (
    <div
      className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}
    >
      {children}
    </div>
  );
}
