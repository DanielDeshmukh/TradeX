import React from "react";
import Header from "./Header";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg text-content">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-content mb-6">Privacy Policy</h1>
        <p className="text-content-secondary text-sm mb-4">Last updated: June 15, 2026</p>

        <div className="space-y-6 text-content-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-content mb-2">1. Information We Collect</h2>
            <p>
              We collect information you provide directly, such as your name, email address, and payment details
              when you create an account or subscribe to our services. We also collect usage data including
              chart interactions, watchlist selections, and feature usage patterns.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">2. How We Use Your Information</h2>
            <p>
              Your information is used to provide and improve our trading platform, personalize your experience,
              process payments, send notifications you have opted into, and generate AI-powered trading signals.
              We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">3. Data Security</h2>
            <p>
              We implement industry-standard encryption and security measures to protect your data. All data
              is transmitted over encrypted connections and stored on secure servers. However, no method of
              electronic transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">4. Cookies & Tracking</h2>
            <p>
              We use essential cookies to maintain your session and preferences. Analytics cookies help us
              understand how you use the platform. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">5. Third-Party Services</h2>
            <p>
              We use Supabase for authentication and database services, and payment processors for subscription
              billing. These services have their own privacy policies governing the use of your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data. You can request data export
              or account deletion by contacting our support team. We will respond to requests within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">7. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Continued use of the platform after changes
              constitutes acceptance of the updated policy. We will notify you of material changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-content mb-2">8. Contact Us</h2>
            <p>
              For questions about this privacy policy, contact us at privacy@tradex.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
