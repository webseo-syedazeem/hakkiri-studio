"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Achievement } from "@/lib/cv/schema";
import { Switch } from "./Arrange";
import { api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { Announce, Bar, Btn, CvScreen, Field, Panel, Skeleton, Toolbar } from "./ui";

type Saved = Achievement & { usedIn: { id: string; name: string }[] };
const blank = { text: "", role: "", org: "", skills: "" };
const skillList = (s: string) => s.split(/[,\n;]+/).map((x) => x.trim()).filter(Boolean).slice(0, 12);

/**
 * The person's achievements: things they did, in wording they approved, kept
 * to use again in any CV. A new account has none. Nothing here is an example.
 */
export function Bank() {
  const { panel, item, open, close } = usePanel();
  const [all, setAll] = useState<Saved[] | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [form, setForm] = useState(blank);
  const [edit, setEdit] = useState<{ text: string; role: string; org: string; skills: string; private: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [said, setSaid] = useState("");

  const load = useCallback(() => {
    setError("");
    api<{ achievements: Saved[] }>("/api/cv/bank")
      .then((r) => setAll(r.achievements))
      .catch((e) => setError(messageOf(e)));
  }, []);
  useEffect(load, [load]);

  const selected = all?.find((a) => a.id === item) ?? (panel ? undefined : all?.[0]);
  const selectedId = selected?.id;
  useEffect(() => {
    setProblem("");
    setEdit(selected ? { text: selected.text, role: selected.role, org: selected.org, skills: selected.skills.join(", "), private: selected.private } : null);
    // Only when another achievement is chosen, or the list reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, all]);

  const shown = (all ?? []).filter((a) => `${a.text} ${a.role} ${a.org} ${a.skills.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()));

  async function act(run: () => Promise<string>) {
    setBusy(true);
    setProblem("");
    try {
      setSaid(await run());
      load();
      return true;
    } catch (e) {
      setProblem(messageOf(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  const add = async () => {
    if (!form.text.trim()) return setProblem("Write what you did.");
    const ok = await act(async () => {
      await api("/api/cv/bank", { method: "POST", json: { text: form.text, original: form.text, sources: [{ kind: "typed", ref: "achievements", text: form.text.trim().slice(0, 1200) }], role: form.role, org: form.org, skills: skillList(form.skills) } });
      return "Achievement saved.";
    });
    if (ok) {
      setForm(blank);
      close();
    }
  };
  const saveEdit = () =>
    selected &&
    edit &&
    act(async () => {
      await api(`/api/cv/bank/${selected.id}`, { method: "PATCH", json: { text: edit.text, role: edit.role, org: edit.org, skills: skillList(edit.skills), private: edit.private } });
      return "Changes saved.";
    });
  const remove = async () => {
    if (!selected) return;
    const ok = await act(async () => {
      await api(`/api/cv/bank/${selected.id}`, { method: "DELETE" });
      return "Achievement deleted.";
    });
    if (ok) close();
  };
  const dirty = !!selected && !!edit && (edit.text !== selected.text || edit.role !== selected.role || edit.org !== selected.org || edit.skills !== selected.skills.join(", ") || edit.private !== selected.private);

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Achievements" }]} />
      <div className="cv-area">
        <Toolbar title="Achievements" subtitle="Things you have done, in wording you approved. Use them again in any CV.">
          <Btn kind="primary" onClick={() => (setForm(blank), setProblem(""), open("edit-achievement"))}>
            Add achievement
          </Btn>
        </Toolbar>
        {error && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>Couldn’t load your achievements</strong>
            <span>{error}</span>
            <Btn className="cv-push" onClick={load}>
              Retry
            </Btn>
          </div>
        )}
        {all === null && !error && <Skeleton height={240} />}
        {all?.length === 0 && (
          <Panel>
            <div className="cv-pad cv-stack" style={{ padding: "36px 24px", textAlign: "center" }}>
              <h2>You have no saved achievements yet</h2>
              <p className="cv-muted" style={{ maxWidth: "56ch", margin: "8px auto 0" }}>
                Add one here, or save a bullet from “Help” in the builder. Bullets you keep from “Tell me what you did” are saved here too.
              </p>
            </div>
          </Panel>
        )}
        {all && all.length > 0 && (
          <div className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 720fr) minmax(0, 448fr)" }}>
            <Panel aria-label="Your achievements">
              {all.length > 4 && (
                <div className="cv-pad" style={{ paddingBottom: 0 }}>
                  <Field label="Search" value={q} onChange={setQ} placeholder="A word, a role or a skill" />
                </div>
              )}
              <ul className="cv-plainlist">
                {shown.map((a) => (
                  <li key={a.id} className={a.id === selected?.id ? "cv-pick cv-pick-active" : "cv-pick"} style={{ borderBottom: "1px solid var(--color-line)" }}>
                    <span className="min-w-0 grow">
                      <Link href={`/cv/bank?item=${a.id}`} scroll={false} className="hover:underline" aria-current={a.id === selected?.id ? "true" : undefined} style={{ overflowWrap: "anywhere" }}>
                        {a.text}
                      </Link>
                      <small style={{ display: "block", marginTop: 3 }}>
                        {[a.role, a.org].filter(Boolean).join(" · ") || "No role given"}
                        {a.usedIn.length ? ` · Used in ${a.usedIn.length} ${a.usedIn.length === 1 ? "CV" : "CVs"}` : ""}
                      </small>
                    </span>
                    {a.private && <span className="cv-chip">Private</span>}
                  </li>
                ))}
              </ul>
              {shown.length === 0 && <p className="cv-pad cv-muted">Nothing matches “{q}”.</p>}
            </Panel>

            {selected && edit && (
              <Panel title="Details" className="cv-sticky" data-testid="achievement-detail">
                <div className="cv-pad cv-stack">
                  <Field label="Wording" rule="As it will appear when you use it in a CV." multiline rows={3} maxLength={600} value={edit.text} onChange={(text) => setEdit({ ...edit, text })} />
                  <div className="cv-pair">
                    <Field label="Role" value={edit.role} onChange={(role) => setEdit({ ...edit, role })} maxLength={160} />
                    <Field label="Employer" value={edit.org} onChange={(org) => setEdit({ ...edit, org })} maxLength={160} />
                  </div>
                  <Field label="Skills it shows" rule="Separate with commas." value={edit.skills} onChange={(skills) => setEdit({ ...edit, skills })} />
                  <div className="cv-row">
                    <Switch checked={edit.private} onChange={(v) => setEdit({ ...edit, private: v })} label="Keep this achievement private" />
                    <span className="min-w-0 grow">
                      <span className="cv-label">Private</span>
                      <span className="cv-rule">Kept for your own reference. Not offered when you build a CV.</span>
                    </span>
                  </div>
                  {selected.original.trim() && selected.original.trim() !== selected.text && (
                    <div>
                      <h3>Your original words</h3>
                      <blockquote className="cv-quote" style={{ whiteSpace: "pre-wrap" }}>
                        {selected.original}
                      </blockquote>
                    </div>
                  )}
                  <div>
                    <h3>Used in</h3>
                    {selected.usedIn.length ? (
                      <ul className="cv-plainlist">
                        {selected.usedIn.map((c) => (
                          <li key={c.id}>
                            <Link className="cv-link" href={`/cv/v/${c.id}/edit/experience`}>
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="cv-small">Not in any CV yet. In the builder, open a role and choose “Use a saved achievement”.</p>
                    )}
                  </div>
                  {problem && !panel && (
                    <p className="cv-error-text" role="alert">
                      {problem}
                    </p>
                  )}
                  <div className="cv-row">
                    <Btn kind="primary" busy={busy && !panel} disabled={!dirty || !edit.text.trim()} onClick={() => void saveEdit()}>
                      Save changes
                    </Btn>
                    <Btn kind="danger" className="cv-push" onClick={() => open("delete-achievement", { item: selected.id })}>
                      Delete
                    </Btn>
                  </div>
                  {selected.usedIn.length > 0 && <small style={{ display: "block" }}>CVs that already use it keep the wording they have.</small>}
                </div>
              </Panel>
            )}
          </div>
        )}
        <Announce>{said}</Announce>
      </div>

      {panel === "edit-achievement" && (
        <Dialog
          title="Add achievement"
          onClose={close}
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn kind="primary" busy={busy} onClick={() => void add()}>
                Save achievement
              </Btn>
            </>
          }
        >
          <Field label="What you did" rule="One thing, in your own words, with the result if there was one. Only what you could explain in an interview." multiline rows={3} maxLength={600} value={form.text} onChange={(text) => setForm({ ...form, text })} error={problem} />
          <div className="cv-pair">
            <Field label="Role" rule="Optional." value={form.role} onChange={(role) => setForm({ ...form, role })} maxLength={160} />
            <Field label="Employer" rule="Optional." value={form.org} onChange={(org) => setForm({ ...form, org })} maxLength={160} />
          </div>
          <Field label="Skills it shows" rule="Optional. Separate with commas." value={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
        </Dialog>
      )}
      {panel === "delete-achievement" && selected && (
        <Dialog
          title="Delete achievement"
          onClose={close}
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn kind="danger" busy={busy} onClick={() => void remove()}>
                Delete achievement
              </Btn>
            </>
          }
        >
          <p>
            Delete <b>{selected.text}</b>? This can’t be undone.
          </p>
          {selected.usedIn.length > 0 && <p className="cv-muted">The line stays in the {selected.usedIn.length === 1 ? "CV that uses" : "CVs that use"} it.</p>}
          {problem && (
            <p className="cv-error-text" role="alert">
              {problem}
            </p>
          )}
        </Dialog>
      )}
    </CvScreen>
  );
}
