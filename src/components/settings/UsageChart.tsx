import { shortDay } from "@/lib/format";

/**
 * One series over the last 14 days: thin bars from the baseline, a tooltip
 * on hover, and the same numbers as a table for screen readers.
 */
export function UsageChart({ days, value, format, title }: { days: { day: string; value: number }[]; value: string; format: (n: number) => string; title: string }) {
  const max = Math.max(...days.map((d) => d.value), 0);
  if (!max) {
    return (
      <figure>
        <figcaption className="text-[13px] font-semibold">{title}</figcaption>
        <p className="mt-2 text-sm text-muted">Nothing in the last 14 days yet.</p>
      </figure>
    );
  }
  return (
    <figure>
      <figcaption className="text-[13px] font-semibold">{title}</figcaption>
      <div className="mt-3 flex h-[120px] items-end gap-[2px] border-b border-line" aria-hidden="true">
        {days.map((d) => {
          const h = max ? Math.max(d.value > 0 ? 3 : 0, Math.round((d.value / max) * 112)) : 0;
          return (
            <div key={d.day} className="group relative flex h-full flex-1 items-end justify-center">
              <div className="w-full max-w-[22px] rounded-t-[4px] bg-blue transition-opacity group-hover:opacity-80" style={{ height: h }} />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-[7px] bg-panel-2 px-2.5 py-1.5 text-[12px] shadow-[inset_0_0_0_1px_var(--color-line-strong)] group-hover:block">
                <span className="text-muted">{shortDay(d.day)}</span> <b className="num font-semibold">{format(d.value)}</b>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[12px] text-muted" aria-hidden="true">
        <span>{shortDay(days[0]?.day ?? "")}</span>
        <span>Today</span>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">{value}</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.day}>
              <td>{shortDay(d.day)}</td>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
