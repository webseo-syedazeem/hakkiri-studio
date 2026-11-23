"use client";

import { type ReactNode, useEffect, useState } from "react";
import { findDates } from "@/lib/cv/import/dates";
import { type Bullet, type Contact, type CvRegion, type Entry, type EntrySection, type ListSection, type Section, type SkillGroup, type SkillsSection, type SummarySection, emptyEntry, newBullet, newId } from "@/lib/cv/schema";
import { type FieldDef, SECTION_DEFS, fieldLabel, formatDate, formatDates } from "@/lib/cv/sections";
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
}

const hook = (h: FieldHooks | undefined, entryId: string, field: string) => ({
  uncertain: h?.uncertain?.(entryId, field) ?? false,
  note: h?.note?.(entryId, field),
  onFocus: () => h?.onFocus?.(entryId, field),
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
      <Field label="Name" rule="The name you use professionally." autoComplete="name" value={value.fullName} onChange={(v) => set("fullName", v)} {...hook(hooks, "", "fullName")} />
      <div className="cv-pair">
        <Field label="Email" type="email" autoComplete="email" inputMode="email" value={value.email} onChange={(v) => set("email", v)} {...hook(hooks, "", "email")} />
        <Field label="Phone" rule="Optional." type="tel" autoComplete="tel" inputMode="tel" value={value.phone} onChange={(v) => set("phone", v)} {...hook(hooks, "", "phone")} />
      </div>
      <Field label="Town or city" rule="Town or city only. No street address, photo or date of birth." autoComplete="address-level2" value={value.location} onChange={(v) => set("location", v)} {...hook(hooks, "", "location")} />
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

export function SummaryForm({ value, onChange, region, hooks }: { value: SummarySection; onChange: (s: SummarySection) => void; region: CvRegion; hooks?: FieldHooks }) {
  const def = SECTION_DEFS.summary;
  return (
    <Field
      label={def.heading[region]}
      rule={def.rule[region]}
      multiline
      rows={5}
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

function BulletsEditor({ bullets, onChange, label, rule, hooks, entryId }: { bullets: Bullet[]; onChange: (b: Bullet[]) => void; label: string; rule: string; hooks?: FieldHooks; entryId: string }) {
  return (
    <div>
      <h3>{label}</h3>
      <small>{rule}</small>
      {bullets.map((b, i) => (
        <div key={b.id} className="cv-row" style={{ alignItems: "flex-start", flexWrap: "nowrap", marginTop: 8 }}>
          <Field
            className="min-w-0 grow [&>label]:sr-only"
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
      ))}
      <Btn style={{ marginTop: 10 }} onClick={() => onChange([...bullets, newBullet("")])}>
        + Add bullet
      </Btn>
    </div>
  );
}

/* ------------------------------------------------------------------- entries */

function EntryFields({ kind, entry, onChange, region, hooks }: { kind: EntrySection["kind"]; entry: Entry; onChange: (e: Entry) => void; region: CvRegion; hooks?: FieldHooks }) {
  const def = SECTION_DEFS[kind];
  const fields = def.fields ?? [];
  const set = (field: string, v: string) => {
    hooks?.onEdit?.(entry.id, field);
    onChange({ ...entry, [field]: v });
  };
  const text = (f: FieldDef) => <Field key={f.field} label={fieldLabel(kind, f, region)} rule={f.hint} value={entry[f.field]} onChange={(v) => set(f.field, v)} {...hook(hooks, entry.id, f.field)} />;
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
      {def.bullets && <BulletsEditor bullets={entry.bullets} onChange={(bullets) => onChange({ ...entry, bullets })} label={def.bullets.label} rule={def.bullets.hint} hooks={hooks} entryId={entry.id} />}
    </div>
  );
}

/** The line that names an entry when it is collapsed: "Paid Media Manager · Northlight Agency". */
export function entryLabel(e: Entry, fallback: string): string {
  return [e.title, e.subject].filter(Boolean).join(" ") || e.org || fallback;
}

export function EntriesForm({ value, onChange, region, hooks, expandAll, entryNote }: { value: EntrySection; onChange: (s: EntrySection) => void; region: CvRegion; hooks?: FieldHooks; /** Show every entry open (the upload check); otherwise one at a time. */ expandAll?: boolean; /** A note for the entry as a whole (a paragraph that was split, say). */ entryNote?: (entryId: string) => ReactNode }) {
  const def = SECTION_DEFS[value.kind];
  const noun = def.entryNoun ?? "item";
  const [open, setOpen] = useState<string>(value.entries[0]?.id ?? "");
  const add = () => {
    const e = emptyEntry();
    onChange({ ...value, entries: [...value.entries, e] });
    setOpen(e.id);
  };
  return (
    <div>
      {value.entries.length === 0 && <p className="cv-pad cv-muted">Nothing here yet.</p>}
      {value.entries.map((e, i) => {
        const isOpen = expandAll || open === e.id;
        const title = entryLabel(e, `${noun.charAt(0).toUpperCase() + noun.slice(1)} ${i + 1}`);
        return (
          <div key={e.id} style={{ borderBottom: "1px solid var(--color-line)" }} data-entry={e.id}>
            <div className="cv-pad cv-row" style={{ paddingBottom: isOpen ? 0 : undefined }}>
              <div className="min-w-0">
                <h3 style={{ overflowWrap: "anywhere" }}>{title}</h3>
                {!isOpen && <small>{[e.org !== title ? e.org : "", formatDates(e)].filter(Boolean).join(" · ")}</small>}
              </div>
              <span className="cv-push cv-row" style={{ gap: 4 }}>
                {!expandAll && (
                  <Btn kind="quiet" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : e.id)}>
                    {isOpen ? "Close" : "Edit"}
                  </Btn>
                )}
                <Btn kind="quiet" onClick={() => onChange({ ...value, entries: value.entries.filter((x) => x.id !== e.id) })} aria-label={`Remove ${title}`}>
                  Remove
                </Btn>
              </span>
            </div>
            {isOpen && (
              <div className="cv-pad cv-stack">
                {entryNote?.(e.id)}
                <EntryFields kind={value.kind} entry={e} region={region} hooks={hooks} onChange={(next) => onChange({ ...value, entries: value.entries.map((x) => (x.id === e.id ? next : x)) })} />
              </div>
            )}
          </div>
        );
      })}
      <div className="cv-pad">
        <Btn onClick={add}>+ Add {noun}</Btn>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- skills */

/** Skills are typed as a comma-separated line per group. Skills that keep their name keep their id. */
function skillsFromText(text: string, group: SkillGroup): SkillGroup["skills"] {
  const names = text.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean).slice(0, 40);
  const old = [...group.skills];
  return names.map((name) => {
    const at = old.findIndex((k) => k.name === name);
    return at >= 0 ? old.splice(at, 1)[0] : { id: newId("k_"), name: name.slice(0, 80), visible: true };
  });
}

function SkillGroupFields({ group, onChange, onRemove, hooks }: { group: SkillGroup; onChange: (g: SkillGroup) => void; onRemove: () => void; hooks?: FieldHooks }) {
  // What is being typed is kept as text, so a comma can be typed without the list rearranging under the cursor.
  const joined = group.skills.map((k) => k.name).join(", ");
  const [text, setText] = useState(joined);
  useEffect(() => {
    if (skillsFromText(text, group).map((k) => k.name).join(", ") !== joined) setText(joined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);
  return (
    <div className="cv-stack" data-entry={group.id}>
      <div className="cv-row" style={{ alignItems: "flex-end", flexWrap: "nowrap" }}>
        <Field className="min-w-0 grow" label="Group name" rule="Optional: “Tools”, “Languages”." value={group.name} onChange={(name) => onChange({ ...group, name })} {...hook(hooks, group.id, "name")} />
        <Btn kind="quiet" onClick={onRemove} aria-label={`Remove group ${group.name || "of skills"}`}>
          Remove
        </Btn>
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
        onFocus={() => hooks?.onFocus?.("", group.skills[0]?.id ?? "")}
        uncertain={group.skills.some((k) => hooks?.uncertain?.("", k.id))}
        note={group.skills.map((k) => hooks?.note?.("", k.id)).find(Boolean)}
      />
    </div>
  );
}

export function SkillsForm({ value, onChange, region, hooks }: { value: SkillsSection; onChange: (s: SkillsSection) => void; region: CvRegion; hooks?: FieldHooks }) {
  const groups = value.groups.length ? value.groups : [];
  const add = () => onChange({ ...value, groups: [...value.groups, { id: newId("g_"), name: "", visible: true, skills: [] }] });
  return (
    <div className="cv-pad cv-stack">
      <small>{SECTION_DEFS.skills.rule[region]}</small>
      {groups.length === 0 && <p className="cv-muted">Nothing here yet.</p>}
      {groups.map((g) => (
        <SkillGroupFields key={g.id} group={g} hooks={hooks} onChange={(next) => onChange({ ...value, groups: value.groups.map((x) => (x.id === g.id ? next : x)) })} onRemove={() => onChange({ ...value, groups: value.groups.filter((x) => x.id !== g.id) })} />
      ))}
      <Btn onClick={add}>+ Add {groups.length ? "another group" : "skills"}</Btn>
    </div>
  );
}

/* --------------------------------------------------------------------- lists */

export function ListForm({ value, onChange, region, hooks }: { value: ListSection; onChange: (s: ListSection) => void; region: CvRegion; hooks?: FieldHooks }) {
  const isLanguages = value.kind === "languages";
  const noun = isLanguages ? "language" : "interest";
  return (
    <div className="cv-pad cv-stack">
      <small>{SECTION_DEFS[value.kind].rule[region]}</small>
      {value.items.length === 0 && <p className="cv-muted">Nothing here yet.</p>}
      {value.items.map((item, i) => (
        <div key={item.id} className="cv-row" style={{ alignItems: "flex-end", flexWrap: "nowrap" }} data-entry={item.id}>
          <Field className="min-w-0 grow" label={isLanguages ? "Language" : `Interest ${i + 1}`} value={item.name} onChange={(name) => onChange({ ...value, items: value.items.map((x) => (x.id === item.id ? { ...x, name } : x)) })} {...hook(hooks, "", item.id)} />
          {isLanguages && <Field className="min-w-0 grow" label="Level" placeholder="Native, fluent, B2…" value={item.level} onChange={(level) => onChange({ ...value, items: value.items.map((x) => (x.id === item.id ? { ...x, level } : x)) })} onFocus={() => hooks?.onFocus?.("", item.id)} />}
          <Btn kind="quiet" onClick={() => onChange({ ...value, items: value.items.filter((x) => x.id !== item.id) })} aria-label={`Remove ${item.name || noun}`}>
            Remove
          </Btn>
        </div>
      ))}
      <Btn onClick={() => onChange({ ...value, items: [...value.items, { id: newId("i_"), name: "", level: "", visible: true }] })}>+ Add {noun}</Btn>
    </div>
  );
}

/* ---------------------------------------------------------------- any section */

/** The right form for a section, whatever its kind. */
export function SectionForm({ section, onChange, region, hooks, expandAll, entryNote }: { section: Section; onChange: (s: Section) => void; region: CvRegion; hooks?: FieldHooks; expandAll?: boolean; entryNote?: (entryId: string) => ReactNode }) {
  if (section.kind === "summary")
    return (
      <div className="cv-pad">
        <SummaryForm value={section} onChange={onChange} region={region} hooks={hooks} />
      </div>
    );
  if (section.kind === "skills") return <SkillsForm value={section} onChange={onChange} region={region} hooks={hooks} />;
  if (section.kind === "languages" || section.kind === "interests") return <ListForm value={section as ListSection} onChange={onChange} region={region} hooks={hooks} />;
  return (
    <>
      <p className="cv-pad cv-small" style={{ paddingBottom: 0 }}>
        {SECTION_DEFS[section.kind].rule[region]}
      </p>
      <EntriesForm value={section as EntrySection} onChange={onChange} region={region} hooks={hooks} expandAll={expandAll} entryNote={entryNote} />
    </>
  );
}
