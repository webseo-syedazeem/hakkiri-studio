import { describe, expect, it } from "vitest";
import { checkGrounded, checkMerge, checkProfile, checkRewrite, refusalMessage } from "./check";
import { counted, countsTheSame, figures, leadWords, meaningWords, negated, sentences, stem, supportWords, terms } from "./facts";

const keys = (t: string) => figures(t).map((f) => f.key);
const says = (v: { problems: { say: string }[] }) => v.problems.map((p) => p.say);

describe("reading figures", () => {
  it("reads a number however it is written", () => {
    expect(keys("3,200 maps")).toEqual(["3200"]);
    expect(keys("six clients")).toEqual(["6"]);
    expect(keys("twenty five people")).toEqual(["25"]);
    expect(keys("two million page views")).toEqual(["2000000"]);
    expect(keys("2 million")).toEqual(["2000000"]);
    expect(keys("five hundred orders")).toEqual(["500"]);
    expect(keys("3k and 3 thousand and 3,000")).toEqual(["3000", "3000", "3000"]);
  });

  it("keeps the currency, the percent sign and the scale as part of the figure", () => {
    expect(keys("a budget of £1.2m")).toEqual(["£1200000"]);
    expect(keys("£1.2 million")).toEqual(["£1200000"]);
    expect(keys("$40k")).toEqual(["$40000"]);
    expect(keys("by 18%")).toEqual(["18%"]);
    expect(keys("by 18 percent")).toEqual(["18%"]);
    expect(keys("by 18 per cent")).toEqual(["18%"]);
    // £1.2m and 1.2m are different facts; so are 18 and 18%.
    expect(keys("1.2m")).not.toEqual(keys("£1.2m"));
    expect(keys("18")).not.toEqual(keys("18%"));
  });

  it("reads both ends of a range, and dates", () => {
    expect(keys("3–5 roles")).toEqual(["3", "5"]);
    expect(keys("from 2018 to 2021")).toEqual(["2018", "2021"]);
  });

  it("reads halves and doubles as figures", () => {
    expect(keys("cut reporting time by half")).toEqual(["1/2"]);
    expect(keys("doubled sign-ups")).toEqual(["x2"]);
  });

  it("does not take a letter-and-number name for a figure, or “one of the team” for a count", () => {
    expect(keys("moved reporting to GA4 for a B2B client in Q3")).toEqual([]);
    expect(keys("one of the team")).toEqual([]);
    expect(keys("12 months")).toEqual(["12"]);
  });

  it("reads a degree class, a time or a ratio as one value: the 2 of a 2:1 is not two of anything", () => {
    expect(keys("BA (Hons) History · 2018 – 2021 · 2:1")).toEqual(["2018", "2021", "2:1"]);
    expect(keys("opens at 9:30")).toEqual(["9:30"]);
    expect(checkGrounded("I manage two junior executives.", ["Manage three junior executives", "BA (Hons) Marketing · 2013 – 2016 · 2:1"]).ok).toBe(false);
    expect(checkGrounded("I graduated with a 2:1.", ["BA (Hons) Marketing · 2013 – 2016 · 2:1"]).problems.filter((p) => p.kind === "added-figure")).toEqual([]);
  });

  it("notes when a figure is an estimate, a minimum or a maximum", () => {
    expect(figures("roughly 40 volunteers")[0]).toMatchObject({ key: "40", hedge: "about", phrase: "roughly 40" });
    expect(figures("about six months")[0]).toMatchObject({ key: "6", hedge: "about" });
    expect(figures("over 200 orders")[0]).toMatchObject({ hedge: "over" });
    expect(figures("40+ volunteers")[0]).toMatchObject({ hedge: "over" });
    expect(figures("budgets of up to £1.2m")[0]).toMatchObject({ key: "£1200000", hedge: "under", phrase: "up to £1.2m" });
    expect(figures("trained 40 volunteers")[0]).toMatchObject({ hedge: "" });
  });
});

describe("reading words", () => {
  it("treats the forms of a word as one word", () => {
    for (const group of [["manage", "managed", "managing", "manages"], ["catalogue", "catalogued", "cataloguing"], ["run", "ran", "running"], ["lead", "led", "leading"], ["strategy", "strategies"], ["analyse", "analysed", "analysis"], ["plan", "planned", "planning"], ["client", "clients", "client’s"], ["write", "wrote", "written"]]) {
      expect(new Set(group.map(stem)).size, group.join(", ")).toBe(1);
    }
  });

  it("tells different words apart", () => {
    expect(stem("helped")).not.toBe(stem("led"));
    expect(stem("report")).not.toBe(stem("budget"));
    expect(stem("volunteers")).not.toBe(stem("pages"));
  });

  it("leaves out the joining words and keeps the words that carry content", () => {
    expect(terms("I was in the team that ran the weekly planning meeting").map((t) => t.text)).toEqual(["team", "ran", "weekly", "planning", "meeting"]);
    expect(terms("Café menus for Zoë").map((t) => t.text)).toEqual(["Café", "menus", "Zoë"]);
  });

  it("finds the words that say who did the work", () => {
    expect(supportWords("Helped run the summer school")).toEqual(["helped"]);
    expect(supportWords("I was part of the team and worked with the lead designer")).toEqual(["worked with", "part of"]);
    expect(leadWords("Led a team of six and was responsible for the budget")).toEqual(["led", "responsible for"]);
    expect(leadWords("Catalogued 3,200 maps")).toEqual([]);
  });

  it("splits notes into sentences exactly as written", () => {
    const notes = "I ran the till. We cut waste by 12% in a year!\nTrained 3 new starters.";
    const parts = sentences(notes);
    expect(parts).toEqual(["I ran the till.", "We cut waste by 12% in a year!", "Trained 3 new starters."]);
    for (const p of parts) expect(notes).toContain(p);
  });
});

describe("a draft adds nothing to the person's words", () => {
  const notes = ["I helped run the weekly planning meeting for the Leeds site. We cut late orders by roughly 12% over the year."];

  it("passes a bullet made only of their words", () => {
    expect(checkGrounded("Helped run the weekly planning meeting for the Leeds site", notes).ok).toBe(true);
    expect(checkGrounded("Cut late orders by roughly 12% over the year, as part of the team", notes).ok).toBe(true);
  });

  it("refuses a draft that drops “we”: the work was a team's", () => {
    const v = checkGrounded("Cut late orders by roughly 12% over the year", notes);
    expect(says(v)).toEqual(["It dropped “we”, so it claims more of the work than your words do."]);
    // Any wording that keeps it shared will do.
    expect(checkGrounded("Helped cut late orders by roughly 12% over the year", notes).ok).toBe(true);
  });

  it("refuses a figure moved from the thing it counted to another", () => {
    const said = ["I trained 4 volunteers in 40 hours of sessions. I catalogued 1,200 objects."];
    expect(says(checkGrounded("Trained 40 volunteers", said))).toEqual(["It says “40 volunteers”. In your words, “40” is about something else."]);
    expect(says(checkGrounded("Trained 1,200 volunteers", said))).toEqual(["It says “1,200 volunteers”. In your words, “1,200” is about something else."]);
    expect(checkGrounded("Trained 4 volunteers in 40 hours", said).ok).toBe(true);
    expect(checkGrounded("Catalogued 1,200 objects", said).ok).toBe(true);
  });

  it("knows what a figure counts from the words beside it", () => {
    const fig = (t: string, n = 0) => counted(t, figures(t)[n]);
    // The noun phrase straight after a count, up to the next small word; the words before a percentage.
    expect(fig("Trained six new starters on the café till").after).toEqual(["new", "starters"].map(stem));
    expect(fig("Catalogued 1,200 objects in the collections database").after).toEqual(["objects"].map(stem));
    expect(fig("Managed 5 engineers and 12 contractors", 1).after).toEqual(["contractors"].map(stem));
    expect(fig("Cut average cost per lead by 18% in six months").before).toEqual(["lead", "cost"].map(stem));
    expect(fig("a team of 5")).toEqual({ after: [], before: ["team"] });
    // The same figure about the same thing, said another way, still matches.
    const same = (a: string, b: string) => countsTheSame(a, figures(a)[0], b, figures(b)[0]);
    expect(same("3,200 maps", "maps catalogued: 3,200")).toBe(true);
    expect(same("six starters", "six new starters")).toBe(true);
    expect(same("cut lead costs 18%", "Cut average cost per lead by 18%")).toBe(true);
    expect(same("in 2021", "Aug 2021 – Aug 2023")).toBe(true);
    expect(same("12 engineers", "12 contractors")).toBe(false);
  });

  it("refuses a figure they never gave", () => {
    const v = checkGrounded("Cut late orders by roughly 12% over the year, saving £40k", notes);
    expect(v.ok).toBe(false);
    expect(says(v)).toContain("It added “£40k”, which isn’t in your words.");
  });

  it("refuses a figure that is right in number and wrong in kind", () => {
    expect(says(checkGrounded("Cut late orders by roughly £12 over the year", notes))[0]).toBe("It added “£12”, which isn’t in your words.");
  });

  it("refuses an estimate made exact", () => {
    const v = checkGrounded("Cut late orders by 12% over the year", notes);
    expect(v.ok).toBe(false);
    expect(v.problems[0]).toMatchObject({ kind: "estimate", original: "roughly 12%", proposed: "12%" });
    expect(v.problems[0].say).toBe("Your words say “roughly 12%” (an estimate); the draft says “12%” (exact).");
  });

  it("refuses a minimum turned into an estimate", () => {
    expect(checkGrounded("Trained about 40 volunteers", ["Trained over 40 volunteers"]).problems[0].kind).toBe("estimate");
  });

  it("refuses “helped” turned into “led”", () => {
    const v = checkGrounded("Led the weekly planning meeting for the Leeds site", notes);
    expect(v.ok).toBe(false);
    expect(v.problems[0]).toMatchObject({ kind: "ownership", original: "helped", proposed: "led" });
    expect(v.problems[0].say).toBe("It replaced “helped” with “led”, which claims more than your words do.");
  });

  it("refuses “helped” quietly dropped", () => {
    const v = checkGrounded("Ran the weekly planning meeting for the Leeds site", notes);
    expect(v.ok).toBe(false);
    expect(v.problems[0]).toMatchObject({ kind: "ownership", original: "helped" });
  });

  it("refuses a word that carries a new claim", () => {
    const v = checkGrounded("Helped run the award-winning weekly planning meeting for the Leeds site", notes);
    expect(says(v)).toEqual(["It added “award”, which isn’t in your words.", "It added “winning”, which isn’t in your words."]);
    expect(says(checkGrounded("Helped run the weekly planning meeting for the Leeds site using Excel", notes))).toEqual(["It added “Excel”, which isn’t in your words."]);
  });

  it("lets a word change its ending, and joining words come and go", () => {
    expect(checkGrounded("Helping to run weekly planning meetings at the Leeds site", notes).ok).toBe(true);
  });

  it("says whose words they are", () => {
    expect(says(checkGrounded("Managed 12 people", ["Catalogued maps"], { whose: "your notes" }))[0]).toBe("It added “12”, which isn’t in your notes.");
  });
});

describe("a rewrite loses nothing", () => {
  const original = "I successfully cut the average cost per lead by 18% in six months by rebuilding the account structure";

  it("passes a tighter wording with every fact kept", () => {
    expect(checkRewrite(original, "Cut average cost per lead by 18% in six months by rebuilding account structure").ok).toBe(true);
    expect(checkRewrite(original, "Rebuilt the account structure, cutting average cost per lead by 18% in six months").ok).toBe(true);
  });

  it("refuses a rewrite that drops the number", () => {
    const v = checkRewrite(original, "Cut the average cost per lead in six months by rebuilding the account structure");
    expect(v.ok).toBe(false);
    expect(says(v)).toEqual(["It dropped “18%”."]);
  });

  it("refuses a rewrite that drops the timeframe", () => {
    const v = checkRewrite(original, "Cut the average cost per lead by 18% by rebuilding the account structure");
    expect(says(v)).toEqual(["It dropped “six”.", "It dropped “months”."]);
  });

  it("refuses a rewrite that drops the outcome", () => {
    const v = checkRewrite("Introduced weekly budget pacing that stopped overspend in peak season", "Introduced weekly budget pacing");
    expect(v.ok).toBe(false);
    expect(says(v)).toEqual(["It dropped “stopped”.", "It dropped “overspend”.", "It dropped “peak”.", "It dropped “season”."]);
  });

  it("refuses a changed number and says both", () => {
    const v = checkRewrite(original, "Cut average cost per lead by 28% in six months by rebuilding account structure");
    expect(says(v)).toEqual(["It added “28%”, which isn’t in your words.", "It dropped “18%”."]);
  });

  it("names a swapped word as a replacement", () => {
    const v = checkRewrite("Trained 40 volunteers to handle paper safely", "Trained 40 staff to handle paper safely");
    expect(v.problems).toHaveLength(1);
    expect(v.problems[0]).toMatchObject({ kind: "replaced", original: "volunteers", proposed: "staff" });
    expect(v.problems[0].say).toBe("It replaced “volunteers” with “staff”.");
  });

  it.each([
    ["Designed a process that could cut onboarding time by 30%", "Designed a process that cut onboarding time by 30%", "It dropped “could”, which changes what you claim."],
    ["Did not miss a deadline in 3 years", "Missed a deadline in 3 years", "It dropped “not”, which changes what you claim."],
    ["Didn’t miss a deadline in 3 years", "Missed a deadline in 3 years", "It dropped “not”, which changes what you claim."],
    ["Ran most of the weekly stand-ups for the team", "Ran the weekly stand-ups for the team", "It dropped “most”, which changes what you claim."],
    ["Ran the weekly stand-ups for the team", "Ran all the weekly stand-ups for the team", "It added “all”, which changes what you claim."],
    ["Would have led the migration", "Led the migration", "It dropped “would”, which changes what you claim."],
    ["Never missed a release date", "Missed a release date", "It dropped “never”, which changes what you claim."],
  ])("small words carry meaning: “%s” may not become “%s”", (original, proposed, say) => {
    expect(says(checkRewrite(original, proposed))).toContain(say);
  });

  it("refuses “we” turned into the person's own work, and accepts it kept as a team's", () => {
    expect(says(checkRewrite("We reduced churn by 18% in 2022", "Reduced churn by 18% in 2022"))).toEqual(["It dropped “we”, so it claims more of the work than your words do."]);
    expect(checkRewrite("We reduced churn by 18% in 2022", "Reduced churn by 18% in 2022, as part of the team").ok).toBe(true);
  });

  it("figures keep their order and the thing they count", () => {
    expect(says(checkRewrite("Cut churn from 18% to 12%", "Cut churn from 12% to 18%"))).toEqual(["It changed the order of the figures. Your words have them as “18%, 12%”."]);
    expect(checkRewrite("Managed 5 engineers and 12 contractors", "Managed 12 engineers and 5 contractors").ok).toBe(false);
    expect(says(checkRewrite("Managed 5 engineers and 12 contractors", "Managed 12 engineers and 5 contractors")).join(" ")).toContain("“12 engineers”");
    // Reordering that keeps each figure with its own thing is fine.
    expect(checkRewrite("Managed 5 engineers and 12 contractors", "Managed 12 contractors and 5 engineers").ok).toBe(true);
    expect(checkRewrite("Grew the list from 400 to 1,200 subscribers", "Grew the list from 1,200 to 400 subscribers").ok).toBe(false);
  });

  it("does not refuse the same fact written another way", () => {
    expect(checkRewrite("Cut waste by 18 per cent in a year", "Cut waste by 18% in a year").ok).toBe(true);
    expect(checkRewrite("Have shown new starters how to use the till", "Showed new starters how to use the till").ok).toBe(true);
    expect(checkRewrite("Has proven the approach in three pilots", "Proved the approach in three pilots").ok).toBe(true);
  });

  it("reads the small words that carry meaning, and whether a line says “not”", () => {
    expect(meaningWords("We couldn’t ship most of it, and never would")).toEqual(["not", "most", "never", "would"]);
    expect(meaningWords("Cannot")).toEqual(["not"]);
    expect(negated("I have not worked in a museum before")).toBe(true);
    expect(negated("No experience of cataloguing")).toBe(true);
    expect(negated("I didn’t manage a budget")).toBe(true);
    expect(negated("I have worked in a museum, and know the notes system")).toBe(false);
  });

  it("refuses a bigger share of the credit", () => {
    const v = checkRewrite("Helped the events team run a conference for 300 people", "Ran a conference for 300 people");
    expect(v.ok).toBe(false);
    expect(v.problems.some((p) => p.kind === "ownership")).toBe(true);
  });

  it("refuses a currency dropped from a figure", () => {
    expect(checkRewrite("Managed a budget of £1.2m", "Managed a budget of 1.2m").ok).toBe(false);
  });

  it("accepts the same figure written another way", () => {
    expect(checkRewrite("Managed a budget of £1.2 million", "Managed a £1.2m budget").ok).toBe(true);
    expect(checkRewrite("Ran six campaigns", "Ran 6 campaigns").ok).toBe(true);
  });

  it("lets filler go, and only filler", () => {
    expect(checkRewrite("Was responsible for successfully managing various client accounts", "Managed client accounts").ok).toBe(true);
    expect(checkRewrite("Managed key client accounts in retail", "Managed client accounts").problems.map((p) => p.original)).toEqual(["retail"]);
  });

  it("keeps an estimate an estimate", () => {
    const v = checkRewrite("Trained roughly 40 volunteers", "Trained 40 volunteers");
    expect(v.ok).toBe(false);
    expect(v.problems[0].kind).toBe("estimate");
  });

  it("words the refusal as the person will read it", () => {
    const v = checkRewrite("Helped the events team run a conference for 300 people", "Led a conference for 300 people");
    expect(refusalMessage(v)).toMatch(/^This rewrite changed your claim\. It replaced “helped” with “led”, which claims more than your words do\. .*Your original bullet is still in place\.$/);
  });
});

describe("adding the person's own number", () => {
  it("passes when the detail is in, as given, and nothing else changed", () => {
    expect(checkMerge("Trained volunteers to handle paper safely", "about 40 volunteers", "Trained about 40 volunteers to handle paper safely").ok).toBe(true);
  });

  it("refuses when the estimate became exact", () => {
    const v = checkMerge("Trained volunteers to handle paper safely", "about 40 volunteers", "Trained 40 volunteers to handle paper safely");
    expect(v.problems[0].kind).toBe("estimate");
  });

  it("refuses when the detail was left out, or a different number went in", () => {
    expect(says(checkMerge("Trained volunteers to handle paper safely", "about 40", "Trained volunteers to handle paper safely"))).toEqual(["It left out “40”, the detail you gave."]);
    expect(checkMerge("Trained volunteers to handle paper safely", "about 40", "Trained about 400 volunteers to handle paper safely").ok).toBe(false);
  });

  it("refuses when the original lost something on the way", () => {
    expect(checkMerge("Trained volunteers to handle paper safely", "about 40", "Trained about 40 volunteers").ok).toBe(false);
  });
});

describe("a profile says only what the CV says", () => {
  const cv = ["Archive assistant", "Paper Kite Archive", "Catalogued 3,200 maps in two years", "Wrote the handling guide now used by 40 volunteers", "Cataloguing", "paper handling", "volunteer induction"];

  it("passes a profile built from the CV, with years worked out from its dates", () => {
    const text = "Archive assistant with 4 years’ experience, most recently at Paper Kite Archive. Skilled in cataloguing, paper handling and volunteer induction. Catalogued 3,200 maps in two years.";
    expect(checkProfile(text, cv, { years: 4 }).ok).toBe(true);
  });

  it("refuses years of experience the dates do not give", () => {
    const text = "Archive assistant with 10 years’ experience at Paper Kite Archive.";
    expect(says(checkProfile(text, cv, { years: 4 }))).toEqual(["It added “10”, which isn’t in your CV."]);
  });

  it("refuses a claim the CV does not make", () => {
    const text = "Award-winning archive assistant at Paper Kite Archive.";
    expect(checkProfile(text, cv).ok).toBe(false);
  });

  it("refuses “I”", () => {
    const v = checkProfile("I catalogued 3,200 maps in two years at Paper Kite Archive.", cv);
    expect(v.problems.map((p) => p.kind)).toEqual(["first-person"]);
  });

  it("refuses a profile that runs on", () => {
    const text = Array.from({ length: 6 }, () => "Catalogued 3,200 maps in two years.").join(" ");
    expect(checkProfile(text, cv).problems.map((p) => p.kind)).toEqual(["length"]);
  });
});

describe("a profile keeps each figure with what it counted", () => {
  const lines = ["Catalogued 1,200 objects in the collections database", "Trained 4 volunteers in object handling"];

  it("refuses figures swapped between two lines of the CV", () => {
    const v = checkProfile("Collections volunteer who trained 1,200 volunteers and catalogued 4 collections.", ["Collections volunteer", ...lines]);
    expect(v.ok).toBe(false);
    expect(says(v).join(" ")).toContain("It says “1,200 volunteers”. In your CV, “1,200” is about something else.");
  });

  it("accepts them where they belong, and the years worked out from the dates", () => {
    expect(checkProfile("Collections volunteer who catalogued 1,200 objects and trained 4 volunteers.", ["Collections volunteer", ...lines]).ok).toBe(true);
    // "4 years" is vouched for by the dates, even though "4" is also on the CV about volunteers.
    expect(checkProfile("Collections volunteer with 4 years’ experience.", ["Collections volunteer", ...lines], { years: 4 }).ok).toBe(true);
  });
});
