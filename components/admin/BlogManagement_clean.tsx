"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  BookOpen,
  Tag,
  Save,
  X,
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
  readTime: number;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  socialImage?: string;
}

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockPosts: BlogPost[] = [
      {
        id: "1",
        title: "How to Write a Winning Scholarship Essay",
        slug: "how-to-write-winning-scholarship-essay",
        excerpt:
          "Learn the key strategies for crafting compelling scholarship essays that stand out to admissions committees.",
        content: "Full blog post content here...",
        author: "Sarah Johnson",
        category: "Tips & Guides",
        tags: ["essays", "scholarships", "writing"],
        featured: true,
        published: true,
        publishedAt: new Date("2024-01-15"),
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-15"),
        image: "/blog/scholarship-essay.jpg",
        readTime: 8,
        metaTitle: "How to Write a Winning Scholarship Essay - ScholarHunt",
        metaDescription:
          "Master the art of scholarship essay writing with proven strategies and tips that help students secure funding for their education.",
        focusKeyword: "scholarship essay",
        canonicalUrl:
          "https://scholarhunt.com/blog/how-to-write-winning-scholarship-essay",
        socialImage: "/blog/scholarship-essay-social.jpg",
      },
      {
        id: "2",
        title: "Top 10 International Scholarships for 2024",
        slug: "top-10-international-scholarships-2024",
        excerpt:
          "Discover the most prestigious international scholarship opportunities available this year.",
        content: "Full blog post content here...",
        author: "Michael Chen",
        category: "Opportunities",
        tags: ["international", "scholarships", "2024"],
        featured: false,
        published: true,
        publishedAt: new Date("2024-01-20"),
        createdAt: new Date("2024-01-18"),
        updatedAt: new Date("2024-01-20"),
        image: "/blog/international-scholarships.jpg",
        readTime: 12,
      },
      {
        id: "3",
        title: "Scholarship Application Mistakes to Avoid",
        slug: "scholarship-application-mistakes-to-avoid",
        excerpt:
          "Common pitfalls that can hurt your scholarship applications and how to avoid them.",
        content: "Full blog post content here...",
        author: "Emily Davis",
        category: "Tips & Guides",
        tags: ["applications", "mistakes", "advice"],
        featured: false,
        published: false,
        createdAt: new Date("2024-01-25"),
        updatedAt: new Date("2024-01-25"),
        readTime: 6,
      },
    ];

    setTimeout(() => {
      setPosts(mockPosts);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter posts based on search and filters
  useEffect(() => {
    let filtered = posts;

    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((post) => post.category === categoryFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((post) =>
        statusFilter === "published" ? post.published : !post.published
      );
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, categoryFilter, statusFilter]);

  const categories = Array.from(new Set(posts.map((post) => post.category)));

  const handleDeletePost = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      setPosts(posts.filter((post) => post.id !== id));
    }
  };

  const handleTogglePublished = (id: string) => {
    setPosts(
      posts.map((post) =>
        post.id === id
          ? {
              ...post,
              published: !post.published,
              publishedAt: !post.published ? new Date() : undefined,
            }
          : post
      )
    );
  };

  const handleToggleFeatured = (id: string) => {
    setPosts(
      posts.map((post) =>
        post.id === id ? { ...post, featured: !post.featured } : post
      )
    );
  };

  const handleAddPost = (
    newPost: Omit<BlogPost, "id" | "createdAt" | "updatedAt">
  ) => {
    const post: BlogPost = {
      ...newPost,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPosts([post, ...posts]);
    setIsAddingPost(false);
  };

  const handleEditPost = (
    updatedPostData: Omit<BlogPost, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!editingPost) return;

    const updatedPost: BlogPost = {
      ...editingPost,
      ...updatedPostData,
      updatedAt: new Date(),
    };

    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
    setEditingPost(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          <span className="text-gray-600">Loading blog posts...</span>
        </div>
      </div>
    );
  }

  // Post Form Component
  const PostForm = ({
    post,
    onSave,
    onCancel,
  }: {
    post?: BlogPost;
    onSave: (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      author: post?.author || "",
      category: post?.category || "",
      tags: post?.tags?.join(", ") || "",
      featured: post?.featured || false,
      published: post?.published || false,
      image: post?.image || "",
      readTime: post?.readTime || 5,
      // SEO fields
      metaTitle: post?.metaTitle || "",
      metaDescription: post?.metaDescription || "",
      focusKeyword: post?.focusKeyword || "",
      canonicalUrl: post?.canonicalUrl || "",
      socialImage: post?.socialImage || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // Generate slug from title if not provided
      const slug =
        formData.slug ||
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      onSave({
        ...formData,
        slug,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        publishedAt: formData.published ? new Date() : undefined,
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {post ? "Edit Post" : "Add New Post"}
              </h3>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter post title"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="auto-generated-from-title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="Tips & Guides">Tips & Guides</option>
                    <option value="Opportunities">Opportunities</option>
                    <option value="Success Stories">Success Stories</option>
                    <option value="News">News</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        readTime: parseInt(e.target.value) || 5,
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="scholarship, education, tips"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Brief description of the post..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Write your blog post content here..."
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Featured Post
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData({ ...formData, published: e.target.checked })
                    }
                    className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Publish Immediately
                  </span>
                </label>
              </div>

              {/* SEO Section */}
              <div className="pt-4 sm:pt-6 border-t border-gray-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
                  SEO Optimization
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, metaTitle: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="SEO-optimized title (60 chars max)"
                      maxLength={60}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.metaTitle.length}/60 characters
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Focus Keyword
                    </label>
                    <input
                      type="text"
                      value={formData.focusKeyword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          focusKeyword: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Primary keyword for SEO"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metaDescription: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Brief description for search engines (160 chars max)"
                      maxLength={160}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.metaDescription.length}/160 characters
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={formData.canonicalUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          canonicalUrl: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="https://example.com/canonical-url"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Social Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialImage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialImage: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="https://example.com/social-image.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Save className="h-4 w-4" />
                {post ? "Update Post" : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Add New Post Modal */}
      {isAddingPost && (
        <PostForm
          onSave={handleAddPost}
          onCancel={() => setIsAddingPost(false)}
        />
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <PostForm
          post={editingPost}
          onSave={handleEditPost}
          onCancel={() => setEditingPost(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Blog Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Create, edit, and manage your blog posts
          </p>
        </div>
        <button
          onClick={() => setIsAddingPost(true)}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Add New Post</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Posts
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {posts.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <Eye className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Published
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {posts.filter((p) => p.published).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
              <Edit className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Drafts
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {posts.filter((p) => !p.published).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
              <Tag className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Featured
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {posts.filter((p) => p.featured).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Author
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Date
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      {post.image && (
                        <div className="w-full sm:w-12 h-8 sm:h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {post.title}
                          </p>
                          {post.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    {post.author}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    {post.category}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        post.published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                    {post.publishedAt
                      ? post.publishedAt.toLocaleDateString()
                      : post.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => setEditingPost(post)}
                        className="p-1 sm:p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => handleTogglePublished(post.id)}
                        className="p-1 sm:p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                        title={post.published ? "Unpublish" : "Publish"}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(post.id)}
                        className="p-1 sm:p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded"
                        title={post.featured ? "Unfeature" : "Feature"}
                      >
                        <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1 sm:p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No blog posts found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || categoryFilter || statusFilter
                ? "Try adjusting your search or filters."
                : "Get started by creating your first blog post."}
            </p>
            {!searchQuery && !categoryFilter && !statusFilter && (
              <div className="mt-6">
                <button
                  onClick={() => setIsAddingPost(true)}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
