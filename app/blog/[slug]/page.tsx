"use client";

// app/blog/[slug]/page.tsx

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Tag,
  BookOpen,
  Eye,
  Heart,
} from "lucide-react";
import { blogService, BlogPost } from "@/lib/firebase/services";
import { trackEvents, event } from "@/lib/analytics";
import ShareButtons from "@/components/ShareButtons";
import Layout from "@/components/Layout";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [viewCount, setViewCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const fetchedPost = await blogService.getBlogPostBySlug(resolvedParams.slug);
        
        if (!fetchedPost) {
          notFound();
        }

        setPost(fetchedPost);
        setViewCount(fetchedPost.views || 0);

        // Load related posts
        const allPosts = await blogService.getBlogPosts();
        const related = allPosts
          .filter((p: BlogPost) => p.id !== fetchedPost.id && p.category === fetchedPost.category)
          .slice(0, 3);
        setRelatedPosts(related);

        // Track view
        trackEvents.blogPostView({
          postSlug: fetchedPost.slug,
          postTitle: fetchedPost.title,
          category: fetchedPost.category,
        });

        // Increment view count
        await blogService.incrementViews(fetchedPost.id);
        setViewCount(prev => prev + 1);

      } catch (err) {
        setError("Failed to load blog post");
        console.error("Error loading post:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [params]);

  const handleLike = async () => {
    if (!post || hasLiked) return;

    try {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      // Note: No blogPostLike function exists, so we'll use a generic event
      event({
        action: "like_blog_post",
        category: "Blog",
        label: `${post.slug}: ${post.title}`,
      });
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const formatDate = (date: unknown) => {
    if (!date) return "Unknown date";
    
    let dateObj: Date;
    
    // Handle Firestore Timestamp objects
    if (typeof date === "object" && date !== null && "toDate" in date && typeof (date as { toDate: unknown }).toDate === "function") {
      dateObj = (date as { toDate: () => Date }).toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string" || typeof date === "number") {
      dateObj = new Date(date);
    } else {
      return "Unknown date";
    }
    
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Error Loading Article
              </h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-8">
          <motion.button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </motion.button>
        </div>

        {/* Article Header */}
        <div className="container mx-auto px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            {/* Category and Date */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {post.category}
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime || "5 min read"}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author and Stats */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {post.author || "ScholarHunt Team"}
                  </p>
                  <p className="text-sm text-gray-600">Author</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {viewCount} views
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {likes} likes
                </div>
              </div>
            </div>
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleLike}
                disabled={hasLiked}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  hasLiked
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
                {hasLiked ? "Liked" : "Like this article"}
              </button>

              <ShareButtons
                url={typeof window !== "undefined" ? window.location.href : ""}
                title={post.title}
              />
            </div>
          </motion.div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <div
                    key={relatedPost.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.location.href = `/blog/${relatedPost.slug}`}
                  >
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(relatedPost.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
