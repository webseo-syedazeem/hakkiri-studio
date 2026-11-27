import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** More examples, added 27 Nov 2026 so every industry has at least two. */
export const MORE_F: ExampleSpec[] = [
  {
    id: "property-manager",
    industry: "property",
    role: "Senior Property Manager",
    level: "senior",
    template: "clearline",
    blurb: {
      uk: "A senior property manager who runs a lettings portfolio of 640 homes, keeping them safe, legal and let.",
      us: "A senior property manager who runs 3 apartment communities with 640 units, raising occupancy and cutting delinquency.",
    },
    person: { name: "Simone Atherley", email: "simone.atherley@example.com", phone: { uk: "07700 900640", us: "(630) 555-0161" }, location: { uk: "Milton Keynes", us: "Naperville, IL" } },
    profile: {
      uk: "Senior property manager with 12 years in residential lettings, the last 5 running a managed portfolio of 640 homes for 210 landlords. Leads a team of 6 property managers and 2 compliance officers, with a rent roll of £7.8 million a year. Cut rent arrears from 4.1% to 1.7% of rent due and the average time to re-let a home from 26 days to 12 in 3 years. Holds the Propertymark Level 4 Certificate in Residential Letting and Property Management.",
      us: "Senior property manager with 12 years in leasing and property management, the last 5 running 3 apartment communities with 640 units in the western suburbs of Chicago. Leads a team of 14 leasing and maintenance staff with a $6.2 million operating budget. Raised occupancy from 92% to 96% and cut rent delinquency from 4.1% to 1.7% in 3 years. Holds an Illinois real estate broker license and the Accredited Residential Manager (ARM) credential.",
    },
    experience: [
      {
        title: "Senior Property Manager",
        org: { uk: "Brackenhurst Lettings", us: "Brackenhurst Residential" },
        location: { uk: "Milton Keynes", us: "Naperville, IL" },
        start: "2021-06",
        current: true,
        bullets: [
          {
            uk: "Lead a team of 6 property managers and 2 compliance officers looking after 640 homes for 210 landlords, with a rent roll of £7.8 million a year",
            us: "Lead a team of 14 leasing and maintenance staff across 3 apartment communities with 640 units, keeping a $6.2 million operating budget within 1% each year",
          },
          {
            uk: "Cut rent arrears from 4.1% to 1.7% of rent due in 3 years by calling tenants on the first day a payment was late and agreeing repayment plans early",
            us: "Raised occupancy from 92% to 96% in 3 years by pricing units each week against 8 nearby communities and answering every new lead within an hour",
          },
          {
            uk: "Cut the average time to re-let a home from 26 days to 12 by starting viewings in the tenant's notice period and booking cleans and repairs in advance",
            us: "Cut rent delinquency from 4.1% to 1.7% of rent due in 3 years by calling residents on the first day a payment was late and agreeing payment plans early",
          },
          {
            uk: "Keep gas safety certificates, electrical safety reports and deposit protection in date for all 640 homes, with no missed renewals in 4 years",
            us: "Raised the lease renewal rate from 52% to 61% in 2 years by offering renewals 90 days ahead and fixing the top 5 complaints from resident surveys",
          },
          {
            uk: "Met response times of 4 hours for emergency repairs and 5 working days for routine repairs on 96% of 4,200 jobs in 2025, using 45 contractors",
            us: "Closed 96% of 4,200 work orders in 2025 within 48 hours, with emergency calls answered within 4 hours by an on-call rotation of 5 technicians",
          },
          {
            uk: "Prepared the portfolio for the Renters' Rights Act in 2026, rewriting tenancy agreements and notices and training 8 staff and 30 landlords in the new rules",
            us: "Train the team of 14 in fair housing rules every year, with no fair housing complaints against the 3 communities in 5 years",
          },
        ],
      },
      {
        title: "Property Manager",
        org: { uk: "Millbeck Homes", us: "Millbeck Property Group" },
        location: { uk: "Bedford", us: "Wheaton, IL" },
        start: "2017-04",
        end: "2021-05",
        bullets: [
          {
            uk: "Managed 220 homes for 85 landlords, from move-in checks and rent collection to repairs, renewals and deposit returns",
            us: "Managed a 220-unit apartment community, from move-ins and rent collection to work orders, lease renewals and move-outs",
          },
          {
            uk: "Grew the managed portfolio from 150 to 220 homes in 3 years by moving let-only landlords onto full management",
            us: "Kept the community within 2% of its $1.9 million operating budget for 4 years, reporting to the owner each month",
          },
          {
            uk: "Renewed 78% of tenancies due to end in 2020, up from 64% in 2018, by contacting tenants 3 months before the end date",
            us: "Renewed 78% of leases due to end in 2020, up from 64% in 2018, by contacting residents 3 months before the end date",
          },
          {
            uk: "Ran property inspections on each home twice a year, sending landlords a report with photos and a repair plan within 3 working days",
            us: "Cut the yearly cost per unit by 6% by rebidding landscaping, trash removal and snow removal contracts with 3 vendors",
          },
          {
            uk: "Settled 34 of 38 deposit disputes in 2020 by agreement between landlord and tenant, with the other 4 decided by the deposit scheme",
            us: "Inspected each unit twice a year, raising work orders for repairs within 2 days and cutting emergency calls by 20% in 2 years",
          },
        ],
      },
      {
        title: { uk: "Lettings Negotiator", us: "Leasing Consultant" },
        org: { uk: "Sedley Estates", us: "Sedley Apartments" },
        location: { uk: "Milton Keynes", us: "Naperville, IL" },
        start: "2014-09",
        end: "2017-03",
        bullets: [
          {
            uk: "Let around 90 homes a year, booking viewings, taking references and drawing up tenancy agreements",
            us: "Signed around 90 leases a year at a 300-unit community, running tours and checking each applicant's credit, income and rental history",
          },
          {
            uk: "Won 26 new landlords in 2016 against a target of 20 by valuing homes for rent and following up within 24 hours",
            us: "Kept occupancy above 95% for 2 years by following up every tour within 24 hours and hosting 2 open houses a month",
          },
          {
            uk: "Ran around 15 viewings a week and sent each landlord feedback on the day",
            us: "Wrote the community's listings on 4 rental websites, with new photos and prices added within a day of each change",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business and Management", us: "Bachelor of Science in Business Administration" },
        org: { uk: "University of Bedfordshire", us: "Illinois State University" },
        start: "2011-09",
        end: "2014-06",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 4 Certificate in Residential Letting and Property Management", us: "Accredited Residential Manager (ARM)" },
        org: { uk: "Propertymark Qualifications", us: "Institute of Real Estate Management" },
        end: "2019",
      },
      {
        title: { uk: "Level 3 Award in Residential Letting and Property Management", us: "Illinois Real Estate Broker License" },
        org: { uk: "Propertymark Qualifications", us: "Illinois Department of Financial and Professional Regulation" },
        end: "2016",
      },
    ],
    skills: [
      { uk: "Residential lettings", us: "Leasing" },
      { uk: "Rent arrears", us: "Occupancy" },
      { uk: "Gas safety", us: "Rent collection" },
      { uk: "Deposit protection", us: "Delinquency" },
      { uk: "Tenancy agreements", us: "Lease renewals" },
      { uk: "Repairs", us: "Operating budgets" },
      { uk: "Contractors", us: "Work orders" },
      { uk: "Renters' Rights Act", us: "Fair housing" },
      { uk: "Property inspections", us: "Resident surveys" },
      { uk: "Deposit disputes", us: "Vendor contracts" },
    ],
    names: ["Simone", "Atherley", "Brackenhurst", "Millbeck", "Sedley", "Ellerby", "Propertymark", "Naperville", "Wheaton", "Bedford", "Bedfordshire"],
    letter: {
      job: {
        title: "Senior Property Manager",
        employer: "Ellerby Living",
        advert: {
          uk: `Senior Property Manager
Ellerby Living, Milton Keynes

Ellerby Living manages 1,100 rented homes for private landlords across Milton Keynes and Bedford.

The role
You will lead a team of 8 property managers and make sure every home we manage is safe, legal and well looked after.

What we are looking for
- Experience managing a large residential lettings portfolio
- A record of cutting rent arrears and the time homes stand empty
- Strong knowledge of lettings compliance, including gas safety, electrical safety and deposit protection
- Experience preparing landlords and staff for the Renters' Rights Act
- Experience leading and developing a team

Salary £42,000 to £48,000`,
          us: `Senior Property Manager
Ellerby Living, Oak Brook, IL

Ellerby Living owns and manages 9 apartment communities with 2,400 units across the western suburbs of Chicago.

The role
You will run a portfolio of 4 communities with 1,100 units and lead a team of 20 leasing and maintenance staff.

What we are looking for
- 5 or more years managing apartment communities
- A record of raising occupancy and cutting rent delinquency
- Experience building and running operating budgets
- Strong knowledge of fair housing rules
- An Illinois real estate broker license

Salary $85,000 to $98,000, plus bonus`,
        },
      },
      reason: {
        uk: "I want to lead a larger team in a growing lettings business. I also enjoy making rented homes safe and well run for tenants and landlords.",
        us: "I want to lead a larger team in a growing property management business. I also enjoy making apartment communities safe and well run for residents and owners.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Property Manager at Ellerby Living. I want to lead a larger team in a growing lettings business. I also enjoy making rented homes safe and well run for tenants and landlords.",
          us: "I am applying for the role of Senior Property Manager at Ellerby Living. I want to lead a larger team in a growing property management business. I also enjoy making apartment communities safe and well run for residents and owners.",
        },
        {
          uk: "At Brackenhurst Lettings I lead a team of 6 property managers and 2 compliance officers looking after 640 homes for 210 landlords, with a rent roll of £7.8 million a year. Your advert asks for a record of cutting rent arrears and the time homes stand empty. I cut rent arrears from 4.1% to 1.7% of rent due in 3 years by calling tenants on the first day a payment was late and agreeing repayment plans early. I also cut the average time to re-let a home from 26 days to 12 by starting viewings in the tenant's notice period.",
          us: "At Brackenhurst Residential I lead a team of 14 leasing and maintenance staff across 3 apartment communities with 640 units and a $6.2 million operating budget. Your advert asks for a record of raising occupancy and cutting rent delinquency. I raised occupancy from 92% to 96% in 3 years by pricing units each week against 8 nearby communities and answering every new lead within an hour. I also cut rent delinquency from 4.1% to 1.7% of rent due in 3 years by calling residents on the first day a payment was late.",
        },
        {
          uk: "Your advert also asks for strong knowledge of lettings compliance, including gas safety, electrical safety and deposit protection. I keep gas safety certificates, electrical safety reports and deposit protection in date for all 640 homes, with no missed renewals in 4 years. In 2026 I prepared the portfolio for the Renters' Rights Act, rewriting tenancy agreements and notices and training 8 staff and 30 landlords in the new rules.",
          us: "Your advert also asks for experience building and running operating budgets. At Millbeck Property Group I kept the community within 2% of its $1.9 million operating budget for 4 years, reporting to the owner each month. You also ask for strong knowledge of fair housing rules. I train the team of 14 in fair housing rules every year, with no fair housing complaints against the 3 communities in 5 years. I hold an Illinois real estate broker license and the Accredited Residential Manager (ARM) credential.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "journalist",
    industry: "media",
    role: { uk: "Journalist", us: "Reporter" },
    level: "experienced",
    template: "portfolio",
    blurb: {
      uk: "A regional news reporter with 6 years on daily and weekly papers, from courts and councils to data stories and video.",
      us: "A regional news reporter with 6 years at daily and weekly papers, from courts and city hall to data stories and video.",
    },
    person: {
      name: "Declan Moriarty",
      email: "declan.moriarty@example.com",
      phone: { uk: "07700 900641", us: "(215) 555-0163" },
      location: { uk: "Middlesbrough", us: "Philadelphia, PA" },
      links: ["portfolio.example.com/declanmoriarty"],
    },
    profile: {
      uk: "Journalist with 6 years on regional newspapers and news websites, the last 4 as a reporter on a daily paper and website with 1.3 million readers a month. Covers breaking news, courts and local councils, and finds stories in data from Freedom of Information requests. Broke the story of a £14 million overspend in the council's children's services budget, which led to an independent review in 2024. Holds the National Council for the Training of Journalists (NCTJ) Diploma in Journalism at Gold Standard, with shorthand at 100 words a minute.",
      us: "Reporter with 6 years at regional newspapers and news websites, the last 4 at a daily paper and website with 1.3 million readers a month. Covers breaking news, courts and city government, and finds stories in data from public records requests. Broke the story of an $18 million overspend in the school district's budget, which led to an independent audit in 2024. Shoots and edits short news videos on a phone and holds a bachelor's degree in journalism.",
    },
    projects: [
      {
        title: "Ambulance waiting times investigation",
        org: { uk: "Tees Courier", us: "Riverward Courier" },
        start: "2023-05",
        end: "2023-09",
        bullets: [
          {
            uk: "Cleaned and analysed 310,000 ambulance call-outs in Excel, mapping average waits for each postcode in Datawrapper",
            us: "Cleaned and analyzed 310,000 ambulance calls in Excel, mapping average waits for each zip code in Datawrapper",
          },
          {
            uk: "Found that patients in 4 rural wards waited twice as long as those in the town centre for the most urgent calls",
            us: "Found that patients in 4 outlying neighborhoods waited twice as long as those in Center City for the most urgent calls",
          },
          {
            uk: "Prompted a review of ambulance cover by the regional ambulance trust, which added 3 rapid response cars in 2024",
            us: "Prompted a review of ambulance coverage by the city fire department, which added 3 medic units in 2024",
          },
        ],
      },
      {
        title: { uk: "Flood defences series", us: "Flood protection series" },
        org: { uk: "Tees Courier", us: "Riverward Courier" },
        start: "2024-10",
        end: "2024-11",
        bullets: [
          "Interviewed 40 residents of 6 streets flooded in 2024, writing a 5-part series with photos and video over 2 weeks",
          {
            uk: "Showed from council papers that a planned flood scheme had slipped by 4 years, after which the council brought it forward to 2026",
            us: "Showed from city records that a planned flood wall had slipped by 4 years, after which the city brought it forward to 2026",
          },
        ],
      },
    ],
    experience: [
      {
        title: "Reporter",
        org: { uk: "Tees Courier", us: "Riverward Courier" },
        location: { uk: "Middlesbrough", us: "Philadelphia, PA" },
        start: "2022-03",
        current: true,
        bullets: [
          {
            uk: "Report on breaking news, courts and 2 local councils for a daily paper and website with 1.3 million readers a month, filing around 20 stories a week",
            us: "Report on breaking news, courts and city government for a daily paper and website with 1.3 million readers a month, filing around 20 stories a week",
          },
          {
            uk: "Broke the story of a £14 million overspend in the council's children's services budget in 2024, which led to an independent review and 3 weeks of front-page follow-ups",
            us: "Broke the story of an $18 million overspend in the school district's budget in 2024, which led to an independent audit and 3 weeks of front-page follow-ups",
          },
          {
            uk: "Built a data story from 5 years of ambulance response times obtained through 6 Freedom of Information requests, read 210,000 times and raised in the House of Commons",
            us: "Built a data story from 5 years of ambulance response times obtained through 6 public records requests, read 210,000 times and cited at a city council hearing",
          },
          {
            uk: "Film and edit short news videos on a phone for the website and social media, reaching 2.4 million views across 150 videos in 2025",
            us: "Shoot and edit short news videos on a phone for the website and social media, reaching 2.4 million views across 150 videos in 2025",
          },
          "Started a weekly courts newsletter in 2024, growing it to 14,000 subscribers with a 48% open rate in 18 months",
          "Check each fact against at least 2 sources before filing, needing 3 corrections in more than 1,500 stories since 2022",
        ],
      },
      {
        title: { uk: "Trainee Reporter", us: "Staff Reporter" },
        org: "Ashdale Gazette",
        location: { uk: "Darlington", us: "Norristown, PA" },
        start: "2020-09",
        end: "2022-02",
        bullets: [
          {
            uk: "Covered 3 market towns for a weekly paper and website, writing around 15 stories a week on councils, schools, police and local business",
            us: "Covered 3 suburban townships for a weekly paper and website, writing around 15 stories a week on local government, schools, police and business",
          },
          {
            uk: "Attended around 8 council and planning meetings a month, turning them into 12 front-page stories in 2021",
            us: "Attended around 8 township and school board meetings a month, turning them into 12 front-page stories in 2021",
          },
          {
            uk: "Ran the paper's live coverage of the 2021 local elections, with 9 hours of live updates read 60,000 times",
            us: "Ran the paper's live coverage of the 2021 municipal elections, with 9 hours of live updates read 60,000 times",
          },
          "Wrote 2 features a month on local people and businesses, raising page views for features by 35% in a year",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Multimedia Journalism", us: "Bachelor of Arts in Journalism" },
        org: { uk: "Teesside University", us: "Temple University" },
        start: "2017-09",
        end: "2020-06",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Diploma in Journalism (Gold Standard)", us: "Data Journalism Boot Camp" },
        org: { uk: "National Council for the Training of Journalists", us: "Investigative Reporters and Editors" },
        end: "2021",
      },
    ],
    skills: [
      "Breaking news",
      "Court reporting",
      "Data stories",
      { uk: "Freedom of Information requests", us: "Public records requests" },
      "Video editing",
      "Newsletters",
      "Fact-checking",
      "Social media",
      "Live coverage",
      { uk: "Shorthand", us: "Local government" },
    ],
    names: ["Declan", "Moriarty", "Tees", "Teesside", "Riverward", "Ashdale", "Northline", "Norristown", "Middlesbrough", "Darlington", "Datawrapper"],
    letter: {
      job: {
        title: "Senior Reporter",
        employer: "Northline News",
        advert: {
          uk: `Senior Reporter
Northline News, Newcastle upon Tyne

Northline News is a digital news site covering the North East, with 2.5 million readers a month and a growing video team.

The role
You will cover courts, councils and breaking news, and lead on data and investigative stories.

What we are looking for
- At least 4 years as a reporter for a regional or national news outlet
- A record of breaking stories that matter to local readers
- Experience finding stories in data, including Freedom of Information requests
- Confidence filming and editing video on a phone
- The NCTJ Diploma in Journalism, with shorthand at 100 words a minute

Salary £32,000 to £36,000`,
          us: `Senior Reporter
Northline News, Philadelphia, PA

Northline News is a nonprofit digital newsroom covering Philadelphia and its suburbs, with 2.5 million readers a month and a growing video team.

The role
You will cover courts, city government and breaking news, and lead on data and investigative stories.

What we are looking for
- At least 4 years as a reporter for a regional or national news outlet
- A record of breaking stories that matter to local readers
- Experience finding stories in data, including public records requests
- Confidence shooting and editing video on a phone
- A bachelor's degree in journalism or a related field

Salary $62,000 to $70,000`,
        },
      },
      reason: "I want to spend more of my time on data and investigative stories. I also want my reporting to reach readers across a whole region.",
      paragraphs: [
        "I am applying for the role of Senior Reporter at Northline News. I want to spend more of my time on data and investigative stories. I also want my reporting to reach readers across a whole region.",
        {
          uk: "At the Tees Courier I report on breaking news, courts and 2 local councils for a daily paper and website with 1.3 million readers a month, filing around 20 stories a week. Your advert asks for a record of breaking stories that matter to local readers. In 2024 I broke the story of a £14 million overspend in the council's children's services budget, which led to an independent review and 3 weeks of front-page follow-ups.",
          us: "At the Riverward Courier I report on breaking news, courts and city government for a daily paper and website with 1.3 million readers a month, filing around 20 stories a week. Your advert asks for a record of breaking stories that matter to local readers. In 2024 I broke the story of an $18 million overspend in the school district's budget, which led to an independent audit and 3 weeks of front-page follow-ups.",
        },
        {
          uk: "Your advert also asks for experience finding stories in data, including Freedom of Information requests. I built a data story from 5 years of ambulance response times obtained through 6 Freedom of Information requests, read 210,000 times and raised in the House of Commons. I also film and edit short news videos on a phone for the website and social media, reaching 2.4 million views across 150 videos in 2025.",
          us: "Your advert also asks for experience finding stories in data, including public records requests. I built a data story from 5 years of ambulance response times obtained through 6 public records requests, read 210,000 times and cited at a city council hearing. I also shoot and edit short news videos on a phone for the website and social media, reaching 2.4 million views across 150 videos in 2025.",
        },
        {
          uk: "In 2024 I started a weekly courts newsletter, growing it to 14,000 subscribers with a 48% open rate in 18 months. I hold the NCTJ Diploma in Journalism at Gold Standard, with shorthand at 100 words a minute.",
          us: "In 2024 I started a weekly courts newsletter, growing it to 14,000 subscribers with a 48% open rate in 18 months. I hold a bachelor's degree in journalism from Temple University.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "quality-inspector",
    industry: "manufacturing",
    role: "Quality Inspector",
    level: "experienced",
    template: "framework",
    blurb: "A quality inspector with 7 years in automotive parts plants who cut customer defects by three quarters.",
    person: { name: "Tomasz Nowicki", email: "tomasz.nowicki@example.com", phone: { uk: "07700 900642", us: "(419) 555-0164" }, location: { uk: "Sunderland", us: "Toledo, OH" } },
    profile: {
      uk: "Quality inspector with 7 years in automotive parts plants, the last 5 inspecting pressed and welded steel parts for 2 car makers. Measures parts with calipers, micrometers, height gauges and a coordinate measuring machine (CMM), and signs off first-article inspections for new and changed parts. Cut the defect rate found by customers from 380 to 90 parts per million in 2 years by leading root cause investigations. Trained as an internal auditor to International Automotive Task Force (IATF) 16949 and ISO 9001.",
      us: "Quality inspector with 7 years in automotive parts plants, the last 5 inspecting stamped and welded steel parts for 2 automakers. Measures parts with calipers, micrometers, height gauges and a coordinate measuring machine (CMM), and signs off first-article inspections for new and changed parts. Cut the defect rate found by customers from 380 to 90 parts per million in 2 years by leading root cause investigations. American Society for Quality (ASQ) Certified Quality Inspector and trained International Automotive Task Force (IATF) 16949 internal auditor.",
    },
    experience: [
      {
        title: "Quality Inspector",
        org: "Brantwick Automotive",
        location: { uk: "Sunderland", us: "Toledo, OH" },
        start: "2021-05",
        current: true,
        bullets: [
          {
            uk: "Inspect pressed and welded steel parts for 2 car makers across 3 shifts, using calipers, micrometers, height gauges and a coordinate measuring machine (CMM)",
            us: "Inspect stamped and welded steel parts for 2 automakers across 3 shifts, using calipers, micrometers, height gauges and a coordinate measuring machine (CMM)",
          },
          "Sign off first-article inspections on around 15 new or changed parts a month, checking each against the drawing before production starts",
          "Cut the defect rate found by customers from 380 to 90 parts per million (PPM) in 2 years by leading root cause investigations on the top 10 defects",
          "Run 8D problem solving with Ishikawa diagrams on customer and internal defects, closing 42 corrective actions in 2025 with none reopened",
          "Audit 12 processes a year as an IATF 16949 internal auditor, raising 31 findings in 2025 and closing all of them within 60 days",
          "Run measurement system analysis (MSA) studies on 40 gauges a year, taking 6 failed gauges out of use in 2025",
        ],
      },
      {
        title: { uk: "Final Inspector", us: "Final Line Inspector" },
        org: "Hallgarth Plastics",
        location: { uk: "Washington, Tyne and Wear", us: "Maumee, OH" },
        start: "2019-09",
        end: "2021-04",
        bullets: [
          {
            uk: "Inspected injection-moulded dashboard and door trim parts at the end of 4 production lines, checking around 600 parts a shift against boundary samples",
            us: "Inspected injection-molded dashboard and door trim parts at the end of 4 production lines, checking around 600 parts a shift against boundary samples",
          },
          "Stopped 3 suspect batches in 2020 before they shipped, keeping around 9,000 faulty parts from reaching the customer",
          "Recorded defects by type and line on a daily Pareto chart, which the line leaders used to cut scrap from 4.2% to 2.6% in a year",
          "Trained 14 machine operators to check their own parts with go/no-go gauges, cutting parts held for inspection by 35%",
        ],
      },
    ],
    projects: [
      {
        title: "Spot weld defects project",
        org: "Brantwick Automotive",
        start: "2024-02",
        end: "2024-08",
        bullets: [
          "Led a 6-month project with 2 engineers on spot weld defects in a rear floor panel, the plant's top customer complaint in 2023",
          "Ran peel tests on 300 welds and traced most failures to worn electrode tips, setting a new tip-dressing schedule for 8 robots",
          {
            uk: "Cut weld defects on the panel from 1.8% to 0.3% in 4 months, saving around £60,000 a year in scrap and rework",
            us: "Cut weld defects on the panel from 1.8% to 0.3% in 4 months, saving around $75,000 a year in scrap and rework",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BTEC Level 3 National Extended Diploma in Engineering", us: "Associate of Applied Science in Manufacturing Engineering Technology" },
        org: { uk: "Sunderland College", us: "Owens Community College" },
        start: "2017-09",
        end: "2019-06",
        grade: { uk: "Distinction, Merit, Merit", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: "IATF 16949 Internal Auditor",
        org: { uk: "SMMT Industry Forum", us: "Automotive Industry Action Group" },
        end: "2022",
      },
      {
        title: { uk: "ISO 9001 Internal Auditor", us: "Certified Quality Inspector (CQI)" },
        org: { uk: "Chartered Quality Institute", us: "American Society for Quality" },
        end: "2024",
      },
    ],
    skills: [
      "Coordinate measuring machine",
      "Calipers and micrometers",
      "First-article inspection",
      "Root cause investigations",
      "8D problem solving",
      "Corrective actions",
      "Internal audits",
      "Measurement system analysis",
      "Pareto charts",
      "Boundary samples",
    ],
    names: ["Tomasz", "Nowicki", "Brantwick", "Hallgarth", "Wearbrook", "Maumee", "Owens", "Pareto", "Ishikawa", "Sunderland", "Tyne"],
    letter: {
      job: {
        title: "Senior Quality Inspector",
        employer: "Wearbrook Components",
        advert: {
          uk: `Senior Quality Inspector
Wearbrook Components, Sunderland

Wearbrook Components makes pressed and welded body parts for 3 car makers, with 450 staff on 3 shifts.

The role
You will lead inspection on the day shift, sign off new parts and lead root cause investigations with production and engineering.

What we are looking for
- At least 5 years inspecting parts in automotive manufacturing
- Confidence with calipers, micrometers, height gauges and a CMM
- Experience of first-article inspection
- A record of cutting customer defects through root cause problem solving
- IATF 16949 internal auditor training

Salary £34,000 to £38,000, plus shift allowance`,
          us: `Senior Quality Inspector
Wearbrook Components, Toledo, OH

Wearbrook Components makes stamped and welded body parts for 3 automakers, with 450 employees on 3 shifts.

The role
You will lead inspection on first shift, sign off new parts and lead root cause investigations with production and engineering.

What we are looking for
- At least 5 years inspecting parts in automotive manufacturing
- Confidence with calipers, micrometers, height gauges and a CMM
- Experience with first-article inspection
- A record of cutting customer defects through root cause problem solving
- ASQ Certified Quality Inspector, or IATF 16949 internal auditor training

Pay $26 to $31 an hour, plus shift premium`,
        },
      },
      reason: "I want to take on more responsibility by leading inspection on a shift. I also enjoy finding the root cause of a defect and fixing it for good.",
      paragraphs: [
        "I am applying for the role of Senior Quality Inspector at Wearbrook Components. I want to take on more responsibility by leading inspection on a shift. I also enjoy finding the root cause of a defect and fixing it for good.",
        {
          uk: "At Brantwick Automotive I inspect pressed and welded steel parts for 2 car makers across 3 shifts, using calipers, micrometers, height gauges and a coordinate measuring machine (CMM). I sign off first-article inspections on around 15 new or changed parts a month, checking each against the drawing before production starts. At Hallgarth Plastics I trained 14 machine operators to check their own parts with go/no-go gauges, cutting parts held for inspection by 35%.",
          us: "At Brantwick Automotive I inspect stamped and welded steel parts for 2 automakers across 3 shifts, using calipers, micrometers, height gauges and a coordinate measuring machine (CMM). I sign off first-article inspections on around 15 new or changed parts a month, checking each against the drawing before production starts. At Hallgarth Plastics I trained 14 machine operators to check their own parts with go/no-go gauges, cutting parts held for inspection by 35%.",
        },
        "Your advert asks for a record of cutting customer defects through root cause problem solving. I cut the defect rate found by customers from 380 to 90 parts per million in 2 years by leading root cause investigations on the top 10 defects. I run 8D problem solving with Ishikawa diagrams on customer and internal defects, closing 42 corrective actions in 2025 with none reopened.",
        {
          uk: "I audit 12 processes a year as an IATF 16949 internal auditor, raising 31 findings in 2025 and closing all of them within 60 days. I am also trained as an internal auditor to ISO 9001.",
          us: "I audit 12 processes a year as an IATF 16949 internal auditor, raising 31 findings in 2025 and closing all of them within 60 days. I am also an American Society for Quality (ASQ) Certified Quality Inspector.",
        },
        CLOSE,
      ],
    },
  },
];
