"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Google Analytics tracking
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""; // Use environment variable

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag && GA_TRACKING_ID) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && window.gtag && GA_TRACKING_ID) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Enhanced tracking with user context and session data
interface UserContext {
  userId?: string;
  userType?: 'anonymous' | 'registered' | 'admin';
  sessionId?: string;
  referrer?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

// Get user context for enhanced tracking
const getUserContext = (): UserContext => {
  if (typeof window === 'undefined') return {};
  
  return {
    sessionId: sessionStorage.getItem('sessionId') || generateSessionId(),
    referrer: document.referrer || 'direct',
    deviceType: getDeviceType(),
  };
};

const generateSessionId = (): string => {
  const sessionId = Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('sessionId', sessionId);
  return sessionId;
};

const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Enhanced event tracking with context
const enhancedEvent = (eventData: {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}) => {
  const context = getUserContext();
  
  if (typeof window !== "undefined" && window.gtag && GA_TRACKING_ID) {
    window.gtag("event", eventData.action, {
      event_category: eventData.category,
      event_label: eventData.label,
      value: eventData.value,
      session_id: context.sessionId,
      device_type: context.deviceType,
      referrer: context.referrer,
      ...eventData.customParameters,
    });
  }
};

// Pre-defined events for scholarship website with enhanced tracking
export const trackEvents = {
  // Scholarship interactions with enhanced data
  scholarshipView: (scholarshipData: {
    scholarshipId: string;
    scholarshipName: string;
    provider?: string;
    type?: string;
    amount?: string;
    deadline?: string;
    source?: string; // where user came from
  }) => {
    enhancedEvent({
      action: "view_scholarship",
      category: "Scholarship",
      label: `${scholarshipData.scholarshipId}: ${scholarshipData.scholarshipName}`,
      customParameters: {
        scholarship_provider: scholarshipData.provider,
        scholarship_type: scholarshipData.type,
        scholarship_amount: scholarshipData.amount,
        scholarship_deadline: scholarshipData.deadline,
        traffic_source: scholarshipData.source,
      },
    });
  },

  scholarshipApply: (scholarshipData: {
    scholarshipId: string;
    scholarshipName: string;
    provider?: string;
    type?: string;
    timeSpentViewing?: number;
  }) => {
    enhancedEvent({
      action: "apply_scholarship",
      category: "Scholarship",
      label: `${scholarshipData.scholarshipId}: ${scholarshipData.scholarshipName}`,
      value: scholarshipData.timeSpentViewing,
      customParameters: {
        scholarship_provider: scholarshipData.provider,
        scholarship_type: scholarshipData.type,
        conversion_time: scholarshipData.timeSpentViewing,
      },
    });
  },

  scholarshipShare: (scholarshipId: string, platform: string, scholarshipName?: string) => {
    enhancedEvent({
      action: "share_scholarship",
      category: "Scholarship",
      label: `${scholarshipId}: ${platform}`,
      customParameters: {
        share_platform: platform,
        scholarship_name: scholarshipName,
      },
    });
  },

  scholarshipCardClick: (scholarshipData: {
    scholarshipId: string;
    scholarshipTitle: string;
    scholarshipProvider: string;
    scholarshipType: string;
    scholarshipAmount: string;
    daysRemaining: number;
    cardPosition?: number;
    listType?: 'featured' | 'search' | 'category';
  }) => {
    enhancedEvent({
      action: "click_scholarship_card",
      category: "Scholarship",
      label: `${scholarshipData.scholarshipId}: ${scholarshipData.scholarshipTitle}`,
      value: scholarshipData.daysRemaining,
      customParameters: {
        scholarship_provider: scholarshipData.scholarshipProvider,
        scholarship_type: scholarshipData.scholarshipType,
        scholarship_amount: scholarshipData.scholarshipAmount,
        days_remaining: scholarshipData.daysRemaining,
        card_position: scholarshipData.cardPosition,
        list_type: scholarshipData.listType,
      },
    });
  },

  // Enhanced search interactions
  searchPerformed: (searchData: {
    searchTerm: string;
    resultsCount: number;
    searchType?: 'general' | 'scholarship' | 'blog';
    filtersApplied?: string[];
    source?: 'homepage' | 'opportunities' | 'navbar';
  }) => {
    enhancedEvent({
      action: "search",
      category: "Search",
      label: searchData.searchTerm,
      value: searchData.resultsCount,
      customParameters: {
        search_type: searchData.searchType,
        filters_applied: searchData.filtersApplied?.join(','),
        search_source: searchData.source,
        results_count: searchData.resultsCount,
      },
    });
  },

  // Enhanced filter usage
  filterApplied: (filterData: {
    filterType: string;
    filterValue: string;
    activeFilters?: Record<string, string>;
    resultsCount?: number;
  }) => {
    enhancedEvent({
      action: "filter_applied",
      category: "Filter",
      label: `${filterData.filterType}: ${filterData.filterValue}`,
      value: filterData.resultsCount,
      customParameters: {
        filter_type: filterData.filterType,
        filter_value: filterData.filterValue,
        active_filters: JSON.stringify(filterData.activeFilters),
        results_after_filter: filterData.resultsCount,
      },
    });
  },

  // Enhanced blog interactions
  blogPostView: (blogData: {
    postSlug: string;
    postTitle: string;
    category?: string;
    author?: string;
    readTime?: string;
    source?: string;
  }) => {
    enhancedEvent({
      action: "view_blog_post",
      category: "Blog",
      label: `${blogData.postSlug}: ${blogData.postTitle}`,
      customParameters: {
        blog_category: blogData.category,
        blog_author: blogData.author,
        estimated_read_time: blogData.readTime,
        traffic_source: blogData.source,
      },
    });
  },

  // WhatsApp widget interactions
  whatsappWidgetOpen: () => {
    enhancedEvent({
      action: "whatsapp_widget_open",
      category: "WhatsApp",
      label: "widget_opened",
    });
  },

  whatsappMessageSent: (messageData: {
    topic?: string;
    messageLength?: number;
    customMessage?: boolean;
  }) => {
    enhancedEvent({
      action: "whatsapp_message_sent",
      category: "WhatsApp",
      label: messageData.topic || "custom",
      value: messageData.messageLength,
      customParameters: {
        selected_topic: messageData.topic,
        message_length: messageData.messageLength,
        is_custom_message: messageData.customMessage,
      },
    });
  },

  // Admin dashboard interactions
  adminTabSwitch: (fromTab: string, toTab: string) => {
    enhancedEvent({
      action: "admin_tab_switch",
      category: "Admin",
      label: `${fromTab} -> ${toTab}`,
      customParameters: {
        from_tab: fromTab,
        to_tab: toTab,
      },
    });
  },

  adminActionPerformed: (actionData: {
    action: string;
    resource: string;
    resourceId?: string;
    success?: boolean;
  }) => {
    enhancedEvent({
      action: "admin_action",
      category: "Admin",
      label: `${actionData.action}_${actionData.resource}`,
      customParameters: {
        admin_action: actionData.action,
        resource_type: actionData.resource,
        resource_id: actionData.resourceId,
        action_success: actionData.success,
      },
    });
  },

  // Form submissions
  formSubmitted: (formType: string) => {
    event({
      action: "form_submit",
      category: "Form",
      label: formType,
    });
  },

  // Newsletter signup
  newsletterSignup: (location: string) => {
    event({
      action: "newsletter_signup",
      category: "Newsletter",
      label: location,
    });
  }, // Social sharing
  socialShare: (platform: string, contentType: string, contentId: string) => {
    event({
      action: "social_share",
      category: "Social",
      label: `${platform}: ${contentType}:${contentId}`,
    });
  },

  // Page engagement
  timeOnPage: (seconds: number) => {
    event({
      action: "time_on_page",
      category: "Engagement",
      value: seconds,
    });
  },

  // Scroll depth
  scrollDepth: (percentage: number) => {
    event({
      action: "scroll_depth",
      category: "Engagement",
      value: percentage,
    });
  },

  // Authentication events
  authSignInAttempt: (method: string) => {
    event({
      action: "sign_in_attempt",
      category: "Auth",
      label: method,
    });
  },

  authSignInSuccess: (method: string) => {
    event({
      action: "sign_in_success",
      category: "Auth",
      label: method,
    });
  },

  authSignInFailure: (method: string, error: string) => {
    event({
      action: "sign_in_failure",
      category: "Auth",
      label: `${method}: ${error}`,
    });
  },

  authSignOut: () => {
    event({
      action: "sign_out",
      category: "Auth",
    });
  },

  oneTapDisplay: (status: string) => {
    event({
      action: "one_tap_display",
      category: "Auth",
      label: status,
    });
  },
};

// Hook for page view tracking
export function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views when pathname changes
    if (pathname) {
      pageview(pathname);
    }
  }, [pathname]);
}

// Hook for scroll depth tracking
export function useScrollTracking() {
  useEffect(() => {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 100];
    const reached = new Set<number>();

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);

      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;

        // Track milestones
        milestones.forEach((milestone) => {
          if (scrollPercentage >= milestone && !reached.has(milestone)) {
            reached.add(milestone);
            trackEvents.scrollDepth(milestone);
          }
        });
      }
    };

    const throttledScroll = throttle(handleScroll, 500);
    window.addEventListener("scroll", throttledScroll);

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, []);
}

// Hook for time on page tracking
export function useTimeTracking() {
  useEffect(() => {
    const startTime = Date.now();

    const trackTime = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvents.timeOnPage(timeSpent);
    };

    // Track when user leaves the page
    const handleBeforeUnload = () => {
      trackTime();
    };

    // Track when user switches tabs
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackTime();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      trackTime(); // Track final time
    };
  }, []);
}

// Utility function to throttle events
function throttle(func: Function, delay: number) {
  let timeoutId: NodeJS.Timeout;
  let lastExecTime = 0;

  return function (this: any, ...args: any[]) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}
