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

    // Handle main headers (##) - Convert to professional headers
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

    // Handle sub-headers (###) - Convert to professional sub-headers
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

    // Handle amateur-style headers (# ) and convert them professionally
    if (trimmedSection.startsWith("# ")) {
      const headerText = trimmedSection.substring(2).trim();
      formattedSections.push(`
        <div class="mt-16 mb-12 text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ${headerText}
          </h1>
          <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
      `);
      return;
    }

    // Handle complex nested content (universities with details)
    if (trimmedSection.includes("\n") && trimmedSection.includes(" - ")) {
      const lines = trimmedSection.split("\n");
      let currentGroup: { title: string; items: string[] } | null = null;
      const groups: Array<{ title: string; items: string[] }> = [];

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // If line doesn't start with "- " it's a main title
        if (!trimmedLine.startsWith("- ")) {
          if (currentGroup) {
            groups.push(currentGroup);
          }
          currentGroup = { title: trimmedLine, items: [] };
        } else {
          // This is a nested item
          const item = trimmedLine.substring(2).trim();
          if (currentGroup) {
            currentGroup.items.push(item);
          }
        }
      });

      // Add the last group
      if (currentGroup) {
        groups.push(currentGroup);
      }

      // Format the groups professionally
      const formattedGroups = groups
        .map(
          (group) => `
        <div class="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <h4 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            ${group.title}
          </h4>
          <ul class="space-y-3">
            ${group.items
              .map(
                (item) => `
              <li class="flex items-start">
                <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span class="text-gray-700 leading-relaxed">${item}</span>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      `
        )
        .join("");

      formattedSections.push(`
        <div class="my-8">
          ${formattedGroups}
        </div>
      `);
      return;
    }

    // Handle numbered lists with descriptions
    if (trimmedSection.match(/^\d+\./m)) {
      const lines = trimmedSection.split("\n");
      const numberedItems: Array<{
        number: string;
        title: string;
        description: string;
      }> = [];
      let currentItem: {
        number: string;
        title: string;
        description: string;
      } | null = null;

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const numberMatch = trimmedLine.match(/^(\d+)\.\s*(.+)/);
        if (numberMatch) {
          // Save previous item
          if (currentItem) {
            numberedItems.push(currentItem);
          }
          // Start new item
          currentItem = {
            number: numberMatch[1],
            title: numberMatch[2],
            description: "",
          };
        } else if (currentItem && trimmedLine) {
          // This is description text for the current item
          currentItem.description +=
            (currentItem.description ? " " : "") + trimmedLine;
        }
      });

      // Add the last item
      if (currentItem) {
        numberedItems.push(currentItem);
      }

      const formattedItems = numberedItems
        .map(
          (item) => `
        <div class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
          <div class="flex items-start">
            <span class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              ${item.number}
            </span>
            <div class="flex-1">
              <h4 class="text-xl font-semibold text-gray-900 mb-3">${
                item.title
              }</h4>
              ${
                item.description
                  ? `<p class="text-gray-700 leading-relaxed">${item.description}</p>`
                  : ""
              }
            </div>
          </div>
        </div>
      `
        )
        .join("");

      formattedSections.push(`
        <div class="my-8">
          ${formattedItems}
        </div>
      `);
      return;
    }

    // Handle simple bullet lists (without nested structure)
    if (trimmedSection.includes("\n- ") || trimmedSection.startsWith("- ")) {
      const listItems = trimmedSection
        .split("\n")
        .filter((line) => line.trim().startsWith("- "))
        .map((item) => {
          const cleanItem = item.substring(2).trim();
          return `<li class="mb-3 flex items-start">
            <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700 leading-relaxed">${cleanItem}</span>
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
