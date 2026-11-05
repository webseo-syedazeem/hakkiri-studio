import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shell/LegalPage";

export const metadata: Metadata = { title: "Terms · Hakkiri", description: "The terms for using Hakkiri." };

/** Set to false once a solicitor has approved the wording. */
const DRAFT = true;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated="26 October 2026"
      draft={DRAFT}
      intro={
        <p>
          These terms are the agreement between you and [Company name] Ltd (“we”, “us”) for using Hakkiri. Please read them; by using Hakkiri you agree to them. Our <Link href="/privacy">privacy policy</Link> explains how we handle your data. If you’re a
          consumer, nothing here affects your legal rights.
        </p>
      }
      sections={[
        {
          id: "service",
          title: "What Hakkiri is",
          body: (
            <p>
              Hakkiri is a practice tool. It writes interview questions from a job and your CV, asks them out loud, listens to your answers and gives you feedback, and helps you rehearse presentations. It’s for practice only. It doesn’t guarantee you a job
              or an offer, and its feedback isn’t careers, legal, financial or medical advice.
            </p>
          ),
        },
        {
          id: "eligibility",
          title: "Who can use it",
          body: <p>You must be [16] or over. If you use Hakkiri for an organisation, you confirm you’re allowed to accept these terms for it.</p>,
        },
        {
          id: "account",
          title: "Your account",
          body: (
            <p>
              [Once accounts launch:] you sign in with an email link or with Google. Keep access to your email account secure: anyone who can open your sign-in emails can get into your Hakkiri account. Tell us straight away at [support@hakkiri.com] if you
              think someone else has used it.
            </p>
          ),
        },
        {
          id: "content",
          title: "Your content",
          body: (
            <>
              <p>
                Everything you add (your CV, job specs, notes, slides) and your recordings and answers stay yours. You give us permission to store and process them only to run Hakkiri for you, including sending them to the providers listed in our privacy
                policy. That permission ends when you delete them, apart from the short time it takes to clear them from backups.
              </p>
              <p>
                Only upload things you have the right to use. Job specs and company information should be ones you have access to as an applicant. Don’t upload other people’s personal data beyond what’s needed (for example a reference’s contact details).
              </p>
            </>
          ),
        },
        {
          id: "ai",
          title: "AI-generated feedback",
          body: (
            <p>
              Questions, follow-ups, scores, stronger versions of your answers and other feedback are produced by AI and can be wrong, incomplete or not right for your situation. Use your own judgement. Make sure what you say in a real interview is true: the
              stronger versions are examples, not facts about you. Guidance in the pay drill is general and isn’t advice about any particular offer.
            </p>
          ),
        },
        {
          id: "use",
          title: "Fair use",
          body: (
            <>
              <p>Please don’t:</p>
              <ul>
                <li>record anyone else without their permission, or use Hakkiri to impersonate someone;</li>
                <li>use Hakkiri during a real interview or assessment where that isn’t allowed;</li>
                <li>try to get around usage limits, overload the service, scrape it, or copy or reverse-engineer it;</li>
                <li>upload anything unlawful, harmful or that you don’t have the right to share.</li>
              </ul>
              <p>
                There are daily practice limits so Hakkiri stays quick and affordable for everyone. We may change them, and we’ll tell you if a change affects your plan. We may suspend an account that breaks these terms; where we reasonably can, we’ll tell you
                why first.
              </p>
            </>
          ),
        },
        {
          id: "plans",
          title: "Plans and payment",
          body: (
            <p>
              [To be finalised with the solicitor. Proposed plans, as shown on the website: a free 10-minute interview or run; Job search, £34.99 for 3 months with 30 hours of practice, paid once, never renews; Monthly, £14.99 for 10 hours a month, cancels any time; extra hours, 5 for £7.99. Still to write: billing period, renewal, how to cancel, and the 14-day cancellation right for UK consumers (and that it ends once you start using paid minutes, if
              you agree to that at purchase). Payments are processed by Stripe.]
            </p>
          ),
        },
        {
          id: "availability",
          title: "Changes and availability",
          body: (
            <p>
              We’re always improving Hakkiri, so features change. We aim to keep it running smoothly but can’t promise it will always be available or free of mistakes. If we make a change that significantly reduces what you’ve paid for, we’ll tell you and
              you can cancel and get a refund for the unused part.
            </p>
          ),
        },
        {
          id: "ending",
          title: "Ending",
          body: <p>You can stop using Hakkiri and delete your data at any time in Settings. We can end these terms with [30] days’ notice, or straight away if you seriously break them. When the agreement ends, we delete your data as our privacy policy says.</p>,
        },
        {
          id: "liability",
          title: "Our responsibility to you",
          body: (
            <p>
              If we fail to meet these terms, we’re responsible for loss you suffer that was a foreseeable result. We’re not responsible for loss that wasn’t foreseeable, for business losses, or for the outcome of any interview or job application. Nothing here
              limits our responsibility for death or personal injury caused by our negligence, for fraud, or for anything else the law doesn’t allow us to limit. [Liability cap, if any, to be set by the solicitor.]
            </p>
          ),
        },
        {
          id: "law",
          title: "Law and disputes",
          body: (
            <p>
              These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you can also bring a claim there. If you have a complaint, email [support@hakkiri.com] first: we’ll do our best to sort it out.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          body: (
            <p>
              [Company name] Ltd, [registered address]. Email <a href="mailto:[support@hakkiri.com]">[support@hakkiri.com]</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
