/**
 * Professional blog content formatter
 * Creates compelling, well-structured content without raw markdown syntax
 */
export function formatBlogContentProfessional(content: string): string {
  if (!content) return "";

  // Split content into sections for better processing
  const sections = content.split(/\n\s*\n/);
  const formattedSections: string[] = [];

  sections.forEach((section, index) => {
    const trimmedSection = section.trim();
    if (!trimmedSection) return;

    // Major section headers (##)
    if (trimmedSection.startsWith("## ")) {
      const headerText = trimmedSection.substring(3).trim();
      formattedSections.push(`
        <div class="mt-12 mb-8 first:mt-0">
          <h2 class="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-3">
            ${headerText}
          </h2>
        </div>
      `);
      return;
    }

    // Sub-section headers (###)
    if (trimmedSection.startsWith("### ")) {
      const headerText = trimmedSection.substring(4).trim();
      formattedSections.push(`
        <div class="mt-10 mb-6">
          <h3 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <span class="w-1 h-6 bg-blue-500 mr-3"></span>
            ${headerText}
          </h3>
        </div>
      `);
      return;
    }

    // Minor headers (####)
    if (trimmedSection.startsWith("#### ")) {
      const headerText = trimmedSection.substring(5).trim();
      formattedSections.push(`
        <h4 class="text-xl font-medium text-gray-800 mt-8 mb-4">${headerText}</h4>
      `);
      return;
    }

    // Handle content that looks like tips/steps (contains bold markers)
    if (
      trimmedSection.includes("**") &&
      trimmedSection.split("**").length > 2
    ) {
      // This is likely a tips section with bold points
      const tipItems = trimmedSection.split("\n").filter((line) => line.trim());
      const formattedTips = tipItems.map((tip) => {
        let cleanTip = tip.trim();

        // Remove ** markdown and create professional formatting
        cleanTip = cleanTip.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
          return `<span class="font-semibold text-blue-700">${p1}</span>`;
        });

        // If it looks like a numbered item, format it nicely
        if (cleanTip.match(/^\d+\./)) {
          return `<li class="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">${cleanTip}</li>`;
        } else if (cleanTip.startsWith("- ")) {
          return `<li class="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">${cleanTip.substring(
            2
          )}</li>`;
        } else if (cleanTip.includes(":")) {
          // Looks like a tip with a title
          return `<li class="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">${cleanTip}</li>`;
        }

        return `<li class="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">${cleanTip}</li>`;
      });

      formattedSections.push(`
        <div class="my-8">
          <ul class="space-y-3 list-none pl-0">
            ${formattedTips.join("")}
          </ul>
        </div>
      `);
      return;
    }

    // Handle simple bullet lists
    if (trimmedSection.includes("\n- ") || trimmedSection.startsWith("- ")) {
      const listItems = trimmedSection
        .split("\n")
        .filter((line) => line.trim().startsWith("- "))
        .map((item) => {
          const cleanItem = item.substring(2).trim();
          return `<li class="mb-3 flex items-start">
            <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>${cleanItem}</span>
          </li>`;
        });

      formattedSections.push(`
        <div class="my-6">
          <ul class="space-y-2 list-none pl-0">
            ${listItems.join("")}
          </ul>
        </div>
      `);
      return;
    }

    // Handle numbered lists
    if (trimmedSection.match(/^\d+\./m)) {
      const listItems = trimmedSection
        .split("\n")
        .filter((line) => line.trim().match(/^\d+\./))
        .map((item, idx) => {
          const match = item.match(/^\d+\.\s*(.*)/);
          const cleanItem = match ? match[1] : item;
          return `<li class="mb-4 flex items-start">
            <span class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 flex-shrink-0 mt-1">
              ${idx + 1}
            </span>
            <span class="pt-1">${cleanItem}</span>
          </li>`;
        });

      formattedSections.push(`
        <div class="my-8">
          <ol class="space-y-4 list-none pl-0">
            ${listItems.join("")}
          </ol>
        </div>
      `);
      return;
    }

    // Regular paragraph - clean up any remaining markdown
    let cleanContent = trimmedSection
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-gray-900">$1</strong>'
      )
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      .replace(/\n/g, " ");

    // Special handling for conclusion or intro paragraphs
    if (
      cleanContent.toLowerCase().includes("conclusion") ||
      cleanContent.toLowerCase().includes("in summary") ||
      cleanContent.toLowerCase().includes("to conclude") ||
      cleanContent.toLowerCase().includes("start your journey") ||
      cleanContent.toLowerCase().includes("transform your") ||
      index === 0
    ) {
      formattedSections.push(`
        <div class="my-8 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-lg">
          <div class="flex items-start">
            <div class="w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded mr-6"></div>
            <div class="flex-1">
              <p class="text-lg leading-relaxed text-gray-800 font-medium mb-4">
                ${cleanContent}
              </p>
              ${
                cleanContent.toLowerCase().includes("conclusion")
                  ? '<div class="mt-6 p-4 bg-white/70 rounded-lg border border-blue-300"><p class="text-sm text-blue-700 font-medium">💡 Ready to start your scholarship journey? Browse our latest opportunities and take the first step toward your educational goals!</p></div>'
                  : ""
              }
            </div>
          </div>
        </div>
      `);
    } else {
      // Regular paragraph with better spacing and typography
      formattedSections.push(`
        <p class="mb-6 text-gray-700 leading-relaxed text-lg">
          ${cleanContent}
        </p>
      `);
    }
  });

  return `
    <div class="max-w-none prose prose-lg">
      ${formattedSections.join("")}
    </div>
  `;
}

/**
 * Simple content formatter as fallback
 */
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
