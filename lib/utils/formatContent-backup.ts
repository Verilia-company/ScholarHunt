/**
 * Helper function to format scholarship sections with proper hierarchy
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatScholarshipSection(
  title: string,
  description: string,
  bulletPoints: string[]
): string {
  let bulletHtml = "";

  if (bulletPoints.length > 0) {
    const bulletItems = bulletPoints
      .map(
        (point) => `
      <li class="mb-2 flex items-start">
        <span class="w-3 h-3 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
        <span class="text-gray-700 leading-relaxed">${point}</span>
      </li>
    `
      )
      .join("");

    bulletHtml = `
      <ul class="mt-4 space-y-2 list-none pl-0">
        ${bulletItems}
      </ul>
    `;
  }

  return `
    <div class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
      <h4 class="text-xl font-bold text-blue-800 mb-3">${title}</h4>
      ${
        description
          ? `<p class="text-gray-700 leading-relaxed">${description.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="font-semibold">$1</strong>'
            )}</p>`
          : ""
      }
      ${bulletHtml}
    </div>
  `;
}

/**
 * Professional blog content formatter with enhanced section handling
 */
export function formatBlogContentProfessional(content: string): string {
  if (!content) return "";

  // Basic formatting with proper structure
  return content
    .split("\n\n")
    .map((paragraph) => {
      if (!paragraph.trim()) return "";

      // Handle amateur-style headers (single #) and convert them professionally
      if (paragraph.startsWith("# ") && !paragraph.startsWith("## ")) {
        const title = paragraph.substring(2).trim();
        return `
          <div class="mb-12 mt-16 text-center">
            <div class="inline-block p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-lg">
              <h1 class="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${title}
              </h1>
              <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
          </div>
        `;
      }

      // Handle professional introduction paragraphs (including amateur-style intros)
      if (
        paragraph.toLowerCase().includes("scholarships can be life-changing") ||
        paragraph.toLowerCase().includes("in this comprehensive guide") ||
        paragraph.toLowerCase().includes("transform your") ||
        paragraph.toLowerCase().includes("start your journey") ||
        paragraph.toLowerCase().includes("in today's fast-paced world") ||
        paragraph.toLowerCase().includes("there's immense pressure") ||
        (paragraph.toLowerCase().includes("sometimes taking a step back") &&
          paragraph.toLowerCase().includes("beneficial"))
      ) {
        return `
          <div class="mb-10 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-l-4 border-blue-500 shadow-lg">
            <div class="flex items-start">
              <div class="w-2 h-16 bg-gradient-to-b from-blue-500 to-purple-600 rounded mr-6"></div>
              <div class="flex-1">
                <p class="text-xl leading-relaxed text-gray-800 font-medium">
                  ${paragraph.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="font-bold text-blue-700">$1</strong>'
                  )}
                </p>
                <div class="mt-4 flex items-center text-sm text-blue-600">
                  <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <span class="font-medium">Professional Career Guidance</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Handle main headers (##)
      if (paragraph.startsWith("## ")) {
        return `<h2 class="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-3">${paragraph
          .substring(3)
          .trim()}</h2>`;
      }

      // Handle sub-headers (###) - scholarship type sections with special styling
      if (paragraph.startsWith("### ")) {
        const title = paragraph.substring(4).trim();

        // Special styling for scholarship type headers
        if (
          title.includes("Government Scholarships") ||
          title.includes("International Scholarships") ||
          title.includes("Private Foundation Scholarships") ||
          title.includes("Merit-Based Scholarships") ||
          title.includes("Need-Based Scholarships")
        ) {
          return `
            <div class="mb-6 mt-8">
              <h3 class="text-xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                ${title}
              </h3>
            </div>
          `;
        }

        // Regular sub-headers (like university names)
        return `<h3 class="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">${title}</h3>`;
      }

      // Handle professional introduction paragraphs
      if (
        paragraph.toLowerCase().includes("scholarships can be life-changing") ||
        paragraph.toLowerCase().includes("in this comprehensive guide") ||
        paragraph.toLowerCase().includes("transform your") ||
        paragraph.toLowerCase().includes("start your journey")
      ) {
        return `
          <div class="mb-10 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-l-4 border-blue-500 shadow-lg">
            <div class="flex items-start">
              <div class="w-2 h-16 bg-gradient-to-b from-blue-500 to-purple-600 rounded mr-6"></div>
              <div class="flex-1">
                <p class="text-xl leading-relaxed text-gray-800 font-medium">
                  ${paragraph.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="font-bold text-blue-700">$1</strong>'
                  )}
                </p>
                <div class="mt-4 flex items-center text-sm text-blue-600">
                  <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <span class="font-medium">Essential Guide for Ugandan Students</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Handle "Common Mistakes to Avoid" sections with blue bullet points
      if (paragraph.toLowerCase().includes("common mistakes to avoid")) {
        const lines = paragraph.split("\n");
        const title = lines[0].trim();
        const mistakes = lines
          .slice(1)
          .filter((line) => line.trim() && line.trim() !== "-");

        const mistakeItems = mistakes
          .map((mistake) => {
            const cleanMistake = mistake.replace(/^[\s\-\•]+/, "").trim();
            return `
            <li class="mb-3 flex items-start">
              <span class="w-3 h-3 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              <span class="text-gray-700 leading-relaxed">${cleanMistake}</span>
            </li>
          `;
          })
          .join("");

        return `
          <div class="mb-8">
            <h3 class="text-2xl font-bold text-red-700 mb-6">${title}</h3>
            <div class="p-6 bg-red-50 rounded-xl border-l-4 border-red-500">
              <ul class="space-y-2">
                ${mistakeItems}
              </ul>
            </div>
          </div>
        `;
      }

      // Handle nested university listings (university names with bullet point details)
      if (paragraph.includes("\n### ") && paragraph.includes("\n- ")) {
        const sections = paragraph.split("\n### ");
        const formattedSections = sections
          .map((section) => {
            if (!section.trim()) return "";

            const lines = section.split("\n");
            const universityName = lines[0].trim();
            const details = lines
              .slice(1)
              .filter((line) => line.trim().startsWith("- "));

            if (details.length > 0) {
              const detailItems = details
                .map(
                  (detail) =>
                    `<li class="mb-2 flex items-start">
                <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">${detail.substring(2).trim()}</span>
              </li>`
                )
                .join("");

              return `
              <div class="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h4 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">${universityName}</h4>
                <ul class="space-y-2">${detailItems}</ul>
              </div>
            `;
            }
            return `<h4 class="text-xl font-semibold text-gray-800 mb-4">${universityName}</h4>`;
          })
          .join("");

        return `<div class="my-8">${formattedSections}</div>`;
      }

      // Handle numbered lists with enhanced formatting and proper hierarchy
      if (paragraph.match(/^\d+\./m)) {
        const lines = paragraph.split("\n");
        const formattedItems = lines
          .filter((line) => line.match(/^\d+\./))
          .map((line) => {
            // Match numbered items with titles and descriptions: "1. Title Description..."
            const match = line.match(/^(\d+)\.\s*(.+)/);
            if (match) {
              const [, number, content] = match;

              // Check if content has a clear title pattern (first few words before longer description)
              const words = content.split(" ");
              let title = "";
              let description = "";

              // Extract title (usually first 2-4 words that form a concept)
              if (words.length > 5) {
                // Look for natural breaking points like "Taking time", "Financial Stability", etc.
                const titleWords = [];
                for (let i = 0; i < words.length; i++) {
                  titleWords.push(words[i]);
                  // Stop if we have 2-4 words and the next seems like start of description
                  if (titleWords.length >= 2 && titleWords.length <= 4) {
                    const remaining = words.slice(i + 1).join(" ");
                    if (remaining.length > titleWords.join(" ").length * 2) {
                      title = titleWords.join(" ");
                      description = remaining;
                      break;
                    }
                  }
                }

                // Fallback: if no clear break, use first 3 words as title
                if (!title) {
                  title = words.slice(0, 3).join(" ");
                  description = words.slice(3).join(" ");
                }
              } else {
                title = content;
              }

              return `
                <div class="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-start">
                    <span class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 mt-1">${number}</span>
                    <div class="flex-1">
                      <h4 class="text-lg font-medium text-gray-900 mb-2">${title}</h4>
                      ${
                        description
                          ? `<p class="text-gray-700 leading-relaxed text-base">${description}</p>`
                          : ""
                      }
                    </div>
                  </div>
                </div>
              `;
            }
            return `<p class="mb-4">${line}</p>`;
          })
          .join("");
        return `<div class="my-8">${formattedItems}</div>`;
      }

      // Handle bullet lists with blue bullets
      if (paragraph.includes("\n- ") || paragraph.startsWith("- ")) {
        const items = paragraph
          .split("\n")
          .filter((line) => line.trim().startsWith("- "))
          .map(
            (item) => `
            <li class="mb-3 flex items-start">
              <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span class="text-gray-700 leading-relaxed">${item
                .substring(2)
                .trim()
                .replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="font-semibold">$1</strong>'
                )}</span>
            </li>
          `
          )
          .join("");
        return `
          <div class="mb-6">
            <ul class="space-y-2 list-none pl-0">
              ${items}
            </ul>
          </div>
        `;
      }

      // Regular paragraph
      const formatted = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

      return `<p class="mb-6 text-gray-700 leading-relaxed">${formatted}</p>`;
    })
    .filter((p) => p.length > 0)
    .join("");
}

export function formatBlogContentSimple(content: string): string {
  if (!content) return "";

  return content
    .split("\n\n")
    .map((paragraph) => {
      if (!paragraph.trim()) return "";

      // Handle headers
      if (paragraph.startsWith("## ")) {
        return `<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">${paragraph.substring(
          3
        )}</h2>`;
      }
      if (paragraph.startsWith("### ")) {
        return `<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800">${paragraph.substring(
          4
        )}</h3>`;
      }

      // Handle lists
      if (paragraph.includes("\n- ") || paragraph.startsWith("- ")) {
        const items = paragraph
          .split("\n")
          .filter((line) => line.trim().startsWith("- "));
        const listItems = items
          .map((item) => `<li class="mb-1">${item.substring(2)}</li>`)
          .join("");
        return `<ul class="list-disc pl-6 mb-6 space-y-1">${listItems}</ul>`;
      }

      // Regular paragraph
      const formatted = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/\n/g, "<br>");

      return `<p class="mb-4 leading-relaxed">${formatted}</p>`;
    })
    .filter((p) => p.length > 0)
    .join("");
}
