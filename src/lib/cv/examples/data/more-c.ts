import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** More examples, added 27 Nov 2026 to fill gaps by level and industry. */
export const MORE_C: ExampleSpec[] = [
  {
    id: "digital-marketing-executive",
    industry: "marketing",
    role: { uk: "Digital Marketing Executive", us: "Digital Marketing Specialist" },
    level: "early",
    template: "framework",
    blurb: {
      uk: "A digital marketing executive two years into running paid search and email for an online outdoor clothing retailer.",
      us: "A digital marketing specialist two years into running paid search and email for an online outdoor apparel retailer.",
    },
    person: { name: "Lucy Pemberton", email: "lucy.pemberton@example.com", phone: { uk: "07700 900615", us: "(615) 555-0140" }, location: { uk: "Leeds", us: "Nashville, TN" } },
    profile: {
      uk: "Digital marketing executive with two years running paid search and email marketing for Tarnhollow Outdoor, an online outdoor clothing retailer with £9 million in yearly sales. Manages a Google Ads budget of £22,000 a month and raised return on ad spend from 4.1 to 5.6 in 18 months. Grew email's share of online sales from 14% to 21% with automated emails in Mailchimp. Holds the Google Ads Search and Google Analytics certifications.",
      us: "Digital marketing specialist with two years running paid search and email marketing for Tarnhollow Outdoor, an online outdoor apparel retailer with $11 million in yearly sales. Manages a Google Ads budget of $27,000 a month and raised return on ad spend from 4.1 to 5.6 in 18 months. Grew email's share of online sales from 14% to 21% with automated emails in Mailchimp. Holds the Google Ads Search and Google Analytics certifications.",
    },
    experience: [
      {
        title: { uk: "Digital Marketing Executive", us: "Digital Marketing Specialist" },
        org: "Tarnhollow Outdoor",
        location: { uk: "Leeds", us: "Nashville, TN" },
        start: "2024-09",
        current: true,
        bullets: [
          {
            uk: "Manage a Google Ads budget of £22,000 a month across search and shopping campaigns for 1,400 products",
            us: "Manage a Google Ads budget of $27,000 a month across search and shopping campaigns for 1,400 products",
          },
          "Raised return on ad spend from 4.1 to 5.6 in 18 months by splitting campaigns by margin and adding 600 negative keywords",
          "Cut the average cost per click by 22% in 2025 by rewriting the ads for 40 best-selling products and testing 3 versions of each",
          "Send 3 email campaigns a week to 85,000 subscribers in Mailchimp, lifting the average open rate from 31% to 38% through subject line tests",
          {
            uk: "Built 5 automated emails, from welcome to abandoned basket reminders, raising email's share of online sales from 14% to 21%",
            us: "Built 5 automated emails, from welcome to abandoned cart reminders, raising email's share of online sales from 14% to 21%",
          },
          "Report weekly on sales, cost and return for each channel in Google Analytics and Looker Studio, used by the head of marketing to set budgets",
        ],
      },
      {
        title: "Marketing Intern",
        org: "Penhallow Print",
        location: { uk: "Leeds", us: "Murfreesboro, TN" },
        start: "2023-06",
        end: "2023-09",
        bullets: [
          {
            uk: "Ran paid social ads for 4 product launches on a £3,000 budget, bringing in 260 new trade accounts",
            us: "Ran paid social ads for 4 product launches on a $3,500 budget, bringing in 260 new business accounts",
          },
          "Wrote 12 product emails to 9,000 business customers, with an average click rate of 4.2%",
          "Rewrote 30 product pages with clearer copy and keywords, lifting visits from search to those pages by 35% in 3 months",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Marketing", us: "Bachelor of Business Administration in Marketing" },
        org: { uk: "Leeds Beckett University", us: "Middle Tennessee State University" },
        end: "2024",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      { title: "Google Ads Search Certification", org: "Google", end: "2025" },
      { title: "Google Analytics Certification", org: "Google", end: "2025" },
    ],
    skills: ["Google Ads", "Paid search", "Shopping campaigns", "Negative keywords", "Budget management", "Email marketing", "Mailchimp", "Google Analytics", "Looker Studio", "Product page copy"],
    names: ["Pemberton", "Tarnhollow", "Penhallow", "Willowmere", "Murfreesboro", "Beckett"],
    letter: {
      job: {
        title: { uk: "Senior Digital Marketing Executive", us: "Senior Digital Marketing Specialist" },
        employer: "Willowmere Home",
        advert: {
          uk: `Senior Digital Marketing Executive
Willowmere Home, Leeds (hybrid)

Willowmere Home sells furniture and homeware online, with £15 million in yearly sales.

The role
You will run our paid search and email marketing, with a Google Ads budget of £40,000 a month. Salary £32,000 to £36,000.

What we are looking for
- At least 2 years running Google Ads for an online retailer
- A record of improving return on ad spend
- Experience building automated emails
- Confident reporting in Google Analytics`,
          us: `Senior Digital Marketing Specialist
Willowmere Home, Nashville, TN (hybrid)

Willowmere Home sells furniture and home goods online, with $18 million in yearly sales.

The role
You will run our paid search and email marketing, with a Google Ads budget of $50,000 a month. Salary $62,000 to $70,000.

What we are looking for
- At least 2 years running Google Ads for an online retailer
- A record of improving return on ad spend
- Experience building automated emails
- Confident reporting in Google Analytics`,
        },
      },
      reason: "I want to manage a larger Google Ads budget. I also enjoy building email campaigns that customers act on.",
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Digital Marketing Executive at Willowmere Home. I want to manage a larger Google Ads budget. I also enjoy building email campaigns that customers act on.",
          us: "I am applying for the role of Senior Digital Marketing Specialist at Willowmere Home. I want to manage a larger Google Ads budget. I also enjoy building email campaigns that customers act on.",
        },
        {
          uk: "At Tarnhollow Outdoor I manage a Google Ads budget of £22,000 a month across search and shopping campaigns for 1,400 products. Your advert asks for a record of improving return on ad spend. I raised return on ad spend from 4.1 to 5.6 in 18 months by splitting campaigns by margin and adding 600 negative keywords.",
          us: "At Tarnhollow Outdoor I manage a Google Ads budget of $27,000 a month across search and shopping campaigns for 1,400 products. Your advert asks for a record of improving return on ad spend. I raised return on ad spend from 4.1 to 5.6 in 18 months by splitting campaigns by margin and adding 600 negative keywords.",
        },
        {
          uk: "Your advert also asks for experience building automated emails. I built 5 automated emails, from welcome to abandoned basket reminders, raising email's share of online sales from 14% to 21%. I also send 3 email campaigns a week to 85,000 subscribers in Mailchimp, lifting the average open rate from 31% to 38% through subject line tests.",
          us: "Your advert also asks for experience building automated emails. I built 5 automated emails, from welcome to abandoned cart reminders, raising email's share of online sales from 14% to 21%. I also send 3 email campaigns a week to 85,000 subscribers in Mailchimp, lifting the average open rate from 31% to 38% through subject line tests.",
        },
        "Your advert also asks for confident reporting in Google Analytics. I report weekly on sales, cost and return for each channel in Google Analytics and Looker Studio, used by the head of marketing to set budgets. I hold the Google Ads Search and Google Analytics certifications.",
        CLOSE,
      ],
    },
  },
  {
    id: "recruiter",
    industry: "hr",
    role: { uk: "Recruitment Consultant", us: "Recruiter" },
    level: "early",
    template: "framework",
    blurb: {
      uk: "An agency recruitment consultant who places office support and finance staff with 30 employers across Bristol.",
      us: "An agency recruiter who places office support and accounting staff with 30 companies across Charlotte.",
    },
    person: { name: "Jade Whitaker", email: "jade.whitaker@example.com", phone: { uk: "07700 900616", us: "(704) 555-0141" }, location: { uk: "Bristol", us: "Charlotte, NC" } },
    profile: {
      uk: "Recruitment consultant with three years in agency recruitment, the last two placing office support and finance staff with 30 employers across Bristol. Placed 52 permanent candidates in 2025, billing £214,000 in fees against a target of £180,000. Runs a temporary recruitment desk of 25 temps a week and cut the average time to fill a role from 26 to 17 days. Holds the Certificate in Recruitment Practice from the Recruitment and Employment Confederation (REC).",
      us: "Recruiter with three years in agency recruiting, the last two placing office support and accounting staff with 30 companies across Charlotte. Placed 52 direct-hire candidates in 2025, billing $268,000 in fees against a target of $225,000. Manages a temporary staffing desk of 25 workers a week and cut the average time to fill a role from 26 to 17 days. Holds the Certified Staffing Professional (CSP) credential from the American Staffing Association.",
    },
    experience: [
      {
        title: { uk: "Recruitment Consultant", us: "Recruiter" },
        org: { uk: "Fernleigh Recruitment", us: "Fernleigh Staffing" },
        location: { uk: "Bristol", us: "Charlotte, NC" },
        start: "2024-10",
        current: true,
        bullets: [
          {
            uk: "Place office support and finance staff with 30 client employers across Bristol, with 91% of placements still in post after 6 months",
            us: "Place office support and accounting staff with 30 client companies across Charlotte, with 91% of placements still on the job after 6 months",
          },
          {
            uk: "Placed 52 permanent candidates in 2025, from receptionists to assistant accountants, billing £214,000 in fees against a target of £180,000",
            us: "Placed 52 direct-hire candidates in 2025, from receptionists to staff accountants, billing $268,000 in fees against a target of $225,000",
          },
          "Cut the average time to fill a role from 26 to 17 days in 2025 by keeping a pool of 120 pre-screened candidates",
          {
            uk: "Run a temporary recruitment desk of 25 temps a week, covering absence and busy periods for 12 clients, with 96% of shifts filled in 2025",
            us: "Manage a temporary staffing desk of 25 workers a week, covering absences and busy periods for 12 clients, with 96% of shifts filled in 2025",
          },
          {
            uk: "Win new clients through 40 business development calls a week, adding 9 employers in 2025, including 2 accounting firms",
            us: "Win new clients through 40 business development calls a week, adding 9 companies in 2025, including 2 accounting firms",
          },
          {
            uk: "Complete right to work and reference checks for every placed candidate, with no errors found in 2 compliance audits",
            us: "Complete employment eligibility and reference checks for every placed candidate, with no errors found in 2 compliance audits",
          },
        ],
      },
      {
        title: { uk: "Trainee Recruitment Consultant", us: "Recruiting Coordinator" },
        org: { uk: "Larkhill Recruitment", us: "Larkhill Staffing" },
        location: { uk: "Bristol", us: "Charlotte, NC" },
        start: "2023-08",
        end: "2024-09",
        bullets: [
          "Screened around 60 applications a day for 4 consultants, booking 15 to 20 interviews a week",
          {
            uk: "Wrote and posted 25 job adverts a month on job boards and LinkedIn, raising applications per advert from 18 to 30",
            us: "Wrote and posted 25 job postings a month on job boards and LinkedIn, raising applications per posting from 18 to 30",
          },
          "Cleaned up the candidate database of 4,000 records in the firm's CRM, removing 900 duplicates in 2 months",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business Management", us: "Bachelor of Science in Business Administration" },
        org: { uk: "University of the West of England", us: "University of North Carolina at Charlotte" },
        end: "2023",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Certificate in Recruitment Practice (CertRP)", us: "Certified Staffing Professional (CSP)" },
        org: { uk: "Recruitment and Employment Confederation", us: "American Staffing Association" },
        end: "2025",
      },
    ],
    skills: [
      "Screening",
      "Interviewing",
      "Business development",
      { uk: "Temporary recruitment", us: "Temporary staffing" },
      "Time to fill",
      { uk: "Right to work checks", us: "Employment eligibility checks" },
      "Reference checks",
      { uk: "Job adverts", us: "Job postings" },
      "CRM",
    ],
    names: ["Whitaker", "Fernleigh", "Larkhill", "Kingsmead", "CertRP"],
    letter: {
      job: {
        title: { uk: "Senior Recruitment Consultant, Finance and Office", us: "Senior Recruiter, Accounting and Office" },
        employer: { uk: "Kingsmead Recruitment", us: "Kingsmead Staffing" },
        advert: {
          uk: `Senior Recruitment Consultant, Finance and Office
Kingsmead Recruitment, Bristol

Kingsmead places finance and office staff with 200 employers across the South West.

The role
You will run a permanent and temporary desk, winning and keeping your own clients. Basic salary £30,000 plus commission.

What we are looking for
- At least 2 years in agency recruitment
- A record of meeting billing targets
- Experience running a temporary desk
- Confidence in winning new clients`,
          us: `Senior Recruiter, Accounting and Office
Kingsmead Staffing, Charlotte, NC

Kingsmead places accounting and office staff with 200 companies across the Carolinas.

The role
You will run a direct-hire and temporary staffing desk, winning and keeping your own clients. Base salary $55,000 plus commission.

What we are looking for
- At least 2 years in agency recruiting
- A record of meeting billing targets
- Experience running a temporary staffing desk
- Confidence in winning new clients`,
        },
      },
      reason: {
        uk: "I want to focus on finance recruitment. I also want to build my own client base.",
        us: "I want to focus on accounting recruiting. I also want to build my own client base.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Recruitment Consultant, Finance and Office at Kingsmead Recruitment. I want to focus on finance recruitment. I also want to build my own client base.",
          us: "I am applying for the role of Senior Recruiter, Accounting and Office at Kingsmead Staffing. I want to focus on accounting recruiting. I also want to build my own client base.",
        },
        {
          uk: "At Fernleigh Recruitment I place office support and finance staff with 30 client employers across Bristol, with 91% of placements still in post after 6 months. Your advert asks for a record of meeting billing targets. In 2025 I placed 52 permanent candidates, from receptionists to assistant accountants, billing £214,000 in fees against a target of £180,000.",
          us: "At Fernleigh Staffing I place office support and accounting staff with 30 client companies across Charlotte, with 91% of placements still on the job after 6 months. Your advert asks for a record of meeting billing targets. In 2025 I placed 52 direct-hire candidates, from receptionists to staff accountants, billing $268,000 in fees against a target of $225,000.",
        },
        {
          uk: "Your advert also asks for experience running a temporary desk. I run a temporary recruitment desk of 25 temps a week, covering absence and busy periods for 12 clients, with 96% of shifts filled in 2025. I also cut the average time to fill a role from 26 to 17 days in 2025 by keeping a pool of 120 pre-screened candidates.",
          us: "Your advert also asks for experience running a temporary staffing desk. I manage a temporary staffing desk of 25 workers a week, covering absences and busy periods for 12 clients, with 96% of shifts filled in 2025. I also cut the average time to fill a role from 26 to 17 days in 2025 by keeping a pool of 120 pre-screened candidates.",
        },
        {
          uk: "Your advert also asks for confidence in winning new clients. I win new clients through 40 business development calls a week, adding 9 employers in 2025, including 2 accounting firms. I hold the Certificate in Recruitment Practice from the Recruitment and Employment Confederation (REC).",
          us: "Your advert also asks for confidence in winning new clients. I win new clients through 40 business development calls a week, adding 9 companies in 2025, including 2 accounting firms. I hold the Certified Staffing Professional (CSP) credential from the American Staffing Association.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "accountant",
    industry: "finance",
    role: { uk: "Chartered Accountant", us: "Certified Public Accountant" },
    level: "experienced",
    template: "ledger",
    blurb: {
      uk: "A chartered accountant who trained in audit and now runs month-end and year-end reporting for a £120 million manufacturing group.",
      us: "A certified public accountant who started in audit and now runs month-end and year-end reporting for a $150 million manufacturing group.",
    },
    person: { name: "Imogen Sutherland", email: "imogen.sutherland@example.com", phone: { uk: "07700 900617", us: "(801) 555-0142" }, location: { uk: "Reading", us: "Salt Lake City, UT" } },
    profile: {
      uk: "Chartered accountant (ACA) with nine years in audit and financial reporting, the last four running the month-end and year-end close for a £120 million manufacturing group with 6 companies. Cut the month-end close from 8 to 5 working days and closed 3 external audits on time with no adjustments over £50,000. Prepares the group's statutory accounts under Financial Reporting Standard (FRS) 102 and its monthly board report. Trained with Pennington Lowe, leading audits of 14 clients a year with turnover from £5m to £60m.",
      us: "Certified public accountant (CPA) with nine years in audit and financial reporting, the last four running the month-end and year-end close for a $150 million manufacturing group with 6 entities. Cut the month-end close from 8 to 5 business days and closed 3 external audits on time with no adjustments over $60,000. Prepares consolidated financial statements under US generally accepted accounting principles (GAAP) and the monthly board report. Started at Pennington Lowe, leading audits of 14 clients a year with revenue from $6M to $75M.",
    },
    experience: [
      {
        title: { uk: "Financial Reporting Accountant", us: "Senior Accountant, Financial Reporting" },
        org: "Calderbrook Group",
        location: { uk: "Reading", us: "Salt Lake City, UT" },
        start: "2022-09",
        current: true,
        bullets: [
          {
            uk: "Run the month-end close in NetSuite for 6 companies in the group, cutting it from 8 to 5 working days in 2023 by moving 40 journals and reconciliations onto a shared timetable",
            us: "Run the month-end close in NetSuite for 6 entities, cutting it from 8 to 5 business days in 2023 by moving 40 journal entries and reconciliations onto a shared calendar",
          },
          {
            uk: "Prepare the group's year-end statutory accounts under Financial Reporting Standard (FRS) 102, with 3 external audits closed on time and no adjustments over £50,000",
            us: "Prepare the year-end consolidated financial statements under US GAAP, with 3 external audits closed on time and no adjustments over $60,000",
          },
          {
            uk: "Run the group consolidation of 6 companies each month, including 2 in euros, and produce the monthly board report with an analysis of variances to budget",
            us: "Run the consolidation of 6 entities each month, including 2 in Canadian dollars, and produce the monthly board report with an analysis of variances to budget",
          },
          "Automated 25 balance sheet reconciliations in Excel with Power Query, saving around 2 days of work each month",
          {
            uk: "Prepare quarterly VAT returns for 6 companies, with no errors found in a 2024 VAT inspection",
            us: "File sales and use tax returns in 9 states each month, with no penalties or late filings in 3 years",
          },
          {
            uk: "Train and review the work of 2 assistant accountants, both now studying for the Association of Chartered Certified Accountants (ACCA) qualification",
            us: "Train and review the work of 2 staff accountants, both now studying for the CPA exam",
          },
        ],
      },
      {
        title: "Audit Senior",
        org: "Pennington Lowe LLP",
        location: { uk: "Reading", us: "Salt Lake City, UT" },
        start: "2020-09",
        end: "2022-08",
        bullets: [
          {
            uk: "Led audits of 14 clients a year, mostly manufacturers and retailers, with turnover from £5m to £60m",
            us: "Led audits of 14 clients a year, mostly manufacturers and retailers, with revenue from $6M to $75M",
          },
          "Ran audit teams of 3 to 5 staff on site, setting the plan, reviewing working papers and clearing review points",
          {
            uk: "Found £1.2 million of overstated stock at a retail client through a year-end count, which the client corrected before sign-off",
            us: "Found $1.5 million of overstated inventory at a retail client through a year-end count, which the client corrected before sign-off",
          },
          "Brought 3 late audits back on schedule by resetting the timetable with each client's finance director",
          {
            uk: "Trained 6 audit trainees each year on testing revenue and stock, and wrote the firm's 12-page stock count guide",
            us: "Trained 6 audit associates each year on testing revenue and inventory, and wrote the firm's 12-page inventory count guide",
          },
        ],
      },
      {
        title: { uk: "Audit Trainee", us: "Audit Associate" },
        org: "Pennington Lowe LLP",
        location: { uk: "Reading", us: "Salt Lake City, UT" },
        start: "2017-09",
        end: "2020-08",
        bullets: [
          {
            uk: "Tested revenue, payroll and stock on 25 audits a year for clients in manufacturing, retail and charities",
            us: "Tested revenue, payroll and inventory on 25 audits a year for clients in manufacturing, retail and the nonprofit sector",
          },
          {
            uk: "Passed all 15 ACA exams within 3 years while working full-time",
            us: "Passed all 4 sections of the CPA exam within 14 months while working full-time",
          },
          {
            uk: "Attended 12 stock counts a year at warehouses and shops, testing around 100 items at each",
            us: "Attended 12 inventory counts a year at warehouses and stores, testing around 100 items at each",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Accounting and Finance", us: "Master of Accountancy" },
        org: { uk: "University of Reading", us: "University of Utah" },
        end: "2017",
        grade: { uk: "2:1", us: "GPA 3.7" },
      },
    ],
    certificates: [
      {
        title: { uk: "Chartered Accountant (ACA)", us: "Certified Public Accountant (CPA), Utah" },
        org: { uk: "Institute of Chartered Accountants in England and Wales", us: "Utah Division of Professional Licensing" },
        end: "2020",
      },
    ],
    skills: [
      "Month-end close",
      { uk: "Statutory accounts", us: "Financial statements" },
      { uk: "FRS 102", us: "US GAAP" },
      { uk: "Group consolidation", us: "Consolidation" },
      "Board reporting",
      "Variance analysis",
      "Balance sheet reconciliations",
      { uk: "VAT returns", us: "Sales and use tax" },
      "Excel and Power Query",
      "NetSuite",
    ],
    names: ["Imogen", "Sutherland", "Calderbrook", "Pennington", "Fenmoor"],
    letter: {
      job: {
        title: "Financial Reporting Manager",
        employer: { uk: "Fenmoor Foods Group", us: "Fenmoor Foods" },
        advert: {
          uk: `Financial Reporting Manager
Fenmoor Foods Group, Reading (hybrid)

Fenmoor makes chilled foods for UK supermarkets, with £200 million in yearly sales across 8 companies.

The role
You will lead month-end and year-end reporting for the group and manage a team of 3. Salary £60,000 to £66,000.

What we are looking for
- A qualified accountant (ACA, ACCA or CIMA)
- Experience of group consolidation and statutory accounts under FRS 102
- A record of improving the month-end close
- Experience leading audits or managing the external audit`,
          us: `Financial Reporting Manager
Fenmoor Foods, Salt Lake City, UT (hybrid)

Fenmoor makes packaged foods for grocery chains, with $250 million in yearly revenue across 8 entities.

The role
You will lead month-end and year-end reporting and manage a team of 3. Salary $105,000 to $115,000.

What we are looking for
- An active CPA license
- Experience with consolidation and financial statements under US GAAP
- A record of improving the month-end close
- Experience leading audits or managing the external audit`,
        },
      },
      reason: "I want to lead a financial reporting team. I also want to work for a food manufacturer.",
      paragraphs: [
        {
          uk: "I am applying for the role of Financial Reporting Manager at Fenmoor Foods Group. I want to lead a financial reporting team. I also want to work for a food manufacturer.",
          us: "I am applying for the role of Financial Reporting Manager at Fenmoor Foods. I want to lead a financial reporting team. I also want to work for a food manufacturer.",
        },
        {
          uk: "At Calderbrook Group I run the month-end close in NetSuite for 6 companies in the group. Your advert asks for a record of improving the month-end close. I cut the close from 8 to 5 working days in 2023 by moving 40 journals and reconciliations onto a shared timetable. I also automated 25 balance sheet reconciliations in Excel with Power Query, saving around 2 days of work each month.",
          us: "At Calderbrook Group I run the month-end close in NetSuite for 6 entities. Your advert asks for a record of improving the month-end close. I cut the close from 8 to 5 business days in 2023 by moving 40 journal entries and reconciliations onto a shared calendar. I also automated 25 balance sheet reconciliations in Excel with Power Query, saving around 2 days of work each month.",
        },
        {
          uk: "Your advert also asks for experience of group consolidation and statutory accounts under FRS 102. I run the group consolidation of 6 companies each month, including 2 in euros, and produce the monthly board report with an analysis of variances to budget. I also prepare the group's year-end statutory accounts under Financial Reporting Standard (FRS) 102, with 3 external audits closed on time.",
          us: "Your advert also asks for experience with consolidation and financial statements under US GAAP. I run the consolidation of 6 entities each month, including 2 in Canadian dollars, and produce the monthly board report with an analysis of variances to budget. I also prepare the year-end consolidated financial statements under US GAAP, with 3 external audits closed on time.",
        },
        {
          uk: "Your advert also asks for experience leading audits. At Pennington Lowe LLP I led audits of 14 clients a year, mostly manufacturers and retailers, with turnover from £5m to £60m. I ran audit teams of 3 to 5 staff on site, and I trained 6 audit trainees each year. I am a chartered accountant (ACA) with the Institute of Chartered Accountants in England and Wales.",
          us: "Your advert also asks for experience leading audits. At Pennington Lowe LLP I led audits of 14 clients a year, mostly manufacturers and retailers, with revenue from $6M to $75M. I ran audit teams of 3 to 5 staff on site, and I trained 6 audit associates each year. I am a certified public accountant (CPA), licensed in Utah.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "social-worker",
    industry: "care",
    role: { uk: "Social Worker", us: "Licensed Clinical Social Worker" },
    level: "experienced",
    template: "standard",
    blurb: {
      uk: "A children and families social worker with six years in child protection, care proceedings and writing for court.",
      us: "A licensed clinical social worker with six years in child welfare, dependency court work and therapy with children.",
    },
    person: { name: "Gemma Whitlock", email: "gemma.whitlock@example.com", phone: { uk: "07700 900618", us: "(813) 555-0143" }, location: { uk: "Sheffield", us: "Tampa, FL" } },
    profile: {
      uk: "Social worker registered with Social Work England, with six years in children's services and the last four in a children and families safeguarding team. Holds a caseload of 18 children in need, on child protection plans or in care proceedings. Writes parenting assessments and social work statements for court, with 9 filed on time in 2025 and the care plan agreed in 8 of them. Arranged 8 family group conferences in 2025, with 5 children going on to live safely with relatives instead of entering care.",
      us: "Licensed Clinical Social Worker (LCSW) with six years in child welfare, the last four working with children and families in dependency cases. Carries a caseload of 18 children and their families, with clinical and safety assessments for 30 new families a year. Writes judicial review reports for dependency court, with 9 filed on time in 2025 and the permanency plan approved in 8 of them. Arranged 8 family team meetings in 2025, with 5 children going on to live safely with relatives instead of entering out-of-home care.",
    },
    experience: [
      {
        title: { uk: "Social Worker, Children and Families", us: "Licensed Clinical Social Worker" },
        org: { uk: "Ravensdale City Council", us: "Bayview Family Services" },
        location: { uk: "Sheffield", us: "Tampa, FL" },
        start: "2022-03",
        current: true,
        bullets: [
          {
            uk: "Hold a caseload of 18 children in need, on child protection plans or in care proceedings, visiting each at least every 4 weeks",
            us: "Carry a caseload of 18 children and their families in dependency cases, visiting each child at least every 30 days",
          },
          {
            uk: "Lead section 47 child protection enquiries, completing 30 a year within 15 working days and chairing strategy discussions on safeguarding concerns with police and health",
            us: "Complete clinical and safety assessments for 30 new families a year, building safety plans with parents within 15 days of referral",
          },
          {
            uk: "Write parenting assessments and social work statements for court in care proceedings, filing 9 in 2025 by the court deadline, with the care plan agreed in 8",
            us: "Write judicial review reports and case plan updates for dependency court, filing 9 in 2025 by the court deadline, with the permanency plan approved in 8",
          },
          {
            uk: "Run monthly core group meetings for 7 children on child protection plans, with 5 plans safely ended within 12 months",
            us: "Provide weekly trauma-focused therapy to 10 children, with 8 of 10 showing lower trauma symptom scores after 16 sessions",
          },
          {
            uk: "Arranged 8 family group conferences in 2025, with 5 children going on to live safely with relatives instead of entering care",
            us: "Arranged 8 family team meetings in 2025, with 5 children going on to live safely with relatives instead of entering out-of-home care",
          },
          {
            uk: "Mentor 2 newly qualified social workers through their Assessed and Supported Year in Employment (ASYE), both passing on time",
            us: "Mentor 2 new case managers through their first year, both earning their child welfare certification on time",
          },
        ],
      },
      {
        title: { uk: "Newly Qualified Social Worker", us: "Dependency Case Manager" },
        org: { uk: "Kirkwood Borough Council", us: "Gulfside Family Services" },
        location: { uk: "Rotherham", us: "Clearwater, FL" },
        start: "2020-09",
        end: "2022-02",
        bullets: [
          {
            uk: "Completed 60 child and family assessments a year, with 92% finished within the 45-day timescale",
            us: "Completed 60 family assessments a year, with 92% finished within the 45-day deadline",
          },
          {
            uk: "Visited 25 children a month at home and school, using direct work tools to record their wishes and feelings",
            us: "Visited 25 children a month at home and school, using play-based tools to record their wishes and feelings",
          },
          "Recorded each visit and decision in the case management system within 48 hours, with every file rated good or better in 2 audits",
          {
            uk: "Referred 40 families a year to early help services, with 70% not coming back to social care within 12 months",
            us: "Referred 40 families a year to prevention services, with 70% not coming back to the child welfare system within 12 months",
          },
        ],
      },
      {
        title: { uk: "Family Support Worker (part-time)", us: "Family Support Specialist (part-time)" },
        org: { uk: "Kirkwood Borough Council", us: "Gulfside Family Services" },
        location: { uk: "Rotherham", us: "Clearwater, FL" },
        start: "2018-09",
        end: "2020-08",
        bullets: [
          "Ran weekly home visits for 12 families at a time, working on routines, school attendance and budgets with each parent",
          "Delivered a 10-week parenting course to 8 parents each term, with 7 in 10 finishing it",
          "Raised school attendance to above 90% within a term for 9 of the 12 children on the caseload",
        ],
      },
    ],
    education: [
      {
        title: { uk: "MA Social Work", us: "Master of Social Work" },
        org: { uk: "University of Sheffield", us: "University of South Florida" },
        end: "2020",
      },
      {
        title: { uk: "BA (Hons) Sociology", us: "Bachelor of Arts in Psychology" },
        org: { uk: "University of Leeds", us: "University of Central Florida" },
        end: "2018",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Registered Social Worker", us: "Licensed Clinical Social Worker (LCSW), Florida" },
        org: { uk: "Social Work England", us: "Florida Department of Health" },
      },
      {
        title: { uk: "Enhanced DBS check with barred list (Update Service)", us: "Level 2 background screening" },
        org: { uk: "Disclosure and Barring Service", us: "Florida Department of Children and Families" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "Child protection", us: "Child welfare" },
      { uk: "Safeguarding", us: "Safety planning" },
      { uk: "Section 47 enquiries", us: "Clinical assessment" },
      { uk: "Care proceedings", us: "Trauma-focused therapy" },
      { uk: "Court statements", us: "Dependency court" },
      { uk: "Parenting assessments", us: "Judicial review reports" },
      { uk: "Family group conferences", us: "Case planning" },
      { uk: "Direct work with children", us: "Family team meetings" },
      "Case recording",
      "Mentoring",
    ],
    names: ["Gemma", "Whitlock", "Ravensdale", "Kirkwood", "Rotherham", "Ashvale", "Bayview", "Gulfside", "Clearwater", "Palmview"],
    letter: {
      job: {
        title: { uk: "Senior Social Worker, Children and Families", us: "Senior Clinical Social Worker, Child Welfare" },
        employer: { uk: "Ashvale Borough Council", us: "Palmview Family Partners" },
        advert: {
          uk: `Senior Social Worker, Children and Families
Ashvale Borough Council, Sheffield

Our children and families service works with 1,200 children in need and on child protection plans.

The role
You will hold a caseload of complex child protection and court work, and supervise newly qualified social workers. Salary £41,000 to £44,000.

What we are looking for
- Registration with Social Work England
- At least 3 years in child protection
- Experience of care proceedings and writing for court
- Experience supporting newly qualified social workers`,
          us: `Senior Clinical Social Worker, Child Welfare
Palmview Family Partners, Tampa, FL

We work with 1,200 children and families in dependency cases across the Tampa Bay area.

The role
You will carry a caseload of complex dependency cases, provide therapy to children and supervise new case managers. Salary $62,000 to $68,000.

What we are looking for
- A Florida LCSW license
- At least 3 years in child welfare
- Experience writing reports for dependency court
- Experience providing trauma-focused therapy`,
        },
      },
      reason: {
        uk: "I want to take on more complex court work. I also want to supervise newly qualified social workers.",
        us: "I want to take on more complex court work. I also want to supervise new case managers.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Social Worker, Children and Families at Ashvale Borough Council. I want to take on more complex court work. I also want to supervise newly qualified social workers.",
          us: "I am applying for the role of Senior Clinical Social Worker, Child Welfare at Palmview Family Partners. I want to take on more complex court work. I also want to supervise new case managers.",
        },
        {
          uk: "At Ravensdale City Council I hold a caseload of 18 children in need, on child protection plans or in care proceedings, visiting each at least every 4 weeks. I lead section 47 child protection enquiries, completing 30 a year within 15 working days and chairing strategy discussions on safeguarding concerns with police and health.",
          us: "At Bayview Family Services I carry a caseload of 18 children and their families in dependency cases, visiting each child at least every 30 days. I complete clinical and safety assessments for 30 new families a year, building safety plans with parents within 15 days of referral.",
        },
        {
          uk: "Your advert asks for experience of care proceedings and writing for court. I write parenting assessments and social work statements for court in care proceedings, filing 9 in 2025 by the court deadline, with the care plan agreed in 8. I also arranged 8 family group conferences in 2025, with 5 children going on to live safely with relatives instead of entering care.",
          us: "Your advert asks for experience writing reports for dependency court. I write judicial review reports and case plan updates for dependency court, filing 9 in 2025 by the court deadline, with the permanency plan approved in 8. I also arranged 8 family team meetings in 2025, with 5 children going on to live safely with relatives instead of entering out-of-home care.",
        },
        {
          uk: "Your advert also asks for experience supporting newly qualified social workers. I mentor 2 newly qualified social workers through their Assessed and Supported Year in Employment (ASYE), both passing on time. I am registered with Social Work England.",
          us: "Your advert also asks for experience providing trauma-focused therapy. I provide weekly trauma-focused therapy to 10 children, with 8 of 10 showing lower trauma symptom scores after 16 sessions. I am a Licensed Clinical Social Worker (LCSW) in Florida.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "pharmacist",
    industry: "healthcare",
    role: { uk: "Community Pharmacist", us: "Pharmacist" },
    level: "experienced",
    template: "ward",
    blurb: {
      uk: "A community pharmacist with nine years in high street pharmacy who manages a busy branch and its vaccination service.",
      us: "A pharmacist with nine years in retail pharmacy who runs a busy store as pharmacist in charge.",
    },
    person: { name: "Farah Iqbal", email: "farah.iqbal@example.com", phone: { uk: "07700 900619", us: "(314) 555-0144" }, location: { uk: "Leicester", us: "St. Louis, MO" } },
    profile: {
      uk: "Community pharmacist registered with the General Pharmaceutical Council (GPhC), with nine years in community pharmacy and the last five managing a branch. Runs a pharmacy dispensing around 9,500 prescription items a month with a team of 6, and cut dispensing errors that reached patients from 6 to 1 a year. Gives around 1,100 flu vaccinations each season and launched Pharmacy First in 2024, treating 120 patients a month. Trained 2 dispensers to qualify as pharmacy technicians.",
      us: "Pharmacist with a Doctor of Pharmacy (PharmD) and a Missouri license, with nine years in retail pharmacy and the last five as pharmacist in charge. Runs a pharmacy filling around 2,100 prescriptions a week with a team of 6 technicians, and cut dispensing errors that reached patients from 6 to 1 a year. Gives around 1,600 immunizations each season and provides medication therapy management (MTM) reviews for 60 patients a month. Trained 2 technicians to pass the national certification exam.",
    },
    experience: [
      {
        title: { uk: "Pharmacist Manager", us: "Pharmacist in Charge" },
        org: "Fairlane Pharmacy",
        location: { uk: "Leicester", us: "St. Louis, MO" },
        start: "2021-04",
        current: true,
        bullets: [
          {
            uk: "Run a community pharmacy dispensing around 9,500 NHS prescription items a month, with a team of 6 dispensers and technicians",
            us: "Run a retail pharmacy filling around 2,100 prescriptions a week, with a team of 6 pharmacy technicians",
          },
          {
            uk: "Cut dispensing errors that reached patients from 6 to 1 a year by adding a second accuracy check and a quiet zone for controlled drugs",
            us: "Cut dispensing errors that reached patients from 6 to 1 a year by adding a second accuracy check and a separate area for controlled substances",
          },
          {
            uk: "Give around 1,100 flu vaccinations each season, up from 700 in 2022, by adding walk-in clinics on Saturdays",
            us: "Give around 1,600 immunizations each season, including flu, shingles and pneumococcal vaccines, up from 900 in 2022, by adding walk-in clinics on Saturdays",
          },
          {
            uk: "Launched Pharmacy First in 2024, treating 120 patients a month for 7 common conditions under patient group directions, without a GP appointment",
            us: "Provide medication therapy management (MTM) reviews for 60 patients a month, resolving around 25 drug therapy problems with doctors",
          },
          {
            uk: "Run 60 New Medicine Service consultations a month for patients starting blood pressure, asthma and diabetes medicines",
            us: "Cut prescription wait times from 25 to 12 minutes by moving refills to a scheduled queue and texting patients when orders are ready",
          },
          {
            uk: "Trained 2 dispensers to qualify as pharmacy technicians, freeing around 10 hours a week of pharmacist time for clinical services",
            us: "Trained 2 pharmacy technicians to pass the national certification exam, freeing around 10 hours a week of pharmacist time for patient care",
          },
        ],
      },
      {
        title: { uk: "Community Pharmacist", us: "Staff Pharmacist" },
        org: { uk: "Hollins Chemists", us: "Hollins Pharmacy" },
        location: { uk: "Loughborough", us: "St. Charles, MO" },
        start: "2017-08",
        end: "2021-03",
        bullets: [
          {
            uk: "Checked around 300 prescription items a day, with no errors reaching patients in 2 years",
            us: "Verified around 300 prescriptions a day, with no errors reaching patients in 2 years",
          },
          {
            uk: "Ran 25 medicines use reviews a month for patients on 4 or more medicines, raising 30 problems a year with GPs",
            us: "Counseled 40 patients a day on new medications, inhalers and blood thinners, raising 30 drug therapy problems a year with doctors",
          },
          {
            uk: "Managed monthly medicine supply for 3 care homes with 140 residents, cutting missed doses from 18 to 5 a month through clearer medicine charts",
            us: "Managed monthly medication supply for 3 long-term care facilities with 140 residents, cutting missed doses from 18 to 5 a month through clearer medication records",
          },
          {
            uk: "Introduced a weekly check of controlled drug registers, with no discrepancies at 2 inspections",
            us: "Introduced a weekly count of controlled substances, with no discrepancies at 2 state board inspections",
          },
          {
            uk: "Supplied emergency contraception and nicotine replacement to 15 patients a month under patient group directions",
            us: "Resolved around 40 insurance claim rejections a day by calling health plans and doctors' offices",
          },
          {
            uk: "Gave around 450 flu vaccinations a season from 2019, after completing vaccination training",
            us: "Administered around 450 flu vaccines a season from 2019 under the state immunization protocol",
          },
        ],
      },
      {
        title: { uk: "Pre-registration Pharmacist", us: "Community Pharmacy Resident" },
        org: { uk: "Hollins Chemists", us: "Hollins Pharmacy" },
        location: { uk: "Loughborough", us: "St. Charles, MO" },
        start: "2016-07",
        end: "2017-07",
        bullets: [
          {
            uk: "Dispensed around 200 items a day under a pharmacist's supervision, passing the registration assessment in 2017",
            us: "Verified around 200 prescriptions a day under a preceptor's supervision, completing a 12-month residency in 2017",
          },
          {
            uk: "Audited 400 repeat prescriptions over 12 weeks, finding 35 patients overdue for a medicine review",
            us: "Audited 400 refill records over 12 weeks, finding 35 patients overdue for a medication review",
          },
          {
            uk: "Ran 6 health campaigns in the pharmacy, from sun safety to blood pressure, each reaching around 150 customers",
            us: "Ran 6 health fairs in the store, from sun safety to blood pressure screening, each reaching around 150 customers",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "MPharm (Hons) Pharmacy", us: "Doctor of Pharmacy (PharmD)" },
        org: { uk: "University of Nottingham", us: "University of Missouri-Kansas City" },
        end: "2016",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Registered Pharmacist", us: "Pharmacist License, Missouri" },
        org: { uk: "General Pharmaceutical Council", us: "Missouri Board of Pharmacy" },
      },
      {
        title: { uk: "Vaccination and basic life support training", us: "Basic Life Support for Healthcare Providers" },
        org: { uk: "St John Ambulance", us: "American Heart Association" },
        end: "2025",
      },
    ],
    skills: [
      "Dispensing accuracy",
      { uk: "Controlled drugs", us: "Controlled substances" },
      { uk: "Flu vaccinations", us: "Immunizations" },
      { uk: "Pharmacy First", us: "Medication therapy management" },
      { uk: "Patient group directions", us: "Patient counseling" },
      { uk: "New Medicine Service", us: "Wait times" },
      { uk: "Medicines use reviews", us: "Drug therapy problems" },
      { uk: "Care homes", us: "Long-term care" },
      { uk: "Training dispensers", us: "Training technicians" },
    ],
    names: ["Farah", "Iqbal", "Fairlane", "Hollins", "Loughborough", "Oakhill", "MPharm", "PharmD", "GPhC"],
    letter: {
      job: {
        title: { uk: "Pharmacist Manager", us: "Pharmacist in Charge" },
        employer: "Oakhill Pharmacy",
        advert: {
          uk: `Pharmacist Manager
Oakhill Pharmacy, Leicester

Our busiest branch sits inside a health centre with 22,000 patients, dispensing 14,000 items a month.

The role
You will run the pharmacy, lead a team of 9 and grow our clinical services. Salary £58,000 plus bonus.

What we are looking for
- Registration with the General Pharmaceutical Council
- Experience managing a community pharmacy
- A record of growing services such as Pharmacy First and vaccinations
- Experience developing pharmacy staff`,
          us: `Pharmacist in Charge
Oakhill Pharmacy, St. Louis, MO

Our busiest store sits next to a medical center, filling 3,000 prescriptions a week.

The role
You will run the pharmacy, lead a team of 9 and grow our clinical services. Salary $142,000 plus bonus.

What we are looking for
- An active Missouri pharmacist license
- Experience as a pharmacist in charge or pharmacy manager
- A record of growing immunizations and medication therapy management
- Experience developing pharmacy technicians`,
        },
      },
      reason: {
        uk: "I want to run a bigger pharmacy with more clinical services. I also enjoy training pharmacy staff.",
        us: "I want to run a bigger pharmacy with more clinical services. I also enjoy training pharmacy technicians.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Pharmacist Manager at Oakhill Pharmacy. I want to run a bigger pharmacy with more clinical services. I also enjoy training pharmacy staff.",
          us: "I am applying for the role of Pharmacist in Charge at Oakhill Pharmacy. I want to run a bigger pharmacy with more clinical services. I also enjoy training pharmacy technicians.",
        },
        {
          uk: "At Fairlane Pharmacy I run a community pharmacy dispensing around 9,500 NHS prescription items a month, with a team of 6 dispensers and technicians. I cut dispensing errors that reached patients from 6 to 1 a year by adding a second accuracy check and a quiet zone for controlled drugs. I also run 60 New Medicine Service consultations a month for patients starting blood pressure, asthma and diabetes medicines.",
          us: "At Fairlane Pharmacy I run a retail pharmacy filling around 2,100 prescriptions a week, with a team of 6 pharmacy technicians. I cut dispensing errors that reached patients from 6 to 1 a year by adding a second accuracy check and a separate area for controlled substances. I also cut prescription wait times from 25 to 12 minutes by moving refills to a scheduled queue and texting patients when orders are ready.",
        },
        {
          uk: "Your advert asks for a record of growing services such as Pharmacy First and vaccinations. I launched Pharmacy First in 2024, treating 120 patients a month for 7 common conditions under patient group directions, without a GP appointment. I also give around 1,100 flu vaccinations each season, up from 700 in 2022, by adding walk-in clinics on Saturdays.",
          us: "Your advert asks for a record of growing immunizations and medication therapy management. I give around 1,600 immunizations each season, including flu, shingles and pneumococcal vaccines, up from 900 in 2022, by adding walk-in clinics on Saturdays. I also provide medication therapy management (MTM) reviews for 60 patients a month, resolving around 25 drug therapy problems with doctors.",
        },
        {
          uk: "Your advert also asks for experience developing pharmacy staff. I trained 2 dispensers to qualify as pharmacy technicians, freeing around 10 hours a week of pharmacist time for clinical services. I am registered with the General Pharmaceutical Council (GPhC).",
          us: "Your advert also asks for experience developing pharmacy technicians. I trained 2 pharmacy technicians to pass the national certification exam, freeing around 10 hours a week of pharmacist time for patient care. I hold a Doctor of Pharmacy (PharmD) and a Missouri pharmacist license.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "electrician",
    industry: "construction",
    role: { uk: "Electrician", us: "Journeyman Electrician" },
    level: "experienced",
    template: "compact",
    blurb: {
      uk: "An electrician with 12 years in domestic and commercial work, from rewires and fit-outs to inspection and testing.",
      us: "A journeyman electrician with 12 years in residential and commercial work, from rewires and build-outs to inspections.",
    },
    person: { name: "Ross McAllister", email: "ross.mcallister@example.com", phone: { uk: "07700 900620", us: "(412) 555-0145" }, location: { uk: "Derby", us: "Pittsburgh, PA" } },
    profile: {
      uk: "Electrician with 12 years in domestic and commercial work, holding the Electrotechnical Certification Scheme (ECS) Gold Card and the 18th Edition wiring regulations qualification. Installs and rewires 3 to 4 homes a month and wired 14 office and retail fit-outs in 2025, finishing every job on programme. Completes 25 Electrical Installation Condition Reports (EICRs) a month and finds and fixes around 30 dangerous faults a year. Trains 2 apprentices on site.",
      us: "Journeyman electrician with 12 years in residential and commercial work, including a 4-year apprenticeship, and a journeyman license since 2018. Installs and rewires 3 to 4 homes a month and wired 14 office and retail tenant build-outs in 2025, finishing every job on schedule. Completes 25 electrical safety inspections a month and finds and fixes around 30 dangerous faults a year. Trains 2 apprentices on site and works to the National Electrical Code (NEC).",
    },
    experience: [
      {
        title: { uk: "Approved Electrician", us: "Journeyman Electrician" },
        org: { uk: "Kettleby Electrical", us: "Kettleby Electric" },
        location: { uk: "Derby", us: "Pittsburgh, PA" },
        start: "2021-05",
        current: true,
        bullets: [
          {
            uk: "Install and rewire 3 to 4 domestic properties a month, from consumer unit upgrades to full rewires, certified under the 18th Edition wiring regulations",
            us: "Install and rewire 3 to 4 homes a month, from panel upgrades to full rewires, all to the National Electrical Code (NEC)",
          },
          {
            uk: "Complete 25 Electrical Installation Condition Reports (EICRs) a month for landlords and letting agents, with every report issued within 48 hours",
            us: "Complete 25 electrical safety inspections a month for landlords and property managers, with every report sent within 48 hours",
          },
          {
            uk: "Wired 14 office and retail fit-outs in 2025, worth £15,000 to £120,000 each, finishing every job on programme",
            us: "Wired 14 office and retail tenant build-outs in 2025, worth $18,000 to $150,000 each, finishing every job on schedule",
          },
          {
            uk: "Installed 60 electric vehicle chargers for homes and 2 car parks, each registered with the local network operator",
            us: "Installed 60 electric vehicle chargers for homes and 2 parking garages, each passing inspection the first time",
          },
          {
            uk: "Find and fix around 30 dangerous faults a year through inspection and testing, from missing earthing to overloaded circuits, making each one safe the same day",
            us: "Find and fix around 30 dangerous faults a year through troubleshooting and testing, from missing grounding to overloaded circuits, making each one safe the same day",
          },
          {
            uk: "Train 2 apprentices on site, both passing their final practical assessment in 2025",
            us: "Train 2 apprentices on site, both passing their yearly apprenticeship assessments in 2025",
          },
        ],
      },
      {
        title: "Electrician",
        org: { uk: "Trentside Building Services", us: "Steelhaven Building Services" },
        location: { uk: "Nottingham", us: "Pittsburgh, PA" },
        start: "2018-09",
        end: "2021-04",
        bullets: [
          {
            uk: "Wired lighting, power and fire alarm systems on 6 commercial projects over 2 years, worth up to £2 million each, including a 3-storey school extension",
            us: "Wired lighting, power and fire alarm systems on 6 commercial projects over 2 years, worth up to $2.5 million each, including a 3-story school addition",
          },
          {
            uk: "Tested and certified around 400 circuits a year with a multi-function tester, with no defects found at 3 yearly scheme assessments",
            us: "Tested around 400 circuits a year with a multi-function tester, with no failed inspections in 3 years",
          },
          {
            uk: "Read drawings and marked up 25 sets of as-built drawings for handover to clients",
            us: "Read blueprints and marked up 25 sets of as-built drawings for project closeout",
          },
          {
            uk: "Led a team of 3 electricians on a 4-month warehouse lighting upgrade, cutting the site's lighting energy use by 45% with light-emitting diode (LED) fittings",
            us: "Led a crew of 3 electricians on a 4-month warehouse lighting upgrade, cutting the site's lighting energy use by 45% with light-emitting diode (LED) fixtures",
          },
        ],
      },
      {
        title: "Apprentice Electrician",
        org: { uk: "Trentside Building Services", us: "Steelhaven Building Services" },
        location: { uk: "Nottingham", us: "Pittsburgh, PA" },
        start: "2014-09",
        end: "2018-08",
        bullets: [
          {
            uk: "Completed a 4-year apprenticeship with an NVQ Level 3 in Electrotechnical Services, passing the final practical assessment in 2018",
            us: "Completed a 4-year apprenticeship of 8,000 hours on the job and 900 hours in the classroom",
          },
          {
            uk: "Installed containment, cable tray and trunking on 10 commercial sites under a supervising electrician",
            us: "Installed conduit and cable tray on 10 commercial sites under a journeyman electrician",
          },
          {
            uk: "Wired 30 new-build homes in 2017, from first fix to final connections",
            us: "Wired 30 new homes in 2017, from rough-in to final connections",
          },
        ],
      },
    ],
    certificates: [
      {
        title: { uk: "ECS Gold Card, Installation Electrician", us: "Journeyman Electrician License, West Virginia" },
        org: { uk: "Electrotechnical Certification Scheme", us: "West Virginia State Fire Marshal" },
        end: "2018",
      },
      {
        title: { uk: "18th Edition Wiring Regulations (BS 7671)", us: "OSHA 30-Hour Construction" },
        org: { uk: "City & Guilds", us: "Occupational Safety and Health Administration" },
        end: "2022",
      },
      {
        title: { uk: "2391 Inspection and Testing", us: "NFPA 70E Electrical Safety in the Workplace" },
        org: { uk: "City & Guilds", us: "National Fire Protection Association" },
        end: "2023",
      },
      {
        title: { uk: "Electric Vehicle Charging Equipment Installation", us: "Electric Vehicle Infrastructure Training Program" },
        org: { uk: "City & Guilds", us: "Electric Vehicle Infrastructure Training Program" },
        end: "2022",
      },
    ],
    education: [
      {
        title: { uk: "NVQ Level 3 Diploma in Electrotechnical Services (Installation)", us: "Certificate in Electrical Construction Technology" },
        org: { uk: "Derby College", us: "Community College of Allegheny County" },
        end: "2018",
      },
    ],
    skills: [
      { uk: "Domestic rewires", us: "Home rewires" },
      { uk: "Consumer unit upgrades", us: "Panel upgrades" },
      { uk: "Office and retail fit-outs", us: "Tenant build-outs" },
      { uk: "Inspection and testing", us: "Electrical inspections" },
      { uk: "EICRs", us: "National Electrical Code" },
      { uk: "Fault finding", us: "Troubleshooting" },
      "Electric vehicle chargers",
      "Fire alarm systems",
      "LED lighting",
      "Training apprentices",
    ],
    names: ["McAllister", "Kettleby", "Trentside", "Steelhaven", "Millbrook", "Electrotechnical", "Allegheny"],
    letter: {
      job: {
        title: { uk: "Approved Electrician", us: "Lead Journeyman Electrician" },
        employer: { uk: "Millbrook Electrical Contractors", us: "Millbrook Electric" },
        advert: {
          uk: `Approved Electrician
Millbrook Electrical Contractors, Derby

We carry out domestic and commercial electrical work across the East Midlands, with a team of 25 electricians.

The role
You will lead domestic and commercial installs, carry out inspection and testing, and supervise apprentices. Pay £21 an hour, with a company van.

What we are looking for
- ECS Gold Card and the 18th Edition wiring regulations
- A 2391 inspection and testing qualification
- Experience of domestic rewires and commercial fit-outs
- Experience supervising apprentices`,
          us: `Lead Journeyman Electrician
Millbrook Electric, Pittsburgh, PA

We handle residential and commercial electrical work across western Pennsylvania, with a team of 25 electricians.

The role
You will lead residential and commercial jobs, carry out inspections and supervise apprentices. Pay $38 an hour, with a company truck.

What we are looking for
- A journeyman electrician license
- Strong knowledge of the National Electrical Code
- Experience with home rewires and tenant build-outs
- Experience supervising apprentices`,
        },
      },
      reason: {
        uk: "I want to spend more of my time on inspection and testing. I also want to keep training apprentices.",
        us: "I want to spend more of my time on inspections and troubleshooting. I also want to keep training apprentices.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Approved Electrician at Millbrook Electrical Contractors. I want to spend more of my time on inspection and testing. I also want to keep training apprentices.",
          us: "I am applying for the role of Lead Journeyman Electrician at Millbrook Electric. I want to spend more of my time on inspections and troubleshooting. I also want to keep training apprentices.",
        },
        {
          uk: "At Kettleby Electrical I install and rewire 3 to 4 domestic properties a month, from consumer unit upgrades to full rewires, certified under the 18th Edition wiring regulations. Your advert asks for experience of domestic rewires and commercial fit-outs. In 2025 I wired 14 office and retail fit-outs, worth £15,000 to £120,000 each, finishing every job on programme.",
          us: "At Kettleby Electric I install and rewire 3 to 4 homes a month, from panel upgrades to full rewires, all to the National Electrical Code (NEC). Your advert asks for experience with home rewires and tenant build-outs. In 2025 I wired 14 office and retail tenant build-outs, worth $18,000 to $150,000 each, finishing every job on schedule.",
        },
        {
          uk: "Your advert also asks for an inspection and testing qualification. I complete 25 Electrical Installation Condition Reports (EICRs) a month for landlords and letting agents, with every report issued within 48 hours. I also find and fix around 30 dangerous faults a year through inspection and testing, from missing earthing to overloaded circuits, making each one safe the same day.",
          us: "I complete 25 electrical safety inspections a month for landlords and property managers, with every report sent within 48 hours. I also find and fix around 30 dangerous faults a year through troubleshooting and testing, from missing grounding to overloaded circuits, making each one safe the same day.",
        },
        {
          uk: "Your advert also asks for experience supervising apprentices. I train 2 apprentices on site, both passing their final practical assessment in 2025. I hold the ECS Gold Card, the 18th Edition wiring regulations and the 2391 inspection and testing qualification.",
          us: "Your advert also asks for experience supervising apprentices. I train 2 apprentices on site, both passing their yearly apprenticeship assessments in 2025. I completed a 4-year apprenticeship of 8,000 hours on the job, and I have held a journeyman electrician license since 2018.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "secondary-teacher",
    industry: "education",
    role: { uk: "Secondary School Science Teacher", us: "High School Science Teacher" },
    level: "experienced",
    template: "chalkboard",
    blurb: {
      uk: "A science teacher with five years teaching pupils aged 11 to 18, A level Chemistry results to show and a Key Stage 3 lead role.",
      us: "A science teacher with five years teaching grades 7 to 12, AP Chemistry results to show and a team lead role.",
    },
    person: { name: "Tessa Langford", email: "tessa.langford@example.com", phone: { uk: "07700 900621", us: "(216) 555-0146" }, location: { uk: "Coventry", us: "Cleveland, OH" } },
    profile: {
      uk: "Secondary science teacher with five years teaching pupils aged 11 to 18, including A level Chemistry, and Key Stage 3 science coordinator since 2023. Raised the share of pupils gaining grade 4 or above in GCSE Combined Science from 62% to 74% in two years. Took A level Chemistry results to 71% A* to B in 2025, up from 58% in 2023. Holds Qualified Teacher Status (QTS) and adapts lessons for pupils with special educational needs and disabilities (SEND).",
      us: "High school science teacher with five years teaching students in grades 7 to 12, including Advanced Placement (AP) Chemistry, and grade 7 and 8 science team lead since 2023. Raised the share of students scoring proficient on the state biology end-of-course exam from 62% to 74% in two years. Took the AP Chemistry pass rate to 71% in 2025, up from 58% in 2023. Holds an Ohio teaching license in integrated science and adapts lessons for students with Individualized Education Programs (IEPs).",
    },
    experience: [
      {
        title: { uk: "Science Teacher and Key Stage 3 Science Coordinator", us: "Science Teacher and Grade 7 and 8 Science Team Lead" },
        org: { uk: "Hartfield Academy", us: "Lakeshore Academy" },
        location: { uk: "Coventry", us: "Cleveland, OH" },
        start: "2023-09",
        current: true,
        bullets: [
          {
            uk: "Teach science to 7 classes from Year 7 to Year 13, including A level Chemistry, around 190 pupils a week",
            us: "Teach science to 7 classes from grade 7 to grade 12, including AP Chemistry, around 170 students a week",
          },
          {
            uk: "Raised the share of GCSE Combined Science pupils gaining grade 4 or above from 62% to 74% in 2 years through weekly retrieval quizzes and targeted revision groups",
            us: "Raised the share of students scoring proficient or above on the state biology end-of-course exam from 62% to 74% in 2 years through weekly retrieval quizzes and targeted review groups",
          },
          {
            uk: "Taught 2 A level Chemistry groups to 71% A* to B grades in 2025, up from 58% in 2023",
            us: "Taught 2 AP Chemistry classes to a 71% pass rate, with scores of 3 or higher, in 2025, up from 58% in 2023",
          },
          {
            uk: "Coordinate Key Stage 3 science for 9 teachers, rewriting the Year 7 to 9 scheme of work with 36 practicals and a common assessment each term",
            us: "Lead the grade 7 and 8 science team of 9 teachers, rewriting the curriculum around 36 labs and a common assessment each quarter",
          },
          {
            uk: "Adapt lessons for 14 pupils with special educational needs and disabilities (SEND) a week, working with the special educational needs coordinator on each pupil's plan",
            us: "Adapt lessons for 14 students with Individualized Education Programs (IEPs) a week, working with intervention specialists on each student's plan",
          },
          {
            uk: "Run a weekly science club for 20 Year 7 and 8 pupils, with 6 entering the regional science fair in 2025",
            us: "Run a weekly science club for 20 seventh and eighth graders, with 6 entering the regional science fair in 2025",
          },
        ],
      },
      {
        title: { uk: "Science Teacher (Early Career Teacher)", us: "Science Teacher (Resident Educator)" },
        org: { uk: "Brookvale School", us: "Brookvale High School" },
        location: { uk: "Nuneaton", us: "Parma, OH" },
        start: "2021-09",
        end: "2023-08",
        bullets: [
          {
            uk: "Taught science to 6 classes from Year 7 to Year 11, completing the 2-year early career teacher induction in 2023",
            us: "Taught science to 6 classes from grade 7 to grade 10, completing the 2-year Ohio Resident Educator Program in 2023",
          },
          {
            uk: "Raised Year 10 mock exam results in Combined Science by an average of 1 grade in a year through weekly feedback lessons",
            us: "Raised grade 10 practice exam scores in biology by an average of 9 points in a year through weekly feedback lessons",
          },
          {
            uk: "Managed behaviour in 3 Year 9 classes with a clear routine for starting and ending lessons, cutting incidents from 45 to 18 a term",
            us: "Managed behavior in 3 ninth grade classes with a clear routine for starting and ending lessons, cutting referrals from 45 to 18 a quarter",
          },
          {
            uk: "Ran after-school revision sessions for 25 Year 11 pupils before their GCSEs, with 20 of 25 reaching their target grade",
            us: "Ran after-school review sessions for 25 students before state exams, with 20 of 25 scoring proficient or above",
          },
          {
            uk: "Planned and led a Year 8 trip to a science museum for 90 pupils",
            us: "Planned and led a grade 8 field trip to a science museum for 90 students",
          },
        ],
      },
      {
        title: "Chemistry Tutor (part-time)",
        org: "Brightpath Tutoring",
        location: { uk: "Birmingham", us: "Kent, OH" },
        start: "2018-10",
        end: "2020-06",
        bullets: [
          {
            uk: "Tutored 12 GCSE and A level students a week in chemistry and maths, with 10 of 12 reaching their target grade",
            us: "Tutored 12 high school students a week in chemistry and math, with 10 of 12 raising their grade by at least one letter",
          },
          {
            uk: "Wrote 40 practice papers with mark schemes, still used by the company's chemistry tutors",
            us: "Wrote 40 practice tests with answer keys, still used by the company's chemistry tutors",
          },
          {
            uk: "Ran 6 online revision days for groups of 8 to 10 students in the weeks before exams",
            us: "Ran 6 online review days for groups of 8 to 10 students in the weeks before exams",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "PGCE Secondary Science (Chemistry)", us: "Master of Arts in Teaching, Adolescence to Young Adult Science" },
        org: { uk: "University of Warwick", us: "Cleveland State University" },
        end: "2021",
      },
      {
        title: { uk: "BSc (Hons) Chemistry", us: "Bachelor of Science in Chemistry" },
        org: { uk: "University of Birmingham", us: "Kent State University" },
        end: "2020",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Qualified Teacher Status (QTS)", us: "Ohio Teaching License, Adolescence to Young Adult Integrated Science (Grades 7 to 12)" },
        org: { uk: "Department for Education", us: "Ohio Department of Education and Workforce" },
        end: "2021",
      },
      {
        title: { uk: "Enhanced DBS check with barred list (Update Service)", us: "Background check, state and federal fingerprints" },
        org: { uk: "Disclosure and Barring Service", us: "Ohio Bureau of Criminal Investigation" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "GCSE Combined Science", us: "State biology exam" },
      { uk: "A level Chemistry", us: "AP Chemistry" },
      { uk: "Schemes of work", us: "Curriculum" },
      { uk: "Practical science", us: "Lab science" },
      "Assessment",
      "Retrieval quizzes",
      { uk: "Revision groups", us: "Review sessions" },
      "Behaviour management",
      { uk: "Special educational needs", us: "Individualized Education Programs" },
      "Science club",
    ],
    names: ["Tessa", "Langford", "Hartfield", "Lakeshore", "Brookvale", "Nuneaton", "Parma", "Elmstead", "Brightpath"],
    letter: {
      job: {
        title: { uk: "Head of Chemistry", us: "Science Department Chair" },
        employer: { uk: "Elmstead Academy", us: "Elmstead High School" },
        advert: {
          uk: `Head of Chemistry
Elmstead Academy, Coventry

Elmstead is an 11 to 18 school with 1,400 pupils and a sixth form of 250.

The role
You will lead chemistry across the school, teach from Key Stage 3 to A level, and manage a team of 4 chemistry teachers. Main or upper pay range, plus a teaching and learning responsibility payment.

What we are looking for
- Qualified Teacher Status and a chemistry degree
- Experience teaching A level Chemistry
- A record of raising results at GCSE or A level
- Experience leading a curriculum area or team`,
          us: `Science Department Chair
Elmstead High School, Cleveland, OH

Elmstead is a grade 9 to 12 school with 1,400 students.

The role
You will lead the science department of 12 teachers and teach chemistry, including AP Chemistry. Salary on the district scale, plus a $4,000 stipend for the chair role.

What we are looking for
- An Ohio teaching license in science for grades 7 to 12
- Experience teaching AP Chemistry
- A record of raising student achievement on state or AP exams
- Experience leading a team of teachers`,
        },
      },
      reason: {
        uk: "I want to lead chemistry in a school with a large sixth form. I also enjoy planning a curriculum with other teachers.",
        us: "I want to lead a science department in a larger high school. I also enjoy planning a curriculum with other teachers.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Head of Chemistry at Elmstead Academy. I want to lead chemistry in a school with a large sixth form. I also enjoy planning a curriculum with other teachers.",
          us: "I am applying for the role of Science Department Chair at Elmstead High School. I want to lead a science department in a larger high school. I also enjoy planning a curriculum with other teachers.",
        },
        {
          uk: "At Hartfield Academy I teach science to 7 classes from Year 7 to Year 13, including A level Chemistry, around 190 pupils a week. Your advert asks for a record of raising results at GCSE or A level. I taught 2 A level Chemistry groups to 71% A* to B grades in 2025, up from 58% in 2023. I also raised the share of GCSE Combined Science pupils gaining grade 4 or above from 62% to 74% in 2 years through weekly retrieval quizzes and targeted revision groups.",
          us: "At Lakeshore Academy I teach science to 7 classes from grade 7 to grade 12, including AP Chemistry, around 170 students a week. Your advert asks for a record of raising student achievement on state or AP exams. I taught 2 AP Chemistry classes to a 71% pass rate in 2025, up from 58% in 2023. I also raised the share of students scoring proficient or above on the state biology end-of-course exam from 62% to 74% in 2 years through weekly retrieval quizzes and targeted review groups.",
        },
        {
          uk: "Your advert also asks for experience leading a curriculum area or team. I coordinate Key Stage 3 science for 9 teachers, rewriting the Year 7 to 9 scheme of work with 36 practicals and a common assessment each term. I also adapt lessons for 14 pupils with special educational needs and disabilities (SEND) a week, working with the special educational needs coordinator on each pupil's plan.",
          us: "Your advert also asks for experience leading a team of teachers. I lead the grade 7 and 8 science team of 9 teachers, rewriting the curriculum around 36 labs and a common assessment each quarter. I also adapt lessons for 14 students with Individualized Education Programs (IEPs) a week, working with intervention specialists on each student's plan.",
        },
        {
          uk: "I hold Qualified Teacher Status (QTS) and a BSc in Chemistry from the University of Birmingham. I also run a weekly science club for 20 Year 7 and 8 pupils, with 6 entering the regional science fair in 2025.",
          us: "I hold an Ohio teaching license in integrated science for grades 7 to 12 and a Bachelor of Science in Chemistry from Kent State University. I also run a weekly science club for 20 seventh and eighth graders, with 6 entering the regional science fair in 2025.",
        },
        CLOSE,
      ],
    },
  },
];
