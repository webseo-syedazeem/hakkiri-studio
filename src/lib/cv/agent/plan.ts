import { type CvDoc, type Entry, cvStrings, isEntrySection, isListSection } from "../schema";
import { askedFor, contains } from "../write/skills";
import { figures } from "../write/facts";
import { entryName } from "./ops";

/**
 * What to ask next. Worked out in code from what the CV has and hasn't got,
 * in the order a good interviewer would ask: the job you want, who you are,
 * then each job (what you did, what changed, a number), study, skills, and
 * the profile last, once there is something to sum up.
 *
 * The assistant may ask a follow-up about what the person just said instead,
 * but it never has to guess what is missing.
 */

/** What a question is about. A question about one job names it: passing on it for one job doesn't pass on it for the others. */
export type StepKey = "target" | "name" | "contact" | "first-role" | `role-did:${string}` | `role-result:${string}` | `role-more:${string}` | "more-roles" | "education" | "skills" | `advert:${string}` | "profile" | "done";

export interface Step {
  key: StepKey;
  ask: string;
  /** The entry the question is about. */
  about?: string;
}

/** Lines a role needs before the assistant moves on to the next thing. */
const ROLE_LINES = 3;

const visibleEntries = (cv: Pick<CvDoc, "sections">, kind: string): Entry[] => cv.sections.filter((s) => s.visible && s.kind === kind && isEntrySection(s)).flatMap((s) => (isEntrySection(s) ? s.entries.filter((e) => e.visible) : []));
const lines = (e: Entry) => e.bullets.filter((b) => b.visible && b.text.trim());

/** The next question, given what the CV holds, which steps the person has passed on, and the entry being talked about. */
export function nextStep(cv: Pick<CvDoc, "contact" | "sections" | "target" | "level" | "region">, opts: { skipped?: string[]; about?: string } = {}): Step {
  const skipped = new Set(opts.skipped ?? []);
  const word = cv.region === "us" ? "resume" : "CV";
  const open = (key: StepKey) => !skipped.has(key);
  const c = cv.contact;

  if (open("target") && !cv.target?.title) return { key: "target", ask: `What job are you going for? If you have the advert, paste the whole thing here and I’ll match your ${word} to it. Or say “skip”.` };
  if (open("name") && !c.fullName) return { key: "name", ask: `What’s your full name, as you’d like it at the top of your ${word}?` };
  if (open("contact") && (!c.email || !c.phone || !c.location)) {
    const need = [!c.email && "email address", !c.phone && "phone number", !c.location && "the town or city you live in"].filter(Boolean) as string[];
    return { key: "contact", ask: `What ${need.length > 1 ? `${need.slice(0, -1).join(", ")} and ${need[need.length - 1]}` : need[0]} should employers use?` };
  }

  const roles = visibleEntries(cv, "experience");
  const study = visibleEntries(cv, "education");
  const student = cv.level === "student";
  if (student && !study.length && open("education")) return { key: "education", ask: "Where are you studying, or where did you study? Tell me the course, the place and when you finish or finished." };
  if (!roles.length && open("first-role")) return { key: "first-role", ask: student ? "Tell me about a job, placement or volunteering you’ve done: what was your role, where, and when?" : "Tell me about your most recent job: your job title, the employer, and when you started." };

  // The role being talked about first, then the others, newest first, until each has enough lines.
  const ordered = [...roles.filter((r) => r.id === opts.about), ...roles.filter((r) => r.id !== opts.about)];
  for (const role of ordered) {
    const have = lines(role);
    if (have.length >= ROLE_LINES && have.some((b) => figures(b.text).length)) continue;
    const name = entryName(role);
    if (!have.length && open(`role-did:${role.id}`)) return { key: `role-did:${role.id}`, about: role.id, ask: `What did you do as ${name}? Say it as you would to a friend: what you were responsible for, and what you made, fixed or ran.` };
    if (!have.some((b) => figures(b.text).length) && open(`role-result:${role.id}`)) return { key: `role-result:${role.id}`, about: role.id, ask: `What changed because of your work as ${name}? If you can, give a number you’d stand behind: roughly how many, how much or how often.` };
    if (have.length < ROLE_LINES && open(`role-more:${role.id}`)) return { key: `role-more:${role.id}`, about: role.id, ask: `What else did you do as ${name}? One more thing you’re proud of is enough.` };
  }
  if (open("more-roles")) return { key: "more-roles", ask: "Is there another job to add, before this one? Tell me the title, the employer and the dates, or say “no more jobs”." };
  if (!student && !study.length && open("education")) return { key: "education", ask: "Where did you study? Tell me the qualification, the place and the year you finished, or say “skip”." };

  const skills = cv.sections.find((s) => s.kind === "skills");
  const hasSkills = !!skills && skills.kind === "skills" && skills.groups.some((g) => g.skills.length);
  if (!hasSkills && open("skills")) return { key: "skills", ask: "Which tools, software or languages do you use at work? List them as you’d name them." };

  // What the advert asks for that the CV doesn't show yet: asked about one at a time, never added unasked.
  const advert = cv.target?.advert ?? "";
  if (advert) {
    const text = cvStrings(cv);
    for (const term of askedFor(advert).slice(0, 12)) {
      const key = `advert:${term.toLowerCase()}` as const;
      if (!open(key) || text.some((t) => contains(t, term))) continue;
      return { key, ask: `The advert asks for ${term}. Have you used it? If you have, tell me where and what you did with it. If not, say “no”.` };
    }
  }

  const profile = cv.sections.find((s) => s.kind === "summary");
  if ((!profile || profile.kind !== "summary" || !profile.text.trim()) && open("profile")) return { key: "profile", ask: `Shall I write your profile from what’s on your ${word} now? Say “write my profile”.` };

  return { key: "done", ask: `Your ${word} has the essentials. Ask me to change anything, or tell me about anything else you’d like on it.` };
}

/** "skip", "no", "no more jobs": the person is passing on the question they were asked. */
export const PASSING = /^\s*(?:skip(?: it| this| that)?|no(?:pe|t really| thanks)?|none|not now|not yet|no more(?: jobs| roles)?|that'?s (?:it|all)|nothing else|i haven'?t|i don'?t|n\/a)\b[\s.!]*$/i;

/**
 * The CV as the assistant is shown it: every entry and line with its id, so
 * an edit can name exactly what it changes. Lines switched off are shown as
 * off. Private lines are left out by the caller.
 */
export function outline(cv: Pick<CvDoc, "contact" | "sections" | "target" | "region">): string {
  const c = cv.contact;
  const out: string[] = [`CONTACT name=${JSON.stringify(c.fullName)} email=${JSON.stringify(c.email)} phone=${JSON.stringify(c.phone)} location=${JSON.stringify(c.location)} links=${JSON.stringify(c.links)}`];
  out.push(cv.target?.title ? `TARGET JOB ${JSON.stringify(cv.target.title)}${cv.target.employer ? ` at ${JSON.stringify(cv.target.employer)}` : ""}${cv.target.advert ? " (advert below)" : ""}` : "TARGET JOB none yet");
  for (const s of cv.sections) {
    const off = s.visible ? "" : " (section off)";
    if (s.kind === "summary") out.push(`PROFILE${off} ${JSON.stringify(s.text)}`);
    else if (s.kind === "skills") out.push(`SKILLS${off} ${s.groups.flatMap((g) => g.skills.filter((k) => k.visible).map((k) => k.name)).join(", ") || "none yet"}`);
    else if (isListSection(s)) out.push(`${s.kind.toUpperCase()}${off} ${s.items.map((i) => (i.level ? `${i.name} (${i.level})` : i.name)).join(", ") || "none yet"}`);
    else if (isEntrySection(s)) {
      out.push(`SECTION ${s.kind}${off}${s.entries.length ? "" : " (empty)"}`);
      for (const e of s.entries) {
        const dates = [e.start, e.current ? "present" : e.end].filter(Boolean).join(" to ");
        const extra = [e.subject && `subject=${JSON.stringify(e.subject)}`, e.grade && `grade=${JSON.stringify(e.grade)}`, e.location && `location=${JSON.stringify(e.location)}`].filter(Boolean).join(" ");
        out.push(`  ENTRY ${e.id}${e.visible ? "" : " (off)"} title=${JSON.stringify(e.title)} org=${JSON.stringify(e.org)}${dates ? ` dates=${dates}` : ""}${extra ? ` ${extra}` : ""}`);
        for (const b of e.bullets) out.push(`    LINE ${b.id}${b.visible ? "" : " (off)"} ${JSON.stringify(b.text)}`);
      }
    }
  }
  return out.join("\n");
}
