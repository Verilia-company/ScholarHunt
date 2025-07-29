"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  BookOpen,
  Globe,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Mail,
  CheckCircle,
  Shield,
  Zap,
} from "lucide-react";
import ScholarshipCard from "@/components/ScholarshipCard";
import BlogCard from "@/components/BlogCard";
import {
  scholarshipService,
  blogService,
  Scholarship,
  BlogPost,
} from "@/lib/firebase/services";
import { trackEvents } from "@/lib/analytics";
import {
  ScholarshipCardSkeleton,
  BlogCardSkeleton,
} from "@/components/LoadingSpinner";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredScholarships, setFeaturedScholarships] = useState<
    Scholarship[]
  >([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Animation refs
  const [heroRef, heroInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [statsRef, statsInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [scholarshipsRef, scholarshipsInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [blogRef, blogInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        setLoading(true);

        // Fetch featured scholarships (first 6 active scholarships)
        const scholarships = await scholarshipService.getScholarships({
          status: "active",
          limit: 6,
        });
        setFeaturedScholarships(scholarships);

        // Fetch featured blog posts
        const blogPosts = await blogService.getBlogPosts({
          status: "published",
          limit: 3,
        });
        setFeaturedPosts(blogPosts);
      } catch (error) {
        console.error("Error fetching featured content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedContent();
  }, []);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Track search performed from homepage
      trackEvents.searchPerformed({
        searchTerm: searchQuery.trim(),
        resultsCount: 0, // 0 since we're redirecting
        source: "homepage",
      });
      router.push(
        `/opportunities?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Clean Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative overflow-hidden min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: heroInView ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Simple Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{ background: "var(--gradient-primary)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
          {/* Premium Badge */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: heroInView ? 0 : 30, opacity: heroInView ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 glass-strong rounded-full px-6 py-3 mb-12">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span
                style={{ color: "var(--text-primary)" }}
                className="font-medium text-sm"
              >
                🎓 Trust sits at the heart of our platform
              </span>
            </div>
          </motion.div>

          {/* Hero Title - World-Class Typography */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: heroInView ? 0 : 50, opacity: heroInView ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-display mb-6 leading-none">
              <span style={{ color: "var(--text-primary)" }}>Unlock Your</span>
              <br />
              <span className="text-gradient animate-gradient">
                Academic Future
              </span>
            </h1>

            <p
              className="text-subtitle max-w-4xl mx-auto leading-relaxed mb-12"
              style={{ color: "var(--text-secondary)" }}
            >
              Discover premium scholarship opportunities curated for ambitious
              students. From local grants to prestigious international programs,
              we connect you with funding that transforms dreams into reality.
            </p>
          </motion.div>

          {/* Clean Search Experience */}
          <motion.form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto mb-12"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: heroInView ? 0 : 30, opacity: heroInView ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
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
                        color: searchQuery
                          ? "var(--brand-primary)"
                          : "var(--text-tertiary)",
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-6 py-6 text-lg bg-transparent border-0 outline-none focus-ring"
                    style={{
                      color: "var(--text-primary)",
                    }}
                    placeholder="Search scholarships, universities, or study fields..."
                  />

                  <motion.button
                    type="submit"
                    className="btn btn-primary btn-lg mr-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!searchQuery.trim()}
                  >
                    <Search className="w-5 h-5" />
                    Search
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.form>

          {/* Premium CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: heroInView ? 0 : 30, opacity: heroInView ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/opportunities" className="btn btn-primary btn-lg">
                <Globe className="w-5 h-5" />
                Explore Scholarships
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/submit" className="btn btn-secondary btn-lg">
                <Award className="w-5 h-5" />
                Submit Opportunity
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Clean Stats Section */}
      <motion.section
        ref={statsRef}
        className="py-32 relative overflow-hidden"
        style={{ background: "var(--bg-secondary)" }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 50 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-6 py-3 mb-8">
              <TrendingUp
                className="w-4 h-4"
                style={{ color: "var(--brand-success)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Proven Track Record
              </span>
            </div>

            <h2
              className="text-hero mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Empowering Dreams,
              <br />
              <span className="text-gradient">Delivering Results</span>
            </h2>

            <p
              className="text-subtitle max-w-3xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Join thousands of successful students who&apos;ve transformed
              their futures through our platform
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Clean Featured Scholarships */}
      <motion.section
        ref={scholarshipsRef}
        className="py-32 relative overflow-hidden"
        style={{ background: "var(--bg-primary)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: scholarshipsInView ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{
              y: scholarshipsInView ? 0 : 30,
              opacity: scholarshipsInView ? 1 : 0,
            }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-6 py-3 mb-8">
              <Star
                className="w-4 h-4"
                style={{ color: "var(--brand-accent)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Curated Opportunities
              </span>
            </div>

            <h2
              className="text-hero mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Premium Scholarships
              <br />
              <span className="text-gradient">Waiting for You</span>
            </h2>

            <p
              className="text-subtitle max-w-3xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Handpicked opportunities with high success rates and upcoming
              deadlines
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {loading
              ? // Show loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                      opacity: scholarshipsInView ? 1 : 0,
                      y: scholarshipsInView ? 0 : 50,
                    }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ScholarshipCardSkeleton />
                  </motion.div>
                ))
              : // Show actual scholarships
                featuredScholarships.map((scholarship, index) => (
                  <motion.div
                    key={scholarship.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                      opacity: scholarshipsInView ? 1 : 0,
                      y: scholarshipsInView ? 0 : 50,
                    }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ScholarshipCard scholarship={scholarship} />
                  </motion.div>
                ))}
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: scholarshipsInView ? 1 : 0,
              y: scholarshipsInView ? 0 : 20,
            }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/opportunities" className="btn btn-primary btn-lg">
                Explore All Scholarships
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Clean Blog Section */}
      <motion.section
        ref={blogRef}
        className="py-32 relative overflow-hidden"
        style={{ background: "var(--bg-secondary)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: blogInView ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: blogInView ? 0 : 30, opacity: blogInView ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-6 py-3 mb-8">
              <BookOpen
                className="w-4 h-4"
                style={{ color: "var(--brand-warning)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Expert Knowledge
              </span>
            </div>

            <h2
              className="text-hero mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Master Your Journey
              <br />
              <span className="text-gradient">With Expert Insights</span>
            </h2>

            <p
              className="text-subtitle max-w-3xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Proven strategies, insider tips, and success stories from
              scholarship winners
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {loading
              ? // Show loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <motion.div
                    key={`blog-skeleton-${index}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                      opacity: blogInView ? 1 : 0,
                      y: blogInView ? 0 : 50,
                    }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <BlogCardSkeleton />
                  </motion.div>
                ))
              : // Show actual blog posts
                featuredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                      opacity: blogInView ? 1 : 0,
                      y: blogInView ? 0 : 50,
                    }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <BlogCard
                      post={{
                        ...post,
                        date:
                          post.publishedAt &&
                          typeof post.publishedAt === "object" &&
                          "toDate" in post.publishedAt &&
                          typeof (post.publishedAt as { toDate: unknown })
                            .toDate === "function"
                            ? (post.publishedAt as { toDate: () => Date })
                                .toDate()
                                .toISOString()
                            : new Date(
                                post.publishedAt as string | number | Date
                              ).toISOString(),
                        readTime: post.readTime
                          ? `${post.readTime} min read`
                          : undefined,
                      }}
                    />
                  </motion.div>
                ))}
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: blogInView ? 1 : 0, y: blogInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/blog" className="btn btn-secondary btn-lg">
                Explore All Articles
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Clean Newsletter CTA */}
      <motion.section
        className="py-32 relative overflow-hidden"
        style={{ background: "var(--brand-primary)" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          {/* Hero Content */}
          <motion.div
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Elegant Icon with Gradient Background */}
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-8 shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand-primary), var(--brand-accent))",
                transform: "rotate(-5deg)",
              }}
            >
              <Calendar className="w-12 h-12 text-white transform rotate-5" />
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
              Stay Ahead of the Game
            </h2>

            <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
              Get exclusive access to new scholarships, insider application
              tips, and deadline reminders delivered to your inbox every week.
            </p>
          </motion.div>

          {/* Premium Newsletter Card */}
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
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
                  Be the first to know about new scholarship opportunities and
                  get expert tips delivered straight to your inbox.
                </p>
              </div>

              {/* Newsletter Form */}
              <div className="px-8 py-8">
                <form className="w-full">
                  {/* Container with margin like scholarship card */}
                  <div className="m-4">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Email Input - Professional Design with Spacing */}
                      <div className="flex-1 relative">
                        <input
                          type="email"
                          name="email"
                          id="newsletter-email"
                          placeholder="Enter your email address"
                          autoComplete="email"
                          spellCheck="false"
                          role="textbox"
                          aria-label="Email address for newsletter"
                          className="w-full h-16 px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white font-normal text-gray-900 placeholder-gray-400 shadow-sm hover:border-gray-400 transition-all duration-300 leading-normal"
                          style={{
                            paddingLeft: "20px",
                            paddingRight: "20px",
                            lineHeight: "1.5",
                            letterSpacing: "0.01em",
                          }}
                        />
                      </div>

                      {/* Subscribe Button - Professional Spacing */}
                      <motion.button
                        type="submit"
                        className="lg:w-auto w-full h-16 px-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-2xl border-0 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Subscribe Now
                        <ArrowRight className="w-6 h-6" />
                      </motion.button>
                    </div>
                  </div>
                </form>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="font-medium">5,000+ Subscribers</span>
                    </div>

                    <div className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="font-medium">No Spam Policy</span>
                    </div>

                    <div className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                        <Zap className="w-3 h-3 text-purple-600" />
                      </div>
                      <span className="font-medium">Weekly Updates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
