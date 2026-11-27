import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** More examples, added 27 Nov 2026 to fill gaps by level and industry. */
export const MORE_D: ExampleSpec[] = [
  {
    id: "ux-designer",
    industry: "design",
    role: "UX Designer",
    level: "experienced",
    template: "portfolio",
    blurb: "A UX designer with seven years in banking and travel apps, from usability tests to a shared design system.",
    person: {
      name: "Freya Lindqvist",
      email: "freya.lindqvist@example.com",
      phone: { uk: "07700 900622", us: "(317) 555-0147" },
      location: { uk: "Edinburgh", us: "Indianapolis, IN" },
      links: ["portfolio.example.com/freyalindqvist"],
    },
    profile: {
      uk: "UX designer with seven years in banking and travel, the last four on a mobile banking app used by 1.8 million customers. Plans and runs user research, from customer interviews to moderated usability tests, and turns what it finds into prototypes in Figma. Redesigned the app's account opening journey, raising completion from 41% to 68% in 6 months. Built and looks after a design system of 140 components used by 5 product teams.",
      us: "UX designer with seven years in banking and travel, the last four on a mobile banking app used by 1.8 million customers. Plans and runs user research, from customer interviews to moderated usability tests, and turns what it finds into prototypes in Figma. Redesigned the app's account opening flow, raising completion from 41% to 68% in 6 months. Built and maintains a design system of 140 components used by 5 product teams.",
    },
    projects: [
      {
        title: "Savings goals feature",
        org: "Fernhollow Bank",
        start: "2024-02",
        end: "2024-09",
        bullets: [
          "Led research with 18 customers who saved irregularly, finding that 2 in 3 gave up on a goal after missing a month",
          "Designed and tested 3 prototypes with 15 customers, choosing a flexible goal that customers can pause without losing progress",
          "Launched the feature to 1.8 million customers in September 2024, with 210,000 goals set up within 6 months",
        ],
      },
      {
        title: "Food bank referral form",
        org: "Volunteer project",
        start: "2023-04",
        end: "2023-07",
        bullets: [
          "Redesigned the online referral form for a food bank, cutting the average time to complete it from 12 minutes to 5",
          "Tested the new form with 7 support workers and 4 volunteers, fixing 15 problems before launch",
        ],
      },
    ],
    experience: [
      {
        title: "UX Designer",
        org: "Fernhollow Bank",
        location: { uk: "Edinburgh", us: "Indianapolis, IN" },
        start: "2022-03",
        current: true,
        bullets: [
          "Lead research and design for the savings and payments areas of a mobile banking app used by 1.8 million customers",
          { uk: "Redesigned the account opening journey after 24 usability tests, raising completion from 41% to 68% in 6 months", us: "Redesigned the account opening flow after 24 usability tests, raising completion from 41% to 68% in 6 months" },
          "Run moderated usability tests with 8 to 10 customers every 2 weeks, sharing findings with product managers and engineers within 2 days",
          "Built a design system in Figma of 140 components, now used by 5 product teams and cutting design-to-build time by 30%",
          "Brought the app up to the Web Content Accessibility Guidelines (WCAG) 2.2, fixing 85 issues found in an audit with 6 screen reader users",
          "Cut calls to the contact centre about failed payments by 22% by rewriting 30 error messages with the content designer",
        ],
      },
      {
        title: "UX Designer",
        org: "Bluewing Travel",
        location: { uk: "Glasgow", us: "Chicago, IL" },
        start: "2019-06",
        end: "2022-02",
        bullets: [
          "Designed the booking flow for a travel app and website with 400,000 monthly users, raising completed bookings by 15% in a year",
          "Ran 40 customer interviews and 3 diary studies on how families plan trips, shaping the product roadmap for 2021",
          "Built clickable prototypes in Figma for 12 features and tested each with 5 customers before engineers wrote any code",
          "Cut the steps to change a booking from 9 to 4, lowering calls to the contact centre by 18%",
          "Tested 2 versions of each of 6 checkout pages with the analytics team, lifting conversion from 3.1% to 3.6%",
        ],
      },
      {
        title: "Junior Digital Designer",
        org: "Copperleaf Digital",
        location: { uk: "Edinburgh", us: "Indianapolis, IN" },
        start: "2017-09",
        end: "2019-05",
        bullets: [
          { uk: "Designed wireframes and page layouts for 9 client websites, from charities to local councils", us: "Designed wireframes and page layouts for 9 client websites, from charities to city governments" },
          "Ran 5 card sorting studies to plan site menus, with users finding content 30% faster in follow-up tests",
          "Prepared design files and notes for 4 developers, cutting rework requests from around 10 a sprint to 3",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Psychology", us: "Bachelor of Science in Psychology" },
        org: { uk: "University of Stirling", us: "Purdue University" },
        start: "2013",
        end: "2017",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    skills: ["User research", "Usability testing", "Customer interviews", "Prototyping", "Figma", "Design systems", "Accessibility", "Wireframes", "Card sorting"],
    names: ["Freya", "Lindqvist", "freyalindqvist", "Fernhollow", "Bluewing", "Copperleaf", "Pinemoor", "Stirling", "Purdue", "wireframes", "Prototyping"],
    letter: {
      job: {
        title: "Senior UX Designer",
        employer: { uk: "Pinemoor Building Society", us: "Pinemoor Credit Union" },
        advert: {
          uk: `Senior UX Designer
Pinemoor Building Society, Edinburgh (hybrid)

Pinemoor looks after the savings and mortgages of 600,000 members across Scotland.

The role
You will lead research and design for our new mobile app, working with 2 product teams and our accessibility lead.

What we are looking for
- Experience designing mobile apps in banking or financial services
- Confidence planning and running usability tests
- Experience building or looking after a design system in Figma
- A good working knowledge of accessibility standards
- A portfolio that shows your research and your designs`,
          us: `Senior UX Designer
Pinemoor Credit Union, Indianapolis, IN (hybrid)

Pinemoor serves the savings and mortgage needs of 600,000 members across Indiana.

The role
You will lead research and design for our new mobile app, working with 2 product teams and our accessibility lead.

What we are looking for
- Experience designing mobile apps in banking or financial services
- Confidence planning and running usability tests
- Experience building or maintaining a design system in Figma
- A good working knowledge of accessibility standards
- A portfolio that shows your research and your designs`,
        },
      },
      reason: "I want to design for a member-owned organisation. I also want to lead the research and design for a whole app.",
      recipient: { uk: "Ms Barclay", us: "Ms. Barclay" },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior UX Designer at Pinemoor Building Society. I want to design for a member-owned organisation. I also want to lead the research and design for a whole app.",
          us: "I am applying for the role of Senior UX Designer at Pinemoor Credit Union. I want to design for a member-owned organization. I also want to lead the research and design for a whole app.",
        },
        {
          uk: "At Fernhollow Bank I lead research and design for the savings and payments areas of a mobile banking app used by 1.8 million customers. I redesigned the account opening journey after 24 usability tests, raising completion from 41% to 68% in 6 months.",
          us: "At Fernhollow Bank I lead research and design for the savings and payments areas of a mobile banking app used by 1.8 million customers. I redesigned the account opening flow after 24 usability tests, raising completion from 41% to 68% in 6 months.",
        },
        "Your advert asks for confidence planning and running usability tests. I run moderated usability tests with 8 to 10 customers every 2 weeks, sharing findings with product managers and engineers within 2 days. For a savings goals feature, I led research with 18 customers who saved irregularly and tested 3 prototypes with 15 customers.",
        {
          uk: "Your advert also asks for experience building or looking after a design system in Figma. I built a design system in Figma of 140 components, now used by 5 product teams and cutting design-to-build time by 30%. I also brought the app up to the Web Content Accessibility Guidelines (WCAG) 2.2, fixing 85 issues found in an audit with 6 screen reader users.",
          us: "Your advert also asks for experience building or maintaining a design system in Figma. I built a design system in Figma of 140 components, now used by 5 product teams and cutting design-to-build time by 30%. I also brought the app up to the Web Content Accessibility Guidelines (WCAG) 2.2, fixing 85 issues found in an audit with 6 screen reader users.",
        },
        {
          uk: "My CV and portfolio are attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
          us: "My resume and portfolio are attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
        },
      ],
    },
  },

  {
    id: "account-manager",
    industry: "sales",
    role: "Account Manager",
    level: "experienced",
    template: "framework",
    blurb: {
      uk: "An account manager with nine years in business-to-business software, renewing and growing a £3.2 million book of customers.",
      us: "An account manager with nine years in business-to-business software, renewing and growing a $4 million book of customers.",
    },
    person: { name: "Tobias Ferrand", email: "tobias.ferrand@example.com", phone: { uk: "07700 900623", us: "(414) 555-0149" }, location: { uk: "Bristol", us: "Milwaukee, WI" } },
    profile: {
      uk: "Account manager with nine years in business-to-business software, looking after 45 mid-sized customers worth £3.2 million a year in subscriptions. Renewed 96% of contract value in 2025 and grew revenue from existing accounts by 24% by upselling extra users and new modules. Runs quarterly business reviews with finance and operations directors and keeps every account plan in Salesforce. Holds a full UK driving licence and visits clients across the South West and Wales.",
      us: "Account manager with nine years in business-to-business software, managing 45 mid-sized customers worth $4 million a year in subscriptions. Renewed 96% of contract value in 2025 and grew revenue from existing accounts by 24% by upselling extra users and new modules. Runs quarterly business reviews with finance and operations directors and keeps every account plan in Salesforce. Holds a valid driver's license and visits clients across Wisconsin and northern Illinois.",
    },
    experience: [
      {
        title: "Account Manager",
        org: "Tallyworks Software",
        location: { uk: "Bristol", us: "Milwaukee, WI" },
        start: "2022-01",
        current: true,
        bullets: [
          { uk: "Manage 45 mid-sized customers on a finance and payroll platform, with a combined £3.2 million a year in subscriptions", us: "Manage 45 mid-sized customers on a finance and payroll platform, with a combined $4 million a year in subscriptions" },
          "Renewed 96% of contract value in 2025 against a target of 90%, by starting renewal talks 120 days before each end date",
          "Grew revenue from existing accounts by 24% in 2025 by upselling extra users and 6 new modules",
          "Run quarterly business reviews with finance and operations directors at 20 key accounts, agreeing a success plan with each for the year",
          "Cut early cancellations from 9% to 4% of customers in 2 years by setting up health scores in Salesforce that flag low use 90 days ahead",
          "Raised average contract length from 14 to 26 months in 2025 through negotiation of 3-year renewals with 12 customers",
        ],
      },
      {
        title: "Customer Success Manager",
        org: "Brackenridge Systems",
        location: { uk: "Bristol", us: "Milwaukee, WI" },
        start: "2019-03",
        end: "2021-12",
        bullets: [
          "Brought 70 new small business customers onto an online booking system in 2020, with 92% live within 30 days",
          "Kept 94% of customers at renewal over 2 years, against a team average of 88%",
          "Ran 25 online training sessions a year for customer admins, cutting support tickets from new accounts by 30%",
          { uk: "Passed 40 upgrade leads a year to the sales team, worth £180,000 in new yearly revenue", us: "Passed 40 upgrade leads a year to the sales team, worth $220,000 in new annual revenue" },
          "Built a monthly renewal forecast for 300 accounts in Salesforce, finishing 2021 within 3% of the forecast",
          "Wrote 15 help centre articles on payroll year-end, cutting related support calls by 25% in 2021",
        ],
      },
      {
        title: { uk: "Business Development Representative", us: "Sales Development Representative" },
        org: "Brackenridge Systems",
        location: { uk: "Bristol", us: "Milwaukee, WI" },
        start: "2017-09",
        end: "2019-02",
        bullets: [
          { uk: "Called 50 to 70 businesses a day, booking 15 product demonstrations a month for 4 account executives", us: "Called 50 to 70 businesses a day, booking 15 product demos a month for 4 account executives" },
          "Reached 112% of the yearly meeting target in 2018, ranking 3rd of 10 representatives",
          "Cleaned 2,000 lead records in Salesforce, cutting duplicate records from 11% to 2%",
          "Started a referral scheme with 25 existing customers, producing 40 qualified leads in 2018",
        ],
      },
    ],
    volunteering: [
      {
        title: "Volunteer Mentor",
        org: { uk: "Avonside Young Enterprise", us: "Lakefront Junior Business Club" },
        location: { uk: "Bristol", us: "Milwaukee, WI" },
        start: "2021-09",
        current: true,
        bullets: [
          { uk: "Mentor 2 teams of sixth-form students a year through a 9-month company programme, with both teams reaching the regional final in 2025", us: "Mentor 2 teams of high school students a year through a 9-month company program, with both teams reaching the state final in 2025" },
          "Run 4 workshops a year on pricing and selling for around 30 students",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business and Marketing", us: "Bachelor of Business Administration" },
        org: { uk: "Cardiff University", us: "University of Wisconsin-Milwaukee" },
        start: "2014",
        end: "2017",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [{ title: "Salesforce Certified Administrator", org: "Salesforce", end: "2023" }],
    skills: [
      "Account management",
      "Renewals",
      "Upselling",
      "Quarterly business reviews",
      "Contract negotiation",
      "Health scores",
      "Salesforce",
      "Customer training",
      { uk: "Product demonstrations", us: "Product demos" },
    ],
    names: ["Tobias", "Ferrand", "Tallyworks", "Brackenridge", "Northvale", "Avonside", "Lakefront", "Milwaukee", "Wisconsin", "admins"],
    letter: {
      job: {
        title: "Senior Account Manager",
        employer: "Northvale Software",
        advert: {
          uk: `Senior Account Manager
Northvale Software, Bristol (hybrid)

Northvale makes stock and ordering software for 1,200 wholesalers across the UK.

The role
You will look after 30 of our largest customers, owning renewals and growth for each account.

What we are looking for
- At least 4 years managing business-to-business software accounts
- A record of high renewal rates and account growth
- Experience running business reviews with senior customers
- Confidence negotiating multi-year contracts
- A full UK driving licence, for regular client visits`,
          us: `Senior Account Manager
Northvale Software, Milwaukee, WI (hybrid)

Northvale makes inventory and ordering software for 1,200 wholesalers across the US.

The role
You will manage 30 of our largest customers, owning renewals and growth for each account.

What we are looking for
- At least 4 years managing business-to-business software accounts
- A record of high renewal rates and account growth
- Experience running business reviews with senior customers
- Confidence negotiating multi-year contracts
- A valid driver's license, for regular client visits`,
        },
      },
      reason: "I want to look after fewer, larger accounts and get to know each customer well.",
      recipient: { uk: "Mr Hughes", us: "Mr. Hughes" },
      paragraphs: [
        "I am applying for the role of Senior Account Manager at Northvale Software. I want to look after fewer, larger accounts and get to know each customer well.",
        {
          uk: "At Tallyworks Software I manage 45 mid-sized customers on a finance and payroll platform, with a combined £3.2 million a year in subscriptions. Your advert asks for a record of high renewal rates and account growth. I renewed 96% of contract value in 2025 against a target of 90%, by starting renewal talks 120 days before each end date. I also grew revenue from existing accounts by 24% in 2025 by upselling extra users and 6 new modules.",
          us: "At Tallyworks Software I manage 45 mid-sized customers on a finance and payroll platform, with a combined $4 million a year in subscriptions. Your advert asks for a record of high renewal rates and account growth. I renewed 96% of contract value in 2025 against a target of 90%, by starting renewal talks 120 days before each end date. I also grew revenue from existing accounts by 24% in 2025 by upselling extra users and 6 new modules.",
        },
        "Your advert also asks for experience running business reviews with senior customers. I run quarterly business reviews with finance and operations directors at 20 key accounts, agreeing a success plan with each for the year. I raised average contract length from 14 to 26 months in 2025 through negotiation of 3-year renewals with 12 customers.",
        {
          uk: "I cut early cancellations from 9% to 4% of customers in 2 years by setting up health scores in Salesforce that flag low use 90 days ahead. As a customer success manager at Brackenridge Systems, I kept 94% of customers at renewal over 2 years, against a team average of 88%. I hold a full UK driving licence.",
          us: "I cut early cancellations from 9% to 4% of customers in 2 years by setting up health scores in Salesforce that flag low use 90 days ahead. As a customer success manager at Brackenridge Systems, I kept 94% of customers at renewal over 2 years, against a team average of 88%. I hold a valid driver's license.",
        },
        CLOSE,
      ],
    },
  },

  {
    id: "police-officer",
    industry: "public-sector",
    role: { uk: "Police Constable", us: "Police Officer" },
    level: "experienced",
    template: "standard",
    blurb: {
      uk: "A police constable with six years on emergency response and a neighbourhood team, who tutors student officers.",
      us: "A police officer with six years on patrol and in community policing, who trains new recruits as a field training officer.",
    },
    person: { name: "Danielle Okoye", email: "danielle.okoye@example.com", phone: { uk: "07700 900624", us: "(804) 555-0150" }, location: { uk: "Leicester", us: "Richmond, VA" } },
    profile: {
      uk: "Police constable with six years in Fosseway Police, three on emergency response and three on a neighbourhood policing team. Covers a ward of 14,000 residents and cut antisocial behaviour reports there by 35% in 2025 through a problem-solving plan with the council and housing providers. Arrested 210 suspects on response, with 92% of case files accepted by the Crown Prosecution Service without rework. Holds independent patrol status and a standard response driving qualification, and tutors student officers.",
      us: "Police officer with six years at Jamesford County Police Department, three on patrol and three in the community policing unit. Covers a beat of 14,000 residents and cut disorder complaints there by 35% in 2025 through a problem-solving plan with the county and housing providers. Arrested 210 suspects on patrol, with 92% of cases accepted by the Commonwealth's Attorney without rework. Certified through Virginia's Peace Officer Standards and Training (POST) agency, the Department of Criminal Justice Services, and trains new recruits as a field training officer.",
    },
    experience: [
      {
        title: { uk: "Police Constable, Neighbourhood Policing Team", us: "Police Officer, Community Policing Unit" },
        org: { uk: "Fosseway Police", us: "Jamesford County Police Department" },
        location: { uk: "Leicester", us: "Richmond, VA" },
        start: "2023-10",
        current: true,
        bullets: [
          { uk: "Cover a ward of 14,000 residents with 2 police community support officers, handling around 30 crimes and calls a month", us: "Cover a beat of 14,000 residents with 2 community service officers, handling around 30 crimes and calls for service a month" },
          { uk: "Cut antisocial behaviour reports on the ward by 35% in 2025 through a problem-solving plan with the council, 2 housing providers and local schools", us: "Cut disorder complaints on the beat by 35% in 2025 through a problem-solving plan with the county, 2 housing providers and local schools" },
          { uk: "Executed 3 drugs warrants with the local support team after 4 months of intelligence gathering, leading to 9 arrests and 6 charges", us: "Served 3 narcotics search warrants with the tactical team after 4 months of surveillance, leading to 9 arrests and 6 indictments" },
          { uk: "Hold monthly ward meetings with residents and councillors, raising attendance from around 10 to 45 people in a year", us: "Hold monthly community meetings with residents and county supervisors, raising attendance from around 10 to 45 people in a year" },
          { uk: "Visit 20 repeat victims of crime each month, cutting repeat burglaries on the ward from 18 to 7 in a year", us: "Visit 20 repeat victims of crime each month, cutting repeat burglaries on the beat from 18 to 7 in a year" },
          { uk: "Tutor 2 student officers a year as a tutor constable, with all 5 so far reaching independent patrol status on time", us: "Train 2 recruits a year as a field training officer, with all 5 so far released to solo patrol on time" },
        ],
      },
      {
        title: { uk: "Police Constable, Emergency Response", us: "Police Officer, Patrol Division" },
        org: { uk: "Fosseway Police", us: "Jamesford County Police Department" },
        location: { uk: "Leicester", us: "Richmond, VA" },
        start: "2020-09",
        end: "2023-09",
        bullets: [
          { uk: "Attended around 1,800 emergency and priority calls over 3 years, from domestic abuse and assaults to road traffic collisions", us: "Answered around 1,800 emergency and priority calls for service over 3 years, from domestic violence and assaults to traffic crashes" },
          { uk: "Arrested 210 suspects over 3 years, with 92% of case files accepted by the Crown Prosecution Service (CPS) without rework", us: "Arrested 210 suspects over 3 years, with 92% of cases accepted by the Commonwealth's Attorney without rework" },
          { uk: "Completed Domestic Abuse, Stalking and Harassment (DASH) risk assessments for around 15 victims a month, referring high-risk cases to partner agencies within 24 hours", us: "Completed lethality assessments for around 15 domestic violence victims a month, referring high-danger cases to advocates within 24 hours" },
          "Gave first aid at around 40 incidents, including cardiopulmonary resuscitation (CPR) at 3 cardiac arrests before paramedics arrived",
          { uk: "Passed the standard response driving course in 2021, then drove to around 600 emergency calls with no collisions", us: "Completed emergency vehicle operations training in 2021, then drove to around 600 emergency calls with no collisions" },
          { uk: "Recorded body-worn video at every incident, with the footage used as evidence in 14 contested trials", us: "Recorded body-worn camera footage at every incident, with the footage used as evidence in 14 contested trials" },
        ],
      },
      {
        title: { uk: "Security Officer", us: "Loss Prevention Officer" },
        org: { uk: "Belgrave Court Shopping Centre", us: "Westover Commons Mall" },
        location: { uk: "Leicester", us: "Richmond, VA" },
        start: "2017-06",
        end: "2020-08",
        bullets: [
          { uk: "Patrolled a 90-store shopping centre in a team of 6, responding to around 25 incidents a week", us: "Patrolled a 90-store shopping mall in a team of 6, responding to around 25 incidents a week" },
          "Detained around 60 shoplifters for the police over 3 years, writing a statement for each case",
          "Trained 8 new security officers in radio procedure and first aid",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Criminology", us: "Bachelor of Science in Criminal Justice" },
        org: { uk: "University of Leicester", us: "Virginia Commonwealth University" },
        start: "2013",
        end: "2017",
        grade: { uk: "2:1", us: "GPA 3.3" },
      },
    ],
    certificates: [
      { title: { uk: "Graduate Diploma in Professional Policing Practice (Degree Holder Entry Programme)", us: "Crisis Intervention Team training, 40 hours" }, org: { uk: "University of Derby", us: "Jamesford County Police Department" }, end: "2022" },
      { title: { uk: "Independent patrol status", us: "Virginia law enforcement certification" }, org: { uk: "Fosseway Police", us: "Virginia Department of Criminal Justice Services" }, end: "2021" },
      { title: { uk: "Standard response driving course", us: "Basic Law Enforcement Academy, 24 weeks" }, org: { uk: "Fosseway Police", us: "Jamesford County Police Academy" }, end: "2021" },
      { title: { uk: "Tutor constable course", us: "Field training officer certification" }, org: { uk: "Fosseway Police", us: "Jamesford County Police Department" }, end: "2023" },
    ],
    volunteering: [
      {
        title: { uk: "Special Constable", us: "Auxiliary Police Officer" },
        org: { uk: "Fosseway Police", us: "Jamesford County Police Department" },
        location: { uk: "Leicester", us: "Richmond, VA" },
        start: "2018-05",
        end: "2020-08",
        bullets: [
          { uk: "Gave 24 hours a month to response and neighbourhood shifts alongside full-time work, over 2 years", us: "Gave 24 hours a month to patrol shifts alongside full-time work, over 2 years" },
          "Joined 15 licensing visits and 30 night-time patrols in the city centre before applying to join as a regular officer",
        ],
      },
    ],
    skills: [
      { uk: "Emergency response", us: "Emergency calls" },
      { uk: "Neighbourhood policing", us: "Community policing" },
      "Problem solving",
      "Arrests",
      { uk: "Case files", us: "Search warrants" },
      { uk: "Risk assessments", us: "Lethality assessments" },
      "First aid",
      { uk: "Response driving", us: "Emergency vehicle operations" },
      { uk: "Tutoring student officers", us: "Field training" },
      { uk: "Body-worn video", us: "Body-worn cameras" },
    ],
    names: ["Danielle", "Okoye", "Fosseway", "Jamesford", "Belgrave", "Westover", "Peakmoor", "Laurel", "Transferee", "antisocial", "lethality", "shoplifters"],
    letter: {
      job: {
        title: { uk: "Police Constable (Transferee), Neighbourhood Policing", us: "Police Officer (Lateral Entry), Community Policing" },
        employer: { uk: "Peakmoor Constabulary", us: "Laurel Ridge County Police Department" },
        advert: {
          uk: `Police Constable (Transferee), Neighbourhood Policing
Peakmoor Constabulary, Buxton

We police a mix of market towns and rural villages for 420,000 residents.

The role
You will join a neighbourhood team covering 3 towns, working with councils, schools and housing providers to solve local problems.

What we are looking for
- Serving police constables with independent patrol status
- Experience of neighbourhood policing or problem-solving with partners
- A standard response driving qualification
- Experience tutoring student officers`,
          us: `Police Officer (Lateral Entry), Community Policing
Laurel Ridge County Police Department, Charlottesville, VA

We serve a mix of small towns and rural communities with 420,000 residents.

The role
You will join a community policing unit covering 3 towns, working with county agencies, schools and housing providers to solve local problems.

What we are looking for
- Certified Virginia law enforcement officers who have completed field training
- Experience in community policing or problem-solving with partners
- Completed emergency vehicle operations training
- Experience as a field training officer`,
        },
      },
      reason: {
        uk: "I am moving to the Peak District to be closer to family, and I want to keep working in neighbourhood policing.",
        us: "I am moving to Charlottesville to be closer to family, and I want to keep working in community policing.",
      },
      recipient: { uk: "Inspector Walsh", us: "Lieutenant Walsh" },
      paragraphs: [
        {
          uk: "I am applying for the role of Police Constable (Transferee), Neighbourhood Policing at Peakmoor Constabulary. I am moving to the Peak District to be closer to family, and I want to keep working in neighbourhood policing.",
          us: "I am applying for the role of Police Officer (Lateral Entry), Community Policing at Laurel Ridge County Police Department. I am moving to Charlottesville to be closer to family, and I want to keep working in community policing.",
        },
        {
          uk: "I am a police constable with six years in Fosseway Police, three on emergency response and three on a neighbourhood policing team. I hold independent patrol status and a standard response driving qualification.",
          us: "I am a police officer with six years at Jamesford County Police Department, three on patrol and three in the community policing unit. I am certified through Virginia's Peace Officer Standards and Training (POST) agency, the Department of Criminal Justice Services.",
        },
        {
          uk: "Your advert asks for experience of neighbourhood policing or problem-solving with partners. I cover a ward of 14,000 residents with 2 police community support officers, handling around 30 crimes and calls a month. I cut antisocial behaviour reports on the ward by 35% in 2025 through a problem-solving plan with the council, 2 housing providers and local schools. I also hold monthly ward meetings with residents and councillors, raising attendance from around 10 to 45 people in a year.",
          us: "Your advert asks for experience in community policing or problem-solving with partners. I cover a beat of 14,000 residents with 2 community service officers, handling around 30 crimes and calls for service a month. I cut disorder complaints on the beat by 35% in 2025 through a problem-solving plan with the county, 2 housing providers and local schools. I also hold monthly community meetings with residents and county supervisors, raising attendance from around 10 to 45 people in a year.",
        },
        {
          uk: "Your advert also asks for experience tutoring student officers. I tutor 2 student officers a year as a tutor constable, with all 5 so far reaching independent patrol status on time. On response, I arrested 210 suspects over 3 years, with 92% of case files accepted by the Crown Prosecution Service (CPS) without rework.",
          us: "Your advert also asks for experience as a field training officer. I train 2 recruits a year as a field training officer, with all 5 so far released to solo patrol on time. On patrol, I arrested 210 suspects over 3 years, with 92% of cases accepted by the Commonwealth's Attorney without rework.",
        },
        CLOSE,
      ],
    },
  },

  {
    id: "paramedic",
    industry: "healthcare",
    role: "Paramedic",
    level: "experienced",
    template: "ward",
    blurb: {
      uk: "A registered paramedic with ten years on emergency ambulances who mentors student paramedics as a practice educator.",
      us: "A nationally registered paramedic with ten years on 911 ambulances who precepts paramedic students.",
    },
    person: { name: "Gareth Pryce", email: "gareth.pryce@example.com", phone: { uk: "07700 900625", us: "(860) 555-0151" }, location: { uk: "Gloucester", us: "Hartford, CT" } },
    profile: {
      uk: "Paramedic registered with the Health and Care Professions Council (HCPC), with ten years on front-line emergency ambulances, the last eight as a paramedic. Attends around 1,400 emergency calls a year as lead clinician, from cardiac arrests and strokes to falls, and treats or refers around 30% of patients without taking them to hospital. Mentors 4 student paramedics a year as a practice educator, with all 14 so far passing their placements. Holds an Advanced Life Support certificate and a driving licence for vehicles up to 7.5 tonnes (C1), with emergency response driving.",
      us: "Paramedic with ten years on emergency ambulances in a busy 911 system, the last eight as a paramedic, holding National Registry Paramedic certification and a Connecticut paramedic license. Responds to around 1,400 emergency calls a year as lead paramedic, from cardiac arrests and strokes to falls, and cut on-scene time for suspected strokes from 24 to 16 minutes. Precepts 4 paramedic students a year, with all 14 so far passing their field internships. Holds current Advanced Cardiovascular Life Support (ACLS) and Pediatric Advanced Life Support (PALS) certifications.",
    },
    experience: [
      {
        title: "Paramedic",
        org: { uk: "Severnside Ambulance Service NHS Trust", us: "Talcott Valley Ambulance" },
        location: { uk: "Gloucester", us: "Hartford, CT" },
        start: "2020-09",
        current: true,
        bullets: [
          { uk: "Attend around 1,400 emergency calls a year as lead clinician on an emergency ambulance, from cardiac arrests and strokes to falls", us: "Respond to around 1,400 emergency calls a year as lead paramedic on an advanced life support ambulance, from cardiac arrests and strokes to falls" },
          { uk: "Assess every patient and treat around 30% at home or refer them to community teams, against a trust average of 24%", us: "Assess around 120 patients a month, cutting average on-scene time for suspected strokes from 24 to 16 minutes with a pre-alert checklist" },
          { uk: "Read 12-lead electrocardiograms (ECGs) on scene, taking 85 heart attack patients straight to a cardiac centre in 2025, all within 150 minutes of the call", us: "Read 12-lead electrocardiograms (ECGs) on scene, taking 85 heart attack patients straight to a cardiac center in 2025, all within 90 minutes" },
          "Led resuscitation at 22 cardiac arrests in 2025, with 7 patients regaining a pulse before arrival at hospital",
          { uk: "Mentor 4 student paramedics a year as a practice educator, with all 14 so far passing their placements", us: "Precept 4 paramedic students a year as a field preceptor, with all 14 so far passing their field internships" },
          "Cut average handover times at 2 emergency departments from 28 to 17 minutes by setting up a structured handover with the hospital teams",
        ],
      },
      {
        title: { uk: "Newly Qualified Paramedic", us: "Paramedic (Probationary)" },
        org: { uk: "Severnside Ambulance Service NHS Trust", us: "Talcott Valley Ambulance" },
        location: { uk: "Gloucester", us: "Hartford, CT" },
        start: "2018-09",
        end: "2020-08",
        bullets: [
          { uk: "Completed the 2-year newly qualified paramedic programme, signing off 40 clinical competencies within 20 months", us: "Completed a 6-month field training program with a senior paramedic, signing off 40 clinical skills within 5 months" },
          { uk: "Attended around 1,200 emergency calls a year across Gloucestershire, including 300 calls on a solo rapid response car", us: "Responded to around 1,200 emergency calls a year across Hartford County, including 300 calls on a solo paramedic fly car" },
          { uk: "Gave pain relief to around 30 patients a month with morphine and Entonox under national guidelines", us: "Gave pain relief to around 30 patients a month with fentanyl and ketorolac under state protocols" },
          { uk: "Raised around 6 safeguarding referrals a month for adults and children at risk, each before the end of the shift", us: "Filed around 6 mandated reports a month to adult and child protective services, each before the end of the shift" },
          { uk: "Recorded every patient contact on electronic patient records within 15 minutes of handover, with no missing records in an audit of 200 cases", us: "Recorded every patient contact in electronic patient care reports within 15 minutes of handover, with no missing reports in an audit of 200 cases" },
        ],
      },
      {
        title: { uk: "Emergency Care Assistant (bank)", us: "Emergency Medical Technician (EMT), part-time" },
        org: { uk: "Severnside Ambulance Service NHS Trust", us: "Talcott Valley Ambulance" },
        location: { uk: "Gloucester", us: "Hartford, CT" },
        start: "2016-06",
        end: "2018-08",
        bullets: [
          { uk: "Covered 2 bank shifts a month alongside paramedic studies, on emergency ambulances across Gloucestershire", us: "Covered 2 per diem shifts a month alongside college, on basic life support ambulances across Hartford County" },
          { uk: "Took observations and set up equipment for around 10 patients a shift, flagging changes to the paramedic", us: "Took vital signs and gave oxygen to around 10 patients a shift, flagging changes to the paramedic" },
          { uk: "Passed the emergency response driving course in 2016, then drove around 500 emergency journeys with no collisions", us: "Completed the Emergency Vehicle Operator Course (EVOC) in 2016, then drove around 500 emergency responses with no collisions" },
        ],
      },
    ],
    certificates: [
      { title: { uk: "Paramedic, Health and Care Professions Council (HCPC)", us: "National Registry Paramedic (NRP) and Connecticut paramedic license" }, org: { uk: "Registration PA012345", us: "National Registry of Emergency Medical Technicians and Connecticut Department of Public Health" }, end: "2018" },
      { title: { uk: "Practice Educator course", us: "Field Preceptor course" }, org: { uk: "University of the West of England", us: "Talcott Valley Ambulance" }, end: "2022" },
      { title: { uk: "Advanced Life Support", us: "Advanced Cardiovascular Life Support (ACLS) and Pediatric Advanced Life Support (PALS)" }, org: { uk: "Resuscitation Council UK", us: "American Heart Association" }, end: "2025" },
      { title: { uk: "Full UK driving licence, categories B and C1", us: "Emergency Medical Technician certification, State of Connecticut" }, org: { uk: "Driver and Vehicle Licensing Agency", us: "Connecticut Department of Public Health" }, end: "2016" },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Paramedic Science", us: "Bachelor of Science in Paramedicine" },
        org: { uk: "University of the West of England", us: "University of New Haven" },
        start: "2015",
        end: "2018",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    skills: [
      "Patient assessment",
      "Cardiac arrests",
      "Resuscitation",
      "Electrocardiograms",
      "Pain relief",
      { uk: "Mentoring", us: "Precepting" },
      "Handover",
      { uk: "Safeguarding", us: "Mandated reporting" },
      { uk: "Patient records", us: "Patient care reports" },
      "Emergency driving",
    ],
    names: ["Gareth", "Pryce", "Severnside", "Talcott", "Mercia", "Entonox", "fentanyl", "ketorolac", "Precept", "Precepts", "Precepting", "preceptor", "Paramedicine", "Gloucestershire"],
    letter: {
      job: {
        title: { uk: "Clinical Team Leader", us: "Paramedic Field Training Officer" },
        employer: { uk: "Mercia Ambulance Service NHS Trust", us: "Shoreline Regional Ambulance" },
        advert: {
          uk: `Clinical Team Leader
Mercia Ambulance Service NHS Trust, Worcester

We answer 900,000 emergency calls a year across the West Midlands and the Welsh borders.

The role
You will lead a team of 12 paramedics and emergency care assistants, work on the road as a senior clinician, and support the learning of student paramedics.

What we are looking for
- Registration with the Health and Care Professions Council as a paramedic
- At least 5 years of front-line experience
- Experience as a practice educator for student paramedics
- Good clinical judgement and care with patient records`,
          us: `Paramedic Field Training Officer
Shoreline Regional Ambulance, New Haven, CT

We answer 90,000 emergency calls a year across southern Connecticut.

The role
You will train new paramedics on the road, precept paramedic students, and review patient care reports.

What we are looking for
- National Registry Paramedic certification and a Connecticut paramedic license
- At least 5 years as a paramedic in a busy 911 system
- Experience precepting paramedic students
- Current ACLS and PALS certification`,
        },
      },
      reason: {
        uk: "I want to lead a team on the road and spend more of my time teaching student paramedics.",
        us: "I want to train new paramedics on the road and spend more of my time teaching paramedic students.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Clinical Team Leader at Mercia Ambulance Service NHS Trust. I want to lead a team on the road and spend more of my time teaching student paramedics.",
          us: "I am applying for the role of Paramedic Field Training Officer at Shoreline Regional Ambulance. I want to train new paramedics on the road and spend more of my time teaching paramedic students.",
        },
        {
          uk: "I am a paramedic registered with the Health and Care Professions Council (HCPC), with ten years on front-line emergency ambulances. At Severnside Ambulance Service NHS Trust I attend around 1,400 emergency calls a year as lead clinician on an emergency ambulance, from cardiac arrests and strokes to falls. I led resuscitation at 22 cardiac arrests in 2025, with 7 patients regaining a pulse before arrival at hospital.",
          us: "I am a paramedic with ten years on emergency ambulances in a busy 911 system. I hold National Registry Paramedic certification and a Connecticut paramedic license. At Talcott Valley Ambulance I respond to around 1,400 emergency calls a year as lead paramedic on an advanced life support ambulance, from cardiac arrests and strokes to falls. I led resuscitation at 22 cardiac arrests in 2025, with 7 patients regaining a pulse before arrival at hospital.",
        },
        {
          uk: "Your advert asks for experience as a practice educator for student paramedics. I mentor 4 student paramedics a year as a practice educator, with all 14 so far passing their placements. I also cut average handover times at 2 emergency departments from 28 to 17 minutes by setting up a structured handover with the hospital teams.",
          us: "Your advert asks for experience precepting paramedic students. I precept 4 paramedic students a year as a field preceptor, with all 14 so far passing their field internships. I also cut average handover times at 2 emergency departments from 28 to 17 minutes by setting up a structured handover with the hospital teams.",
        },
        {
          uk: "Your advert also asks for care with patient records. As a newly qualified paramedic, I recorded every patient contact on electronic patient records within 15 minutes of handover, with no missing records in an audit of 200 cases.",
          us: "Your advert also mentions reviewing patient care reports. As a probationary paramedic, I recorded every patient contact in electronic patient care reports within 15 minutes of handover, with no missing reports in an audit of 200 cases. I hold current Advanced Cardiovascular Life Support (ACLS) and Pediatric Advanced Life Support (PALS) certifications.",
        },
        CLOSE,
      ],
    },
  },

  {
    id: "solicitor",
    industry: "legal",
    role: { uk: "Solicitor", us: "Associate Attorney" },
    level: "experienced",
    template: "executive",
    blurb: {
      uk: "An employment solicitor five years qualified, running Employment Tribunal claims and advising employers on restructures.",
      us: "An employment associate five years into practice after a federal clerkship, defending employers in state and federal court.",
    },
    person: { name: "Harriet Vance", email: "harriet.vance@example.com", phone: { uk: "07700 900626", us: "(908) 555-0152" }, location: { uk: "Leeds", us: "Summit, NJ" } },
    profile: {
      uk: "Employment solicitor with five years' post-qualification experience at a Leeds commercial firm, acting for employers in disputes, restructures and policy work. Runs a caseload of around 30 Employment Tribunal claims, from unfair dismissal to discrimination, and closed 42 claims in 2025, settling 31 within the client's budget. Drafts settlement agreements and handbooks and trains HR teams at 12 clients a year. Admitted as a solicitor in 2021, with a current practising certificate from the Solicitors Regulation Authority.",
      us: "Employment attorney with five years in practice at a New Jersey firm, after a two-year federal clerkship, defending employers in state and federal court and before agencies. Manages a docket of around 30 employment litigation cases, from wrongful termination to discrimination claims, and closed 42 matters in 2025, settling 34 within the client's budget. Drafts separation agreements and handbooks and trains human resources teams at 12 clients a year. Admitted to the New Jersey bar in 2019 and the New York bar in 2020.",
    },
    experience: [
      {
        title: { uk: "Solicitor, Employment", us: "Associate Attorney, Labor and Employment" },
        org: "Ashcombe Ridley LLP",
        location: { uk: "Leeds", us: "Summit, NJ" },
        start: "2021-09",
        current: true,
        bullets: [
          { uk: "Run a caseload of around 30 Employment Tribunal claims for employers, from unfair dismissal to disability and race discrimination", us: "Manage a docket of around 30 employment litigation cases for employers in state and federal court, from wrongful termination to disability and race discrimination claims" },
          { uk: "Closed 42 tribunal claims in 2025, winning 9 at hearing and settling 31 through Acas early conciliation or negotiation within the client's budget", us: "Closed 42 matters in 2025, winning 6 on summary judgment and settling 34 through mediation or negotiation within the client's budget" },
          { uk: "Advised 15 employers on restructures and redundancies in 2025, covering around 600 roles with no successful tribunal claims", us: "Responded to 18 charges of discrimination before the Equal Employment Opportunity Commission (EEOC) in 2025, with 15 dismissed at the agency stage" },
          { uk: "Draft around 20 settlement agreements a month, with a template and checklist that cut drafting time from 3 hours to 1", us: "Draft around 20 separation agreements a month, with a template and checklist that cut drafting time from 3 hours to 1" },
          { uk: "Rewrote the staff handbooks of 8 clients after the 2024 law changes on flexible working, each signed off within 6 weeks", us: "Rewrote the employee handbooks of 8 clients after New Jersey's 2025 pay transparency law, each approved within 6 weeks" },
          { uk: "Run 12 training sessions a year for client HR teams on discipline, grievances and sickness absence, each rated 4.6 out of 5 or higher", us: "Run 12 training sessions a year for client human resources teams on harassment prevention and leave laws, each rated 4.6 out of 5 or higher" },
        ],
      },
      {
        title: { uk: "Trainee Solicitor", us: "Law Clerk to a United States Magistrate Judge" },
        org: { uk: "Ashcombe Ridley LLP", us: "United States District Court for the District of New Jersey" },
        location: { uk: "Leeds", us: "Newark, NJ" },
        start: "2019-09",
        end: "2021-08",
        bullets: [
          { uk: "Completed 4 six-month seats in employment, commercial property, corporate and litigation, qualifying into the employment team in 2021", us: "Drafted around 90 opinions and orders on discovery disputes and motions to amend over 2 years, most adopted with few edits" },
          { uk: "Prepared hearing bundles and witness statements for 25 Employment Tribunal hearings, all filed on time", us: "Prepared bench memos for 120 settlement conferences, with 70% of the cases settling at or after the conference" },
          { uk: "Drafted 60 commercial leases and licences in the property seat, cutting the team's backlog from 6 weeks to 2", us: "Kept the chambers calendar for around 300 civil cases, with no missed deadline in 2 years" },
          "Researched case law for 40 employment and civil rights matters, each with a one-page summary",
        ],
      },
      {
        title: { uk: "Paralegal, Employment", us: "Law Clerk (part-time), Employment Group" },
        org: "Ashcombe Ridley LLP",
        location: { uk: "Leeds", us: "Summit, NJ" },
        start: "2017-06",
        end: "2019-08",
        bullets: [
          { uk: "Managed the key dates diary for around 50 tribunal claims, with no missed deadline in 2 years", us: "Managed the docket calendar for around 50 employment cases, with no missed deadline in 2 years" },
          { uk: "Prepared first drafts of 30 tribunal responses a year for solicitor review", us: "Prepared first drafts of 30 answers to complaints a year for attorney review" },
          { uk: "Studied the Legal Practice Course part-time alongside full-time work, passing with a distinction in 2019", us: "Clerked 20 hours a week alongside full-time law school, earning a job offer from the firm in 2019" },
        ],
      },
    ],
    volunteering: [
      {
        title: { uk: "Volunteer Adviser, Employment Clinic", us: "Pro Bono Attorney, Workers' Rights Clinic" },
        org: { uk: "Kirkgate Law Centre", us: "Essex Valley Legal Aid" },
        location: { uk: "Leeds", us: "Newark, NJ" },
        start: "2021-10",
        current: true,
        bullets: [
          { uk: "Advise around 4 workers a month on dismissal, pay and discrimination at an evening clinic run with 3 other solicitors", us: "Advise around 4 workers a month on unpaid wages, leave and discrimination at an evening clinic run with 3 other attorneys" },
          { uk: "Drafted tribunal claim forms for 6 clients in 2025, with 5 of the claims settling through Acas", us: "Drafted complaints for 6 clients in 2025, with 5 of the cases settling before trial" },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Legal Practice Course (LPC)", us: "Juris Doctor (JD)" },
        org: { uk: "University of Law, Leeds", us: "Seton Hall University School of Law" },
        end: "2019",
        grade: { uk: "Distinction", us: "GPA 3.5" },
      },
      {
        title: { uk: "LLB (Hons) Law", us: "Bachelor of Arts in History" },
        org: { uk: "University of Leeds", us: "Rutgers University" },
        end: "2016",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      { title: { uk: "Admitted as a solicitor of England and Wales", us: "Admitted to the New Jersey bar" }, org: { uk: "Solicitors Regulation Authority, 2021", us: "Supreme Court of New Jersey, 2019" } },
      { title: { uk: "Member, Employment Lawyers Association", us: "Admitted to the New York bar" }, org: { uk: "Employment Lawyers Association", us: "New York State Unified Court System, 2020" } },
    ],
    skills: [
      { uk: "Employment Tribunal claims", us: "Employment litigation" },
      { uk: "Settlement agreements", us: "Separation agreements" },
      "Discrimination",
      { uk: "Restructures", us: "Summary judgment" },
      { uk: "Acas early conciliation", us: "Mediation" },
      { uk: "Staff handbooks", us: "Employee handbooks" },
      "Negotiation",
      "Case law research",
      "Client training",
      { uk: "Hearing bundles", us: "Bench memos" },
    ],
    names: ["Harriet", "Vance", "Ashcombe", "Ridley", "Juris", "Kirkgate", "bono", "Ousebridge", "Acas", "Seton", "Rutgers"],
    letter: {
      job: {
        title: { uk: "Senior Associate, Employment", us: "Senior Associate Attorney, Labor and Employment" },
        employer: "Ousebridge Legal LLP",
        advert: {
          uk: `Senior Associate, Employment
Ousebridge Legal LLP, York (hybrid)

Ousebridge is a regional law firm with 90 lawyers acting for businesses and public bodies across Yorkshire.

The role
You will run your own caseload of Employment Tribunal claims, advise clients on restructures and policies, and supervise a trainee solicitor.

What we are looking for
- A solicitor with at least 4 years' post-qualification experience in employment law
- Experience running Employment Tribunal claims to hearing
- Confidence drafting settlement agreements and handbooks
- Experience training HR teams
- A current practising certificate`,
          us: `Senior Associate Attorney, Labor and Employment
Ousebridge Legal LLP, Morristown, NJ (hybrid)

Ousebridge is a regional law firm with 90 attorneys representing businesses and public employers across New Jersey.

The role
You will manage your own docket of employment cases, advise clients on reductions in force and policies, and mentor junior associates.

What we are looking for
- Admission to the New Jersey bar and at least 4 years of employment litigation experience
- Experience defending discrimination claims in state and federal court
- Confidence drafting separation agreements and employee handbooks
- Experience training human resources teams`,
        },
      },
      reason: {
        uk: "I want to act for public bodies and businesses, and to supervise trainee solicitors.",
        us: "I want to represent public employers and businesses, and to mentor junior associates.",
      },
      recipient: { uk: "Mr Fenwick", us: "Mr. Fenwick" },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Associate, Employment at Ousebridge Legal LLP. I want to act for public bodies and businesses, and to supervise trainee solicitors.",
          us: "I am applying for the role of Senior Associate Attorney, Labor and Employment at Ousebridge Legal LLP. I want to represent public employers and businesses, and to mentor junior associates.",
        },
        {
          uk: "I am an employment solicitor with five years' post-qualification experience at a Leeds commercial firm. At Ashcombe Ridley LLP I run a caseload of around 30 Employment Tribunal claims for employers, from unfair dismissal to disability and race discrimination. I closed 42 tribunal claims in 2025, winning 9 at hearing and settling 31 through Acas early conciliation or negotiation within the client's budget.",
          us: "I am an employment attorney with five years in practice at a New Jersey firm, after a two-year federal clerkship. At Ashcombe Ridley LLP I manage a docket of around 30 employment litigation cases for employers in state and federal court, from wrongful termination to disability and race discrimination claims. I closed 42 matters in 2025, winning 6 on summary judgment and settling 34 through mediation or negotiation within the client's budget.",
        },
        {
          uk: "Your advert asks for confidence drafting settlement agreements and handbooks. I draft around 20 settlement agreements a month, with a template and checklist that cut drafting time from 3 hours to 1. I also rewrote the staff handbooks of 8 clients after the 2024 law changes on flexible working, each signed off within 6 weeks.",
          us: "Your advert asks for confidence drafting separation agreements and employee handbooks. I draft around 20 separation agreements a month, with a template and checklist that cut drafting time from 3 hours to 1. I also rewrote the employee handbooks of 8 clients after New Jersey's 2025 pay transparency law, each approved within 6 weeks.",
        },
        {
          uk: "Your advert also asks for experience training HR teams. I run 12 training sessions a year for client HR teams on discipline, grievances and sickness absence, each rated 4.6 out of 5 or higher. I was admitted as a solicitor in 2021 and hold a current practising certificate. As a volunteer, I advise around 4 workers a month on dismissal, pay and discrimination at an evening clinic.",
          us: "Your advert also asks for experience training human resources teams. I run 12 training sessions a year for client human resources teams on harassment prevention and leave laws, each rated 4.6 out of 5 or higher. I was admitted to the New Jersey bar in 2019 and the New York bar in 2020. As a pro bono attorney, I advise around 4 workers a month on unpaid wages, leave and discrimination at an evening clinic.",
        },
        CLOSE,
      ],
    },
  },

  {
    id: "research-scientist",
    industry: "science",
    role: "Principal Research Scientist",
    level: "senior",
    template: "research",
    blurb: {
      uk: "A principal scientist leading a drug discovery biology team, with a programme in the clinic, 22 papers and 4 granted patents.",
      us: "A principal scientist leading a drug discovery biology team, with a program in the clinic, 22 papers and 4 issued patents.",
    },
    person: { name: "Anika Varga", email: "anika.varga@example.com", phone: { uk: "07700 900627", us: "(973) 555-0153" }, location: { uk: "Cambridge", us: "Morristown, NJ" } },
    profile: {
      uk: "Principal research scientist with 14 years in immunology research, the last ten in drug discovery, leading a team of 6 biologists on small-molecule programmes for inflammatory diseases. Took 2 programmes from target to candidate drug, one now in a phase 1 clinical trial, and is a named inventor on 4 granted patents. Has published 22 peer-reviewed papers, cited over 1,900 times, and won £2.4 million in grant funding with university partners. Sets the team's assay and screening strategy and manages a lab budget of £850,000 a year.",
      us: "Principal research scientist with 14 years in immunology research, the last ten in drug discovery, leading a team of 6 biologists on small-molecule programs for inflammatory diseases. Took 2 programs from target to development candidate, one now in a phase 1 clinical trial, and is a named inventor on 4 issued patents. Has published 22 peer-reviewed papers, cited over 1,900 times, and won $3.1 million in grant funding, including a National Institutes of Health (NIH) Small Business Innovation Research (SBIR) grant. Sets the team's assay and screening strategy and manages a lab budget of $1.1 million a year.",
    },
    experience: [
      {
        title: "Principal Research Scientist, Inflammation Biology",
        org: "Corvane Therapeutics",
        location: { uk: "Cambridge", us: "Morristown, NJ" },
        start: "2021-04",
        current: true,
        bullets: [
          "Lead a team of 6 biologists running target validation and screening for 3 small-molecule programmes in inflammatory disease",
          { uk: "Took an oral inhibitor programme from target to candidate drug in 4 years, now in a phase 1 clinical trial with 48 healthy volunteers", us: "Took an oral inhibitor program from target to development candidate in 4 years, now in a phase 1 clinical trial with 48 healthy volunteers" },
          "Built a screening cascade of 8 cell-based assays, cutting the time from new compound to potency result from 3 weeks to 6 days",
          { uk: "Won £1.2 million from Innovate UK in 2023 with 2 university partners for a 3-year study of new targets in lung fibrosis", us: "Won a $1.5 million NIH SBIR grant in 2023 with 2 university partners for a 3-year study of new targets in lung fibrosis" },
          { uk: "Manage a lab budget of £850,000 a year and 2 outsourcing contracts, finishing 2025 within 2% of budget", us: "Manage a lab budget of $1.1 million a year and 2 outsourcing contracts, finishing 2025 within 2% of budget" },
          "Mentor 3 senior scientists, with 2 promoted in 2024 and 2025",
        ],
      },
      {
        title: "Senior Scientist, Immunology",
        org: "Halberd Pharmaceuticals",
        location: { uk: "Stevenage", us: "Bridgewater, NJ" },
        start: "2016-03",
        end: "2021-03",
        bullets: [
          "Ran a high-throughput screen of 250,000 compounds with the screening group, giving 4 lead series for the chemistry team",
          "Designed and validated 12 cell-based and biochemical assays, used to test around 3,000 compounds a year",
          { uk: "Found a new target in macrophage signalling through a gene-editing screen of 2,000 genes, published in 2019 and now a company programme", us: "Found a new target in macrophage signaling through a gene-editing screen of 2,000 genes, published in 2019 and now a company program" },
          "Led 3 scientists on a joint project with a university group, producing 3 papers and 1 patent",
          "Cut assay costs by 35% in 2019 by moving 6 assays from 96-well to 384-well plates",
        ],
      },
      {
        title: "Postdoctoral Research Fellow",
        org: { uk: "University of Oxford", us: "Rockefeller University" },
        location: { uk: "Oxford", us: "New York, NY" },
        start: "2012-10",
        end: "2016-02",
        bullets: [
          { uk: "Published 9 papers on immune cell signalling in 3.5 years, 2 of them as lead author", us: "Published 9 papers on immune cell signaling in 3.5 years, 2 of them as lead author" },
          { uk: "Won a 3-year fellowship worth £280,000 from a medical research charity in 2013", us: "Won a 3-year fellowship worth $350,000 from a private medical research foundation in 2013" },
          "Designed a flow cytometry panel of 14 markers, adopted by 3 other groups in the department",
          "Supervised 4 PhD students and 6 master's students on lab projects, with all 4 doctorates awarded",
        ],
      },
    ],
    projects: [
      {
        title: "Oral inhibitor for inflammatory bowel disease",
        org: "Corvane Therapeutics",
        start: "2021-06",
        end: "2025-03",
        bullets: [
          { uk: "Led the biology work from target validation to candidate drug nomination, with 11 scientists across biology, chemistry and safety", us: "Led the biology work from target validation to development candidate nomination, with 11 scientists across biology, chemistry and safety" },
          "Published the discovery work in 2025 and filed 2 patent applications, both now granted",
        ],
      },
      {
        title: "New targets in lung fibrosis",
        org: "Corvane Therapeutics and 2 university partners",
        start: "2023-09",
        current: true,
        bullets: ["Screen 400 genes in patient-derived lung cells with 2 university partners, with 6 new targets confirmed so far"],
      },
    ],
    education: [
      {
        title: { uk: "PhD Immunology", us: "PhD in Immunology" },
        org: { uk: "University of Edinburgh", us: "University of Pennsylvania" },
        end: "2012",
      },
      {
        title: { uk: "BSc (Hons) Biochemistry", us: "Bachelor of Science in Biochemistry" },
        org: { uk: "University of Bristol", us: "Cornell University" },
        end: "2007",
        grade: { uk: "First-class honours", us: "GPA 3.9" },
      },
    ],
    certificates: [
      { title: "Good Laboratory Practice training", org: { uk: "Research Quality Association", us: "Society of Quality Assurance" }, end: "2022" },
      { title: { uk: "Chartered Scientist (CSci)", us: "Member, American Association of Immunologists" }, org: { uk: "Royal Society of Biology", us: "American Association of Immunologists" }, end: "2019" },
    ],
    skills: [
      "Drug discovery",
      "Target validation",
      "Cell-based assays",
      "High-throughput screening",
      "Gene editing",
      "Flow cytometry",
      "Grant funding",
      "Patents",
      "Lab budgets",
      "Mentoring",
    ],
    names: ["Anika", "Varga", "Corvane", "Halberd", "Granta", "Stevenage", "Rockefeller", "Morristown", "Bridgewater", "Bioscience", "CSci", "cytometry", "macrophage", "Postdoctoral", "Immunologists"],
    letter: {
      job: {
        title: { uk: "Head of Discovery Biology", us: "Director, Discovery Biology" },
        employer: "Granta Bioscience",
        advert: {
          uk: `Head of Discovery Biology
Granta Bioscience, Cambridge

Granta is a 70-person biotech company developing oral medicines for immune diseases, backed by £60 million of investment.

The role
You will lead a biology group of 10 scientists, set the screening strategy for 4 programmes, and work with our chemistry and clinical teams.

What we are looking for
- A PhD in immunology, pharmacology or a related field
- At least 10 years in drug discovery, with programmes taken to the clinic
- Experience leading and developing a team of scientists
- A strong record of papers, patents and grant funding
- Experience managing lab budgets and outside partners`,
          us: `Director, Discovery Biology
Granta Bioscience, Princeton, NJ

Granta is a 70-person biotech company developing oral medicines for immune diseases, backed by $75 million in venture funding.

The role
You will lead a biology group of 10 scientists, set the screening strategy for 4 programs, and work with our chemistry and clinical teams.

What we are looking for
- A PhD in immunology, pharmacology or a related field
- At least 10 years in drug discovery, with programs taken to the clinic
- Experience leading and developing a team of scientists
- A strong record of papers, patents and grant funding
- Experience managing lab budgets and outside partners`,
        },
      },
      reason: {
        uk: "I want to lead a larger biology group and set the science for several programmes. I also want to keep working on immune diseases.",
        us: "I want to lead a larger biology group and set the science for several programs. I also want to keep working on immune diseases.",
      },
      recipient: { uk: "Dr Ashworth", us: "Dr. Ashworth" },
      paragraphs: [
        {
          uk: "I am applying for the role of Head of Discovery Biology at Granta Bioscience. I want to lead a larger biology group and set the science for several programmes. I also want to keep working on immune diseases.",
          us: "I am applying for the role of Director, Discovery Biology at Granta Bioscience. I want to lead a larger biology group and set the science for several programs. I also want to keep working on immune diseases.",
        },
        {
          uk: "I am a principal research scientist with 14 years in immunology research, the last ten in drug discovery. At Corvane Therapeutics I lead a team of 6 biologists running target validation and screening for 3 small-molecule programmes in inflammatory disease. I took an oral inhibitor programme from target to candidate drug in 4 years, now in a phase 1 clinical trial with 48 healthy volunteers.",
          us: "I am a principal research scientist with 14 years in immunology research, the last ten in drug discovery. At Corvane Therapeutics I lead a team of 6 biologists running target validation and screening for 3 small-molecule programs in inflammatory disease. I took an oral inhibitor program from target to development candidate in 4 years, now in a phase 1 clinical trial with 48 healthy volunteers.",
        },
        {
          uk: "Your advert asks for a strong record of papers, patents and grant funding. I have published 22 peer-reviewed papers, cited over 1,900 times, and I am a named inventor on 4 granted patents. In 2023 I won £1.2 million from Innovate UK with 2 university partners for a 3-year study of new targets in lung fibrosis.",
          us: "Your advert asks for a strong record of papers, patents and grant funding. I have published 22 peer-reviewed papers, cited over 1,900 times, and I am a named inventor on 4 issued patents. In 2023 I won a $1.5 million NIH SBIR grant with 2 university partners for a 3-year study of new targets in lung fibrosis.",
        },
        {
          uk: "Your advert also asks for experience managing lab budgets and outside partners. I manage a lab budget of £850,000 a year and 2 outsourcing contracts, finishing 2025 within 2% of budget. I also mentor 3 senior scientists, with 2 promoted in 2024 and 2025.",
          us: "Your advert also asks for experience managing lab budgets and outside partners. I manage a lab budget of $1.1 million a year and 2 outsourcing contracts, finishing 2025 within 2% of budget. I also mentor 3 senior scientists, with 2 promoted in 2024 and 2025.",
        },
        CLOSE,
      ],
    },
  },
];
