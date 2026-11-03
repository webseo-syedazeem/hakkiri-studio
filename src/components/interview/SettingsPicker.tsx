"use client";

import { useState } from "react";
import clsx from "clsx";
import type { QuestionGroup } from "@/lib/types";
import { Segmented } from "@/components/ui/Segmented";
import { Icon } from "@/components/ui";
import {
  aboutQuestions,
  adjustMix,
  allocate,
  CATEGORY_HINT,
  CATEGORY_ORDER,
  categoryLabel,
  DIFFICULTY_HINT,
  DIFFICULTY_LABEL,
  hasClosing,
  LENGTHS,
  mixQuestionCount,
  PRESET_ORDER,
  PRESETS,
  presetFor,
  settingsLine,
  toggleMix,
  totalQuestionCount,
  type Difficulty,
  type SessionMinutes,
  type SessionSettings,
  type TechnicalLabel,
} from "@/lib/interviews/settings";

/**
 * Difficulty, length and the question mix: a preset, or your own mix with
 * each category switched on or off and given a share in steps of 10 that
 * always adds up to 100. Each row shows roughly how many questions it gets.
 * Used at set-up and before each new interview.
 */
export function SettingsPicker({
  value,
  onChange,
  meanings,
  technicalLabel = "Technical",
  lean,
  collapsible = false,
}: {
  value: SessionSettings;
  onChange: (s: SessionSettings) => void;
  /** What each category means for this job, once Hakkiri has read it. */
  meanings?: Record<QuestionGroup, string>;
  technicalLabel?: TechnicalLabel;
  /** A suggestion to lean towards your weakest category, shown above the mix. */
  lean?: { label: string; apply: () => void; active: boolean } | null;
  /** Show one filled-in row, with Customise to open everything (most people leave the defaults). */
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const alloc = allocate(value.mix, mixQuestionCount(value.minutes, value.difficulty));
  const total = totalQuestionCount(value.minutes, value.difficulty);
  const setMix = (mix: SessionSettings["mix"]) => onChange({ ...value, mix, preset: presetFor(mix) });
  const on = CATEGORY_ORDER.filter((g) => value.mix[g] > 0);
  const leanButton = lean && (
    <button
      type="button"
      onClick={lean.apply}
      disabled={lean.active}
      className={clsx("mt-2.5 flex w-full items-center gap-2 rounded-[9px] px-3 py-2 text-left text-[13px]", lean.active ? "bg-blue/12 text-lilac" : "bg-panel-2 text-muted hover:text-ink")}
    >
      <Icon name={lean.active ? "check" : "flag"} size={14} strokeWidth={2.2} className="shrink-0" />
      {lean.label}
    </button>
  );

  if (collapsible && !open) {
    return (
      <div>
        <div className="flex items-center justify-between gap-4 rounded-[10px] bg-panel-2 px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
          <div className="min-w-0">
            <div className="text-sm font-semibold">{settingsLine(value)}</div>
            <div className="mt-0.5 truncate text-[13px] text-muted">
              About {total} questions: {on.map((g) => categoryLabel(g, technicalLabel)).join(", ")}
            </div>
          </div>
          <button type="button" onClick={() => setOpen(true)} aria-expanded={false} className="shrink-0 text-[13px] font-semibold text-blue-soft hover:underline">
            Customise
          </button>
        </div>
        {leanButton}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {collapsible && (
        <div className="flex justify-end">
          <button type="button" onClick={() => setOpen(false)} aria-expanded className="text-[13px] font-semibold text-blue-soft hover:underline">
            Done
          </button>
        </div>
      )}
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-semibold">Difficulty</span>
        </div>
        <Segmented<Difficulty>
          label="Difficulty"
          value={value.difficulty}
          onChange={(difficulty) => onChange({ ...value, difficulty })}
          options={(["easy", "medium", "hard"] as const).map((d) => ({ value: d, label: DIFFICULTY_LABEL[d] }))}
        />
        <p className="mt-2 text-[13px] leading-normal text-muted">{DIFFICULTY_HINT[value.difficulty]}</p>
      </div>

      <div>
        <div className="mb-2 text-[13px] font-semibold">Length</div>
        <Segmented<`${SessionMinutes}`>
          label="Length"
          value={`${value.minutes}`}
          onChange={(m) => onChange({ ...value, minutes: Number(m) as SessionMinutes })}
          options={LENGTHS.map((m) => ({ value: `${m}` as `${SessionMinutes}`, label: `${m} min` }))}
        />
        <p className="mt-2 text-[13px] text-muted">
          About {total} questions, follow-ups included. Opens with “Tell me about yourself”{hasClosing(value.minutes) ? " and ends with your questions for them" : ""}.
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-semibold">Question mix</span>
          <span className="text-xs text-dim">Adds up to 100%</span>
        </div>
        <div role="radiogroup" aria-label="Question mix preset" className="flex flex-wrap gap-1.5">
          {PRESET_ORDER.map((p) => {
            const active = value.preset === p;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ ...value, preset: p, mix: PRESETS[p].mix })}
                className={clsx(
                  "h-8 rounded-[8px] px-3 text-[13px] font-semibold transition-colors",
                  active ? "bg-blue-fill text-white" : "bg-panel-2 text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink",
                )}
              >
                {PRESETS[p].label}
              </button>
            );
          })}
          {value.preset === "custom" && <span className="inline-flex h-8 items-center rounded-[8px] bg-blue/15 px-3 text-[13px] font-semibold text-lilac">Your own mix</span>}
        </div>
        <p className="mt-2 text-[13px] text-muted">{value.preset === "custom" ? "Your own mix. Pick a preset to start again." : PRESETS[value.preset].hint}</p>

        {leanButton}

        <div className="mt-3 rounded-[10px] bg-panel-2 px-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
          {CATEGORY_ORDER.map((g, k) => {
            const share = value.mix[g];
            const enabled = share > 0;
            const label = categoryLabel(g, technicalLabel);
            const onlyOne = enabled && on.length === 1;
            return (
              <div key={g} className={clsx("grid grid-cols-[34px_minmax(0,1fr)_104px_96px] items-center gap-2 py-2.5", k > 0 && "border-t border-line")}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${label} questions`}
                  disabled={onlyOne}
                  onClick={() => setMix(toggleMix(value.mix, g, !enabled))}
                  className={clsx("relative h-5 w-[34px] rounded-full transition-colors disabled:opacity-60", enabled ? "bg-blue-fill" : "bg-white/15")}
                >
                  <span className={clsx("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", enabled ? "left-4" : "left-0.5")} />
                </button>
                <div className="min-w-0">
                  <div className={clsx("text-sm font-semibold", !enabled && "text-dim")}>{label}</div>
                  <div className="truncate text-xs text-muted" title={meanings?.[g] ?? CATEGORY_HINT[g]}>
                    {meanings?.[g] ?? CATEGORY_HINT[g]}
                  </div>
                </div>
                <div className={clsx("flex items-center justify-between rounded-[8px] bg-panel px-1 shadow-[inset_0_0_0_1px_var(--color-line-strong)]", !enabled && "opacity-40")}>
                  <button type="button" aria-label={`Less ${label}`} disabled={!enabled || share <= 10} onClick={() => setMix(adjustMix(value.mix, g, -10))} className="h-7 w-7 text-base font-semibold text-muted hover:text-ink disabled:opacity-30">
                    −
                  </button>
                  <span className="num w-10 text-center text-sm font-semibold" aria-label={`${label}: ${share}%`}>
                    {share}%
                  </span>
                  <button type="button" aria-label={`More ${label}`} disabled={!enabled || on.length === 1} onClick={() => setMix(adjustMix(value.mix, g, 10))} className="h-7 w-7 text-base font-semibold text-muted hover:text-ink disabled:opacity-30">
                    +
                  </button>
                </div>
                <span className={clsx("text-right text-xs", enabled && alloc[g] === 0 ? "text-dim" : "text-muted")}>{enabled ? (alloc[g] === 0 ? "none at this length" : aboutQuestions(alloc[g])) : "off"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
