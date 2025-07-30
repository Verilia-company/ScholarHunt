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
  GraduationCap,
  ChevronDown,
  Users,
  Clock,
  Heart,
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
      {/* Enhanced Hero Section - Professional Redesign */}
      <motion.section
        ref={heroRef}
        className="relative overflow-hidden min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: heroInView ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary Gradient Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{ background: "var(--gradient-primary)" }}
          />

          {/* Professional Floating Elements */}
          <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse animation-delay-2s"></div>
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse animation-delay-4s"></div>

          {/* Professional Geometric Patterns */}
          <div className="absolute top-32 right-32 w-32 h-32 border-2 border-blue-200/30 rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-r from-yellow-200/40 to-orange-200/40 rounded-lg rotate-45 animate-bounce-slow"></div>
          <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-green-200/30 to-emerald-200/30 rounded-full animate-pulse animation-delay-3s"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
          {/* Enhanced Premium Badge */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: heroInView ? 0 : 30, opacity: heroInView ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-4 glass-strong rounded-full px-8 py-4 mb-12 shadow-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <span
                  style={{ color: "var(--text-primary)" }}
                  className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  🎓 Trusted by 50,000+ Students Globally
                </span>
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Hero Title with Professional Typography */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: heroInView ? 0 : 50, opacity: heroInView ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none">
              <span style={{ color: "var(--text-primary)" }}>Unlock Your</span>
              <br />
              <span className="relative">
                <span className="text-gradient animate-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Academic Future
                </span>
                {/* Professional underline effect */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-80 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 blur-sm"></div>
              </span>
            </h1>

            <p
              className="text-2xl md:text-3xl max-w-5xl mx-auto leading-relaxed mb-12 font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Discover premium scholarship opportunities curated for ambitious
              students worldwide. From local grants to prestigious international
              programs, we connect you with funding that transforms
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                {" "}
                dreams into reality
              </span>
              .
            </p>
          </motion.div>

          {/* Professional Enhanced Search Experience */}
          <motion.form
            onSubmit={handleSearch}
            className="max-w-5xl mx-auto mb-12"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: heroInView ? 0 : 30, opacity: heroInView ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative">
              <div
                className="glass-strong rounded-3xl p-4 border shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-lg bg-white/95"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <div className="flex items-center pl-6 flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg mr-4">
                      <Search className="h-6 w-6 text-white transition-colors duration-300" />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    spellCheck="false"
                    autoComplete="off"
                    className="flex-1 h-20 text-xl text-gray-800 placeholder-gray-500 bg-transparent border-0 rounded-2xl focus:outline-none focus:ring-0 font-medium px-4"
                    style={{
                      color: "var(--text-primary)",
                    }}
                    placeholder="Search scholarships, universities, programs, or study fields..."
                  />

                  <motion.button
                    type="submit"
                    className="lg:w-auto w-full h-20 px-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl border-0 shadow-2xl hover:shadow-3xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-4 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!searchQuery.trim()}
                  >
                    {/* Button background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

                    <Search className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">Search Now</span>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Enhanced Quick Search Tags */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {[
                { label: "Undergraduate", color: "from-blue-500 to-cyan-500" },
                { label: "Graduate", color: "from-purple-500 to-pink-500" },
                { label: "PhD Programs", color: "from-indigo-500 to-blue-600" },
                {
                  label: "Need-based Aid",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  label: "Merit Scholarships",
                  color: "from-yellow-500 to-orange-500",
                },
                { label: "Study Abroad", color: "from-red-500 to-pink-500" },
              ].map((tag, index) => (
                <motion.button
                  key={tag.label}
                  onClick={() => setSearchQuery(tag.label)}
                  className={`px-8 py-4 bg-white hover:bg-gradient-to-r hover:${tag.color} text-gray-700 hover:text-white rounded-full text-lg font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-transparent shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tag.label}
                </motion.button>
              ))}
            </div>
          </motion.form>

          {/* Enhanced Premium CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: heroInView ? 0 : 30, opacity: heroInView ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/opportunities"
                className="px-12 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-4 relative overflow-hidden group"
              >
                {/* Button effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="relative z-10">Explore Scholarships</span>
                <ArrowRight className="w-5 h-5 relative z-10" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/submit"
                className="px-12 py-5 bg-white text-gray-800 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl border-2 border-gray-200 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span>Submit Opportunity</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Professional Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <div
              className="flex flex-col items-center"
              style={{ color: "var(--text-tertiary)" }}
            >
              <span className="text-lg font-semibold mb-4 tracking-wide">
                Discover More
              </span>
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl"
              >
                <ChevronDown className="w-7 h-7 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Professional Stats Section */}
      <motion.section
        ref={statsRef}
        className="py-32 relative overflow-hidden"
        style={{ background: "var(--bg-secondary)" }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 50 }}
        transition={{ duration: 0.8 }}
      >
        {/* Professional Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-3s"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse animation-delay-5s"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* Enhanced Section Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-3 glass rounded-full px-8 py-4 mb-8 shadow-xl border border-white/20">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span
                className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                style={{ color: "var(--text-primary)" }}
              >
                Proven Track Record
              </span>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>

            <h2
              className="text-5xl md:text-7xl font-black mb-8"
              style={{ color: "var(--text-primary)" }}
            >
              Empowering Dreams,
              <br />
              <span className="relative">
                <span className="text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Delivering Results
                </span>
                {/* Professional underline effect */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-72 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60"></div>
              </span>
            </h2>

            <p
              className="text-2xl md:text-3xl max-w-4xl mx-auto font-medium leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Join thousands of successful students who&apos;ve transformed
              their futures through our platform with
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent font-bold">
                {" "}
                measurable success
              </span>
            </p>
          </motion.div>

          {/* Professional Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {[
              {
                icon: Users,
                number: "50,000+",
                label: "Students Served",
                description: "Global community of ambitious learners",
                color: "from-blue-500 to-indigo-500",
                bgColor: "from-blue-50 to-indigo-50",
                iconBg: "from-blue-400 to-indigo-400",
              },
              {
                icon: Award,
                number: "$2.5M+",
                label: "Scholarships Awarded",
                description: "Total funding secured by our students",
                color: "from-yellow-500 to-orange-500",
                bgColor: "from-yellow-50 to-orange-50",
                iconBg: "from-yellow-400 to-orange-400",
              },
              {
                icon: GraduationCap,
                number: "95%",
                label: "Success Rate",
                description: "Students who find suitable opportunities",
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-50 to-emerald-50",
                iconBg: "from-green-400 to-emerald-400",
              },
              {
                icon: Globe,
                number: "120+",
                label: "Countries Covered",
                description: "Global scholarship opportunities",
                color: "from-purple-500 to-pink-500",
                bgColor: "from-purple-50 to-pink-50",
                iconBg: "from-purple-400 to-pink-400",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className={`relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-100 group hover:-translate-y-2`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{
                  opacity: statsInView ? 1 : 0,
                  y: statsInView ? 0 : 30,
                  scale: statsInView ? 1 : 0.9,
                }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Background gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                ></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${stat.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Number */}
                  <div
                    className={`text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                  >
                    {stat.number}
                  </div>

                  {/* Label */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {stat.label}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm font-medium leading-relaxed">
                    {stat.description}
                  </p>
                </div>

                {/* Decorative corner elements */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-white/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-r from-white/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </motion.div>

          {/* Professional Trust Indicators */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Why Students Choose ScholarHunt
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Shield,
                    title: "Verified Opportunities",
                    description:
                      "Every scholarship is thoroughly vetted and verified",
                    color: "from-blue-500 to-indigo-500",
                  },
                  {
                    icon: Clock,
                    title: "Real-time Updates",
                    description:
                      "Never miss a deadline with instant notifications",
                    color: "from-green-500 to-emerald-500",
                  },
                  {
                    icon: Heart,
                    title: "Personalized Matching",
                    description:
                      "AI-powered recommendations based on your profile",
                    color: "from-purple-500 to-pink-500",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="text-center group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: statsInView ? 1 : 0,
                      y: statsInView ? 0 : 20,
                    }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
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
                          className="input-google-lg"
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
