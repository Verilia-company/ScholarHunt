import React from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, User, Tag } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  image?: string;
  readTime?: string;
  category?: string;
  author?: string;
}

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <motion.article
      className="group h-full"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div 
        className="card-glass h-full flex flex-col overflow-hidden group-hover:border-opacity-50 transition-all duration-500"
        style={{ 
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-primary)'
        }}
      >
        {/* Premium Image Section */}
        {post.image && (
          <div className="relative h-48 overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10"
              style={{ background: 'var(--gradient-brand)' }}
            />
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {post.category && (
              <div className="absolute top-4 left-4">
                <span className="badge badge-primary glass-strong">
                  <Tag className="w-3 h-3" />
                  {post.category}
                </span>
              </div>
            )}
            
            {/* Floating Read Time */}
            {post.readTime && (
              <div className="absolute top-4 right-4">
                <div className="glass-strong rounded-full px-3 py-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" style={{ color: 'var(--text-primary)' }} />
                  <span 
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {post.readTime}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Premium Content */}
        <div className="p-6 flex-grow flex flex-col">
          {/* Meta Information */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p 
                  className="text-micro uppercase tracking-wider font-semibold"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Published
                </p>
                <p 
                  className="font-medium text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 
            className="text-title font-bold mb-4 group-hover:text-gradient transition-all duration-300 line-clamp-2 leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            <Link href={`/blog/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p 
            className="text-body line-clamp-3 leading-relaxed mb-6 flex-grow"
            style={{ color: 'var(--text-secondary)' }}
          >
            {post.excerpt}
          </p>

          {/* Author Section */}
          {post.author && (
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p 
                  className="text-micro uppercase tracking-wider font-semibold"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Written by
                </p>
                <p 
                  className="font-medium text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {post.author}
                </p>
              </div>
            </div>
          )}

          {/* Premium Action Button */}
          <motion.div
            className="mt-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="btn btn-secondary w-full group/btn"
            >
              Read Full Article
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}
