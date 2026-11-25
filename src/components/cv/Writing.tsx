"use client";

import { useCallback, useEffect, useState } from "react";
import { addBullets } from "@/lib/cv/edit";
import { type Achievement, type Entry, type Locator, type SkillsSection, type SummarySection, isEntrySection, newBullet, newId } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { Btn, CvSelect, Field, Panel } from "./ui";
import { useWorkspace } from "./Workspace";

/**
 * Writing help that belongs to a section: the profile written last from the
 * CV, skills worth adding with the line that shows each, and saved
 * achievements to use again. All of it works from what the person has
 * already said; none of it starts from a job title.
 */

const visibleRoles = (sections: { kind: string; visible: boolean }[]) =>
  (sections as Parameters<typeof isEntrySection>[0][]).filter((s) => s.kind === "experience" && s.visible && isEntrySection(s)).flatMap((s) => (isEntrySection(s) ? s.entries.filter((e) => e.visible && e.title.trim()) : []));

/* ------------------------------------------------------------------ profile */

interface ProfileReply {
  by: "ai" | "rules";
  versions: { style: "experience" | "contribution"; text: string }[];
  years?: number;
  note?: string;
}
const STYLE = { experience: "Led by your experience", contribution: "Led by what you did" } as const;

/** Two versions of the profile to choose from. Choosing one shows it on the paper first; it goes into the CV only on "Use this profile". */
export function ProfileChooser({ section, say }: { section: SummarySection; say: (text: string) => void }) {
  const w = useWorkspace();
  const { update, setPreviewProfile } = w;
  const cv = w.cv!;
  const { panel, open, close } = usePanel();
  const roles = visibleRoles(cv.sections);
  const skills = cv.sections.flatMap((s) => (s.kind === "skills" && s.visible ? s.groups.filter((g) => g.visible).flatMap((g) => g.skills.filter((k) => k.visible).map((k) => k.name)) : []));
  const [entryId, setEntryId] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [reply, setReply] = useState<ProfileReply | null>(null);
  const [chosen, setChosen] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const showing = panel === "choose-profile";
  const word = docWord(cv.region);

  // The preview never outlives the chooser.
  useEffect(() => {
    if (!showing) setPreviewProfile(null);
    return () => setPreviewProfile(null);
  }, [showing, setPreviewProfile]);

  if (!showing)
    return (
      <div className="cv-panelfoot" style={{ justifyContent: "flex-start" }}>
        <Btn onClick={() => open("choose-profile")}>Draft my profile from my {word}</Btn>
        <small>Written last, from what is already in your {word}. You choose between two versions.</small>
      </div>
    );

  async function draft() {
    setBusy(true);
    setProblem("");
    setChosen(-1);
    setPreviewProfile(null);
    try {
      const r = await api<ProfileReply>(`/api/cv/versions/${cv.id}/write/profile`, { method: "POST", json: { entryId: entryId || roles[0]?.id, skills: picked } });
      setReply(r);
      if (!r.versions.length) setProblem(`There isn’t enough in your ${word} yet to write a profile from. Add what you did in a role first.`);
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy(false);
    }
  }

  const stop = () => {
    setPreviewProfile(null);
    setReply(null);
    setChosen(-1);
    close();
  };

  return (
    <div className="cv-pad cv-stack" style={{ borderTop: "1px solid var(--color-line)" }} data-testid="profile-chooser">
      <div className="cv-row">
        <h3>Draft your profile</h3>
        <Btn kind="quiet" className="cv-push" onClick={stop}>
          Close
        </Btn>
      </div>
      {roles.length === 0 ? (
        <p className="cv-note">Add a role to Experience first. A profile is written last, from what is in your {word}, and never from a job title alone.</p>
      ) : (
        <>
          <div>
            <label className="cv-label" htmlFor="cv-profile-role">
              Role to write about
            </label>
            <CvSelect
              id="cv-profile-role"
              value={entryId || roles[0].id}
              onChange={(val) => setEntryId(val)}
              options={roles.map((r) => ({
                value: r.id,
                label: [r.title, r.org].filter(Boolean).join(" · "),
              }))}
            />
          </div>
          {skills.length > 0 && (
            <div role="group" aria-label="Skills to highlight, up to four">
              <span className="cv-label">Skills to highlight</span>
              <span className="cv-rule">Up to four, from your Skills section.</span>
              <div className="cv-row" style={{ gap: 6, marginTop: 6 }}>
                {skills.map((k) => (
                  <button key={k} type="button" className="cv-chip cv-skillchip" aria-pressed={picked.includes(k)} disabled={!picked.includes(k) && picked.length >= 4} onClick={() => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))}>
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="cv-row">
            <Btn kind={reply ? "default" : "primary"} busy={busy} onClick={() => void draft()}>
              {busy ? "Drafting…" : reply ? "Draft again" : "Draft two versions"}
            </Btn>
          </div>
        </>
      )}
      {problem && (
        <p className="cv-note" role="alert">
          {problem}
        </p>
      )}
      {reply && reply.versions.length > 0 && (
        <fieldset className="cv-stack">
          <legend className="cv-label">Choose a version to see it on the page</legend>
          {reply.versions.map((v, i) => (
            <label key={v.style} className="cv-choice" data-style={v.style}>
              <input
                type="radio"
                name="profile-version"
                checked={chosen === i}
                onChange={() => {
                  setChosen(i);
                  setPreviewProfile(v.text);
                }}
              />
              <span className="min-w-0">
                <b>{STYLE[v.style]}</b>
                <span style={{ display: "block", marginTop: 4 }}>{v.text}</span>
              </span>
            </label>
          ))}
          <small style={{ display: "block" }}>
            {reply.note ?? (reply.by === "ai" ? `Drafted by AI from your ${word}, then checked against it: nothing here that your ${word} doesn’t say.` : `Assembled by rule from your ${word}’s own lines.`)}
            {reply.years ? ` “${reply.years} ${reply.years === 1 ? "year" : "years"}” is worked out from your dates.` : ""}
            {reply.versions.length === 1 ? " There is only one way to say it until this role has some bullets." : ""}
          </small>
          {chosen >= 0 && (
            <div className="cv-note cv-row" role="status">
              <span>On the page now as a preview. It isn’t in your {word} yet.</span>
            </div>
          )}
          <div className="cv-row">
            <Btn onClick={stop}>{section.text.trim() ? "Keep what I have" : "Not now"}</Btn>
            <Btn
              kind="primary"
              disabled={chosen < 0}
              onClick={() => {
                update({ sections: cv.sections.map((s) => (s.id === section.id ? { ...section, text: reply.versions[chosen].text, visible: true } : s)) });
                say("Profile added. Undo puts back what was there.");
                stop();
              }}
            >
              Use this profile
            </Btn>
          </div>
        </fieldset>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- skills */

interface Suggestion {
  name: string;
  from: "cv" | "advert";
  evidence?: { text: string; at: Locator };
}

/** Skills worth adding: each with the line of the CV that shows it, or "Do you have this?" for one the advert asks for. */
export function SkillSuggestions({ section, onShow }: { section: SkillsSection; onShow: (at: Locator) => void }) {
  const w = useWorkspace();
  const { update, save } = w;
  const cv = w.cv!;
  const { panel, item, open, close } = usePanel();
  const [list, setList] = useState<Suggestion[] | null>(null);
  const [line, setLine] = useState("");
  const [roleId, setRoleId] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const key = `hakkiri.cv.skills.no.${cv.id}`;
  const [declined, setDeclined] = useState<string[]>([]);
  const roles = visibleRoles(cv.sections);

  useEffect(() => {
    try {
      setDeclined(JSON.parse(localStorage.getItem(key) ?? "[]"));
    } catch {
      /* nothing stored */
    }
  }, [key]);

  // Worked out from the saved CV, so it is asked for again after each save.
  const rev = cv.rev;
  useEffect(() => {
    if (save !== "saved") return;
    let live = true;
    api<{ suggestions: Suggestion[] }>(`/api/cv/versions/${cv.id}/write/skills`)
      .then((r) => live && setList(r.suggestions))
      .catch(() => live && setList([]));
    return () => {
      live = false;
    };
  }, [cv.id, rev, save]);

  const addSkill = useCallback(
    (name: string, sections = cv.sections) => {
      const skill = { id: newId("k_"), name, visible: true };
      const groups = section.groups.length ? section.groups.map((g, i) => (i === 0 ? { ...g, skills: [...g.skills, skill] } : g)) : [{ id: newId("g_"), name: "", visible: true, skills: [skill] }];
      update({ sections: sections.map((s) => (s.id === section.id ? { ...section, groups } : s)) });
      setList((l) => l?.filter((s) => s.name !== name) ?? l);
    },
    [cv.sections, section, update],
  );

  const decline = (name: string) => {
    const next = [...declined, name];
    setDeclined(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* not stored */
    }
  };

  async function confirm() {
    const text = line.replace(/\s+/g, " ").trim();
    if (!text) return setProblem("Say where you used it, in one line.");
    setBusy(true);
    setProblem("");
    try {
      const role = roles.find((r) => r.id === roleId);
      // The line is the evidence: it is kept in the achievements, and added to the role if one was chosen.
      const made = await api<{ achievement: Achievement }>("/api/cv/bank", { method: "POST", json: { text, original: text, sources: [{ kind: "typed", ref: "skill", text }], skills: [item], role: role?.title ?? "", org: role?.org ?? "" } });
      let sections = cv.sections;
      if (role) {
        const home = cv.sections.find((s) => isEntrySection(s) && s.entries.some((e) => e.id === role.id));
        if (home) sections = addBullets(cv.sections, home.id, role.id, [{ ...newBullet(text), bankId: made.achievement.id, sources: [{ kind: "typed", ref: "skill", text }] }]).sections;
      }
      addSkill(item, sections);
      setLine("");
      setRoleId("");
      close();
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy(false);
    }
  }

  const shown = (list ?? []).filter((s) => !declined.includes(s.name));
  if (!list || (!shown.length && panel !== "confirm-skill")) return null;
  return (
    <Panel title="Skills you could add" style={{ marginTop: 18 }} data-testid="skill-suggestions">
      <ul className="cv-plainlist" style={{ padding: "0 20px" }}>
        {shown.map((s) => (
          <li key={s.name} className="cv-row" style={{ padding: "10px 0" }} data-skill={s.name}>
            <span className="min-w-0 grow">
              <b>{s.name}</b>
              {s.evidence ? (
                <small style={{ display: "block" }}>
                  Shown by:{" "}
                  <button type="button" className="cv-text-passage" onClick={() => onShow(s.evidence!.at)}>
                    “{s.evidence.text}”
                  </button>
                </small>
              ) : (
                <small style={{ display: "block" }}>Do you have this? The advert asks for it, and no line of your {docWord(cv.region)} shows it yet.</small>
              )}
            </span>
            {s.evidence ? (
              <Btn onClick={() => addSkill(s.name)} aria-label={`Add skill ${s.name}`}>
                Add skill
              </Btn>
            ) : (
              <>
                <Btn onClick={() => (setLine(""), setProblem(""), open("confirm-skill", { item: s.name }))} aria-label={`Yes, I have ${s.name}`}>
                  Yes, I have this
                </Btn>
                <Btn kind="quiet" onClick={() => decline(s.name)} aria-label={`No, I don’t have ${s.name}`}>
                  No
                </Btn>
              </>
            )}
          </li>
        ))}
      </ul>
      <p className="cv-pad cv-small" style={{ paddingTop: 8 }}>
        Found in your own bullets and in the advert you gave. A skill from the advert alone is only added once you say where you used it.
      </p>

      {panel === "confirm-skill" && item && (
        <Dialog
          title={`Where have you used ${item}?`}
          onClose={close}
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn kind="primary" busy={busy} onClick={() => void confirm()}>
                Add skill
              </Btn>
            </>
          }
        >
          <Field label="One line, in your own words" rule="What you did with it, and where. This is what you would say if asked in an interview." multiline rows={2} maxLength={600} value={line} onChange={setLine} error={problem} />
          {roles.length > 0 && (
            <div>
              <label className="cv-label" htmlFor="cv-skill-role">
                Add this line to a role
              </label>
              <span className="cv-rule">Optional. It is saved to your achievements either way.</span>
              <CvSelect
                id="cv-skill-role"
                value={roleId}
                onChange={(val) => setRoleId(val)}
                options={[
                  { value: "", label: "Not now" },
                  ...roles.map((r) => ({
                    value: r.id,
                    label: [r.title, r.org].filter(Boolean).join(" · "),
                  })),
                ]}
              />
            </div>
          )}
        </Dialog>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------- saved achievements */

type Saved = Achievement & { usedIn: { id: string; name: string }[] };

/** Pick a saved achievement to add to an entry as a bullet, in the wording already approved. */
export function ChooseAchievement({ entry, sectionId, onClose, say }: { entry: Entry; sectionId: string; onClose: () => void; say: (text: string) => void }) {
  const w = useWorkspace();
  const cv = w.cv!;
  const [all, setAll] = useState<Saved[] | null>(null);
  const [q, setQ] = useState("");
  const [problem, setProblem] = useState("");
  useEffect(() => {
    api<{ achievements: Saved[] }>("/api/cv/bank")
      .then((r) => setAll(r.achievements))
      .catch((e) => setProblem(messageOf(e)));
  }, []);
  const open = (all ?? []).filter((a) => !a.private);
  const hidden = (all ?? []).length - open.length;
  const used = new Set(entry.bullets.map((b) => b.bankId).filter(Boolean));
  const match = open.filter((a) => `${a.text} ${a.role} ${a.org} ${a.skills.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Dialog title="Use a saved achievement" onClose={onClose} wide>
      {problem && (
        <p className="cv-error-text" role="alert">
          {problem}
        </p>
      )}
      {all && open.length === 0 && <p className="cv-muted">You have no saved achievements to use yet. Save a bullet from “Help”, or add one under Achievements.</p>}
      {open.length > 4 && <Field label="Search" value={q} onChange={setQ} placeholder="A word, a role or a skill" />}
      <ul className="cv-plainlist">
        {match.map((a) => (
          <li key={a.id} className="cv-row" style={{ padding: "10px 0" }}>
            <span className="min-w-0 grow">
              {a.text}
              <small style={{ display: "block" }}>{[a.role, a.org].filter(Boolean).join(" · ")}</small>
            </span>
            {used.has(a.id) ? (
              <small>Already in this entry</small>
            ) : (
              <Btn
                aria-label={`Use: ${a.text.slice(0, 60)}`}
                onClick={() => {
                  w.update({ sections: addBullets(cv.sections, sectionId, entry.id, [{ ...newBullet(a.text), sources: a.sources.slice(0, 6), bankId: a.id }]).sections });
                  say("Added to this entry, in the wording you saved.");
                  onClose();
                }}
              >
                Use
              </Btn>
            )}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <small style={{ display: "block" }}>
          {hidden} private {hidden === 1 ? "achievement is" : "achievements are"} not offered here.
        </small>
      )}
    </Dialog>
  );
}
