"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { blogService, BlogPost } from "@/lib/firebase/services";
import { event } from "@/lib/analytics";
import { BlogCardSkeleton } from "@/components/LoadingSpinner";
import BlogCard from "@/components/BlogCard";

// Extended BlogPost type for BlogCard compatibility
interface BlogPostWithDate extends Omit<BlogPost, "readTime"> {
  date: string;
  readTime?: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 9;

  const { ref } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const categories = [
    "All",
    "Scholarships",
    "Education",
    "Career",
    "Study Abroad",
    "Tips",
    "News",
  ];

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        // Always use the correct published posts fetch method
        const posts = await blogService.getPublishedPosts();
        const transformedPosts = posts.map((post) => ({
          ...post,
          date:
            typeof post.publishedAt === "object" &&
            post.publishedAt !== null &&
            typeof (post.publishedAt as { toDate?: () => Date }).toDate ===
              "function"
              ? (post.publishedAt as { toDate: () => Date })
                  .toDate()
                  .toISOString()
              : post.publishedAt &&
                (typeof post.publishedAt === "string" ||
                  typeof post.publishedAt === "number" ||
                  post.publishedAt instanceof Date)
              ? new Date(post.publishedAt).toISOString()
              : "",
          readTime: post.readTime ? `${post.readTime} min read` : undefined,
        }));

        setPosts(transformedPosts);
        setTotalPages(Math.ceil(transformedPosts.length / postsPerPage));
        setError(null);
      } catch (err) {
        setError("Failed to load blog posts");
        setPosts([]);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  // Filter and paginate posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredPosts.length / postsPerPage)));
    setCurrentPage(1);
  }, [filteredPosts.length, selectedCategory, searchTerm]);

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    event({
      action: "blog_search",
      category: "Blog",
      label: searchTerm,
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    event({
      action: "blog_category_filter",
      category: "Blog",
      label: category,
    });
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    event({
      action: "blog_view_mode_change",
      category: "Blog",
      label: mode,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    event({
      action: "blog_pagination",
      category: "Blog",
      value: page,
    });
  };

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1
              className="text-2xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Error Loading Blog
            </h1>
            <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Clean Hero Section */}
      {/* Enhanced Professional Header */}
      <div className="relative overflow-hidden py-20 lg:py-24">
        {/* Vibrant Background Gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #1e40af 0%, #3b82f6 25%, #6366f1 50%, #8b5cf6 75%, #a855f7 100%)",
          }}
        />

        {/* Enhanced Brand Accent Layer */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(ellipse 120% 80% at 25% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 60%),
              radial-gradient(ellipse 100% 60% at 75% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 60%),
              radial-gradient(ellipse 80% 100% at 50% 0%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)
            `,
          }}
        />

        {/* Dynamic Texture for Depth */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `
              linear-gradient(45deg, transparent 45%, rgba(255, 255, 255, 0.1) 50%, transparent 55%),
              linear-gradient(-45deg, transparent 45%, rgba(255, 255, 255, 0.08) 50%, transparent 55%),
              radial-gradient(circle at 30% 70%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)
            `,
            backgroundSize: "80px 80px, 80px 80px, 200px 200px, 200px 200px",
          }}
        />

        {/* Content Readability Enhancement */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.3) 100%)",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Professional Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 mb-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-300 to-green-300 flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-gray-900"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-white text-lg">
              Expert Insights & Stories
            </span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          </motion.div>

          {/* Enhanced Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-lg">
              ScholarHunt
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
              Blog
            </span>
          </motion.h1>

          {/* Enhanced Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl lg:text-2xl mb-6 text-blue-50 leading-relaxed font-medium"
          >
            Insights, Tips, and Stories from the World of Scholarships
          </motion.p>

          {/* Enhanced Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg lg:text-xl max-w-4xl mx-auto text-blue-50 leading-relaxed font-medium mb-10"
          >
            Discover valuable insights, expert advice, and inspiring stories to
            help you navigate your educational journey and find the perfect
            scholarship opportunities.
          </motion.p>

          {/* Professional Stats/Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center items-center gap-6 lg:gap-8"
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-blue-100 font-medium">Weekly Articles</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span className="text-blue-100 font-medium">Expert Tips</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span className="text-blue-100 font-medium">Success Stories</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div
          className="rounded-xl shadow-lg p-6 mb-8"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-primary)",
          }}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus-ring"
                  style={{
                    border: "1px solid var(--border-primary)",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                />
              </form>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background:
                      selectedCategory === category
                        ? "var(--brand-primary)"
                        : "var(--bg-glass)",
                    color:
                      selectedCategory === category
                        ? "white"
                        : "var(--text-primary)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewModeChange("grid")}
                className="p-2 rounded-lg transition-colors"
                style={{
                  background:
                    viewMode === "grid"
                      ? "var(--brand-primary)"
                      : "var(--bg-glass)",
                  color: viewMode === "grid" ? "white" : "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                {/* grid icon */}
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
                  className="w-5 h-5"
                >
                  <rect width="7" height="7" x="3" y="3" />
                  <rect width="7" height="7" x="14" y="3" />
                  <rect width="7" height="7" x="14" y="14" />
                  <rect width="7" height="7" x="3" y="14" />
                </svg>
              </button>
              <button
                onClick={() => handleViewModeChange("list")}
                className="p-2 rounded-lg transition-colors"
                style={{
                  background:
                    viewMode === "list"
                      ? "var(--brand-primary)"
                      : "var(--bg-glass)",
                  color: viewMode === "list" ? "white" : "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                {/* list icon */}
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
                  className="w-5 h-5"
                >
                  <path d="M12 3v18" />
                  <path d="M18 21H6" />
                  <path d="M15 18H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p style={{ color: "var(--text-secondary)" }}>
            Showing {paginatedPosts.length} of {filteredPosts.length} articles
          </p>
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </div>
        ) : paginatedPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4" style={{ color: "var(--text-tertiary)" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-16 h-16 mx-auto"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6" />
                <path d="M10 14L21 3" />
              </svg>
            </div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No articles found
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Try adjusting your search terms or filters.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {paginatedPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                ref={ref}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  border: "1px solid var(--border-primary)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
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
                  className="w-5 h-5"
                >
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background:
                        currentPage === page
                          ? "var(--brand-primary)"
                          : "var(--bg-elevated)",
                      color:
                        currentPage === page ? "white" : "var(--text-primary)",
                      border: "1px solid var(--border-primary)",
                    }}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  border: "1px solid var(--border-primary)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
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
                  className="w-5 h-5"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
