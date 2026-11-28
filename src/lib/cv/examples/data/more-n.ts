import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** Phase 3, batch 2 (28 Nov 2026): the last nine listed roles, and 21 roles added to the industry packs. */
export const MORE_N: ExampleSpec[] = [
  {
    id: "underwriter",
    industry: "banking",
    role: "Underwriter",
    level: "experienced",
    template: "ledger",
    blurb: {
      uk: "A commercial insurance underwriter with 9 years in insurance, writing property, liability and motor fleet cover and keeping a £14 million book below its loss ratio target.",
      us: "A commercial insurance underwriter with 9 years in insurance, writing property, general liability and commercial auto coverage and keeping an $18 million book below its loss ratio target.",
    },
    person: { name: "Ffion Llewellyn", email: "ffion.llewellyn@example.com", phone: { uk: "07700 900684", us: "(505) 555-0107" }, location: { uk: "Norwich", us: "Albuquerque, NM" } },
    profile: {
      uk: "Commercial underwriter with 9 years in insurance, the last 4 writing property, liability and motor fleet cover for firms with up to 250 staff. Assesses around 35 new business and renewal cases a week within a £250,000 premium mandate, quoting 90% of broker submissions within 2 working days. Kept the loss ratio on a £14 million book of 1,100 policies at 52% in 2025, against a target of 58%. Holds the Diploma in Insurance from the Chartered Insurance Institute (CII).",
      us: "Commercial underwriter with 9 years in insurance, the last 4 writing property, general liability and commercial auto coverage for businesses with up to 250 employees. Assesses around 35 new business and renewal submissions a week within $300,000 of premium authority, quoting 90% of agent submissions within 2 business days. Kept the loss ratio on an $18 million book of 1,100 policies at 52% in 2025, against a target of 58%. Holds the Chartered Property Casualty Underwriter (CPCU) designation and the Associate in Commercial Underwriting (AU).",
    },
    experience: [
      {
        title: "Commercial Underwriter",
        org: "Saltgate Insurance",
        location: { uk: "Norwich", us: "Albuquerque, NM" },
        start: "2022-04",
        current: true,
        bullets: [
          {
            uk: "Assess around 35 new business and renewal cases a week for property, liability and motor fleet cover, within a £250,000 premium mandate",
            us: "Assess around 35 new business and renewal submissions a week for property, general liability and commercial auto coverage, within $300,000 of premium authority",
          },
          {
            uk: "Kept the loss ratio on a £14 million book of 1,100 policies at 52% in 2025, against a target of 58%, by declining poorly managed risks and adding fire safety conditions",
            us: "Kept the loss ratio on an $18 million book of 1,100 policies at 52% in 2025, against a target of 58%, by declining poorly managed risks and adding fire safety conditions",
          },
          {
            uk: "Quote 90% of broker submissions within 2 working days, against a service standard of 3 days",
            us: "Quote 90% of agent submissions within 2 business days, against a service standard of 3 days",
          },
          {
            uk: "Refer around 6 cases a month beyond the mandate to the underwriting manager, each with a written risk summary and proposed terms",
            us: "Refer around 6 submissions a month beyond the authority limit to the underwriting manager, each with a written risk summary and proposed terms",
          },
          {
            uk: "Visit around 20 brokers and client sites a year, including risk surveys of factories and warehouses with the company's risk engineer",
            us: "Visit around 20 agencies and client sites a year, including risk surveys of factories and warehouses with the company's risk engineer",
          },
          "Scored 98% accuracy across 4 quarterly audits of 40 files each in 2025, against a team average of 93%",
        ],
      },
      {
        title: { uk: "Underwriter, Small Business", us: "Underwriter, Small Commercial" },
        org: "Norvic Mutual",
        location: { uk: "Ipswich", us: "Santa Fe, NM" },
        start: "2019-09",
        end: "2022-03",
        bullets: [
          {
            uk: "Underwrote around 50 renewals and new business cases a week for shops, offices and trades within a £50,000 premium mandate",
            us: "Underwrote around 50 renewals and new business submissions a week for retail stores, offices and contractors within $60,000 of premium authority",
          },
          {
            uk: "Raised renewal retention on the trades book from 81% to 87% in 2 years by calling brokers 45 days before each renewal",
            us: "Raised renewal retention on the contractors book from 81% to 87% in 2 years by calling agents 45 days before each renewal",
          },
          {
            uk: "Wrote a submission checklist for brokers, cutting cases returned for missing information from 22% to 9% in a year",
            us: "Wrote a submission checklist for agents, cutting submissions returned for missing information from 22% to 9% in a year",
          },
          "Trained 4 new underwriting assistants on the rating system and referral rules",
        ],
      },
      {
        title: "Underwriting Assistant",
        org: "Norvic Mutual",
        location: { uk: "Ipswich", us: "Santa Fe, NM" },
        start: "2017-09",
        end: "2019-08",
        bullets: [
          {
            uk: "Checked around 80 broker submissions a week for claims history, sums insured and trade details before they reached the underwriters",
            us: "Checked around 80 agent submissions a week for loss runs, property values and business details before they reached the underwriters",
          },
          "Issued around 120 policy documents and renewal invitations a week, with an error rate below 1% in quarterly checks",
          "Built a tracker for renewals due in the next 90 days, used by 6 underwriters to plan their week",
          {
            uk: "Answered around 30 broker calls a day on policy changes and mid-term adjustments",
            us: "Answered around 30 agent calls a day on policy changes and endorsements",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Economics", us: "Bachelor of Business Administration in Finance" },
        org: { uk: "University of East Anglia", us: "University of New Mexico" },
        end: "2017",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Diploma in Insurance (Dip CII)", us: "Chartered Property Casualty Underwriter (CPCU)" },
        org: { uk: "Chartered Insurance Institute", us: "The Institutes" },
        end: "2022",
      },
      {
        title: { uk: "Certificate in Insurance (Cert CII)", us: "Associate in Commercial Underwriting (AU)" },
        org: { uk: "Chartered Insurance Institute", us: "The Institutes" },
        end: "2019",
      },
    ],
    skills: [
      "Commercial property",
      { uk: "Liability cover", us: "General liability" },
      { uk: "Motor fleet", us: "Commercial auto" },
      "Risk surveys",
      "Loss ratios",
      { uk: "Premium mandates", us: "Premium authority" },
      "Referral rules",
      "Renewal retention",
      "File audits",
      "Policy documents",
    ],
    names: ["Ffion", "Llewellyn", "Saltgate", "Norvic", "Ambleford", "Anglia", "Albuquerque", "Ipswich"],
    letter: {
      job: {
        title: "Commercial Lines Underwriter",
        employer: "Ambleford Insurance",
        advert: {
          uk: `Commercial Lines Underwriter
Ambleford Insurance, Norwich (hybrid)

Ambleford Insurance is a regional insurer covering 9,000 small and mid-sized businesses through 300 broker partners across the East of England.

The role
You will underwrite new business and renewals for commercial property, liability and motor fleet, within your own mandate and in close contact with brokers.

What we are looking for
- At least 3 years underwriting commercial lines
- A record of managing a profitable book
- Quick, accurate quotes for brokers
- Clear referrals and risk notes
- Cert CII, with the Diploma desirable

Salary £42,000 to £50,000, plus bonus`,
          us: `Commercial Lines Underwriter
Ambleford Insurance, Albuquerque, NM (hybrid)

Ambleford Insurance is a regional insurer covering 9,000 small and mid-sized businesses through 300 independent agencies across New Mexico, Arizona and Colorado.

The role
You will underwrite new business and renewals for commercial property, general liability and commercial auto, within your own authority and in close contact with agents.

What we are looking for
- At least 3 years underwriting commercial lines
- A record of managing a profitable book
- Quick, accurate quotes for agents
- Clear referrals and risk notes
- The CPCU designation, or progress towards it

Salary $78,000 to $92,000, plus bonus`,
        },
      },
      reason: {
        uk: "I want to underwrite larger commercial risks for a regional insurer that works closely with brokers.",
        us: "I want to underwrite larger commercial risks for a regional insurer that works closely with agents.",
      },
      paragraphs: [
        {
          uk: "I read with interest that Ambleford Insurance needs a Commercial Lines Underwriter. I want to underwrite larger commercial risks for a regional insurer that works closely with brokers.",
          us: "I read with interest that Ambleford Insurance needs a Commercial Lines Underwriter. I want to underwrite larger commercial risks for a regional insurer that works closely with agents.",
        },
        {
          uk: "At Saltgate Insurance I assess around 35 new business and renewal cases a week for property, liability and motor fleet cover, within a £250,000 premium mandate. Your advert asks for a record of managing a profitable book. In 2025 I kept the loss ratio on a £14 million book of 1,100 policies at 52%, against a target of 58%, by declining poorly managed risks and adding fire safety conditions.",
          us: "At Saltgate Insurance I assess around 35 new business and renewal submissions a week for property, general liability and commercial auto coverage, within $300,000 of premium authority. Your advert asks for a record of managing a profitable book. In 2025 I kept the loss ratio on an $18 million book of 1,100 policies at 52%, against a target of 58%, by declining poorly managed risks and adding fire safety conditions.",
        },
        {
          uk: "You are also looking for quick, accurate quotes for brokers. I quote 90% of broker submissions within 2 working days, against a service standard of 3 days. In 2025 I scored 98% accuracy across 4 quarterly audits of 40 files each, against a team average of 93%. I also refer around 6 cases a month beyond the mandate to the underwriting manager, each with a written risk summary and proposed terms.",
          us: "You are also looking for quick, accurate quotes for agents. I quote 90% of agent submissions within 2 business days, against a service standard of 3 days. In 2025 I scored 98% accuracy across 4 quarterly audits of 40 files each, against a team average of 93%. I also refer around 6 submissions a month beyond the authority limit to the underwriting manager, each with a written risk summary and proposed terms.",
        },
        {
          uk: "At Norvic Mutual I raised renewal retention on the trades book from 81% to 87% in 2 years by calling brokers 45 days before each renewal. I hold the Diploma in Insurance from the Chartered Insurance Institute (CII).",
          us: "At Norvic Mutual I raised renewal retention on the contractors book from 81% to 87% in 2 years by calling agents 45 days before each renewal. I hold the Chartered Property Casualty Underwriter (CPCU) designation and the Associate in Commercial Underwriting (AU).",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "clinical-research-associate",
    industry: "science",
    role: "Clinical Research Associate",
    level: "experienced",
    template: "research",
    blurb: "A clinical research associate who monitors 9 hospital sites on 2 phase III trials, after starting as a trials coordinator in a hospital research unit.",
    person: { name: "Chiara Benedetti", email: "chiara.benedetti@example.com", phone: { uk: "07700 900685", us: "(719) 555-0108" }, location: { uk: "Reading", us: "Colorado Springs, CO" } },
    profile: {
      uk: "Clinical research associate with 8 years in clinical trials, the last 4 monitoring hospital sites for a contract research organisation. Monitors 9 sites on 2 phase III trials in heart failure and type 2 diabetes, completing source data verification for around 400 patient visits a quarter. Cut the average time to resolve data queries across those sites from 14 days to 6 in 2024. Trained in Good Clinical Practice (GCP), with no major findings at 2 sponsor audits in 2025.",
      us: "Clinical research associate with 8 years in clinical trials, the last 4 monitoring hospital sites for a contract research organization. Monitors 9 sites on 2 phase III trials in heart failure and type 2 diabetes, completing source data verification for around 400 patient visits a quarter. Cut the average time to resolve data queries across those sites from 14 days to 6 in 2024. Holds the Certified Clinical Research Associate (CCRA) credential and current Good Clinical Practice (GCP) training.",
    },
    experience: [
      {
        title: "Clinical Research Associate II",
        org: "Larchmont Clinical Research",
        location: { uk: "Reading", us: "Colorado Springs, CO" },
        start: "2022-05",
        current: true,
        bullets: [
          "Monitor 9 hospital sites on 2 phase III trials in heart failure and type 2 diabetes, carrying out around 8 on-site and remote monitoring visits a month",
          "Complete source data verification for around 400 patient visits a quarter against the electronic case report forms, raising queries in Medidata Rave",
          "Cut the average time to resolve data queries across 9 sites from 14 days to 6 in 2024 by setting up a weekly call with each site's study coordinator",
          "Opened 3 new sites in 2025, each recruiting its first patient within 10 weeks of the site initiation visit, against a study target of 12 weeks",
          "Recorded 14 protocol deviations in 2025 and agreed a corrective action plan for each with the principal investigator",
          "Review the investigator site file at every visit, with no major findings at 2 sponsor audits in 2025",
        ],
      },
      {
        title: "Clinical Trial Assistant",
        org: "Larchmont Clinical Research",
        location: { uk: "Reading", us: "Colorado Springs, CO" },
        start: "2020-02",
        end: "2022-04",
        bullets: [
          {
            uk: "Kept the trial master file for 3 studies across 22 sites, filing 97% of documents within 5 working days of receipt",
            us: "Kept the trial master file for 3 studies across 22 sites, filing 97% of documents within 5 business days of receipt",
          },
          {
            uk: "Tracked ethics and regulatory approvals for 22 sites, sending a weekly status report to the project manager",
            us: "Tracked ethics board and regulatory approvals for 22 sites, sending a weekly status report to the project manager",
          },
          "Prepared and shipped start-up packs and investigator site files for 12 new sites",
          "Joined senior monitors on 15 site visits before taking on 3 sites in 2022",
        ],
      },
      {
        title: { uk: "Clinical Trials Coordinator", us: "Clinical Research Coordinator" },
        org: { uk: "Wexley Hospitals NHS Foundation Trust", us: "Wexley Medical Center" },
        location: { uk: "Basingstoke", us: "Pueblo, CO" },
        start: "2018-09",
        end: "2020-01",
        bullets: [
          "Screened around 60 patients a month for 5 cardiology trials, recruiting 74 patients in 16 months",
          "Entered trial data into case report forms within 3 days of each visit, with a query rate below 2%",
          "Booked study visits, samples and scans for around 90 trial patients, with 95% of visits held within the protocol window",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Biomedical Science", us: "Bachelor of Science in Biomedical Sciences" },
        org: { uk: "University of Reading", us: "Colorado State University" },
        end: "2018",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: "Good Clinical Practice",
        org: { uk: "National Institute for Health and Care Research", us: "CITI Program" },
        end: "2025",
      },
      {
        title: { uk: "Associate Member", us: "Certified Clinical Research Associate (CCRA)" },
        org: { uk: "Institute of Clinical Research", us: "Association of Clinical Research Professionals" },
        end: "2024",
      },
    ],
    skills: [
      "Site monitoring",
      "Source data verification",
      "Data queries",
      "Good Clinical Practice",
      "Protocol deviations",
      "Investigator site files",
      "Trial master files",
      "Medidata Rave",
      "Site initiation visits",
      "Patient screening",
    ],
    names: ["Chiara", "Benedetti", "Larchmont", "Wexley", "Quarrington", "Medidata", "Basingstoke", "Pueblo", "CITI"],
    letter: {
      job: {
        title: "Clinical Research Associate",
        employer: "Quarrington Clinical",
        advert: {
          uk: `Clinical Research Associate
Quarrington Clinical, home-based (south of England)

Quarrington Clinical is a contract research organisation running phase II and III trials in cardiology, diabetes and respiratory medicine for 30 sponsors.

The role
You will monitor 8 to 10 hospital sites across the south of England, from site initiation to close-out.

What we are looking for
- At least 2 years of independent site monitoring
- Strong knowledge of Good Clinical Practice
- Experience of source data verification and query resolution
- Experience with electronic data capture systems such as Medidata Rave
- A degree in a life sciences subject
- Willingness to travel to sites around 8 days a month

Salary £40,000 to £46,000, plus a car allowance`,
          us: `Clinical Research Associate
Quarrington Clinical, Colorado Springs, CO (home-based)

Quarrington Clinical is a contract research organization running phase II and III trials in cardiology, diabetes and respiratory medicine for 30 sponsors.

The role
You will monitor 8 to 10 hospital sites across Colorado, Utah and New Mexico, from site initiation to close-out.

What we are looking for
- At least 2 years of independent site monitoring
- Strong knowledge of Good Clinical Practice
- Experience of source data verification and query resolution
- Experience with electronic data capture systems such as Medidata Rave
- A bachelor's degree in a life sciences field
- CCRA certification preferred

Salary $82,000 to $95,000, plus a car allowance`,
        },
      },
      reason: "I want to keep monitoring cardiology and diabetes trials, with a smaller group of sites that I can get to know well.",
      paragraphs: [
        "I noticed your advert for a Clinical Research Associate at Quarrington Clinical and would like to apply. I want to keep monitoring cardiology and diabetes trials, with a smaller group of sites that I can get to know well.",
        "At Larchmont Clinical Research I monitor 9 hospital sites on 2 phase III trials in heart failure and type 2 diabetes, carrying out around 8 on-site and remote monitoring visits a month. Your advert asks for experience of source data verification and query resolution. I complete source data verification for around 400 patient visits a quarter against the electronic case report forms, raising queries in Medidata Rave. In 2024 I cut the average time to resolve data queries across 9 sites from 14 days to 6 by setting up a weekly call with each site's study coordinator.",
        "You are also looking for strong knowledge of Good Clinical Practice. I review the investigator site file at every visit, with no major findings at 2 sponsor audits in 2025. That year I also recorded 14 protocol deviations and agreed a corrective action plan for each with the principal investigator.",
        {
          uk: "I opened 3 new sites in 2025, each recruiting its first patient within 10 weeks of the site initiation visit, against a study target of 12 weeks. I studied Biomedical Science at the University of Reading, and I am trained in Good Clinical Practice (GCP).",
          us: "I opened 3 new sites in 2025, each recruiting its first patient within 10 weeks of the site initiation visit, against a study target of 12 weeks. I studied biomedical sciences at Colorado State University, and I hold the Certified Clinical Research Associate (CCRA) credential.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "video-editor",
    industry: "design",
    role: "Video Editor",
    level: "early",
    template: "portfolio",
    blurb: "A video editor two years into cutting YouTube videos and social edits for brand clients, who raised watch time on a cooking channel by over a third.",
    person: {
      name: "Joel Amankwah",
      email: "joel.amankwah@example.com",
      phone: { uk: "07700 900686", us: "(316) 555-0109" },
      location: { uk: "Bristol", us: "Wichita, KS" },
      links: ["portfolio.example.com/joelamankwah"],
    },
    profile: "Video editor with 2 years at a content studio, cutting YouTube videos and social media edits for 5 brand clients in Premiere Pro, After Effects and DaVinci Resolve. Edits around 6 videos a week, from 30-second clips to 20-minute videos, and delivers 90% of short social edits within 24 hours. Raised average watch time on a client's cooking channel from 4.1 to 5.6 minutes a view in 6 months.",
    experience: [
      {
        title: "Video Editor",
        org: "Brightreel Media",
        location: { uk: "Bristol", us: "Wichita, KS" },
        start: "2024-09",
        current: true,
        bullets: [
          "Edit around 6 videos a week for 5 brand clients' YouTube channels and social media accounts, from 30-second clips to 20-minute videos, in Premiere Pro",
          "Raised average watch time on a client's cooking channel from 4.1 to 5.6 minutes a view in 6 months by cutting slower openings and adding chapters",
          "Edited a 12-part series for a fitness brand that reached 2.4 million views across YouTube and Instagram in 3 months",
          "Built 8 motion graphics templates in After Effects for titles, captions and lower thirds, cutting finishing time by around an hour a video",
          "Colour grade and mix audio for around 3 longer videos a week in DaVinci Resolve, matching footage from up to 4 cameras",
          "Deliver 90% of short social edits within 24 hours of receiving footage",
        ],
      },
      {
        title: "Junior Video Editor",
        org: "Tallowmere Post Production",
        location: { uk: "Bath", us: "Hutchinson, KS" },
        start: "2023-07",
        end: "2024-08",
        bullets: [
          {
            uk: "Logged and synced rushes from around 4 shoots a week for 3 senior editors",
            us: "Logged and synced footage from around 4 shoots a week for 3 senior editors",
          },
          "Assembled rough cuts for 20 corporate and charity films in Premiere Pro before each senior editor's review",
          "Exported and checked around 30 versions a week for web, social media and broadcast, with captions and subtitles",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Film Production", us: "Bachelor of Arts in Media Arts" },
        org: { uk: "University of the West of England", us: "Wichita State University" },
        end: "2023",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    skills: [
      "Premiere Pro",
      "After Effects",
      "DaVinci Resolve",
      "YouTube",
      "Social media edits",
      "Motion graphics",
      "Colour grading",
      "Audio mixing",
      "Watch time",
      "Rough cuts",
    ],
    names: ["Joel", "Amankwah", "Brightreel", "Tallowmere", "Moonpenny", "DaVinci", "YouTube", "Instagram", "Wichita", "Hutchinson"],
    letter: {
      job: {
        title: "Video Editor (YouTube and Social)",
        employer: "Moonpenny Studios",
        advert: {
          uk: `Video Editor (YouTube and Social)
Moonpenny Studios, Bristol

Moonpenny Studios makes YouTube series and social content for 12 food, travel and lifestyle brands.

The role
You will join a team of 4 editors, cutting long-form YouTube videos and short social edits from first assembly to final export, working with our producers and motion designer.

What we are looking for
- At least 1 year editing for YouTube or social media
- Strong skills in Premiere Pro and After Effects
- A record of edits that grow watch time
- Quick turnaround on short social edits
- DaVinci Resolve for grading is a plus

Please include a link to your portfolio.

Salary £28,000 to £32,000`,
          us: `Video Editor (YouTube and Social)
Moonpenny Studios, Wichita, KS

Moonpenny Studios makes YouTube series and social content for 12 food, travel and lifestyle brands.

The role
You will join a team of 4 editors, cutting long-form YouTube videos and short social edits from first assembly to final export, working with our producers and motion designer.

What we are looking for
- At least 1 year editing for YouTube or social media
- Strong skills in Premiere Pro and After Effects
- A record of edits that grow watch time
- Quick turnaround on short social edits
- DaVinci Resolve for color grading is a plus

Please include a link to your portfolio.

Salary $50,000 to $58,000`,
        },
      },
      reason: "I want to edit longer YouTube series for food and travel brands, and keep making short social edits.",
      paragraphs: [
        "Moonpenny Studios is looking for a Video Editor, and I would like to join its team of editors. I want to edit longer YouTube series for food and travel brands, and keep making short social edits.",
        "At Brightreel Media I edit around 6 videos a week for 5 brand clients' YouTube channels and social media accounts, from 30-second clips to 20-minute videos, in Premiere Pro. Your advert asks for a record of edits that grow watch time. I raised average watch time on a client's cooking channel from 4.1 to 5.6 minutes a view in 6 months by cutting slower openings and adding chapters. I also edited a 12-part series for a fitness brand that reached 2.4 million views across YouTube and Instagram in 3 months.",
        "You are also looking for strong skills in Premiere Pro and After Effects. I built 8 motion graphics templates in After Effects for titles, captions and lower thirds, cutting finishing time by around an hour a video. I colour grade and mix audio for around 3 longer videos a week in DaVinci Resolve, matching footage from up to 4 cameras.",
        "Your advert also mentions quick turnaround on short social edits. I deliver 90% of short social edits within 24 hours of receiving footage. Before that, at Tallowmere Post Production, I assembled rough cuts for 20 corporate and charity films in Premiere Pro.",
        {
          uk: "My CV and portfolio are attached, and I would welcome the chance to discuss the role. Thank you for your time.",
          us: "My resume and portfolio are attached, and I would welcome the chance to discuss the role. Thank you for your time.",
        },
      ],
    },
  },
  {
    id: "credit-controller",
    industry: "finance",
    role: { uk: "Credit Controller", us: "Collections Specialist" },
    level: "early",
    template: "compact",
    blurb: {
      uk: "A credit controller two years into running a £3.2 million debtor book for a building supplies wholesaler, with debtor days down from 52 to 41.",
      us: "A collections specialist two years into running a $4.1 million portfolio for a building supply distributor, with days sales outstanding down from 52 to 41.",
    },
    person: { name: "Shona Varley", email: "shona.varley@example.com", phone: { uk: "07700 900687", us: "(515) 555-0110" }, location: { uk: "Nottingham", us: "Des Moines, IA" } },
    profile: {
      uk: "Credit controller with 2 years managing a debtor book of 420 trade accounts worth around £3.2 million for a building supplies wholesaler. Cut days sales outstanding (DSO) from 52 to 41 in 18 months, and debt over 60 days from £380,000 to £140,000 in a year. Works in Sage 200 and Excel, and arranges around 15 payment plans a month with customers in difficulty. Holds the Level 2 Certificate in Credit Management from the Chartered Institute of Credit Management (CICM).",
      us: "Collections specialist with 2 years managing a portfolio of 420 trade accounts worth around $4.1 million for a building supply distributor. Cut days sales outstanding (DSO) from 52 to 41 in 18 months, and debt over 60 days past due from $490,000 to $180,000 in a year. Works in NetSuite and Excel, and arranges around 15 payment plans a month with customers in difficulty. Holds the Credit Business Associate (CBA) certification from the National Association of Credit Management.",
    },
    experience: [
      {
        title: { uk: "Credit Controller", us: "Collections Specialist" },
        org: { uk: "Hartshorn Building Supplies", us: "Hartshorn Building Supply" },
        location: { uk: "Nottingham", us: "Des Moines, IA" },
        start: "2024-06",
        current: true,
        bullets: [
          {
            uk: "Manage a debtor book of 420 trade accounts worth around £3.2 million in the East Midlands, from sole traders to regional builders",
            us: "Manage a portfolio of 420 trade accounts worth around $4.1 million in the Des Moines area, from independent contractors to regional home builders",
          },
          "Cut days sales outstanding from 52 to 41 in 18 months by calling every account at 7 days overdue and sending statements weekly",
          {
            uk: "Reduced debt over 60 days from £380,000 to £140,000 in a year by agreeing payment plans and putting 12 accounts on stop",
            us: "Reduced debt over 60 days past due from $490,000 to $180,000 in a year by setting up payment plans and placing 12 accounts on credit hold",
          },
          "Arrange around 15 payment plans a month with customers in difficulty, with 90% paid in full within the agreed term",
          {
            uk: "Complete around 200 account reconciliations a month in Sage 200, resolving pricing and delivery queries with the sales team",
            us: "Complete around 200 account reconciliations a month in NetSuite, resolving pricing and delivery disputes with the sales team",
          },
          {
            uk: "Check credit applications for around 25 new accounts a month using credit reference reports, setting limits up to £20,000",
            us: "Check credit applications for around 25 new accounts a month using business credit reports, setting limits up to $25,000",
          },
        ],
      },
      {
        title: { uk: "Accounts Assistant", us: "Accounts Receivable Clerk" },
        org: "Clayborne Office Supplies",
        location: { uk: "Derby", us: "Ankeny, IA" },
        start: "2022-09",
        end: "2024-05",
        bullets: [
          "Posted around 300 customer payments a week, matching 99% of them to invoices within a day",
          "Sent around 400 statements and reminder letters a month, and answered invoice queries by phone and email",
          {
            uk: "Compiled the weekly aged debt report for the finance manager, used every Monday to plan the week's calls",
            us: "Compiled the weekly accounts receivable aging report for the finance manager, used every Monday to plan the week's calls",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels", us: "Associate of Applied Science in Accounting" },
        org: { uk: "Ashlowe Sixth Form College", us: "Des Moines Area Community College" },
        location: { uk: "Nottingham", us: "Ankeny, IA" },
        end: "2022",
        grade: { uk: "Business (A), Maths (B), Psychology (B)", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 2 Certificate in Credit Management", us: "Credit Business Associate (CBA)" },
        org: { uk: "Chartered Institute of Credit Management", us: "National Association of Credit Management" },
        end: "2024",
      },
    ],
    skills: [
      { uk: "Debtor book management", us: "Accounts receivable" },
      "Days sales outstanding",
      "Payment plans",
      { uk: "Sage 200", us: "NetSuite" },
      "Account reconciliations",
      "Credit checks",
      { uk: "Account stops", us: "Credit holds" },
      "Excel",
      "Statements",
      "Payment posting",
    ],
    names: ["Shona", "Varley", "Hartshorn", "Clayborne", "Ashlowe", "Peverell", "Ankeny", "Des", "Moines"],
    letter: {
      job: {
        title: { uk: "Credit Controller", us: "Collections Specialist" },
        employer: "Peverell Wholesale",
        advert: {
          uk: `Credit Controller
Peverell Wholesale, Nottingham

Peverell Wholesale supplies plumbing and heating parts to 2,500 trade customers from 6 branches across the Midlands.

The role
You will manage a ledger of around 500 trade accounts, chasing overdue invoices, setting credit limits and working with branch managers to keep accounts within terms.

What we are looking for
- At least 1 year in credit control, ideally with trade customers
- A record of reducing debtor days or overdue debt
- Experience with Sage or a similar accounts system
- Confidence agreeing payment plans by phone
- CICM study, or willingness to start it

Salary £27,000 to £30,000`,
          us: `Collections Specialist
Peverell Wholesale, Des Moines, IA

Peverell Wholesale supplies plumbing and heating parts to 2,500 trade customers from 6 branches across Iowa and Nebraska.

The role
You will manage a portfolio of around 500 trade accounts, collecting past-due invoices, setting credit limits and working with branch managers to keep accounts within terms.

What we are looking for
- At least 1 year in collections or accounts receivable, ideally with trade customers
- A record of reducing days sales outstanding or past-due balances
- Experience with NetSuite or a similar accounting system
- Confidence setting up payment plans by phone
- NACM certification, or willingness to pursue it

Salary $46,000 to $52,000`,
        },
      },
      reason: {
        uk: "I want to manage a larger ledger of trade accounts, and in time move into a senior credit control role.",
        us: "I want to manage a larger portfolio of trade accounts, and in time move into a senior collections role.",
      },
      paragraphs: [
        {
          uk: "This letter is my application for the role of Credit Controller at Peverell Wholesale. I want to manage a larger ledger of trade accounts, and in time move into a senior credit control role.",
          us: "This letter is my application for the role of Collections Specialist at Peverell Wholesale. I want to manage a larger portfolio of trade accounts, and in time move into a senior collections role.",
        },
        {
          uk: "At Hartshorn Building Supplies I manage a debtor book of 420 trade accounts worth around £3.2 million in the East Midlands, from sole traders to regional builders. Your advert asks for a record of reducing debtor days or overdue debt. I cut days sales outstanding from 52 to 41 in 18 months by calling every account at 7 days overdue and sending statements weekly. I also reduced debt over 60 days from £380,000 to £140,000 in a year by agreeing payment plans and putting 12 accounts on stop.",
          us: "At Hartshorn Building Supply I manage a portfolio of 420 trade accounts worth around $4.1 million in the Des Moines area, from independent contractors to regional home builders. Your advert asks for a record of reducing days sales outstanding or past-due balances. I cut days sales outstanding from 52 to 41 in 18 months by calling every account at 7 days overdue and sending statements weekly. I also reduced debt over 60 days past due from $490,000 to $180,000 in a year by setting up payment plans and placing 12 accounts on credit hold.",
        },
        {
          uk: "You are also looking for confidence agreeing payment plans by phone. I arrange around 15 payment plans a month with customers in difficulty, with 90% paid in full within the agreed term. I also check credit applications for around 25 new accounts a month using credit reference reports, setting limits up to £20,000.",
          us: "You are also looking for confidence setting up payment plans by phone. I arrange around 15 payment plans a month with customers in difficulty, with 90% paid in full within the agreed term. I also check credit applications for around 25 new accounts a month using business credit reports, setting limits up to $25,000.",
        },
        {
          uk: "Your advert also mentions experience with Sage. I complete around 200 account reconciliations a month in Sage 200, resolving pricing and delivery queries with the sales team. I hold the Level 2 Certificate in Credit Management from the Chartered Institute of Credit Management (CICM).",
          us: "Your advert also mentions experience with NetSuite. I complete around 200 account reconciliations a month in NetSuite, resolving pricing and delivery disputes with the sales team. I hold the Credit Business Associate (CBA) certification from the National Association of Credit Management.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "financial-adviser",
    industry: "banking",
    role: { uk: "Financial Adviser", us: "Financial Advisor" },
    level: "experienced",
    template: "executive",
    blurb: {
      uk: "A financial adviser with 140 clients and £68 million under advice, after starting in pensions administration and paraplanning.",
      us: "A financial advisor with 140 client households and $85 million under management, after starting in retirement plan administration.",
    },
    person: { name: "Robert Kinsella", email: "robert.kinsella@example.com", phone: { uk: "07700 900688", us: "(608) 555-0111" }, location: { uk: "York", us: "Madison, WI" } },
    profile: {
      uk: "Financial adviser with 12 years in financial planning, the last 6 advising 140 clients on pensions, investments and retirement income at a firm regulated by the Financial Conduct Authority (FCA). Grew assets under advice from £41 million to £68 million in 5 years, mostly through referrals from clients and 2 local accountancy firms. Passed all 24 compliance file checks in 2025 with no changes needed. Holds the Diploma in Regulated Financial Planning (DipPFS) from the Chartered Insurance Institute.",
      us: "Financial advisor with 12 years in financial planning, the last 6 advising 140 households on retirement accounts, investments and retirement income at an independent wealth management firm. Grew assets under management from $52 million to $85 million in 5 years, mostly through referrals from clients and 2 local accounting firms. Passed all 24 compliance file reviews in 2025 with no changes needed. Holds the Certified Financial Planner (CFP) certification and the Series 7 and Series 66 licenses.",
    },
    experience: [
      {
        title: { uk: "Financial Adviser", us: "Financial Advisor" },
        org: { uk: "Fellbrook Financial Planning", us: "Fellbrook Wealth Management" },
        location: { uk: "York", us: "Madison, WI" },
        start: "2020-04",
        current: true,
        bullets: [
          {
            uk: "Advise 140 clients on pensions, investments and retirement income, holding a review with each client at least once a year",
            us: "Advise 140 households on retirement accounts, investments and retirement income, holding a review with each client at least once a year",
          },
          {
            uk: "Grew assets under advice from £41 million to £68 million in 5 years, mostly through referrals from clients and 2 local accountancy firms",
            us: "Grew assets under management from $52 million to $85 million in 5 years, mostly through referrals from clients and 2 local accounting firms",
          },
          "Kept client retention at 97% over 5 years, with a yearly review and cash flow plan for each client",
          {
            uk: "Consolidated old pensions for 38 clients in 2024, cutting their average yearly charges from 1.4% to 0.8%",
            us: "Consolidated old workplace retirement plans for 38 clients in 2024, cutting their average annual fees from 1.4% to 0.8%",
          },
          {
            uk: "Write each suitability report within 10 working days of the meeting, passing all 24 compliance file checks in 2025 with no changes needed",
            us: "Document each recommendation within 10 business days of the meeting, passing all 24 compliance file reviews in 2025 with no changes needed",
          },
          "Built cash flow models in Voyant for 60 clients nearing retirement, showing how long their savings would last at different spending levels",
        ],
      },
      {
        title: { uk: "Paraplanner", us: "Associate Financial Planner" },
        org: "Stannard Wealth",
        location: { uk: "Leeds", us: "Middleton, WI" },
        start: "2017-02",
        end: "2020-03",
        bullets: [
          {
            uk: "Wrote around 15 suitability reports a month for 4 advisers over 3 years, with 98% passing compliance checks first time",
            us: "Prepared around 15 financial plans a month for 4 advisors over 3 years, with 98% approved by compliance first time",
          },
          {
            uk: "Researched pension, platform and fund options for around 20 cases a month using Defaqto",
            us: "Researched retirement plan, platform and fund options for around 20 cases a month using Morningstar",
          },
          {
            uk: "Prepared review packs for around 300 clients a year, cutting each adviser's preparation time by about an hour a review",
            us: "Prepared review packets for around 300 clients a year, cutting each advisor's preparation time by about an hour a review",
          },
          {
            uk: "Passed the Diploma in Regulated Financial Planning in 2019 while working full time",
            us: "Passed the Series 7 and Series 66 exams in 2017 within 6 months of joining",
          },
        ],
      },
      {
        title: { uk: "Pensions Administrator", us: "Retirement Plan Administrator" },
        org: "Selwyn Life",
        location: { uk: "York", us: "Madison, WI" },
        start: "2014-09",
        end: "2017-01",
        bullets: [
          {
            uk: "Processed around 40 pension transfers, retirements and fund switches a week over 2 years, meeting the 10-day service standard on 96% of cases",
            us: "Processed around 40 rollovers, distributions and fund changes a week over 2 years, meeting the 10-day service standard on 96% of cases",
          },
          {
            uk: "Answered around 30 calls a day from members and financial advisers on transfer values and retirement options",
            us: "Answered around 30 calls a day from plan participants and financial advisors on rollovers and retirement options",
          },
          "Wrote 12 template letters for common requests, cutting letters sent back for corrections from 8% to 3%",
          {
            uk: "Checked around 25 transfer requests a week for signs of pension scams, referring 9 cases to the compliance team in 2016",
            us: "Checked around 25 rollover requests a week for signs of fraud, referring 9 cases to the compliance team in 2016",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business and Finance", us: "Bachelor of Science in Personal Finance" },
        org: { uk: "Leeds Beckett University", us: "University of Wisconsin-Madison" },
        end: "2014",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Diploma in Regulated Financial Planning (DipPFS)", us: "Certified Financial Planner (CFP)" },
        org: { uk: "Chartered Insurance Institute", us: "Certified Financial Planner Board of Standards" },
        end: "2019",
      },
      {
        title: { uk: "Certificate in Paraplanning", us: "Series 7 and Series 66 Licenses" },
        org: { uk: "Chartered Insurance Institute", us: "Financial Industry Regulatory Authority" },
        end: "2017",
      },
    ],
    skills: [
      "Retirement income",
      "Investments",
      { uk: "Pension transfers", us: "Rollovers" },
      "Cash flow models",
      { uk: "Suitability reports", us: "Financial plans" },
      "Client reviews",
      "Voyant",
      { uk: "Defaqto", us: "Morningstar" },
      { uk: "Compliance file checks", us: "Compliance reviews" },
      "Client retention",
    ],
    names: ["Kinsella", "Fellbrook", "Stannard", "Selwyn", "Brindlecroft", "Voyant", "Defaqto", "Morningstar", "DipPFS", "Paraplanner", "Paraplanning", "Beckett", "Middleton"],
    letter: {
      job: {
        title: { uk: "Financial Adviser", us: "Financial Advisor" },
        employer: "Brindlecroft Wealth",
        advert: {
          uk: `Financial Adviser
Brindlecroft Wealth, York

Brindlecroft Wealth is an independent financial planning firm, regulated by the Financial Conduct Authority, with 9 advisers and £900 million under advice.

The role
You will take on an existing bank of around 120 clients from a retiring adviser, and grow it through referrals and professional introducers.

What we are looking for
- At least 5 years as a financial adviser
- The Diploma in Regulated Financial Planning, with Chartered status desirable
- Strong pensions and retirement income knowledge
- A clean compliance record
- Experience using cash flow modelling with clients

Salary £60,000 to £75,000, plus bonus`,
          us: `Financial Advisor
Brindlecroft Wealth, Madison, WI

Brindlecroft Wealth is an independent wealth management firm with 9 advisors and $1.1 billion in assets under management.

The role
You will take on an existing book of around 120 households from a retiring advisor, and grow it through referrals and professional introductions.

What we are looking for
- At least 5 years as a financial advisor
- Series 7 and 66 licenses, with the CFP designation preferred
- Strong retirement income planning knowledge
- A clean compliance record
- Experience using cash flow modeling with clients

Salary $95,000 to $130,000, plus bonus`,
        },
      },
      reason: {
        uk: "I want to take on a larger client bank at an independent firm and spend more of my time on retirement planning.",
        us: "I want to take on a larger client book at an independent firm and spend more of my time on retirement planning.",
      },
      paragraphs: [
        {
          uk: "I want to take on a larger client bank at an independent firm and spend more of my time on retirement planning, so I am keen to apply for the Financial Adviser role at Brindlecroft Wealth.",
          us: "I want to take on a larger client book at an independent firm and spend more of my time on retirement planning, so I am keen to apply for the Financial Advisor role at Brindlecroft Wealth.",
        },
        {
          uk: "At Fellbrook Financial Planning I advise 140 clients on pensions, investments and retirement income, holding a review with each client at least once a year. I grew assets under advice from £41 million to £68 million in 5 years, mostly through referrals from clients and 2 local accountancy firms. I have also kept client retention at 97% over 5 years, with a yearly review and cash flow plan for each client.",
          us: "At Fellbrook Wealth Management I advise 140 households on retirement accounts, investments and retirement income, holding a review with each client at least once a year. I grew assets under management from $52 million to $85 million in 5 years, mostly through referrals from clients and 2 local accounting firms. I have also kept client retention at 97% over 5 years, with a yearly review and cash flow plan for each client.",
        },
        {
          uk: "Your advert asks for strong pensions and retirement income knowledge. In 2024 I consolidated old pensions for 38 clients, cutting their average yearly charges from 1.4% to 0.8%. I also built cash flow models in Voyant for 60 clients nearing retirement, showing how long their savings would last at different spending levels.",
          us: "Your advert asks for strong retirement income planning knowledge. In 2024 I consolidated old workplace retirement plans for 38 clients, cutting their average annual fees from 1.4% to 0.8%. I also built cash flow models in Voyant for 60 clients nearing retirement, showing how long their savings would last at different spending levels.",
        },
        {
          uk: "You are also looking for a clean compliance record. I write each suitability report within 10 working days of the meeting, and I passed all 24 compliance file checks in 2025 with no changes needed. I hold the Diploma in Regulated Financial Planning (DipPFS) from the Chartered Insurance Institute.",
          us: "You are also looking for a clean compliance record. I document each recommendation within 10 business days of the meeting, and I passed all 24 compliance file reviews in 2025 with no changes needed. I hold the Certified Financial Planner (CFP) certification and the Series 7 and Series 66 licenses.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "hr-assistant",
    industry: "hr",
    role: "HR Assistant",
    level: "early",
    template: "minimal",
    blurb: {
      uk: "An HR assistant two years into handling contracts, records and onboarding for a 650-person food manufacturer, after a start in recruitment agency administration.",
      us: "An HR assistant two years into handling offer letters, records and onboarding for a 650-person food manufacturer, after a start in staffing agency administration.",
    },
    person: { name: "Rania Saleh", email: "rania.saleh@example.com", phone: { uk: "07700 900689", us: "(502) 555-0112" }, location: { uk: "Sheffield", us: "Louisville, KY" } },
    profile: {
      uk: "HR assistant with 2 years at a food manufacturer with 650 staff, after 18 months in office administration at a recruitment agency. Prepares around 15 contracts a month and keeps employee records up to date in BambooHR. Cut the time to issue contracts from 6 working days to 2 by building templates for the 8 most common roles. Holds the Chartered Institute of Personnel and Development (CIPD) Level 3 Foundation Certificate in People Practice.",
      us: "HR assistant with 2 years at a food manufacturer with 650 employees, after 18 months in office administration at a staffing agency. Prepares around 15 offer letters a month and keeps employee records up to date in BambooHR. Cut the time to issue offer letters from 6 business days to 2 by building templates for the 8 most common roles. Holds the Associate Professional in Human Resources (aPHR) certification.",
    },
    experience: [
      {
        title: "HR Assistant",
        org: "Brackenford Foods",
        location: { uk: "Sheffield", us: "Louisville, KY" },
        start: "2024-04",
        current: true,
        bullets: [
          {
            uk: "Prepare offer letters and contracts for around 15 new starters a month across 2 sites",
            us: "Prepare offer letters and new hire paperwork for around 15 new hires a month across 2 sites",
          },
          {
            uk: "Cut the time to issue contracts from 6 working days to 2 by building templates in Microsoft Word for the 8 most common roles",
            us: "Cut the time to issue offer letters from 6 business days to 2 by building templates in Microsoft Word for the 8 most common roles",
          },
          {
            uk: "Run right-to-work checks for every new starter, with no gaps found in the 2025 internal audit",
            us: "Run Form I-9 and E-Verify checks for every new hire, with all forms complete at the 2025 audit",
          },
          {
            uk: "Update around 120 employee records a month in BambooHR for starters, leavers, pay changes and new contracts, with 99% accuracy against payroll in quarterly checks",
            us: "Update around 120 employee records a month in BambooHR for new hires, departures, pay changes and job changes, with 99% accuracy against payroll in quarterly checks",
          },
          {
            uk: "Produce a monthly absence report for 14 managers, flagging staff who reach a trigger point",
            us: "Produce a monthly attendance report for 14 managers, flagging anyone who reaches the policy limit",
          },
          {
            uk: "Arranged onboarding for 160 new starters in 2025, booking inductions, equipment and system access",
            us: "Arranged onboarding for 160 new hires in 2025, booking orientation, equipment and system access",
          },
        ],
      },
      {
        title: "Office Administrator",
        org: { uk: "Quayle Recruitment", us: "Quayle Staffing" },
        location: { uk: "Rotherham", us: "Jeffersonville, IN" },
        start: "2022-10",
        end: "2024-03",
        bullets: [
          {
            uk: "Booked around 40 candidate interviews a week for 6 recruitment consultants",
            us: "Scheduled around 40 candidate interviews a week for 6 recruiters",
          },
          {
            uk: "Checked identity and right-to-work documents for around 25 temporary workers a week",
            us: "Checked identity and Form I-9 documents for around 25 temporary workers a week",
          },
          "Processed time sheets for around 80 temporary workers a week, with no late payroll in 18 months",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Psychology", us: "Bachelor of Arts in Psychology" },
        org: { uk: "Sheffield Hallam University", us: "University of Louisville" },
        end: "2022",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 3 Foundation Certificate in People Practice", us: "Associate Professional in Human Resources (aPHR)" },
        org: { uk: "Chartered Institute of Personnel and Development", us: "HR Certification Institute" },
        end: "2025",
      },
    ],
    skills: [
      "Onboarding",
      { uk: "Contracts", us: "Offer letters" },
      { uk: "Right-to-work checks", us: "E-Verify" },
      "BambooHR",
      "Employee records",
      { uk: "Absence reporting", us: "Attendance reporting" },
      { uk: "Inductions", us: "Orientation" },
      { uk: "Interview booking", us: "Interview scheduling" },
      "Time sheets",
      "Microsoft Word",
    ],
    names: ["Rania", "Saleh", "Brackenford", "Quayle", "Thrushcross", "BambooHR", "aPHR", "Hallam", "Rotherham", "Jeffersonville"],
    letter: {
      job: {
        title: "HR Assistant",
        employer: "Thrushcross Housing",
        advert: {
          uk: `HR Assistant
Thrushcross Housing, Sheffield

Thrushcross Housing is a housing association with 900 staff, managing 14,000 homes across South Yorkshire.

The role
You will join a people team of 8, looking after the paperwork and records behind each stage of employment, from offer to leaving.

What we are looking for
- At least 1 year in an HR or recruitment administration role
- Experience preparing offer letters and contracts
- Accurate data entry in an HR system
- Knowledge of right-to-work checks
- CIPD Level 3, or willingness to study for it

Salary £24,500 to £26,500`,
          us: `HR Assistant
Thrushcross Housing, Louisville, KY

Thrushcross Housing is a nonprofit housing provider with 900 employees, managing 14,000 affordable homes across Kentucky and southern Indiana.

The role
You will join a people team of 8, looking after the paperwork and records behind each stage of employment, from offer to separation.

What we are looking for
- At least 1 year in an HR or recruiting administration role
- Experience preparing offer letters and new hire paperwork
- Accurate data entry in an HR system
- Knowledge of employment eligibility checks (Form I-9 and E-Verify)
- aPHR or SHRM-CP certification, or willingness to pursue it

Pay $19 to $21 an hour`,
        },
      },
      reason: "I want to work in a larger people team, for an employer that provides housing.",
      paragraphs: [
        "I would be glad to join Thrushcross Housing as its HR Assistant. I want to work in a larger people team, for an employer that provides housing.",
        {
          uk: "At Brackenford Foods, a food manufacturer with 650 staff, I prepare offer letters and contracts for around 15 new starters a month across 2 sites. Your advert asks for experience preparing offer letters and contracts. I cut the time to issue contracts from 6 working days to 2 by building templates in Microsoft Word for the 8 most common roles. In 2025 I also arranged onboarding for 160 new starters, booking inductions, equipment and system access.",
          us: "At Brackenford Foods, a food manufacturer with 650 employees, I prepare offer letters and new hire paperwork for around 15 new hires a month across 2 sites. Your advert asks for experience preparing offer letters and new hire paperwork. I cut the time to issue offer letters from 6 business days to 2 by building templates in Microsoft Word for the 8 most common roles. In 2025 I also arranged onboarding for 160 new hires, booking orientation, equipment and system access.",
        },
        {
          uk: "You are also looking for accurate data entry in an HR system. I update around 120 employee records a month in BambooHR for starters, leavers, pay changes and new contracts, with 99% accuracy against payroll in quarterly checks. I also produce a monthly absence report for 14 managers, flagging staff who reach a trigger point.",
          us: "You are also looking for accurate data entry in an HR system. I update around 120 employee records a month in BambooHR for new hires, departures, pay changes and job changes, with 99% accuracy against payroll in quarterly checks. I also produce a monthly attendance report for 14 managers, flagging anyone who reaches the policy limit.",
        },
        {
          uk: "Your advert also mentions knowledge of right-to-work checks. I run right-to-work checks for every new starter, with no gaps found in the 2025 internal audit. I hold the Chartered Institute of Personnel and Development (CIPD) Level 3 Foundation Certificate in People Practice.",
          us: "Your advert also mentions knowledge of employment eligibility checks. I run Form I-9 and E-Verify checks for every new hire, with all forms complete at the 2025 audit. I hold the Associate Professional in Human Resources (aPHR) certification.",
        },
        CLOSE,
      ],
    },
  },
];
