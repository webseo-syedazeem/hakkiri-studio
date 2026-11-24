"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { findDates } from "@/lib/cv/import/dates";
import { type Bullet, type Contact, type CvRegion, type Entry, type EntrySection, type ListSection, type Section, type SkillGroup, type SkillsSection, type SummarySection, LIMITS, emptyEntry, newBullet, newId } from "@/lib/cv/schema";
import { type FieldDef, SECTION_DEFS, fieldLabel, formatDate, formatDates } from "@/lib/cv/sections";
import { Grip, ItemControls, MoveMenu, OffChip, Switch, useDragOrder } from "./Arrange";
import { Btn, Field } from "./ui";

/**
 * The forms for each part of a CV. They hold no state of their own beyond what
 * is being typed: the value comes in, the changed value goes out. The upload
 * check and the builder both use them, so a field looks and behaves the same
 * in both.
 */

/** What a screen can hang on a field: whether to mark it as uncertain, a note under it, and what to do when it is focused. */
export interface FieldHooks {
  uncertain?: (entryId: string, field: string) => boolean;
  note?: (entryId: string, field: string) => ReactNode;
  onFocus?: (entryId: string, field: string) => void;
  /** Called when the person changes a field, so a doubt about it can be marked as dealt with. */
  onEdit?: (entryId: string, field: string) => void;
  /** The builder: opens the writing help for one bullet. */
  onHelp?: (entryId: string, bulletId: string) => void;
  /** The builder: what else can be done for an entry (start from notes, use a saved achievement), shown under its bullets. */
  entryTools?: (entry: Entry) => ReactNode;
}

const hook = (h: FieldHooks | undefined, entryId: string, field: string) => ({
  uncertain: h?.uncertain?.(entryId, field) ?? false,
  note: h?.note?.(entryId, field),
  onFocus: () => h?.onFocus?.(entryId, field),
  fieldKey: `${entryId}:${field}`,
});

/* ------------------------------------------------------------------- contact */

export function ContactForm({ value, onChange, hooks }: { value: Contact; onChange: (c: Contact) => void; hooks?: FieldHooks }) {
  const set = (field: keyof Contact, v: string) => {
    hooks?.onEdit?.("", field);
    onChange({ ...value, [field]: v });
  };
  const links = [...value.links, ""].slice(0, 4);
  return (
    <div className="cv-stack">
      <Field label="Name" rule="The name you use professionally." autoComplete="name" maxLength={LIMITS.name} value={value.fullName} onChange={(v) => set("fullName", v)} {...hook(hooks, "", "fullName")} />
      <div className="cv-pair">
        <Field label="Email" type="email" autoComplete="email" inputMode="email" maxLength={LIMITS.email} value={value.email} onChange={(v) => set("email", v)} {...hook(hooks, "", "email")} />
        <Field label="Phone" rule="Optional." type="tel" autoComplete="tel" inputMode="tel" maxLength={LIMITS.phone} value={value.phone} onChange={(v) => set("phone", v)} {...hook(hooks, "", "phone")} />
      </div>
      <Field label="Town or city" rule="Town or city only. No street address, photo or date of birth." autoComplete="address-level2" maxLength={LIMITS.location} value={value.location} onChange={(v) => set("location", v)} {...hook(hooks, "", "location")} />
      <div>
        <span className="cv-label">
          Links<span className="cv-rule">Optional: LinkedIn, a portfolio. Use short addresses and check each one opens.</span>
        </span>
        {links.map((link, i) => (
          <Field
            key={i}
            label={`Link ${i + 1}`}
            className="[&>label]:sr-only"
            inputMode="url"
            placeholder={i === 0 ? "linkedin.com/in/your-name" : "Another link"}
            maxLength={LIMITS.link}
            value={link}
            onChange={(v) => {
              hooks?.onEdit?.("", "links");
              const next = [...value.links];
              next[i] = v;
              onChange({ ...value, links: next });
            }}
            onBlur={() => {
              // Empty boxes are dropped once the person moves on, not while they are typing.
              const tidy = value.links.map((x) => x.trim()).filter(Boolean);
              if (tidy.join("\n") !== value.links.join("\n")) onChange({ ...value, links: tidy });
            }}
            {...(i === 0 ? hook(hooks, "", "links") : {})}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- profile */

/** The longest each field of an entry can be: the same numbers the saved CV is held to. */
const FIELD_MAX: Record<string, number> = { title: LIMITS.title, org: LIMITS.org, orgInfo: LIMITS.orgInfo, location: LIMITS.location, subject: LIMITS.subject, grade: LIMITS.grade, link: LIMITS.link };
/** The skills typed into a group's box, one for each comma, semicolon or line. */
const skillNames = (text: string) => text.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
/** Said when a list is full, beside the button that adds to it. */
function Full({ children }: { children: ReactNode }) {
  return (
    <p className="cv-small" role="status" style={{ marginTop: 6 }}>
      {children}
    </p>
  );
}

export function SummaryForm({ value, onChange, region, hooks }: { value: SummarySection; onChange: (s: SummarySection) => void; region: CvRegion; hooks?: FieldHooks }) {
  const def = SECTION_DEFS.summary;
  return (
    <Field
      label={def.heading[region]}
      rule={def.rule[region]}
      multiline
      rows={5}
      maxLength={LIMITS.summary}
      value={value.text}
      onChange={(text) => {
        hooks?.onEdit?.("", "text");
        onChange({ ...value, text });
      }}
      {...hook(hooks, "", "text")}
    />
  );
}

/* --------------------------------------------------------------------- dates */

/**
 * After "+ Add bullet" (or a role, a qualification, a group of skills, a
 * language) the cursor belongs in the new item, not on the button. Left on
 * the button, the next words typed went nowhere and every Space pressed added
 * another empty item.
 *
 * Call the function this returns with the new item's id as it is added. Once
 * the item has been drawn, its first field is given the cursor.
 */
function useFocusNew(): (id: string) => void {
  const wanted = useRef<{ id: string; at: number } | null>(null);
  useEffect(() => {
    const w = wanted.current;
    if (!w) return;
    // Asked for long ago and never drawn (the change was refused): forgotten, so it cannot take the cursor later.
    if (Date.now() - w.at > 2000) {
      wanted.current = null;
      return;
    }
    // A role, a group or a list item is marked with data-entry; a bullet, which sits inside a role, with data-item.
    const field = document.querySelector<HTMLElement>([`[data-entry="${w.id}"]`, `[data-item="${w.id}"]`].flatMap((box) => [`${box} textarea`, `${box} input:not([type="checkbox"]):not([type="hidden"])`]).join(", "));
    if (!field) return;
    wanted.current = null;
    field.focus();
  });
  return (id: string) => {
    wanted.current = { id, at: Date.now() };
  };
}

/**
 * A month and year, typed the way people write them: "Mar 2021", "03/2021" or
 * just "2021". A year alone stays a year until the person gives the month.
 */
function DateField({ label, value, onChange, yearOnly, disabled, ...rest }: { label: string; value: string; onChange: (v: string) => void; yearOnly?: boolean; disabled?: boolean; uncertain?: boolean; note?: ReactNode; onFocus?: () => void }) {
  const [text, setText] = useState(formatDate(value));
  const [error, setError] = useState("");
  useEffect(() => setText(formatDate(value)), [value]);
  const commit = () => {
    const t = text.trim();
    if (!t) {
      setError("");
      if (value) onChange("");
      return;
    }
    const found = findDates(t);
    if (!found || !found.single) {
      setError(yearOnly ? "Use a year, like 2021." : "Use a month and year, like Mar 2021.");
      return;
    }
    setError("");
    if (found.start !== value) onChange(found.start);
    setText(formatDate(found.start));
  };
  return <Field label={label} placeholder={yearOnly ? "2021" : "Mar 2021"} value={disabled ? "Present" : text} onChange={setText} onBlur={commit} disabled={disabled} error={error} {...rest} />;
}

/* ------------------------------------------------------------------- bullets */

function BulletsEditor({ bullets, onChange, label, rule, hooks, entryId, arrange }: { bullets: Bullet[]; onChange: (b: Bullet[]) => void; label: string; rule: string; hooks?: FieldHooks; entryId: string; arrange?: boolean }) {
  const drag = useDragOrder(bullets, onChange);
  const focusNew = useFocusNew();
  return (
    <div>
      <h3>{label}</h3>
      <small>{rule}</small>
      {bullets.map((b, i) =>
        arrange ? (
          <div key={b.id} className="cv-item cv-bullet-card" data-item={b.id} data-off={!b.visible || undefined} {...drag.row(b.id)}>
            <div className="cv-bullet-head">
              <div className="cv-row" style={{ gap: 6 }}>
                <Grip {...drag.grip(b.id)} />
                <span className="cv-small" aria-hidden="true">
                  Bullet {i + 1}
                </span>
              </div>
              <div className="cv-row" style={{ gap: 6 }}>
                {!b.visible && <OffChip />}
                <Switch checked={b.visible} onChange={(visible) => onChange(bullets.map((x) => (x.id === b.id ? { ...x, visible } : x)))} label={`Include bullet ${i + 1} in this version`} />
              </div>
            </div>
            <Field
              className="cv-item-main [&>label]:sr-only"
              label={`Bullet ${i + 1}`}
              multiline
              rows={2}
              maxLength={600}
              value={b.text}
              onChange={(text) => {
                hooks?.onEdit?.(entryId, b.id);
                onChange(bullets.map((x) => (x.id === b.id ? { ...x, text } : x)));
              }}
              {...hook(hooks, entryId, b.id)}
            />
            <div className="cv-bullet-foot">
              <span className="cv-controls">
                <MoveMenu index={i} count={bullets.length} name={`bullet ${i + 1}`} onMove={(to) => drag.move(b.id, to)} />
                {hooks?.onHelp && (
                  <Btn kind="quiet" aria-label={`Help with bullet ${i + 1}`} onClick={() => hooks.onHelp!(entryId, b.id)}>
                    Help
                  </Btn>
                )}
                <Btn kind="quiet" onClick={() => onChange(bullets.filter((x) => x.id !== b.id))} aria-label={`Remove bullet ${i + 1}`}>
                  Remove
                </Btn>
              </span>
            </div>
          </div>
        ) : (
          <div key={b.id} className="cv-item" data-item={b.id} data-off={!b.visible || undefined}>
            <Field
              className="cv-item-main [&>label]:sr-only"
              label={`Bullet ${i + 1}`}
              multiline
              rows={2}
              maxLength={600}
              value={b.text}
              onChange={(text) => {
                hooks?.onEdit?.(entryId, b.id);
                onChange(bullets.map((x) => (x.id === b.id ? { ...x, text } : x)));
              }}
              {...hook(hooks, entryId, b.id)}
            />
            <Btn kind="quiet" style={{ marginTop: 4 }} onClick={() => onChange(bullets.filter((x) => x.id !== b.id))} aria-label={`Remove bullet ${i + 1}`}>
              Remove
            </Btn>
          </div>
        ),
      )}
      <Btn
        style={{ marginTop: 10 }}
        disabled={bullets.length >= LIMITS.bullets}
        onClick={() => {
          const b = newBullet("");
          focusNew(b.id);
          onChange([...bullets, b]);
        }}
      >
        + Add bullet
      </Btn>
      {bullets.length >= LIMITS.bullets && <Full>A role holds {LIMITS.bullets} bullets. Remove one to add another: a reader takes in far fewer.</Full>}
    </div>
  );
}

/* ------------------------------------------------------------------- entries */

function EntryFields({ kind, entry, onChange, region, hooks, arrange }: { kind: EntrySection["kind"]; entry: Entry; onChange: (e: Entry) => void; region: CvRegion; hooks?: FieldHooks; arrange?: boolean }) {
  const def = SECTION_DEFS[kind];
  const fields = def.fields ?? [];
  const set = (field: string, v: string) => {
    hooks?.onEdit?.(entry.id, field);
    onChange({ ...entry, [field]: v });
  };
  const text = (f: FieldDef) => <Field key={f.field} label={fieldLabel(kind, f, region)} rule={f.hint} maxLength={FIELD_MAX[f.field]} value={entry[f.field]} onChange={(v) => set(f.field, v)} {...hook(hooks, entry.id, f.field)} />;
  const dates = fields.filter((f) => f.date);
  const plain = fields.filter((f) => !f.date);
  const hasCurrent = dates.some((f) => f.field === "start") && dates.some((f) => f.field === "end") && (kind === "experience" || kind === "volunteering" || kind === "projects");
  // Fields sit two to a row; one-line context fields take the full width.
  const rows: ReactNode[] = [];
  for (let i = 0; i < plain.length; ) {
    const f = plain[i];
    const wide = f.field === "orgInfo" || f.field === "link" || (kind === "custom" && f.field === "title");
    if (wide || i + 1 >= plain.length || plain[i + 1].field === "orgInfo" || plain[i + 1].field === "link") {
      rows.push(text(f));
      i += 1;
    } else {
      rows.push(
        <div className="cv-pair" key={f.field}>
          {text(f)}
          {text(plain[i + 1])}
        </div>,
      );
      i += 2;
    }
  }
  return (
    <div className="cv-stack">
      {rows}
      {dates.length > 0 && (
        <div className="cv-pair">
          {dates.map((f) => (
            <DateField key={f.field} label={fieldLabel(kind, f, region)} yearOnly={f.date === "year"} value={entry[f.field]} disabled={f.field === "end" && entry.current} onChange={(v) => set(f.field, v)} {...hook(hooks, entry.id, f.field)} />
          ))}
        </div>
      )}
      {hasCurrent && (
        <label className="cv-row" style={{ gap: 8, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={entry.current}
            onChange={(e) => {
              hooks?.onEdit?.(entry.id, "end");
              onChange({ ...entry, current: e.target.checked, end: e.target.checked ? "" : entry.end });
            }}
          />
          I still do this
        </label>
      )}
      {def.bullets && <BulletsEditor bullets={entry.bullets} onChange={(bullets) => onChange({ ...entry, bullets })} label={def.bullets.label} rule={def.bullets.hint} hooks={hooks} entryId={entry.id} arrange={arrange} />}
      {def.bullets && hooks?.entryTools?.(entry)}
    </div>
  );
}

/** The line that names an entry when it is collapsed: "Paid Media Manager · Northlight Agency". */
export function entryLabel(e: Entry, fallback: string): string {
  return [e.title, e.subject].filter(Boolean).join(" ") || e.org || fallback;
}

interface EntriesFormProps {
  value: EntrySection;
  onChange: (s: EntrySection) => void;
  region: CvRegion;
  hooks?: FieldHooks;
  /** Show every entry open (the upload check); otherwise one at a time. */
  expandAll?: boolean;
  /** A note for the entry as a whole (a paragraph that was split, say). */
  entryNote?: (entryId: string) => ReactNode;
  /** The builder: each entry and bullet can be switched off, dragged and moved. */
  arrange?: boolean;
  /** Which entry is open, when the screen decides (a click on the paper opens one). */
  openId?: string;
  onOpen?: (entryId: string) => void;
}

export function EntriesForm({ value, onChange, region, hooks, expandAll, entryNote, arrange, openId, onOpen }: EntriesFormProps) {
  const def = SECTION_DEFS[value.kind];
  const noun = def.entryNoun ?? "item";
  const [own, setOwn] = useState<string>(value.entries[0]?.id ?? "");
  const open = openId ?? own;
  const setOpen = (id: string) => {
    setOwn(id);
    onOpen?.(id);
  };
  const drag = useDragOrder(value.entries, (entries) => onChange({ ...value, entries }));
  const focusNew = useFocusNew();
  const add = () => {
    const e = emptyEntry();
    focusNew(e.id);
    onChange({ ...value, entries: [...value.entries, e] });
    setOpen(e.id);
  };
  const remove = (id: string) => onChange({ ...value, entries: value.entries.filter((x) => x.id !== id) });
  return (
    <div>
      {value.entries.length === 0 && <p className="cv-pad cv-muted">Nothing here yet.</p>}
      {value.entries.map((e, i) => {
        const isOpen = expandAll || open === e.id;
        const title = entryLabel(e, `${noun.charAt(0).toUpperCase() + noun.slice(1)} ${i + 1}`);
        return (
          <div key={e.id} className="cv-entry" data-entry={e.id} data-off={!e.visible || undefined} {...(arrange ? drag.row(e.id) : {})}>
            <div className="cv-pad cv-entryhead" style={{ paddingBottom: isOpen ? 0 : undefined }}>
              {arrange && <Grip {...drag.grip(e.id)} />}
              <div className="min-w-0 grow">
                <h3 style={{ overflowWrap: "anywhere" }}>{title}</h3>
                {!isOpen && <small>{[e.org !== title ? e.org : "", formatDates(e)].filter(Boolean).join(" · ")}</small>}
              </div>
              {arrange ? (
                <ItemControls
                  name={title}
                  index={i}
                  count={value.entries.length}
                  visible={e.visible}
                  onVisible={(visible) => {
                    onChange({ ...value, entries: value.entries.map((x) => (x.id === e.id ? { ...x, visible } : x)) });
                    // A switched-off entry stays in the list, collapsed.
                    if (!visible && isOpen) setOpen("");
                  }}
                  onMove={(to) => drag.move(e.id, to)}
                  onRemove={() => remove(e.id)}
                >
                  <Btn kind="quiet" aria-expanded={isOpen} aria-label={`${isOpen ? "Close" : "Edit"} ${title}`} onClick={() => setOpen(isOpen ? "" : e.id)}>
                    {isOpen ? "Close" : "Edit"}
                  </Btn>
                </ItemControls>
              ) : (
                <span className="cv-push cv-row" style={{ gap: 4 }}>
                  {!expandAll && (
                    <Btn kind="quiet" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : e.id)}>
                      {isOpen ? "Close" : "Edit"}
                    </Btn>
                  )}
                  <Btn kind="quiet" onClick={() => remove(e.id)} aria-label={`Remove ${title}`}>
                    Remove
                  </Btn>
                </span>
              )}
            </div>
            {isOpen && (
              <div className="cv-pad cv-stack">
                {entryNote?.(e.id)}
                <EntryFields kind={value.kind} entry={e} region={region} hooks={hooks} arrange={arrange} onChange={(next) => onChange({ ...value, entries: value.entries.map((x) => (x.id === e.id ? next : x)) })} />
              </div>
            )}
          </div>
        );
      })}
      <div className="cv-pad">
        <Btn onClick={add} disabled={value.entries.length >= LIMITS.entries}>
          + Add {noun}
        </Btn>
        {value.entries.length >= LIMITS.entries && <Full>This section holds {LIMITS.entries} entries. Remove one to add another.</Full>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- skills */

/** Skills are typed as a comma-separated line per group. Skills that keep their name keep their id. */
function skillsFromText(text: string, group: SkillGroup): SkillGroup["skills"] {
  const names = skillNames(text).slice(0, LIMITS.skills);
  const old = [...group.skills];
  return names.map((name) => {
    const at = old.findIndex((k) => k.name === name);
    return at >= 0 ? old.splice(at, 1)[0] : { id: newId("k_"), name: [...name].slice(0, LIMITS.skill).join(""), visible: true };
  });
}

function SkillGroupFields({ group, onChange, onRemove, hooks, controls, arrange }: { group: SkillGroup; onChange: (g: SkillGroup) => void; onRemove: () => void; hooks?: FieldHooks; controls?: ReactNode; arrange?: boolean }) {
  // What is being typed is kept as text, so a comma can be typed without the list rearranging under the cursor.
  const joined = group.skills.map((k) => k.name).join(", ");
  const [text, setText] = useState(joined);
  useEffect(() => {
    if (skillsFromText(text, group).map((k) => k.name).join(", ") !== joined) setText(joined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);
  const off = group.skills.filter((k) => !k.visible).length;
  return (
    <div className="cv-stack">
      <div className="cv-row" style={{ alignItems: "flex-end" }}>
        <Field className="min-w-0 grow basis-[200px]" label="Group name" rule="Optional: “Tools”, “Languages”." maxLength={LIMITS.groupName} value={group.name} onChange={(name) => onChange({ ...group, name })} {...hook(hooks, group.id, "name")} />
        {controls ?? (
          <Btn kind="quiet" onClick={onRemove} aria-label={`Remove group ${group.name || "of skills"}`}>
            Remove
          </Btn>
        )}
      </div>
      <Field
        label="Skills"
        rule="Separate skills with commas."
        multiline
        rows={2}
        value={text}
        onChange={(t) => {
          setText(t);
          hooks?.onEdit?.("", "skills");
          onChange({ ...group, skills: skillsFromText(t, group) });
        }}
        onFocus={() => (arrange ? hooks?.onFocus?.(group.id, "skills") : hooks?.onFocus?.("", group.skills[0]?.id ?? ""))}
        fieldKey={`${group.id}:skills`}
        uncertain={group.skills.some((k) => hooks?.uncertain?.("", k.id))}
        note={
          skillNames(text).length > LIMITS.skills ? (
            <Full>
              A group holds {LIMITS.skills} skills. The ones after that are not saved: start another group for them.
            </Full>
          ) : (
            group.skills.map((k) => hooks?.note?.("", k.id)).find(Boolean)
          )
        }
      />
      {arrange && group.skills.length > 0 && (
        <div role="group" aria-label={`Skills in ${group.name || "this group"}: switch one off to leave it out of this version`}>
          <small style={{ display: "block", marginBottom: 6 }}>
            Press a skill to leave it out of this version. It stays here.{off ? ` ${off} off.` : ""}
          </small>
          <div className="cv-row" style={{ gap: 6 }}>
            {group.skills.map((k) => (
              <button
                key={k.id}
                type="button"
                className="cv-chip cv-skillchip"
                aria-pressed={k.visible}
                aria-label={`${k.name}, ${k.visible ? "in this version" : "off in this version"}`}
                onClick={() => onChange({ ...group, skills: group.skills.map((x) => (x.id === k.id ? { ...x, visible: !x.visible } : x)) })}
              >
                {k.visible && <span aria-hidden="true">✓ </span>}
                {k.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SkillsForm({ value, onChange, region, hooks, arrange }: { value: SkillsSection; onChange: (s: SkillsSection) => void; region: CvRegion; hooks?: FieldHooks; arrange?: boolean }) {
  const groups = value.groups;
  const focusNew = useFocusNew();
  const add = () => {
    const g = { id: newId("g_"), name: "", visible: true, skills: [] };
    focusNew(g.id);
    onChange({ ...value, groups: [...value.groups, g] });
  };
  const drag = useDragOrder(groups, (next) => onChange({ ...value, groups: next }));
  const set = (next: SkillGroup) => onChange({ ...value, groups: value.groups.map((x) => (x.id === next.id ? next : x)) });
  const remove = (id: string) => onChange({ ...value, groups: value.groups.filter((x) => x.id !== id) });
  return (
    <div className="cv-pad cv-stack">
      <small>{SECTION_DEFS.skills.rule[region]}</small>
      {groups.length === 0 && <p className="cv-muted">Nothing here yet.</p>}
      {groups.map((g, i) => (
        <div key={g.id} className={arrange ? "cv-group" : undefined} data-entry={g.id} data-off={!g.visible || undefined} {...(arrange ? drag.row(g.id) : {})}>
          {arrange && <Grip {...drag.grip(g.id)} />}
          <div className="min-w-0 grow">
            <SkillGroupFields
              group={g}
              hooks={hooks}
              arrange={arrange}
              onChange={set}
              onRemove={() => remove(g.id)}
              controls={arrange ? <ItemControls name={`group ${g.name || "of skills"}`} index={i} count={groups.length} visible={g.visible} onVisible={(visible) => set({ ...g, visible })} onMove={(to) => drag.move(g.id, to)} onRemove={() => remove(g.id)} /> : undefined}
            />
          </div>
        </div>
      ))}
      <Btn onClick={add} disabled={groups.length >= LIMITS.groups}>
        + Add {groups.length ? "another group" : "skills"}
      </Btn>
      {groups.length >= LIMITS.groups && <Full>Skills can be in {LIMITS.groups} groups. Remove one to add another.</Full>}
    </div>
  );
}

/* --------------------------------------------------------------------- lists */

export function ListForm({ value, onChange, region, hooks, arrange }: { value: ListSection; onChange: (s: ListSection) => void; region: CvRegion; hooks?: FieldHooks; arrange?: boolean }) {
  const isLanguages = value.kind === "languages";
  const noun = isLanguages ? "language" : "interest";
  const drag = useDragOrder(value.items, (items) => onChange({ ...value, items }));
  const set = (id: string, changes: Partial<ListSection["items"][number]>) => onChange({ ...value, items: value.items.map((x) => (x.id === id ? { ...x, ...changes } : x)) });
  const remove = (id: string) => onChange({ ...value, items: value.items.filter((x) => x.id !== id) });
  const focusNew = useFocusNew();
  return (
    <div className="cv-pad cv-stack">
      <small>{SECTION_DEFS[value.kind].rule[region]}</small>
      {value.items.length === 0 && <p className="cv-muted">Nothing here yet.</p>}
      {value.items.map((item, i) => (
        <div key={item.id} className="cv-item" style={{ alignItems: "flex-end" }} data-entry={item.id} data-off={!item.visible || undefined} {...(arrange ? drag.row(item.id) : {})}>
          {arrange && <Grip {...drag.grip(item.id)} />}
          <Field className="cv-item-main" label={isLanguages ? "Language" : `Interest ${i + 1}`} maxLength={LIMITS.item} value={item.name} onChange={(name) => set(item.id, { name })} {...hook(hooks, "", item.id)} />
          {isLanguages && <Field className="cv-item-main" label="Level" placeholder="Native, fluent, B2…" maxLength={LIMITS.itemLevel} value={item.level} onChange={(level) => set(item.id, { level })} onFocus={() => hooks?.onFocus?.("", item.id)} />}
          {arrange ? (
            <ItemControls name={item.name || noun} index={i} count={value.items.length} visible={item.visible} onVisible={(visible) => set(item.id, { visible })} onMove={(to) => drag.move(item.id, to)} onRemove={() => remove(item.id)} />
          ) : (
            <Btn kind="quiet" onClick={() => remove(item.id)} aria-label={`Remove ${item.name || noun}`}>
              Remove
            </Btn>
          )}
        </div>
      ))}
      <Btn
        disabled={value.items.length >= LIMITS.items}
        onClick={() => {
          const item = { id: newId("i_"), name: "", level: "", visible: true };
          focusNew(item.id);
          onChange({ ...value, items: [...value.items, item] });
        }}
      >
        + Add {noun}
      </Btn>
      {value.items.length >= LIMITS.items && <Full>This list holds {LIMITS.items}. Remove one to add another.</Full>}
    </div>
  );
}

/* ---------------------------------------------------------------- any section */

/** The right form for a section, whatever its kind. */
export function SectionForm({ section, onChange, region, hooks, expandAll, entryNote, arrange, openId, onOpen }: { section: Section; onChange: (s: Section) => void; region: CvRegion } & Pick<EntriesFormProps, "hooks" | "expandAll" | "entryNote" | "arrange" | "openId" | "onOpen">) {
  if (section.kind === "summary")
    return (
      <div className="cv-pad">
        <SummaryForm value={section} onChange={onChange} region={region} hooks={hooks} />
      </div>
    );
  if (section.kind === "skills") return <SkillsForm value={section} onChange={onChange} region={region} hooks={hooks} arrange={arrange} />;
  if (section.kind === "languages" || section.kind === "interests") return <ListForm value={section as ListSection} onChange={onChange} region={region} hooks={hooks} arrange={arrange} />;
  return (
    <>
      <p className="cv-pad cv-small" style={{ paddingBottom: 0 }}>
        {SECTION_DEFS[section.kind].rule[region]}
      </p>
      <EntriesForm value={section as EntrySection} onChange={onChange} region={region} hooks={hooks} expandAll={expandAll} entryNote={entryNote} arrange={arrange} openId={openId} onOpen={onOpen} />
    </>
  );
}
