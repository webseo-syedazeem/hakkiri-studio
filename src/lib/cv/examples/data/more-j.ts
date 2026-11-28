import type { ExampleSpec } from "../types";

/** Phase 3, batch 1 (28 Nov 2026): roles the industry packs list that had no example. */
export const MORE_J: ExampleSpec[] = [
  {
    id: "it-support-technician",
    industry: "software",
    role: { uk: "IT Support Technician", us: "IT Support Specialist" },
    level: "early",
    template: "technical",
    density: { uk: "default", us: "tighter" },
    blurb: {
      uk: "An IT support technician four years into IT support, looking after laptops, Microsoft 365 and Intune for a trust of 6 schools.",
      us: "An IT support specialist four years into IT support, looking after laptops, Microsoft 365 and Intune for a district of 6 schools.",
    },
    person: { name: "Owain Tolley", email: "owain.tolley@example.com", phone: { uk: "07700 900659", us: "(408) 555-0181" }, location: { uk: "Coventry", us: "San Jose, CA" } },
    profile: {
      uk: "IT support technician with 4 years in IT support, the last 2 at a multi-academy trust of 6 schools with 1,100 staff and 7,500 pupils. Resolves around 60 tickets a week across Microsoft 365, Intune, Windows laptops and classroom screens, fixing 91% first time. Rolled out 1,400 new laptops over 3 weeks in summer 2025, all ready for the first day of term. Holds CompTIA A+ and the Microsoft 365 Certified: Endpoint Administrator Associate certification.",
      us: "IT support specialist with 4 years in IT support, the last 2 at a school district of 6 schools with 1,100 staff and 7,500 students. Resolves around 60 tickets a week across Microsoft 365, Intune, Windows laptops and classroom screens, fixing 91% first time. Rolled out 1,400 new laptops over 3 weeks in summer 2025, all ready for the first day of classes. Holds CompTIA A+ and the Microsoft 365 Certified: Endpoint Administrator Associate certification.",
    },
    experience: [
      {
        title: { uk: "IT Support Technician", us: "IT Support Specialist" },
        org: { uk: "Stonebeck Learning Trust", us: "Stonebeck School District" },
        location: { uk: "Coventry", us: "San Jose, CA" },
        start: "2024-08",
        current: true,
        bullets: [
          "Resolve around 60 support tickets a week for 1,100 staff across 6 schools, fixing 91% first time against a target of 85%",
          {
            uk: "Rolled out 1,400 new Windows laptops to staff and pupils over 3 weeks in summer 2025, adding each to Intune so all were ready on the first day of term",
            us: "Rolled out 1,400 new Windows laptops to staff and students over 3 weeks in summer 2025, adding each to Intune so all were ready on the first day of classes",
          },
          "Moved 1,100 staff accounts and 6 shared drives from servers in each school to Microsoft 365 and SharePoint in 2025, with no files lost",
          "Set up Intune policies for updates, network settings and apps on 2,600 devices, cutting the time to prepare a laptop from 90 minutes to 15",
          {
            uk: "Check the classroom screens, printers and wireless network in each school every half term, cutting repeat faults on classroom screens by 40% in a year",
            us: "Check the classroom screens, printers and wireless network in each school every quarter, cutting repeat faults on classroom screens by 40% in a year",
          },
          "Wrote 25 step-by-step guides for staff on common problems such as password resets and printing, cutting tickets for those problems by 30% in 6 months",
        ],
      },
      {
        title: { uk: "IT Support Apprentice", us: "Help Desk Technician" },
        org: "Netherfold IT Services",
        location: { uk: "Coventry", us: "Santa Clara, CA" },
        start: "2022-09",
        end: "2024-07",
        bullets: [
          {
            uk: "Answered around 25 calls and emails a day on the service desk for 30 small business clients with 600 users",
            us: "Answered around 25 calls and emails a day on the help desk for 30 small business clients with 600 users",
          },
          {
            uk: "Prepared laptops, email accounts and phones for around 20 new starters a month across client offices",
            us: "Prepared laptops, email accounts and phones for around 20 new hires a month across client offices",
          },
          "Repaired around 15 laptops and desktops a month, from cracked screens to failed hard drives",
          {
            uk: "Completed a Level 3 Information Communications Technician apprenticeship with a distinction in 2024, alongside full-time work",
            us: "Passed CompTIA A+ in 2023 after 6 months of study alongside full-time work",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BTEC Level 3 National Extended Diploma in Information Technology", us: "Associate of Applied Science in Information Technology" },
        org: { uk: "Brindlecote College", us: "Brindlecote Community College" },
        end: "2022",
        grade: { uk: "Triple Distinction", us: "GPA 3.6" },
      },
    ],
    certificates: [
      { title: "CompTIA A+", org: "CompTIA", end: "2023" },
      { title: "Microsoft 365 Certified: Endpoint Administrator Associate", org: "Microsoft", end: "2025" },
    ],
    skills: [
      "Microsoft 365",
      "Intune",
      "SharePoint",
      "Windows laptops",
      "Classroom screens",
      "Wireless networks",
      "Printers",
      "Laptop repairs",
      "Password resets",
      { uk: "Service desk", us: "Help desk" },
    ],
    names: ["Owain", "Tolley", "Stonebeck", "Netherfold", "Brindlecote", "Alderwick", "Intune"],
    letter: {
      job: {
        title: { uk: "Senior IT Technician", us: "Senior IT Support Specialist" },
        employer: { uk: "Alderwick Academies Trust", us: "Alderwick Unified School District" },
        advert: {
          uk: `Senior IT Technician
Alderwick Academies Trust, Coventry

Alderwick Academies Trust runs 14 primary and secondary schools, with 2,300 staff and 16,000 pupils.

The role
You will lead IT support across 4 of our schools and help run our move to managing every device in Intune.

What we are looking for
- At least 2 years in IT support, ideally in schools
- Experience of rolling out devices with Intune
- Good knowledge of Microsoft 365 and SharePoint
- Clear guides and training for staff
- CompTIA A+ or a similar qualification

Salary £30,000 to £34,000`,
          us: `Senior IT Support Specialist
Alderwick Unified School District, San Jose, CA

Alderwick Unified School District runs 14 elementary, middle and high schools, with 2,300 staff and 16,000 students.

The role
You will lead IT support across 4 of our schools and help run our move to managing every device in Intune.

What we are looking for
- At least 2 years in IT support, ideally in schools
- Experience rolling out devices with Intune
- Good knowledge of Microsoft 365 and SharePoint
- Clear guides and training for staff
- CompTIA A+ or a similar certification

Salary $72,000 to $84,000`,
        },
      },
      reason: {
        uk: "I want to work for a larger trust, where I can spend more of my time on Intune and device management.",
        us: "I want to work for a larger district, where I can spend more of my time on Intune and device management.",
      },
      paragraphs: [
        {
          uk: "I would like to be considered for the post of Senior IT Technician at Alderwick Academies Trust. I want to work for a larger trust, where I can spend more of my time on Intune and device management.",
          us: "I would like to be considered for the post of Senior IT Support Specialist at Alderwick Unified School District. I want to work for a larger district, where I can spend more of my time on Intune and device management.",
        },
        {
          uk: "At Stonebeck Learning Trust I resolve around 60 support tickets a week for 1,100 staff across 6 schools, fixing 91% first time against a target of 85%. Your advert asks for experience of rolling out devices with Intune. In summer 2025 I rolled out 1,400 new Windows laptops to staff and pupils over 3 weeks, adding each to Intune so all were ready on the first day of term.",
          us: "At Stonebeck School District I resolve around 60 support tickets a week for 1,100 staff across 6 schools, fixing 91% first time against a target of 85%. Your advert asks for experience rolling out devices with Intune. In summer 2025 I rolled out 1,400 new Windows laptops to staff and students over 3 weeks, adding each to Intune so all were ready on the first day of classes.",
        },
        "You are also looking for good knowledge of Microsoft 365 and SharePoint. In 2025 I moved 1,100 staff accounts and 6 shared drives from servers in each school to Microsoft 365 and SharePoint, with no files lost. I also set up Intune policies for updates, network settings and apps on 2,600 devices, cutting the time to prepare a laptop from 90 minutes to 15.",
        "I wrote 25 step-by-step guides for staff on common problems such as password resets and printing, cutting tickets for those problems by 30% in 6 months. I hold CompTIA A+ and the Microsoft 365 Certified: Endpoint Administrator Associate certification.",
        {
          uk: "My CV is attached, and I would be glad to talk about the role. Thank you for your time.",
          us: "My resume is attached, and I would be glad to talk about the role. Thank you for your time.",
        },
      ],
    },
  },
  {
    id: "qa-tester",
    industry: "software",
    role: { uk: "QA Tester", us: "QA Analyst" },
    level: "early",
    template: "index",
    blurb: {
      uk: "A QA tester two years into manual and automated testing of a route planning app, after a start in customer support.",
      us: "A QA analyst two years into manual and automated testing of a route planning app, after a start in customer support.",
    },
    person: { name: "Elena Marchetti", email: "elena.marchetti@example.com", phone: { uk: "07700 900660", us: "(669) 555-0183" }, location: { uk: "Southampton", us: "Sunnyvale, CA" } },
    profile: {
      uk: "QA tester with 2 years testing the web and mobile apps of Kinroute, a route planning software company with 900 business customers, after 2 years in its customer support team. Writes test plans and runs manual and automated tests for each fortnightly release, and has built 320 automated tests in Playwright. Logged 410 bugs in Jira in 2025 and cut bugs reported by customers after release by 55% in a year. Holds the International Software Testing Qualifications Board (ISTQB) Certified Tester Foundation Level.",
      us: "QA analyst with 2 years testing the web and mobile apps of Kinroute, a route planning software company with 900 business customers, after 2 years in its customer support team. Writes test plans and runs manual and automated tests for each two-week release, and has built 320 automated tests in Playwright. Logged 410 bugs in Jira in 2025 and cut bugs reported by customers after release by 55% in a year. Holds the International Software Testing Qualifications Board (ISTQB) Certified Tester Foundation Level.",
    },
    experience: [
      {
        title: { uk: "QA Tester", us: "QA Analyst" },
        org: "Kinroute",
        location: { uk: "Southampton", us: "Sunnyvale, CA" },
        start: "2024-07",
        current: true,
        bullets: [
          {
            uk: "Write test plans and test cases for each fortnightly release of the web app and the driver app for iOS and Android, covering around 25 changes a release",
            us: "Write test plans and test cases for each two-week release of the web app and the driver app for iOS and Android, covering around 25 changes a release",
          },
          "Built 320 automated end-to-end tests in Playwright and TypeScript, running on every pull request and cutting the manual regression run from 2 days to 3 hours",
          "Logged 410 bugs in Jira in 2025 with clear steps to reproduce, screenshots and logs, 38 of them rated critical before release",
          "Cut bugs reported by customers within a month of release by 55% in a year by adding tests for the 40 most-used features of the app",
          "Test the public application programming interface (API) with Postman, writing 150 checks for the endpoints that customers' systems call",
          "Run user acceptance testing (UAT) sessions with 6 courier firms before major releases, turning their feedback into 60 Jira tickets in 2025",
        ],
      },
      {
        title: { uk: "Customer Support Agent", us: "Customer Support Representative" },
        org: "Kinroute",
        location: { uk: "Southampton", us: "Sunnyvale, CA" },
        start: "2022-09",
        end: "2024-06",
        bullets: [
          "Answered around 40 support tickets a day from delivery firms using the route planning app, with a customer satisfaction score of 94%",
          "Reproduced and reported 90 bugs to the development team, which led to a move into the QA team in 2024",
          "Wrote 30 help centre articles on common problems, cutting tickets about those problems by 20% in 6 months",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Computer Science", us: "Bachelor of Science in Computer Science" },
        org: { uk: "University of Portsmouth", us: "University of Delaware" },
        end: "2022",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [{ title: "ISTQB Certified Tester Foundation Level", org: "International Software Testing Qualifications Board", end: "2024" }],
    skills: [
      "Test plans",
      "Manual testing",
      "Automated testing",
      "Regression testing",
      "User acceptance testing",
      "API testing",
      "Playwright",
      "TypeScript",
      "Jira",
      "Postman",
    ],
    names: ["Elena", "Marchetti", "Kinroute", "Orchardly"],
    letter: {
      job: {
        title: { uk: "QA Tester", us: "QA Analyst" },
        employer: "Orchardly",
        advert: {
          uk: `QA Tester
Orchardly, Southampton (hybrid)

Orchardly runs an online grocery delivery app used by 1.2 million customers, with a new release of its iOS and Android apps every week.

The role
You will test new features across our apps and website, and grow our automated test suite.

What we are looking for
- At least 1 year testing web or mobile apps
- Experience of automated testing in Playwright or Cypress
- Clear, detailed bug reports in Jira
- Experience testing APIs
- ISTQB Foundation Level, or similar

Salary £32,000 to £37,000`,
          us: `QA Analyst
Orchardly, Sunnyvale, CA (hybrid)

Orchardly runs an online grocery delivery app used by 1.2 million customers, with a new release of its iOS and Android apps every week.

The role
You will test new features across our apps and website, and grow our automated test suite.

What we are looking for
- At least 1 year testing web or mobile apps
- Experience with automated testing in Playwright or Cypress
- Clear, detailed bug reports in Jira
- Experience testing APIs
- ISTQB Foundation Level, or similar

Salary $85,000 to $98,000`,
        },
      },
      reason: "Test automation is what I enjoy most in testing, and I'd like to do more of it on an app people use every day.",
      paragraphs: [
        {
          uk: "Please consider my application for the QA Tester role at Orchardly. Test automation is what I enjoy most in testing, and I'd like to do more of it on an app people use every day.",
          us: "Please consider my application for the QA Analyst role at Orchardly. Test automation is what I enjoy most in testing, and I'd like to do more of it on an app people use every day.",
        },
        {
          uk: "At Kinroute I write test plans and test cases for each fortnightly release of the web app and the driver app for iOS and Android, covering around 25 changes a release. Your advert asks for experience of automated testing in Playwright or Cypress. I built 320 automated end-to-end tests in Playwright and TypeScript, running on every pull request and cutting the manual regression run from 2 days to 3 hours.",
          us: "At Kinroute I write test plans and test cases for each two-week release of the web app and the driver app for iOS and Android, covering around 25 changes a release. Your advert asks for experience with automated testing in Playwright or Cypress. I built 320 automated end-to-end tests in Playwright and TypeScript, running on every pull request and cutting the manual regression run from 2 days to 3 hours.",
        },
        "You are also looking for clear, detailed bug reports in Jira. In 2025 I logged 410 bugs in Jira with clear steps to reproduce, screenshots and logs, 38 of them rated critical before release. I also cut bugs reported by customers within a month of release by 55% in a year, by adding tests for the 40 most-used features of the app.",
        "Your advert also asks for experience testing APIs. I test the public application programming interface (API) with Postman, writing 150 checks for the endpoints that customers' systems call. I hold the ISTQB Certified Tester Foundation Level.",
        {
          uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
          us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
        },
      ],
    },
  },
  {
    id: "social-media-manager",
    industry: "marketing",
    role: "Social Media Manager",
    level: "experienced",
    template: "harbour",
    blurb: "A social media manager with 8 years at consumer brands and an agency, now leading social for a plant-based snack brand.",
    person: { name: "Amira Haddad", email: "amira.haddad@example.com", phone: { uk: "07700 900661", us: "(512) 555-0184" }, location: { uk: "Manchester", us: "Austin, TX" } },
    profile: {
      uk: "Social media manager with 8 years in social media for consumer brands, the last 4 leading social for Crunchwood Snacks, a plant-based snack brand sold in 2,000 shops. Runs Instagram, TikTok, Facebook and Pinterest with a team of 2 and a paid social budget of £30,000 a month. Grew followers across the 4 channels from 85,000 to 410,000 in 3 years and raised the average Instagram engagement rate from 1.9% to 4.3%. Brought in £1.2 million in online sales from paid social in 2025 at a return on ad spend of 4.6.",
      us: "Social media manager with 8 years in social media for consumer brands, the last 4 leading social for Crunchwood Snacks, a plant-based snack brand sold in 2,000 stores. Runs Instagram, TikTok, Facebook and Pinterest with a team of 2 and a paid social budget of $38,000 a month. Grew followers across the 4 channels from 85,000 to 410,000 in 3 years and raised the average Instagram engagement rate from 1.9% to 4.3%. Brought in $1.5 million in online sales from paid social in 2025 at a return on ad spend of 4.6.",
    },
    experience: [
      {
        title: "Social Media Manager",
        org: "Crunchwood Snacks",
        location: { uk: "Manchester", us: "Austin, TX" },
        start: "2022-04",
        current: true,
        bullets: [
          {
            uk: "Lead social media for a plant-based snack brand sold in 2,000 shops, managing 2 social media executives and 6 freelance creators",
            us: "Lead social media for a plant-based snack brand sold in 2,000 stores, managing 2 social media coordinators and 6 freelance creators",
          },
          {
            uk: "Plan a monthly content calendar of around 60 posts and 30 short videos in Sprout Social, tied to product launches, supermarket promotions and seasonal moments",
            us: "Plan a monthly content calendar of around 60 posts and 30 short videos in Sprout Social, tied to product launches, grocery store promotions and holidays",
          },
          "Grew followers across Instagram, TikTok, Facebook and Pinterest from 85,000 to 410,000 in 3 years, with TikTok rising from 12,000 to 240,000 after a weekly recipe video series",
          "Raised the average Instagram engagement rate from 1.9% to 4.3% by moving to short videos and answering every comment within 4 hours",
          {
            uk: "Run paid social on Meta and TikTok with a budget of £30,000 a month, bringing in £1.2 million in online sales in 2025 at a return on ad spend of 4.6",
            us: "Run paid social on Meta and TikTok with a budget of $38,000 a month, bringing in $1.5 million in online sales in 2025 at a return on ad spend of 4.6",
          },
          "Ran 3 campaigns with 45 paid creators in 2025, reaching 6.8 million people and lifting sales of the new popcorn range by 28% in the first month",
        ],
      },
      {
        title: { uk: "Social Media Executive", us: "Social Media Specialist" },
        org: "Fieldnote Social",
        location: { uk: "Manchester", us: "Austin, TX" },
        start: "2019-09",
        end: "2022-03",
        bullets: [
          {
            uk: "Ran organic and paid social for 7 food, drink and beauty clients, with ad budgets of £45,000 a month between them",
            us: "Ran organic and paid social for 7 food, drink and beauty clients, with ad budgets of $55,000 a month between them",
          },
          "Wrote and scheduled around 120 posts a month across the 7 clients, each signed off by the client in a monthly plan",
          "Grew a gin brand's Instagram from 9,000 to 52,000 followers in 18 months with a weekly cocktail recipe series",
          {
            uk: "Cut the average reply time to customer messages for 3 clients from 9 hours to 2 by writing saved replies and a weekend rota",
            us: "Cut the average reply time to customer messages for 3 clients from 9 hours to 2 by writing saved replies and a weekend schedule",
          },
        ],
      },
      {
        title: "Marketing Assistant",
        org: "Brookbank Garden Centres",
        location: { uk: "Stockport", us: "Round Rock, TX" },
        start: "2018-07",
        end: "2019-08",
        bullets: [
          "Posted daily on Facebook and Instagram for a chain of 5 garden centres, growing followers from 6,000 to 15,000 in a year",
          "Wrote the weekly email to 22,000 customers, with an average open rate of 34%",
          "Photographed plants, displays and events for social media, building a library of 1,500 images",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Marketing", us: "Bachelor of Arts in Advertising" },
        org: { uk: "University of Huddersfield", us: "Baylor University" },
        end: "2018",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [{ title: "Meta Certified Media Buying Professional", org: "Meta", end: "2024" }],
    skills: [
      "Content calendars",
      "Instagram",
      "TikTok",
      "Pinterest",
      "Paid social",
      "Return on ad spend",
      "Creator campaigns",
      "Short videos",
      "Sprout Social",
    ],
    names: ["Amira", "Haddad", "Crunchwood", "Fieldnote", "Brookbank", "Wildmoor", "TikTok", "Pinterest", "Stockport"],
    letter: {
      job: {
        title: "Head of Social Media",
        employer: "Wildmoor Drinks",
        advert: {
          uk: `Head of Social Media
Wildmoor Drinks, Manchester (hybrid)

Wildmoor Drinks makes alcohol-free beers and soft drinks, sold in 4,000 shops, pubs and restaurants across the UK.

The role
You will lead our social media team of 4 and our paid social budget, across Instagram, TikTok, Facebook and YouTube.

What we are looking for
- At least 5 years in social media for consumer brands
- A record of growing followers and engagement
- Experience running paid social on Meta and TikTok
- Experience planning campaigns with creators
- Confident reporting on sales from social

Salary £55,000 to £62,000`,
          us: `Head of Social Media
Wildmoor Drinks, Austin, TX (hybrid)

Wildmoor Drinks makes alcohol-free beers and soft drinks, sold in 4,000 stores, bars and restaurants across the US.

The role
You will lead our social media team of 4 and our paid social budget, across Instagram, TikTok, Facebook and YouTube.

What we are looking for
- At least 5 years in social media for consumer brands
- A record of growing followers and engagement
- Experience running paid social on Meta and TikTok
- Experience planning campaigns with creators
- Confident reporting on sales from social

Salary $95,000 to $110,000`,
        },
      },
      reason: "I'm ready to lead a larger social team, with more channels and a bigger paid budget.",
      paragraphs: [
        "I was glad to see that Wildmoor Drinks is looking for a Head of Social Media. I'm ready to lead a larger social team, with more channels and a bigger paid budget.",
        {
          uk: "At Crunchwood Snacks I lead social media for a plant-based snack brand sold in 2,000 shops, managing 2 social media executives and 6 freelance creators. Your advert asks for a record of growing followers and engagement. I grew followers across Instagram, TikTok, Facebook and Pinterest from 85,000 to 410,000 in 3 years, with TikTok rising from 12,000 to 240,000 after a weekly recipe video series. I also raised the average Instagram engagement rate from 1.9% to 4.3% by moving to short videos and answering every comment within 4 hours.",
          us: "At Crunchwood Snacks I lead social media for a plant-based snack brand sold in 2,000 stores, managing 2 social media coordinators and 6 freelance creators. Your advert asks for a record of growing followers and engagement. I grew followers across Instagram, TikTok, Facebook and Pinterest from 85,000 to 410,000 in 3 years, with TikTok rising from 12,000 to 240,000 after a weekly recipe video series. I also raised the average Instagram engagement rate from 1.9% to 4.3% by moving to short videos and answering every comment within 4 hours.",
        },
        {
          uk: "You are also looking for experience running paid social on Meta and TikTok. I run paid social on Meta and TikTok with a budget of £30,000 a month, bringing in £1.2 million in online sales in 2025 at a return on ad spend of 4.6. In 2025 I also ran 3 campaigns with 45 paid creators, reaching 6.8 million people and lifting sales of the new popcorn range by 28% in the first month.",
          us: "You are also looking for experience running paid social on Meta and TikTok. I run paid social on Meta and TikTok with a budget of $38,000 a month, bringing in $1.5 million in online sales in 2025 at a return on ad spend of 4.6. In 2025 I also ran 3 campaigns with 45 paid creators, reaching 6.8 million people and lifting sales of the new popcorn range by 28% in the first month.",
        },
        {
          uk: "I plan a monthly content calendar of around 60 posts and 30 short videos in Sprout Social, tied to product launches, supermarket promotions and seasonal moments. I am a Meta Certified Media Buying Professional.",
          us: "I plan a monthly content calendar of around 60 posts and 30 short videos in Sprout Social, tied to product launches, grocery store promotions and holidays. I am a Meta Certified Media Buying Professional.",
        },
        {
          uk: "Thank you for reading my application. My CV is attached, and I would welcome the chance to discuss the role.",
          us: "Thank you for reading my application. My resume is attached, and I would welcome the chance to discuss the role.",
        },
      ],
    },
  },
  {
    id: "content-marketer",
    industry: "marketing",
    role: "Content Marketing Manager",
    level: "experienced",
    template: "modern",
    blurb: "A content marketing manager with 9 years in business software, now leading the blog, guides and search traffic for a scheduling software company.",
    person: { name: "Niamh Kerrigan", email: "niamh.kerrigan@example.com", phone: { uk: "07700 900662", us: "(305) 555-0185" }, location: { uk: "Glasgow", us: "Miami, FL" } },
    profile: {
      uk: "Content marketing manager with 9 years writing for business software companies, the last 4 leading content at Rotaplan, which sells staff rota software to 4,000 care providers. Runs the blog, guides, webinars and newsletter with 2 content writers, 8 freelance writers and a budget of £120,000 a year. Grew organic search traffic from 40,000 to 155,000 visits a month in 3 years and raised leads from content from 180 to 620 a month. Works daily in HubSpot, WordPress, Semrush and Google Search Console.",
      us: "Content marketing manager with 9 years writing for business software companies, the last 4 leading content at Rotaplan, which sells staff scheduling software to 4,000 care providers. Runs the blog, guides, webinars and newsletter with 2 content writers, 8 freelance writers and a budget of $150,000 a year. Grew organic search traffic from 40,000 to 155,000 visits a month in 3 years and raised leads from content from 180 to 620 a month. Works daily in HubSpot, WordPress, Semrush and Google Search Console.",
    },
    experience: [
      {
        title: "Content Marketing Manager",
        org: "Rotaplan",
        location: { uk: "Glasgow", us: "Miami, FL" },
        start: "2022-02",
        current: true,
        bullets: [
          {
            uk: "Lead content for a business software company with 4,000 care provider customers, managing 2 content writers, 8 freelance writers and a budget of £120,000 a year",
            us: "Lead content for a business software company with 4,000 care provider customers, managing 2 content writers, 8 freelance writers and a budget of $150,000 a year",
          },
          "Grew organic search traffic from 40,000 to 155,000 visits a month in 3 years through keyword research in Semrush and 180 new articles",
          "Raised leads from content from 180 to 620 a month by adding guides, templates and demo offers to the 50 most-read articles",
          {
            uk: "Wrote and launched 12 downloadable guides, from rota planning to care staff retention, downloaded 14,000 times in 2025",
            us: "Wrote and launched 12 downloadable guides, from shift scheduling to care staff retention, downloaded 14,000 times in 2025",
          },
          "Updated 140 older articles in 2024 using Google Search Console data, lifting their clicks from search by 65% in 6 months",
          "Host 6 webinars a year for care home managers, with around 350 sign-ups each, and send the monthly newsletter to 21,000 subscribers",
        ],
      },
      {
        title: { uk: "Content Marketing Executive", us: "Content Marketing Specialist" },
        org: "Tillwise",
        location: { uk: "Edinburgh", us: "Fort Lauderdale, FL" },
        start: "2019-06",
        end: "2022-01",
        bullets: [
          "Wrote 2 blog posts a week on running a small shop or restaurant for a point-of-sale software company with 9,000 customers",
          "Raised the blog's monthly visits from 12,000 to 38,000 in 2 years with an editorial calendar planned around keyword research",
          "Built a library of 60 customer case studies, used by the sales team in around 40% of deals",
          "Wrote a 6-email series for free trial users, raising the share who became paying customers from 6% to 9%",
        ],
      },
      {
        title: "Content Writer",
        org: "Inkwell Content",
        location: { uk: "Glasgow", us: "Miami, FL" },
        start: "2017-09",
        end: "2019-05",
        bullets: [
          "Wrote around 30 blog posts, guides and web pages a month for 12 technology and finance clients",
          "Interviewed 40 customers of clients for case studies, each approved by the client within 2 rounds of edits",
          "Wrote 200 articles to search engine optimisation (SEO) briefs, with 45 reaching the first page of Google within 6 months",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) English Literature", us: "Bachelor of Arts in English" },
        org: { uk: "Aberystwyth University", us: "University of Maryland" },
        end: "2017",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [{ title: "HubSpot Content Marketing Certification", org: "HubSpot Academy", end: "2023" }],
    skills: [
      "Keyword research",
      "Search engine optimisation",
      "Editorial calendars",
      "Downloadable guides",
      "Case studies",
      "Webinars",
      "Newsletters",
      "Managing freelance writers",
      "HubSpot",
      "Google Search Console",
    ],
    names: ["Niamh", "Kerrigan", "Rotaplan", "Tillwise", "Ledgerbrook", "Aberystwyth", "Lauderdale"],
    letter: {
      job: {
        title: "Head of Content",
        employer: "Ledgerbrook",
        advert: {
          uk: `Head of Content
Ledgerbrook, Glasgow (hybrid)

Ledgerbrook makes accounting software for 30,000 small businesses and their accountants. Join a marketing team of 16 as we grow across the UK and Ireland.

The role
You will lead our content team of 4 writers and our freelancers, and own the blog, guides and newsletter.

What we are looking for
- At least 6 years in content marketing, ideally for business software
- A record of growing organic search traffic
- Experience turning content into leads
- Experience managing writers and freelancers
- Good knowledge of HubSpot and Semrush

Salary £60,000 to £68,000`,
          us: `Head of Content
Ledgerbrook, Miami, FL (hybrid)

Ledgerbrook makes accounting software for 30,000 small businesses and their accountants. Join a marketing team of 16 as we grow across the US.

The role
You will lead our content team of 4 writers and our freelancers, and own the blog, guides and newsletter.

What we are looking for
- At least 6 years in content marketing, ideally for business software
- A record of growing organic search traffic
- Experience turning content into leads
- Experience managing writers and freelancers
- Good knowledge of HubSpot and Semrush

Salary $115,000 to $130,000`,
        },
      },
      reason: "I enjoy writing for small businesses, and I'd like to lead a larger content team at a software company that serves them.",
      paragraphs: [
        "I hope to join Ledgerbrook as its Head of Content. I enjoy writing for small businesses, and I'd like to lead a larger content team at a software company that serves them.",
        {
          uk: "At Rotaplan I lead content for a business software company with 4,000 care provider customers, managing 2 content writers, 8 freelance writers and a budget of £120,000 a year. Your advert asks for a record of growing organic search traffic. I grew organic search traffic from 40,000 to 155,000 visits a month in 3 years through keyword research in Semrush and 180 new articles.",
          us: "At Rotaplan I lead content for a business software company with 4,000 care provider customers, managing 2 content writers, 8 freelance writers and a budget of $150,000 a year. Your advert asks for a record of growing organic search traffic. I grew organic search traffic from 40,000 to 155,000 visits a month in 3 years through keyword research in Semrush and 180 new articles.",
        },
        {
          uk: "You are also looking for experience turning content into leads. I raised leads from content from 180 to 620 a month by adding guides, templates and demo offers to the 50 most-read articles. I also wrote and launched 12 downloadable guides, from rota planning to care staff retention, downloaded 14,000 times in 2025.",
          us: "You are also looking for experience turning content into leads. I raised leads from content from 180 to 620 a month by adding guides, templates and demo offers to the 50 most-read articles. I also wrote and launched 12 downloadable guides, from shift scheduling to care staff retention, downloaded 14,000 times in 2025.",
        },
        "Your advert also asks for good knowledge of HubSpot and Semrush. I work daily in HubSpot, WordPress, Semrush and Google Search Console, and I updated 140 older articles in 2024 using Google Search Console data, lifting their clicks from search by 65% in 6 months. I also host 6 webinars a year for care home managers, with around 350 sign-ups each, and send the monthly newsletter to 21,000 subscribers. I hold the HubSpot Content Marketing Certification.",
        {
          uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
          us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
        },
      ],
    },
  },
  {
    id: "seo-specialist",
    industry: "marketing",
    role: "SEO Specialist",
    level: "early",
    template: "clearline",
    blurb: "An SEO specialist two years into technical audits, keyword research and reporting for the clients of a digital agency.",
    person: { name: "Femi Ogunleye", email: "femi.ogunleye@example.com", phone: { uk: "07700 900663", us: "(206) 555-0186" }, location: { uk: "Plymouth", us: "Seattle, WA" } },
    profile: {
      uk: "SEO specialist with 2 years at a digital marketing agency, running technical audits, keyword research and monthly reporting for 9 clients. Raised organic traffic for an online bike shop by 72% in a year and took 140 target keywords onto the first page of Google across 6 clients in 2025. Works daily in Google Search Console, Google Analytics 4 (GA4), Screaming Frog and Semrush. Holds the Google Analytics Certification and a degree in geography.",
      us: "SEO specialist with 2 years at a digital marketing agency, running technical audits, keyword research and monthly reporting for 9 clients. Raised organic traffic for an online bike shop by 72% in a year and took 140 target keywords onto the first page of Google across 6 clients in 2025. Works daily in Google Search Console, Google Analytics 4 (GA4), Screaming Frog and Semrush. Holds the Google Analytics Certification and a degree in geography.",
    },
    experience: [
      {
        title: "SEO Specialist",
        org: "Ropewalk Digital",
        location: { uk: "Plymouth", us: "Seattle, WA" },
        start: "2024-09",
        current: true,
        bullets: [
          "Run search engine optimisation for 9 clients, from a chain of 14 garden centres to a law firm and an online bike shop, reporting to each client monthly",
          "Ran technical audits of 22 websites in Screaming Frog, fixing 3,600 broken links, redirect chains and missing page titles with the clients' developers",
          "Raised organic traffic for the online bike shop by 72% in a year, from 48,000 to 83,000 visits a month, after fixing crawl errors and rewriting 300 product page titles",
          "Took 140 target keywords onto the first page of Google across 6 clients in 2025 through keyword research in Semrush and 90 new or rewritten pages",
          "Raised the share of pages passing Core Web Vitals for the garden centre chain from 41% to 88% by compressing images and removing unused scripts with its web developer",
          "Build a monthly report for each of the 9 clients in Looker Studio from Google Search Console and GA4 data, showing clicks, rankings and leads from search",
        ],
      },
      {
        title: "Digital Marketing Intern",
        org: "Thimble Fabrics",
        location: { uk: "Plymouth", us: "Tacoma, WA" },
        start: "2024-06",
        end: "2024-08",
        bullets: [
          "Wrote 25 product category descriptions around search terms found in Google Search Console, lifting visits to those pages by 30% in 2 months",
          "Added alt text to 1,200 product images from a keyword list agreed with the owner",
          "Configured Google Analytics 4 tracking for online orders and email sign-ups, used in the shop's weekly sales report",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Geography", us: "Bachelor of Arts in Geography" },
        org: { uk: "University of Plymouth", us: "Western Washington University" },
        end: "2024",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [{ title: "Google Analytics Certification", org: "Google", end: "2025" }],
    skills: [
      "Technical audits",
      "Keyword research",
      "Google Search Console",
      "Google Analytics 4",
      "Screaming Frog",
      "Semrush",
      "Looker Studio",
      "Core Web Vitals",
      "Page titles",
      "Alt text",
    ],
    names: ["Femi", "Ogunleye", "Ropewalk", "Pedalhouse"],
    letter: {
      job: {
        title: "SEO Specialist",
        employer: "Pedalhouse",
        advert: {
          uk: `SEO Specialist
Pedalhouse, Plymouth (hybrid)

Pedalhouse sells bikes, parts and cycling clothing online, with 3 million visits a month and 25,000 products.

The role
You will run search engine optimisation for our website, working with our content and development teams.

What we are looking for
- At least 1 year in SEO, in-house or at an agency
- Experience running technical audits on large websites
- Good keyword research skills
- Confident use of Google Search Console and GA4
- Experience improving Core Web Vitals

Salary £30,000 to £35,000`,
          us: `SEO Specialist
Pedalhouse, Seattle, WA (hybrid)

Pedalhouse sells bikes, parts and cycling apparel online, with 3 million visits a month and 25,000 products.

The role
You will run search engine optimization for our website, working with our content and development teams.

What we are looking for
- At least 1 year in SEO, in-house or at an agency
- Experience running technical audits on large websites
- Good keyword research skills
- Confident use of Google Search Console and GA4
- Experience improving Core Web Vitals

Salary $68,000 to $78,000`,
        },
      },
      reason: {
        uk: "After 2 years with agency clients, I want to work in-house on one large online shop so I can follow my changes through to sales.",
        us: "After 2 years with agency clients, I want to work in-house on one large online store so I can follow my changes through to sales.",
      },
      paragraphs: [
        {
          uk: "I'm interested in the SEO Specialist role at Pedalhouse. After 2 years with agency clients, I want to work in-house on one large online shop so I can follow my changes through to sales.",
          us: "I'm interested in the SEO Specialist role at Pedalhouse. After 2 years with agency clients, I want to work in-house on one large online store so I can follow my changes through to sales.",
        },
        "At Ropewalk Digital I run search engine optimisation for 9 clients, from a chain of 14 garden centres to a law firm and an online bike shop. Your advert asks for experience running technical audits on large websites. I ran technical audits of 22 websites in Screaming Frog, fixing 3,600 broken links, redirect chains and missing page titles with the clients' developers. I raised organic traffic for the online bike shop by 72% in a year, from 48,000 to 83,000 visits a month, after fixing crawl errors and rewriting 300 product page titles.",
        "You are also looking for confident use of Google Search Console and GA4. I build a monthly report for each of the 9 clients in Looker Studio from Google Search Console and GA4 data, showing clicks, rankings and leads from search. In 2025 I took 140 target keywords onto the first page of Google across 6 clients through keyword research in Semrush and 90 new or rewritten pages.",
        "Your advert also mentions Core Web Vitals. I raised the share of pages passing Core Web Vitals for the garden centre chain from 41% to 88% by compressing images and removing unused scripts with its web developer.",
        {
          uk: "My CV is attached. Thank you for your time, and I hope to hear from you.",
          us: "My resume is attached. Thank you for your time, and I hope to hear from you.",
        },
      ],
    },
  },
  {
    id: "copywriter",
    industry: "design",
    role: "Copywriter",
    level: "experienced",
    template: "portfolio",
    blurb: "A copywriter with 7 years at an agency and in-house, writing campaigns, product pages, emails and tone of voice guides that move the numbers.",
    person: {
      name: "Isobel Garvey",
      email: "isobel.garvey@example.com",
      phone: { uk: "07700 900664", us: "(213) 555-0188" },
      location: { uk: "London", us: "Los Angeles, CA" },
      links: ["portfolio.example.com/isobelgarvey"],
    },
    profile: {
      uk: "Copywriter with 7 years writing campaigns, web pages, emails and product pages, the last 4 at a creative agency for food, retail and travel brands, after 2 years as an editorial assistant on a travel magazine. Writes around 40 pieces a month across 8 client accounts, from radio scripts to welcome emails. Wrote a welcome email series for a meal kit brand that raised the click-through rate from 2.8% to 4.9%, and product pages for an online furniture shop that lifted conversion by 18%. Has created tone of voice guides for 9 brands, now used by their in-house teams.",
      us: "Copywriter with 7 years writing campaigns, web pages, emails and product pages, the last 4 at a creative agency for food, retail and travel brands, after 2 years as an editorial assistant on a travel magazine. Writes around 40 pieces a month across 8 client accounts, from radio scripts to welcome emails. Wrote a welcome email series for a meal kit brand that raised the click-through rate from 2.8% to 4.9%, and product pages for an online furniture store that lifted conversion by 18%. Has created tone of voice guides for 9 brands, now used by their in-house teams.",
    },
    experience: [
      {
        title: "Copywriter",
        org: "Plainsong Creative",
        location: { uk: "London", us: "Los Angeles, CA" },
        start: "2022-03",
        current: true,
        bullets: [
          "Write campaigns, web pages, emails and social posts for 8 client accounts in food, retail and travel, delivering around 40 pieces a month",
          "Wrote a 12-email welcome series for a meal kit brand, raising the click-through rate from 2.8% to 4.9% and first-month orders by 14%",
          {
            uk: "Rewrote 220 product pages for an online furniture shop with clearer sizes, materials and delivery times, lifting conversion on those pages by 18% in 3 months",
            us: "Rewrote 220 product pages for an online furniture store with clearer sizes, materials and delivery times, lifting conversion on those pages by 18% in 3 months",
          },
          "Scripted the radio and online video ads for a ferry company's summer campaign, which brought in 31,000 bookings in 8 weeks",
          "Created tone of voice guides for 9 brands, each with word lists, examples and before-and-after rewrites, now used by their in-house teams",
          "Wrote the copy for 11 new business pitches since 2023, 4 of which won the agency a new client",
        ],
      },
      {
        title: "Junior Copywriter",
        org: "Hartlake Home",
        location: { uk: "London", us: "Pasadena, CA" },
        start: "2019-09",
        end: "2022-02",
        bullets: [
          "Wrote around 60 product descriptions a week for an online retailer of bedding, towels and kitchen goods with 8,000 products",
          "Wrote the weekly sale emails to 300,000 subscribers, testing 2 subject lines on each send and raising the average open rate from 19% to 26%",
          "Rewrote the checkout and delivery pages with the user experience (UX) team, cutting customer emails about delivery by 35%",
          "Created the brand's first tone of voice guide in 2021, used by 25 staff in marketing and customer service",
        ],
      },
      {
        title: "Editorial Assistant",
        org: "Wayfarer Magazine",
        location: { uk: "London", us: "Los Angeles, CA" },
        start: "2017-09",
        end: "2019-08",
        bullets: [
          "Wrote around 15 short destination pieces a month for a travel magazine and its website, with 90,000 readers a month",
          "Checked facts, prices and opening times in around 40 articles an issue before each went to print",
          "Wrote the weekly newsletter to 18,000 subscribers, raising its click rate from 3.1% to 4.6% in 9 months with clearer headlines",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) English and Creative Writing", us: "Bachelor of Arts in English and Creative Writing" },
        org: { uk: "University of Liverpool", us: "University of Vermont" },
        end: "2017",
        grade: { uk: "First", us: "GPA 3.8" },
      },
    ],
    skills: [
      "Product pages",
      "Product descriptions",
      "Web pages",
      "Checkout pages",
      "Welcome emails",
      "Subject line testing",
      "Radio scripts",
      "Video scripts",
      "Tone of voice guides",
      "New business pitches",
    ],
    names: ["Isobel", "Garvey", "Hartlake", "Oatfield"],
    letter: {
      job: {
        title: "Senior Copywriter",
        employer: "Oatfield Foods",
        advert: {
          uk: `Senior Copywriter
Oatfield Foods, London

Oatfield Foods makes oat drinks, granola and porridge, sold in 6,000 shops and through our own website.

The role
You will write for our packs, website, emails, social media and campaigns, and keep our tone of voice consistent across them.

What we are looking for
- At least 5 years as a copywriter, at an agency or in-house
- A portfolio of campaign, web and email work
- A record of copy that moves numbers, such as click-through or conversion rates
- Experience writing tone of voice guides
- Experience briefing and working with designers

Salary £50,000 to £58,000`,
          us: `Senior Copywriter
Oatfield Foods, Los Angeles, CA

Oatfield Foods makes oat milk, granola and oatmeal, sold in 6,000 stores and through our own website.

The role
You will write for our packaging, website, emails, social media and campaigns, and keep our tone of voice consistent across them.

What we are looking for
- At least 5 years as a copywriter, at an agency or in-house
- A portfolio of campaign, web and email work
- A record of copy that moves numbers, such as click-through or conversion rates
- Experience writing tone of voice guides
- Experience briefing and working with designers

Salary $95,000 to $110,000`,
        },
      },
      reason: "I'd like to move in-house and get to know one food brand in depth.",
      paragraphs: [
        "I would very much like to write for Oatfield Foods as its Senior Copywriter. I'd like to move in-house and get to know one food brand in depth.",
        {
          uk: "At Plainsong Creative I write campaigns, web pages, emails and social posts for 8 client accounts in food, retail and travel, delivering around 40 pieces a month. Your advert asks for a record of copy that moves numbers, such as click-through or conversion rates. I wrote a 12-email welcome series for a meal kit brand, raising the click-through rate from 2.8% to 4.9% and first-month orders by 14%. I also rewrote 220 product pages for an online furniture shop with clearer sizes, materials and delivery times, lifting conversion on those pages by 18% in 3 months.",
          us: "At Plainsong Creative I write campaigns, web pages, emails and social posts for 8 client accounts in food, retail and travel, delivering around 40 pieces a month. Your advert asks for a record of copy that moves numbers, such as click-through or conversion rates. I wrote a 12-email welcome series for a meal kit brand, raising the click-through rate from 2.8% to 4.9% and first-month orders by 14%. I also rewrote 220 product pages for an online furniture store with clearer sizes, materials and delivery times, lifting conversion on those pages by 18% in 3 months.",
        },
        "You are also looking for experience writing tone of voice guides. I have created tone of voice guides for 9 brands, each with word lists, examples and before-and-after rewrites, now used by their in-house teams. At Hartlake Home I created the brand's first tone of voice guide in 2021, used by 25 staff in marketing and customer service.",
        "I also scripted the radio and online video ads for a ferry company's summer campaign, which brought in 31,000 bookings in 8 weeks.",
        {
          uk: "My CV and portfolio are attached, and I would welcome the chance to discuss the role. Thank you for your time.",
          us: "My resume and portfolio are attached, and I would welcome the chance to discuss the role. Thank you for your time.",
        },
      ],
    },
  },
];
