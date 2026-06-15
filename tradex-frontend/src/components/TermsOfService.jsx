import React from "react";
import Header from "./Header";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-bg text-content">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-content mb-6">Terms of Service</h1>
        <p className="text-content-secondary text-sm mb-4">Last updated: June 15, 2026</p>

        <div className="space-y-6 text-content-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-content mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using TradeX, you agree to be bound by these Terms of Service. If you do not
              agree to these terms, you may not use the platform. These terms apply to all users, including
              free and paid subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">2. Account Registration</h2>
            <p>
              You must provide accurate and complete information when creating an account. You are responsible
              for maintaining the confidentiality of your credentials and for all activities that occur under
              your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">3. Subscriptions & Billing</h2>
            <p>
              Paid subscriptions are billed in advance on a monthly or annual basis. You may cancel your
              subscription at any time. Refunds are handled on a case-by-case basis. Free tier access
              remains available after cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">4. AI Signals Disclaimer</h2>
            <p>
              AI-generated trading signals are for informational purposes only and do not constitute
              financial advice. Trading involves risk, and you are solely responsible for your investment
              decisions. Past performance does not guarantee future results.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">5. Acceptable Use</h2>
            <p>
              You agree not to misuse the platform, attempt unauthorized access, scrape data, or interfere
              with service operations. Automated access is restricted to API subscribers with valid credentials.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">6. Intellectual Property</h2>
            <p>
              All content, code, and design elements of TradeX are owned by us and protected by intellectual
              property laws. You may not reproduce, distribute, or create derivative works without permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">7. Limitation of Liability</h2>
            <p>
              TradeX is provided "as is" without warranties of any kind. We are not liable for any damages
              arising from your use of the platform, including but not limited to financial losses from
              trading decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account for violations of these terms.
              Upon termination, your right to use the platform ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">9. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes shall be resolved in the courts
              of Bengaluru, Karnataka.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
