import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** Sales, legal, design, media and the public sector: example CVs and cover letters, written for the UK and the US. */
export const INDUSTRY_OFFICE: ExampleSpec[] = [
  {
    id: "sales-executive",
    industry: "sales",
    role: { uk: "Sales Executive", us: "Sales Representative" },
    level: "early",
    template: "modern",
    density: { uk: "default", us: "tighter" },
    blurb: {
      uk: "A business-to-business sales executive three years in, selling phone and broadband contracts to small firms.",
      us: "A business-to-business sales rep three years in, selling phone and internet service to small companies.",
    },
    person: { name: "Jordan Ellis", email: "jordan.ellis@example.com", phone: { uk: "07700 900401", us: "(303) 555-0124" }, location: { uk: "Manchester", us: "Denver, CO" } },
    profile: {
      uk: "Sales executive with three years in business-to-business sales, selling phone, broadband and mobile contracts to firms of 5 to 200 staff. Reached 118% of a £240,000 yearly target in 2025 by booking 25 to 30 meetings a month and running live product demonstrations. Keeps every lead, call and deal up to date in Salesforce and forecasts sales each week. Holds a full UK driving licence and covers clients across Greater Manchester.",
      us: "Sales representative with three years in business-to-business sales, selling phone, internet and cell plans to small companies. Reached 118% of a $300,000 annual quota in 2025 by booking 25 to 30 meetings a month and running live product demos. Keeps every deal up to date in Salesforce and forecasts sales weekly. Holds a valid driver's license.",
    },
    experience: [
      {
        title: { uk: "Sales Executive", us: "Sales Representative" },
        org: "Larchfield Telecom",
        location: { uk: "Manchester", us: "Denver, CO" },
        start: "2024-04",
        current: true,
        bullets: [
          { uk: "Sell business phone, broadband and mobile contracts to firms of 5 to 200 staff, closing an average of 9 new accounts a month", us: "Sell business phone, internet and cell plans to companies of 5 to 200 employees, closing an average of 9 new accounts a month" },
          { uk: "Reached 118% of a £240,000 yearly sales target in 2025, ranking 2nd out of 14 sales executives", us: "Reached 118% of a $300,000 annual quota in 2025, ranking 2nd of 14 sales representatives" },
          "Book 25 to 30 meetings a month by prospecting through cold calls, LinkedIn messages and referrals from existing customers",
          "Run around 12 live product demonstrations a month, with 1 in 3 turning into a signed contract",
          "Close deals through price and contract negotiation with business owners and office managers, keeping the average discount under 8%",
          "Keep a sales pipeline of around 60 open deals up to date in Salesforce, with monthly forecasts within 10% of actual sales",
        ],
      },
      {
        title: { uk: "Business Development Representative", us: "Sales Development Representative" },
        org: "Larchfield Telecom",
        location: { uk: "Manchester", us: "Denver, CO" },
        start: "2023-07",
        end: "2024-03",
        bullets: [
          { uk: "Called 60 to 80 businesses a day across the North West, booking 18 meetings a month for 3 sales executives", us: "Called 60 to 80 businesses a day, booking 18 meetings a month for 3 sales representatives" },
          "Cleaned and updated 3,000 contact records in Salesforce, cutting bounced emails from 14% to 3%",
          "Wrote 4 email sequences for new leads, raising the reply rate from 2% to 6% in 3 months",
          { uk: "Promoted to sales executive after 9 months, against the usual 12 to 18 months", us: "Promoted to sales representative after 9 months, against the usual 12 to 18 months" },
        ],
      },
      {
        title: { uk: "Sales Assistant (part-time)", us: "Retail Sales Associate (part-time)" },
        org: { uk: "Voltstore Mobile", us: "Voltstore Wireless" },
        location: { uk: "Manchester", us: "Boulder, CO" },
        start: "2020-09",
        end: "2023-06",
        bullets: [
          { uk: "Sold phone contracts and accessories worth around £14,000 a month, working 16 hours a week alongside university", us: "Sold phone plans and accessories worth around $17,000 a month, working 16 hours a week alongside college" },
          { uk: "Beat the shop's monthly sales target in 20 of 30 months", us: "Beat the store's monthly sales goal in 20 of 30 months" },
          { uk: "Trained 5 new part-time staff on the till, stock checks and product range", us: "Trained 5 new part-time associates on the register, inventory counts and product range" },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business Management", us: "Bachelor of Science in Business Administration" },
        org: { uk: "Manchester Metropolitan University", us: "University of Colorado Boulder" },
        end: "2023",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    skills: ["Business-to-business sales", "Prospecting", "Cold calling", "Product demonstrations", "Contract negotiation", "Sales pipeline", "Sales forecasting", "Salesforce", "Email sequences"],
    names: ["Larchfield", "Telecom", "Voltstore", "Quillstone", "Ellis"],
    letter: {
      job: {
        title: { uk: "Senior Sales Executive", us: "Account Executive" },
        employer: "Quillstone Software",
        advert: {
          uk: `Senior Sales Executive
Quillstone Software, Manchester (hybrid)

Quillstone makes booking and payments software for 3,000 small businesses across the UK.

The role
You will win new business with firms of 5 to 50 staff, running each sale from first call to signed contract.

What we are looking for
- At least 2 years in business-to-business sales, with a record of beating targets
- Confidence running live product demonstrations
- Experience keeping a pipeline up to date in Salesforce or a similar system
- A full UK driving licence, for client visits across the North West`,
          us: `Account Executive
Quillstone Software, Denver, CO (hybrid)

Quillstone makes booking and payments software for 3,000 small businesses across the US.

The role
You will win new business with companies of 5 to 50 employees, running each sale from first call to signed contract.

What we are looking for
- At least 2 years in business-to-business sales, with a record of beating quota
- Confidence running live product demos
- Experience keeping a pipeline up to date in Salesforce or a similar system
- A valid driver's license, for client visits across Colorado`,
        },
      },
      reason: "I want to sell software, and I want to build longer relationships with each customer.",
      recipient: { uk: "Mr Okoro", us: "Mr. Okoro" },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Sales Executive at Quillstone Software. I want to sell software, and I want to build longer relationships with each customer.",
          us: "I am applying for the role of Account Executive at Quillstone Software. I want to sell software, and I want to build longer relationships with each customer.",
        },
        {
          uk: "At Larchfield Telecom I sell business phone, broadband and mobile contracts to firms of 5 to 200 staff, closing an average of 9 new accounts a month. I reached 118% of a £240,000 yearly sales target in 2025, ranking 2nd out of 14 sales executives.",
          us: "At Larchfield Telecom I sell business phone, internet and cell plans to companies of 5 to 200 employees, closing an average of 9 new accounts a month. I reached 118% of a $300,000 annual quota in 2025, ranking 2nd of 14 sales representatives.",
        },
        {
          uk: "Your advert asks for confidence running live product demonstrations. I run around 12 live product demonstrations a month, with 1 in 3 turning into a signed contract. I book 25 to 30 meetings a month by prospecting through cold calls, LinkedIn messages and referrals from existing customers.",
          us: "Your advert asks for confidence running live product demos. I run around 12 live product demonstrations a month, with 1 in 3 turning into a signed contract. I book 25 to 30 meetings a month by prospecting through cold calls, LinkedIn messages and referrals from existing customers.",
        },
        "I keep a sales pipeline of around 60 open deals up to date in Salesforce, with monthly forecasts within 10% of actual sales. I close deals through price and contract negotiation with business owners and office managers, keeping the average discount under 8%.",
        {
          uk: "As a business development representative, I wrote 4 email sequences for new leads, raising the reply rate from 2% to 6% in 3 months. I hold a full UK driving licence. My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
          us: "As a sales development representative, I wrote 4 email sequences for new leads, raising the reply rate from 2% to 6% in 3 months. I hold a valid driver's license. My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
        },
      ],
    },
  },

  {
    id: "paralegal",
    industry: "legal",
    role: "Paralegal",
    level: "experienced",
    template: "executive",
    blurb: {
      uk: "A litigation paralegal with six years in commercial disputes and conveyancing, now working towards qualifying as a solicitor.",
      us: "A litigation paralegal with six years in commercial lawsuits and real estate closings, with a paralegal certificate and CP credential.",
    },
    person: { name: "Nadia Rahman", email: "nadia.rahman@example.com", phone: { uk: "07700 900402", us: "(312) 555-0125" }, location: { uk: "Birmingham", us: "Chicago, IL" } },
    profile: {
      uk: "Paralegal with six years in commercial litigation and residential conveyancing at two West Midlands law firms. Prepares trial bundles, runs disclosure reviews in Relativity and drafts witness statements for 3 solicitors. Cut the time to prepare a standard trial bundle from 2 days to half a day with new templates. Holds an LLB (Hons) in Law, passed the Solicitors Qualifying Examination part 1 (SQE1) in 2025 and is working towards qualifying as a solicitor.",
      us: "Litigation paralegal with six years in commercial litigation and residential real estate at two Chicago-area law firms. Prepares trial binders, runs document review in Relativity and drafts discovery requests for 3 attorneys. Cut the time to prepare a standard trial binder from 2 days to half a day with new templates. Holds a paralegal certificate from an American Bar Association (ABA)-approved program and the Certified Paralegal (CP) credential.",
    },
    experience: [
      {
        title: { uk: "Paralegal, Commercial Litigation", us: "Litigation Paralegal" },
        org: { uk: "Ashby Kemp Solicitors", us: "Ashby Kemp LLP" },
        location: { uk: "Birmingham", us: "Chicago, IL" },
        start: "2022-02",
        current: true,
        bullets: [
          { uk: "Support 3 solicitors on around 40 commercial disputes at a time, from pre-action letters to trial in the High Court and County Court", us: "Support 3 attorneys on around 40 commercial lawsuits at a time, from demand letters through trial in state and federal court" },
          { uk: "Prepare trial and hearing bundles of up to 4,000 pages, filed on time for 25 hearings and 3 trials in 2025", us: "Prepare trial binders and exhibit lists of up to 4,000 pages, filed on time for 25 hearings and 3 trials in 2025" },
          { uk: "Run disclosure reviews in Relativity for around 12 cases a year, coding up to 30,000 documents a case for relevance and privilege", us: "Run document review in Relativity for around 12 cases a year, coding up to 30,000 documents a case for relevance and privilege" },
          { uk: "Draft witness statements, chronologies and court applications for solicitor review, around 15 a month", us: "Draft discovery requests, deposition summaries and routine motions for attorney review, around 15 a month" },
          { uk: "Keep the key dates diary for 40 live cases, with no missed court deadline in 4 years", us: "Keep the docket calendar for 40 active cases, with no missed court deadline in 4 years" },
          { uk: "Cut the time to prepare a standard trial bundle from 2 days to half a day by building templates in the case management system", us: "Cut the time to prepare a standard trial binder from 2 days to half a day by building templates in the case management system" },
        ],
      },
      {
        title: { uk: "Conveyancing Assistant", us: "Real Estate Paralegal" },
        org: { uk: "Hartwell and Shaw Solicitors", us: "Hartwell and Shaw LLP" },
        location: { uk: "Solihull", us: "Oak Park, IL" },
        start: "2020-09",
        end: "2022-01",
        bullets: [
          { uk: "Progressed around 60 residential sales and purchases at a time for 2 conveyancing solicitors", us: "Coordinated around 60 residential closings at a time for 2 real estate attorneys" },
          { uk: "Ordered searches for around 25 new files a month and drafted replies to pre-contract enquiries for review", us: "Ordered title searches for around 25 new files a month and drafted responses to buyer requests for attorney review" },
          { uk: "Prepared completion statements and Stamp Duty Land Tax (SDLT) returns for around 20 completions a month", us: "Prepared settlement statements and closing documents for around 20 closings a month" },
          { uk: "Cut the average time from offer to exchange from 14 to 11 weeks by chasing searches and lenders every week", us: "Cut the average time from contract to closing from 60 to 45 days by chasing title companies and lenders every week" },
          "Answered around 30 client calls and emails a day, keeping buyers and sellers updated at each stage",
          { uk: "Checked identity and source of funds for around 40 new clients a month under anti-money laundering rules", us: "Verified identity and wire instructions for around 40 new files a month, with no wire fraud losses in 16 months" },
        ],
      },
    ],
    education: [
      {
        title: { uk: "LLB (Hons) Law", us: "Bachelor of Arts in Political Science" },
        org: { uk: "University of Birmingham", us: "University of Illinois Chicago" },
        end: "2020",
        grade: { uk: "2:1", us: "GPA 3.5" },
        bullets: [{ uk: "Reached the final of the university mooting competition out of 48 entrants", us: "Competed on the mock trial team for 2 years, reaching the regional final in 2019" }],
      },
    ],
    certificates: [
      { title: { uk: "Solicitors Qualifying Examination part 1 (SQE1), passed", us: "Certified Paralegal (CP)" }, org: { uk: "Solicitors Regulation Authority", us: "NALA, The Paralegal Association" }, end: "2025" },
      { title: { uk: "Relativity Certified User", us: "Paralegal Certificate (ABA-approved program)" }, org: { uk: "Relativity", us: "Roosevelt University" }, end: "2022" },
    ],
    volunteering: [
      {
        title: { uk: "Volunteer Adviser", us: "Intake Volunteer" },
        org: { uk: "Eastside Legal Advice Centre", us: "Westside Legal Aid Clinic" },
        location: { uk: "Birmingham", us: "Chicago, IL" },
        start: "2021-01",
        current: true,
        bullets: [
          { uk: "Interview around 6 clients each Saturday morning about housing and debt problems, under a supervising solicitor", us: "Interview around 6 clients each Saturday morning about housing and debt problems, under a supervising attorney" },
          "Write case notes and referral letters for around 25 clients a month, sent within 2 days of each visit",
        ],
      },
    ],
    skills: [
      { uk: "Trial bundles", us: "Trial binders" },
      { uk: "Disclosure reviews", us: "Document review" },
      "Relativity",
      { uk: "Witness statements", us: "Discovery requests" },
      { uk: "Key dates diary", us: "Docket calendar" },
      "Court deadlines",
      "Case management system",
      { uk: "Conveyancing", us: "Real estate closings" },
      { uk: "Completion statements", us: "Settlement statements" },
    ],
    names: ["Nadia", "Rahman", "Ashby", "Kemp", "Hartwell", "Solihull", "Fairbourne", "NALA", "Eastside", "Westside"],
    letter: {
      job: {
        title: { uk: "Senior Paralegal, Commercial Litigation", us: "Senior Litigation Paralegal" },
        employer: "Fairbourne Legal LLP",
        advert: {
          uk: `Senior Paralegal, Commercial Litigation
Fairbourne Legal LLP, Birmingham

Fairbourne Legal is a commercial law firm with 60 lawyers in Birmingham and Leeds.

The role
You will support a team of 4 solicitors on commercial disputes, from first instructions to trial, and help train junior paralegals.

What we are looking for
- Experience as a paralegal in commercial litigation
- Experience preparing court bundles and managing disclosure
- Confidence with e-disclosure software such as Relativity
- Strong organisation and a careful eye for court deadlines
- Progress towards qualifying as a solicitor or chartered legal executive`,
          us: `Senior Litigation Paralegal
Fairbourne Legal LLP, Chicago, IL

Fairbourne Legal is a commercial law firm with 60 attorneys in Chicago and Milwaukee.

The role
You will support a team of 4 attorneys on commercial lawsuits, from intake through trial, and help train junior paralegals.

What we are looking for
- Experience as a paralegal in commercial litigation
- Experience preparing trial binders and managing document review
- Confidence with e-discovery software such as Relativity
- Strong organization and a careful eye for court deadlines
- A paralegal certificate, with NALA or NFPA certification preferred`,
        },
      },
      reason: "I want to stay in commercial litigation and take on more of the trial preparation. I also want to help train junior paralegals.",
      recipient: { uk: "Ms Doyle", us: "Ms. Doyle" },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Paralegal, Commercial Litigation at Fairbourne Legal LLP. I want to stay in commercial litigation and take on more of the trial preparation. I also want to help train junior paralegals.",
          us: "I am applying for the role of Senior Litigation Paralegal at Fairbourne Legal LLP. I want to stay in commercial litigation and take on more of the trial preparation. I also want to help train junior paralegals.",
        },
        {
          uk: "At Ashby Kemp Solicitors I support 3 solicitors on around 40 commercial disputes at a time, from pre-action letters to trial in the High Court and County Court. I prepare trial and hearing bundles of up to 4,000 pages, filed on time for 25 hearings and 3 trials in 2025.",
          us: "At Ashby Kemp LLP I support 3 attorneys on around 40 commercial lawsuits at a time, from demand letters through trial in state and federal court. I prepare trial binders and exhibit lists of up to 4,000 pages, filed on time for 25 hearings and 3 trials in 2025.",
        },
        {
          uk: "Your advert asks for experience preparing court bundles and managing disclosure. I run disclosure reviews in Relativity for around 12 cases a year, coding up to 30,000 documents a case for relevance and privilege. I also cut the time to prepare a standard trial bundle from 2 days to half a day by building templates in the case management system.",
          us: "Your advert asks for experience preparing trial binders and managing document review. I run document review in Relativity for around 12 cases a year, coding up to 30,000 documents a case for relevance and privilege. I also cut the time to prepare a standard trial binder from 2 days to half a day by building templates in the case management system.",
        },
        {
          uk: "I keep the key dates diary for 40 live cases, with no missed court deadline in 4 years. I draft witness statements, chronologies and court applications for solicitor review, around 15 a month. Your advert asks for progress towards qualifying as a solicitor or chartered legal executive. I passed the Solicitors Qualifying Examination part 1 (SQE1) in 2025.",
          us: "I keep the docket calendar for 40 active cases, with no missed court deadline in 4 years. I draft discovery requests, deposition summaries and routine motions for attorney review, around 15 a month. Your advert asks for a paralegal certificate. I hold a paralegal certificate from an American Bar Association (ABA)-approved program and the Certified Paralegal (CP) credential.",
        },
        CLOSE,
      ],
    },
  },

  {
    id: "graphic-designer",
    industry: "design",
    role: "Graphic Designer",
    level: "experienced",
    template: "creative",
    blurb: "A graphic designer with seven years in brand identity, packaging and campaigns for food and drink clients.",
    person: {
      name: "Isla Thornton",
      email: "isla.thornton@example.com",
      phone: { uk: "07700 900403", us: "(503) 555-0126" },
      location: { uk: "Bristol", us: "Portland, OR" },
      links: ["portfolio.example.com/islathornton"],
    },
    profile: {
      uk: "Graphic designer with seven years in brand identity, packaging and campaign design, mostly for food and drink brands. Takes projects from sketches to print-ready files and digital assets in Adobe Creative Cloud and Figma. Designed packaging for a 24-product range now stocked in 1,100 supermarkets, and a brand redesign that lifted a client's online sales by 30% in a year. Writes brand guidelines for clients and mentors 2 junior designers.",
      us: "Graphic designer with seven years in brand identity, packaging and campaign design, mostly for food and beverage brands. Takes projects from sketches to print-ready files and digital assets in Adobe Creative Cloud and Figma. Designed packaging for a 24-product range now stocked in 1,100 grocery stores, and a brand redesign that lifted a client's online sales by 30% in a year. Writes brand guidelines for clients and mentors 2 junior designers.",
    },
    experience: [
      {
        title: "Graphic Designer",
        org: "Fieldhouse Studio",
        location: { uk: "Bristol", us: "Portland, OR" },
        start: "2021-03",
        current: true,
        bullets: [
          { uk: "Design brand identities, packaging and campaigns for 12 food and drink clients a year, from sketches to print-ready files", us: "Design brand identities, packaging and campaigns for 12 food and beverage clients a year, from sketches to print-ready files" },
          { uk: "Designed packaging for a 24-product range of sauces, now stocked in 1,100 supermarkets across the UK", us: "Designed packaging for a 24-product range of sauces, now stocked in 1,100 grocery stores across the US" },
          "Redesigned the brand of a family-run bakery chain, lifting online sales by 30% in the year after launch",
          "Wrote brand guidelines for 9 clients, so their in-house teams and printers could apply each identity consistently",
          "Mentor 2 junior designers through weekly design reviews and written feedback on every project",
          "Introduced a pre-press checklist with 3 printers, cutting reprints from 6 a year to 1",
        ],
      },
      {
        title: "Junior Graphic Designer",
        org: "Kite and Anchor Design",
        location: { uk: "Bristol", us: "Portland, OR" },
        start: "2019-07",
        end: "2021-02",
        bullets: [
          { uk: "Designed point-of-sale displays, leaflets and social media graphics for 20 retail and hospitality clients", us: "Designed in-store displays, posters and social media graphics for 20 retail and hospitality clients" },
          "Prepared around 40 print files a month in Adobe InDesign and Illustrator, checked against each printer's specifications",
          { uk: "Retouched and cut out 300 product photos a month in Adobe Photoshop for 3 online shops", us: "Retouched and cut out 300 product photos a month in Adobe Photoshop for 3 online stores" },
          "Animated 15 short social media ads in After Effects, raising click-through rates by 20% for 2 clients",
          "Designed menus, window displays and signs for 4 restaurant clients, updated with each seasonal menu",
        ],
      },
    ],
    projects: [
      {
        title: "Brewery identity and can range",
        org: "Freelance",
        start: "2024-05",
        end: "2024-09",
        bullets: [
          "Designed the identity and 6 can labels for an independent brewery, launched at 2 regional beer festivals",
          "Built social media templates in Figma that the brewery has used for weekly posts since launch",
          "Prepared artwork for the can printer and approved colour proofs on press for all 6 labels",
        ],
      },
      {
        title: "Wayfinding signs",
        org: { uk: "Community arts centre (volunteer)", us: "Community arts center (volunteer)" },
        start: "2023-02",
        end: "2023-06",
        bullets: [
          "Designed accessible wayfinding signs for a 3-floor arts building, tested with 12 visitors with low vision",
          "Chose type sizes and colours with a contrast ratio of at least 7:1 on every sign",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Graphic Design", us: "Bachelor of Fine Arts in Graphic Design" },
        org: { uk: "University of the West of England", us: "Portland State University" },
        end: "2019",
        grade: { uk: "First-class honours", us: "GPA 3.7" },
        bullets: [{ uk: "Final-year project on food labels for people with low vision, shown at the 2019 degree show", us: "Senior project on food labels for people with low vision, shown at the 2019 senior exhibition" }],
      },
    ],
    certificates: [{ title: "Adobe Certified Professional in Visual Design", org: "Adobe", end: "2023" }],
    skills: ["Brand identity", "Packaging design", "Brand guidelines", "Print-ready files", "Adobe Illustrator", "Adobe InDesign", "Adobe Photoshop", "Figma", "After Effects", "Accessible design"],
    names: ["Isla", "Thornton", "Fieldhouse", "InDesign", "Photoshop", "islathornton", "Brambleworth", "Wayfinding"],
    letter: {
      job: {
        title: "Senior Graphic Designer",
        employer: "Brambleworth Foods",
        advert: {
          uk: `Senior Graphic Designer
Brambleworth Foods, Bristol

Brambleworth Foods makes snacks and sauces sold in 2,500 shops across the UK.

The role
You will lead design for our packaging and campaigns, working with our marketing team and outside printers.

What we are looking for
- Experience designing packaging for food or drink brands
- Strong skills in Adobe Illustrator, InDesign and Photoshop
- Experience writing and looking after brand guidelines
- Experience mentoring junior designers
- A portfolio of print and digital work`,
          us: `Senior Graphic Designer
Brambleworth Foods, Portland, OR

Brambleworth Foods makes snacks and sauces sold in 2,500 stores across the US.

The role
You will lead design for our packaging and campaigns, working with our marketing team and outside printers.

What we are looking for
- Experience designing packaging for food or beverage brands
- Strong skills in Adobe Illustrator, InDesign and Photoshop
- Experience writing and maintaining brand guidelines
- Experience mentoring junior designers
- A portfolio of print and digital work`,
        },
      },
      reason: {
        uk: "I want to work in-house on one food brand and see each pack through from sketch to shelf.",
        us: "I want to work in-house on one food brand and see each package through from sketch to shelf.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Graphic Designer at Brambleworth Foods. I want to work in-house on one food brand and see each pack through from sketch to shelf.",
          us: "I am applying for the role of Senior Graphic Designer at Brambleworth Foods. I want to work in-house on one food brand and see each package through from sketch to shelf.",
        },
        {
          uk: "At Fieldhouse Studio I design brand identities, packaging and campaigns for 12 food and drink clients a year, from sketches to print-ready files. I designed packaging for a 24-product range of sauces, now stocked in 1,100 supermarkets across the UK.",
          us: "At Fieldhouse Studio I design brand identities, packaging and campaigns for 12 food and beverage clients a year, from sketches to print-ready files. I designed packaging for a 24-product range of sauces, now stocked in 1,100 grocery stores across the US.",
        },
        {
          uk: "Your advert asks for experience writing and looking after brand guidelines. I wrote brand guidelines for 9 clients, so their in-house teams and printers could apply each identity consistently. I also redesigned the brand of a family-run bakery chain, lifting online sales by 30% in the year after launch.",
          us: "Your advert asks for experience writing and maintaining brand guidelines. I wrote brand guidelines for 9 clients, so their in-house teams and printers could apply each identity consistently. I also redesigned the brand of a family-run bakery chain, lifting online sales by 30% in the year after launch.",
        },
        "I mentor 2 junior designers through weekly design reviews and written feedback on every project. I introduced a pre-press checklist with 3 printers, cutting reprints from 6 a year to 1. As a volunteer, I designed accessible wayfinding signs for a 3-floor arts building, tested with 12 visitors with low vision. Before Fieldhouse, I prepared around 40 print files a month in Adobe InDesign and Illustrator, checked against each printer's specifications.",
        {
          uk: "My CV and portfolio are attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
          us: "My resume and portfolio are attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
        },
      ],
    },
  },

  {
    id: "pr-executive",
    industry: "media",
    role: { uk: "PR Executive", us: "Public Relations Specialist" },
    level: "early",
    template: "modern",
    blurb: {
      uk: "A PR executive three years into consumer agency work, with national coverage for food, drink and travel clients.",
      us: "A public relations specialist three years into consumer agency work, with national placements for food, beverage and travel clients.",
    },
    person: { name: "Naomi Adeyemi", email: "naomi.adeyemi@example.com", phone: { uk: "07700 900404", us: "(212) 555-0127" }, location: { uk: "London", us: "New York, NY" } },
    profile: {
      uk: "PR executive with three years at two consumer PR agencies, working on food, drink and travel accounts. Writes press releases, sells stories in to journalists and builds media lists in Cision for 5 client accounts. Secured 140 pieces of coverage in 2025, including 12 in national newspapers. Holds the Foundation Certificate in Public Relations from the Chartered Institute of Public Relations (CIPR).",
      us: "Public relations specialist with three years at two consumer PR agencies, working on food, beverage and travel accounts. Writes press releases, pitches stories to reporters and builds media lists in Cision for 5 client accounts. Secured 140 media placements in 2025, including 12 in national outlets. Holds the Certificate in Principles of Public Relations from the Public Relations Society of America (PRSA).",
    },
    experience: [
      {
        title: { uk: "PR Executive", us: "Public Relations Specialist" },
        org: "Brindle PR",
        location: { uk: "London", us: "New York, NY" },
        start: "2024-06",
        current: true,
        bullets: [
          { uk: "Manage media relations for 5 consumer clients in food, drink and travel, reporting coverage to each every month", us: "Manage media relations for 5 consumer clients in food, beverage and travel, reporting coverage to each every month" },
          { uk: "Wrote and sold in 45 press releases in 2025, securing 140 pieces of coverage, 12 of them in national newspapers", us: "Wrote and pitched 45 press releases in 2025, landing 140 media placements, 12 of them in national outlets" },
          { uk: "Keep media lists of around 300 journalists up to date in Cision, tailored to each client launch", us: "Keep media lists of around 300 reporters up to date in Cision, tailored to each client launch" },
          "Organised a press trip to Lisbon for 8 travel journalists, producing 11 features within 3 months",
          { uk: "Drafted holding statements and media answers for a client's product recall, handling 30 calls from journalists over 2 weeks", us: "Drafted holding statements and media answers for a client's product recall, handling 30 media inquiries over 2 weeks" },
          "Monitor social media and news coverage each morning for 2 clients, flagging issues to account directors within the hour",
        ],
      },
      {
        title: { uk: "PR Assistant", us: "Public Relations Assistant" },
        org: "Lantern Lane Communications",
        location: { uk: "London", us: "New York, NY" },
        start: "2023-09",
        end: "2024-05",
        bullets: [
          "Compiled daily coverage reports for 8 clients, tracking reach and key messages in each article",
          "Drafted 20 press releases and 30 social media posts a month for account managers to review",
          "Booked venues and managed guest lists for 3 press launches of 40 to 60 guests",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Journalism Studies", us: "Bachelor of Science in Public Relations" },
        org: { uk: "University of Sheffield", us: "Syracuse University" },
        end: "2023",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Foundation Certificate in Public Relations", us: "Certificate in Principles of Public Relations" },
        org: { uk: "Chartered Institute of Public Relations", us: "Public Relations Society of America" },
        end: "2024",
      },
    ],
    skills: ["Press releases", "Media relations", "Media lists", "Cision", "Coverage reports", "Press trips", "Holding statements", "Media monitoring", "Social media"],
    names: ["Adeyemi", "Brindle", "Cision", "Saltmarsh"],
    letter: {
      job: {
        title: { uk: "Senior PR Executive, Food and Drink", us: "Senior Account Executive, Food and Beverage" },
        employer: "Saltmarsh Communications",
        advert: {
          uk: `Senior PR Executive, Food and Drink
Saltmarsh Communications, London (hybrid)

Saltmarsh is a consumer PR agency working with 20 food and drink brands.

The role
You will run media relations for 4 to 6 client accounts and help manage our junior team.

What we are looking for
- At least 2 years in consumer PR, ideally in food and drink
- Strong writing, from press releases to features
- Good contacts with national and trade journalists
- Experience planning press trips and events
- Calm judgement when a client faces a difficult story`,
          us: `Senior Account Executive, Food and Beverage
Saltmarsh Communications, New York, NY (hybrid)

Saltmarsh is a consumer PR agency working with 20 food and beverage brands.

The role
You will run media relations for 4 to 6 client accounts and help manage our junior team.

What we are looking for
- At least 2 years in consumer PR, ideally in food and beverage
- Strong writing, from press releases to features
- Good contacts with national and trade reporters
- Experience planning press trips and events
- Calm judgment when a client faces a difficult story`,
        },
      },
      reason: {
        uk: "Food and drink accounts are the work I enjoy most. I want to run more of my own accounts.",
        us: "Food and beverage accounts are the work I enjoy most. I want to run more of my own accounts.",
      },
      recipient: { uk: "Ms Farrow", us: "Ms. Farrow" },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior PR Executive, Food and Drink at Saltmarsh Communications. Food and drink accounts are the work I enjoy most. I want to run more of my own accounts.",
          us: "I am applying for the role of Senior Account Executive, Food and Beverage at Saltmarsh Communications. Food and beverage accounts are the work I enjoy most. I want to run more of my own accounts.",
        },
        {
          uk: "At Brindle PR I manage media relations for 5 consumer clients in food, drink and travel, reporting coverage to each every month. In 2025 I wrote and sold in 45 press releases, securing 140 pieces of coverage, 12 of them in national newspapers.",
          us: "At Brindle PR I manage media relations for 5 consumer clients in food, beverage and travel, reporting coverage to each every month. In 2025 I wrote and pitched 45 press releases, landing 140 media placements, 12 of them in national outlets.",
        },
        "Your advert asks for experience planning press trips and events. I organised a press trip to Lisbon for 8 travel journalists, producing 11 features within 3 months. At Lantern Lane Communications I booked venues and managed guest lists for 3 press launches of 40 to 60 guests.",
        {
          uk: "Your advert also asks for calm judgement when a client faces a difficult story. I drafted holding statements and media answers for a client's product recall, handling 30 calls from journalists over 2 weeks. I also monitor social media and news coverage each morning for 2 clients, flagging issues to account directors within the hour.",
          us: "Your advert also asks for calm judgment when a client faces a difficult story. I drafted holding statements and media answers for a client's product recall, handling 30 media inquiries over 2 weeks. I also monitor social media and news coverage each morning for 2 clients, flagging issues to account directors within the hour.",
        },
        {
          uk: "I hold the Foundation Certificate in Public Relations from the Chartered Institute of Public Relations (CIPR). My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
          us: "I hold the Certificate in Principles of Public Relations from the Public Relations Society of America (PRSA). My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
        },
      ],
    },
  },

  {
    id: "policy-officer",
    industry: "public-sector",
    role: { uk: "Policy Officer", us: "Policy Analyst" },
    level: "experienced",
    template: "standard",
    blurb: {
      uk: "A policy officer in central government with six years in adult skills and employment policy.",
      us: "A state government policy analyst with six years in workforce and job training policy.",
    },
    person: { name: "Owen Gallagher", email: "owen.gallagher@example.com", phone: { uk: "07700 900405", us: "(916) 555-0128" }, location: { uk: "Sheffield", us: "Sacramento, CA" } },
    profile: {
      uk: "Policy officer at Higher Executive Officer grade with six years in adult skills and employment policy, in central and local government. Writes ministerial submissions, briefings and consultation responses, and leads on eligibility and funding rates for a £320 million yearly adult skills fund. Ran a public consultation that drew 1,450 responses and shaped new eligibility rules for 2026. Member of the Policy Profession, with a master's degree in public policy.",
      us: "Policy analyst with six years in workforce and job training policy, in state and county government. Writes decision memos, briefings and analysis of new bills, and leads on eligibility and funding levels for $400 million a year in job training grants. Ran a public comment period that drew 1,450 comments and shaped new eligibility rules for 2026. Holds a Master of Public Policy and Administration and briefs agency leadership every week.",
    },
    experience: [
      {
        title: { uk: "Policy Officer (Higher Executive Officer), Adult Skills", us: "Policy Analyst, Workforce Programs" },
        org: { uk: "Central government department", us: "State workforce development agency" },
        location: { uk: "Sheffield", us: "Sacramento, CA" },
        start: "2023-04",
        current: true,
        bullets: [
          { uk: "Lead policy on eligibility and funding rates for a £320 million yearly adult skills fund, in a team of 4 reporting to a Grade 7", us: "Lead policy on eligibility and funding levels for $400 million a year in job training grants, in a team of 4 reporting to the policy manager" },
          { uk: "Wrote 30 ministerial submissions and briefings in 2025, each cleared with legal, finance and analysis colleagues before deadline", us: "Wrote 30 decision memos and briefings in 2025 for the agency director, each cleared with legal and budget staff before deadline" },
          { uk: "Ran a 12-week public consultation that drew 1,450 responses, and drafted the published government response", us: "Ran a 60-day public comment period on new grant rules that drew 1,450 comments, and drafted the agency's published responses" },
          "Built the evidence base with 2 analysts from labour market data and 40 stakeholder interviews, used to set new eligibility rules",
          { uk: "Draft answers to around 15 parliamentary questions and 40 letters to ministers a month, all within deadline", us: "Prepare a written analysis of around 20 bills each legislative session, with cost estimates from the budget office" },
          { uk: "Run a quarterly forum with 25 colleges, employer groups and local authorities to test policy options before they go to ministers", us: "Run a quarterly forum with 25 community colleges, workforce boards and employer groups to test policy options before they go to leadership" },
        ],
      },
      {
        title: "Policy Officer",
        org: { uk: "Calderbrook Council", us: "Riverbend County Workforce Board" },
        location: { uk: "Halifax", us: "Stockton, CA" },
        start: "2020-09",
        end: "2023-03",
        bullets: [
          { uk: "Wrote the council's employment and skills strategy, agreed by cabinet in 2022 and backed by £4.5 million of funding", us: "Wrote the board's 4-year workforce plan, approved by county supervisors in 2022 and backed by $5.5 million in funding" },
          { uk: "Prepared 25 committee reports and briefings for councillors, each signed off by legal and finance officers", us: "Prepared 25 staff reports and briefings for county supervisors, each signed off by county counsel and finance staff" },
          { uk: "Analysed survey data from 2,300 residents to set priorities for 4 adult learning programmes", us: "Analyzed survey data from 2,300 residents to set priorities for 4 adult education programs" },
          { uk: "Formed a partnership of 18 employers and 3 colleges that created 240 work placements in 2 years", us: "Formed a partnership of 18 employers and 3 community colleges that created 240 paid internships in 2 years" },
          { uk: "Responded to 120 freedom of information requests a year, all within the 20-working-day limit", us: "Responded to 120 public records requests a year, all within the 10-day legal deadline" },
          { uk: "Briefed the cabinet member for skills each month on 6 programmes and their spending against budget", us: "Briefed the board chair each month on 6 programs and their spending against budget" },
        ],
      },
      {
        title: "Research Assistant",
        org: "Ridgeway Policy Institute",
        location: { uk: "Leeds", us: "Davis, CA" },
        start: "2019-09",
        end: "2020-08",
        bullets: [
          { uk: "Researched and co-wrote 3 published reports on adult skills and low pay, cited in 2 parliamentary debates", us: "Researched and co-wrote 3 published reports on job training and low pay, cited in 2 state legislative hearings" },
          { uk: "Ran 30 interviews with employers and learners for a study of apprenticeships", us: "Ran 30 interviews with employers and trainees for a study of apprenticeship programs" },
          { uk: "Built a dataset of 150 local skills schemes in Excel, used by 3 researchers for the institute's 2020 report", us: "Built a dataset of 150 local job training programs in Excel, used by 3 researchers for the institute's 2020 report" },
          { uk: "Presented findings at 4 events for employers, colleges and local officials", us: "Presented findings at 4 events for employers, community colleges and local officials" },
        ],
      },
    ],
    education: [
      {
        title: { uk: "MSc Public Policy", us: "Master of Public Policy and Administration" },
        org: { uk: "University of Bristol", us: "California State University, Sacramento" },
        end: "2019",
        grade: { uk: "Merit", us: "GPA 3.8" },
      },
      {
        title: { uk: "BA (Hons) Economics and Politics", us: "Bachelor of Arts in Economics" },
        org: { uk: "University of Leeds", us: "University of California, Davis" },
        end: "2017",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    skills: [
      "Policy options",
      { uk: "Ministerial submissions", us: "Decision memos" },
      "Briefings",
      { uk: "Public consultations", us: "Public comment periods" },
      "Stakeholder interviews",
      "Labour market data",
      { uk: "Parliamentary questions", us: "Bill analysis" },
      { uk: "Freedom of information requests", us: "Public records requests" },
      "Survey data",
      "Excel",
    ],
    names: ["Gallagher", "Calderbrook", "Riverbend", "Ridgeway", "Pennine"],
    letter: {
      job: {
        title: { uk: "Senior Policy Officer, Adult Skills", us: "Senior Policy Analyst" },
        employer: { uk: "Pennine Combined Authority", us: "Sierra Workforce Alliance" },
        advert: {
          uk: `Senior Policy Officer, Adult Skills
Pennine Combined Authority, Halifax (hybrid)

We are taking on new powers over adult skills funding for 1.2 million residents.

The role
You will lead a team of 3 policy officers, write papers for the mayor and council leaders, and work with colleges and employers on how the funding is spent.

What we are looking for
- Experience of adult skills or employment policy in central or local government
- Strong writing for senior decision makers
- Experience running consultations and working with stakeholders
- Confidence using data and research as evidence`,
          us: `Senior Policy Analyst
Sierra Workforce Alliance, Sacramento, CA (hybrid)

We advise state and local leaders on job training for 1.2 million workers across Northern California.

The role
You will lead a team of 3 policy analysts, write briefs for legislators and agency leaders, and work with community colleges and employers on how training funds are spent.

What we are looking for
- Experience in workforce or job training policy in state or local government
- Strong writing for senior decision makers
- Experience running public comment processes and working with stakeholders
- Confidence using data and research as evidence`,
        },
      },
      reason: {
        uk: "I want to work on adult skills closer to the places that use the funding. I also want to lead a small policy team.",
        us: "I want to work on job training closer to the communities that use the funding. I also want to lead a small policy team.",
      },
      recipient: { uk: "Mr Shah", us: "Mr. Shah" },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Policy Officer, Adult Skills at Pennine Combined Authority. I want to work on adult skills closer to the places that use the funding. I also want to lead a small policy team.",
          us: "I am applying for the role of Senior Policy Analyst at Sierra Workforce Alliance. I want to work on job training closer to the communities that use the funding. I also want to lead a small policy team.",
        },
        {
          uk: "In a central government department I lead policy on eligibility and funding rates for a £320 million yearly adult skills fund, in a team of 4 reporting to a Grade 7. I wrote 30 ministerial submissions and briefings in 2025, each cleared with legal, finance and analysis colleagues before deadline.",
          us: "At a state workforce development agency I lead policy on eligibility and funding levels for $400 million a year in job training grants, in a team of 4 reporting to the policy manager. I wrote 30 decision memos and briefings in 2025 for the agency director, each cleared with legal and budget staff before deadline.",
        },
        {
          uk: "Your advert asks for experience running consultations and working with stakeholders. I ran a 12-week public consultation that drew 1,450 responses, and drafted the published government response. I also run a quarterly forum with 25 colleges, employer groups and local authorities to test policy options before they go to ministers.",
          us: "Your advert asks for experience running public comment processes and working with stakeholders. I ran a 60-day public comment period on new grant rules that drew 1,450 comments, and drafted the agency's published responses. I also run a quarterly forum with 25 community colleges, workforce boards and employer groups to test policy options before they go to leadership.",
        },
        {
          uk: "Your advert also asks for confidence using data and research as evidence. I built the evidence base with 2 analysts from labour market data and 40 stakeholder interviews, used to set new eligibility rules. At Calderbrook Council I analysed survey data from 2,300 residents to set priorities for 4 adult learning programmes.",
          us: "Your advert also asks for confidence using data and research as evidence. I built the evidence base with 2 analysts from labor market data and 40 stakeholder interviews, used to set new eligibility rules. At Riverbend County Workforce Board I analyzed survey data from 2,300 residents to set priorities for 4 adult education programs.",
        },
        CLOSE,
      ],
    },
  },
];
