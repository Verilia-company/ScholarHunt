"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  GraduationCap,
  AlertCircle,
  X,
} from "lucide-react";
import { scholarshipService } from "@/lib/firebase/services";
import type { Scholarship } from "@/lib/firebase/services";
import ShareButtons from "@/components/ShareButtons";

export default function ScholarshipManagement() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingScholarship, setEditingScholarship] =
    useState<Scholarship | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    amount: string;
    deadline: string;
    hasDeadline: boolean;
    eligibility: string[];
    requirements: string[];
    university: string;
    country: string;
    level: string[];
    fieldOfStudy: string;
    applicationUrl: string;
    status: "active" | "draft" | "expired";
    image: string;
  }>({
    title: "",
    description: "",
    amount: "",
    deadline: "",
    hasDeadline: true,
    eligibility: [""],
    requirements: [""],
    university: "",
    country: "",
    level: [],
    fieldOfStudy: "",
    applicationUrl: "",
    status: "draft",
    image: "",
  });

  // Load scholarships on component mount
  useEffect(() => {
    loadScholarships();
  }, []);
  const loadScholarships = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scholarshipService.getScholarships();
      setScholarships(data);
    } catch (error) {
      console.error("Error loading scholarships:", error);
      setError("Failed to load scholarships. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      const scholarshipData = {
        title: formData.title,
        description: formData.description,
        amount: formData.amount,
        deadline: formData.hasDeadline ? formData.deadline : "Undisclosed",
        eligibility: formData.eligibility.filter((item) => item.trim() !== ""),
        requirements: formData.requirements.filter(
          (item) => item.trim() !== ""
        ),
        university: formData.university,
        country: formData.country,
        level:
          formData.level.length > 0 ? formData.level.join(", ") : "All Levels",
        fieldOfStudy: formData.fieldOfStudy,
        applicationUrl: formData.applicationUrl,
        status: formData.status,
        image: formData.image,
      };
      if (editingScholarship) {
        await scholarshipService.updateScholarship(
          editingScholarship.id,
          scholarshipData
        );
        // Reload scholarships to get the updated data
        await loadScholarships();
      } else {
        await scholarshipService.createScholarship(
          scholarshipData
        );
        // Reload scholarships to get the new data
        await loadScholarships();
      }

      resetForm();
    } catch (error) {
      console.error("Error saving scholarship:", error);
      setError("Failed to save scholarship. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
      deadline: "",
      hasDeadline: true,
      eligibility: [""],
      requirements: [""],
      university: "",
      country: "",
      level: [],
      fieldOfStudy: "",
      applicationUrl: "",
      status: "draft",
      image: "",
    });
    setShowForm(false);
    setEditingScholarship(null);
  };
  const handleEdit = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship);
    setFormData({
      title: scholarship.title,
      description: scholarship.description,
      amount: scholarship.amount,
      deadline:
        scholarship.deadline === "Undisclosed" ? "" : scholarship.deadline,
      hasDeadline: scholarship.deadline !== "Undisclosed",
      eligibility: scholarship.eligibility,
      requirements: scholarship.requirements,
      university: scholarship.university,
      country: scholarship.country,
      level: scholarship.level ? scholarship.level.split(", ") : [],
      fieldOfStudy: scholarship.fieldOfStudy,
      applicationUrl: scholarship.applicationUrl || "",
      status: scholarship.status,
      image: (scholarship as any).image || "",
    });
    setShowForm(true);
  };
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this scholarship?")) {
      try {
        setError(null);
        await scholarshipService.deleteScholarship(id);
        setScholarships((prev) => prev.filter((s) => s.id !== id));
      } catch (error) {
        console.error("Error deleting scholarship:", error);
        setError("Failed to delete scholarship. Please try again.");
      }
    }
  };

  const addArrayField = (field: "eligibility" | "requirements") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const updateArrayField = (
    field: "eligibility" | "requirements",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeArrayField = (
    field: "eligibility" | "requirements",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const filteredScholarships = scholarships.filter((scholarship) => {
    const matchesSearch =
      scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.university.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || scholarship.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 py-6 flex items-center justify-center">
          <div className="rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
            <div className="sticky top-0 border-b px-4 sm:px-6 py-4 flex justify-between items-center" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {editingScholarship
                  ? "Edit Scholarship"
                  : "Add New Scholarship"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 p-2"
                disabled={submitting}
              >
                <span className="sr-only">Cancel</span>×
              </button>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-red-700 flex-1">
                    {error}
                  </span>
                </div>
              )}
              <form
                id="scholarship-form"
                onSubmit={handleSubmit}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      University *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.university}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          university: e.target.value,
                        }))
                      }
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Amount *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      placeholder="e.g., Full tuition + $15,000 stipend"
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>{" "}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Deadline
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.hasDeadline}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              hasDeadline: e.target.checked,
                              deadline: e.target.checked ? prev.deadline : "",
                            }))
                          }
                          className="rounded"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">
                          This scholarship has a specific deadline
                        </span>
                      </label>
                      {formData.hasDeadline && (
                        <input
                          type="date"
                          required={formData.hasDeadline}
                          value={formData.deadline}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              deadline: e.target.value,
                            }))
                          }
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                      )}
                      {!formData.hasDeadline && (
                        <p className="text-xs text-gray-500">
                          Deadline will be marked as &quot;Undisclosed&quot;
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>{" "}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Education Level *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Undergraduate",
                        "Masters",
                        "Post Graduate",
                        "PhD",
                        "Postdoctoral",
                        "Certificate",
                        "Diploma",
                        "High School",
                      ].map((level) => (
                        <label key={level} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.level.includes(level)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  level: [...prev.level, level],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  level: prev.level.filter((l: string) => l !== level),
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-xs sm:text-sm text-gray-700">
                            {level}
                          </span>
                        </label>
                      ))}
                      {formData.level.length === 0 && (
                        <p className="text-xs text-red-500">
                          Please select at least one education level
                        </p>
                      )}
                    </div>
                  </div>{" "}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      value={formData.fieldOfStudy}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fieldOfStudy: e.target.value,
                        }))
                      }
                      placeholder="e.g., Engineering, Medicine, All Fields"
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Application URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.applicationUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          applicationUrl: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/apply"
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Direct link where students can apply for this scholarship
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          image: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/scholarship-image.jpg"
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL to an image representing this scholarship (optional)
                    </p>
                    {formData.image && (
                      <div className="mt-2 relative">
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300">
                          <img
                            src={formData.image}
                            alt="Scholarship preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/640x360?text=Image+Not+Found";
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Status *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as
                            | "active"
                            | "draft"
                            | "expired",
                        }))
                      }
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-h-[150px] resize-y"
                  />
                </div>
                {/* Eligibility Requirements */}
                <div className="lg:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Eligibility Requirements
                  </label>
                  {formData.eligibility.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <textarea
                        value={item}
                        onChange={(e) =>
                          updateArrayField("eligibility", index, e.target.value)
                        }
                        placeholder="Enter eligibility requirement"
                        rows={3}
                        className="flex-1 p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-h-[80px] resize-y"
                      />
                      {formData.eligibility.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField("eligibility", index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField("eligibility")}
                    className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                  >
                    + Add Eligibility Requirement
                  </button>
                </div>
                {/* Application Requirements */}
                <div className="lg:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Application Requirements
                  </label>
                  {formData.requirements.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <textarea
                        value={item}
                        onChange={(e) =>
                          updateArrayField(
                            "requirements",
                            index,
                            e.target.value
                          )
                        }
                        placeholder="Enter application requirement"
                        rows={3}
                        className="flex-1 p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-h-[80px] resize-y"
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayField("requirements", index)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField("requirements")}
                    className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                  >
                    + Add Application Requirement
                  </button>
                </div>
                <div className="sticky bottom-0 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editingScholarship ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        {editingScholarship
                          ? "Update Scholarship"
                          : "Create Scholarship"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Scholarship Management
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span className="hidden sm:inline">Add Scholarship</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
      {/* Error Message */}
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm sm:text-base text-red-700 flex-1">
            {error}
          </span>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
      {/* Filters */}
      <div className="rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6" style={{ background: 'var(--bg-elevated)' }}>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
              type="text"
              placeholder="Search scholarships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:flex-shrink-0">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-w-0"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>
    </div>{ " " }
  {/* Scholarships List */}
  <div className="rounded-lg shadow overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
    {loading ? (
      <div className="p-8 sm:p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm sm:text-base">
          Loading scholarships...
        </p>
      </div>
    ) : filteredScholarships.length === 0 ? (
      <div className="p-8 sm:p-12 text-center">
        <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
          No scholarships found
        </h3>
        <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
          {scholarships.length === 0
            ? "Get started by creating your first scholarship."
            : "Try adjusting your search or filter criteria."}
        </p>
        {scholarships.length === 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            Add First Scholarship
          </button>
        )}
      </div>
    ) : (
      <>
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {filteredScholarships.map((scholarship) => (
              <div key={scholarship.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {scholarship.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {scholarship.university}
                    </p>
                  </div>
                  <span
                    className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${scholarship.status === "active"
                      ? "bg-green-100 text-green-800"
                      : scholarship.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {scholarship.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Amount:</span>
                    <div className="truncate">{scholarship.amount}</div>
                  </div>{" "}
                  <div>
                    <span className="font-medium">Deadline:</span>
                    <div>
                      {scholarship.deadline === "Undisclosed" ? (
                        <span className="text-gray-500 italic">
                          Undisclosed
                        </span>
                      ) : (
                        new Date(scholarship.deadline).toLocaleDateString()
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Level:</span>
                    <div>{scholarship.level}</div>
                  </div>
                  <div>
                    <span className="font-medium">Country:</span>
                    <div>{scholarship.country}</div>
                  </div>
                  {scholarship.applicationUrl && (
                    <div className="col-span-2">
                      <span className="font-medium">Application:</span>
                      <div className="truncate">
                        <a
                          href={scholarship.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {scholarship.applicationUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>{" "}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEdit(scholarship)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>{" "}
                  {scholarship.status === "active" && (
                    <div className="flex items-center justify-center px-3 py-2 bg-gray-50 rounded-lg">
                      <ShareButtons
                        url={`${typeof window !== "undefined"
                          ? window.location.origin
                          : ""
                          }/scholarships/${scholarship.id}`}
                        title={scholarship.title}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(scholarship.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          {" "}
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scholarship
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredScholarships.map((scholarship) => (
                <tr key={scholarship.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {scholarship.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {scholarship.level} • {scholarship.country}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {scholarship.university}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {scholarship.amount}
                  </td>{" "}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {scholarship.deadline === "Undisclosed" ? (
                      <span className="text-gray-500 italic">
                        Undisclosed
                      </span>
                    ) : (
                      new Date(scholarship.deadline).toLocaleDateString()
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {scholarship.applicationUrl ? (
                      <a
                        href={scholarship.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline truncate block max-w-[200px]"
                        title={scholarship.applicationUrl}
                      >
                        Apply Here
                      </a>
                    ) : (
                      <span className="text-gray-400">No URL</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${scholarship.status === "active"
                        ? "bg-green-100 text-green-800"
                        : scholarship.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {scholarship.status}
                    </span>
                  </td>{" "}
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(scholarship)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>{" "}
                      {scholarship.status === "active" && (
                        <div className="relative">
                          <ShareButtons
                            url={`${typeof window !== "undefined"
                              ? window.location.origin
                              : ""
                              }/scholarships/${scholarship.id}`}
                            title={scholarship.title}
                          />
                        </div>
                      )}
                      <button
                        onClick={() => handleDelete(scholarship.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
    </div>
  </div>
  );
}
