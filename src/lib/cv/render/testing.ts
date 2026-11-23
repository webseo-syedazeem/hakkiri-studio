import fs from "node:fs";
import path from "node:path";
import type { CvDoc, Entry, Section } from "../schema";
import { FONT_FILES, FONT_KEYS } from "./fonts";
import type { Fonts } from "./layout";
import { parseFont } from "./ttf";

/** Test helpers: the real fonts from disk, and a CV to print. The people are made up. */

export function loadAllFonts(): Fonts {
  const fonts: Fonts = {};
  for (const key of FONT_KEYS) fonts[key] = parseFont(new Uint8Array(fs.readFileSync(path.join(__dirname, "fonts", FONT_FILES[key].file))));
  return fonts;
}

let n = 0;
const id = (p: string) => `${p}_${(++n).toString(16).padStart(8, "0")}`;
const bullet = (text: string, visible = true) => ({ id: id("b"), text, visible, origin: "typed" as const, sources: [] });
const entry = (e: Omit<Partial<Entry>, "bullets"> & { bullets?: (string | Entry["bullets"][number])[] }): Entry => ({
  id: id("e"),
  visible: true,
  title: "",
  org: "",
  orgInfo: "",
  location: "",
  start: "",
  end: "",
  current: false,
  subject: "",
  grade: "",
  link: "",
  ...e,
  bullets: (e.bullets ?? []).map((b) => (typeof b === "string" ? bullet(b) : b)),
});

export type TestCv = Pick<CvDoc, "contact" | "sections" | "design" | "region" | "target" | "level">;

/** A full CV: every kind of section, accents, currency, dashes, a link. */
export function fernCv(design: Partial<CvDoc["design"]> = {}, region: "uk" | "us" = "uk"): TestCv {
  const sections: Section[] = [
    { id: id("s"), kind: "summary", visible: true, title: "", text: "Archive assistant with four years’ experience caring for paper collections. Wrote the handling guidance now used by 40 volunteers, and catalogued 3,200 maps in two years." },
    {
      id: id("s"),
      kind: "experience",
      visible: true,
      title: "",
      entries: [
        entry({ title: "Archive assistant", org: "Paper Kite Archive", orgInfo: "A public collection of paper maps.", location: "York", start: "2023-09", current: true, bullets: ["Catalogue incoming paper maps and record their condition.", "Wrote a handling guide for volunteers working with fragile maps – 40 pages, used at every induction since March 2024.", "Cut the cataloguing backlog from 1,400 items to 300 in a year by batching similar sheets; budget of £2,500."] }),
        entry({ title: "Library assistant", org: "Folio House", location: "Leeds", start: "2021-08", end: "2023-08", bullets: ["Prepared reading-room requests for visiting researchers.", "Trained six new starters on the café till & the catalogue."] }),
      ],
    },
    { id: id("s"), kind: "education", visible: true, title: "", entries: [entry({ title: "BA (Hons)", subject: "History", org: "Example University", start: "2018", end: "2021", grade: "2:1", bullets: ["Dissertation on eighteenth-century estate maps."] })] },
    {
      id: id("s"),
      kind: "skills",
      visible: true,
      title: "",
      groups: [
        { id: id("g"), name: "Collections", visible: true, skills: ["Cataloguing", "paper handling", "condition reporting"].map((name) => ({ id: id("k"), name, visible: true })) },
        { id: id("g"), name: "", visible: true, skills: ["Volunteer induction", "Excel"].map((name) => ({ id: id("k"), name, visible: true })) },
      ],
    },
    { id: id("s"), kind: "projects", visible: true, title: "", entries: [entry({ title: "Map of the Month", org: "Paper Kite Archive", link: "paperkite.example/maps", start: "2024", end: "2024", bullets: ["Chose and described twelve maps for the website."] })] },
    { id: id("s"), kind: "volunteering", visible: true, title: "", entries: [entry({ title: "Reading helper", org: "Hillside Primary School", start: "2022-01", end: "2022-12", bullets: ["Read with six pupils each week."] })] },
    { id: id("s"), kind: "certificates", visible: true, title: "", entries: [entry({ title: "Care of Paper Collections", org: "Archives & Records Association", end: "2023" })] },
    { id: id("s"), kind: "publications", visible: true, title: "", entries: [entry({ title: "Example, F. (2024). Handling fragile maps. Archive Notes, 12(3).", end: "2024" })] },
    { id: id("s"), kind: "achievements", visible: true, title: "", entries: [entry({ bullets: ["Named Volunteer Trainer of the Year, 2024."] })] },
    { id: id("s"), kind: "languages", visible: true, title: "", items: [{ id: id("i"), name: "English", level: "native", visible: true }, { id: id("i"), name: "Français", level: "B2", visible: true }] },
    { id: id("s"), kind: "interests", visible: true, title: "", items: [{ id: id("i"), name: "Fell running", level: "", visible: true }, { id: id("i"), name: "bookbinding", level: "", visible: true }] },
  ];
  return {
    contact: { fullName: "Fern Example", email: "fern@example.com", phone: "07700 900123", location: "York", links: ["linkedin.com/in/fern-example"] },
    sections,
    design: { template: "standard", pageSize: region === "us" ? "letter" : "a4", density: "default", pageTarget: 2, ...design },
    region,
    level: "early",
    target: { title: "Collections officer", employer: "Lantern Atlas", advert: "" },
  };
}

/** A CV long enough to need more than two pages at any spacing. */
export function longCv(roles = 9, points = 6): TestCv {
  const cv = fernCv();
  const exp = cv.sections.find((s) => s.kind === "experience")!;
  if (exp.kind !== "experience") throw new Error("no experience");
  exp.entries = Array.from({ length: roles }, (_, i) =>
    entry({
      title: `Collections role ${i + 1}`,
      org: `Archive number ${i + 1}`,
      start: `${2024 - i}-01`,
      end: `${2024 - i}-12`,
      bullets: Array.from({ length: points }, (_, k) => `Role ${i + 1}, point ${k + 1}: catalogued, described and rehoused a run of maps and plans, and reported on their condition to the collections manager each month.`),
    }),
  );
  return cv;
}

export { entry as testEntry, bullet as testBullet };
