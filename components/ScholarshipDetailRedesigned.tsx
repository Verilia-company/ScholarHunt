import React from "react";

export default function ScholarshipDetailRedesigned() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <a
        href="/opportunities"
        className="btn btn-ghost mb-6 flex items-center gap-2 w-fit"
      >
        {/* Replace with your icon system if needed */}
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 19-7-7 7-7"></path>
          <path d="M19 12H5"></path>
        </svg>
        <span className="font-medium">Back to Opportunities</span>
      </a>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-2 min-w-0">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge badge-primary mb-4">
            <svg
              className="h-4 w-4 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="6"></circle>
              <path d="m9 11 3 3L22 4"></path>
            </svg>
            <span>Open Application</span>
          </div>
          {/* Title */}
          <h1 className="text-title font-bold mb-4 text-gradient">
            Free University of Berlin DAAD EPOS Scholarship in Germany 2026 |
            Fully Funded
          </h1>
          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="card glass flex items-center gap-2">
              <svg
                className="h-4 w-4 text-green-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" x2="12" y1="2" y2="22"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <div>
                <div className="text-caption text-gray-500">Value</div>
                <div className="font-bold text-body">
                  Full Scholarship | €15,600 Stipend/Yr | Travel Allowance |
                  Health Insurance
                </div>
              </div>
            </div>
            <div className="card glass flex items-center gap-2">
              <svg
                className="h-4 w-4 text-purple-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                <path d="M22 10v6"></path>
                <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
              </svg>
              <div>
                <div className="text-caption text-gray-500">Level</div>
                <div className="font-bold text-body">
                  Masters, Post Graduate
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div className="xl:col-span-1 w-full">
          <div className="card glass sticky top-24 w-full text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge badge-success mb-2">
              <svg
                className="h-3 w-3 text-green-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="6"></circle>
              </svg>
              <span>Scholarship</span>
            </div>
            <h3 className="text-subtitle font-bold mb-1">Ready to Apply?</h3>
            <p className="text-caption text-gray-500 mb-4">
              Take the next step towards your academic future
            </p>
            <div className="card glass mb-3">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                <div>
                  <div className="text-caption text-gray-400">Deadline</div>
                  <div className="font-semibold text-body text-gray-700">
                    Undisclosed
                  </div>
                </div>
              </div>
            </div>
            <button className="btn btn-primary w-full flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6"></path>
                <path d="M10 14 21 3"></path>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              </svg>
              <span>Apply Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
