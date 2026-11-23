import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shell/LegalPage";

export const metadata: Metadata = {
  title: {
    absolute: "Terms of Use · Hakkiri",
  },
  description: "The terms for using Hakkiri Studio.",
};

const DRAFT = false;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="23 November 2026"
      draft={DRAFT}
      intro={
        <p>
          These terms are the agreement between you and Happy Cheeks Ltd (“we”, “us”), trading as Hakkiri Studio (company number 15146182), for using Hakkiri Studio. Please read them; by using Hakkiri Studio you agree to them. Our <Link href="/privacy">privacy policy</Link> explains how we handle your data. If you’re a consumer, nothing here affects your statutory legal rights.
        </p>
      }
      sections={[
        {
          id: "service",
          title: "What Hakkiri Studio Is",
          body: (
            <p>
              Hakkiri Studio is an AI-powered interview practice, presentation coaching, and career application platform. It parses job descriptions and candidate CVs to generate out-loud mock interviews, follow-up probes, speech feedback, and ATS-optimized documents. Hakkiri Studio is strictly an educational preparation tool; it does not guarantee job offers, placement, or hiring outcomes, and its feedback does not constitute legal, medical, or formal career counsel.
            </p>
          ),
        },
        {
          id: "who",
          title: "Eligibility & Age Requirement",
          body: (
            <p>
              You must be at least 16 years old to use Hakkiri Studio. If you use Hakkiri Studio on behalf of a company, school, or organisation, you confirm you hold authority to bind that organisation to these terms.
            </p>
          ),
        },
        {
          id: "account",
          title: "Your Account & Security",
          body: (
            <p>
              You are responsible for maintaining the confidentiality of your sign-in credentials and for all activity conducted through your account. You must notify us immediately at <a href="mailto:support@hakkiri.studio">support@hakkiri.studio</a> if you suspect unauthorised access.
            </p>
          ),
        },
        {
          id: "content",
          title: "Your Content & Intellectual Property",
          body: (
            <>
              <p>
                You retain complete ownership of all CVs, cover letters, presentation slides, notes, and speech recordings you upload or record in Hakkiri Studio.
              </p>
              <p>
                You grant Happy Cheeks Ltd a limited license solely to process, transcribe, and analyse your content as necessary to provide practice sessions and diagnostic feedback. We do not use your proprietary documents or personal voice to train public AI foundation models.
              </p>
            </>
          ),
        },
        {
          id: "ai-feedback",
          title: "AI-Generated Diagnostics & Feedback",
          body: (
            <p>
              Mock interview scores, question generation, and speech metrics are generated dynamically by artificial intelligence. While calibrated rigorously against executive rubrics, AI feedback is advisory. You are solely responsible for reviewing and customising any CV bullets or application answers before submitting them to employers.
            </p>
          ),
        },
        {
          id: "fair-use",
          title: "Acceptable Use Policy",
          body: (
            <>
              <p>When using Hakkiri Studio, you agree not to:</p>
              <ul>
                <li>Record any third party without explicit consent or impersonate another individual;</li>
                <li>Deploy Hakkiri Studio to cheat during live employer interviews or real-time assessments where prohibited;</li>
                <li>Attempt to bypass rate limits, reverse-engineer underlying models, or scrape platform data;</li>
                <li>Upload defamatory, infringing, or unlawful materials.</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that breach fair-use limits or abuse platform infrastructure.
              </p>
            </>
          ),
        },
        {
          id: "plans",
          title: "Plans, Pricing & Cancellation",
          body: (
            <>
              <p>
                Hakkiri Studio provides flexible plans for candidate preparation:
              </p>
              <ul>
                <li><strong>Complimentary Trial</strong>: Includes a full 10-minute AI mock interview session or presentation run. No payment card required.</li>
                <li><strong>Job Search Pass</strong>: £34.99 for 3 months with 30 hours of AI practice. One-off purchase, never auto-renews.</li>
                <li><strong>Monthly Flex</strong>: £14.99 per month for 10 hours of practice. Cancel anytime from your account settings.</li>
                <li><strong>Practice Boost</strong>: 5 additional practice hours for £7.99.</li>
              </ul>
              <p>
                All payments are securely processed by Stripe. UK consumers have a statutory 14-day right to cancel digital service purchases, which expires once you begin actively utilising practice minutes.
              </p>
            </>
          ),
        },
        {
          id: "availability",
          title: "Service Availability & Changes",
          body: (
            <p>
              We continually enhance Hakkiri Studio and may update features over time. If a material change significantly reduces functionality you have paid for, you are entitled to cancel and receive a pro-rata refund for unused service.
            </p>
          ),
        },
        {
          id: "termination",
          title: "Termination",
          body: (
            <p>
              You may close your account and delete all associated data at any time via Settings. We may terminate or suspend access with 30 days’ notice, or immediately in the event of a material breach of these terms.
            </p>
          ),
        },
        {
          id: "liability",
          title: "Limitation of Liability",
          body: (
            <p>
              To the fullest extent permitted by English law, Happy Cheeks Ltd is not liable for indirect or consequential losses, business interruption, or the hiring decisions of any prospective employer. Nothing in these terms excludes liability for fraud or for death or personal injury caused by negligence.
            </p>
          ),
        },
        {
          id: "law",
          title: "Governing Law & Dispute Resolution",
          body: (
            <p>
              These terms are governed by the laws of England and Wales. Residents of Scotland or Northern Ireland retain statutory rights to bring proceedings in their local courts. For any concern or dispute, please contact <a href="mailto:support@hakkiri.studio">support@hakkiri.studio</a> first so we may resolve it promptly.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Company & Contact Information",
          body: (
            <p>
              Hakkiri Studio is a trading name of Happy Cheeks Ltd (company number 15146182), registered in England and Wales. Direct all legal inquiries to <a href="mailto:support@hakkiri.studio">support@hakkiri.studio</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
