"use client";

import React, { useState } from "react";
import { trackEvents } from "@/lib/analytics";
import {
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Copy,
  CheckCircle,
} from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  imageUrl?: string; // Optional: for platforms like Pinterest or if we want to guide Instagram sharing
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  url,
  title,
  imageUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const platforms = [
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      bgColor: "bg-green-500 hover:bg-green-600",
      textColor: "text-white",
      icon: MessageCircle,
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bgColor: "bg-blue-600 hover:bg-blue-700",
      textColor: "text-white",
      icon: Facebook,
    },
    {
      name: "X",
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      bgColor: "bg-gray-900 hover:bg-black",
      textColor: "text-white",
      icon: Twitter,
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      bgColor: "bg-blue-700 hover:bg-blue-800",
      textColor: "text-white",
      icon: Linkedin,
    },
    {
      name: "Instagram",
      url: `https://www.instagram.com`,
      bgColor:
        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      textColor: "text-white",
      icon: Instagram,
    },
  ];
  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        // Track copy link action
        trackEvents.socialShare("copy_link", "scholarship", url);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        // Fallback for older browsers or if navigator.clipboard is not available
        try {
          const textArea = document.createElement("textarea");
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          // Track copy link action
          trackEvents.socialShare("copy_link", "scholarship", url);
        } catch {
          alert("Failed to copy link. Please copy it manually.");
        }
      });
  };
  return (
    <div className="my-4">
      <p className="text-lg font-semibold mb-2">Share this:</p>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvents.socialShare(
                  platform.name.toLowerCase(),
                  "scholarship",
                  url
                )
              }
              className={`flex items-center justify-center w-10 h-10 rounded-full ${platform.bgColor} ${platform.textColor} hover:scale-105 transition-all duration-200 shadow-md`}
              title={`Share on ${platform.name}`}
              aria-label={`Share on ${platform.name}`}
            >
              <Icon className="h-5 w-5" />
            </a>
          );
        })}
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-500 hover:bg-gray-600 text-white hover:scale-105 transition-all duration-200 shadow-md"
          title={copied ? "Copied!" : "Copy Link"}
          aria-label={copied ? "Copied!" : "Copy Link"}
        >
          {copied ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </button>
      </div>
      {imageUrl && (
        <p className="text-xs mt-2 text-gray-500">
          For Instagram, you might want to save this image and use the copied
          link in your post.
        </p>
      )}
    </div>
  );
};

export default ShareButtons;
