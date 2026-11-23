/**
 * An in-memory stand-in for the database, for unit tests of the code paths
 * that only run when one is configured. It keeps documents by collection and
 * understands the handful of operations and query shapes the app uses:
 * equality (with dotted paths), $or, $in and $regex.
 *
 *   const db = installFakeMongo();   // from now on the app "has a database"
 *   db.docs("answers")               // what is stored, to assert on
 *   removeFakeMongo();               // back to no database
 */
type Doc = Record<string, unknown>;
type Filter = Record<string, unknown>;

const at = (doc: Doc, path: string): unknown => path.split(".").reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Doc)[k] : undefined), doc);

function matches(doc: Doc, filter: Filter): boolean {
  return Object.entries(filter).every(([key, want]) => {
    if (key === "$or") return (want as Filter[]).some((f) => matches(doc, f));
    const have = at(doc, key);
    if (want && typeof want === "object" && !(want instanceof Date) && !Array.isArray(want)) {
      const op = want as { $in?: unknown[]; $regex?: string | RegExp; $lt?: unknown; $exists?: boolean };
      if (op.$in) return op.$in.includes(have);
      if (op.$regex !== undefined) return typeof have === "string" && new RegExp(op.$regex).test(have);
      if (op.$exists !== undefined) return (have !== undefined) === op.$exists;
      if (op.$lt !== undefined) return (have as number) < (op.$lt as number);
    }
    return have === want;
  });
}

class FakeCollection {
  readonly rows = new Map<string, Doc>();
  async findOne(filter: Filter = {}) {
    for (const d of this.rows.values()) if (matches(d, filter)) return structuredClone(d);
    return null;
  }
  find(filter: Filter = {}) {
    const found = [...this.rows.values()].filter((d) => matches(d, filter)).map((d) => structuredClone(d));
    return { toArray: async () => found };
  }
  async insertOne(doc: Doc) {
    const id = String(doc._id);
    if (this.rows.has(id)) throw new Error("E11000 duplicate key");
    this.rows.set(id, structuredClone(doc));
    return { insertedId: id };
  }
  async replaceOne(filter: Filter, doc: Doc, opts: { upsert?: boolean } = {}) {
    const existing = [...this.rows.values()].find((d) => matches(d, filter));
    if (!existing && !opts.upsert) return { matchedCount: 0 };
    const id = String(existing?._id ?? doc._id ?? filter._id);
    this.rows.set(id, structuredClone({ ...doc, _id: id }));
    return { matchedCount: existing ? 1 : 0 };
  }
  async updateOne(filter: Filter, update: { $set?: Doc; $unset?: Doc }) {
    const existing = [...this.rows.values()].find((d) => matches(d, filter));
    if (!existing) return { matchedCount: 0 };
    Object.assign(existing, structuredClone(update.$set ?? {}));
    for (const k of Object.keys(update.$unset ?? {})) delete existing[k];
    return { matchedCount: 1 };
  }
  async deleteOne(filter: Filter) {
    for (const [id, d] of this.rows) {
      if (matches(d, filter)) {
        this.rows.delete(id);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }
  async deleteMany(filter: Filter) {
    let deletedCount = 0;
    for (const [id, d] of [...this.rows]) {
      if (matches(d, filter)) {
        this.rows.delete(id);
        deletedCount++;
      }
    }
    return { deletedCount };
  }
  async countDocuments(filter: Filter = {}) {
    return [...this.rows.values()].filter((d) => matches(d, filter)).length;
  }
  async createIndex() {
    return "ok";
  }
}

export class FakeDb {
  private readonly collections = new Map<string, FakeCollection>();
  collection(name: string) {
    let c = this.collections.get(name);
    if (!c) this.collections.set(name, (c = new FakeCollection()));
    return c;
  }
  listCollections() {
    return { toArray: async () => [...this.collections.keys()].map((name) => ({ name })) };
  }
  /** Everything stored in a collection, for assertions. */
  docs(name: string): Doc[] {
    return [...this.collection(name).rows.values()];
  }
  /** Every stored document in every collection, as text: for "is this person's data anywhere?" checks. */
  dump(): string {
    return JSON.stringify([...this.collections.entries()].map(([name, c]) => [name, [...c.rows.values()]]));
  }
}

const g = globalThis as unknown as { __hakkiriTestDb?: FakeDb };

export function installFakeMongo(): FakeDb {
  return (g.__hakkiriTestDb = new FakeDb());
}

export function removeFakeMongo() {
  delete g.__hakkiriTestDb;
}
