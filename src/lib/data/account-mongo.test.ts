import { afterAll, describe, expect, it } from "vitest";
import JSZip from "jszip";
import { installFakeMongo, removeFakeMongo } from "@/test/fake-mongo";

// With a database configured, every store also writes there. This walks the same deletes against it:
// what matters is what is left in the database afterwards, not what this process remembers.
const db = installFakeMongo();
const { deleteAccount, deleteEverything, exportAll } = await import("./account");
const { seedEverything } = await import("@/test/seed");
const { flushStorage, loadFileAsync } = await import("@/lib/storage/disk");
const users = await import("@/lib/auth/user-db");

afterAll(removeFakeMongo);

const PASSWORD = "a long and unusual phrase 41";
async function account(name: string) {
  const made = await users.createUser(`${name.toLowerCase()}@example.com`, PASSWORD, name);
  if (!made.ok) throw new Error(made.error);
  return made.user as { id: string; email: string };
}
/** Usage is written a moment after the calls settle; then wait for every write to the database. */
const settle = async () => {
  await new Promise((r) => setTimeout(r, 500));
  await flushStorage();
};
const count = (text: string, word: string) => text.split(word).length - 1;
/** The documents in a collection that mention a word, without the time they were last written. */
const mentioning = (collection: string, word: string) => db.docs(collection).filter((d) => JSON.stringify(d).includes(word)).map((d) => JSON.stringify({ ...d, updatedAt: undefined }));
/** Every document of a person's in a collection (by their marker or their id), once each. */
const docsOf = (collection: string, mark: string, id: string) => [...new Set(mentioning(collection, mark).concat(mentioning(collection, id)))].filter((d) => !d.includes("stray-")).sort();
const COLLECTIONS = ["interviews", "answers", "mocks", "drafts", "qa_drafts", "files", "users", "sessions", "apply_profiles", "apply_voices", "apply_evidence", "apply_jobs", "apply_applications", "apply_outputs", "apply_matches", "apply_sends", "apply_settings", "apply_leads", "apply_audits", "cv_versions"];

describe("deleting, with a database", () => {
  it("“Delete all my data” leaves nothing of the person's in any collection, and the other person's documents untouched", async () => {
    const alice = await account("Alice");
    const bob = await account("Bob");
    await seedEverything(alice, "ALICEMARK");
    await seedEverything(bob, "BOBMARK");
    await users.createSession(alice.id, alice.email);
    await settle();

    // Before: her data is in the database, in collections of its own and in the saved lists.
    const before = db.dump();
    for (const collection of ["interviews", "answers", "mocks", "drafts", "qa_drafts", "files", "apply_evidence", "apply_jobs", "cv_versions", "storage"]) {
      expect(mentioning(collection, "ALICEMARK").length, collection).toBeGreaterThan(0);
    }
    // The audio of an answer in progress, and each saved recording and slide picture, are there too.
    expect(db.docs("files").filter((f) => JSON.stringify(f).includes("ALICEMARK")).length).toBe(4);
    // (A job saved before jobs carried an owner is marked as the person's the first time it is read: read once first.)
    const bobFiles = Object.keys((await JSZip.loadAsync(await exportAll(bob.id))).files).sort();
    await settle();
    const bobMentionsWithStray = count(db.dump(), "BOBMARK") + 1;
    const bobDocs = Object.fromEntries(COLLECTIONS.map((c) => [c, docsOf(c, "BOBMARK", bob.id)]));

    // Documents written by another copy of the server, which this process has never seen: they are found by owner.
    for (const c of ["interviews", "answers", "mocks"]) await db.collection(c).insertOne({ _id: `stray-${c}`, data: { id: `stray-${c}`, userId: alice.id, note: "ALICEMARK stray" } });
    await db.collection("drafts").insertOne({ _id: "stray-draft", id: "stray-draft", userId: alice.id, turns: [{ asked: "ALICEMARK stray" }] });
    await db.collection("interviews").insertOne({ _id: "stray-bob", data: { id: "stray-bob", userId: bob.id, note: "BOBMARK stray" } });

    const done = await deleteEverything(alice.id);
    await settle();
    expect(done.database).toBeGreaterThanOrEqual(6); // her two drafts, her Q&A draft and the three strays, at least
    expect(db.docs("interviews").map((d) => d._id)).toContain("stray-bob");

    const after = db.dump();
    expect(count(after, "ALICEMARK")).toBe(0);
    // Her address is only on her account now, and her id only on her account, her session and her bare usage counts.
    for (const c of db.listCollectionNames()) {
      if (c === "users" || c === "sessions") continue;
      const docs = db.docs(c).filter((d) => JSON.stringify(d).includes(alice.id) || JSON.stringify(d).includes(alice.email));
      expect(docs.map((d) => d._id), c).toEqual(c === "storage" ? ["usage.json"] : []);
    }
    const usage = db.docs("storage").find((d) => d._id === "usage.json")!.data as Record<string, unknown>[];
    const hers = usage.filter((e) => e.userId === alice.id);
    expect(hers).toHaveLength(1);
    expect(Object.keys(hers[0]).sort()).toEqual(["at", "costUsd", "feature", "label", "seconds", "service", "userId"]);
    // The recordings and the slide picture are gone from the database's file copies, not only from disk.
    expect(await loadFileAsync("recordings/ans-ALICEMARK-0.webm")).toBeNull();
    expect(await loadFileAsync("pitch/p-ALICEMARK/slide-1.png")).toBeNull();

    // Bob: every document of his is as it was, and nothing of his was dropped from a shared list.
    for (const c of COLLECTIONS) expect(docsOf(c, "BOBMARK", bob.id), c).toEqual(bobDocs[c]);
    expect(count(after, "BOBMARK")).toBe(bobMentionsWithStray);
    expect(Object.keys((await JSZip.loadAsync(await exportAll(bob.id))).files).sort()).toEqual(bobFiles);
    expect(await loadFileAsync("recordings/ans-BOBMARK-0.webm")).not.toBeNull();
    // She can still sign in.
    expect((await users.authenticateUser(alice.email, PASSWORD)).ok).toBe(true);
  });

  it("“Delete my account” then leaves no trace of the person at all", async () => {
    const alice = (await users.findUserByEmail("alice@example.com")) as { id: string; email: string };
    const bobMentions = count(db.dump(), "BOBMARK");
    const done = await deleteAccount(alice.id);
    await settle();
    expect(done.account).toBe(true);
    const after = db.dump();
    for (const trace of [alice.id, alice.email, "ALICEMARK"]) expect(count(after, trace), trace).toBe(0);
    expect(db.docs("users").map((u) => u.email)).toEqual(["bob@example.com"]);
    expect(db.docs("sessions")).toEqual([]);
    // The usage row is still counted, and is nobody's.
    const usage = db.docs("storage").find((d) => d._id === "usage.json")!.data as Record<string, unknown>[];
    expect(usage).toHaveLength(2);
    expect(usage.filter((e) => !e.userId)).toHaveLength(1);
    expect(count(after, "BOBMARK")).toBe(bobMentions);
  });

  it("a second delete finds nothing and harms nothing", async () => {
    const bob = (await users.findUserByEmail("bob@example.com")) as { id: string; email: string };
    const before = count(db.dump(), "BOBMARK");
    expect(await deleteEverything("usr_was_alice")).toEqual({ apply: 0, cvs: 0, surveys: 0, database: 0 });
    expect(await deleteEverything("")).toEqual({ apply: 0, cvs: 0, surveys: 0, database: 0 });
    await settle();
    expect(count(db.dump(), "BOBMARK")).toBe(before);
    expect((await users.accountOf(bob.id))?.email).toBe("bob@example.com");
  });
});
