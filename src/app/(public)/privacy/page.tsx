import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shell/LegalPage";

export const metadata: Metadata = {
  title: {
    absolute: "Privacy Policy · Hakkiri",
  },
  description:
    "What Hakkiri Studio collects, why, who it shares it with, how long it keeps it, and your rights under UK GDPR.",
  alternates: {
    canonical: "https://hakkiri.studio/privacy",
  },
};

const DRAFT = false;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="23 November 2026"
      draft={DRAFT}
      intro={
        <>
          <p>
            Hakkiri Studio helps you practise job interviews and presentations out loud. To do that we handle things that matter to you: your CV, the jobs you’re applying for, and recordings of your voice. This policy explains, in plain English, what we collect, why, who else sees it, how long we keep it, and the rights you have under UK data protection law (the UK GDPR and the Data Protection Act 2018).
          </p>
          <p>
            <strong>The short version:</strong> We use your information strictly to power your practice sessions and provide actionable feedback. We never sell your data, we never use your data for advertising, we never create voiceprints to identify you, and we never score your accent. You can export or delete all of your data from Settings at any time.
          </p>
        </>
      }
      sections={[
        {
          id: "who",
          title: "Who We Are",
          body: (
            <>
              <p>
                Hakkiri Studio is a trading name of Happy Cheeks Ltd (company number 15146182), registered in England and Wales. We are the controller of your personal data.
              </p>
              <p>
                Questions about your data or compliance: <a href="mailto:support@hakkiri.studio">support@hakkiri.studio</a>.
              </p>
            </>
          ),
        },
        {
          id: "collect",
          title: "What We Collect",
          body: (
            <>
              <ul>
                <li>
                  <strong>Account details</strong>: your email address, name, and profile credentials.
                </li>
                <li>
                  <strong>What you provide for interview setup</strong>: your CV, cover letter, job descriptions (pasted text, uploaded files or links), company and role details, target interview dates, notes, custom questions, and presentation slides.
                </li>
                <li>
                  <strong>Recordings of your practice answers</strong>: the audio recordings of your responses, preserved so you can listen back and review delivery.
                </li>
                <li>
                  <strong>Generated feedback & diagnostics</strong>: transcripts of your answers, quantified scoring rubrics, AI feedback, STAR story bank, and preparation reports.
                </li>
                <li>
                  <strong>Usage & audit records</strong>: duration of AI synthesis utilised, session counts, and rate limiting counters to manage fair use.
                </li>
                <li>
                  <strong>Technical security logs</strong>: IP address and browser technical telemetry retained for up to 14 days solely for security monitoring and rate limiting.
                </li>
                <li>
                  <strong>Payment processing details</strong>: securely handled directly by our PCI-DSS certified payment processor (Stripe); we never store or see your full credit card number.
                </li>
              </ul>
              <p>
                Your CV or answers may include personal background details. We only process them to generate honest practice feedback. You have full control over what information you include.
              </p>
            </>
          ),
        },
        {
          id: "use",
          title: "How We Use It, and Our Lawful Basis",
          body: (
            <table>
              <thead>
                <tr>
                  <th scope="col">Processing Activity</th>
                  <th scope="col">Lawful Basis (UK GDPR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Generate interview questions, transcribe and score spoken answers, and provide feedback</td>
                  <td>Contract: Performance of the requested practice service</td>
                </tr>
                <tr>
                  <td>Store your recordings, reports, and evidence bank so you can access them across sessions</td>
                  <td>Contract</td>
                </tr>
                <tr>
                  <td>Enforce fair-use limits, rate limits, prevent abuse, and safeguard infrastructure</td>
                  <td>Legitimate interests: Maintaining system availability and security for all candidates</td>
                </tr>
                <tr>
                  <td>Improve diagnostic algorithms using anonymised, aggregated usage analytics (never your CV or audio)</td>
                  <td>Legitimate interests</td>
                </tr>
                <tr>
                  <td>Send essential transactional emails (sign-in authentication and security alerts)</td>
                  <td>Contract</td>
                </tr>
                <tr>
                  <td>Product news and platform updates (only if you explicitly opt in)</td>
                  <td>Consent (withdrawable at any time via Settings)</td>
                </tr>
              </tbody>
            </table>
          ),
        },
        {
          id: "ai",
          title: "How AI Works with Your Data",
          body: (
            <>
              <p>
                Hakkiri Studio uses advanced AI foundation models to generate interview questions, ask dynamic follow-ups, and score candidate answers. Feedback is generated automatically to guide your preparation, not to make automated decisions about your employment. We do not use your CVs, answers, or recordings to train public foundation models.
              </p>
              <ul>
                <li>We never score or evaluate your regional or international accent.</li>
                <li>Audio recordings are transcribed to text; all diagnostic scoring evaluates content structure, quantified metrics, and delivery timing.</li>
              </ul>
            </>
          ),
        },
        {
          id: "share",
          title: "Third-Party Service Providers",
          body: (
            <>
              <p>
                We partner with vetted infrastructure providers under strict Data Processing Agreements to deliver Hakkiri Studio:
              </p>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Provider & Service</th>
                    <th scope="col">Purpose & Data Handled</th>
                    <th scope="col">Region</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Anthropic (Claude)</td>
                    <td>Question generation, follow-up probing, and rubric scoring. Receives CV text and answer transcripts under zero-retention / non-training terms.</td>
                    <td>United States</td>
                  </tr>
                  <tr>
                    <td>Deepgram</td>
                    <td>Real-time speech-to-text transcription. Receives candidate audio under model-improvement opt-out terms.</td>
                    <td>United States</td>
                  </tr>
                  <tr>
                    <td>Speech Synthesis Engine</td>
                    <td>Natural voice generation for the interviewer persona. Receives only question text, never candidate voice.</td>
                    <td>United States / EU</td>
                  </tr>
                  <tr>
                    <td>Cloud Infrastructure (AWS / Vercel)</td>
                    <td>Secure application hosting, encrypted database storage, and SSL termination.</td>
                    <td>United Kingdom / EU</td>
                  </tr>
                  <tr>
                    <td>Transactional Email (Resend)</td>
                    <td>Sign-in links and critical security communications.</td>
                    <td>United States / EU</td>
                  </tr>
                  <tr>
                    <td>Stripe</td>
                    <td>Secure payment processing and subscription billing.</td>
                    <td>United Kingdom / US</td>
                  </tr>
                </tbody>
              </table>
              <p>
                We never sell, rent, or trade your personal data to recruiters, employers, or third-party marketing networks.
              </p>
            </>
          ),
        },
        {
          id: "transfers",
          title: "International Data Transfers",
          body: (
            <p>
              Where processing occurs outside the United Kingdom, transfers are safeguarded under standard UK International Data Transfer Agreements (IDTA) or the UK-US Data Bridge, ensuring equivalent statutory protections.
            </p>
          ),
        },
        {
          id: "keep",
          title: "Data Retention & Deletion",
          body: (
            <ul>
              <li>
                <strong>Spoken Audio Recordings</strong>: Preserved for your chosen period in Settings (default 90 days), after which audio is permanently purged while keeping transcripts for your historical scores.
              </li>
              <li>
                <strong>Interviews, Reports & CVs</strong>: Retained until you manually delete them or close your account.
              </li>
              <li>
                <strong>Aggregated Usage Stats</strong>: Retained in de-identified format for up to 12 months for system capacity planning.
              </li>
              <li>
                <strong>Backup Archives</strong>: Deleted records are completely overwritten in secure rolling backups within 30 days.
              </li>
            </ul>
          ),
        },
        {
          id: "rights",
          title: "Your Statutory Rights",
          body: (
            <>
              <p>Under UK GDPR, you have the right to:</p>
              <ul>
                <li>
                  <strong>Access & Portability</strong>: Download a complete copy of all your interviews, transcripts, and scores via Settings.
                </li>
                <li>
                  <strong>Erasure</strong>: Instantly delete specific interviews or purge your entire account and all associated data with one click.
                </li>
                <li>
                  <strong>Rectification & Restriction</strong>: Correct inaccurate data or restrict processing where applicable.
                </li>
              </ul>
              <p>
                To exercise any statutory right, contact <a href="mailto:support@hakkiri.studio">support@hakkiri.studio</a>. You also hold the right to lodge a complaint with the UK Information Commissioner’s Office (<a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>).
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies & Local Storage",
          body: (
            <>
              <p>
                Hakkiri Studio uses strictly necessary operational cookies. We do not deploy third-party advertising or cross-site tracking cookies:
              </p>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Cookie Identifier</th>
                    <th scope="col">Operational Purpose</th>
                    <th scope="col">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>hk_session</td>
                    <td>Maintains authenticated user session state</td>
                    <td>30 days</td>
                  </tr>
                  <tr>
                    <td>hk_mic_ok</td>
                    <td>Remembers successful microphone calibration in current browser</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td>hk_voice</td>
                    <td>Stores natural voice preference calibration</td>
                    <td>1 year</td>
                  </tr>
                </tbody>
              </table>
            </>
          ),
        },
        {
          id: "security",
          title: "Security & Encryption",
          body: (
            <p>
              Candidate data is protected with TLS 1.3 encryption in transit and AES-256 encryption at rest. Multi-layer access controls ensure access is restricted strictly to authorized systems operating on your instructions.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact & Data Protection Inquiries",
          body: (
            <p>
              For data protection questions, subject access requests, or privacy inquiries, contact our Data Protection Officer at <a href="mailto:support@hakkiri.studio">support@hakkiri.studio</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
