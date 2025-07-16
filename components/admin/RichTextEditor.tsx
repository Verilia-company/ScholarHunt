"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Table as TableIcon,
  Search,
} from "lucide-react";
import { useState, useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface SEOAnalysis {
  wordCount: number;
  readabilityScore: number;
  headingStructure: {
    h1: number;
    h2: number;
    h3: number;
  };
  keywordDensity: { [key: string]: number };
  metaDescription: string;
  suggestions: string[];
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing your blog post...",
}: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [showSEOPanel, setShowSEOPanel] = useState(false);
  const [targetKeyword, setTargetKeyword] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-red-600 underline hover:text-red-700",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Color.configure({
        types: ["textStyle"],
      }),
      TextStyle,
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const analyseSEO = useCallback((): SEOAnalysis => {
    if (!editor)
      return {
        wordCount: 0,
        readabilityScore: 0,
        headingStructure: { h1: 0, h2: 0, h3: 0 },
        keywordDensity: {},
        metaDescription: "",
        suggestions: [],
      };

    const text = editor.getText();
    const html = editor.getHTML();
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;

    // Count headings
    const h1Count = (html.match(/<h1[^>]*>/g) || []).length;
    const h2Count = (html.match(/<h2[^>]*>/g) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/g) || []).length;

    // Calculate keyword density
    const keywordDensity: { [key: string]: number } = {};
    if (targetKeyword && words.length > 0) {
      const keywordRegex = new RegExp(
        targetKeyword.replace(/\s+/g, "\\s+"),
        "gi"
      );
      const matches = text.match(keywordRegex) || [];
      keywordDensity[targetKeyword] = (matches.length / words.length) * 100;
    }

    // Generate suggestions
    const suggestions: string[] = [];
    if (wordCount < 300)
      suggestions.push(
        "Consider adding more content. Aim for at least 300 words."
      );
    if (h1Count === 0)
      suggestions.push("Add an H1 heading to improve SEO structure.");
    if (h2Count === 0)
      suggestions.push("Add H2 headings to break up your content.");
    if (targetKeyword && keywordDensity[targetKeyword] < 1) {
      suggestions.push(
        `Consider including your target keyword "${targetKeyword}" more frequently.`
      );
    }
    if (targetKeyword && keywordDensity[targetKeyword] > 3) {
      suggestions.push(
        `Your keyword density is high. Consider reducing usage of "${targetKeyword}".`
      );
    }

    // Simple readability score (based on sentence length and word complexity)
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgWordsPerSentence =
      sentences.length > 0 ? wordCount / sentences.length : 0;
    const readabilityScore = Math.max(
      0,
      Math.min(100, 100 - avgWordsPerSentence * 2)
    );

    return {
      wordCount,
      readabilityScore: Math.round(readabilityScore),
      headingStructure: { h1: h1Count, h2: h2Count, h3: h3Count },
      keywordDensity,
      metaDescription: text.substring(0, 160),
      suggestions,
    };
  }, [editor, targetKeyword]);

  const addLink = () => {
    if (!editor) return;

    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setIsLinkModalOpen(false);
    }
  };

  const addImage = () => {
    if (!editor) return;

    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
      setImageUrl("");
      setImageAlt("");
      setIsImageModalOpen(false);
    }
  };

  const addTable = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  if (!editor) {
    return null;
  }

  const seoAnalysis = analyseSEO();

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive("bold")
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive("italic")
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive("underline")
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive("strike")
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive("bulletList")
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive("orderedList")
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive("blockquote")
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive({ textAlign: "left" })
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive({ textAlign: "center" })
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive({ textAlign: "right" })
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Media & Links */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
              title="Add Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={addTable}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
              title="Add Table"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Highlight & Colors */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                editor.isActive("highlight")
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600"
              }`}
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* SEO Panel Toggle */}
          <button
            onClick={() => setShowSEOPanel(!showSEOPanel)}
            className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${
              showSEOPanel ? "bg-red-100 text-red-600" : "text-gray-600"
            }`}
            title="SEO Analysis"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Editor */}
        <div
          className={`${
            showSEOPanel ? "w-2/3" : "w-full"
          } transition-all duration-300`}
        >
          <EditorContent
            editor={editor}
            className="prose max-w-none p-6 min-h-[400px] focus:outline-none"
          />
        </div>

        {/* SEO Panel */}
        {showSEOPanel && (
          <div className="w-1/3 border-l border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Search className="w-4 h-4 mr-2" />
              SEO Analysis
            </h3>

            {/* Target Keyword */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Keyword
              </label>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Enter target keyword"
              />
            </div>

            {/* Word Count */}
            <div className="mb-4 p-3 bg-white rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Word Count
                </span>
                <span
                  className={`text-sm font-semibold ${
                    seoAnalysis.wordCount >= 300
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {seoAnalysis.wordCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    seoAnalysis.wordCount >= 300
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (seoAnalysis.wordCount / 300) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Readability Score */}
            <div className="mb-4 p-3 bg-white rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Readability
                </span>
                <span
                  className={`text-sm font-semibold ${
                    seoAnalysis.readabilityScore >= 60
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {seoAnalysis.readabilityScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    seoAnalysis.readabilityScore >= 60
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}
                  style={{ width: `${seoAnalysis.readabilityScore}%` }}
                ></div>
              </div>
            </div>

            {/* Heading Structure */}
            <div className="mb-4 p-3 bg-white rounded-lg border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Heading Structure
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>H1:</span>
                  <span
                    className={
                      seoAnalysis.headingStructure.h1 === 1
                        ? "text-green-600"
                        : "text-orange-600"
                    }
                  >
                    {seoAnalysis.headingStructure.h1}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>H2:</span>
                  <span
                    className={
                      seoAnalysis.headingStructure.h2 > 0
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {seoAnalysis.headingStructure.h2}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>H3:</span>
                  <span className="text-gray-500">
                    {seoAnalysis.headingStructure.h3}
                  </span>
                </div>
              </div>
            </div>

            {/* Keyword Density */}
            {targetKeyword && (
              <div className="mb-4 p-3 bg-white rounded-lg border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Keyword Density
                </h4>
                <div className="flex justify-between text-sm">
                  <span>&quot;{targetKeyword}&quot;:</span>
                  <span
                    className={`font-semibold ${
                      seoAnalysis.keywordDensity[targetKeyword] >= 1 &&
                      seoAnalysis.keywordDensity[targetKeyword] <= 3
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {seoAnalysis.keywordDensity[targetKeyword]?.toFixed(1) || 0}
                    %
                  </span>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {seoAnalysis.suggestions.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Suggestions
                </h4>
                <ul className="space-y-1">
                  {seoAnalysis.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="text-xs text-gray-600 flex items-start"
                    >
                      <span className="text-orange-500 mr-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addLink}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Add Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Description of the image"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addImage}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Add Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
