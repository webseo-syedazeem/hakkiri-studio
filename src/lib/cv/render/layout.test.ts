import { describe, expect, it } from "vitest";
import { CV_TEMPLATES, isEntrySection } from "../schema";
import { buildFlow, flowText, paperOrder } from "./flow";
import { fitToPages, fontsNeeded, layoutCv } from "./layout";
import { ACCENTS, BODY_SIZE, TEMPLATES, paperStyle } from "./templates";
import { fernCv, loadAllFonts, longCv } from "./testing";

const fonts = loadAllFonts();
const textOf = (cv: ReturnType<typeof fernCv>) => flowText(buildFlow(cv, paperStyle(cv.design).template));

describe("what is printed", () => {
  it("prints the person's words in reading order: name, contact, then each section", () => {
    const text = textOf(fernCv());
    expect(text.slice(0, 5)).toEqual(["Fern Example", "York", "fern@example.com", "07700 900123", "linkedin.com/in/fern-example"]);
    expect(text).toContain("Archive assistant · Paper Kite Archive");
    expect(text).toContain("Sep 2023 – Present · York");
    expect(text).toContain("A public collection of paper maps.");
    expect(text).toContain("BA (Hons) History · Example University");
    expect(text).toContain("2018 – 2021 · 2:1");
    expect(text).toContain("Collections: Cataloguing, paper handling, condition reporting");
    expect(text).toContain("Volunteer induction, Excel");
    expect(text).toContain("Care of Paper Collections · Archives & Records Association · 2023");
    expect(text).toContain("English (native), Français (B2)");
    expect(text).toContain("Example, F. (2024). Handling fragile maps. Archive Notes, 12(3). · 2024");
  });

  it("adds nothing of its own beyond standard headings, separators and date formatting", () => {
    const cv = fernCv();
    const headings = buildFlow(cv, TEMPLATES.standard).nodes.filter((n) => n.kind === "heading").map((n) => (n.kind === "heading" ? n.text : ""));
    expect(headings).toEqual(["Profile", "Experience", "Education", "Skills", "Selected achievements", "Projects", "Certificates", "Volunteering", "Publications", "Languages", "Interests"]);
  });

  it("uses US headings and Letter paper for a US resume", () => {
    const cv = fernCv({}, "us");
    const flow = buildFlow(cv, TEMPLATES.standard);
    expect(flow.nodes.find((n) => n.kind === "heading")).toMatchObject({ text: "Summary" });
    expect(flow.lang).toBe("en-US");
    expect(flow.title).toBe("Fern Example – Collections officer – Resume");
    expect(layoutCv(cv, fonts).layout).toMatchObject({ width: 612, height: 792 });
    expect(buildFlow(fernCv(), TEMPLATES.standard)).toMatchObject({ lang: "en-GB", title: "Fern Example – Collections officer – CV" });
  });

  it("leaves out what is switched off, and empty sections, without leaving a heading behind", () => {
    const cv = fernCv();
    const exp = cv.sections.find((s) => s.kind === "experience")!;
    if (!isEntrySection(exp)) throw new Error();
    exp.entries[1].visible = false;
    exp.entries[0].bullets[0].visible = false;
    cv.sections.find((s) => s.kind === "interests")!.visible = false;
    const lang = cv.sections.find((s) => s.kind === "languages")!;
    if (lang.kind === "languages") lang.items.forEach((i) => (i.visible = false));
    const skills = cv.sections.find((s) => s.kind === "skills")!;
    if (skills.kind === "skills") skills.groups[0].skills[1].visible = false;
    const text = textOf(cv).join("\n");
    expect(text).not.toMatch(/Folio House|Library assistant|Prepared reading-room/);
    expect(text).not.toContain("Catalogue incoming paper maps");
    expect(text).not.toMatch(/Interests|Fell running|Languages|Français/);
    expect(text).toContain("Collections: Cataloguing, condition reporting");
    expect(text).toContain("Wrote a handling guide");
  });

  it("an empty CV prints nothing at all: no headings, no placeholder text", () => {
    const cv = fernCv();
    cv.contact = { fullName: "", email: "", phone: "", location: "", links: [] };
    cv.sections = cv.sections.map((s) => (s.kind === "summary" ? { ...s, text: "" } : s.kind === "skills" ? { ...s, groups: [] } : "items" in s ? { ...s, items: [] } : { ...s, entries: [] })) as typeof cv.sections;
    expect(textOf(cv)).toEqual([]);
    expect(layoutCv(cv, fonts).layout).toMatchObject({ pages: 1, blocks: [] });
  });

  it.each(CV_TEMPLATES)("the %s template puts sections in its own order", (id) => {
    const cv = fernCv({ template: id });
    const kinds = paperOrder(cv, TEMPLATES[id]).map((s) => s.kind);
    // A profile, where the template does not place one, leads; then the template's own order.
    expect(kinds.filter((k) => k !== "summary" || TEMPLATES[id].order.includes("summary")).slice(0, TEMPLATES[id].order.length)).toEqual(TEMPLATES[id].order);
    if (!TEMPLATES[id].order.includes("summary")) expect(kinds[0]).toBe("summary");
    expect(new Set(kinds).size).toBe(cv.sections.length);
  });

  it("the person's own order wins over the template's, and new sections still appear", () => {
    const cv = fernCv();
    const [summary, experience, education] = cv.sections;
    cv.design.order = [education.id, experience.id];
    const kinds = paperOrder(cv, TEMPLATES.standard).map((s) => s.kind);
    expect(kinds.slice(0, 3)).toEqual(["education", "experience", "summary"]);
    expect(kinds).toHaveLength(cv.sections.length);
    void summary;
  });
});

describe("the page", () => {
  it.each(CV_TEMPLATES)("%s: every line is inside the margins, in order down the page, at 10.5pt or larger for body text", (id) => {
    const cv = fernCv({ template: id });
    const { layout, style } = layoutCv(cv, fonts);
    const { marginX, marginY, width, height } = style.page;
    let last = { page: 0, top: 0 };
    // Text beside text (TEMPLATES-v3 designs) goes back up the page; the reading order is the order of the pieces.
    const columns = !!TEMPLATES[id].grid;
    expect(layout.blocks.map((b) => b.node)).toEqual([...layout.blocks.map((b) => b.node)].sort((a, b) => a - b));
    for (const b of layout.blocks) {
      for (const l of b.lines) {
        expect(l.top).toBeGreaterThanOrEqual(marginY - 0.01);
        expect(l.top + l.height).toBeLessThanOrEqual(height - marginY + 0.01);
        // Reading order: never above the line before it on the same page.
        if (!columns) expect(l.page * 10000 + l.top).toBeGreaterThanOrEqual(last.page * 10000 + last.top - 0.01);
        last = { page: l.page, top: l.top };
        for (const r of l.runs) {
          expect(r.x).toBeGreaterThanOrEqual(marginX - 0.01);
          expect(r.x + r.width).toBeLessThanOrEqual(width - marginX + 0.5);
          // Body text (not the smaller dates line) is never under 10.5 pt.
          if (b.kind === "bullet" || (b.kind === "para" && r.size > style.fontSize - 0.95)) expect(r.size).toBeGreaterThanOrEqual(BODY_SIZE);
        }
      }
    }
    expect(layout.missing).toEqual([]);
    // Lines and bars stay inside the margins. A band of colour behind the name runs to the edges of the page, by design;
    // the fill behind a side column (47) stays inside the margins like any other.
    for (const r of layout.rules) {
      if (r.under && r.x === 0) expect({ x: r.x, y: r.y, width: r.width }).toEqual({ x: 0, y: 0, width });
      else {
        expect(r.x).toBeGreaterThanOrEqual(marginX - 0.01);
        expect(r.x + r.width).toBeLessThanOrEqual(width - marginX + 0.5);
      }
    }
  });

  it("wraps long text, keeping every word once and in order", () => {
    const cv = fernCv();
    const { layout, flow } = layoutCv(cv, fonts);
    const long = layout.blocks.find((b) => b.kind === "bullet" && b.lines.length > 1)!;
    expect(long).toBeTruthy();
    const node = flow.nodes[long.node];
    expect(long.lines.map((l) => l.runs.map((r) => r.text).join("")).join(" ")).toBe(node.kind === "bullet" ? node.text : "");
  });

  it("a heading is never left at the bottom of a page without what follows it", () => {
    for (const id of CV_TEMPLATES) {
      const { layout } = layoutCv({ ...longCv(), design: { ...longCv().design, template: id } }, fonts);
      layout.blocks.forEach((b, i) => {
        const next = layout.blocks[i + 1];
        if (!next) return;
        if (b.kind === "heading" || b.kind === "entry") expect(next.lines[0].page).toBe(b.lines[b.lines.length - 1].page);
      });
    }
  });

  it("density changes spacing only: looser is taller, tighter is shorter, and the type is the same size", () => {
    const heightOf = (density: "tighter" | "default" | "looser") => {
      const { layout } = layoutCv(fernCv({ density }), fonts);
      const last = layout.blocks[layout.blocks.length - 1].lines.at(-1)!;
      return { end: last.page * 10000 + last.top, sizes: [...new Set(layout.blocks.flatMap((b) => b.lines.flatMap((l) => l.runs.map((r) => r.size))))].sort() };
    };
    const [tight, normal, loose] = [heightOf("tighter"), heightOf("default"), heightOf("looser")];
    expect(tight.end).toBeLessThan(normal.end);
    expect(normal.end).toBeLessThan(loose.end);
    expect(tight.sizes).toEqual(normal.sizes);
    expect(loose.sizes).toEqual(normal.sizes);
  });

  it("the accent and the font pairing can be changed without changing the words or their order", () => {
    const base = layoutCv(fernCv(), fonts);
    const changed = layoutCv(fernCv({ accent: "plum", fonts: "research" }), fonts);
    expect(flowText(changed.flow)).toEqual(flowText(base.flow));
    const colours = new Set(changed.layout.blocks.flatMap((b) => b.lines.flatMap((l) => l.runs.map((r) => r.color))));
    expect(colours.has(ACCENTS.plum.hex)).toBe(true);
    expect(colours.has(ACCENTS.indigo.hex)).toBe(false);
    expect(fontsNeeded(changed.style).every((k) => k.startsWith("serif"))).toBe(true);
  });

  it("reports characters no font can draw, and does not replace them", () => {
    const cv = fernCv();
    cv.contact.fullName = "Fern 例 Example";
    const { layout, flow } = layoutCv(cv, fonts);
    expect(layout.missing).toEqual(["例"]);
    expect(flowText(flow)[0]).toBe("Fern 例 Example");
  });

  it("breaks a web address that is wider than the page, losing no character", () => {
    const cv = fernCv();
    const url = "example.com/" + "a-very-long-path-segment/".repeat(12);
    cv.contact.links = [url];
    const { layout } = layoutCv(cv, fonts);
    const contact = layout.blocks.find((b) => b.kind === "contact")!;
    expect(contact.lines.flatMap((l) => l.runs.map((r) => r.text)).join("")).toContain(url.slice(0, 40));
    expect(contact.lines.flatMap((l) => l.runs.filter((r) => r.item === 3).map((r) => r.text)).join("")).toBe(url);
  });
});

describe("fitting to whole pages", () => {
  it("chooses the loosest spacing that keeps the CV within the page target", () => {
    const cv = fernCv();
    const fit = fitToPages(cv, fonts, 2);
    expect(fit).toMatchObject({ fits: true, over: [] });
    expect(fit.pages).toBeLessThanOrEqual(2);
    // Nothing looser would also have fitted.
    const order = ["tighter", "default", "looser"] as const;
    for (const d of order.slice(order.indexOf(fit.density) + 1)) expect(layoutCv({ ...cv, design: { ...cv.design, density: d } }, fonts).layout.pages).toBeGreaterThan(2);
  });

  it("tightens when the default spacing runs over, if that is enough", () => {
    // Find a length that is over at the default spacing and fits when tightened.
    let found = false;
    for (let roles = 2; roles <= 9 && !found; roles++) {
      for (let points = 1; points <= 6 && !found; points++) {
        const cv = longCv(roles, points);
        const normal = layoutCv(cv, fonts).layout.pages;
        const tight = layoutCv({ ...cv, design: { ...cv.design, density: "tighter" } }, fonts).layout.pages;
        if (tight < normal) {
          found = true;
          expect(fitToPages(cv, fonts, tight)).toMatchObject({ density: "tighter", fits: true, pages: tight });
        }
      }
    }
    expect(found).toBe(true);
  });

  it("when it cannot fit, says so and names the lines that ran over, without shrinking or cropping anything", () => {
    const cv = longCv(9);
    const fit = fitToPages(cv, fonts, 2);
    expect(fit.fits).toBe(false);
    expect(fit.pages).toBeGreaterThan(2);
    expect(fit.over.length).toBeGreaterThan(0);
    expect(fit.over[0].text.length).toBeGreaterThan(0);
    expect(fit.over.every((o) => o.at.section)).toBe(true);
    // Every word is still on some page.
    const { layout, flow } = layoutCv({ ...cv, design: { ...cv.design, density: fit.density } }, fonts);
    const printed = layout.blocks.map((b) => b.lines.map((l) => l.runs.map((r) => r.text).join("")).join(" ")).join("\n");
    for (const n of flow.nodes) if (n.kind === "bullet") expect(printed).toContain(n.text);
  });
});
