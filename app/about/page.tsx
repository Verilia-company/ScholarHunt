"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Target,
  Globe,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Facebook,
  Instagram,
  Linkedin,
  Heart,
  Sparkles,
  Award,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { settingsService } from "@/lib/firebase/services";
import type { SiteSettings } from "@/lib/firebase/services";
import Image from "next/image";

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Animation refs
  const [heroRef, heroInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [storyRef, storyInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [valuesRef, valuesInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [contactRef, contactInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const siteSettings = await settingsService.getSettings();
        setSettings(siteSettings);
      } catch (error) {
        console.error("Error loading site settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Enhanced Professional Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative overflow-hidden py-20 lg:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: heroInView ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
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

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: heroInView ? 0 : 50, opacity: heroInView ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {/* Professional Badge */}
            <div className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 mb-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-300 to-green-300 flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-gray-900" />
              </div>
              <span className="font-semibold text-white text-lg">
                Our Story & Mission
              </span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>

            {/* Enhanced Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-lg">
                Transforming Dreams Into
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
                Reality
              </span>
            </h1>

            {/* Enhanced Description */}
            <p className="text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed text-blue-50 font-medium mb-10">
              Born from struggle, built with purpose. We&apos;re revolutionizing
              how students discover and access life-changing scholarship
              opportunities.
            </p>

            {/* Professional Stats/Values */}
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-blue-100 font-medium">
                  Passion-Driven Mission
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-blue-100 font-medium">Global Impact</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span className="text-blue-100 font-medium">
                  Student-First Approach
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Story & Team Section */}
      <motion.section
        ref={storyRef}
        className="py-20 lg:py-32 relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: storyInView ? 1 : 0, y: storyInView ? 0 : 50 }}
        transition={{ duration: 0.8 }}
      >
        {/* Professional Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(51, 65, 85, 0.95) 100%)",
          }}
        />

        {/* Enhanced Accent Layer */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 60%),
              radial-gradient(ellipse 70% 80% at 80% 70%, rgba(168, 85, 247, 0.25) 0%, transparent 60%),
              radial-gradient(ellipse 60% 90% at 50% 10%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)
            `,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Enhanced Team Section */}
            <motion.div
              className="order-2 lg:order-1"
              initial={{ x: -50, opacity: 0 }}
              animate={{
                x: storyInView ? 0 : -50,
                opacity: storyInView ? 1 : 0,
              }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Central Brand Element with Glow */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-xl opacity-30 scale-150"></div>
                    <div className="relative bg-white/10 backdrop-blur-xl rounded-full p-6 shadow-2xl border border-white/20">
                      <div className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-blue-200 to-purple-200 bg-clip-text text-transparent">
                        SH
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Team Members Grid */}
                <div className="grid grid-cols-2 gap-8">
                  {!loading &&
                  settings?.aboutPage?.teamMembers &&
                  settings.aboutPage.teamMembers.length > 0 ? (
                    settings.aboutPage.teamMembers.map((member, index) => (
                      <motion.div
                        key={index}
                        className="text-center group"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: storyInView ? 1 : 0.8,
                          opacity: storyInView ? 1 : 0,
                        }}
                        transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      >
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300 shadow-xl">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20">
                            {member.image ? (
                              <Image
                                src={member.image}
                                alt={member.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                                <Users className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold mb-1 text-white">
                            {member.name}
                          </h3>
                          <p className="text-sm font-medium text-blue-200">
                            {member.role}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    // Enhanced Default team members
                    <>
                      <motion.div
                        className="text-center group"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: storyInView ? 1 : 0.8,
                          opacity: storyInView ? 1 : 0,
                        }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300 shadow-xl">
                          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg border-2 border-white/20 bg-gradient-to-br from-blue-500 to-purple-600">
                            <Users className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="font-bold mb-1 text-white">
                            Mutaawe Enock
                          </h3>
                          <p className="text-sm font-medium text-blue-200">
                            Founder & CEO
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        className="text-center group"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: storyInView ? 1 : 0.8,
                          opacity: storyInView ? 1 : 0,
                        }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      >
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300 shadow-xl">
                          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg border-2 border-white/20 bg-gradient-to-br from-purple-500 to-pink-600">
                            <Users className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="font-bold mb-1 text-white">
                            Team Member
                          </h3>
                          <p className="text-sm font-medium text-blue-200">
                            Director of Operations
                          </p>
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Story Section */}
            <motion.div
              className="order-1 lg:order-2"
              initial={{ x: 50, opacity: 0 }}
              animate={{
                x: storyInView ? 0 : 50,
                opacity: storyInView ? 1 : 0,
              }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Our Story
                </h2>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-lg lg:text-xl leading-relaxed text-gray-200 font-medium">
                  ScholarHunt was birthed from a deeply personal struggle. As
                  founder Mutaawe Enock pondered his own challenging journey to
                  join campus, he reflected on the countless scholarship
                  applications that ended in disappointment. The pain
                  wasn&apos;t just in the rejections—it was in the crushing
                  realization that sometimes failure came simply from not
                  knowing where to find exactly what he was looking for.
                </p>

                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 border-l-4 border-l-blue-400 shadow-xl">
                  <p className="text-lg italic leading-relaxed text-white font-medium">
                    &ldquo;With hopes repeatedly crushed and dreams hanging in
                    the balance, a powerful determination emerged. I made up my
                    mind to create something different—a platform that would
                    transform the scholarship search process from a maze of
                    confusion into a clear pathway of opportunity.&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">ME</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Mutaawe Enock</p>
                      <p className="text-blue-200 text-sm">Founder & CEO</p>
                    </div>
                  </div>
                </div>

                <p className="text-lg lg:text-xl leading-relaxed text-gray-200 font-medium">
                  Today, ScholarHunt stands as more than just a
                  platform—it&apos;s a beacon of hope. We exist to connect
                  students across Uganda to scholarship opportunities that have
                  the power to completely transform their lives, ensuring that
                  talent and determination, not circumstances, determine their
                  educational destiny.
                </p>

                {/* Impact Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-yellow-300 mb-1">
                      500+
                    </div>
                    <div className="text-blue-200 text-sm">Scholarships</div>
                  </div>
                  <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-green-300 mb-1">
                      10K+
                    </div>
                    <div className="text-blue-200 text-sm">Students</div>
                  </div>
                  <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-purple-300 mb-1">
                      50+
                    </div>
                    <div className="text-blue-200 text-sm">Countries</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      {/* Enhanced Mission, Vision & Values */}
      <motion.section
        ref={valuesRef}
        className="py-20 lg:py-32 relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: valuesInView ? 1 : 0, y: valuesInView ? 0 : 50 }}
        transition={{ duration: 0.8 }}
      >
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

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          {/* Enhanced Mission & Vision */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
            <motion.div
              className="text-center lg:text-left"
              initial={{ x: -50, opacity: 0 }}
              animate={{
                x: valuesInView ? 0 : -50,
                opacity: valuesInView ? 1 : 0,
              }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white/5 backdrop-blur-xl p-8 lg:p-10 h-full rounded-2xl border border-white/10 shadow-xl hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-center lg:justify-start mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white/20">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Our Mission
                </h3>
                <p className="text-lg lg:text-xl leading-relaxed text-blue-50 font-medium">
                  To democratize access to quality education by providing
                  comprehensive, accurate, and timely information about
                  scholarship opportunities to Ugandan students, while offering
                  guidance and support throughout their educational journey.
                </p>
                <div className="mt-6 flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 w-fit">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-blue-100 font-medium text-sm">
                    Democratizing Education
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="text-center lg:text-left"
              initial={{ x: 50, opacity: 0 }}
              animate={{
                x: valuesInView ? 0 : 50,
                opacity: valuesInView ? 1 : 0,
              }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="bg-white/5 backdrop-blur-xl p-8 lg:p-10 h-full rounded-2xl border border-white/10 shadow-xl hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-center lg:justify-start mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-white/20">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  Our Vision
                </h3>
                <p className="text-lg lg:text-xl leading-relaxed text-blue-50 font-medium">
                  A world where every talented student in Uganda, regardless of
                  their financial background, has equal access to quality
                  education and the opportunity to pursue their academic dreams
                  without financial barriers.
                </p>
                <div className="mt-6 flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 w-fit">
                  <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></div>
                  <span className="text-blue-100 font-medium text-sm">
                    Equal Opportunities
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Values Section */}
          <motion.div
            className="text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{
              y: valuesInView ? 0 : 50,
              opacity: valuesInView ? 1 : 0,
            }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Professional Badge */}
            <div className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 mb-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 flex items-center justify-center shadow-lg">
                <Star className="w-5 h-5 text-gray-900" />
              </div>
              <span className="font-semibold text-white text-lg">
                Core Values
              </span>
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            </div>

            <h3 className="text-4xl lg:text-5xl font-bold mb-12">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-lg">
                What Drives Us
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
                Every Single Day
              </span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
              {[
                {
                  name: "Integrity",
                  icon: "IN",
                  description: "Honest guidance",
                  gradient: "from-blue-500 to-indigo-600",
                },
                {
                  name: "Accessibility",
                  icon: "AC",
                  description: "Open to all",
                  gradient: "from-green-500 to-emerald-600",
                },
                {
                  name: "Excellence",
                  icon: "EX",
                  description: "Quality first",
                  gradient: "from-purple-500 to-violet-600",
                },
                {
                  name: "Innovation",
                  icon: "IV",
                  description: "Future-focused",
                  gradient: "from-cyan-500 to-blue-600",
                },
                {
                  name: "Transparency",
                  icon: "TR",
                  description: "Clear processes",
                  gradient: "from-orange-500 to-red-600",
                },
                {
                  name: "Empowerment",
                  icon: "EM",
                  description: "Student success",
                  gradient: "from-pink-500 to-rose-600",
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  className="group text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: valuesInView ? 1 : 0.8,
                    opacity: valuesInView ? 1 : 0,
                  }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300 shadow-xl">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow bg-gradient-to-br ${value.gradient} border-2 border-white/20`}
                    >
                      <span className="text-white font-bold text-sm">
                        {value.icon}
                      </span>
                    </div>
                    <p className="font-semibold text-white mb-2">
                      {value.name}
                    </p>
                    <p className="text-blue-200 text-sm font-medium">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-blue-100">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="font-medium">Trusted by 10,000+ Students</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                <span className="font-medium">500+ Active Scholarships</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></div>
                <span className="font-medium">50+ Partner Universities</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
      {/* Enhanced Contact Section */}
      <motion.section
        ref={contactRef}
        className="py-20 lg:py-32 relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: contactInView ? 1 : 0, y: contactInView ? 0 : 50 }}
        transition={{ duration: 0.8 }}
      >
        {/* Professional Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(51, 65, 85, 0.95) 100%)",
          }}
        />

        {/* Enhanced Accent Layer */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 60%),
              radial-gradient(ellipse 70% 80% at 80% 70%, rgba(168, 85, 247, 0.25) 0%, transparent 60%),
              radial-gradient(ellipse 60% 90% at 50% 10%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)
            `,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{
              y: contactInView ? 0 : 30,
              opacity: contactInView ? 1 : 0,
            }}
            transition={{ duration: 0.6 }}
          >
            {/* Professional Badge */}
            <div className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 mb-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white text-lg">
                Let&apos;s Connect
              </span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-lg">
                Ready to Transform
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
                Your Future?
              </span>
            </h2>

            <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-200 font-medium">
              Have questions? We&apos;d love to hear from you and help you on
              your scholarship journey.
            </p>
          </motion.div>

          {/* Enhanced Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Mail,
                title: "Email Us",
                value:
                  (!loading && settings?.aboutPage?.contactEmail) ||
                  "info@scholarhunt.ug",
                description: "Get answers within 24 hours",
                gradient: "from-blue-500 to-indigo-600",
                delay: 0.2,
              },
              {
                icon: Phone,
                title: "Call Us",
                value:
                  (!loading && settings?.aboutPage?.contactPhone) ||
                  "+256759058245",
                description: "Available Mon-Fri, 9AM-6PM",
                gradient: "from-emerald-500 to-cyan-600",
                delay: 0.3,
              },
              {
                icon: MapPin,
                title: "Visit Us",
                value: "Kampala, Uganda",
                description: "Central location, easy access",
                gradient: "from-purple-500 to-pink-600",
                delay: 0.4,
              },
            ].map((contact, index) => (
              <motion.div
                key={index}
                className="group text-center"
                initial={{ y: 50, opacity: 0 }}
                animate={{
                  y: contactInView ? 0 : 50,
                  opacity: contactInView ? 1 : 0,
                }}
                transition={{ duration: 0.6, delay: contact.delay }}
              >
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300 shadow-xl h-full">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow bg-gradient-to-br ${contact.gradient} border-2 border-white/20`}
                  >
                    <contact.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold mb-3 text-white">
                    {contact.title}
                  </h3>
                  <p className="text-lg font-semibold break-words text-blue-200 mb-2">
                    {contact.value}
                  </p>
                  <p className="text-sm text-gray-300 font-medium">
                    {contact.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Social Media Section */}
          <motion.div
            className="text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{
              y: contactInView ? 0 : 30,
              opacity: contactInView ? 1 : 0,
            }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-2xl lg:text-3xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Follow Our Journey
            </h3>

            <div className="flex justify-center gap-6 mb-8">
              {[
                {
                  component: Facebook,
                  href:
                    settings?.socialMedia?.facebook ||
                    "https://www.facebook.com/share/16g4GXRe6r/",
                  name: "Facebook",
                  gradient: "from-blue-500 to-blue-700",
                },
                {
                  component: Instagram,
                  href: settings?.socialMedia?.instagram,
                  name: "Instagram",
                  gradient: "from-pink-500 to-rose-600",
                },
                {
                  component: Linkedin,
                  href:
                    settings?.socialMedia?.linkedin ||
                    "https://linkedin.com/company/scholarhunt-uganda",
                  name: "LinkedIn",
                  gradient: "from-blue-600 to-indigo-700",
                },
              ].map(
                (social, index) =>
                  social.href && (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${social.gradient} border-2 border-white/20`}
                      >
                        <social.component className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm text-gray-300 mt-2 font-medium">
                        {social.name}
                      </p>
                    </motion.a>
                  )
              )}
            </div>

            {/* Enhanced Response Promise */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-gray-200">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="font-medium">Quick Response Guaranteed</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="font-medium">Expert Guidance Available</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></div>
                <span className="font-medium">Free Consultation</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced CTA Section */}
      <motion.section
        className="py-20 lg:py-32 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
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
          className="absolute inset-0 opacity-25"
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
          className="absolute inset-0 opacity-15"
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
              "linear-gradient(to bottom, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.2) 100%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Enhanced Award Icon */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full blur-xl opacity-40 scale-150"></div>
              <div className="relative bg-white/20 backdrop-blur-xl rounded-full w-full h-full flex items-center justify-center border-2 border-white/30 shadow-2xl">
                <Award className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-lg">
                Ready to Start Your Journey?
              </span>
            </h2>

            <p className="text-xl lg:text-2xl text-blue-50 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Join thousands of students who have found their perfect
              scholarship through ScholarHunt. Your dream education is just one
              click away.
            </p>

            {/* Enhanced Impact Stats */}
            <div className="grid grid-cols-3 gap-6 lg:gap-8 mb-12 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl lg:text-3xl font-bold text-yellow-300 mb-1">
                  500+
                </div>
                <div className="text-blue-100 text-sm font-medium">
                  Active Scholarships
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl lg:text-3xl font-bold text-green-300 mb-1">
                  10K+
                </div>
                <div className="text-blue-100 text-sm font-medium">
                  Students Helped
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl lg:text-3xl font-bold text-purple-300 mb-1">
                  95%
                </div>
                <div className="text-blue-100 text-sm font-medium">
                  Success Rate
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl text-lg"
              >
                <BookOpen className="w-6 h-6" />
                Browse Scholarships
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/submit"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-xl text-white border-2 border-white/30 font-bold rounded-xl hover:bg-white/30 transition-all duration-300 shadow-xl text-lg"
              >
                <Sparkles className="w-6 h-6" />
                Submit Opportunity
              </Link>
            </motion.div>
          </motion.div>

          {/* Enhanced Trust Indicators */}
          <motion.div
            className="mt-12 flex flex-wrap justify-center items-center gap-6 text-blue-100"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <span className="font-medium text-sm">100% Free Platform</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="font-medium text-sm">Expert Guidance</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></div>
              <span className="font-medium text-sm">
                Verified Opportunities
              </span>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
