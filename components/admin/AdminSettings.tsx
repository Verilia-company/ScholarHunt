"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  Settings,
  Database,
  Shield,
  Globe,
} from "lucide-react";
import { settingsService, backupService } from "@/lib/firebase/services";
import type { SiteSettings } from "@/lib/firebase/services";

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    siteName: "ScholarHunt",
    siteDescription: "Find and apply for scholarships in Uganda and beyond",
    contactEmail: "contact@scholarhunt.com",
    adminEmail: "admin@scholarhunt.com",
    maxScholarships: 100,
    maxBlogPosts: 50,
    enableRegistration: true,
    enableComments: false,
    maintenanceMode: false,
    seoSettings: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
    },
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
    aboutPage: {
      contactEmail: "info@scholarhunt.ug",
      contactPhone: "+256 XXX XXX XXX",
      teamMembers: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [, setExporting] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentSettings = await settingsService.getSettings();

      if (currentSettings) {
        setSettings(currentSettings);
      } else {
        // Initialize default settings if none exist
        const defaultSettings =
          await settingsService.initializeDefaultSettings();
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaveStatus("saving");
      setError(null);

      await settingsService.updateSettings({
        ...settings,
        updatedBy: "admin", // In a real app, this would be the current user ID
      });

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings. Please try again.");
      setSaveStatus("error");
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      setError(null);

      const exportData = await backupService.exportData();

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scholarhunt-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      setError("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };
  const handleImportData = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setError(null);
        const importData = JSON.parse(e.target?.result as string);

        if (importData.scholarships && Array.isArray(importData.scholarships)) {
          await backupService.importScholarships(importData.scholarships);
        }
        if (importData.blogPosts && Array.isArray(importData.blogPosts)) {
          await backupService.importBlogPosts(importData.blogPosts);
        }
        if (importData.settings) {
          await settingsService.updateSettings(importData.settings);
          setSettings(importData.settings);
        }

        alert("Data imported successfully!");
      } catch (error) {
        console.error("Error importing data:", error);
        setError("Error importing data. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };
  const sections = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data Management", icon: Database },
    { id: "seo", label: "SEO Settings", icon: Globe },
  ];
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
        Admin Settings
      </h1>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 mb-4 sm:mb-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-sm sm:text-base text-gray-600">
              Loading settings...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start sm:items-center">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-sm sm:text-base text-red-700 flex-1">
              {error}
            </span>
            <button
              onClick={loadSettings}
              className="ml-2 px-3 sm:px-4 py-1 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            {/* Mobile Navigation - Horizontal Tabs */}
            <div className="lg:hidden mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto scrollbar-hide">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 border-b-2 transition-colors ${
                          activeSection === section.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">
                          {section.label}
                        </span>
                        <span className="sm:hidden">
                          {section.label.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Desktop Navigation - Vertical Sidebar */}
            <nav className="hidden lg:block space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>{" "}
          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8">
              {/* General Settings */}
              {activeSection === "general" && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    General Settings
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            siteName: e.target.value,
                          }))
                        }
                        className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            contactEmail: e.target.value,
                          }))
                        }
                        className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Site Description
                      </label>
                      <textarea
                        rows={3}
                        value={settings.siteDescription}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            siteDescription: e.target.value,
                          }))
                        }
                        className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Max Scholarships
                      </label>
                      <input
                        type="number"
                        value={settings.maxScholarships}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            maxScholarships: parseInt(e.target.value),
                          }))
                        }
                        className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Max Blog Posts
                      </label>
                      <input
                        type="number"
                        value={settings.maxBlogPosts}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            maxBlogPosts: parseInt(e.target.value),
                          }))
                        }
                        className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />{" "}
                    </div>{" "}
                  </div>

                  {/* About Page Contact Information */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      About Page Contact Information
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          About Page Contact Email
                        </label>
                        <input
                          type="email"
                          value={settings.aboutPage?.contactEmail || ""}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              aboutPage: {
                                ...prev.aboutPage,
                                contactEmail: e.target.value,
                                contactPhone:
                                  prev.aboutPage?.contactPhone || "",
                                teamMembers: prev.aboutPage?.teamMembers || [],
                              },
                            }))
                          }
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="info@scholarhunt.ug"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          About Page Contact Phone
                        </label>
                        <input
                          type="text"
                          value={settings.aboutPage?.contactPhone || ""}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              aboutPage: {
                                ...prev.aboutPage,
                                contactEmail:
                                  prev.aboutPage?.contactEmail || "",
                                contactPhone: e.target.value,
                                teamMembers: prev.aboutPage?.teamMembers || [],
                              },
                            }))
                          }
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="+256 XXX XXX XXX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media Settings */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Social Media Links
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Facebook URL
                        </label>
                        <input
                          type="url"
                          value={settings.socialMedia?.facebook || ""}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socialMedia: {
                                ...prev.socialMedia,
                                facebook: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://www.facebook.com/share/16g4GXRe6r/"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Twitter URL
                        </label>
                        <input
                          type="url"
                          value={settings.socialMedia?.twitter || ""}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socialMedia: {
                                ...prev.socialMedia,
                                twitter: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://twitter.com/scholarhunt"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          value={settings.socialMedia?.instagram || ""}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socialMedia: {
                                ...prev.socialMedia,
                                instagram: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://instagram.com/scholarhunt"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          value={settings.socialMedia?.linkedin || ""}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socialMedia: {
                                ...prev.socialMedia,
                                linkedin: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://linkedin.com/company/scholarhunt"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableRegistration"
                        checked={settings.enableRegistration}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            enableRegistration: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="enableRegistration"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Enable user registration
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableComments"
                        checked={settings.enableComments}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            enableComments: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="enableComments"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Enable blog comments
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            maintenanceMode: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="maintenanceMode"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Maintenance mode
                      </label>{" "}
                    </div>{" "}
                  </div>

                  {/* Team Members */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Team Members
                      </h3>
                      <button
                        onClick={() => {
                          setSettings((prev) => ({
                            ...prev,
                            aboutPage: {
                              ...prev.aboutPage,
                              contactEmail: prev.aboutPage?.contactEmail || "",
                              contactPhone: prev.aboutPage?.contactPhone || "",
                              teamMembers: [
                                ...(prev.aboutPage?.teamMembers || []),
                                { name: "", role: "", bio: "", image: "" },
                              ],
                            },
                          }));
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Add Member
                      </button>
                    </div>
                    <div className="space-y-4">
                      {settings.aboutPage?.teamMembers?.map((member, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              Team Member {index + 1}
                            </h4>
                            <button
                              onClick={() => {
                                setSettings((prev) => ({
                                  ...prev,
                                  aboutPage: {
                                    ...prev.aboutPage,
                                    contactEmail:
                                      prev.aboutPage?.contactEmail || "",
                                    contactPhone:
                                      prev.aboutPage?.contactPhone || "",
                                    teamMembers:
                                      prev.aboutPage?.teamMembers?.filter(
                                        (_, i) => i !== index
                                      ) || [],
                                  },
                                }));
                              }}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => {
                                  setSettings((prev) => ({
                                    ...prev,
                                    aboutPage: {
                                      ...prev.aboutPage,
                                      contactEmail:
                                        prev.aboutPage?.contactEmail || "",
                                      contactPhone:
                                        prev.aboutPage?.contactPhone || "",
                                      teamMembers:
                                        prev.aboutPage?.teamMembers?.map(
                                          (m, i) =>
                                            i === index
                                              ? { ...m, name: e.target.value }
                                              : m
                                        ) || [],
                                    },
                                  }));
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Role
                              </label>
                              <input
                                type="text"
                                value={member.role}
                                onChange={(e) => {
                                  setSettings((prev) => ({
                                    ...prev,
                                    aboutPage: {
                                      ...prev.aboutPage,
                                      contactEmail:
                                        prev.aboutPage?.contactEmail || "",
                                      contactPhone:
                                        prev.aboutPage?.contactPhone || "",
                                      teamMembers:
                                        prev.aboutPage?.teamMembers?.map(
                                          (m, i) =>
                                            i === index
                                              ? { ...m, role: e.target.value }
                                              : m
                                        ) || [],
                                    },
                                  }));
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Bio
                              </label>
                              <textarea
                                rows={2}
                                value={member.bio}
                                onChange={(e) => {
                                  setSettings((prev) => ({
                                    ...prev,
                                    aboutPage: {
                                      ...prev.aboutPage,
                                      contactEmail:
                                        prev.aboutPage?.contactEmail || "",
                                      contactPhone:
                                        prev.aboutPage?.contactPhone || "",
                                      teamMembers:
                                        prev.aboutPage?.teamMembers?.map(
                                          (m, i) =>
                                            i === index
                                              ? { ...m, bio: e.target.value }
                                              : m
                                        ) || [],
                                    },
                                  }));
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Image URL (optional)
                              </label>
                              <input
                                type="url"
                                value={member.image}
                                onChange={(e) => {
                                  setSettings((prev) => ({
                                    ...prev,
                                    aboutPage: {
                                      ...prev.aboutPage,
                                      contactEmail:
                                        prev.aboutPage?.contactEmail || "",
                                      contactPhone:
                                        prev.aboutPage?.contactPhone || "",
                                      teamMembers:
                                        prev.aboutPage?.teamMembers?.map(
                                          (m, i) =>
                                            i === index
                                              ? { ...m, image: e.target.value }
                                              : m
                                        ) || [],
                                    },
                                  }));
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!settings.aboutPage?.teamMembers ||
                        settings.aboutPage.teamMembers.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No team members added yet. Click &quot;Add Member&quot; to get
                          started.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Team Members Management */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Team Members
                    </h3>

                    {/* Existing Team Members */}
                    <div className="space-y-4 mb-6">
                      {settings.aboutPage?.teamMembers?.map((member, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-lg border border-gray-200"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => {
                                  const updatedMembers = [
                                    ...(settings.aboutPage?.teamMembers || []),
                                  ];
                                  updatedMembers[index] = {
                                    ...member,
                                    name: e.target.value,
                                  };
                                  setSettings((prev) => ({
                                    ...prev,
                                    aboutPage: {
                                      ...prev.aboutPage,
                                      contactEmail:
                                        prev.aboutPage?.contactEmail || "",
                                      contactPhone:
                                        prev.aboutPage?.contactPhone || "",
                                      teamMembers: updatedMembers,
                                    },
                                  }));
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                              </label>
                              <input
                                type="text"
                                value={member.role}
                                onChange={(e) => {
                                  const updatedMembers = [
                                    ...(settings.aboutPage?.teamMembers || []),
                                  ];
                                  updatedMembers[index] = {
                                    ...member,
                                    role: e.target.value,
                                  };
                                  setSettings((prev) => ({
                                    ...prev,
                                    aboutPage: {
                                      ...prev.aboutPage,
                                      contactEmail:
                                        prev.aboutPage?.contactEmail || "",
                                      contactPhone:
                                        prev.aboutPage?.contactPhone || "",
                                      teamMembers: updatedMembers,
                                    },
                                  }));
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={() => {
                                  const updatedMembers =
                                    settings.aboutPage?.teamMembers?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  setSettings((prev) => ({
                                    ...prev,
                                    aboutPage: {
                                      ...prev.aboutPage,
                                      contactEmail:
                                        prev.aboutPage?.contactEmail || "",
                                      contactPhone:
                                        prev.aboutPage?.contactPhone || "",
                                      teamMembers: updatedMembers,
                                    },
                                  }));
                                }}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bio
                            </label>
                            <textarea
                              rows={2}
                              value={member.bio}
                              onChange={(e) => {
                                const updatedMembers = [
                                  ...(settings.aboutPage?.teamMembers || []),
                                ];
                                updatedMembers[index] = {
                                  ...member,
                                  bio: e.target.value,
                                };
                                setSettings((prev) => ({
                                  ...prev,
                                  aboutPage: {
                                    ...prev.aboutPage,
                                    contactEmail:
                                      prev.aboutPage?.contactEmail || "",
                                    contactPhone:
                                      prev.aboutPage?.contactPhone || "",
                                    teamMembers: updatedMembers,
                                  },
                                }));
                              }}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Brief bio or description"
                            />
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Image URL (optional)
                            </label>
                            <input
                              type="url"
                              value={member.image}
                              onChange={(e) => {
                                const updatedMembers = [
                                  ...(settings.aboutPage?.teamMembers || []),
                                ];
                                updatedMembers[index] = {
                                  ...member,
                                  image: e.target.value,
                                };
                                setSettings((prev) => ({
                                  ...prev,
                                  aboutPage: {
                                    ...prev.aboutPage,
                                    contactEmail:
                                      prev.aboutPage?.contactEmail || "",
                                    contactPhone:
                                      prev.aboutPage?.contactPhone || "",
                                    teamMembers: updatedMembers,
                                  },
                                }));
                              }}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="https://example.com/photo.jpg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add New Team Member */}
                    <button
                      onClick={() => {
                        const newMember = {
                          name: "",
                          role: "",
                          bio: "",
                          image: "",
                        };
                        const updatedMembers = [
                          ...(settings.aboutPage?.teamMembers || []),
                          newMember,
                        ];
                        setSettings((prev) => ({
                          ...prev,
                          aboutPage: {
                            ...prev.aboutPage,
                            contactEmail: prev.aboutPage?.contactEmail || "",
                            contactPhone: prev.aboutPage?.contactPhone || "",
                            teamMembers: updatedMembers,
                          },
                        }));
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Add Team Member
                    </button>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableRegistration"
                        checked={settings.enableRegistration}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            enableRegistration: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="enableRegistration"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Enable user registration
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableComments"
                        checked={settings.enableComments}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            enableComments: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="enableComments"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Enable blog comments
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            maintenanceMode: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="maintenanceMode"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Maintenance mode
                      </label>{" "}
                    </div>{" "}
                  </div>

                  {/* Team Members */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Team Members
                      </h3>
                      <button
                        onClick={() => {
                          setSettings((prev) => ({
                            ...prev,
                            aboutPage: {
                              ...prev.aboutPage,
                              contactEmail: prev.aboutPage?.contactEmail || "",
                              contactPhone: prev.aboutPage?.contactPhone || "",
                              teamMembers: [
                                ...(prev.aboutPage?.teamMembers || []),
                                { name: "", role: "", bio: "", image: "" },
                              ],
                            },
                          }));
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Add Member
                      </button>
                    </div>
                    <div className="space-y-4">
                      {settings.aboutPage?.teamMembers?.map((member, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              Team Member {index + 1}
                            </h4>
                            <button
                              onClick={() => {
                                setSettings((prev) => ({
                                  ...prev,
                                  aboutPage: {
                                    ...prev.aboutPage,
                                    contactEmail:
                                      prev.aboutPage?.contactEmail || "",
                                    contactPhone:
                                      prev.aboutPage?.contactPhone || "",
                                    teamMembers:
                                      prev.aboutPage?.teamMembers?.filter(
                                        (_, i) => i !== index
                                      ) || [],
                                  },
                                }));
                              }}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => {
                                  setSettings((prev) => ({
                                    ...prev,
                                    aboutPage: {
                                      ...prev.aboutPage,
                                      contactEmail:
                                        prev.aboutPage?.contactEmail || "",
                                      contactPhone:
                                        prev.aboutPage?.contactPhone || "",
                                      teamMembers:
                                        prev.aboutPage?.teamMembers?.map(
                                          (m, i) =>
                                            i === index
                                              ? { ...m, name: e.target.value }
                                              : m
                                        ) || [],
                                    },
                                  }));
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Role
                              </label>
                              <input
                                type="text"
                                value={member.role}
                                onChange={(e) => {
                                  setSettings((prev) => ({
                                    ...prev,
                                    aboutPage: {
                                      ...prev.aboutPage,
                                      contactEmail:
                                        prev.aboutPage?.contactEmail || "",
                                      contactPhone:
                                        prev.aboutPage?.contactPhone || "",
                                      teamMembers:
                                        prev.aboutPage?.teamMembers?.map(
                                          (m, i) =>
                                            i === index
                                              ? { ...m, role: e.target.value }
                                              : m
                                        ) || [],
                                    },
                                  }));
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Bio
                              </label>
                              <textarea
                                rows={2}
                                value={member.bio}
                                onChange={(e) => {
                                  setSettings((prev) => ({
                                    ...prev,
                                    aboutPage: {
                                      ...prev.aboutPage,
                                      contactEmail:
                                        prev.aboutPage?.contactEmail || "",
                                      contactPhone:
                                        prev.aboutPage?.contactPhone || "",
                                      teamMembers:
                                        prev.aboutPage?.teamMembers?.map(
                                          (m, i) =>
                                            i === index
                                              ? { ...m, bio: e.target.value }
                                              : m
                                        ) || [],
                                    },
                                  }));
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Image URL (optional)
                              </label>
                              <input
                                type="url"
                                value={member.image}
                                onChange={(e) => {
                                  setSettings((prev) => ({
                                    ...prev,
                                    aboutPage: {
                                      ...prev.aboutPage,
                                      contactEmail:
                                        prev.aboutPage?.contactEmail || "",
                                      contactPhone:
                                        prev.aboutPage?.contactPhone || "",
                                      teamMembers:
                                        prev.aboutPage?.teamMembers?.map(
                                          (m, i) =>
                                            i === index
                                              ? { ...m, image: e.target.value }
                                              : m
                                        ) || [],
                                    },
                                  }));
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!settings.aboutPage?.teamMembers ||
                        settings.aboutPage.teamMembers.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No team members added yet. Click &quot;Add Member&quot; to get
                          started.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}{" "}
              {/* Security Settings */}
              {activeSection === "security" && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Security Settings
                  </h2>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <div className="flex">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Firebase Authentication Required
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-yellow-700">
                          Security settings will be managed through Firebase
                          Authentication once integrated. Current demo uses
                          temporary local authentication.
                        </p>
                      </div>
                    </div>
                  </div>{" "}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        value={settings.adminEmail}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            adminEmail: e.target.value,
                          }))
                        }
                        className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>

                    <div className="border-t pt-4 sm:pt-6">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        Enhanced security features will be available with
                        Firebase Auth integration.
                      </p>
                      <button
                        disabled
                        className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm sm:text-base"
                      >
                        Enable 2FA (Coming Soon)
                      </button>
                    </div>
                  </div>
                </div>
              )}{" "}
              {/* Data Management */}
              {activeSection === "data" && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Data Management
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                        Export Data
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        Download a backup of all scholarships, blog posts, and
                        settings.
                      </p>
                      <button
                        onClick={handleExportData}
                        className="flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Export Data
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                        Import Data
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        Upload a previously exported backup file to restore
                        data.
                      </p>
                      <label className="flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm sm:text-base">
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Import Data
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-medium text-red-800 mb-3 sm:mb-4">
                      Danger Zone
                    </h3>
                    <p className="text-xs sm:text-sm text-red-700 mb-3 sm:mb-4">
                      These actions cannot be undone. Please be careful.
                    </p>
                    <div className="space-y-3 flex flex-col sm:flex-row sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to clear all scholarships? This cannot be undone."
                            )
                          ) {
                            localStorage.removeItem("scholarships");
                            alert("All scholarships have been cleared.");
                          }
                        }}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                      >
                        Clear All Scholarships
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to clear all blog posts? This cannot be undone."
                            )
                          ) {
                            localStorage.removeItem("blogPosts");
                            alert("All blog posts have been cleared.");
                          }
                        }}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                      >
                        Clear All Blog Posts
                      </button>
                    </div>
                  </div>
                </div>
              )}{" "}
              {/* SEO Settings */}
              {activeSection === "seo" && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    SEO Settings
                  </h2>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          SEO Configuration Active
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-blue-700">
                          SEO settings are already configured in the
                          application. These settings override the default
                          configuration.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                        Analytics Integration
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        Google Analytics and AdSense integration is
                        pre-configured. Update tracking IDs in production.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                        Sitemap & Robots
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        Dynamic sitemap and robots.txt are automatically
                        generated and updated.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <a
                          href="/sitemap.xml"
                          target="_blank"
                          className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm underline"
                        >
                          View Sitemap
                        </a>
                        <a
                          href="/robots.txt"
                          target="_blank"
                          className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm underline"
                        >
                          View Robots.txt
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}{" "}
              {/* Save Button */}
              <div className="flex justify-end mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                <button
                  onClick={handleSaveSettings}
                  disabled={saveStatus === "saving"}
                  className={`flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    saveStatus === "saving"
                      ? "bg-gray-400 cursor-not-allowed"
                      : saveStatus === "saved"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  {saveStatus === "saving" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : saveStatus === "saved" ? (
                    <>
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
