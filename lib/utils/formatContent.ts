/**
 * Helper function to format scholarship sections with proper hierarchy
 */
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
 * Simplified Professional blog content formatter with consistent templates
 */
export function formatBlogContentProfessional(content: string): string {
  if (!content) return "";

  // Split content into sections for consistent processing
  return content
    .split("\n\n")
    .map((paragraph) => {
      if (!paragraph.trim()) return "";

      // Handle main headers (##)
      if (paragraph.startsWith("## ")) {
        const title = paragraph.substring(3).trim();
        return `
          <div class="mb-8 mt-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-500">
              ${title}
            </h2>
          </div>
        `;
      }

      // Handle section headers with nested content (like "Common Mistakes to Avoid")
      if (
        paragraph.includes("\n") &&
        !paragraph.startsWith("- ") &&
        !paragraph.match(/^\d+\./)
      ) {
        const lines = paragraph.split("\n");
        const firstLine = lines[0].trim();
        const restLines = lines.slice(1).filter((line) => line.trim());

        // Check if this looks like a header with bullet points or nested content
        if (restLines.length > 0) {
          const bulletPoints = restLines
            .filter((line) => line.trim().startsWith("- "))
            .map((line) => line.substring(line.indexOf("- ") + 2).trim());

          const nonBulletText = restLines
            .filter((line) => !line.trim().startsWith("- ") && line.trim())
            .join(" ");

          return `
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">
                ${firstLine}
              </h3>
              ${
                nonBulletText
                  ? `<p class="mb-4 text-gray-700 leading-relaxed">${nonBulletText}</p>`
                  : ""
              }
              ${
                bulletPoints.length > 0
                  ? `
                <div class="space-y-3">
                  ${bulletPoints
                    .map(
                      (point) => `
                    <div class="flex items-start">
                      <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span class="text-gray-700 leading-relaxed">${point}</span>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
          `;
        }
      }

      // Handle numbered lists (simplified)
      if (paragraph.match(/^\d+\./m)) {
        const lines = paragraph.split("\n");
        const numberedItems = lines
          .filter((line) => line.match(/^\d+\./))
          .map((line) => {
            const match = line.match(/^(\d+)\.\s*(.+)/);
            if (match) {
              const [, number, content] = match;
              return `
                <div class="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div class="flex items-start">
                    <span class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                      ${number}
                    </span>
                    <div class="flex-1">
                      <p class="text-gray-700 leading-relaxed">${content.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="font-semibold">$1</strong>'
                      )}</p>
                    </div>
                  </div>
                </div>
              `;
            }
            return "";
          })
          .join("");

        return `<div class="mb-8">${numberedItems}</div>`;
      }

      // Handle simple bullet lists
      if (paragraph.includes("\n- ") || paragraph.startsWith("- ")) {
        const bulletPoints = paragraph
          .split("\n")
          .filter((line) => line.trim().startsWith("- "))
          .map((line) => line.substring(line.indexOf("- ") + 2).trim());

        return `
          <div class="mb-6 space-y-3">
            ${bulletPoints
              .map(
                (point) => `
              <div class="flex items-start">
                <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span class="text-gray-700 leading-relaxed">${point}</span>
              </div>
            `
              )
              .join("")}
          </div>
        `;
      }

      // Handle professional introduction paragraphs
      if (
        paragraph.toLowerCase().includes("scholarships can be life-changing") ||
        paragraph.toLowerCase().includes("comprehensive guide") ||
        paragraph.toLowerCase().includes("everything you need to know") ||
        paragraph
          .toLowerCase()
          .includes("compelling scholarship essay can make the difference")
      ) {
        return `
          <div class="mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
            <p class="text-lg leading-relaxed text-gray-800">
              ${paragraph.replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="font-semibold">$1</strong>'
              )}
            </p>
            <div class="mt-4 text-sm text-blue-600 font-medium">
              Professional Career Guidance
            </div>
          </div>
        `;
      }

      // Regular paragraphs
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
      let formatted = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/\n/g, "<br>");

      return `<p class="mb-4 leading-relaxed">${formatted}</p>`;
    })
    .filter((p) => p.length > 0)
    .join("");
}

// Simplified version with consistent templates (like "Common Mistakes to Avoid")
export function formatBlogContentConsistent(content: string): string {
  if (!content) return "";

  return content
    .split("\n\n")
    .map((paragraph) => {
      if (!paragraph.trim()) return "";

      // Handle main headers (##)
      if (paragraph.startsWith("## ")) {
        const title = paragraph.substring(3).trim();
        return `
          <div class="mb-8 mt-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-500">
              ${title}
            </h2>
          </div>
        `;
      }

      // Handle section headers with nested content (like "Common Mistakes to Avoid")
      if (
        paragraph.includes("\n") &&
        !paragraph.startsWith("- ") &&
        !paragraph.match(/^\d+\./)
      ) {
        const lines = paragraph.split("\n");
        const firstLine = lines[0].trim();
        const restLines = lines.slice(1).filter((line) => line.trim());

        // Check if this looks like a header with bullet points or nested content
        if (restLines.length > 0) {
          const bulletPoints = restLines
            .filter((line) => line.trim().startsWith("- "))
            .map((line) => line.substring(line.indexOf("- ") + 2).trim());

          const nonBulletText = restLines
            .filter((line) => !line.trim().startsWith("- ") && line.trim())
            .join(" ");

          return `
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">
                ${firstLine}
              </h3>
              ${
                nonBulletText
                  ? `<p class="mb-4 text-gray-700 leading-relaxed">${nonBulletText}</p>`
                  : ""
              }
              ${
                bulletPoints.length > 0
                  ? `
                <div class="space-y-3">
                  ${bulletPoints
                    .map(
                      (point) => `
                    <div class="flex items-start">
                      <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span class="text-gray-700 leading-relaxed">${point}</span>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
          `;
        }
      }

      // Handle numbered lists (simplified)
      if (paragraph.match(/^\d+\./m)) {
        const lines = paragraph.split("\n");
        const numberedItems = lines
          .filter((line) => line.match(/^\d+\./))
          .map((line) => {
            const match = line.match(/^(\d+)\.\s*(.+)/);
            if (match) {
              const [, number, content] = match;
              return `
                <div class="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div class="flex items-start">
                    <span class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                      ${number}
                    </span>
                    <div class="flex-1">
                      <p class="text-gray-700 leading-relaxed">${content.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="font-semibold">$1</strong>'
                      )}</p>
                    </div>
                  </div>
                </div>
              `;
            }
            return "";
          })
          .join("");

        return `<div class="mb-8">${numberedItems}</div>`;
      }

      // Handle simple bullet lists
      if (paragraph.includes("\n- ") || paragraph.startsWith("- ")) {
        const bulletPoints = paragraph
          .split("\n")
          .filter((line) => line.trim().startsWith("- "))
          .map((line) => line.substring(line.indexOf("- ") + 2).trim());

        return `
          <div class="mb-6 space-y-3">
            ${bulletPoints
              .map(
                (point) => `
              <div class="flex items-start">
                <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span class="text-gray-700 leading-relaxed">${point}</span>
              </div>
            `
              )
              .join("")}
          </div>
        `;
      }

      // Regular paragraphs
      const formatted = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

      return `<p class="mb-6 text-gray-700 leading-relaxed">${formatted}</p>`;
    })
    .filter((p) => p.length > 0)
    .join("");
}
