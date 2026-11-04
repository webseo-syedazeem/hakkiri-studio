import Link from "next/link";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui";
import { Mark } from "@/components/brand/Mark";
import { EXTRA_HOURS, priceLabel, type Plan } from "@/lib/pricing";
import { BETA, isBeta } from "@/lib/launch";

/**
 * The sections of the public pages (interviews and presenters). White and
 * light grey, near-black type, Hakkiri blue for actions; the app itself is
 * always shown in its own dark colours, inside a device frame.
 */

const WRAP = "mx-auto w-full max-w-[1120px] px-4 sm:px-6";
const H2 =
  "text-[36px] font-semibold leading-[1.08] tracking-[-0.03em] [text-wrap:balance] sm:text-[48px] lg:text-[56px]";
const LEAD =
  "text-[19px] leading-[1.5] text-mk-slate [text-wrap:pretty] sm:text-[21px]";

/* ------------------------------------------------------------------ actions */

/** The main call to action: a blue pill that opens the app. */
export function Cta({
  children,
  size = "lg",
  className,
}: {
  children: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <Link
      href="/signup"
      className={clsx(
        "inline-flex items-center justify-center rounded-full bg-mk-cta font-medium text-white transition-colors hover:bg-mk-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta",
        size === "lg" ? "px-7 py-3.5 text-[17px]" : "px-5 py-2.5 text-[15px]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** The reassurance under a button: what it costs you to try. */
export function Reassure({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx("text-[14px] text-mk-slate", className)}>{children}</p>
  );
}

export function TextLink({
  href,
  children,
  className,
  dark = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "text-[17px] font-medium underline-offset-4 hover:underline",
        dark ? "text-[#aeb6ff]" : "text-mk-blue",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ images */

/** A real screen from the app, in its own dark colours, framed like a display. */
export function Device({
  src,
  alt,
  width,
  height,
  className,
  imgClass,
  priority = false,
  fade = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imgClass?: string;
  priority?: boolean;
  fade?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-[20px] bg-mk-bezel p-[5px] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_60px_120px_-40px_rgb(23_28_80/0.45)] sm:rounded-[26px] sm:p-[9px]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[15px] sm:rounded-[18px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- static screenshots, already sized */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={clsx("block h-auto w-full", imgClass)}
        />
        {fade && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-mk-stage to-transparent"
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ sections */

export function DraftNote({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      role="note"
      className="bg-mk-mist px-4 py-2 text-center text-[12px] text-mk-slate"
    >
      Draft page. Prices are the proposed launch prices; payments aren’t built
      yet.
    </div>
  );
}

/** The top of a page: centred headline, one paragraph, the button and what it costs to try, then the app. */
export function Hero({
  kicker,
  title,
  body,
  cta,
  reassure,
  secondary,
  children,
}: {
  kicker: string;
  title: string;
  body: string;
  cta: string;
  reassure: string;
  secondary: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby="hero-h"
      className="overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24"
    >
      <div className={clsx(WRAP, "flex flex-col items-center text-center")}>
        <p className="text-[17px] font-semibold text-mk-blue sm:text-[19px]">
          {kicker}
        </p>
        <h1
          id="hero-h"
          className="mt-3 max-w-[920px] animate-rise text-[44px] font-semibold leading-[1.03] tracking-[-0.04em] [text-wrap:balance] sm:text-[68px] lg:text-[80px]"
        >
          {title}
        </h1>
        <p className={clsx(LEAD, "mt-6 max-w-[680px]")}>{body}</p>
        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:gap-7">
          <Cta>{cta}</Cta>
          <TextLink href={secondary.href}>{secondary.label}</TextLink>
        </div>
        <Reassure className="mt-4">{reassure}</Reassure>
      </div>
      <div
        className={clsx(
          WRAP,
          "mt-14 animate-rise [animation-delay:120ms] sm:mt-20",
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** A short, large statement between sections: the problem the page solves. */
export function Statement({
  title,
  body,
  points,
}: {
  title: string;
  body: string;
  points: { icon: IconName; text: string }[];
}) {
  return (
    <section aria-labelledby="why-h" className="bg-mk-mist py-24 sm:py-32">
      <div className={clsx(WRAP, "text-center")}>
        <h2 id="why-h" className={clsx(H2, "mx-auto max-w-[880px]")}>
          {title}
        </h2>
        <p className={clsx(LEAD, "mx-auto mt-6 max-w-[700px]")}>{body}</p>
        <ul className="mx-auto mt-14 grid max-w-[960px] gap-8 text-left sm:grid-cols-3 sm:gap-10">
          {points.map((p) => (
            <li
              key={p.text}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-mk-blue shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
                <Icon name={p.icon} size={22} />
              </span>
              <span className="max-w-[260px] text-[17px] font-medium leading-snug">
                {p.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Three numbered steps (they really are a sequence), then the button. */
export function Steps({
  title,
  steps,
  cta,
  reassure,
}: {
  title: string;
  steps: { title: string; body: string }[];
  cta: string;
  reassure: string;
}) {
  return (
    <section
      id="how"
      aria-labelledby="how-h"
      className="scroll-mt-14 py-24 sm:py-32"
    >
      <div className={WRAP}>
        <h2 id="how-h" className={clsx(H2, "text-center")}>
          {title}
        </h2>
        <ol className="mx-auto mt-14 grid max-w-[1000px] gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((st, i) => (
            <li key={st.title} className="flex flex-col">
              <span className="num text-[56px] font-semibold leading-none tracking-[-0.04em] text-mk-cta">
                {i + 1}
              </span>
              <h3 className="mt-4 text-[21px] font-semibold tracking-[-0.015em]">
                {st.title}
              </h3>
              <p className="mt-2 text-[17px] leading-relaxed text-mk-slate">
                {st.body}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-14 flex flex-col items-center gap-3">
          <Cta>{cta}</Cta>
          <Reassure>{reassure}</Reassure>
        </div>
      </div>
    </section>
  );
}

/** One feature: a centred headline and paragraph, a few specifics, then the real screen large. */
export function Feature({
  id,
  kicker,
  title,
  body,
  points,
  shot,
  mist = false,
  narrow = false,
  after,
}: {
  id?: string;
  kicker: string;
  title: string;
  body: string;
  points?: string[];
  shot: React.ReactNode;
  mist?: boolean;
  narrow?: boolean;
  after?: React.ReactNode;
}) {
  const hid = `${id ?? kicker.toLowerCase().replace(/\W+/g, "-")}-h`;
  return (
    <section
      id={id}
      aria-labelledby={hid}
      className={clsx("scroll-mt-14 py-24 sm:py-32", mist && "bg-mk-mist")}
    >
      <div className={WRAP}>
        <div className="mx-auto max-w-[820px] text-center">
          <p className="text-[17px] font-semibold text-mk-blue">{kicker}</p>
          <h2 id={hid} className={clsx(H2, "mt-2")}>
            {title}
          </h2>
          <p className={clsx(LEAD, "mx-auto mt-5 max-w-[680px]")}>{body}</p>
        </div>
        {points && (
          <ul className="mx-auto mt-8 flex max-w-[860px] flex-wrap justify-center gap-x-7 gap-y-3 text-[15px] text-mk-ink/80">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Icon
                  name="check"
                  size={16}
                  strokeWidth={2.4}
                  className="shrink-0 text-mk-cta"
                />
                {p}
              </li>
            ))}
          </ul>
        )}
        <div
          className={clsx("mt-14 sm:mt-16", narrow && "mx-auto max-w-[860px]")}
        >
          {shot}
        </div>
        {after}
      </div>
    </section>
  );
}

/** Tiles: two with a screen, the rest short. */
export function Tiles({
  title,
  big = [],
  small,
  mist = true,
}: {
  title: string;
  big?: {
    title: string;
    body: string;
    shot: { src: string; alt: string; width: number; height: number };
  }[];
  small: { icon: IconName; title: string; body: string }[];
  mist?: boolean;
}) {
  return (
    <section
      aria-labelledby="tiles-h"
      className={clsx("py-24 sm:py-32", mist && "bg-mk-mist")}
    >
      <div className={WRAP}>
        <h2
          id="tiles-h"
          className={clsx(H2, "mx-auto max-w-[820px] text-center")}
        >
          {title}
        </h2>
        {big.length > 0 && (
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {big.map((t) => (
              <article
                key={t.title}
                className="flex min-w-0 flex-col overflow-hidden rounded-[28px] bg-white"
              >
                <div className="px-8 pt-9 sm:px-10 sm:pt-11">
                  <h3 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] [text-wrap:balance] sm:text-[30px]">
                    {t.title}
                  </h3>
                  <p className="mt-3 text-[17px] leading-relaxed text-mk-slate">
                    {t.body}
                  </p>
                </div>
                <div className="mt-8 grow pl-8 sm:pl-10">
                  <div className="h-full max-h-[340px] overflow-hidden rounded-tl-[16px] bg-mk-bezel p-[6px] pb-0 pr-0 sm:max-h-[380px]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- static screenshots, already sized */}
                    <img
                      src={t.shot.src}
                      alt={t.shot.alt}
                      width={t.shot.width}
                      height={t.shot.height}
                      loading="lazy"
                      decoding="async"
                      className="block h-auto w-[150%] max-w-none rounded-tl-[11px] sm:w-[135%]"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <ul
          className={clsx(
            "grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
            big.length ? "mt-5" : "mt-14",
          )}
        >
          {small.map((f) => (
            <li
              key={f.title}
              className={clsx(
                "rounded-[22px] px-7 py-7",
                mist ? "bg-white" : "bg-mk-mist",
              )}
            >
              <Icon name={f.icon} size={24} className="text-mk-cta" />
              <h3 className="mt-4 text-[19px] font-semibold tracking-[-0.01em]">
                {f.title}
              </h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-mk-slate">
                {f.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The one dark section: presentations, on a stage, in the app's own colours. */
export function Stage({
  id,
  kicker,
  title,
  body,
  uses,
  main,
  pair = [],
  link,
}: {
  id?: string;
  kicker: string;
  title: string;
  body: string;
  uses?: string[];
  main: React.ReactNode;
  pair?: { caption: string; node: React.ReactNode }[];
  link?: { href: string; label: string };
}) {
  return (
    <section
      id={id}
      aria-labelledby="stage-h"
      className="relative scroll-mt-14 overflow-hidden bg-mk-stage py-24 text-white sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[1000px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(123_136_255/0.22),transparent)]"
      />
      <div className={clsx(WRAP, "relative")}>
        <div className="mx-auto max-w-[820px] text-center">
          <p className="text-[17px] font-semibold text-[#aeb6ff]">{kicker}</p>
          <h2 id="stage-h" className={clsx(H2, "mt-2")}>
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-[680px] text-[19px] leading-[1.5] text-white/70 sm:text-[21px]">
            {body}
          </p>
          {uses && (
            <ul
              aria-label="Good for"
              className="mt-8 flex flex-wrap justify-center gap-2"
            >
              {uses.map((u) => (
                <li
                  key={u}
                  className="rounded-full bg-white/[0.08] px-3.5 py-1.5 text-[14px] text-white/85 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]"
                >
                  {u}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-14 sm:mt-16">{main}</div>
        {pair.length > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {pair.map((p) => (
              <figure key={p.caption} className="min-w-0">
                {p.node}
                <figcaption className="mt-4 text-center text-[15px] text-white/70">
                  {p.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        {link && (
          <div className="mt-12 text-center">
            <TextLink href={link.href} dark>
              {link.label}
            </TextLink>
          </div>
        )}
      </div>
    </section>
  );
}

type Mark3 = "yes" | "no" | "some";
const MARK_TEXT: Record<Mark3, string> = {
  yes: "Yes",
  no: "No",
  some: "Sometimes",
};

function Tick({ v }: { v: Mark3 | string }) {
  if (v !== "yes" && v !== "no" && v !== "some")
    return <span className="text-[15px]">{v}</span>;
  return (
    <span className="inline-flex items-center justify-center">
      {v === "yes" ? (
        <Icon
          name="check"
          size={20}
          strokeWidth={2.6}
          className="text-mk-cta"
        />
      ) : v === "no" ? (
        <Icon
          name="x"
          size={18}
          strokeWidth={2.2}
          className="text-mk-slate/60"
        />
      ) : (
        <span className="text-[14px] text-mk-slate">Sometimes</span>
      )}
      {v !== "some" && <span className="sr-only">{MARK_TEXT[v]}</span>}
    </span>
  );
}

/** Hakkiri next to the usual alternatives, row by row. */
export function Compare({
  title,
  body,
  columns,
  rows,
}: {
  title: string;
  body: string;
  columns: [string, string, string];
  rows: {
    label: string;
    values: [Mark3 | string, Mark3 | string, Mark3 | string];
  }[];
}) {
  return (
    <section aria-labelledby="compare-h" className="py-24 sm:py-32">
      <div className={WRAP}>
        <div className="mx-auto max-w-[820px] text-center">
          <h2 id="compare-h" className={H2}>
            {title}
          </h2>
          <p className={clsx(LEAD, "mx-auto mt-5 max-w-[640px]")}>{body}</p>
        </div>
        <div className="relative mx-auto mt-14 max-w-[940px] overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="w-[40%] pb-4">
                  <span className="sr-only">What you get</span>
                </th>
                {columns.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={clsx(
                      "px-3 pb-4 text-center text-[15px] font-semibold",
                      i === 0
                        ? "rounded-t-[18px] bg-mk-mist pt-5 text-mk-ink"
                        : "text-mk-slate",
                    )}
                  >
                    {i === 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Mark size={20} />
                        {c}
                      </span>
                    ) : (
                      c
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={r.label} className="border-t border-mk-line/70">
                  <th scope="row" className="py-4 pr-4 text-[16px] font-medium">
                    {r.label}
                  </th>
                  {r.values.map((v, i) => (
                    <td
                      key={i}
                      className={clsx(
                        "px-3 py-4 text-center",
                        i === 0 && "bg-mk-mist font-semibold",
                        i === 0 && ri === rows.length - 1 && "rounded-b-[18px]",
                      )}
                    >
                      <Tick v={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/** Plans, what's reassuring about them, how hours work, and extra hours. */
export function Pricing({
  title,
  intro,
  plans,
  promises,
  hoursLine,
  hoursPoints,
}: {
  title: string;
  intro: string;
  plans: Plan[];
  promises: string[];
  hoursLine: string;
  hoursPoints: string[];
}) {
  if (isBeta()) return <BetaPricing plans={plans} />;
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-h"
      className="scroll-mt-14 bg-mk-mist py-24 sm:py-32"
    >
      <div className={WRAP}>
        <div className="mx-auto max-w-[760px] text-center">
          <h2 id="pricing-h" className={H2}>
            {title}
          </h2>
          <p className={clsx(LEAD, "mt-5")}>{intro}</p>
        </div>
        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <article
              key={p.id}
              aria-labelledby={`plan-${p.id}`}
              className={clsx(
                "relative flex flex-col rounded-[24px] bg-white px-8 py-9",
                p.featured
                  ? "shadow-[0_0_0_2px_var(--color-mk-cta),0_30px_60px_-30px_rgb(74_90_240/0.45)]"
                  : "shadow-[0_1px_2px_rgb(0_0_0/0.05)]",
              )}
            >
              {p.badge && (
                <span className="absolute -top-3.5 left-8 rounded-full bg-mk-cta px-3 py-1 text-[12px] font-semibold text-white">
                  {p.badge}
                </span>
              )}
              <h3
                id={`plan-${p.id}`}
                className="text-[21px] font-semibold tracking-[-0.015em]"
              >
                {p.name}
              </h3>
              <p className="mt-1 text-[15px] text-mk-slate lg:min-h-[44px]">
                {p.blurb}
              </p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="num text-[48px] font-semibold leading-none tracking-[-0.035em]">
                  {priceLabel(p.price)}
                </span>
                {p.period && (
                  <span className="text-[17px] text-mk-slate">{p.period}</span>
                )}
              </p>
              <p className="mt-2 min-h-[20px] text-[14px] font-medium text-mk-blue">
                {p.note}
              </p>
              <ul className="mt-6 flex grow flex-col gap-3 text-[15px]">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Icon
                      name="check"
                      size={17}
                      strokeWidth={2.4}
                      className="mt-0.5 shrink-0 text-mk-cta"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {p.featured ? (
                <Cta className="mt-9 w-full">{p.cta}</Cta>
              ) : (
                <Link
                  href="/signup"
                  className="mt-9 inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-[17px] font-medium text-mk-blue shadow-[inset_0_0_0_1.5px_var(--color-mk-blue)] transition-colors hover:bg-mk-blue hover:text-white"
                >
                  {p.cta}
                </Link>
              )}
            </article>
          ))}
        </div>

        <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[15px] text-mk-ink/80">
          {promises.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <Icon
                name="check"
                size={16}
                strokeWidth={2.4}
                className="text-mk-cta"
              />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section
            aria-labelledby="hours-h"
            className="rounded-[24px] bg-white px-8 py-8"
          >
            <h3 id="hours-h" className="text-[19px] font-semibold">
              How practice hours work
            </h3>
            <p className="mt-1 text-[15px] text-mk-slate">{hoursLine}</p>
            <ul className="mt-5 grid gap-x-8 gap-y-3 text-[15px] text-mk-ink/80 sm:grid-cols-2">
              {hoursPoints.map((h) => (
                <li key={h} className="flex gap-2.5">
                  <Icon
                    name="check"
                    size={16}
                    strokeWidth={2.4}
                    className="mt-0.5 shrink-0 text-mk-cta"
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </section>
          <section
            aria-labelledby="extra-h"
            className="flex flex-col rounded-[24px] bg-white px-8 py-8"
          >
            <h3 id="extra-h" className="text-[19px] font-semibold">
              Extra hours
            </h3>
            <p className="mt-1 text-[15px] text-mk-slate">
              A big week coming up? Top up any paid plan.
            </p>
            <p className="mt-5 flex items-baseline gap-2">
              <span className="num text-[34px] font-semibold leading-none tracking-[-0.03em]">
                {priceLabel(EXTRA_HOURS.price)}
              </span>
              <span className="text-[17px] text-mk-slate">
                for {EXTRA_HOURS.hours} more hours
              </span>
            </p>
            <p className="mt-4 text-[15px] text-mk-slate">
              Used after your plan’s hours, and yours for as long as your plan
              is active.
            </p>
          </section>
        </div>
        <p className="mt-6 text-center text-[13px] text-mk-slate">
          Prices include VAT.
        </p>
      </div>
    </section>
  );
}

/** The pricing section during the free beta: one card, everything included, an hour a day. */
function BetaPricing({ plans }: { plans: Plan[] }) {
  const promises = [
    "No card, ever, during the beta",
    "Nothing you make is used to train anything",
    "Delete everything whenever you like",
  ];
  const paid = plans.filter((p) => p.price > 0);
  const from = paid.length ? Math.min(...paid.map((p) => p.price)) : null;
  const included = [
    `${BETA.hoursPerTester} hours of practice: about ten 30-minute interviews, or thirty run-throughs of a talk`,
    "Interviews built from your job and CV, with follow-ups",
    "Presentations and audience Q&A",
    "Reports, feedback on every answer, drills, story bank, prep sheet",
    "The natural interviewer voice",
    "Download or delete everything you’ve made, any time",
  ];
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-h"
      className="scroll-mt-14 bg-mk-mist py-24 sm:py-32"
    >
      <div className={WRAP}>
        <div className="mx-auto max-w-[760px] text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-mk-blue shadow-[inset_0_0_0_1px_var(--color-mk-line)]">
            <span
              className="h-2 w-2 rounded-full bg-mk-cta"
              aria-hidden="true"
            />
            Closed beta
          </p>
          <h2 id="pricing-h" className={H2}>
            Free while we’re in beta.
          </h2>
          <p className={clsx(LEAD, "mt-5")}>
            A small group of testers, {BETA.hoursPerTester} hours of practice
            each, and one ask in return: tell us where a score felt wrong.
            That’s the whole deal.
          </p>
        </div>
        <article
          aria-labelledby="plan-beta"
          className="relative mx-auto mt-14 max-w-[560px] rounded-[24px] bg-white px-8 py-9 shadow-[0_0_0_2px_var(--color-mk-cta),0_30px_60px_-30px_rgb(74_90_240/0.45)]"
        >
          <span className="absolute -top-3.5 left-8 rounded-full bg-mk-cta px-3 py-1 text-[12px] font-semibold text-white">
            Everything included
          </span>
          <h3
            id="plan-beta"
            className="text-[21px] font-semibold tracking-[-0.015em]"
          >
            Beta
          </h3>
          <p className="mt-1 text-[15px] text-mk-slate">
            For invited testers, while the beta runs.
          </p>
          <p className="mt-6 flex items-baseline gap-2">
            <span className="num text-[48px] font-semibold leading-none tracking-[-0.035em]">
              {priceLabel(0)}
            </span>
            <span className="text-[17px] text-mk-slate">
              for {BETA.hoursPerTester} hours of practice
            </span>
          </p>
          <p className="mt-2 min-h-[20px] text-[14px] font-medium text-mk-blue">
            No card. Need more hours? Ask and we’ll top you up.
          </p>
          <ul className="mt-6 flex flex-col gap-3 text-[15px]">
            {included.map((f) => (
              <li key={f} className="flex gap-2.5">
                <Icon
                  name="check"
                  size={17}
                  strokeWidth={2.4}
                  className="mt-0.5 shrink-0 text-mk-cta"
                />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Cta className="mt-9 w-full">Sign in with your invite</Cta>
          {from != null && (
            <p className="mt-4 text-center text-[13px] text-mk-slate">
              After the beta, plans start at {priceLabel(from)} a month. Beta
              testers hear first, and keep a thank-you price.
            </p>
          )}
        </article>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[15px] text-mk-ink/80">
          {promises.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <Icon
                name="check"
                size={16}
                strokeWidth={2.4}
                className="text-mk-cta"
              />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Privacy({ points }: { points: string[] }) {
  return (
    <section aria-labelledby="private-h" className="py-24 sm:py-28">
      <div
        className={clsx(
          WRAP,
          "grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center",
        )}
      >
        <div>
          <Icon name="lock" size={30} className="text-mk-cta" />
          <h2
            id="private-h"
            className="mt-4 text-[32px] font-semibold leading-tight tracking-[-0.03em] sm:text-[40px]"
          >
            Your practice stays private.
          </h2>
        </div>
        <ul className="flex flex-col gap-4 text-[17px] leading-relaxed text-mk-slate">
          {points.map((p) => (
            <li key={p} className="flex gap-3">
              <Icon
                name="check"
                size={18}
                strokeWidth={2.4}
                className="mt-1 shrink-0 text-mk-cta"
              />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** During the beta, plan questions get beta answers and the paid-plan questions go. */
const BETA_FAQ: Record<string, { q: string; a: string } | null> = {
  "What do I get for free?": {
    q: "What do I get for free?",
    a: `Everything, for ${BETA.hoursPerTester} hours of practice during the beta. Interviews built from your CV and the job, presentations, reports, feedback on every answer, drills and the story bank. No card needed.`,
  },
  "What happens if I run out of hours?": {
    q: "What happens when I’ve used my hours?",
    a: "Your reports, feedback and prep sheet stay open; hours only count while you’re speaking. If you want more, say so with the Feedback button and we’ll add some.",
  },
  "I’m presenting as part of a job interview. Does it help?": {
    q: "I’m presenting as part of a job interview. Does it help?",
    a: "Yes. Rehearse the presentation and take questions on it, then practise the interview itself, built from the job description and your CV. Both are included in the beta.",
  },
  "Does the 3-month plan renew?": {
    q: "What happens after the beta?",
    a: "Paid plans arrive with a free tier that stays free. Beta testers hear first, and we’ll keep a thank-you price for anyone who helped.",
  },
  "Can I use it for presentations and pitches?": {
    q: "Can I use it for presentations and pitches?",
    a: "Yes, it’s included in the beta. Add your slides as a PowerPoint or PDF, or paste your notes. Hakkiri times every slide against your plan, checks your key points landed, rewrites your opening from your own words, and then an audience asks you questions: curious, sceptical, time-pressed or technical.",
  },
};

export function Faq({ items: given }: { items: { q: string; a: string }[] }) {
  const items = isBeta()
    ? given.flatMap((it) =>
        it.q in BETA_FAQ ? (BETA_FAQ[it.q] ? [BETA_FAQ[it.q]!] : []) : [it],
      )
    : given;
  return (
    <section
      id="faq"
      aria-labelledby="faq-h"
      className="scroll-mt-14 bg-mk-mist py-24 sm:py-28"
    >
      <div className={clsx(WRAP, "max-w-[820px]")}>
        <h2 id="faq-h" className={clsx(H2, "text-center")}>
          Questions, answered.
        </h2>
        <div className="mt-12 divide-y divide-mk-line/80 border-y border-mk-line/80">
          {items.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[19px] font-semibold tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                {f.q}
                <Icon
                  name="plus"
                  size={20}
                  className="shrink-0 text-mk-slate transition-transform group-open:rotate-45"
                />
              </summary>
              <p className="mt-3 max-w-[680px] text-[17px] leading-relaxed text-mk-slate">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The last word: a big line, the button, and what it costs to try. */
export function FinalCta({
  title,
  body,
  cta,
  reassure,
}: {
  title: string;
  body: string;
  cta: string;
  reassure: string;
}) {
  return (
    <section aria-labelledby="final-h" className="py-28 sm:py-36">
      <div className={clsx(WRAP, "flex flex-col items-center text-center")}>
        <Mark size={52} />
        <h2 id="final-h" className={clsx(H2, "mt-6 max-w-[820px]")}>
          {title}
        </h2>
        <p className={clsx(LEAD, "mt-5 max-w-[600px]")}>{body}</p>
        <Cta className="mt-9">{cta}</Cta>
        <Reassure className="mt-4">{reassure}</Reassure>
      </div>
    </section>
  );
}

export { StickyCta } from "./StickyCta";

/* ------------------------------------------------------------------ shared words */

/** Answers that are the same on every public page. */
export const COMMON_FAQ = {
  accent: {
    q: "Does it judge my accent?",
    a: "Never. Hakkiri scores the content and structure of what you say, how long it takes and how many fillers you use. It doesn’t score accent, voice or tone.",
  },
  needs: {
    q: "What do I need?",
    a: "A laptop or desktop with a microphone, and Chrome, Edge, Firefox or Safari. Practice sessions need a bigger screen, so phones aren’t supported yet.",
  },
  hours: {
    q: "What happens if I run out of hours?",
    a: `Add ${EXTRA_HOURS.hours} more hours for ${priceLabel(EXTRA_HOURS.price)} at any time on a paid plan. On Monthly, your hours also reset at the start of each month. Your reports and feedback stay open either way.`,
  },
  renew: {
    q: "Does the 3-month plan renew?",
    a: "No. You pay once and it ends after 3 months. If you need more time, you can buy it again or switch to Monthly.",
  },
};

export const PRESENTATION_USES = [
  "Interview presentations",
  "Sales pitches",
  "Investor pitches",
  "Team updates and reviews",
  "Conference talks",
];

export const PRIVACY_POINTS = [
  "Recordings of your answers and rehearsals are deleted after the time you choose: 30 days, 90 days, a year, or only when you delete them.",
  "Download everything, or delete everything, from Settings at any time.",
  "Your CV, slides and recordings aren’t used to train AI, and they’re never shared with employers, recruiters or anyone else.",
];

export const PROMISES = [
  "No card needed for the free interview",
  "Cancel Monthly any time",
  "3 months is paid once and never renews",
];
