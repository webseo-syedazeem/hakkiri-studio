import type { ExampleLetter } from "../types";

/**
 * A cover letter for each example CV, to a made-up employer for a made-up
 * job. Every sentence about the person comes from their CV or their reason
 * for applying, and every sentence about the employer from the advert, so
 * each one passes the same check a person's own letter does (see
 * `examples.test.ts`). Shared text is written in UK spelling and respelled
 * for the US; anything with money, places or local job words is written for
 * each region.
 */

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** By example id. `names` are the letter's own made-up employers, for the spelling check. */
export const LETTERS: Record<string, ExampleLetter & { names?: string[] }> = {
  "software-engineer": {
    names: ["Quayside"],
    job: {
      title: "Senior Software Engineer, Payments",
      employer: "Quayside Bank",
      advert: {
        uk: `Senior Software Engineer, Payments
Quayside Bank, London (hybrid)

We are building a new payments platform for 2 million customers.

The role
You will lead a small team building payment services in TypeScript and Node.js.

What we are looking for
- Experience running payment systems with high uptime
- Strong skills in TypeScript, React and Node.js
- Experience with automated testing and frequent releases
- Experience mentoring other engineers`,
        us: `Senior Software Engineer, Payments
Quayside Bank, New York, NY (hybrid)

We are building a new payments platform for 2 million customers.

The role
You will lead a small team building payment services in TypeScript and Node.js.

What we are looking for
- Experience running payment systems with high uptime
- Strong skills in TypeScript, React and Node.js
- Experience with automated testing and frequent releases
- Experience mentoring other engineers`,
      },
    },
    reason: "I want to build payment systems that people rely on every day. I also enjoy helping other engineers grow.",
    paragraphs: [
      "I am applying for the role of Senior Software Engineer, Payments at Quayside Bank. I want to build payment systems that people rely on every day. I also enjoy helping other engineers grow.",
      {
        uk: "At Brightwave Payments I lead a team of 4 engineers building the payments service, which processes £12 million a day with 99.99% uptime over the last 2 years. I set up automated tests and releases in GitHub Actions, cutting failed releases by 60% in 6 months and releasing 5 times a day.",
        us: "At Brightwave Payments I lead a team of 4 engineers building the payments service, which processes $15 million a day with 99.99% uptime over the last 2 years. I set up automated tests and releases in GitHub Actions, cutting failed releases by 60% in 6 months and releasing 5 times a day.",
      },
      "Your advert asks for strong skills in TypeScript, React and Node.js. I cut checkout load time from 3.1 to 1.7 seconds by caching product data and splitting large code bundles, lifting completed orders by 4%. At Northlight Retail Tech I built 12 React pages for the store management app, used by 900 shop managers every day.",
      {
        uk: "I mentored 3 junior developers through their first year with weekly pairing sessions, and all 3 won promotion within 18 months. I now review code in around 25 pull requests a week and run fortnightly design sessions for 12 engineers across 3 teams.",
        us: "I mentored 3 junior developers through their first year with weekly pairing sessions, and all 3 won promotion within 18 months. I now review code in around 25 pull requests a week and run design sessions every two weeks for 12 engineers across 3 teams.",
      },
      CLOSE,
    ],
  },

  "devops-engineer": {
    names: ["Larkspur"],
    job: {
      title: "Lead Platform Engineer",
      employer: "Larkspur Energy",
      advert: {
        uk: `Lead Platform Engineer
Larkspur Energy, Bristol (hybrid)

We run the software behind smart meters in 1.5 million homes.

The role
You will lead our move to Kubernetes on Amazon Web Services (AWS) and look after our release pipelines.

What we are looking for
- Experience running Kubernetes in production
- Infrastructure as code in Terraform
- A record of cutting cloud costs
- Experience leading incident reviews and on-call rotas`,
        us: `Lead Platform Engineer
Larkspur Energy, Seattle, WA (hybrid)

We run the software behind smart meters in 1.5 million homes.

The role
You will lead our move to Kubernetes on Amazon Web Services (AWS) and look after our release pipelines.

What we are looking for
- Experience running Kubernetes in production
- Infrastructure as code in Terraform
- A record of cutting cloud costs
- Experience leading incident reviews and on-call rotations`,
      },
    },
    reason: "I want to work on systems that help homes use less energy. I also enjoy building platforms that other engineers find easy to use.",
    paragraphs: [
      "I am applying for the role of Lead Platform Engineer at Larkspur Energy. I want to work on systems that help homes use less energy. I also enjoy building platforms that other engineers find easy to use.",
      "At Cloudline Systems I run 14 Kubernetes clusters across 3 AWS regions, serving 250 services with 99.95% uptime over the last 3 years. I moved all infrastructure into Terraform modules, cutting the time to set up an environment from 3 days to 40 minutes.",
      {
        uk: "Your advert asks for a record of cutting cloud costs. I cut monthly cloud costs by £28,000 by right-sizing servers and moving batch jobs to cheaper spot capacity.",
        us: "Your advert asks for a record of cutting cloud costs. I cut monthly cloud costs by $35,000 by right-sizing servers and moving batch jobs to cheaper spot capacity.",
      },
      "I lead a weekly on-call review with 8 engineers, turning every serious incident into a written fix within 5 working days. I also set up Datadog dashboards and alerts for every service, cutting average recovery time from 90 to 40 minutes.",
      "At Harbourline Logistics I migrated 40 services from in-house servers to AWS in 9 months with no customer-facing downtime. I also trained 25 developers to release their own services with Docker and Helm through 6 hands-on workshops.",
      CLOSE,
    ],
  },

  "data-scientist": {
    names: ["Heathfield"],
    job: {
      title: "Lead Data Scientist, Fraud",
      employer: "Heathfield Insurance",
      advert: {
        uk: `Lead Data Scientist, Fraud
Heathfield Insurance, Edinburgh (hybrid)

We protect 800,000 customers from fraud every year.

The role
You will build and run the models that spot fraudulent claims, and coach a team of 3 data scientists.

What we are looking for
- Experience building fraud or risk models in Python and SQL
- Experience taking models into production
- The ability to explain results to people without a technical background
- Experience coaching other data scientists`,
        us: `Lead Data Scientist, Fraud
Heathfield Insurance, San Francisco, CA (hybrid)

We protect 800,000 customers from fraud every year.

The role
You will build and run the models that spot fraudulent claims, and coach a team of 3 data scientists.

What we are looking for
- Experience building fraud or risk models in Python and SQL
- Experience taking models into production
- The ability to explain results to people without a technical background
- Experience coaching other data scientists`,
      },
    },
    reason: "I want to keep working on fraud, where a good model saves people time and money, and I want to lead a small team.",
    paragraphs: [
      "I am applying for the role of Lead Data Scientist, Fraud at Heathfield Insurance. I want to keep working on fraud, where a good model saves people time and money, and I want to lead a small team.",
      {
        uk: "At Ledgerly Finance I built a fraud model in XGBoost over 4 months that cut false positives by 34%, saving £1.1 million a year in manual reviews. I cut model release time from 6 weeks to 4 days by moving training and deployment into MLflow and SageMaker.",
        us: "At Ledgerly Finance I built a fraud model in XGBoost over 4 months that cut false positives by 34%, saving $1.4 million a year in manual reviews. I cut model release time from 6 weeks to 4 days by moving training and deployment into MLflow and SageMaker.",
      },
      "Your advert asks for the ability to explain results to people without a technical background. I coach 3 junior data scientists in testing, code review and writing for readers without a technical background. I also wrote the team's model checklist, now used on every one of 15 models before it goes live.",
      "I built a churn model used by 12 account managers, flagging 70% of leaving customers a month ahead within its first year. I also ran 25 A/B tests a year with product teams, adding 2.5% to repeat purchases across 2.2 million customers. At Northlight Retail Tech I presented findings to the trading team every month, leading to 6 changes in pricing rules over 2 years.",
      CLOSE,
    ],
  },

  "cybersecurity-analyst": {
    names: ["Kestrel"],
    job: {
      title: "Senior Security Analyst",
      employer: "Kestrel Bank",
      advert: {
        uk: `Senior Security Analyst
Kestrel Bank, Reading (hybrid)

Our security operations team protects 1 million customers and 3,000 staff.

The role
You will investigate alerts, lead incident response and help us automate our security operations.

What we are looking for
- Experience investigating alerts in Splunk or a similar tool
- Experience building automated response playbooks
- Experience running vulnerability management
- A professional security certification, such as CISSP`,
        us: `Senior Security Analyst
Kestrel Bank, Austin, TX (hybrid)

Our security operations team protects 1 million customers and 3,000 staff.

The role
You will investigate alerts, lead incident response and help us automate our security operations.

What we are looking for
- Experience investigating alerts in Splunk or a similar tool
- Experience building automated response playbooks
- Experience running vulnerability management
- A professional security certification, such as CISSP`,
      },
    },
    reason: "I want to protect customers' money and data, and I enjoy making security work faster through automation.",
    paragraphs: [
      "I am applying for the role of Senior Security Analyst at Kestrel Bank. I want to protect customers' money and data, and I enjoy making security work faster through automation.",
      "At Ledgerly Finance I investigate around 60 security alerts a day in Splunk and CrowdStrike, escalating 2 to 3 real incidents a week. I built 35 automated response playbooks, cutting the average time to detect threats from 2.5 hours to 14 minutes.",
      "I run monthly vulnerability scans with Nessus across 2,400 devices, getting 94% of critical findings fixed within 14 days. I also lead quarterly incident response drills for 30 staff across technology, legal and communications.",
      "I rolled out multi-factor authentication to 2,400 staff with the identity team over 3 months, ending password-only access. I also write a monthly threat summary for 12 senior managers, with 3 to 5 actions agreed each time.",
      "At Harbourline Logistics I ran phishing tests for 1,800 staff, cutting the click rate from 19% to 2.1% in 2 years. I also prepared evidence for ISO 27001 certification using 90 documented controls, passed at the first audit.",
      "Your advert asks for a professional security certification, such as CISSP. I hold the Certified Information Systems Security Professional (CISSP) certification.",
      CLOSE,
    ],
  },

  "product-manager": {
    names: ["Pennant"],
    job: {
      title: "Lead Product Manager",
      employer: "Pennant Health",
      advert: {
        uk: `Lead Product Manager
Pennant Health, London (hybrid)

Pennant Health makes an app that helps 600,000 people manage long-term conditions.

The role
You will lead the product team for our mobile app, working with 10 engineers and 2 designers.

What we are looking for
- Experience leading mobile products used by large numbers of people
- A habit of testing ideas with customers before they are built
- Experience improving conversion and retention
- Experience setting goals with several teams`,
        us: `Lead Product Manager
Pennant Health, Boston, MA (hybrid)

Pennant Health makes an app that helps 600,000 people manage long-term conditions.

The role
You will lead the product team for our mobile app, working with 10 engineers and 2 designers.

What we are looking for
- Experience leading mobile products used by large numbers of people
- A habit of testing ideas with customers before they are built
- Experience improving conversion and retention
- Experience setting goals with several teams`,
      },
    },
    reason: "I want my work to help people look after their health. I also want to keep leading a mobile product.",
    paragraphs: [
      "I am applying for the role of Lead Product Manager at Pennant Health. I want my work to help people look after their health. I also want to keep leading a mobile product.",
      "At Ledgerly Finance I lead a team of 12 engineers and 2 designers building the budgeting app, used by 400,000 people a month. I redesigned onboarding after 30 customer interviews, lifting trial-to-paid conversion by 34% within a quarter.",
      "Your advert asks for a habit of testing ideas with customers before they are built. I cut the time from idea to first customer test from 6 weeks to 10 days by testing clickable prototypes first. I also launched savings goals in 10 weeks with a team of 6, adding 22% to repeat use within 90 days.",
      "I set quarterly goals with 4 teams and report progress to the leadership team every month. I also run 2 experiments a month with the data team, retiring 3 features that fewer than 1% of people used.",
      "At Stratus Software I built clickable prototypes in Figma and tested them with 8 customers before each major release. I cut support tickets about reports by 45% in 6 months by rebuilding the export screen.",
      CLOSE,
    ],
  },

  "project-manager": {
    names: ["Greywell"],
    job: {
      title: { uk: "Programme Manager", us: "Program Manager" },
      employer: "Greywell Distribution",
      advert: {
        uk: `Programme Manager
Greywell Distribution, Birmingham

We are moving our 5 warehouses onto one new warehouse management system over the next 2 years.

The role
You will lead the programme, manage a budget of £9 million and report to the operations board.

What we are looking for
- Experience delivering systems programmes across several sites
- A record of delivering on time and within budget
- Experience managing suppliers and contracts
- A project management certification such as PMP or PRINCE2`,
        us: `Program Manager
Greywell Distribution, Chicago, IL

We are moving our 5 warehouses onto one new warehouse management system over the next 2 years.

The role
You will lead the program, manage a budget of $11 million and report to the operations board.

What we are looking for
- Experience delivering systems programs across several sites
- A record of delivering on time and within budget
- Experience managing suppliers and contracts
- A project management certification such as PMP`,
      },
    },
    reason: { uk: "I enjoy large programmes that change how people work every day, and warehouses are where I have done my best work.", us: "I enjoy large programs that change how people work every day, and warehouses are where I have done my best work." },
    paragraphs: [
      {
        uk: "I am applying for the role of Programme Manager at Greywell Distribution. I enjoy large programmes that change how people work every day, and warehouses are where I have done my best work.",
        us: "I am applying for the role of Program Manager at Greywell Distribution. I enjoy large programs that change how people work every day, and warehouses are where I have done my best work.",
      },
      {
        uk: "At Harbourline Logistics I lead an £8 million warehouse systems programme across 4 sites, on course to finish 2 months early against the original plan. I also cut supplier costs by £600,000 by renegotiating 3 contracts before renewal.",
        us: "At Harbourline Logistics I lead a $10 million warehouse systems program across 4 sites, on course to finish 2 months early against the original plan. I also cut supplier costs by $750,000 by renegotiating 3 contracts before renewal.",
      },
      "Your advert asks for a record of delivering on time and within budget. I delivered the last 14 projects on time and within 5% of budget, and I brought in a shared risk register for 12 projects, catching 90% of delays at least a month ahead.",
      "At Westbrook Health Partners I delivered a new patient booking system to 30 clinics in 9 months, with no critical faults at launch. I trained 400 staff on the new system through 25 workshops before go-live, and I moved 120,000 patient records to the new system over 3 weekends with no records lost.",
      {
        uk: "I hold the Project Management Professional (PMP) certification, and I coach 5 project coordinators in planning, budgets and stakeholder updates through monthly one-to-ones.",
        us: "I hold the Project Management Professional (PMP) certification, and I coach 5 project coordinators in planning, budgets and stakeholder updates through monthly one-on-ones.",
      },
      CLOSE,
    ],
  },

  "business-analyst": {
    names: ["Brookfield"],
    job: {
      title: "Lead Business Analyst",
      employer: "Brookfield Insurance",
      advert: {
        uk: `Lead Business Analyst
Brookfield Insurance, Norwich (hybrid)

We are rebuilding how we handle claims for 2 million policyholders.

The role
You will lead a team of 3 analysts and work with claims staff and engineers on every change.

What we are looking for
- Experience improving claims or similar processes in insurance
- Experience running workshops and writing user stories
- Confidence with SQL
- Experience coaching other analysts`,
        us: `Lead Business Analyst
Brookfield Insurance, Charlotte, NC (hybrid)

We are rebuilding how we handle claims for 2 million policyholders.

The role
You will lead a team of 3 analysts and work with claims staff and engineers on every change.

What we are looking for
- Experience improving claims or similar processes in insurance
- Experience running workshops and writing user stories
- Confidence with SQL
- Experience coaching other analysts`,
      },
    },
    reason: "I want to keep improving claims, because a faster claim matters to someone having a bad week.",
    paragraphs: [
      "I am applying for the role of Lead Business Analyst at Brookfield Insurance. I want to keep improving claims, because a faster claim matters to someone having a bad week.",
      "At Calder Insurance I mapped the claims process from end to end and removed 6 hand-offs, cutting approval time from 4 days to 4 hours. I run around 8 workshops a month with claims staff and engineers to agree what each change must do.",
      "Your advert asks for confidence with SQL. I wrote SQL queries to size problems before work began, stopping 3 projects with weak business cases. I also write user stories and acceptance criteria for 2 teams, with each story signed off before build.",
      "I coach 2 junior analysts in interviewing and writing requirements through weekly reviews of their work. I also prepared 1,200 customer records for a regulatory audit, which found no issues.",
      "At Harbourline Logistics I automated invoice matching with the finance team, saving 1,200 hours of admin a year. I drew 40 process maps in Visio that became the training guide for 3 depots, and I tested 3 releases a quarter with 15 depot staff before go-live, catching 30 defects.",
      CLOSE,
    ],
  },

  "executive-assistant": {
    names: ["Ashgrove"],
    job: {
      title: "Executive Assistant to the Chief Executive",
      employer: "Ashgrove Capital",
      advert: {
        uk: `Executive Assistant to the Chief Executive
Ashgrove Capital, London

Ashgrove Capital is an investment firm with offices in 4 countries.

The role
You will manage the chief executive's diary, travel and board papers, and plan our client events.

What we are looking for
- Experience supporting a chief executive or board
- Excellent organisation and attention to detail
- Experience planning events and managing budgets
- Discretion with confidential information`,
        us: `Executive Assistant to the Chief Executive
Ashgrove Capital, Washington, DC

Ashgrove Capital is an investment firm with offices in 4 countries.

The role
You will manage the chief executive's calendar, travel and board materials, and plan our client events.

What we are looking for
- Experience supporting a chief executive or board
- Excellent organization and attention to detail
- Experience planning events and managing budgets
- Discretion with confidential information`,
      },
    },
    reason: "I enjoy keeping a busy chief executive's week running smoothly, and I want to work for an investment firm.",
    paragraphs: [
      "I am applying for the role of Executive Assistant to the Chief Executive at Ashgrove Capital. I enjoy keeping a busy chief executive's week running smoothly, and I want to work for an investment firm.",
      {
        uk: "At Stratus Software I manage the chief executive's diary, inbox and travel, booking around 25 meetings a week across 4 time zones. I prepare papers for 10 board meetings a year, sending every pack out 5 days ahead.",
        us: "At Stratus Software I manage the chief executive's calendar, inbox and travel, booking around 25 meetings a week across 4 time zones. I prepare materials for 10 board meetings a year, sending every packet out 5 days ahead.",
      },
      {
        uk: "Your advert asks for experience planning events and managing budgets. I organised the annual conference for 300 staff and clients, within a £120,000 budget. I also cut travel costs by 22% (£45,000) in a year by moving bookings to one agency and booking earlier.",
        us: "Your advert asks for experience planning events and managing budgets. I organized the annual conference for 300 staff and clients, within a $150,000 budget. I also cut travel costs by 22% ($55,000) in a year by moving bookings to one agency and booking earlier.",
      },
      "I take minutes at the weekly leadership meeting and track 40 to 60 actions to completion.",
      {
        uk: "At Ledgerly Finance I managed the diaries of 3 managing directors, with no missed or double-booked meetings in 3 years. I booked travel for 3 directors across 12 countries, keeping every trip within policy, and I created a shared filing system for 200 confidential documents, used by 12 senior staff.",
        us: "At Ledgerly Finance I managed the calendars of 3 managing directors, with no missed or double-booked meetings in 3 years. I booked travel for 3 directors across 12 countries, keeping every trip within policy, and I created a shared filing system for 200 confidential documents, used by 12 senior staff.",
      },
      CLOSE,
    ],
  },

  "customer-success": {
    names: ["Tidewell"],
    job: {
      title: "Director of Customer Success",
      employer: "Tidewell Software",
      advert: {
        uk: `Director of Customer Success
Tidewell Software, Manchester (hybrid)

Tidewell makes scheduling software for 400 business customers.

The role
You will lead a team of 12 customer success managers and own renewals and growth.

What we are looking for
- Experience leading customer success teams in business software
- A record of strong net revenue retention
- Experience building health scores and renewal forecasts
- Experience running business reviews with large customers`,
        us: `Director of Customer Success
Tidewell Software, New York, NY (hybrid)

Tidewell makes scheduling software for 400 business customers.

The role
You will lead a team of 12 customer success managers and own renewals and growth.

What we are looking for
- Experience leading customer success teams in business software
- A record of strong net revenue retention
- Experience building health scores and renewal forecasts
- Experience running business reviews with large customers`,
      },
    },
    reason: "I want to build a customer success team as the company grows, and I like working with customers who use software every day.",
    paragraphs: [
      "I am applying for the role of Director of Customer Success at Tidewell Software. I want to build a customer success team as the company grows, and I like working with customers who use software every day.",
      {
        uk: "At Brightwave Software I lead 8 customer success managers looking after 140 customers worth £18 million a year. I kept net revenue retention at 119% in 2025 by planning renewals and growth with each key account.",
        us: "At Brightwave Software I lead 8 customer success managers looking after 140 customers worth $22 million a year. I kept net revenue retention at 119% in 2025 by planning renewals and growth with each key account.",
      },
      "Your advert asks for experience building health scores and renewal forecasts. I built a health score in Gainsight using usage and support data, flagging 80% of at-risk accounts 60 days before renewal. I track each renewal and expansion in Salesforce, with forecasts within 3% of the final number.",
      "I also run quarterly business reviews with the 30 largest customers, keeping satisfaction at 96% in 2025. I have built and trained two customer success teams, growing one from 2 to 8 managers.",
      "At Stratus Software I trained 12 new managers on the renewals process and account planning. I also ran a customer advisory group of 15 accounts that shaped 8 product changes over 2 years.",
      CLOSE,
    ],
  },

  "finance-analyst": {
    names: ["Hallam", "Piedmont"],
    job: {
      title: { uk: "Commercial Finance Analyst", us: "Financial Analyst" },
      employer: { uk: "Hallam Foods", us: "Piedmont Foods" },
      advert: {
        uk: `Commercial Finance Analyst
Hallam Foods, Sheffield

Hallam Foods makes chilled food for 3 national supermarkets from 2 factories.

The role
You will build forecasts and models, report on factory costs and support budget holders across operations.

What we are looking for
- Experience in commercial or management accounting, ideally in manufacturing
- Strong Excel skills, including financial modelling
- Experience automating reports
- Studying towards ACCA or CIMA`,
        us: `Financial Analyst
Piedmont Foods, Charlotte, NC

Piedmont Foods makes chilled food for 3 national grocery chains from 2 plants.

The role
You will build forecasts and models, report on plant costs and support budget holders across operations.

What we are looking for
- Experience in financial planning and analysis, ideally in manufacturing
- Strong Excel skills, including financial modeling
- Experience automating reports
- Progress toward the CFA or CPA`,
      },
    },
    reason: {
      uk: "I want to stay in manufacturing finance, close to the factories, and I want to learn from a bigger finance team.",
      us: "I want to stay in manufacturing finance, close to the plants, and I want to learn from a bigger finance team.",
    },
    paragraphs: [
      {
        uk: "I am applying for the role of Commercial Finance Analyst at Hallam Foods. I want to stay in manufacturing finance, close to the factories, and I want to learn from a bigger finance team.",
        us: "I am applying for the role of Financial Analyst at Piedmont Foods. I want to stay in manufacturing finance, close to the plants, and I want to learn from a bigger finance team.",
      },
      {
        uk: "At Tallis Manufacturing Group I report monthly on £85 million of operating spending to 6 budget holders, explaining every variance over 5%. I built a three-statement financial model in Excel with the operations team for a £12 million factory investment approved by the board.",
        us: "At Tallis Manufacturing Group I report monthly on $105 million of operating spending to 6 budget holders, explaining every variance over 5%. I built a three-statement financial model in Excel with the operations team for a $15 million plant investment approved by the board.",
      },
      "Your advert asks for experience automating reports. I automated month-end reports with Power Query, saving 14 hours a month. I also forecast cash flow 13 weeks ahead every week, and I prepared the yearly budget packs for 6 departments, all returned and agreed by the deadline.",
      {
        uk: "As a finance intern I checked 300 supplier invoices a week against orders, finding £15,000 in duplicate payments. I also built a spreadsheet tracking 40 overdue customer accounts, which cut overdue balances by 15% in 3 months.",
        us: "As a finance intern I checked 300 vendor invoices a week against orders, finding $18,000 in duplicate payments. I also built a spreadsheet tracking 40 overdue customer accounts, which cut overdue balances by 15% in 3 months.",
      },
      {
        uk: "I am studying for the Association of Chartered Certified Accountants (ACCA) qualification, and I have passed 6 of its 9 exams.",
        us: "I explain the monthly results to each of the 6 budget holders in a 30-minute review, and I have completed CFA Level I.",
      },
      CLOSE,
    ],
  },

  "cs-graduate": {
    names: ["Copperleaf"],
    job: {
      title: { uk: "Graduate Software Engineer", us: "Associate Software Engineer" },
      employer: "Copperleaf Labs",
      advert: {
        uk: `Graduate Software Engineer
Copperleaf Labs, Bristol

Copperleaf Labs builds learning apps used in 2,000 schools.

The role
You will join a team of 6 engineers building web apps in TypeScript and React, with a mentor for your first year.

What we are looking for
- A degree in computer science or a related subject
- Experience building web apps in TypeScript or JavaScript
- An interest in teaching and education
- Clear written and spoken communication`,
        us: `Associate Software Engineer
Copperleaf Labs, Austin, TX

Copperleaf Labs builds learning apps used in 2,000 schools.

The role
You will join a team of 6 engineers building web apps in TypeScript and React, with a mentor for your first year.

What we are looking for
- A degree in computer science or a related subject
- Experience building web apps in TypeScript or JavaScript
- An interest in teaching and education
- Clear written and spoken communication`,
      },
    },
    reason: "I teach Python to children at a library code club, and I want to build software that helps children learn.",
    paragraphs: [
      {
        uk: "I am applying for the role of Graduate Software Engineer at Copperleaf Labs. I teach Python to children at a library code club, and I want to build software that helps children learn.",
        us: "I am applying for the role of Associate Software Engineer at Copperleaf Labs. I teach Python to children at a library code club, and I want to build software that helps children learn.",
      },
      {
        uk: "In my placement year at Northlight Retail Tech I built 3 internal tools in React used every day by 15 engineering teams. I also wrote unit tests that raised coverage of the analytics code from 72% to 88%.",
        us: "As a software engineering intern at Northlight Retail Tech, I built 3 internal tools in React used every day by 15 engineering teams. I also wrote unit tests that raised coverage of the analytics code from 72% to 88%.",
      },
      {
        uk: "For my final-year project I built a peer-to-peer note sharing app in TypeScript, graded 82% against a class average of 64%. I also built an interactive route-finding tool in TypeScript and HTML canvas, with 400 stars on GitHub.",
        us: "For my senior project I built a peer-to-peer note sharing app in TypeScript used by 40 classmates, graded A. I also built an interactive route-finding tool in TypeScript and HTML canvas, with 400 stars on GitHub.",
      },
      "On that project I reviewed and merged 18 pull requests from 9 outside contributors. At Northlight Retail Tech I also fixed 40 bugs from the support queue, each reviewed and released within a week. I presented a 20-minute demo of the new release dashboard to 60 engineers.",
      "Your advert asks for an interest in teaching and education. I taught Python basics to 12 children aged 9 to 13 every week, over 3 school years, and I wrote 20 short coding projects for the club.",
      CLOSE,
    ],
  },

  "staff-nurse": {
    names: ["Moorbridge", "Prairie"],
    job: {
      title: { uk: "Senior Staff Nurse, Acute Medical Unit", us: "Charge Nurse, Medical-Surgical Unit" },
      employer: { uk: "Moorbridge General Hospital NHS Trust", us: "Prairie Point Medical Center" },
      advert: {
        uk: `Senior Staff Nurse, Acute Medical Unit
Moorbridge General Hospital NHS Trust, Leeds

Our 32-bed acute medical unit admits around 40 patients a day.

The role
You will coordinate shifts, support the ward sister and help develop junior staff and student nurses.

What we are looking for
- Registered adult nurse with experience in acute medicine
- Experience coordinating a ward
- Experience mentoring student nurses
- Commitment to patient safety and quality improvement`,
        us: `Charge Nurse, Medical-Surgical Unit
Prairie Point Medical Center, Chicago, IL

Our 32-bed medical-surgical unit admits around 40 patients a day.

The role
You will lead shifts as charge nurse, support the nurse manager and help develop new nurses and nursing students.

What we are looking for
- Registered nurse with experience in medical-surgical nursing
- Experience working as a charge nurse
- Experience precepting nursing students
- Commitment to patient safety and quality improvement`,
      },
    },
    reason: {
      uk: "I want to take the next step towards becoming a ward sister, and I want to stay in acute medicine.",
      us: "I want to take the next step toward nursing leadership, and I want to stay in medical-surgical nursing.",
    },
    paragraphs: [
      {
        uk: "I am applying for the role of Senior Staff Nurse, Acute Medical Unit at Moorbridge General Hospital NHS Trust. I want to take the next step towards becoming a ward sister, and I want to stay in acute medicine.",
        us: "I am applying for the role of Charge Nurse, Medical-Surgical Unit at Prairie Point Medical Center. I want to take the next step toward nursing leadership, and I want to stay in medical-surgical nursing.",
      },
      {
        uk: "At Northgate General Hospital I care for 8 to 10 acutely unwell patients a shift on a 28-bed ward, from admission to discharge. I lead the ward as shift coordinator 2 to 3 times a week, allocating 6 nurses and 4 healthcare assistants.",
        us: "At Lakeside Medical Center I care for 5 to 6 acutely ill patients a shift on a 28-bed unit, from admission to discharge. I work as charge nurse 2 to 3 shifts a week, assigning 6 nurses and 4 patient care technicians.",
      },
      {
        uk: "Your advert asks for commitment to patient safety and quality improvement. I introduced a twice-daily skin check routine with the tissue viability team, cutting avoidable pressure ulcers by 40% in a year. I also spot deteriorating patients early with the National Early Warning Score (NEWS2), escalating 3 to 4 patients a week to the outreach team.",
        us: "Your advert asks for commitment to patient safety and quality improvement. I introduced a twice-daily skin check routine with the wound care team, cutting hospital-acquired pressure injuries by 40% in a year. I also spot deteriorating patients early with the Modified Early Warning Score (MEWS), calling the rapid response team for 3 to 4 patients a week.",
      },
      {
        uk: "I mentor 6 student nurses a year as a practice assessor, and all of them have passed their placements. I also plan safe discharges with therapists and social workers, cutting average stay on the ward from 7.2 to 6.1 days.",
        us: "I precept 6 nursing students a year, and all of them have passed their clinical rotations. I also plan safe discharges with therapists and case managers, cutting average length of stay on the unit from 5.2 to 4.4 days.",
      },
      {
        uk: "At Kingsmead Hospital I gave intravenous medicines and blood transfusions safely, with no medication errors in 18 months.",
        us: "At Riverside Community Hospital I gave intravenous medicines and blood transfusions safely, with no medication errors in 18 months.",
      },
      CLOSE,
    ],
  },
};
