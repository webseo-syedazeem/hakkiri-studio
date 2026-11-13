import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shell/LegalPage";

export const metadata: Metadata = { title: "Privacy policy · Hakkiri", description: "What Hakkiri collects, why, who it shares it with, how long it keeps it, and your rights." };

/** Set to false once a solicitor has approved the wording. */
const DRAFT = true;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="26 October 2026"
      draft={DRAFT}
      intro={
        <>
          <p>
            Hakkiri helps you practise job interviews and presentations out loud. To do that we handle things that matter to you: your CV, the jobs you’re applying for, and recordings of your voice. This policy explains, in plain English, what we collect, why, who
            else sees it, how long we keep it, and the rights you have under UK data protection law (the UK GDPR and the Data Protection Act 2018).
          </p>
          <p>
            <strong>The short version:</strong> we use your information only to run your practice and give you feedback. We don’t sell it, we don’t use it for advertising, we don’t use your voice to identify you, and we never score your accent. You can download
            everything or delete everything from <Link href="/settings#data">Settings</Link> at any time.
          </p>
        </>
      }
      sections={[
        {
          id: "who",
          title: "Who we are",
          body: (
            <>
              <p>
                Hakkiri is run by Hakkiri Ltd, a company registered in England and Wales, at 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom. We are the controller of your personal data.
              </p>
              <p>
                Questions about your data: <a href="mailto:support@hakkiri.studio">support@hakkiri.studio</a>.
              </p>
            </>
          ),
        },
        {
          id: "collect",
          title: "What we collect",
          body: (
            <>
              <ul>
                <li>
                  <strong>Account details</strong>: your email address, and your name and profile picture if you sign in with Google. [Applies once accounts launch.]
                </li>
                <li>
                  <strong>What you give us to set up practice</strong>: your CV and cover letter, job specs (pasted text, files or links), the company and role, the interview date, notes, questions you add, and presentation slides and notes.
                </li>
                <li>
                  <strong>Recordings of your answers</strong>: the audio of each answer you give in an interview, kept so you can listen back.
                </li>
                <li>
                  <strong>What Hakkiri makes from it</strong>: transcripts of what you said, scores, feedback, your story bank, reports and prep sheets.
                </li>
                <li>
                  <strong>Usage records</strong>: when Hakkiri used an AI service for you, how much it used (for example minutes of audio) and an estimated cost, so we can apply fair-use limits.
                </li>
                <li>
                  <strong>Technical data</strong>: your IP address, used for a few minutes at a time to stop too many requests from one place, and server logs kept for [14] days for security. [Confirm with hosting provider.]
                </li>
                <li>
                  <strong>Payment details</strong>: handled by our payment provider; we never see your full card number. [Applies once paid plans launch.]
                </li>
              </ul>
              <p>
                Your CV or answers may happen to include sensitive details (for example about your health). We only use them to give you feedback on your practice. Please leave out anything you don’t need to include.
              </p>
            </>
          ),
        },
        {
          id: "use",
          title: "How we use it, and our lawful basis",
          body: (
            <table>
              <thead>
                <tr>
                  <th scope="col">What we do</th>
                  <th scope="col">Lawful basis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Write interview questions from the job and your CV, run the interview, transcribe and score your answers, and give feedback</td>
                  <td>Contract: it’s the service you asked for</td>
                </tr>
                <tr>
                  <td>Keep your recordings, reports and stories so you can come back to them</td>
                  <td>Contract</td>
                </tr>
                <tr>
                  <td>Fair-use limits, rate limits, preventing abuse and keeping the service secure</td>
                  <td>Legitimate interests: keeping Hakkiri working and affordable for everyone</td>
                </tr>
                <tr>
                  <td>Fixing problems and improving Hakkiri, using usage records and anonymous statistics (not your recordings or CV)</td>
                  <td>Legitimate interests</td>
                </tr>
                <tr>
                  <td>Emails about your account (for example sign-in links)</td>
                  <td>Contract</td>
                </tr>
                <tr>
                  <td>Product news, if you choose to receive it</td>
                  <td>Consent, which you can withdraw at any time [only if we send marketing]</td>
                </tr>
              </tbody>
            </table>
          ),
        },
        {
          id: "ai",
          title: "How the AI works with your data",
          body: (
            <>
              <p>
                Hakkiri uses AI services to write questions, ask follow-ups and give feedback. Feedback is produced automatically and can be wrong; it’s guidance for practice, not a judgement about you, and it isn’t used to make any decision about you. We
                don’t use your recordings or CV to train AI models. Anthropic doesn’t train on what we send it, and we opt out of Deepgram’s model-improvement programme for your recordings. [Confirm against each provider’s current terms.]
              </p>
              <ul>
                <li>We don’t score accent, and we don’t create voiceprints or use your voice to identify you.</li>
                <li>Your recordings are turned into text; the scoring works on the text and the timing of what you said.</li>
              </ul>
            </>
          ),
        },
        {
          id: "share",
          title: "Who we share it with",
          body: (
            <>
              <p>We use these companies to run Hakkiri. They process your data only on our instructions, under contracts that protect it.</p>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Provider</th>
                    <th scope="col">What for, and what they receive</th>
                    <th scope="col">Where</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Anthropic (Claude)</td>
                    <td>Writing questions and follow-ups, scoring and feedback. Receives the job details, your CV text and transcripts of your answers. Not used to train their models. [Confirm current API data-retention period.]</td>
                    <td>United States</td>
                  </tr>
                  <tr>
                    <td>Deepgram</td>
                    <td>Speech to text. Receives the audio of your answers. We opt out of their model-improvement programme, so audio is kept only as long as needed to transcribe it.</td>
                    <td>United States</td>
                  </tr>
                  <tr>
                    <td>ElevenLabs</td>
                    <td>The interviewer’s voice. Receives only the interviewer’s question text, never your voice. [Confirm retention: request history is kept unless zero-retention mode is on.]</td>
                    <td>[United States / EU]</td>
                  </tr>
                  <tr>
                    <td>[Hosting provider]</td>
                    <td>Runs the app and stores your data</td>
                    <td>[United Kingdom / EU]</td>
                  </tr>
                  <tr>
                    <td>[Email provider, e.g. Resend] and [an alerts webhook, e.g. Slack]</td>
                    <td>Error alerts to our own team: when something breaks, the alert names the page or route, the error message and your browser type. Never your CV, recordings or transcripts. [Also sign-in links and account emails once accounts launch.]</td>
                    <td>[ ]</td>
                  </tr>
                  <tr>
                    <td>Stripe</td>
                    <td>Payments [once paid plans launch]</td>
                    <td>[United States / EU]</td>
                  </tr>
                </tbody>
              </table>
              <p>
                We don’t sell your data or share it with employers, recruiters or advertisers. We would share it only if the law requires us to, or as part of a sale of the business, in which case this policy would continue to apply.
              </p>
            </>
          ),
        },
        {
          id: "transfers",
          title: "International transfers",
          body: (
            <p>
              Some providers are in the United States. Where data leaves the UK we rely on [the UK–US data bridge, where the provider is certified, or the UK International Data Transfer Addendum to the EU standard contractual clauses]. You can ask us for a copy of
              the safeguards.
            </p>
          ),
        },
        {
          id: "keep",
          title: "How long we keep it",
          body: (
            <ul>
              <li>
                <strong>Recordings of your answers</strong>: for as long as you choose in Settings (30 days, 90 days, 1 year, or until you delete them). The default is 90 days. After that the audio is deleted; the transcript and scores stay so your reports still
                work.
              </li>
              <li>
                <strong>Interviews, transcripts, reports, stories and presentations</strong>: until you delete them, or delete your account. [Accounts unused for [24] months are deleted after a warning email.]
              </li>
              <li>
                <strong>Usage records</strong>: 12 months. If you delete your data, they’re kept without any link to you, to keep fair-use limits working.
              </li>
              <li>
                <strong>IP addresses for rate limits</strong>: a few minutes, in memory only.
              </li>
              <li>
                <strong>Backups</strong>: deleted data drops out of backups within [30] days.
              </li>
            </ul>
          ),
        },
        {
          id: "rights",
          title: "Your rights",
          body: (
            <>
              <p>You have the right to:</p>
              <ul>
                <li>
                  <strong>Get a copy</strong> of your data. Use “Download my data” in <Link href="/settings#data">Settings</Link>: a zip of everything, in a format you can take elsewhere.
                </li>
                <li>
                  <strong>Delete</strong> your data. Use “Delete all my data” in Settings, or delete one interview at a time.
                </li>
                <li>
                  <strong>Correct</strong> anything that’s wrong, <strong>restrict</strong> or <strong>object</strong> to how we use it, and <strong>withdraw consent</strong> where we rely on it.
                </li>
              </ul>
              <p>
                For anything you can’t do in Settings, email <a href="mailto:[privacy@hakkiri.com]">[privacy@hakkiri.com]</a>. We’ll reply within one month. If you’re unhappy with how we handle your data, you can complain to the Information Commissioner’s
                Office at <a href="https://ico.org.uk/make-a-complaint/">ico.org.uk/make-a-complaint</a>, though we’d appreciate the chance to put it right first.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies",
          body: (
            <>
              <p>Hakkiri uses only cookies it needs to work. No advertising or tracking cookies, and no analytics cookies. [Update if analytics are added.]</p>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Cookie</th>
                    <th scope="col">What it does</th>
                    <th scope="col">How long</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>hk_welcomed</td>
                    <td>Remembers you’ve seen the welcome screen</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td>hk_mic_ok</td>
                    <td>Remembers your microphone check passed in this browser</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td>hk_voice</td>
                    <td>Your choice of interviewer voice</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td>[Sign-in session]</td>
                    <td>Keeps you signed in [once accounts launch]</td>
                    <td>[30 days]</td>
                  </tr>
                </tbody>
              </table>
            </>
          ),
        },
        {
          id: "children",
          title: "Age",
          body: <p>Hakkiri is for people aged [16] and over. We don’t knowingly collect data from anyone younger; if you think we have, contact us and we’ll delete it.</p>,
        },
        {
          id: "security",
          title: "Security",
          body: (
            <p>
              Data is encrypted in transit (HTTPS) and at rest [confirm with hosting provider]. Access is limited to the people who need it to run Hakkiri. If a breach puts your data at risk, we’ll tell you and the ICO as the law requires.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: <p>If we change this policy in a way that matters, we’ll tell you in the app or by email before it takes effect. The date at the top shows the latest version.</p>,
        },
      ]}
    />
  );
}
