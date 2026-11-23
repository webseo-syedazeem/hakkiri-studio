import { describe, expect, it } from "vitest";
import { type Entry, type EntrySection, type ListSection, type Section, type SkillsSection, type SummarySection, cvStrings } from "../schema";
import { splitSubject } from "./entries";
import { linesFromText, makeLine } from "./lines";
import { parseCv, whereKey } from "./parse";

const read = (text: string) => parseCv(linesFromText(text));
const section = <T extends Section>(r: { sections: Section[] }, kind: string) => r.sections.find((s) => s.kind === kind) as T;
const roles = (r: { sections: Section[] }, kind = "experience") => section<EntrySection>(r, kind).entries;
const brief = (e: Entry) => `${e.title} | ${e.org} | ${e.location} | ${e.start}→${e.current ? "now" : e.end}`;
const HEAD = "Jo Bloggs\njo@example.com\n";

describe("contact details", () => {
  it("sorts the top lines into name, email, phone, town and links", () => {
    const r = read("Maya Chen\nLeeds, UK | maya.chen@example.com | 07700 900456 | https://www.linkedin.com/in/maya-chen/ | github.com/mayac\nEXPERIENCE\nAnalyst, Acme Ltd, 2019 – 2021");
    expect(r.contact).toEqual({ fullName: "Maya Chen", email: "maya.chen@example.com", phone: "07700 900456", location: "Leeds, UK", links: ["linkedin.com/in/maya-chen", "github.com/mayac"] });
    expect(r.flags).toEqual([]);
  });

  it("reads labelled details and US formats", () => {
    const r = read("Priya Nair\nEmail: priya@example.com\nTel: (415) 555-0132\nLocation: Austin, TX\nLinkedIn: in/priyanair\nSKILLS\nFigma");
    expect(r.contact).toMatchObject({ email: "priya@example.com", phone: "(415) 555-0132", location: "Austin, TX", links: ["linkedin.com/in/priyanair"] });
  });

  it("writes a name in capitals the usual way and asks the person to check it", () => {
    const r = read("MAYA CHEN\nmaya@example.com\nEXPERIENCE\nAnalyst, Acme Ltd, 2019 – 2021");
    expect(r.contact.fullName).toBe("Maya Chen");
    expect(r.flags.map((f) => [f.code, f.at.section, f.at.field])).toContainEqual(["name-caps", "contact", "fullName"]);
  });

  it("keeps only the town from a full address, and says so", () => {
    const r = read("Tom Reilly\n14 Canal Street, Nottingham NG1 7EH\ntom@example.com\nEDUCATION\nBSc Economics, University of Nottingham, 2025");
    expect(r.contact.location).toBe("Nottingham");
    expect(r.omitted.map((o) => o.text)).toContain("14 Canal Street, Nottingham NG1 7EH");
    expect(r.flags.map((f) => f.code)).toContain("address");
    expect(r.unassigned).toEqual([]);
  });

  it.each(["Date of birth: 3 May 2004", "DOB: 03/05/2004", "Nationality: British", "Marital status: single", "National Insurance number: QQ 12 34 56 C", "Age: 29"])("leaves out “%s” and reports it", (line) => {
    const r = read(`Jo Bloggs\njo@example.com\n${line}\nEXPERIENCE\nAnalyst, Acme Ltd, 2019 – 2021`);
    expect(r.omitted.map((o) => o.text)).toEqual([line]);
    expect(cvStrings(r).join(" ")).not.toContain(line.split(": ")[1]);
    expect(r.unassigned).toEqual([]);
  });

  it("says when there is no name or no email", () => {
    const r = read("EXPERIENCE\nAnalyst, Acme Ltd, 2019 – 2021");
    expect(r.flags.map((f) => f.code).sort()).toEqual(["no-email", "no-name"]);
  });

  it("does not take a job title, a place or a heading for the name", () => {
    expect(read("Senior Analyst\nJo Bloggs\njo@example.com").contact.fullName).toBe("Jo Bloggs");
    expect(read("Curriculum Vitae\nJo Bloggs\njo@example.com").contact.fullName).toBe("Jo Bloggs");
    expect(read("London\nJo Bloggs\njo@example.com").contact.fullName).toBe("Jo Bloggs");
  });

  it("prefers the largest text for the name", () => {
    const r = parseCv([makeLine("Curriculum Example", { size: 10 }), makeLine("Zoë van der Berg", { size: 22 }), makeLine("zoe@example.com", { size: 10 })]);
    expect(r.contact.fullName).toBe("Zoë van der Berg");
  });

  it("takes a profile written above the first heading", () => {
    const r = read(`${HEAD}Operations coordinator with eight years in freight, running depots of up to forty drivers across the central belt.\nEXPERIENCE\nAnalyst, Acme Ltd, 2019 – 2021`);
    expect(section<SummarySection>(r, "summary").text).toMatch(/^Operations coordinator/);
  });

  it("reads contact details under a “Contact” heading too", () => {
    const r = read("Jo Bloggs\nPROFILE\nAnalyst with five years of experience in retail banking and a liking for tidy spreadsheets.\nCONTACT\njo@example.com\n07700 900111\nYork");
    expect(r.contact).toMatchObject({ fullName: "Jo Bloggs", email: "jo@example.com", phone: "07700 900111", location: "York" });
  });
});

describe("roles", () => {
  it.each([
    ["Analyst, Acme Ltd, Leeds\tMar 2019 – Jun 2021", "Analyst | Acme Ltd | Leeds | 2019-03→2021-06"],
    ["Analyst | Acme Ltd | Leeds | Mar 2019 – Jun 2021", "Analyst | Acme Ltd | Leeds | 2019-03→2021-06"],
    ["Analyst at Acme Ltd (2019 – 2021)", "Analyst | Acme Ltd |  | 2019→2021"],
    ["Acme Ltd — Senior Analyst\t2019 – Present", "Senior Analyst | Acme Ltd |  | 2019→now"],
    ["Acme Ltd\nSenior Analyst\nMar 2019 – Present\nLeeds", "Senior Analyst | Acme Ltd | Leeds | 2019-03→now"],
    ["Senior Analyst\nAcme Ltd, Leeds\n03/2019 – 06/2021", "Senior Analyst | Acme Ltd | Leeds | 2019-03→2021-06"],
    ["Mar 2019 – Jun 2021\tSenior Analyst, Acme Ltd", "Senior Analyst | Acme Ltd |  | 2019-03→2021-06"],
    ["Software Engineer, Parcelwise Software, Bristol, 2019 – 2021", "Software Engineer | Parcelwise Software | Bristol | 2019→2021"],
    ["Head of Finance, Riverside Housing Association\tJanuary 2020 – to date", "Head of Finance | Riverside Housing Association |  | 2020-01→now"],
    ["Teaching Assistant · St Mary’s Primary School · Sept 2018 – July 2020", "Teaching Assistant | St Mary's Primary School |  | 2018-09→2020-07"],
  ])("reads the heading “%s”", (header, expected) => {
    const r = read(`${HEAD}EXPERIENCE\n${header}\n• Did the first thing\n• Did the second thing`);
    const [e] = roles(r);
    expect(brief(e)).toBe(expected);
    expect(e.bullets.map((b) => b.text)).toEqual(["Did the first thing", "Did the second thing"]);
    expect(r.unassigned).toEqual([]);
  });

  it("keeps several roles apart, in the order written", () => {
    const r = read(`${HEAD}EXPERIENCE\nManager, Acme Ltd\t2021 – Present\n• Ran the team\nAnalyst, Beta plc\t2018 – 2021\n• Built the reports\n• Trained two juniors\nIntern, Gamma Group\t2017 – 2018`);
    expect(roles(r).map(brief)).toEqual(["Manager | Acme Ltd |  | 2021→now", "Analyst | Beta plc |  | 2018→2021", "Intern | Gamma Group |  | 2017→2018"]);
    expect(roles(r).map((e) => e.bullets.length)).toEqual([1, 2, 0]);
  });

  it("carries an employer down to later roles at the same place, and asks the person to check", () => {
    const r = read(`${HEAD}EXPERIENCE\nParcelwise Ltd\nSenior Engineer\nJan 2020 – Present\n• Lead five engineers\nEngineer\nMar 2017 – Dec 2019\n• Built the tracking page`);
    expect(roles(r).map(brief)).toEqual(["Senior Engineer | Parcelwise Ltd |  | 2020-01→now", "Engineer | Parcelwise Ltd |  | 2017-03→2019-12"]);
    expect(r.flags.map((f) => f.code)).toEqual(["employer-carried"]);
  });

  it("reads an employer banner with its total dates above the roles held there", () => {
    const r = read(`${HEAD}EXPERIENCE\nKestrel Sportswear\t2016 – 2021\nSenior Analyst\t2018 – 2021\n• Built the forecast\nAnalyst\t2016 – 2018\n• Ran the weekly report`);
    expect(roles(r).map(brief)).toEqual(["Senior Analyst | Kestrel Sportswear |  | 2018→2021", "Analyst | Kestrel Sportswear |  | 2016→2018"]);
  });

  it("asks which is the title and which the employer when neither gives a clue", () => {
    const r = read(`${HEAD}EXPERIENCE\nBluebird, Kingfisher\t2019 – 2021\n• Did the thing`);
    expect(brief(roles(r)[0])).toBe("Bluebird | Kingfisher |  | 2019→2021");
    expect(r.flags.map((f) => [f.code, f.at.field])).toEqual([["title-or-employer", "title"]]);
  });

  it("settles an unclear pair the way the rest of the file is laid out", () => {
    const r = read(`${HEAD}EXPERIENCE\nAcme Ltd, Senior Analyst\t2021 – Present\nBeta plc, Analyst\t2019 – 2021\nKingfisher, Bluebird\t2017 – 2019`);
    expect(brief(roles(r)[2])).toBe("Bluebird | Kingfisher |  | 2017→2019");
  });

  it("flags a role with no dates, no title or no employer", () => {
    const r = read(`${HEAD}EXPERIENCE\nSenior Analyst\n• Did the thing`);
    expect(r.flags.map((f) => f.code).sort()).toEqual(["no-dates", "no-employer"]);
    const r2 = read(`${HEAD}EXPERIENCE\nAcme Holdings Ltd\t2019 – 2021\n• Did the thing`);
    expect(r2.flags.map((f) => f.code)).toEqual(["no-title"]);
  });

  it("splits a paragraph of description into bullets and says so", () => {
    const r = read(`${HEAD}EXPERIENCE\nSales Assistant, Hartley’s Books\tJune 2023 – Present\nI work weekends on the shop floor and the till. I trained four new starters on the stock system.`);
    expect(roles(r)[0].bullets.map((b) => b.text)).toEqual(["I work weekends on the shop floor and the till.", "I trained four new starters on the stock system."]);
    expect(r.flags.map((f) => f.code)).toEqual(["paragraph"]);
  });

  it("joins a wrapped bullet line back to its bullet", () => {
    const r = read(`${HEAD}EXPERIENCE\nAnalyst, Acme Ltd\t2019 – 2021\n• Cut monthly reporting time from three days\nto four hours by automating it\n• Second bullet`);
    expect(roles(r)[0].bullets.map((b) => b.text)).toEqual(["Cut monthly reporting time from three days to four hours by automating it", "Second bullet"]);
  });

  it("a year inside a bullet or a sentence does not start a new role", () => {
    const r = read(`${HEAD}EXPERIENCE\nAnalyst, Acme Ltd\t2019 – 2021\n• Won the 2020 team award for the billing project\nIn 2021 I moved the reporting to a new system and trained the team on it.`);
    expect(roles(r)).toHaveLength(1);
    expect(roles(r)[0].bullets).toHaveLength(2);
  });

  it("marks a season as a date to check, keeping only the year", () => {
    const r = read(`${HEAD}EXPERIENCE\nSummer Intern, Trent Valley Council\tSummer 2024\n• Analysed bus passenger numbers`);
    expect(roles(r)[0]).toMatchObject({ start: "2024", end: "2024" });
    expect(r.flags.map((f) => f.code)).toEqual(["approx-date"]);
  });

  it("keeps every bullet as the person wrote it: numbers, currency, accents and all", () => {
    const bullets = ["Grew revenue from £1.2m to £1.9m (58%) in 18 months", "Négocié un contrat de 40 000 € avec Société Générale", "Cut p95 latency 420ms → 180ms; error rate 0.4% → 0.1%", "Managed a team of 12 across London & Kraków"];
    const r = read(`${HEAD}EXPERIENCE\nAnalyst, Acme Ltd\t2019 – 2021\n${bullets.map((b) => `• ${b}`).join("\n")}`);
    expect(roles(r)[0].bullets.map((b) => b.text)).toEqual(bullets);
  });

  it("remembers which line of the file each field and bullet came from", () => {
    const r = read(`${HEAD}EXPERIENCE\nAnalyst, Acme Ltd\t2019 – 2021\n• First\n• Second`);
    const exp = section<EntrySection>(r, "experience");
    const e = exp.entries[0];
    expect(r.lines[3].text).toContain("Analyst, Acme Ltd");
    expect(r.where[whereKey(exp.id, e.id, "title")]).toEqual([3]);
    expect(r.where[whereKey(exp.id, e.id, "start")]).toEqual([3]);
    expect(r.where[whereKey(exp.id, e.id, e.bullets[1].id)]).toEqual([5]);
    expect(e.bullets[1]).toMatchObject({ origin: "upload", sources: [{ kind: "upload", lines: [5], text: "Second" }] });
    expect(r.where[whereKey("contact", "", "email")]).toEqual([1]);
  });
});

describe("education", () => {
  const edu = (r: { sections: Section[] }) => roles(r, "education").map((e) => `${e.title} | ${e.subject} | ${e.org} | ${e.start}→${e.end} | ${e.grade}`);

  it.each([
    ["BSc Economics, University of Leeds, 2020", "BSc | Economics | University of Leeds | →2020 | "],
    ["BA (Hons) Marketing, 2:1 – University of Leeds\t2013 – 2016", "BA (Hons) | Marketing | University of Leeds | 2013→2016 | 2:1"],
    ["University of Bristol\nBSc Computer Science, First Class Honours\n2012 – 2015", "BSc | Computer Science | University of Bristol | 2012→2015 | First Class Honours"],
    ["2013 – 2017\tB.A. in Cognitive Science, University of California, Berkeley — GPA: 3.8/4.0", "B.A. | Cognitive Science | University of California, Berkeley | 2013→2017 | GPA: 3.8/4.0"],
    ["University of Nottingham\tSeptember 2022 – Expected June 2025\nBSc Economics (predicted 2:1)", "BSc | Economics | University of Nottingham | 2022-09→2025-06 | predicted 2:1"],
    ["A-Levels: Maths (A), Economics (A), Geography (B) – Bilborough Sixth Form College, 2022", "A-Levels |  | Bilborough Sixth Form College | →2022 | Maths (A), Economics (A), Geography (B)"],
    ["MSc Data Science (Distinction), Imperial College London, 2021", "MSc | Data Science | Imperial College London | →2021 | Distinction"],
    ["HND Business, City of Glasgow College, 2017", "HND | Business | City of Glasgow College | →2017 | "],
    ["Master of Business Administration, London Business School, 2019", "Master of Business Administration |  | London Business School | →2019 | "],
    ["10 GCSEs including Maths and English, Parkside School, 2011", " |  | Parkside School | →2011 | 10 GCSEs including Maths and English"],
  ])("reads “%s”", (line, expected) => {
    const r = read(`${HEAD}EDUCATION\n${line}`);
    expect(edu(r)).toEqual([expected]);
  });

  it("keeps two qualifications apart and attaches details to the right one", () => {
    const r = read(`${HEAD}EDUCATION\nMSc Finance, University of Bath, 2020\n• Dissertation on small business lending\nBSc Economics, University of York, 2019\n• Treasurer of the investment society`);
    expect(edu(r)).toEqual(["MSc | Finance | University of Bath | →2020 | ", "BSc | Economics | University of York | →2019 | "]);
    expect(roles(r, "education").map((e) => e.bullets.map((b) => b.text))).toEqual([["Dissertation on small business lending"], ["Treasurer of the investment society"]]);
  });

  it("leaves a qualification whole when it does not split cleanly", () => {
    expect(splitSubject("Master of Science")).toEqual({ title: "Master of Science", subject: "" });
    expect(splitSubject("A-Levels")).toEqual({ title: "A-Levels", subject: "" });
    expect(splitSubject("Bachelor of Arts in History")).toEqual({ title: "Bachelor of Arts", subject: "History" });
    expect(splitSubject("PhD Molecular Biology")).toEqual({ title: "PhD", subject: "Molecular Biology" });
  });

  it("does not mistake “BA” or “ACCA” for grades", () => {
    const r = read(`${HEAD}EDUCATION\nBA History, University of York, 2018\nACCA, BPP University, 2021`);
    expect(roles(r, "education").map((e) => e.grade)).toEqual(["", ""]);
  });
});

describe("skills, languages and interests", () => {
  it("reads named groups and a plain list", () => {
    const r = read(`${HEAD}SKILLS\nPlatforms: Google Ads, Meta Ads Manager\nTools: Looker Studio, Excel\nBudget management, Client reporting`);
    expect(section<SkillsSection>(r, "skills").groups.map((g) => [g.name, g.skills.map((k) => k.name)])).toEqual([
      ["Platforms", ["Google Ads", "Meta Ads Manager"]],
      ["Tools", ["Looker Studio", "Excel"]],
      ["", ["Budget management", "Client reporting"]],
    ]);
  });

  it.each([
    ["SQL, Python, Looker, Excel", ["SQL", "Python", "Looker", "Excel"]],
    ["SQL | Python | Looker", ["SQL", "Python", "Looker"]],
    ["SQL • Python • Looker", ["SQL", "Python", "Looker"]],
    ["SQL; Python; CI/CD; C++; Node.js", ["SQL", "Python", "CI/CD", "C++", "Node.js"]],
    ["Languages (French, Spanish), SQL", ["Languages (French, Spanish)", "SQL"]],
  ])("splits “%s”", (line, expected) => {
    const r = read(`${HEAD}SKILLS\n${line}`);
    expect(section<SkillsSection>(r, "skills").groups.flatMap((g) => g.skills.map((k) => k.name))).toEqual(expected);
  });

  it("reads one skill per line, and bulleted skills", () => {
    const r = read(`${HEAD}SKILLS\n• Stakeholder management\n• Forecasting\nSQL`);
    expect(section<SkillsSection>(r, "skills").groups[0].skills.map((k) => k.name)).toEqual(["Stakeholder management", "Forecasting", "SQL"]);
  });

  it("turns “Technical skills” and “Soft skills” headings into groups", () => {
    const r = read(`${HEAD}TECHNICAL SKILLS\nSQL, Python\nSOFT SKILLS\nNegotiation, Coaching`);
    expect(section<SkillsSection>(r, "skills").groups.map((g) => [g.name, g.skills.length])).toEqual([
      ["TECHNICAL SKILLS", 2],
      ["SOFT SKILLS", 2],
    ]);
  });

  it("flags a sentence sitting in the skills list", () => {
    const r = read(`${HEAD}SKILLS\nSQL, Able to manage several complex projects at the same time under pressure`);
    expect(r.flags.map((f) => f.code)).toEqual(["long-skill"]);
  });

  it("reads languages with their levels and interests as a list", () => {
    const r = read(`${HEAD}LANGUAGES\nEnglish (native), Mandarin (conversational)\nFrench – B1\nSpanish: fluent\nINTERESTS\nFell running, pottery, volunteering at Leeds Parkrun`);
    expect(section<ListSection>(r, "languages").items.map((i) => [i.name, i.level])).toEqual([
      ["English", "native"],
      ["Mandarin", "conversational"],
      ["French", "B1"],
      ["Spanish", "fluent"],
    ]);
    expect(section<ListSection>(r, "interests").items.map((i) => i.name)).toEqual(["Fell running", "pottery", "volunteering at Leeds Parkrun"]);
  });
});

describe("other sections", () => {
  it("reads certificates, awards and courses one per line", () => {
    const r = read(`${HEAD}CERTIFICATIONS\nGoogle Ads Search Certification – Google (2023)\nMeta Certified Media Buying Professional, Meta, 2022\nPRINCE2 Practitioner\nAWARDS\nEmployee of the Year, Acme Ltd, 2022`);
    expect(roles(r, "certificates").map((e) => `${e.title} | ${e.org} | ${e.end}`)).toEqual(["Google Ads Search Certification | Google | 2023", "Meta Certified Media Buying Professional | Meta | 2022", "PRINCE2 Practitioner |  | "]);
    expect(roles(r, "awards").map((e) => `${e.title} | ${e.org} | ${e.end}`)).toEqual(["Employee of the Year | Acme Ltd | 2022"]);
  });

  it("keeps a publication's citation whole", () => {
    const r = read(`${HEAD}PUBLICATIONS\nBloggs, J., Chen, M. (2021). Forecasting demand for outdoor clothing. Journal of Retail, 12(3).`);
    expect(roles(r, "publications")[0]).toMatchObject({ title: "Bloggs, J., Chen, M. (2021). Forecasting demand for outdoor clothing. Journal of Retail, 12(3).", org: "", end: "2021" });
    expect(r.unassigned).toEqual([]);
  });

  it("reads projects with a name, a link and bullets", () => {
    const r = read(`${HEAD}PROJECTS\nBus Times Bot | github.com/jo/bus-bot\t2023\n• Built a bot that texts the next three buses\n• 400 weekly users`);
    const [p] = roles(r, "projects");
    expect(p).toMatchObject({ title: "Bus Times Bot", link: "github.com/jo/bus-bot", start: "2023" });
    expect(p.bullets).toHaveLength(2);
  });

  it("keeps the person's own heading for volunteering-type sections", () => {
    const r = read(`${HEAD}POSITIONS OF RESPONSIBILITY\nTreasurer, Economics Society\t2023 – 2024\n• Managed a budget of £4,000`);
    const v = section<EntrySection>(r, "volunteering");
    expect(v.title).toBe("POSITIONS OF RESPONSIBILITY");
    expect(brief(v.entries[0])).toBe("Treasurer | Economics Society |  | 2023→2024");
  });

  it("leaves out references and says why", () => {
    const r = read(`${HEAD}EXPERIENCE\nAnalyst, Acme Ltd\t2019 – 2021\nREFERENCES\nAvailable on request\nDr A. Smith, a.smith@example.org`);
    expect(r.omitted.map((o) => o.text)).toEqual(["Available on request", "Dr A. Smith, a.smith@example.org"]);
    expect(cvStrings(r).join(" ")).not.toContain("Smith");
    const r2 = read(`${HEAD}INTERESTS\nChess\nReferences available upon request.`);
    expect(r2.omitted.map((o) => o.text)).toEqual(["References available upon request."]);
  });

  it("drops page numbers and the “Curriculum Vitae” banner", () => {
    const r = read(`Curriculum Vitae\n${HEAD}EXPERIENCE\nAnalyst, Acme Ltd\t2019 – 2021\nPage 1 of 2\n• Did the thing\n2`);
    expect(r.unassigned).toEqual([]);
    expect(roles(r)[0].bullets.map((b) => b.text)).toEqual(["Did the thing"]);
  });

  it("always gives the four core sections, empty if the file had none", () => {
    const r = read(`${HEAD}`);
    expect(r.sections.map((s) => s.kind)).toEqual(["summary", "experience", "education", "skills"]);
    expect(roles(r)).toEqual([]);
  });

  it("keeps sections in the order the person had them", () => {
    const r = read(`${HEAD}EDUCATION\nBSc Maths, University of York, 2019\nSKILLS\nSQL\nEXPERIENCE\nAnalyst, Acme Ltd\t2019 – 2021`);
    expect(r.sections.map((s) => s.kind)).toEqual(["summary", "education", "skills", "experience"]);
  });
});

describe("nothing is lost", () => {
  it("text the reader cannot place is returned as unassigned, never dropped", () => {
    const r = read(`${HEAD}Full clean driving licence\nEXPERIENCE\nAnalyst, Acme Ltd\t2019 – 2021`);
    expect(r.unassigned).toEqual([{ line: 2, text: "Full clean driving licence" }]);
  });

  it("reports only the piece of a line that was not placed", () => {
    const r = read("Sam Okafor\nData analyst · London · sam@example.com\nEXPERIENCE\nAnalyst, Acme Ltd\t2019 – 2021");
    expect(r.contact).toMatchObject({ location: "London", email: "sam@example.com" });
    expect(r.unassigned).toEqual([{ line: 1, text: "Data analyst" }]);
  });

  it("with no headings at all, everything but the contact details is unassigned", () => {
    const r = read("Jo Bloggs\njo@example.com\nAnalyst at Acme\nGood with spreadsheets");
    expect(r.contact.fullName).toBe("Jo Bloggs");
    expect(r.unassigned.map((u) => u.text)).toEqual(["Analyst at Acme", "Good with spreadsheets"]);
  });
});
