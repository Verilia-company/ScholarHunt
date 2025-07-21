"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Users,
  Settings,
  BarChart3,
  ChevronRight,
  Home,
  Activity as ActivityIcon,
  TrendingUp,
  Clock,
  RefreshCw,
  Bell,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ScholarshipManagement from "@/components/admin/ScholarshipManagement";
import BlogManagement from "@/components/admin/BlogManagement";
import AdminSettings from "@/components/admin/AdminSettings";
import UserManagement from "@/components/admin/UserManagement";
import { useAuth } from "@/contexts/AuthContext";
import {
  analyticsService,
  type Activity,
  type AdminStats,
} from "@/lib/firebase/services";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  
  const { user, userProfile, loading, isAdmin } = useAuth();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Valid tabs for navigation
  const validTabs = ["overview", "scholarships", "blogs", "users", "settings"];
  const activeTab = validTabs.includes(currentTab) ? currentTab : "overview";

  // Animation refs
  const [overviewRef, overviewInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.1, triggerOnce: true }); 
 const handleTabChange = (tabId: string) => {
    if (tabId === "overview") {
      router.push("/admin", { scroll: false });
    } else {
      router.push(`/admin?tab=${tabId}`, { scroll: false });
    }
  };

  const handleBackToOverview = () => {
    router.push("/admin", { scroll: false });
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAdmin || !user) return;

      try {
        setStatsLoading(true);
        const [stats, activities] = await Promise.all([
          analyticsService.getAdminStats(),
          analyticsService.getRecentActivities(6),
        ]);

        setAdminStats(stats);
        setRecentActivities(activities);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setAdminStats({
          totalScholarships: 0,
          totalBlogPosts: 0,
          totalUsers: 0,
          monthlyViews: 0,
          pendingApplications: 0,
          publishedBlogs: 0,
          activeScholarships: 0,
          newsletterSubscribers: 0,
        });
        setRecentActivities([]);
      } finally {
        setStatsLoading(false);
      }
    };

    loadDashboardData();
  }, [isAdmin, user]);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Format time for activities
  const formatTimeAgo = (timestamp: unknown): string => {
    if (!timestamp) return "Unknown";

    const now = new Date();
    let activityTime: Date;

    // Handle Firestore Timestamp objects
    if (
      typeof timestamp === "object" &&
      timestamp !== null &&
      "toDate" in timestamp &&
      typeof (timestamp as { toDate: unknown }).toDate === "function"
    ) {
      activityTime = (timestamp as { toDate: () => Date }).toDate();
    } else if (timestamp instanceof Date) {
      activityTime = timestamp;
    } else if (typeof timestamp === "string" || typeof timestamp === "number") {
      activityTime = new Date(timestamp);
    } else {
      // Try to convert to Date
      try {
        return "Unknown";
      } catch (error) {
        console.warn("Error converting timestamp:", error);
        return "Unknown";
      }
    }

    const diffInSeconds = Math.floor(
      (now.getTime() - activityTime.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return activityTime.toLocaleDateString();
  };

  const stats = adminStats
    ? [
        {
          label: "Active Scholarships",
          value: adminStats.activeScholarships.toString(),
          icon: GraduationCap,
          gradient: "from-blue-500 to-indigo-600",
        },
        {
          label: "Published Blogs",
          value: adminStats.publishedBlogs.toString(),
          icon: BookOpen,
          gradient: "from-emerald-500 to-teal-600",
        },
        {
          label: "Total Users",
          value: adminStats.totalUsers.toString(),
          icon: Users,
          gradient: "from-purple-500 to-violet-600",
        },
        {
          label: "Monthly Views",
          value: formatNumber(adminStats.monthlyViews),
          icon: BarChart3,
          gradient: "from-orange-500 to-red-600",
        },
      ]
    : [];  
// Show loading state while checking admin access
  if (loading || (user && !userProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="card-glass p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>
              {loading ? "Loading..." : "Loading profile..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Check admin access
  if (!user || !userProfile || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              Access Denied
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              You need admin privileges to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3, description: "Dashboard statistics and recent activity" },
    { id: "scholarships", label: "Scholarships", icon: GraduationCap, description: "Manage scholarship listings" },
    { id: "blogs", label: "Blog Posts", icon: BookOpen, description: "Create and manage blog content" },
    { id: "users", label: "Users", icon: Users, description: "Manage user accounts and permissions" },
    { id: "settings", label: "Settings", icon: Settings, description: "Configure site settings and preferences" },
  ];

  const currentTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Revolutionary Breadcrumb Navigation */}
        <motion.nav 
          className="flex mb-8" 
          aria-label="Breadcrumb"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ol className="inline-flex items-center space-x-2">
            <li className="inline-flex items-center">
              <motion.button
                onClick={() => router.push("/")}
                className="inline-flex items-center text-sm font-medium glass rounded-lg px-3 py-2 hover:bg-opacity-80 transition-all duration-200 focus-ring"
                style={{ color: 'var(--text-secondary)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </motion.button>
            </li>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <li>
              <motion.button
                onClick={handleBackToOverview}
                className={`text-sm font-medium glass rounded-lg px-3 py-2 transition-all duration-200 focus-ring ${
                  activeTab === "overview" 
                    ? "cursor-default opacity-60" 
                    : "hover:bg-opacity-80"
                }`}
                style={{ color: activeTab === "overview" ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                disabled={activeTab === "overview"}
                whileHover={activeTab !== "overview" ? { scale: 1.02 } : {}}
                whileTap={activeTab !== "overview" ? { scale: 0.98 } : {}}
              >
                Admin Dashboard
              </motion.button>
            </li>
            {activeTab !== "overview" && (
              <>
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <li aria-current="page">
                  <span 
                    className="text-sm font-medium glass rounded-lg px-3 py-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {currentTabData.label}
                  </span>
                </li>
              </>
            )}
          </ol>
          
          {/* Premium Action Buttons */}
          <div className="ml-auto flex items-center gap-3">
            <motion.button
              onClick={() => window.location.reload()}
              className="glass rounded-lg p-2 hover:bg-opacity-80 transition-all duration-200 focus-ring"
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
            
            <motion.button
              className="glass rounded-lg p-2 hover:bg-opacity-80 transition-all duration-200 focus-ring relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Notifications"
            >
              <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </motion.button>
          </div>
        </motion.nav> 
       {/* Revolutionary Dashboard Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'var(--brand-primary)' }}>
                <currentTabData.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-hero" style={{ color: 'var(--text-primary)' }}>
                  {activeTab === "overview" ? "Admin Dashboard" : currentTabData.label}
                </h1>
                <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  {currentTabData.description}
                </p>
              </div>
            </div>
            
            {/* Premium Status Indicators */}
            <div className="flex items-center gap-4">
              <div className="glass rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    System Online
                  </span>
                </div>
              </div>
              
              <div className="glass rounded-lg px-3 py-2">
                <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  /admin{activeTab !== "overview" ? `?tab=${activeTab}` : ""}
                </span>
              </div>
            </div>
          </div>
        </motion.div>     
   {/* Revolutionary Navigation Tabs */}
        <motion.div 
          className="mb-12 glass-strong rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border-primary)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <nav className="flex overflow-x-auto scrollbar-hide flex-1 gap-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap relative ${
                      isActive
                        ? "text-white shadow-lg"
                        : "hover:bg-opacity-80"
                    }`}
                    style={{
                      background: isActive ? 'var(--brand-primary)' : 'var(--bg-glass)',
                      color: isActive ? 'white' : 'var(--text-secondary)'
                    }}
                    title={`${tab.description} (Alt+${index + 1})`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">
                      {tab.label === "Scholarships"
                        ? "Schol."
                        : tab.label === "Blog Posts"
                        ? "Blogs"
                        : tab.label}
                    </span>
                    <span className="hidden lg:inline ml-2 text-xs opacity-60">
                      Alt+{index + 1}
                    </span>
                  </motion.button>
                );
              })}
            </nav>
            
            <div className="hidden md:flex items-center gap-4 ml-6">
              <div className="glass rounded-lg px-3 py-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  Alt+1-5: Navigate • Alt+B: Back • Alt+H: Home
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Revolutionary Overview Tab */}
        {activeTab === "overview" && (
          <motion.div 
            ref={overviewRef}
            className="space-y-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: overviewInView ? 1 : 0, y: overviewInView ? 0 : 20 }}
            transition={{ duration: 0.6 }}
          >
            {/* Premium Stats Grid */}
            <motion.div 
              ref={statsRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {statsLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <motion.div
                      key={index}
                      className="card-glass p-6 animate-pulse"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl animate-shimmer"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded mb-2 animate-shimmer"></div>
                          <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-3/4 animate-shimmer"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                : stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={index}
                        className="card-glass p-6 group hover:scale-105 transition-all duration-300"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 50 }}
                        transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow" style={{ background: 'var(--brand-primary)' }}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <p 
                              className="text-sm font-medium mb-1"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {stat.label}
                            </p>
                            <motion.p 
                              className="text-3xl font-bold"
                              style={{ color: 'var(--text-primary)' }}
                              initial={{ scale: 0.5 }}
                              animate={{ scale: statsInView ? 1 : 0.5 }}
                              transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                            >
                              {stat.value}
                            </motion.p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-medium text-green-600">
                            +12% from last month
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
            </motion.div>        
    {/* Revolutionary Quick Actions */}
            <motion.div 
              className="card-glass p-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: overviewInView ? 1 : 0, y: overviewInView ? 0 : 30 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--brand-primary)' }}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-title font-bold" style={{ color: 'var(--text-primary)' }}>
                    Quick Actions
                  </h2>
                  <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                    Jump to common tasks
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    action: () => handleTabChange("scholarships"),
                    icon: GraduationCap,
                    title: "Add Scholarship",
                    description: "Create new scholarship listing",
                    gradient: "from-blue-500 to-indigo-600",
                    hoverColor: "hover:border-blue-400"
                  },
                  {
                    action: () => handleTabChange("blogs"),
                    icon: BookOpen,
                    title: "Write Blog Post",
                    description: "Create educational content",
                    gradient: "from-emerald-500 to-teal-600",
                    hoverColor: "hover:border-emerald-400"
                  },
                  {
                    action: () => handleTabChange("settings"),
                    icon: Settings,
                    title: "Manage Settings",
                    description: "Configure site preferences",
                    gradient: "from-purple-500 to-violet-600",
                    hoverColor: "hover:border-purple-400"
                  }
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={item.action}
                    className={`glass p-6 rounded-2xl border-2 border-transparent ${item.hoverColor} transition-all duration-300 group text-left`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: overviewInView ? 1 : 0, y: overviewInView ? 0 : 20 }}
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'var(--brand-primary)' }}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {item.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>     
       {/* Revolutionary Recent Activity */}
            <motion.div 
              className="card-glass p-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: overviewInView ? 1 : 0, y: overviewInView ? 0 : 30 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--brand-secondary)' }}>
                    <ActivityIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-title font-bold" style={{ color: 'var(--text-primary)' }}>
                      Recent Activity
                    </h2>
                    <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                      Latest system events and user actions
                    </p>
                  </div>
                </div>
                
                <motion.button
                  className="glass rounded-lg px-4 py-2 hover:bg-opacity-80 transition-all duration-200 focus-ring"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    View All
                  </span>
                </motion.button>
              </div>
              
              <div className="space-y-4">
                {statsLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <motion.div
                      key={index}
                      className="glass p-4 rounded-xl animate-pulse"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full animate-shimmer"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded mb-2 animate-shimmer"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-3/4 animate-shimmer"></div>
                        </div>
                        <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-20 animate-shimmer"></div>
                      </div>
                    </motion.div>
                  ))
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id || index}
                      className="glass p-4 rounded-xl hover:bg-opacity-80 transition-all duration-200 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: overviewInView ? 1 : 0, x: overviewInView ? 0 : -20 }}
                      transition={{ duration: 0.4, delay: 1.3 + index * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-primary)' }}>
                          <ActivityIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p 
                            className="font-semibold mb-1 group-hover:text-gradient transition-all duration-200"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {activity.action}
                          </p>
                          <p 
                            className="text-sm line-clamp-1 mb-1"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {activity.item}
                          </p>
                          {activity.userName && (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                                <Users className="w-2 h-2 text-white" />
                              </div>
                              <span 
                                className="text-xs font-medium"
                                style={{ color: 'var(--text-tertiary)' }}
                              >
                                by {activity.userName}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Clock className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                          <span 
                            className="text-sm font-medium"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: overviewInView ? 1 : 0, scale: overviewInView ? 1 : 0.9 }}
                    transition={{ duration: 0.6, delay: 1.3 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h3 
                      className="text-lg font-bold mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      No Recent Activity
                    </h3>
                    <p 
                      className="text-sm max-w-md mx-auto"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Activities will appear here when users interact with your site. 
                      Start by creating some content!
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Other Tab Sections */}
        {activeTab === "scholarships" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleBackToOverview}
                className="inline-flex items-center text-sm glass rounded-lg px-3 py-2 hover:bg-opacity-80 transition-all duration-200 focus-ring"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                Back to Overview
              </button>
              <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Admin → Scholarships
              </div>
            </div>
            <ScholarshipManagement />
          </div>
        )}

        {activeTab === "blogs" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleBackToOverview}
                className="inline-flex items-center text-sm glass rounded-lg px-3 py-2 hover:bg-opacity-80 transition-all duration-200 focus-ring"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                Back to Overview
              </button>
              <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Admin → Blog Posts
              </div>
            </div>
            <BlogManagement />
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleBackToOverview}
                className="inline-flex items-center text-sm glass rounded-lg px-3 py-2 hover:bg-opacity-80 transition-all duration-200 focus-ring"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                Back to Overview
              </button>
              <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Admin → Users
              </div>
            </div>
            <UserManagement />
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleBackToOverview}
                className="inline-flex items-center text-sm glass rounded-lg px-3 py-2 hover:bg-opacity-80 transition-all duration-200 focus-ring"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                Back to Overview
              </button>
              <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Admin → Settings
              </div>
            </div>
            <AdminSettings />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}