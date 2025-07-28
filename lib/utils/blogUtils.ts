/**
 * Calculate estimated reading time for blog content
 */
export function calculateReadingTime(content: string): string {
  if (!content) return "1 min read";

  // Average reading speed is about 200-250 words per minute
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  return `${minutes} min read`;
}

/**
 * Extract key points from blog content for a quick summary
 */
export function extractKeyPoints(content: string): string[] {
  if (!content) return [];

  const keyPoints: string[] = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    const trimmed = line.trim();
    // Extract numbered points
    if (trimmed.match(/^\d+\./)) {
      const match = trimmed.match(/^\d+\.\s*(.*)/);
      if (match && match[1]) {
        keyPoints.push(match[1].replace(/\*\*(.*?)\*\*/g, "$1"));
      }
    }
    // Extract bullet points that look important
    else if (trimmed.startsWith("- ") && trimmed.length > 20) {
      keyPoints.push(trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, "$1"));
    }
    // Extract text that starts with strong markers
    else if (trimmed.includes("**") && trimmed.split("**").length >= 3) {
      const strongText = trimmed.match(/\*\*(.*?)\*\*/);
      if (strongText && strongText[1]) {
        keyPoints.push(strongText[1]);
      }
    }
  });

  return keyPoints.slice(0, 5); // Limit to top 5 key points
}
