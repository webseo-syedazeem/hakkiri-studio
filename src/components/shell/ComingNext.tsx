import { ButtonLink, Panel } from "@/components/ui";

/** Placeholder for screens that are designed but not built yet. */
export function ComingNext({
  title,
  body,
  designScreens,
  backHref = "/",
  backLabel = "Back to home",
  links = [],
}: {
  title: string;
  body: string;
  designScreens: string;
  backHref?: string;
  backLabel?: string;
  /** Parts that already work, shown as extra buttons. */
  links?: { href: string; label: string }[];
}) {
  return (
    <div className="flex grow items-center justify-center">
      <Panel className="max-w-[520px] animate-rise px-8 py-7">
        <div className="text-[13px] font-semibold text-blue-soft">Next in the build</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
        <p className="mt-2 text-[15px] leading-normal text-muted">{body}</p>
        <p className="mt-3 text-[13px] text-dim">Designed: {designScreens} on the Studio canvas.</p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {links.map((l) => (
            <ButtonLink key={l.href} href={l.href}>
              {l.label}
            </ButtonLink>
          ))}
          <ButtonLink href={backHref} variant={links.length ? "ghost" : "secondary"}>
            {backLabel}
          </ButtonLink>
        </div>
      </Panel>
    </div>
  );
}
