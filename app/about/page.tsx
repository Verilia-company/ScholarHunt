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
  Twitter,
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
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [storyRef, storyInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [valuesRef, valuesInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [contactRef, contactInView] = useInView({ threshold: 0.1, triggerOnce: true });

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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Clean Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative overflow-hidden py-32"
        style={{ background: 'var(--brand-primary)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: heroInView ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: heroInView ? 0 : 50, opacity: heroInView ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-3 rounded-full px-6 py-3 mb-8" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <Heart className="w-5 h-5 text-white" />
              <span className="font-medium text-white">
                Our Story & Mission
              </span>
            </div>
            
            <h1 className="text-display mb-8 text-white">
              Transforming Dreams Into
              <br />
              <span className="text-white opacity-90">Reality</span>
            </h1>
            
            <p 
              className="text-subtitle max-w-4xl mx-auto leading-relaxed text-white opacity-80"
            >
              Born from struggle, built with purpose. We&apos;re revolutionizing how students 
              discover and access life-changing scholarship opportunities.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Revolutionary Story & Team Section */}
      <motion.section
        ref={storyRef}
        className="py-32 relative overflow-hidden"
        style={{ background: 'var(--bg-secondary)' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: storyInView ? 1 : 0, y: storyInView ? 0 : 50 }}
        transition={{ duration: 0.8 }}
      >


        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Premium Team Section */}
            <motion.div
              className="order-2 lg:order-1"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: storyInView ? 0 : -50, opacity: storyInView ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Central Brand Element */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="glass-strong rounded-full p-6 shadow-2xl border-gradient">
                    <div 
                      className="text-2xl font-bold text-gradient"
                      style={{ color: 'var(--brand-primary)' }}
                    >
                      SH
                    </div>
                  </div>
                </div>

                {/* Team Members Grid */}
                <div className="grid grid-cols-2 gap-8">
                  {!loading && settings?.aboutPage?.teamMembers && settings.aboutPage.teamMembers.length > 0 ? (
                    settings.aboutPage.teamMembers.map((member, index) => (
                      <motion.div
                        key={index}
                        className="text-center group"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: storyInView ? 1 : 0.8, opacity: storyInView ? 1 : 0 }}
                        transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      >
                        <div className="card-glass p-6 group-hover:scale-105 transition-all duration-300">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
                            {member.image ? (
                              <Image
                                src={member.image}
                                alt={member.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--brand-primary)' }}>
                                <Users className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>
                          <h3 
                            className="font-bold mb-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {member.name}
                          </h3>
                          <p 
                            className="text-sm font-medium"
                            style={{ color: 'var(--brand-primary)' }}
                          >
                            {member.role}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    // Default team members
                    <>
                      <motion.div
                        className="text-center group"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: storyInView ? 1 : 0.8, opacity: storyInView ? 1 : 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <div className="card-glass p-6 group-hover:scale-105 transition-all duration-300">
                          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ background: 'var(--brand-primary)' }}>
                            <Users className="h-8 w-8 text-white" />
                          </div>
                          <h3 
                            className="font-bold mb-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            Mutaawe Enock
                          </h3>
                          <p 
                            className="text-sm font-medium"
                            style={{ color: 'var(--brand-primary)' }}
                          >
                            Founder & CEO
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        className="text-center group"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: storyInView ? 1 : 0.8, opacity: storyInView ? 1 : 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      >
                        <div className="card-glass p-6 group-hover:scale-105 transition-all duration-300">
                          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ background: 'var(--brand-secondary)' }}>
                            <Users className="h-8 w-8 text-white" />
                          </div>
                          <h3 
                            className="font-bold mb-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            Team Member
                          </h3>
                          <p 
                            className="text-sm font-medium"
                            style={{ color: 'var(--brand-primary)' }}
                          >
                            Director of Operations
                          </p>
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Premium Story Section */}
            <motion.div
              className="order-1 lg:order-2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: storyInView ? 0 : 50, opacity: storyInView ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-hero" style={{ color: 'var(--text-primary)' }}>
                  Our Story
                </h2>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--brand-accent)' }}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="space-y-8">
                <p 
                  className="text-body leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ScholarHunt was birthed from a deeply personal struggle. As founder Mutaawe Enock 
                  pondered his own challenging journey to join campus, he reflected on the countless 
                  scholarship applications that ended in disappointment. The pain wasn&apos;t just in the 
                  rejections—it was in the crushing realization that sometimes failure came simply 
                  from not knowing where to find exactly what he was looking for.
                </p>

                <div className="glass-strong p-6 rounded-2xl border-l-4" style={{ borderColor: 'var(--brand-primary)' }}>
                  <p 
                    className="text-body italic leading-relaxed"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    &ldquo;With hopes repeatedly crushed and dreams hanging in the balance, a powerful 
                    determination emerged. I made up my mind to create something different—a platform 
                    that would transform the scholarship search process from a maze of confusion into 
                    a clear pathway of opportunity.&rdquo;
                  </p>
                </div>

                <p 
                  className="text-body leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Today, ScholarHunt stands as more than just a platform—it&apos;s a beacon of hope. 
                  We exist to connect students across Uganda to scholarship opportunities that have 
                  the power to completely transform their lives, ensuring that talent and determination, 
                  not circumstances, determine their educational destiny.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      {/* Revolutionary Mission, Vision & Values */}
      <motion.section
        ref={valuesRef}
        className="py-32 relative overflow-hidden"
        style={{ background: 'var(--bg-primary)' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: valuesInView ? 1 : 0, y: valuesInView ? 0 : 50 }}
        transition={{ duration: 0.8 }}
      >


        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* Mission & Vision */}
          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            <motion.div
              className="text-center lg:text-left"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: valuesInView ? 0 : -50, opacity: valuesInView ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="card-glass p-8 h-full">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'var(--brand-primary)' }}>
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-title font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  Our Mission
                </h3>
                <p className="text-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  To democratize access to quality education by providing comprehensive, accurate, 
                  and timely information about scholarship opportunities to Ugandan students, while 
                  offering guidance and support throughout their educational journey.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="text-center lg:text-left"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: valuesInView ? 0 : 50, opacity: valuesInView ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="card-glass p-8 h-full">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'var(--brand-secondary)' }}>
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-title font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  Our Vision
                </h3>
                <p className="text-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  A world where every talented student in Uganda, regardless of their financial 
                  background, has equal access to quality education and the opportunity to pursue 
                  their academic dreams without financial barriers.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Premium Values Section */}
          <motion.div
            className="text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: valuesInView ? 0 : 50, opacity: valuesInView ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-6 py-3 mb-8">
              <Star className="w-4 h-4" style={{ color: 'var(--brand-warning)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Core Values
              </span>
            </div>

            <h3 className="text-hero mb-12" style={{ color: 'var(--text-primary)' }}>
              What Drives Us
              <br />
              <span className="text-gradient">Every Single Day</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[
                { name: "Integrity", icon: "IN", gradient: "from-blue-400 to-indigo-500" },
                { name: "Accessibility", icon: "AC", gradient: "from-green-400 to-emerald-500" },
                { name: "Excellence", icon: "EX", gradient: "from-purple-400 to-violet-500" },
                { name: "Innovation", icon: "IV", gradient: "from-cyan-400 to-blue-500" },
                { name: "Transparency", icon: "TR", gradient: "from-orange-400 to-red-500" },
                { name: "Empowerment", icon: "EM", gradient: "from-pink-400 to-rose-500" },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  className="group text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: valuesInView ? 1 : 0.8, opacity: valuesInView ? 1 : 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <div className="card-glass p-6 group-hover:scale-105 transition-all duration-300">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow" style={{ background: index % 2 === 0 ? 'var(--brand-primary)' : 'var(--brand-secondary)' }}>
                      <span className="text-white font-bold text-sm">
                        {value.icon}
                      </span>
                    </div>
                    <p 
                      className="font-semibold text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {value.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>
      {/* Revolutionary Contact Section */}
      <motion.section
        ref={contactRef}
        className="py-32 relative overflow-hidden"
        style={{ background: 'var(--bg-secondary)' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: contactInView ? 1 : 0, y: contactInView ? 0 : 50 }}
        transition={{ duration: 0.8 }}
      >


        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: contactInView ? 0 : 30, opacity: contactInView ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-6 py-3 mb-8">
              <Zap className="w-4 h-4" style={{ color: 'var(--brand-accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Let&apos;s Connect
              </span>
            </div>

            <h2 className="text-hero mb-6" style={{ color: 'var(--text-primary)' }}>
              Ready to Transform
              <br />
              <span className="text-gradient">Your Future?</span>
            </h2>
            
            <p 
              className="text-subtitle max-w-3xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Have questions? We&apos;d love to hear from you and help you on your scholarship journey.
            </p>
          </motion.div>

          {/* Premium Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Mail,
                title: "Email Us",
                value: (!loading && settings?.aboutPage?.contactEmail) || "info@scholarhunt.ug",
                gradient: "from-blue-400 to-indigo-500",
                delay: 0.2
              },
              {
                icon: Phone,
                title: "Call Us",
                value: (!loading && settings?.aboutPage?.contactPhone) || "+256 XXX XXX XXX",
                gradient: "from-emerald-400 to-cyan-500",
                delay: 0.3
              },
              {
                icon: MapPin,
                title: "Visit Us",
                value: "Kampala, Uganda",
                gradient: "from-purple-400 to-pink-500",
                delay: 0.4
              }
            ].map((contact, index) => (
              <motion.div
                key={index}
                className="group text-center"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: contactInView ? 0 : 50, opacity: contactInView ? 1 : 0 }}
                transition={{ duration: 0.6, delay: contact.delay }}
              >
                <div className="card-glass p-8 group-hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow" style={{ background: index === 0 ? 'var(--brand-primary)' : index === 1 ? 'var(--brand-accent)' : 'var(--brand-secondary)' }}>
                    <contact.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 
                    className="text-title font-bold mb-4"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {contact.title}
                  </h3>
                  <p 
                    className="text-body font-medium break-words"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {contact.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Premium Social Media Section */}
          <motion.div
            className="text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: contactInView ? 0 : 30, opacity: contactInView ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 
              className="text-title font-bold mb-8"
              style={{ color: 'var(--text-primary)' }}
            >
              Follow Our Journey
            </h3>
            
            <div className="flex justify-center gap-6">
              {[
                { 
                  component: Facebook, 
                  href: settings?.socialMedia?.facebook, 
                  color: "hover:text-blue-500",
                  gradient: "from-blue-400 to-blue-600"
                },
                { 
                  component: Twitter, 
                  href: settings?.socialMedia?.twitter, 
                  color: "hover:text-sky-500",
                  gradient: "from-sky-400 to-blue-500"
                },
                { 
                  component: Instagram, 
                  href: settings?.socialMedia?.instagram, 
                  color: "hover:text-pink-500",
                  gradient: "from-pink-400 to-rose-500"
                },
                { 
                  component: Linkedin, 
                  href: settings?.socialMedia?.linkedin, 
                  color: "hover:text-blue-600",
                  gradient: "from-blue-500 to-indigo-600"
                }
              ].map((social, index) => (
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
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300" style={{ background: index % 2 === 0 ? 'var(--brand-primary)' : 'var(--brand-secondary)' }}>
                      <social.component className="h-6 w-6 text-white" />
                    </div>
                  </motion.a>
                )
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Clean CTA Section */}
      <motion.section
        className="py-32 relative overflow-hidden"
        style={{ background: 'var(--brand-primary)' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8 border border-white/30">
              <Award className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-hero text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            
            <p className="text-subtitle text-white/80 mb-12 max-w-3xl mx-auto">
              Join thousands of students who have found their perfect scholarship through ScholarHunt. 
              Your dream education is just one click away.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/opportunities"
                className="btn btn-lg px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl inline-flex items-center gap-3"
              >
                <BookOpen className="w-6 h-6" />
                Browse Scholarships
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/submit"
                className="btn btn-lg px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 inline-flex items-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                Submit Opportunity
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
