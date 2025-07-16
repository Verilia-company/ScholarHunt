import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  BookOpen,
  Eye,
  MousePointer,
  Clock,
  RefreshCw,
  Download,
} from "lucide-react";
import { UserActivity, UserSession } from '@/lib/userTracking';

interface AnalyticsData {
  totalUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number; percentage: number }>;
  deviceBreakdown: Record<string, number>;
  recentActivities: UserActivity[];
  userGrowth: Array<{ date: string; users: number }>;
  popularActions: Array<{ action: string; count: number }>;
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock data for now since UserTrackingService is not exported
      const mockActivities: UserActivity[] = [];
      const mockSessions: UserSession[] = [];

      // Process data for analytics
      const processedData: AnalyticsData = {
        totalUsers: mockSessions.length,
        totalSessions: mockSessions.length,
        averageSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        deviceBreakdown: {},
        recentActivities: mockActivities.slice(0, 10),
        userGrowth: [],
        popularActions: [],
      };

      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Set fallback data
      setAnalyticsData({
        totalUsers: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        deviceBreakdown: {},
        recentActivities: [],
        userGrowth: [],
        popularActions: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return MousePointer;
      case 'tablet': return BookOpen;
      case 'desktop': return GraduationCap;
      default: return MousePointer;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card-glass p-6 animate-pulse">
            <div className="h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded mb-4 animate-shimmer"></div>
            <div className="h-32 bg-gradient-to-r from-gray-300 to-gray-400 rounded animate-shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12" style={{ color: 'var(--text-tertiary)' }} />
        <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          No Analytics Data
        </h3>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Analytics data will appear here once users start interacting with your site.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-hero" style={{ color: 'var(--text-primary)' }}>
            Analytics Dashboard
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive insights into user behavior and site performance
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 glass rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'hover:bg-opacity-80'
                }`}
                style={{ color: timeRange === range ? 'white' : 'var(--text-secondary)' }}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <motion.button
            onClick={handleRefresh}
            className="glass rounded-lg p-3 hover:bg-opacity-80 transition-all duration-200 focus-ring"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={refreshing}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: 'var(--text-secondary)' }} />
          </motion.button>
          
          <motion.button
            className="glass rounded-lg p-3 hover:bg-opacity-80 transition-all duration-200 focus-ring"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Users',
            value: analyticsData.totalUsers.toLocaleString(),
            icon: Users,
            gradient: 'from-blue-500 to-indigo-600',
            trend: '+12%',
            trendUp: true,
          },
          {
            title: 'Total Sessions',
            value: analyticsData.totalSessions.toLocaleString(),
            icon: Eye,
            gradient: 'from-emerald-500 to-teal-600',
            trend: '+8%',
            trendUp: true,
          },
          {
            title: 'Avg. Session Duration',
            value: formatDuration(analyticsData.averageSessionDuration),
            icon: Clock,
            gradient: 'from-purple-500 to-violet-600',
            trend: '+5%',
            trendUp: true,
          },
          {
            title: 'Bounce Rate',
            value: `${analyticsData.bounceRate.toFixed(1)}%`,
            icon: TrendingDown,
            gradient: 'from-orange-500 to-red-600',
            trend: '-3%',
            trendUp: false,
          },
        ].map((metric, index) => (
          <motion.div
            key={index}
            className="card-glass p-6 group hover:scale-105 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${metric.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                metric.trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {metric.trend}
              </div>
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              {metric.title}
            </h3>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {metric.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <motion.div
          className="card-glass p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-title font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Top Pages
          </h3>
          <div className="space-y-4">
            {analyticsData.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {page.page}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${page.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    {page.views}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {page.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Device Breakdown */}
        <motion.div
          className="card-glass p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-title font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Device Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(analyticsData.deviceBreakdown).map(([device, count]) => {
              const Icon = getDeviceIcon(device);
              const total = Object.values(analyticsData.deviceBreakdown).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                      {device}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {count}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        className="card-glass p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3 className="text-title font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Recent User Activities
        </h3>
        <div className="space-y-3">
          {analyticsData.recentActivities.map((activity, index) => (
            <div key={activity.id || index} className="glass p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {activity.resource}: {activity.resourceId}
                  </p>
                </div>
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {activity.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}