import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 xl:p-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
            Privacy Policy
          </h1>

          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700">
            <p className="text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">
              Last updated: January 15, 2024
            </p>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              1. Information We Collect
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We collect information you provide directly to us, such as when
              you create an account, submit scholarship opportunities, subscribe
              to our newsletter, or contact us for support.
            </p>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="text-sm sm:text-base space-y-1 sm:space-y-2 ml-4 sm:ml-6">
              <li>Provide, maintain, and improve our services</li>
              <li>Send you scholarship opportunities and updates</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              3. Information Sharing
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal
              information to third parties without your consent, except as
              described in this policy.
            </p>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              4. Data Security
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We implement appropriate security measures to protect your
              personal information against unauthorized access, alteration,
              disclosure, or destruction.
            </p>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              5. Cookies
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We use cookies to enhance your experience on our website. You can
              choose to disable cookies through your browser settings.
            </p>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              6. Third-Party Services
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Our website may contain links to third-party websites. We are not
              responsible for the privacy practices of these external sites.
            </p>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              7. Changes to This Policy
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new policy on this page.
            </p>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              8. Contact Us
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              If you have any questions about this privacy policy, please
              contact us at:
              <br />
              Email: privacy@scholarhunt.ug
              <br />
              Address: Kampala, Uganda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
