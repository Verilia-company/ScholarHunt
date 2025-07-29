"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Don't render the toggle until the theme is mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div
        className={`h-8 w-16 bg-gray-300 rounded-full animate-pulse ${className}`}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-12 h-6 rounded-full transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${
          theme === "dark"
            ? "bg-blue-600 shadow-lg shadow-blue-500/25"
            : "bg-gray-300 shadow-inner"
        }
        ${className}
      `}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Toggle Background */}
      <div
        className={`
          absolute inset-0 rounded-full transition-all duration-300
          ${
            theme === "dark"
              ? "bg-gradient-to-r from-blue-500 to-blue-600"
              : "bg-gradient-to-r from-gray-200 to-gray-300"
          }
        `}
      />

      {/* Toggle Slider */}
      <div
        className={`
          relative flex items-center justify-center
          w-5 h-5 rounded-full transition-all duration-300 ease-in-out
          transform shadow-md
          ${
            theme === "dark"
              ? "translate-x-3 bg-white"
              : "-translate-x-3 bg-white"
          }
        `}
      >
        {/* Icon */}
        {theme === "dark" ? (
          <Moon className="w-3 h-3 text-blue-600" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </div>

      {/* Optional Label */}
      {showLabel && (
        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === "light" ? "Light" : "Dark"}
        </span>
      )}

      {/* Glow Effect for Dark Mode */}
      {theme === "dark" && (
        <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 blur-sm animate-pulse" />
      )}
    </button>
  );
}
