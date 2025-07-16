import {
  scholarshipService,
  blogService,
  Scholarship,
  BlogPost,
} from "./firebase/services";

// Search interface
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "scholarship" | "blog";
  url: string;
  relevanceScore: number;
  tags?: string[];
  category?: string;
}

// Search configuration
interface SearchConfig {
  includeScholarships?: boolean;
  includeBlog?: boolean;
  maxResults?: number;
  minRelevanceScore?: number;
}

// Default search configuration
const defaultConfig: SearchConfig = {
  includeScholarships: true,
  includeBlog: true,
  maxResults: 20,
  minRelevanceScore: 0.1,
};

// Text similarity function using simple word matching
function calculateRelevance(
  query: string,
  text: string,
  title?: string
): number {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);
  const textWords = text.toLowerCase().split(/\s+/);
  const titleWords = title ? title.toLowerCase().split(/\s+/) : [];

  let score = 0;
  let titleScore = 0;

  queryWords.forEach((queryWord) => {
    // Exact matches in title get higher score
    if (titleWords.some((titleWord) => titleWord.includes(queryWord))) {
      titleScore += 2;
    }

    // Partial matches in title
    if (
      titleWords.some(
        (titleWord) =>
          titleWord.includes(queryWord) || queryWord.includes(titleWord)
      )
    ) {
      titleScore += 1;
    }

    // Matches in text content
    if (
      textWords.some(
        (textWord) =>
          textWord.includes(queryWord) || queryWord.includes(textWord)
      )
    ) {
      score += 1;
    }
  });

  // Normalize score
  const totalScore = (titleScore * 2 + score) / queryWords.length;
  return Math.min(totalScore / 3, 1); // Cap at 1.0
}

// Search scholarships
async function searchScholarships(query: string): Promise<SearchResult[]> {
  try {
    const scholarships = await scholarshipService.getActiveScholarships();

    return scholarships.map((scholarship: Scholarship) => {
      const searchableText = [
        scholarship.title,
        scholarship.description,
        scholarship.provider || "",
        scholarship.location || "",
        scholarship.fieldOfStudy,
        scholarship.level,
        scholarship.type || "",
        ...(scholarship.eligibility || []),
      ].join(" ");

      const relevanceScore = calculateRelevance(
        query,
        searchableText,
        scholarship.title
      );      const validTags = [
        scholarship.type,
        scholarship.level,
        scholarship.location,
      ].filter((tag): tag is string => typeof tag === 'string' && tag.length > 0);

      return {
        id: scholarship.id,
        title: scholarship.title,
        description: scholarship.description,
        type: "scholarship" as const,
        url: `/scholarships/${scholarship.id}`,
        relevanceScore,
        tags: validTags,
        category: scholarship.fieldOfStudy,
      };
    });
  } catch (error) {
    console.error("Error searching scholarships:", error);
    return [];
  }
}

// Search blog posts
async function searchBlog(query: string): Promise<SearchResult[]> {
  try {
    const blogPosts = await blogService.getPublishedPosts();

    return blogPosts.map((post: BlogPost) => {
      const searchableText = [
        post.title,
        post.excerpt,
        post.content,
        ...(post.tags || []),
        post.category,
        post.author,
      ].join(" ");

      const relevanceScore = calculateRelevance(
        query,
        searchableText,
        post.title
      );

      return {
        id: post.id,
        title: post.title,
        description: post.excerpt,
        type: "blog" as const,
        url: `/blog/${post.slug}`,
        relevanceScore,
        tags: post.tags,
        category: post.category,
      };
    });
  } catch (error) {
    console.error("Error searching blog posts:", error);
    return [];
  }
}

// Main search function
export async function searchContent(
  query: string,
  config: SearchConfig = {}
): Promise<SearchResult[]> {
  const mergedConfig = { ...defaultConfig, ...config };

  if (!query || query.trim().length < 2) {
    return [];
  }

  const results: SearchResult[] = [];

  // Search scholarships
  if (mergedConfig.includeScholarships) {
    const scholarshipResults = await searchScholarships(query);
    results.push(...scholarshipResults);
  }

  // Search blog posts
  if (mergedConfig.includeBlog) {
    const blogResults = await searchBlog(query);
    results.push(...blogResults);
  }

  // Filter by minimum relevance score
  const filteredResults = results.filter(
    (result) => result.relevanceScore >= mergedConfig.minRelevanceScore!
  );

  // Sort by relevance score (descending)
  filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Limit results
  return filteredResults.slice(0, mergedConfig.maxResults);
}

// Get search suggestions based on popular terms
export function getSearchSuggestions(query: string): string[] {
  const suggestions = [
    // Scholarship types
    "undergraduate scholarships",
    "graduate scholarships",
    "PhD scholarships",
    "masters scholarships",
    "medical scholarships",
    "engineering scholarships",
    "business scholarships",
    "STEM scholarships",

    // Locations
    "UK scholarships",
    "USA scholarships",
    "Canada scholarships",
    "Germany scholarships",
    "Australia scholarships",
    "scholarships for Ugandan students",

    // Providers
    "Mastercard Foundation",
    "DAAD scholarships",
    "Chevening scholarships",
    "Commonwealth scholarships",
    "Fulbright scholarships",

    // General terms
    "full funding scholarships",
    "partial scholarships",
    "need-based scholarships",
    "merit scholarships",
    "scholarship application tips",
    "scholarship essay writing",
    "scholarship interviews",
  ];

  if (!query || query.length < 2) {
    return suggestions.slice(0, 8);
  }

  const queryLower = query.toLowerCase();
  const filtered = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(queryLower)
  );

  return filtered.slice(0, 6);
}

// Advanced search with filters
export interface AdvancedSearchParams {
  query?: string;
  type?: "scholarship" | "blog" | "all";
  category?: string;
  level?: string;
  location?: string;
  provider?: string;
  fundingType?: string;
  deadline?: "upcoming" | "thisMonth" | "nextMonth";
}

export async function advancedSearch(params: AdvancedSearchParams): Promise<SearchResult[]> {
  let results: SearchResult[] = [];

  // Basic search first
  if (params.query) {
    const searchConfig: SearchConfig = {
      includeScholarships: params.type !== "blog",
      includeBlog: params.type !== "scholarship",
    };
    results = await searchContent(params.query, searchConfig);
  } else {
    // If no query, get all content
    if (params.type !== "blog") {
      const scholarshipResults = await searchScholarships("");
      results.push(...scholarshipResults);
    }
    if (params.type !== "scholarship") {
      const blogResults = await searchBlog("");
      results.push(...blogResults);
    }
  }

  // Apply filters
  if (params.category) {
    results = results.filter((result) =>
      result.category?.toLowerCase().includes(params.category!.toLowerCase())
    );
  }

  // For scholarships, apply additional filters
  if (
    params.level ||
    params.location ||
    params.provider ||
    params.fundingType
  ) {
    // Get all scholarships for filtering
    const scholarships = await scholarshipService.getActiveScholarships();
    
    results = results.filter((result) => {
      if (result.type !== "scholarship") return true;

      const scholarship = scholarships.find(
        (s: Scholarship) => s.id.toString() === result.id
      );
      if (!scholarship) return false;

      if (params.level && scholarship.level !== params.level) return false;
      if (
        params.location &&
        scholarship.location &&
        !scholarship.location
          .toLowerCase()
          .includes(params.location.toLowerCase())
      )
        return false;
      if (
        params.provider &&
        scholarship.provider &&
        !scholarship.provider
          .toLowerCase()
          .includes(params.provider.toLowerCase())
      )
        return false;
      if (params.fundingType && scholarship.type !== params.fundingType)
        return false;

      return true;
    });
  }

  return results;
}

// Get popular search terms for analytics
export function getPopularSearchTerms(): string[] {
  return [
    "undergraduate scholarships",
    "masters scholarships",
    "UK scholarships",
    "USA scholarships",
    "medical scholarships",
    "engineering scholarships",
    "Mastercard Foundation",
    "full funding",
    "application tips",
    "essay writing",
  ];
}
