import type { ExampleSpec } from "../types";

/** Marketing, finance and early career. */
export const COMMERCIAL: ExampleSpec[] = [
  {
    id: "marketing-lead",
    industry: "marketing",
    role: "Marketing Manager",
    level: "experienced",
    template: "modern",
    blurb: "A marketing manager for consumer brands who runs paid, email and search together.",
    person: { name: "Chloe Bennett", email: "chloe.bennett@example.com", phone: { uk: "07700 900672", us: "(323) 555-0108" }, location: { uk: "Brighton", us: "Los Angeles, CA" } },
    profile: {
      uk: "Marketing manager with nine years in consumer brands that sell online. Plans and runs paid, email and search campaigns with budgets up to £1.5 million a year. Grew qualified leads by 52% and added £380,000 a year in email sales over the last two years. Leads a team of 3 marketers and works with 2 agencies.",
      us: "Marketing manager with nine years in consumer brands that sell online. Plans and runs paid, email and search campaigns with budgets up to $1.9 million a year. Grew qualified leads by 52% and added $480,000 a year in email sales over the last two years. Leads a team of 3 marketers and works with 2 agencies.",
    },
    experience: [
      {
        title: "Marketing Manager",
        org: "Kinetix Home",
        location: { uk: "Brighton", us: "Los Angeles, CA" },
        start: "2021-05",
        current: true,
        bullets: [
          { uk: "Manage a £1.5 million yearly budget for Google Ads, Meta Ads and LinkedIn Ads, returning £4.10 in sales for every £1 spent over the last 2 years", us: "Manage a $1.9 million yearly budget for Google Ads, Meta Ads and LinkedIn Ads, returning $4.10 in sales for every $1 spent over the last 2 years" },
          "Grew qualified leads by 52% in a year by rebuilding the 6 main landing pages with the design team",
          { uk: "Launched an email programme in Klaviyo that adds around £380,000 in sales a year", us: "Launched an email program in Klaviyo that adds around $480,000 in sales a year" },
          "Lead a team of 3 marketers and 2 agencies, with campaigns planned a quarter ahead and reviewed every week",
          "Raised the checkout conversion rate from 2.1% to 3.4% through 40 tests on product pages",
          "Report monthly to the leadership team on 8 measures, from cost per lead to repeat purchase rate",
        ],
      },
      {
        title: { uk: "Digital Marketing Executive", us: "Digital Marketing Specialist" },
        org: "Brightwave Studio",
        location: { uk: "Brighton", us: "Pasadena, CA" },
        start: "2018-07",
        end: "2021-04",
        bullets: [
          { uk: "Ran Google search ads for 15 clients with combined monthly budgets of £120,000", us: "Ran Google search ads for 15 clients with combined monthly budgets of $150,000" },
          "Improved search engine optimisation (SEO) for 200 key terms, doubling organic traffic for 4 clients in a year",
          "Wrote and scheduled 60 social media posts a month across 5 brands",
          "Built monthly campaign reports for 15 clients in Google Analytics and Looker Studio",
          "Wrote 3 case studies on client results that the agency used to win 2 new accounts",
          "Added conversion tracking to 15 client sites, fixing reports that had missed 30% of sales",
        ],
      },
      {
        title: "Marketing Assistant",
        org: "Brightwave Studio",
        location: { uk: "Brighton", us: "Pasadena, CA" },
        start: "2016-09",
        end: "2018-06",
        bullets: [
          "Built 30 email newsletters a quarter for 5 clients, with open rates above 35%",
          "Organised 4 product launch events for 80 to 150 guests",
          "Kept the content calendar for 5 client brands up to date every week",
          "Gathered competitor prices and offers for 3 retail clients each month, used to plan their promotions",
          "Wrote product descriptions for 300 items a quarter on clients' online shops",
        ],
      },
    ],
    volunteering: [
      {
        title: "Marketing volunteer",
        org: { uk: "Seaside Food Bank", us: "Westside Food Bank" },
        start: "2020-01",
        current: true,
        bullets: [
          "Run the food bank's social media, growing followers from 900 to 4,000 in 2 years",
          { uk: "Planned 2 winter appeals a year that raised 12 tonnes of food", us: "Planned 2 winter appeals a year that raised 26,000 pounds of food" },
          "Designed leaflets and posters for 40 partner schools and shops",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Marketing", us: "Bachelor of Business Administration in Marketing" },
        org: { uk: "University of Sussex", us: "California State University, Long Beach" },
        start: "2013-09",
        end: "2016-06",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    skills: ["Google Ads", "Meta Ads", "LinkedIn Ads", "Klaviyo", "Email marketing", "Search engine optimisation", "Landing pages", "Conversion tests", "Social media", "Google Analytics"],
    names: ["Kinetix", "Brightwave", "Klaviyo", "Chloe", "Westside", "Fernbrook"],
    letter: {
      job: {
        title: "Head of Growth Marketing",
        employer: "Fernbrook Outdoor",
        advert: {
          uk: `Head of Growth Marketing
Fernbrook Outdoor, Brighton (hybrid)

Fernbrook Outdoor makes camping and walking gear and sells it online across the UK.

The role
You will lead paid, email and search marketing, with a budget of £2 million a year and a team of four.

What we are looking for
- Experience managing paid social and search budgets of over £1 million
- A record of growing email sales
- Experience leading a small team and working with agencies
- Comfort reporting results to the leadership team`,
          us: `Head of Growth Marketing
Fernbrook Outdoor, Los Angeles, CA (hybrid)

Fernbrook Outdoor makes camping and hiking gear and sells it online across the US.

The role
You will lead paid, email and search marketing, with a budget of $2.5 million a year and a team of four.

What we are looking for
- Experience managing paid social and search budgets of over $1 million
- A record of growing email sales
- Experience leading a small team and working with agencies
- Comfort reporting results to the leadership team`,
        },
      },
      reason: {
        uk: "I spend most weekends walking the South Downs, and I want to market gear I use myself. Fernbrook sells only online, which is where I have done my best work.",
        us: "I spend most weekends hiking in the Santa Monica Mountains, and I want to market gear I use myself. Fernbrook sells only online, which is where I have done my best work.",
      },
      recipient: { uk: "Ms Patel", us: "Ms. Patel" },
      paragraphs: [
        {
          uk: "I am applying for the role of Head of Growth Marketing at Fernbrook Outdoor. I spend most weekends walking the South Downs, and I want to market gear I use myself. Fernbrook sells only online, which is where I have done my best work.",
          us: "I am applying for the role of Head of Growth Marketing at Fernbrook Outdoor. I spend most weekends hiking in the Santa Monica Mountains, and I want to market gear I use myself. Fernbrook sells only online, which is where I have done my best work.",
        },
        {
          uk: "At Kinetix Home I manage a £1.5 million yearly budget for Google Ads, Meta Ads and LinkedIn Ads, returning £4.10 in sales for every £1 spent over the last 2 years. Your advert asks for a record of growing email sales. I launched an email programme in Klaviyo that adds around £380,000 in sales a year.",
          us: "At Kinetix Home I manage a $1.9 million yearly budget for Google Ads, Meta Ads and LinkedIn Ads, returning $4.10 in sales for every $1 spent over the last 2 years. Your advert asks for a record of growing email sales. I launched an email program in Klaviyo that adds around $480,000 in sales a year.",
        },
        "I also grew qualified leads by 52% in a year by rebuilding the 6 main landing pages with the design team. Through 40 tests on product pages, I raised the checkout conversion rate from 2.1% to 3.4%.",
        "I lead a team of 3 marketers and 2 agencies, with campaigns planned a quarter ahead and reviewed every week. I report monthly to the leadership team on 8 measures, from cost per lead to repeat purchase rate.",
        "My CV is attached, and I would welcome the chance to discuss the role. I am available to start after a one-month notice period. Thank you for your time and consideration.",
      ],
    },
  },
  {
    id: "finance-analyst",
    industry: "finance",
    role: "Financial Analyst",
    level: "early",
    template: "standard",
    blurb: "A financial analyst two years into commercial finance at a manufacturing group.",
    person: { name: "Ryan Okafor", email: "ryan.okafor@example.com", phone: { uk: "07700 900791", us: "(980) 555-0133" }, location: { uk: "Sheffield", us: "Charlotte, NC" } },
    profile: {
      uk: "Financial analyst with two years in commercial finance at a manufacturing group. Builds forecasts and financial models in Excel and reports on £85 million of yearly spending. Saves 14 hours a month at month-end by automating reports. Studying for the Association of Chartered Certified Accountants (ACCA) qualification and works closely with operations and sales teams.",
      us: "Financial analyst with two years in corporate finance at a manufacturing group. Builds forecasts and financial models in Excel and reports on $105 million of yearly spending. Saves 14 hours a month at month-end by automating reports. Preparing for the Chartered Financial Analyst (CFA) Level II exam and works closely with operations and sales teams.",
    },
    experience: [
      {
        title: "Financial Analyst",
        org: "Tallis Manufacturing Group",
        location: { uk: "Sheffield", us: "Charlotte, NC" },
        start: "2023-07",
        current: true,
        bullets: [
          { uk: "Report monthly on £85 million of operating spending to 6 budget holders, explaining every variance over 5%", us: "Report monthly on $105 million of operating spending to 6 budget holders, explaining every variance over 5%" },
          { uk: "Built a three-statement financial model in Excel with the operations team for a £12 million factory investment approved by the board", us: "Built a three-statement financial model in Excel with the operations team for a $15 million plant investment approved by the board" },
          "Automated month-end reports with Power Query, saving 14 hours a month",
          { uk: "Forecast cash flow 13 weeks ahead every week, keeping the group within its £5 million credit line", us: "Forecast cash flow 13 weeks ahead every week, keeping the group within its $6 million credit line" },
          "Prepared the yearly budget packs for 6 departments, all returned and agreed by the deadline",
          "Explain the monthly results to each of the 6 budget holders in a 30-minute review",
        ],
      },
      {
        title: "Finance Intern",
        org: "Tallis Manufacturing Group",
        location: { uk: "Sheffield", us: "Charlotte, NC" },
        start: "2022-06",
        end: "2022-09",
        bullets: [
          { uk: "Prepared 120 balance sheet reconciliations a month, clearing £40,000 of old unmatched items", us: "Prepared 120 balance sheet reconciliations a month, clearing $50,000 of old unmatched items" },
          { uk: "Checked 300 supplier invoices a week against orders, finding £15,000 in duplicate payments", us: "Checked 300 vendor invoices a week against orders, finding $18,000 in duplicate payments" },
          "Built a spreadsheet tracking 40 overdue customer accounts, which cut overdue balances by 15% in 3 months",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Accounting and Finance", us: "Bachelor of Science in Finance" },
        org: { uk: "University of Sheffield", us: "University of North Carolina at Charlotte" },
        start: "2019-09",
        end: "2023-06",
        grade: { uk: "2:1", us: "GPA 3.6" },
        bullets: [
          { uk: "Dissertation on working capital in 30 small manufacturers, graded 74% against a class average of 62%", us: "Senior thesis on working capital in 30 small manufacturers, graded A (4.0)" },
          "Treasurer of the 120-member finance society, running a budget for 8 events a year",
        ],
      },
    ],
    certificates: [{ title: { uk: "ACCA Applied Skills (6 of 9 exams passed)", us: "CFA Level I" }, org: { uk: "Association of Chartered Certified Accountants", us: "CFA Institute" }, end: "2025" }],
    skills: ["Financial models", "Forecasting", "Variance reporting", "Excel", "Power Query", "Cash flow", "Reconciliations", "Month-end reporting"],
    names: ["Tallis", "Okafor"],
  },
  {
    id: "cs-graduate",
    industry: "early-career",
    role: { uk: "Graduate Software Engineer", us: "Entry-Level Software Engineer" },
    level: "student",
    template: "graduate",
    density: { uk: "default", us: "tighter" },
    blurb: "A computer science graduate with a year in industry and an open-source project.",
    person: { name: "Leo Hughes", email: "leo.hughes@example.com", phone: { uk: "07700 900814", us: "(737) 555-0182" }, location: { uk: "Bristol", us: "Austin, TX" }, links: ["github.com/leohughes-example"] },
    profile: {
      uk: "Computer science graduate with a year in industry building web tools in TypeScript and React. Built an open-source route-finding visualiser with 400 stars on GitHub. Looking for a graduate software engineering role. Teaches Python to children at a weekly library code club.",
      us: "Computer science graduate with a year of internships building web tools in TypeScript and React. Built an open-source route-finding visualizer with 400 stars on GitHub. Looking for an entry-level software engineering role.",
    },
    education: [
      {
        title: { uk: "BSc (Hons) Computer Science with a Year in Industry", us: "Bachelor of Science in Computer Science" },
        org: { uk: "University of Bristol", us: "University of Texas at Austin" },
        start: "2021-09",
        end: "2025-06",
        grade: { uk: "First-class honours", us: "GPA 3.8" },
        bullets: [
          { uk: "Final-year project: built a peer-to-peer note sharing app in TypeScript, graded 82% against a class average of 64%", us: "Senior project: built a peer-to-peer note sharing app in TypeScript used by 40 classmates, graded A" },
          { uk: "Top modules out of 12: distributed systems (79%) and machine learning in Python (77%)", us: "Top courses out of 32: distributed systems and machine learning in Python, both graded A (4.0)" },
        ],
      },
    ],
    projects: [
      {
        title: { uk: "Route-finding visualiser", us: "Route-finding visualizer" },
        org: "Open source",
        start: "2024-01",
        end: "2024-08",
        bullets: [
          "Built an interactive route-finding tool in TypeScript and HTML canvas, with 400 stars on GitHub",
          "Kept animations at 60 frames per second on phones and laptops by redrawing only what changed",
          "Reviewed and merged 18 pull requests from 9 outside contributors",
        ],
      },
    ],
    experience: [
      {
        title: { uk: "Software Engineer (Placement Year)", us: "Software Engineering Intern" },
        org: "Northlight Retail Tech",
        location: { uk: "Bristol", us: "Austin, TX" },
        start: "2023-07",
        end: "2024-06",
        bullets: [
          "Built 3 internal tools in React used every day by 15 engineering teams",
          "Wrote unit tests that raised coverage of the analytics code from 72% to 88%",
          "Fixed 40 bugs from the support queue, each reviewed and released within a week",
          "Presented a 20-minute demo of the new release dashboard to 60 engineers at the company meeting",
        ],
      },
    ],
    volunteering: [
      {
        title: "Coding club volunteer",
        org: { uk: "Bristol Library Code Club", us: "Austin Public Library Code Club" },
        start: "2022-10",
        end: "2025-05",
        bullets: [
          "Taught Python basics to 12 children aged 9 to 13 every week, over 3 school years",
          "Wrote 20 short coding projects for the club, from simple games to a weather station",
          "Ran a yearly coding fair where 30 children showed their projects to around 80 parents",
        ],
      },
    ],
    skills: ["TypeScript", "React", "Python", "Unit tests", "HTML canvas", "Machine learning", "Distributed systems", "Pull requests"],
    names: ["Northlight", "leohughes"],
  },
];
