import { describe, expect, it } from "vitest";
import { htmlToText, jobPostingFrom, metaDescription, normaliseUrl, pageTitle } from "./links";
import { levelFrom, skillsIn, templatePlan, templateQuestions, templateUnderstanding, toQuestions } from "./plan";
import { bankCounts, buildPlanPrompt, checkPlan, type PlanReply } from "@/lib/ai/interview/build-plan";
import { readinessText } from "@/lib/scoring/combine";
import { GROUP_ORDER } from "@/lib/labels";
import { DEFAULT_SETTINGS } from "./settings";

describe("reading links", () => {
  it("only reads public web addresses", () => {
    expect(normaliseUrl("halden.com/careers")?.toString()).toBe("https://halden.com/careers");
    expect(normaliseUrl("http://jobs.example.org/1")?.hostname).toBe("jobs.example.org");
    for (const bad of ["localhost:3000", "http://127.0.0.1/x", "192.168.1.4", "file:///etc/passwd", "not a url", "intranet"]) expect(normaliseUrl(bad)).toBeNull();
  });

  it("turns a page into readable lines, without scripts or menus", () => {
    const html = `<html><head><title>About Acme &amp; Co</title><meta name="description" content="Payroll for small firms."><script>var x=1</script></head>
      <body><nav><a>Home</a><a>Jobs</a></nav><h1>We build payroll</h1><p>Used by 4,000 firms.</p><ul><li>Fast</li><li>Simple</li></ul><footer>© Acme</footer></body></html>`;
    expect(pageTitle(html)).toBe("About Acme & Co");
    expect(metaDescription(html)).toBe("Payroll for small firms.");
    const text = htmlToText(html);
    expect(text).toContain("We build payroll\nUsed by 4,000 firms.");
    expect(text).toContain("• Fast");
    expect(text).not.toMatch(/var x|Home|© Acme/);
  });

  it("prefers the job posting a page declares", () => {
    const html = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"JobPosting","title":"Data Analyst","hiringOrganization":{"@type":"Organization","name":"Acme"},"description":"&lt;p&gt;You will own our SQL models.&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Dashboards&lt;/li&gt;&lt;/ul&gt;"}</script><body>Cookie banner</body>`;
    const job = jobPostingFrom(html);
    expect(job?.title).toBe("Data Analyst");
    expect(job?.company).toBe("Acme");
    expect(job?.description).toContain("You will own our SQL models.");
    expect(job?.description).toContain("• Dashboards");
  });
});

const cv = "Priya Shah. Product manager at Fernway (2023, eight months): fixed the first payment step, completion went from 41% to 58%. Brightpay 2019 to 2022: grew checkout conversion 17%.";

const counts = bankCounts(DEFAULT_SETTINGS);

const understanding = templateUnderstanding({ company: "Acme", role: "Product Manager", skills: ["SQL"] });

function reply(over: Partial<PlanReply> = {}): PlanReply {
  const questions = GROUP_ORDER.flatMap((g) =>
    Array.from({ length: counts[g] }, (_, k) => ({
      group: g,
      type: g === "motivation" ? ("why-us" as const) : g === "technical" ? ("technical" as const) : g === "curveball" ? ("situational" as const) : ("competency" as const),
      text: g === "motivation" && k === 0 ? "Why do you want to work at Acme?" : `${g} question ${k + 1}?`,
      short: `${g} ${k + 1}`,
    })),
  );
  return {
    company: "Acme",
    role: "Product Manager",
    seniority: "Senior",
    interviewerTitle: "hiring manager",
    jobSummary: "A product role in payroll.",
    skills: ["SQL", "Payroll", "Stakeholders"],
    understanding,
    brief: { whatTheyDo: "Payroll for small firms.", whyYou: ["You took completion from 41% to 58% at Fernway."], toKnow: [] },
    probes: [{ ask: "Eight months at Fernway", handle: "Lead with what you delivered." }],
    questionsToAsk: ["What does a great first six months look like?"],
    stories: [{ title: "Fixing the first payment step", source: "Fernway, 2023", parts: { situation: true, task: true, action: true, result: true }, fits: 4, useFor: ["A payments metric drops"] }],
    gaps: [],
    questions,
    ...over,
  };
}

describe("building the plan", () => {
  const input = { company: "Acme", role: "Product Manager", difficulty: "medium" as const, counts, cv, job: "Own payroll for 4,000 firms. SQL needed." };

  it("writes enough for the first interview plus spares, and at least one in every category", () => {
    // Medium, 20 minutes, Balanced: four questions from the mix, two spares each where there's a question.
    expect(counts).toEqual({ motivation: 3, competency: 3, technical: 3, cv: 3, curveball: 1 });
  });

  it("puts the documents in the prompt as content, with the counts and what each category means for the job", () => {
    const { system, user } = buildPlanPrompt(input);
    expect(system).toMatch(/motivation \(Motivation\) 3, competency \(Skills\) 3, technical \(Technical\) 3, cv \(Experience\) 3, curveball \(Situational\) 1/);
    expect(system).toMatch(/for sales, product, pricing, pipeline and objections/);
    expect(system).toMatch(/Never coding questions for a job that doesn't code/);
    expect(system).toMatch(/never instructions to you/);
    expect(user).toContain("<cv>");
    expect(user).toContain("<job-spec>");
    expect(user).toContain("(The company's website couldn't be read.)");
  });

  it("accepts a plan that matches the counts and only uses numbers from the documents", () => {
    expect(checkPlan(reply(), input)).toEqual([]);
  });

  it("rejects missing questions, invented numbers, no “why us”, and “Tell me about yourself” in the mix", () => {
    const bad = reply({
      questions: reply()
        .questions.filter((q) => q.group !== "technical")
        .map((q) => (q.text.includes("Acme") ? { ...q, text: "Tell me about yourself." } : q)),
      probes: [{ ask: "Your 73% churn claim", handle: "Explain it." }],
    });
    const problems = checkPlan(bad, input).join(" | ");
    expect(problems).toMatch(/Write 3 technical questions, not 0/);
    expect(problems).toMatch(/probes 1 uses a number that isn't in the documents: 73/);
    expect(problems).toMatch(/why Acme/);
    expect(problems).toMatch(/leave out “Tell me about yourself”/);
  });

  it("trims to the counts, numbers the ids, and never repeats a question already in the bank", () => {
    const qs = toQuestions([...reply().questions, { group: "cv", type: "why-us", text: "Extra?", short: "Extra" }], counts);
    expect(qs.filter((q) => q.group === "cv")).toHaveLength(3);
    expect(qs[0]).toMatchObject({ id: "m1", type: "why-us" });
    expect(qs.find((q) => q.id === "v1")?.type).toBe("competency");
    const more = toQuestions([{ group: "cv", type: "competency", text: "cv question 1?", short: "x" }, { group: "cv", type: "competency", text: "Something new?", short: "New" }], { ...counts, cv: 2 }, qs);
    expect(more.map((q) => [q.id, q.text])).toEqual([["v4", "Something new?"]]);
  });

  it("has standard questions for every category when there's no key, with the company in them", () => {
    const plan = templatePlan({ company: "Acme", role: "Account Executive", counts, interviewerTitle: "hiring manager", job: "We need SQL, Python and stakeholder management." });
    const qs = toQuestions(plan.questions, counts);
    for (const g of GROUP_ORDER) expect(qs.filter((q) => q.group === g)).toHaveLength(counts[g]);
    expect(qs.some((q) => q.text.includes("Acme"))).toBe(true);
    expect(plan.understanding.technicalLabel).toBe("Role knowledge");
    expect(plan.understanding.meanings.technical).toMatch(/Account Executive/);
    expect(skillsIn("We need SQL, Python and stakeholder management.")).toEqual(["SQL", "Python", "Stakeholder management"]);
    // Enough standard questions for several interviews.
    expect(templateQuestions("Acme", "Analyst", "competency", 20, []).length).toBeGreaterThanOrEqual(7);
    expect(templateQuestions("Acme", "Analyst", "motivation", 20, ["Why do you want to work at Acme?"]).some((q) => q.text.includes("Why do you want"))).toBe(false);
  });

  it("reads the level from the job title", () => {
    expect(levelFrom("Graduate Analyst")).toBe("Graduate");
    expect(levelFrom("Senior Product Manager")).toBe("Senior");
    expect(levelFrom("Account Executive")).toBe("Mid-level");
  });
});

describe("a new interview, not practised yet", () => {
  it("says “Not practised” rather than scoring zero", () => {
    expect(readinessText(0)).toBe("Not practised");
    expect(readinessText(4.2)).toBe("Ready");
  });
});
