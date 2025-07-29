"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import ScholarshipCard from "@/components/ScholarshipCard";
import { trackEvents } from "@/lib/analytics";
import { scholarshipService, Scholarship } from "@/lib/firebase/services";

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("deadline"); // deadline, amount, alphabetical
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 12;

  // Fetch scholarships from Firebase
  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setLoading(true);
        const data = await scholarshipService.getActiveScholarships();
        setScholarships(data);
      } catch (err) {
        console.error("Error fetching scholarships:", err);
        setError("Failed to load scholarships");
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  // Initialize search term from URL parameters
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  // Get unique values for filters
  const types = [
    "All",
    ...new Set(scholarships.map((s) => s.type).filter(Boolean)),
  ];
  const levels = [
    "All",
    ...new Set(
      scholarships.flatMap((s) => s.level?.split(", ") || []).filter(Boolean)
    ),
  ];
  const locations = [
    "All",
    ...new Set(scholarships.map((s) => s.location).filter(Boolean)),
  ]; // Filter and sort scholarships
  const filteredScholarships = useMemo(() => {
    let filtered = scholarships;

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      filtered = scholarships.filter((scholarship) => {
        const searchableText = [
          scholarship.title,
          scholarship.description,
          scholarship.provider || "",
          scholarship.location || "",
          scholarship.fieldOfStudy,
          scholarship.level,
          scholarship.type || "",
          ...(scholarship.eligibility || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchTerm.toLowerCase());
      });
    }

    // Apply manual filters
    filtered = filtered.filter((scholarship) => {
      const matchesType =
        selectedType === "All" || scholarship.type === selectedType;
      const matchesLevel =
        selectedLevel === "All" || scholarship.level?.includes(selectedLevel);
      const matchesLocation =
        selectedLocation === "All" || scholarship.location === selectedLocation;

      return matchesType && matchesLevel && matchesLocation;
    }); // Sort scholarships
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "amount":
          // Simple amount sorting (you might want to improve this)
          return a.amount.localeCompare(b.amount);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    scholarships,
    searchTerm,
    selectedType,
    selectedLevel,
    selectedLocation,
    sortBy,
  ]);

  // Track search results when filteredScholarships changes
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery && filteredScholarships.length >= 0) {
      trackEvents.searchPerformed({
        searchTerm: searchQuery,
        resultsCount: filteredScholarships.length,
        searchType: "scholarship",
        source: "opportunities",
      });
    }
  }, [searchParams, filteredScholarships.length]);

  // Pagination
  const totalPages = Math.ceil(filteredScholarships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentScholarships = filteredScholarships.slice(startIndex, endIndex);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedType("All");
    setSelectedLevel("All");
    setSelectedLocation("All");
    setCurrentPage(1);
  };

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
            Loading scholarship opportunities...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-3 sm:px-4"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center max-w-md">
          <h1
            className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Unable to Load Scholarships
          </h1>
          <p
            className="text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {error}. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary w-full sm:w-auto text-sm sm:text-base py-2.5 sm:py-3"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Clean Header */}
      <div
        className="relative overflow-hidden py-20"
        style={{ background: "var(--brand-primary)" }}
      >
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 mb-8"
            style={{ background: "rgba(255, 255, 255, 0.1)" }}
          >
            <Search className="w-5 h-5 text-white" />
            <span className="font-medium text-white">Discover Your Future</span>
          </div>

          <h1 className="text-display mb-6 text-white">
            Scholarship
            <br />
            <span className="text-white opacity-90">Opportunities</span>
          </h1>

          <p className="text-subtitle max-w-4xl mx-auto text-white opacity-80">
            Discover scholarship opportunities that match your academic goals
            and background. Use our advanced filters to find the perfect
            scholarships for you.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Revolutionary Search and Filters */}
        <div className="card-glass p-8 mb-12">
          {/* Clean Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <div
                className="glass-strong rounded-2xl p-2 border"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <div className="flex items-center">
                  <div className="flex items-center pl-6">
                    <Search
                      className="h-6 w-6 transition-colors duration-300"
                      style={{
                        color: searchTerm
                          ? "var(--brand-primary)"
                          : "var(--text-tertiary)",
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    spellCheck="false"
                    autoComplete="off"
                    className="input-google-search flex-1"
                    style={{
                      color: "var(--text-primary)",
                    }}
                    placeholder="Search scholarships, universities, or study fields..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Header Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="glass-strong rounded-xl px-6 py-3 flex items-center gap-3 hover:bg-opacity-80 transition-all duration-300 focus-ring group"
                style={{ color: "var(--text-primary)" }}
              >
                <Filter className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </span>
              </button>
              <div className="glass rounded-lg px-4 py-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {filteredScholarships.length} opportunities found
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="glass rounded-lg px-4 py-2 text-sm focus-ring border-0 font-medium"
                  style={{
                    color: "var(--text-primary)",
                    background: "var(--bg-glass)",
                  }}
                >
                  <option value="deadline">Deadline</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="amount">Amount</option>
                </select>
              </div>
              <button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="glass rounded-lg p-2 hover:bg-opacity-80 transition-all duration-200 focus-ring"
                style={{ color: "var(--text-secondary)" }}
              >
                {viewMode === "grid" ? (
                  <List className="w-5 h-5" />
                ) : (
                  <Grid className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Filters Section */}
          <div className={`${showFilters ? "block" : "hidden"} mb-8`}>
            <div className="card-glass p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Type Filter */}
                <div>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Scholarship Type
                  </label>
                  <div className="space-y-2">
                    {types.map((type) => (
                      <div key={type} className="flex items-center">
                        <input
                          type="radio"
                          id={`type-${type}`}
                          name="type"
                          value={type}
                          checked={selectedType === type}
                          onChange={() => setSelectedType(type ?? "All")}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        <label
                          htmlFor={`type-${type}`}
                          className="ml-2 text-sm cursor-pointer"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Education Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="glass w-full rounded-lg px-4 py-2 text-sm focus-ring border-0"
                    style={{
                      color: "var(--text-secondary)",
                      background: "var(--bg-glass)",
                    }}
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="glass w-full rounded-lg px-4 py-2 text-sm focus-ring border-0"
                    style={{
                      color: "var(--text-secondary)",
                      background: "var(--bg-glass)",
                    }}
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end mt-8 gap-4">
                <button
                  onClick={resetFilters}
                  className="glass rounded-lg px-4 py-2 hover:bg-opacity-80 transition-all duration-200 focus-ring text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="btn btn-primary"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scholarship Results */}
        <div
          className={`grid gap-8 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {loading ? (
            // Premium Loading Skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card-glass p-6 animate-pulse"
              >
                <div
                  className="h-4 rounded mb-4"
                  style={{ background: "var(--bg-glass)" }}
                ></div>
                <div
                  className="h-3 rounded mb-2"
                  style={{ background: "var(--bg-glass)" }}
                ></div>
                <div
                  className="h-3 rounded mb-4 w-3/4"
                  style={{ background: "var(--bg-glass)" }}
                ></div>
                <div className="flex gap-2 mb-4">
                  <div
                    className="h-6 rounded-full w-16"
                    style={{ background: "var(--bg-glass)" }}
                  ></div>
                  <div
                    className="h-6 rounded-full w-20"
                    style={{ background: "var(--bg-glass)" }}
                  ></div>
                </div>
                <div
                  className="h-10 rounded-lg"
                  style={{ background: "var(--bg-glass)" }}
                ></div>
              </motion.div>
            ))
          ) : currentScholarships.length > 0 ? (
            // Scholarship Cards with Animation
            currentScholarships.map((scholarship, index) => (
              <motion.div
                key={scholarship.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ScholarshipCard scholarship={scholarship} />
              </motion.div>
            ))
          ) : (
            // Enhanced No Results State
            <motion.div
              className="col-span-full text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "var(--text-quaternary)" }}
              >
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                No Scholarships Found
              </h3>
              <p
                className="text-lg max-w-md mx-auto mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                Try adjusting your filters or search terms to find more
                opportunities.
              </p>
              <button onClick={resetFilters} className="btn btn-primary">
                Reset All Filters
              </button>
            </motion.div>
          )}
        </div>

        {/* Premium Pagination */}
        {currentScholarships.length > 0 && totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="glass-strong rounded-xl p-2 flex items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-opacity-80 transition-all duration-200 focus-ring disabled:opacity-50"
                style={{ color: "var(--text-secondary)" }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                const isActive = pageNumber === currentPage;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      isActive ? "text-white" : ""
                    }`}
                    style={{
                      background: isActive
                        ? "var(--brand-primary)"
                        : "transparent",
                      color: isActive ? "white" : "var(--text-secondary)",
                    }}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-opacity-80 transition-all duration-200 focus-ring disabled:opacity-50"
                style={{ color: "var(--text-secondary)" }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Premium Newsletter Section */}
        <div className="mt-20 card-glass p-12 border-gradient">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-2/3">
              <h3
                className="text-title font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Never Miss a Scholarship Opportunity
              </h3>
              <p
                className="text-body mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                Get personalized scholarship alerts and application deadline
                reminders delivered straight to your inbox.
              </p>
              <div className="glass-strong rounded-xl p-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  spellCheck="false"
                  autoComplete="email"
                  className="input-google flex-1"
                  style={{
                    background: "transparent",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-primary)",
                  }}
                />
                <button className="btn btn-primary">Subscribe Now</button>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: "var(--brand-primary)" }}
              >
                <Bell className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <OpportunitiesContent />
    </Suspense>
  );
}
