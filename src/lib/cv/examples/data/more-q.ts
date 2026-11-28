import type { ExampleSpec } from "../types";

/** Phase 3, batch 2 (28 Nov 2026): the last nine listed roles, and 21 roles added to the industry packs. */
export const MORE_Q: ExampleSpec[] = [
  {
    id: "full-stack-developer",
    industry: "software",
    role: "Full-Stack Developer",
    level: "experienced",
    template: "clearline",
    blurb: "A full-stack developer who builds the booking and payments app used by 2,400 fitness studios, in TypeScript, React and Node.js.",
    person: { name: "Rohan Desai", email: "rohan.desai@example.com", phone: { uk: "07700 900702", us: "(760) 555-0125" }, location: { uk: "Brighton", us: "Carlsbad, CA" } },
    profile: {
      uk: "Full-stack developer with 7 years of experience building web products in TypeScript, React, Node.js and PostgreSQL, the last 4 at a company whose booking and payments app is used by 2,400 fitness studios. Led the build of online memberships, which took £3.1 million in payments in their first 12 months. Cut the median load time of the booking page from 2.8 to 1.1 seconds and kept uptime at 99.95% over 2 years. Reviews around 15 pull requests a week and mentors 2 junior developers.",
      us: "Full-stack developer with 7 years of experience building web products in TypeScript, React, Node.js and PostgreSQL, the last 4 at a company whose booking and payments app is used by 2,400 fitness studios. Led the build of online memberships, which took $3.9 million in payments in their first 12 months. Cut the median load time of the booking page from 2.8 to 1.1 seconds and kept uptime at 99.95% over 2 years. Reviews around 15 pull requests a week and mentors 2 junior developers.",
    },
    experience: [
      {
        title: "Full-Stack Developer",
        org: "Studiowise",
        location: { uk: "Brighton", us: "Carlsbad, CA" },
        start: "2022-09",
        current: true,
        bullets: [
          "Build features across the React front end and Node.js back end of a booking and payments app used by 2,400 fitness studios and 380,000 members",
          {
            uk: "Led the build of online memberships using TypeScript and PostgreSQL, which took £3.1 million in payments in its first 12 months",
            us: "Led the build of online memberships using TypeScript and PostgreSQL, which took $3.9 million in payments in its first 12 months",
          },
          {
            uk: "Cut the median load time of the booking page from 2.8 to 1.1 seconds by caching timetables in Redis and splitting the JavaScript bundle",
            us: "Cut the median load time of the booking page from 2.8 to 1.1 seconds by caching class schedules in Redis and splitting the JavaScript bundle",
          },
          "Moved 40 background jobs to a queue with retries, cutting failed payment reminders from about 300 a week to under 20",
          {
            uk: "Kept the app's uptime at 99.95% over the last 2 years as one of 4 developers on the on-call rota, writing 9 runbooks for common incidents",
            us: "Kept the app's uptime at 99.95% over the last 2 years as one of 4 developers on the on-call rotation, writing 9 runbooks for common incidents",
          },
          "Review around 15 pull requests a week and mentor 2 junior developers, both promoted to developer within 18 months",
        ],
      },
      {
        title: "Developer",
        org: "Copperkite Digital",
        location: { uk: "Brighton", us: "San Diego, CA" },
        start: "2021-01",
        end: "2022-08",
        bullets: [
          "Built web apps in React, Node.js and PostgreSQL for 18 clients, including a ticketing site that sold 120,000 tickets in 2021",
          "Rebuilt 6 client websites from WordPress in Next.js, cutting hosting costs by 35% in a year",
          "Wrote automated tests in Jest and Playwright for the 4 largest projects, raising test coverage from 30% to 80%",
          "Introduced code review on pull requests for the team of 7 developers, cutting bugs reported by clients by 40% in 6 months",
          "Added card payments with Stripe to 3 client online shops, which took around 4,000 orders a month in 2022",
        ],
      },
      {
        title: "Junior Developer",
        org: "Copperkite Digital",
        location: { uk: "Brighton", us: "San Diego, CA" },
        start: "2019-08",
        end: "2020-12",
        bullets: [
          "Built 25 page templates and components for client websites in React, each tested on 6 browsers and devices",
          {
            uk: "Fixed around 200 bugs from the client queue in the first year, most within 2 working days",
            us: "Fixed around 200 bugs from the client queue in the first year, most within 2 business days",
          },
          "Wrote a front-end style guide for the agency's 7 developers, used on all new client sites from 2020",
          "Promoted to developer after 16 months, after building the front end of 3 client sites alone",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Computer Science", us: "Bachelor of Science in Computer Science" },
        org: { uk: "University of Brighton", us: "California State University San Marcos" },
        end: "2019",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [{ title: "AWS Certified Developer (Associate)", org: "Amazon Web Services", end: "2024" }],
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Redis", "Next.js", "Jest", "Playwright", "Code review", "Mentoring"],
    names: ["Rohan", "Desai", "Studiowise", "Copperkite", "Fernway"],
    letter: {
      job: {
        title: "Full-Stack Developer",
        employer: "Fernway Health",
        advert: {
          uk: `Full-Stack Developer
Fernway Health, Brighton (hybrid)

Fernway Health makes online booking and payments software used by 900 physiotherapy and sports injury clinics.

The role
You will build features across our React front end and Node.js services, and take a turn on the on-call rota.

What we are looking for
- At least 4 years building web products in TypeScript
- Strong experience with React, Node.js and PostgreSQL
- A record of improving the speed and reliability of a live product
- Experience reviewing code and mentoring junior developers
- Experience with payments is a plus

Salary £60,000 to £70,000`,
          us: `Full-Stack Developer
Fernway Health, San Diego, CA (hybrid)

Fernway Health makes online booking and payments software used by 900 physical therapy and sports medicine clinics.

The role
You will build features across our React front end and Node.js services, and take a turn in the on-call rotation.

What we are looking for
- At least 4 years building web products in TypeScript
- Strong experience with React, Node.js and PostgreSQL
- A record of improving the speed and reliability of a live product
- Experience reviewing code and mentoring junior developers
- Experience with payments is a plus

Salary $135,000 to $155,000`,
        },
      },
      reason: "I want to build software that clinics and their patients rely on, and I enjoy making a live product faster and more reliable.",
      paragraphs: [
        "I am keen to apply for the Full-Stack Developer role at Fernway Health. I want to build software that clinics and their patients rely on, and I enjoy making a live product faster and more reliable.",
        {
          uk: "At Studiowise I build features across the React front end and Node.js back end of a booking and payments app used by 2,400 fitness studios and 380,000 members. Your advert mentions payments. I led the build of online memberships using TypeScript and PostgreSQL, which took £3.1 million in payments in its first 12 months.",
          us: "At Studiowise I build features across the React front end and Node.js back end of a booking and payments app used by 2,400 fitness studios and 380,000 members. Your advert mentions payments. I led the build of online memberships using TypeScript and PostgreSQL, which took $3.9 million in payments in its first 12 months.",
        },
        {
          uk: "You are also looking for a record of improving the speed and reliability of a live product. I cut the median load time of the booking page from 2.8 to 1.1 seconds by caching timetables in Redis and splitting the JavaScript bundle. I have also kept the app's uptime at 99.95% over the last 2 years as one of 4 developers on the on-call rota.",
          us: "You are also looking for a record of improving the speed and reliability of a live product. I cut the median load time of the booking page from 2.8 to 1.1 seconds by caching class schedules in Redis and splitting the JavaScript bundle. I have also kept the app's uptime at 99.95% over the last 2 years as one of 4 developers on the on-call rotation.",
        },
        "Your advert asks for experience reviewing code and mentoring junior developers. I review around 15 pull requests a week and mentor 2 junior developers, both promoted to developer within 18 months. At Copperkite Digital I introduced code review on pull requests for the team of 7 developers, cutting bugs reported by clients by 40% in 6 months.",
        "Thank you for reading my application. I would welcome the chance to talk about the role.",
      ],
    },
  },
  {
    id: "data-engineer",
    industry: "data",
    role: "Data Engineer",
    level: "experienced",
    template: "index",
    blurb: "A data engineer who runs 45 pipelines for an online grocer, with a nightly run cut from 5 hours to 70 minutes.",
    person: { name: "Kirsty Lomax", email: "kirsty.lomax@example.com", phone: { uk: "07700 900703", us: "(928) 555-0126" }, location: { uk: "Manchester", us: "Prescott, AZ" } },
    profile: {
      uk: "Data engineer with 6 years in data, the last 3 years building pipelines in Python, SQL, dbt and Airflow for an online grocer. Loads around 60 million rows a day into Snowflake, and cut the nightly run from 5 hours to 70 minutes. Cut the monthly Snowflake bill from £21,000 to £13,500 in 6 months, and wrote 300 data quality tests that caught 41 broken loads in 2025. Holds the SnowPro Core and dbt Analytics Engineering certifications.",
      us: "Data engineer with 6 years in data, the last 3 years building pipelines in Python, SQL, dbt and Airflow for an online grocer. Loads around 60 million rows a day into Snowflake, and cut the nightly run from 5 hours to 70 minutes. Cut the monthly Snowflake bill from $26,000 to $17,000 in 6 months, and wrote 300 data quality tests that caught 41 broken loads in 2025. Holds the SnowPro Core and dbt Analytics Engineering certifications.",
    },
    experience: [
      {
        title: "Data Engineer",
        org: "Basketful",
        location: { uk: "Manchester", us: "Phoenix, AZ" },
        start: "2023-04",
        current: true,
        bullets: [
          "Build and run 45 data pipelines in Python and SQL that load around 60 million rows a day from the website, apps and warehouse systems into Snowflake",
          "Moved 120 nightly reports from hand-written SQL scripts to dbt models scheduled in Airflow, cutting the nightly run from 5 hours to 70 minutes",
          {
            uk: "Cut the monthly Snowflake bill from £21,000 to £13,500 in 6 months by resizing warehouses, clustering the 5 largest tables and removing unused jobs",
            us: "Cut the monthly Snowflake bill from $26,000 to $17,000 in 6 months by resizing warehouses, clustering the 5 largest tables and removing unused jobs",
          },
          "Wrote 300 data quality tests in dbt for keys, missing values and freshness, catching 41 broken loads in 2025 before they reached any report",
          "Built a real-time stock feed from the warehouse system with Kafka, so the website shows out-of-stock items within 2 minutes instead of the next morning",
          "Lead a weekly review of failed jobs with the 2 other data engineers, keeping pipeline success above 99.5% over 18 months",
        ],
      },
      {
        title: "Data Analyst",
        org: "Wavecrest Insurance",
        location: { uk: "Stockport", us: "Scottsdale, AZ" },
        start: "2021-09",
        end: "2023-03",
        bullets: [
          "Built weekly claims and sales reports in SQL and Tableau for 40 managers, replacing 12 spreadsheets that took 2 days a week to update",
          "Wrote Python scripts to load daily policy data from 3 systems into the data warehouse, cutting manual data entry by 15 hours a week",
          {
            uk: "Built a Python model that flagged likely duplicate claims, finding 140 duplicates worth £210,000 over 12 months",
            us: "Built a Python model that flagged likely duplicate claims, finding 140 duplicates worth $260,000 over 12 months",
          },
          "Moved 25 reports from Access databases to a new SQL Server data warehouse in 2022, which led to a move into data engineering",
        ],
      },
      {
        title: "Graduate Analyst",
        org: "Wavecrest Insurance",
        location: { uk: "Stockport", us: "Scottsdale, AZ" },
        start: "2020-09",
        end: "2021-08",
        bullets: [
          "Checked and cleaned around 2 million policy records a month in SQL before they went into the monthly board report",
          "Trained 15 claims staff to write their own SQL queries through 4 workshops, cutting report requests to the team by 30%",
          "Automated 6 monthly Excel reports with Python, saving the team around 2 days of work each month",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Mathematics", us: "Bachelor of Science in Mathematics" },
        org: { uk: "Keele University", us: "Northern Arizona University" },
        end: "2020",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      { title: "SnowPro Core Certification", org: "Snowflake", end: "2024" },
      { title: "dbt Analytics Engineering Certification", org: "dbt Labs", end: "2025" },
      { title: "AWS Certified Data Engineer (Associate)", org: "Amazon Web Services", end: "2025" },
    ],
    skills: ["Python", "SQL", "dbt", "Airflow", "Snowflake", "Kafka", "Data pipelines", "Data quality tests", "Tableau", "SQL Server"],
    names: ["Kirsty", "Lomax", "Basketful", "Wavecrest", "Gorsefield", "SnowPro", "Stockport", "Keele"],
    letter: {
      job: {
        title: "Data Engineer",
        employer: "Gorsefield Energy",
        advert: {
          uk: `Data Engineer
Gorsefield Energy, Manchester (hybrid)

Gorsefield Energy supplies gas and electricity to 1.2 million homes. We are moving our customer and smart meter data to a new cloud data platform.

The role
You will build and run the pipelines that feed our billing, forecasting and customer teams.

What we are looking for
- At least 3 years building data pipelines in Python and SQL
- Experience with dbt and Airflow
- Experience with Snowflake or BigQuery, including keeping costs down
- A habit of testing data quality
- Experience with streaming data, such as Kafka, is a plus

Salary £55,000 to £65,000`,
          us: `Data Engineer
Gorsefield Energy, Phoenix, AZ (hybrid)

Gorsefield Energy supplies electricity to 1.2 million homes. We are moving our customer and smart meter data to a new cloud data platform.

The role
You will build and run the pipelines that feed our billing, forecasting and customer teams.

What we are looking for
- At least 3 years building data pipelines in Python and SQL
- Experience with dbt and Airflow
- Experience with Snowflake or BigQuery, including keeping costs down
- A habit of testing data quality
- Experience with streaming data, such as Kafka, is a plus

Salary $120,000 to $140,000`,
        },
      },
      reason: "I want to work on data that customers see in their bills, and I enjoy making slow pipelines fast and cheap to run.",
      paragraphs: [
        "Fast, tested data pipelines are what I build, and I would like to build them for Gorsefield Energy as its Data Engineer. I want to work on data that customers see in their bills, and I enjoy making slow pipelines fast and cheap to run.",
        "At Basketful I build and run 45 data pipelines in Python and SQL that load around 60 million rows a day from the website, apps and warehouse systems into Snowflake. Your advert asks for experience with dbt and Airflow. I moved 120 nightly reports from hand-written SQL scripts to dbt models scheduled in Airflow, cutting the nightly run from 5 hours to 70 minutes.",
        {
          uk: "You are also looking for experience with Snowflake or BigQuery, including keeping costs down. I cut the monthly Snowflake bill from £21,000 to £13,500 in 6 months by resizing warehouses, clustering the 5 largest tables and removing unused jobs.",
          us: "You are also looking for experience with Snowflake or BigQuery, including keeping costs down. I cut the monthly Snowflake bill from $26,000 to $17,000 in 6 months by resizing warehouses, clustering the 5 largest tables and removing unused jobs.",
        },
        "Your advert mentions a habit of testing data quality. I wrote 300 data quality tests in dbt for keys, missing values and freshness, catching 41 broken loads in 2025 before they reached any report. I also built a real-time stock feed from the warehouse system with Kafka, so the website shows out-of-stock items within 2 minutes instead of the next morning.",
        {
          uk: "My CV is attached. Thank you for your time, and I hope to hear from you.",
          us: "My resume is attached. Thank you for your time, and I hope to hear from you.",
        },
      ],
    },
  },
  {
    id: "penetration-tester",
    industry: "cyber",
    role: "Penetration Tester",
    level: "experienced",
    template: "chronicle",
    blurb: "A penetration tester at a security consultancy who runs around 35 tests a year of web applications, networks and cloud accounts for clients.",
    person: { name: "Isaac Morrow", email: "isaac.morrow@example.com", phone: { uk: "07700 900704", us: "(207) 555-0127" }, location: { uk: "Leeds", us: "Portland, ME" } },
    profile: {
      uk: "Penetration tester with 4 years at a security consultancy, after 3 years as a network engineer at a logistics company. Runs around 35 tests a year of web applications, internal networks, Active Directory and cloud accounts for clients in finance, retail and the public sector. Found and reported around 600 issues since 2022, with 92% of critical and high-risk issues fixed within 90 days in 2025. Holds the CREST Registered Penetration Tester (CRT) and Offensive Security Certified Professional (OSCP) certificates.",
      us: "Penetration tester with 4 years at a security consultancy, after 3 years as a network engineer at a logistics company. Runs around 35 tests a year of web applications, internal networks, Active Directory and cloud accounts for clients in finance, retail and government. Found and reported around 600 issues since 2022, with 92% of critical and high-risk issues fixed within 90 days in 2025. Holds the Offensive Security Certified Professional (OSCP) and GIAC Penetration Tester (GPEN) certifications.",
    },
    experience: [
      {
        title: "Penetration Tester",
        org: "Ironsight Security",
        location: { uk: "Leeds", us: "Portland, ME" },
        start: "2022-02",
        current: true,
        bullets: [
          {
            uk: "Run around 35 tests a year of web applications, internal networks, Active Directory and cloud accounts for clients in finance, retail and the public sector",
            us: "Run around 35 tests a year of web applications, internal networks, Active Directory and cloud accounts for clients in finance, retail and government",
          },
          "Agree the scope and rules of engagement with each client before testing starts, with no out-of-scope testing in 4 years",
          "Found and reported around 600 issues since 2022 using Burp Suite, Nmap and BloodHound, including 48 rated critical",
          {
            uk: "Write a report for each test, with a summary for managers and step-by-step fixes for developers, and present the findings to the client within 5 working days",
            us: "Write a report for each test, with a summary for managers and step-by-step fixes for developers, and present the findings to the client within 5 business days",
          },
          "Give remediation advice and retest fixes, with 92% of critical and high-risk issues fixed within 90 days in 2025",
          "Built a test lab in Azure that copies common client cloud designs, and wrote 6 internal guides used to train 4 new testers since 2024",
        ],
      },
      {
        title: "Network Engineer",
        org: "Crannock Logistics",
        location: { uk: "Wakefield", us: "Lewiston, ME" },
        start: "2018-07",
        end: "2022-01",
        bullets: [
          "Managed the firewalls, switches and wireless network for 14 depots and 1,100 staff, keeping network uptime above 99.9% over 3 years",
          "Ran monthly vulnerability scans in Nessus and patched 95% of high-risk findings within 30 days",
          "Rebuilt the firewall rules for all 14 depots, removing 400 unused rules and closing 12 remote access ports left open to the internet",
          "Moved 1,100 staff onto multi-factor authentication for remote access in 2020, with no remote access breaches in the 18 months after",
          "Wrote network diagrams and a change log for all 14 depots, which the IT team used to plan every change from 2020",
          "Passed the Offensive Security Certified Professional (OSCP) exam in 2021 through self-study, which led to a move into penetration testing",
        ],
      },
    ],
    projects: [
      {
        title: "Security research",
        org: "Independent",
        start: "2023-03",
        end: "2025-10",
        bullets: [
          "Reported 5 vulnerabilities in open-source web applications to their maintainers through responsible disclosure, all fixed within 60 days",
          {
            uk: "Gave 4 talks on web application testing to local security groups in Leeds, each to around 60 people",
            us: "Gave 4 talks on web application testing to local security groups in Portland, each to around 60 people",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Computer Networks", us: "Bachelor of Science in Computer Science" },
        org: { uk: "University of Bradford", us: "University of Southern Maine" },
        end: "2018",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "CREST Registered Penetration Tester (CRT)", us: "GIAC Penetration Tester (GPEN)" },
        org: { uk: "CREST", us: "Global Information Assurance Certification" },
        end: "2023",
      },
      { title: "Offensive Security Certified Professional (OSCP)", org: "OffSec", end: "2021" },
    ],
    skills: [
      "Web application testing",
      "Internal network testing",
      "Active Directory",
      "Burp Suite",
      "Scoping",
      "Rules of engagement",
      "Report writing",
      "Remediation advice",
      "Nessus",
      "Firewall rules",
    ],
    names: ["Isaac", "Morrow", "Ironsight", "Crannock", "Wrenford", "CREST", "GIAC", "OffSec", "Nmap", "Wakefield"],
    letter: {
      job: {
        title: "Penetration Tester",
        employer: "Wrenford Bank",
        advert: {
          uk: `Penetration Tester
Wrenford Bank, Leeds (hybrid)

Wrenford Bank serves 2 million customers online and through 120 branches. Our security testing team tests our apps, networks and cloud services before and after every major release.

The role
You will plan and run tests of our web applications, internal networks and cloud accounts, and work with our developers to fix what you find.

What we are looking for
- At least 3 years of penetration testing
- Experience testing web applications, Active Directory and cloud services
- Clear, well-written reports with practical fixes
- CREST CRT or OSCP
- Experience agreeing scope and rules of engagement

Salary £62,000 to £72,000`,
          us: `Penetration Tester
Wrenford Bank, Portland, ME (hybrid)

Wrenford Bank serves 2 million customers online and through 120 branches. Our security testing team tests our apps, networks and cloud services before and after every major release.

The role
You will plan and run tests of our web applications, internal networks and cloud accounts, and work with our developers to fix what you find.

What we are looking for
- At least 3 years of penetration testing
- Experience testing web applications, Active Directory and cloud services
- Clear, well-written reports with practical fixes
- OSCP or GPEN
- Experience agreeing scope and rules of engagement

Salary $120,000 to $140,000`,
        },
      },
      reason: "I want to test one organisation's systems in depth and see each fix through, rather than move on after a few days.",
      paragraphs: [
        "I would be glad to bring my experience as a penetration tester to Wrenford Bank's security testing team. I want to test one organisation's systems in depth and see each fix through, rather than move on after a few days.",
        {
          uk: "Your advert asks for experience testing web applications, Active Directory and cloud services. At Ironsight Security I run around 35 tests a year of web applications, internal networks, Active Directory and cloud accounts for clients in finance, retail and the public sector. I have found and reported around 600 issues since 2022 using Burp Suite, Nmap and BloodHound, including 48 rated critical.",
          us: "Your advert asks for experience testing web applications, Active Directory and cloud services. At Ironsight Security I run around 35 tests a year of web applications, internal networks, Active Directory and cloud accounts for clients in finance, retail and government. I have found and reported around 600 issues since 2022 using Burp Suite, Nmap and BloodHound, including 48 rated critical.",
        },
        {
          uk: "You are also looking for clear, well-written reports with practical fixes. I write a report for each test, with a summary for managers and step-by-step fixes for developers, and present the findings to the client within 5 working days. I also give remediation advice and retest fixes, with 92% of critical and high-risk issues fixed within 90 days in 2025.",
          us: "You are also looking for clear, well-written reports with practical fixes. I write a report for each test, with a summary for managers and step-by-step fixes for developers, and present the findings to the client within 5 business days. I also give remediation advice and retest fixes, with 92% of critical and high-risk issues fixed within 90 days in 2025.",
        },
        {
          uk: "Your advert mentions experience agreeing scope and rules of engagement. I agree the scope and rules of engagement with each client before testing starts, with no out-of-scope testing in 4 years. I hold the CREST Registered Penetration Tester (CRT) and Offensive Security Certified Professional (OSCP) certificates.",
          us: "Your advert mentions experience agreeing scope and rules of engagement. I agree the scope and rules of engagement with each client before testing starts, with no out-of-scope testing in 4 years. I hold the Offensive Security Certified Professional (OSCP) and GIAC Penetration Tester (GPEN) certifications.",
        },
        "Thank you for considering my application. I would be pleased to discuss the role at an interview.",
      ],
    },
  },
  {
    id: "sales-manager",
    industry: "sales",
    role: "Sales Manager",
    level: "senior",
    template: "harbour",
    blurb: "A regional sales manager who leads a team of 12 selling packaging, with regional sales up by 41% in 5 years.",
    person: { name: "Gavin Ashcroft", email: "gavin.ashcroft@example.com", phone: { uk: "07700 900705", us: "(401) 555-0128" }, location: { uk: "Birmingham", us: "Providence, RI" } },
    profile: {
      uk: "Regional sales manager with 15 years in business-to-business sales, the last 6 leading a team of 12 that sells packaging to manufacturers, food producers and online retailers. Grew the region's sales from £17 million to £24 million in 5 years and raised the team's sales against target from 78% to 104%. Hired 8 of the 12 people in the team and cut the gap between forecast and actual quarterly sales from 15% to 4%. In 2024 agreed the largest deal in the company's history, a 3-year contract worth £4.2 million a year.",
      us: "Regional sales manager with 15 years in business-to-business sales, the last 6 leading a team of 12 that sells packaging to manufacturers, food producers and online retailers. Grew the region's sales from $21 million to $30 million in 5 years and raised the team's quota attainment from 78% to 104%. Hired 8 of the 12 people in the team and cut the gap between forecast and actual quarterly sales from 15% to 4%. In 2024 agreed the largest deal in the company's history, a 3-year contract worth $5.3 million a year.",
    },
    experience: [
      {
        title: "Regional Sales Manager",
        org: "Corrapak",
        location: { uk: "Birmingham", us: "Providence, RI" },
        start: "2020-03",
        current: true,
        bullets: [
          {
            uk: "Lead a team of 9 field sales executives and 3 inside sales staff covering the Midlands and the North West, with £24 million in yearly sales in 2025",
            us: "Lead a team of 9 field sales reps and 3 inside sales reps covering New England and upstate New York, with $30 million in annual sales in 2025",
          },
          {
            uk: "Grew the region's sales from £17 million to £24 million in 5 years, mainly by winning 60 new accounts with food producers and online retailers",
            us: "Grew the region's sales from $21 million to $30 million in 5 years, mainly by winning 60 new accounts with food producers and online retailers",
          },
          {
            uk: "Raised the team's sales against target from 78% to 104% in 3 years, with 10 of the 12 staff reaching target in 2025",
            us: "Raised the team's quota attainment from 78% to 104% in 3 years, with 10 of the 12 reps reaching quota in 2025",
          },
          "Hired 8 of the 12 people in the team and coach each through 2 joint customer visits a month, with 3 promoted to key account manager since 2022",
          "Cut the gap between forecast and actual quarterly sales from 15% to 4% in 2 years by making the team update deal stages in Salesforce each Friday",
          {
            uk: "Agreed a 3-year supply contract worth £4.2 million a year with a national ready-meal maker in 2024, the largest in the company's history, after 6 months of negotiation",
            us: "Agreed a 3-year supply contract worth $5.3 million a year with a national frozen food maker in 2024, the largest in the company's history, after 6 months of negotiation",
          },
        ],
      },
      {
        title: "Area Sales Manager",
        org: "Corrapak",
        location: { uk: "Coventry", us: "Warwick, RI" },
        start: "2016-06",
        end: "2020-02",
        bullets: [
          {
            uk: "Managed 140 accounts across the West Midlands worth £4.8 million a year, with account retention of 94% a year through quarterly reviews",
            us: "Managed 140 accounts across Rhode Island and eastern Massachusetts worth $6 million a year, with account retention of 94% a year through quarterly reviews",
          },
          {
            uk: "Won 38 new business accounts in 4 years, adding £2.6 million a year in sales, and beat target in 14 of 16 quarters",
            us: "Won 38 new business accounts in 4 years, adding $3.3 million a year in sales, and beat quota in 14 of 16 quarters",
          },
          {
            uk: "Trained 6 new sales executives in the company's sales process, cutting the time to their first order from 5 months to 3",
            us: "Trained 6 new sales reps in the company's sales process, cutting the time to their first order from 5 months to 3",
          },
          "Introduced Salesforce to the area team of 5 in 2018, replacing spreadsheets and saving each person around 3 hours a week on reports",
        ],
      },
      {
        title: { uk: "Field Sales Executive", us: "Outside Sales Representative" },
        org: "Tillery Office Supplies",
        location: { uk: "Wolverhampton", us: "Cranston, RI" },
        start: "2011-08",
        end: "2016-05",
        bullets: [
          "Sold office supplies and furniture to 220 business customers, growing sales in the territory by 30% in 3 years",
          "Booked 12 customer visits a week from around 40 calls, turning 1 in 5 visits into an order",
          {
            uk: "Ranked among the top 3 of 20 sales executives for 4 years running",
            us: "Ranked among the top 3 of 20 sales reps for 4 years running",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business Management", us: "Bachelor of Science in Business Administration" },
        org: { uk: "University of Wolverhampton", us: "University of Rhode Island" },
        end: "2011",
        grade: { uk: "2:1", us: "GPA 3.2" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 5 Certificate in Management and Leadership", us: "Sales Management Certificate" },
        org: { uk: "Chartered Management Institute", us: "Sandler Training" },
        end: "2019",
      },
    ],
    skills: ["Field sales", "Inside sales", "Sales forecasting", "Salesforce", "Hiring", "Coaching", "Key accounts", "Contract negotiation", "Account retention", "New business"],
    names: ["Gavin", "Ashcroft", "Corrapak", "Tillery", "Foldline", "Sandler", "Cranston"],
    letter: {
      job: {
        title: "Sales Manager",
        employer: "Foldline Packaging",
        advert: {
          uk: `Sales Manager
Foldline Packaging, Birmingham

Foldline Packaging makes cartons and protective packaging for food, drink and health brands, with £140 million in yearly sales and 4 factories.

The role
You will lead a team of 14 field and inside sales staff across the Midlands and the North, reporting to the sales director.

What we are looking for
- Experience leading a field or inside sales team
- A record of growing regional sales
- Experience hiring and coaching sales staff
- Accurate forecasting in a CRM such as Salesforce
- Experience in packaging or manufacturing sales

Salary £75,000 to £85,000, plus bonus and car`,
          us: `Sales Manager
Foldline Packaging, Providence, RI

Foldline Packaging makes cartons and protective packaging for food, drink and health brands, with $175 million in annual sales and 4 plants.

The role
You will lead a team of 14 field and inside sales reps across New England and New York, reporting to the vice president of sales.

What we are looking for
- Experience leading a field or inside sales team
- A record of growing regional sales
- Experience hiring and coaching sales reps
- Accurate forecasting in a CRM such as Salesforce
- Experience in packaging or manufacturing sales

Salary $130,000 to $150,000, plus commission and car allowance`,
        },
      },
      reason: "I want to lead a larger sales team at a packaging maker that is still growing.",
      paragraphs: [
        {
          uk: "As a regional sales manager who has grown sales from £17 million to £24 million in 5 years, I would like to apply for the Sales Manager role at Foldline Packaging. I want to lead a larger sales team at a packaging maker that is still growing.",
          us: "As a regional sales manager who has grown sales from $21 million to $30 million in 5 years, I would like to apply for the Sales Manager role at Foldline Packaging. I want to lead a larger sales team at a packaging maker that is still growing.",
        },
        {
          uk: "At Corrapak I lead a team of 9 field sales executives and 3 inside sales staff covering the Midlands and the North West, with £24 million in yearly sales in 2025. Your advert asks for experience hiring and coaching sales staff. I hired 8 of the 12 people in the team and coach each through 2 joint customer visits a month, with 3 promoted to key account manager since 2022.",
          us: "At Corrapak I lead a team of 9 field sales reps and 3 inside sales reps covering New England and upstate New York, with $30 million in annual sales in 2025. Your advert asks for experience hiring and coaching sales reps. I hired 8 of the 12 people in the team and coach each through 2 joint customer visits a month, with 3 promoted to key account manager since 2022.",
        },
        {
          uk: "You are also looking for accurate forecasting in a CRM such as Salesforce. I cut the gap between forecast and actual quarterly sales from 15% to 4% in 2 years by making the team update deal stages in Salesforce each Friday. I also raised the team's sales against target from 78% to 104% in 3 years, with 10 of the 12 staff reaching target in 2025.",
          us: "You are also looking for accurate forecasting in a CRM such as Salesforce. I cut the gap between forecast and actual quarterly sales from 15% to 4% in 2 years by making the team update deal stages in Salesforce each Friday. I also raised the team's quota attainment from 78% to 104% in 3 years, with 10 of the 12 reps reaching quota in 2025.",
        },
        {
          uk: "In 2024 I agreed a 3-year supply contract worth £4.2 million a year with a national ready-meal maker, the largest in the company's history, after 6 months of negotiation. As area sales manager, I won 38 new business accounts in 4 years, adding £2.6 million a year in sales.",
          us: "In 2024 I agreed a 3-year supply contract worth $5.3 million a year with a national frozen food maker, the largest in the company's history, after 6 months of negotiation. As area sales manager, I won 38 new business accounts in 4 years, adding $3.3 million a year in sales.",
        },
        "I would welcome a meeting to discuss the role. Thank you for your time and consideration.",
      ],
    },
  },
  {
    id: "project-coordinator",
    industry: "projects",
    role: "Project Coordinator",
    level: "early",
    template: "modern",
    blurb: {
      uk: "A project coordinator two years into keeping office fit-out projects on schedule, with the plans, RAID logs and weekly reports.",
      us: "A project coordinator two years into keeping office build-out projects on schedule, with the plans, RAID logs and weekly reports.",
    },
    person: { name: "Molly Tranter", email: "molly.tranter@example.com", phone: { uk: "07700 900706", us: "(716) 555-0129" }, location: { uk: "Sheffield", us: "Buffalo, NY" } },
    profile: {
      uk: "Project coordinator with 2 years at an office fit-out company, coordinating 5 to 7 projects at a time for a team of 3 project managers. Builds the schedules in Microsoft Project, keeps the RAID logs and writes the weekly status reports for each client. Books 12 to 20 suppliers per project, and 10 of the 12 projects handed over in 2025 finished on schedule.",
      us: "Project coordinator with 2 years at an office build-out company, coordinating 5 to 7 projects at a time for a team of 3 project managers. Builds the schedules in Microsoft Project, keeps the RAID logs and writes the weekly status reports for each client. Books 12 to 20 suppliers per project, and 10 of the 12 projects handed over in 2025 finished on schedule.",
    },
    experience: [
      {
        title: "Project Coordinator",
        org: "Fitwell Interiors",
        location: { uk: "Sheffield", us: "Buffalo, NY" },
        start: "2024-09",
        current: true,
        bullets: [
          {
            uk: "Coordinate 5 to 7 office fit-out projects at a time for a team of 3 project managers, each worth £150,000 to £900,000",
            us: "Coordinate 5 to 7 office build-out projects at a time for a team of 3 project managers, each worth $190,000 to $950,000",
          },
          "Build and update the schedule for each project in Microsoft Project, tracking around 120 tasks per project from survey to handover",
          "Keep the risks, assumptions, issues and dependencies (RAID) log for every project and chase owners each week, closing 85% of issues within 2 weeks in 2025",
          "Write the weekly status report for each client, with progress, spend and the next 2 weeks' work, sent every Friday by noon",
          {
            uk: "Book and coordinate 12 to 20 suppliers per project, from joiners and electricians to furniture deliveries, so 94% of site visits happened on the booked day in 2025",
            us: "Book and coordinate 12 to 20 suppliers per project, from carpenters and electricians to furniture deliveries, so 94% of site visits happened on the booked day in 2025",
          },
          "Flag late tasks every Monday, and 10 of the 12 projects handed over in 2025 finished on schedule",
        ],
      },
      {
        title: "Project Administrator",
        org: "Tilbrook Homes",
        location: { uk: "Rotherham", us: "Amherst, NY" },
        start: "2023-07",
        end: "2024-08",
        bullets: [
          "Ran document control for 4 housing sites of 40 to 120 homes, filing around 300 drawings, permits and certificates a month",
          "Took minutes at 10 site meetings a month and sent actions to around 25 people within a day",
          "Prepared around 60 purchase orders a month, with no supplier payment errors in 2024",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business and Management", us: "Bachelor of Business Administration" },
        org: { uk: "University of Chester", us: "University at Buffalo" },
        end: "2023",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "PRINCE2 Foundation", us: "Certified Associate in Project Management (CAPM)" },
        org: { uk: "PeopleCert", us: "Project Management Institute" },
        end: "2025",
      },
    ],
    skills: ["Microsoft Project", "Project schedules", "RAID logs", "Status reports", "Supplier bookings", "Purchase orders", "Meeting minutes", "Document control"],
    names: ["Molly", "Tranter", "Fitwell", "Tilbrook", "Bellstone", "PeopleCert", "Rotherham"],
    letter: {
      job: {
        title: "Project Coordinator",
        employer: "Bellstone Construction",
        advert: {
          uk: `Project Coordinator
Bellstone Construction, Sheffield

Bellstone Construction builds and refurbishes schools, offices and health centres across South Yorkshire, with 25 projects on site at any time.

The role
You will keep the schedules, RAID logs and reports for a group of 6 to 8 projects, working with 2 project managers.

What we are looking for
- At least 1 year as a project coordinator or administrator
- Experience with Microsoft Project or a similar tool
- Clear weekly reporting
- Confidence coordinating suppliers and site teams
- PRINCE2 Foundation, or willingness to work towards it

Salary £28,000 to £32,000`,
          us: `Project Coordinator
Bellstone Construction, Buffalo, NY

Bellstone Construction builds and renovates schools, offices and health centers across western New York, with 25 projects on site at any time.

The role
You will keep the schedules, RAID logs and reports for a group of 6 to 8 projects, working with 2 project managers.

What we are looking for
- At least 1 year as a project coordinator or administrator
- Experience with Microsoft Project or a similar tool
- Clear weekly reporting
- Confidence coordinating suppliers and site teams
- CAPM, or willingness to work toward it

Salary $55,000 to $62,000`,
        },
      },
      reason: "I want to coordinate larger building projects and keep learning from experienced project managers.",
      paragraphs: [
        {
          uk: "Two years of keeping office fit-out projects on schedule have prepared me for the Project Coordinator role at Bellstone Construction. I want to coordinate larger building projects and keep learning from experienced project managers.",
          us: "Two years of keeping office build-out projects on schedule have prepared me for the Project Coordinator role at Bellstone Construction. I want to coordinate larger building projects and keep learning from experienced project managers.",
        },
        {
          uk: "At Fitwell Interiors I coordinate 5 to 7 office fit-out projects at a time for a team of 3 project managers, each worth £150,000 to £900,000. Your advert asks for experience with Microsoft Project or a similar tool. I build and update the schedule for each project in Microsoft Project, tracking around 120 tasks per project from survey to handover.",
          us: "At Fitwell Interiors I coordinate 5 to 7 office build-out projects at a time for a team of 3 project managers, each worth $190,000 to $950,000. Your advert asks for experience with Microsoft Project or a similar tool. I build and update the schedule for each project in Microsoft Project, tracking around 120 tasks per project from survey to handover.",
        },
        "You are also looking for clear weekly reporting. I write the weekly status report for each client, with progress, spend and the next 2 weeks' work, sent every Friday by noon. I also keep the risks, assumptions, issues and dependencies (RAID) log for every project and chase owners each week, closing 85% of issues within 2 weeks in 2025.",
        {
          uk: "Your advert mentions confidence coordinating suppliers and site teams. I book and coordinate 12 to 20 suppliers per project, from joiners and electricians to furniture deliveries, so 94% of site visits happened on the booked day in 2025. I hold the PRINCE2 Foundation certificate.",
          us: "Your advert mentions confidence coordinating suppliers and site teams. I book and coordinate 12 to 20 suppliers per project, from carpenters and electricians to furniture deliveries, so 94% of site visits happened on the booked day in 2025. I hold the Certified Associate in Project Management (CAPM) from the Project Management Institute.",
        },
        {
          uk: "My CV is attached. Thank you for considering my application, and I look forward to hearing from you.",
          us: "My resume is attached. Thank you for considering my application, and I look forward to hearing from you.",
        },
      ],
    },
  },
  {
    id: "personal-assistant",
    industry: "admin",
    role: "Personal Assistant",
    level: "experienced",
    template: "minimal",
    blurb: {
      uk: "A personal assistant to the founder and managing director of a family-owned food company, running the diary, inbox, travel and board papers.",
      us: "A personal assistant to the founder and CEO of a family-owned food company, running the calendar, inbox, travel and board materials.",
    },
    person: { name: "Yasmin Choudhury", email: "yasmin.choudhury@example.com", phone: { uk: "07700 900707", us: "(585) 555-0130" }, location: { uk: "London", us: "Rochester, NY" } },
    profile: {
      uk: "Personal assistant with 11 years in office and front desk roles, the last 5 working for the founder and managing director of a family-owned food company with 450 staff. Manages the diary, inbox and travel, and prepares the papers for 6 board meetings a year. Cut the managing director's inbox time from 3 hours a day to 1, and cut travel spend by 18% (£21,000) in 2025. Plans events for up to 400 guests and keeps confidential files, with no breaches in 5 years.",
      us: "Personal assistant with 11 years in office and front desk roles, the last 5 working for the founder and CEO of a family-owned food company with 450 employees. Manages the calendar, inbox and travel, and prepares the materials for 6 board meetings a year. Cut the CEO's inbox time from 3 hours a day to 1, and cut travel spend by 18% ($26,000) in 2025. Plans events for up to 400 guests and keeps confidential files, with no breaches in 5 years.",
    },
    experience: [
      {
        title: { uk: "Personal Assistant to the Founder and Managing Director", us: "Personal Assistant to the Founder and CEO" },
        org: "Thistlewood Foods",
        location: { uk: "London", us: "Rochester, NY" },
        start: "2021-05",
        current: true,
        bullets: [
          {
            uk: "Manage the managing director's diary, inbox and travel across 3 sites and 9 export markets, booking around 30 meetings a week",
            us: "Manage the CEO's calendar, inbox and travel across 3 sites and 9 export markets, booking around 30 meetings a week",
          },
          {
            uk: "Sort around 180 emails a day into folders for decisions, replies and reading, cutting the managing director's inbox time from 3 hours a day to 1",
            us: "Sort around 180 emails a day into folders for decisions, replies and reading, cutting the CEO's inbox time from 3 hours a day to 1",
          },
          {
            uk: "Prepare and send the papers for 6 board meetings a year, collecting reports from 7 directors and issuing each pack 5 working days ahead",
            us: "Prepare and send the materials for 6 board meetings a year, collecting reports from 7 directors and issuing each packet 5 business days ahead",
          },
          {
            uk: "Plan 25 to 30 trips a year to customers and suppliers in Europe and the Middle East, cutting travel spend by 18% (£21,000) in 2025 by booking earlier",
            us: "Plan 25 to 30 trips a year to customers and suppliers in Europe and the Middle East, cutting travel spend by 18% ($26,000) in 2025 by booking earlier",
          },
          {
            uk: "Organised the company's 50th anniversary event for 400 staff, customers and suppliers in 2024, within a £60,000 budget",
            us: "Organized the company's 50th anniversary event for 400 employees, customers and suppliers in 2024, within a $75,000 budget",
          },
          {
            uk: "Keep confidential files for the managing director, from salary reviews to the sale of a 10% share of the business in 2024, with no breaches in 5 years",
            us: "Keep confidential files for the CEO, from salary reviews to the sale of a 10% share of the business in 2024, with no breaches in 5 years",
          },
        ],
      },
      {
        title: { uk: "Team Assistant", us: "Administrative Assistant" },
        org: "Ravenhill Partners",
        location: { uk: "London", us: "Pittsford, NY" },
        start: "2018-03",
        end: "2021-04",
        bullets: [
          {
            uk: "Managed the diaries of 4 partners at a property consultancy, booking around 40 client meetings a week across 2 offices",
            us: "Managed the calendars of 4 partners at a real estate consultancy, booking around 40 client meetings a week across 2 offices",
          },
          "Arranged 15 client events a year for 40 to 150 guests, from breakfast briefings to a summer party",
          "Moved the team's filing to SharePoint, transferring 9,000 documents and cutting the time to find a file from minutes to seconds",
          "Booked travel for the 4 partners to around 60 client sites a year, keeping every trip within the firm's travel policy",
        ],
      },
      {
        title: "Receptionist",
        org: "Linnet Hotel",
        location: { uk: "London", us: "Rochester, NY" },
        start: "2015-09",
        end: "2018-02",
        bullets: [
          "Checked in around 120 guests a day at a 90-room hotel, keeping front desk review scores at 4.7 out of 5",
          "Took around 50 bookings a day by phone and email for rooms, meetings and the restaurant",
          "Answered around 80 calls a day on the main switchboard, putting each caller through within 3 rings",
          "Trained 5 new receptionists on the booking system and the front desk routine",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) History", us: "Bachelor of Arts in History" },
        org: { uk: "Royal Holloway, University of London", us: "State University of New York at Geneseo" },
        end: "2015",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 3 Diploma in Business Administration", us: "Certified Administrative Professional (CAP)" },
        org: { uk: "City & Guilds", us: "International Association of Administrative Professionals" },
        end: "2019",
      },
    ],
    skills: [
      { uk: "Diary management", us: "Calendar management" },
      "Inbox management",
      "Travel booking",
      { uk: "Board papers", us: "Board materials" },
      "Event planning",
      "Confidential files",
      "SharePoint",
      "Client events",
      "Front desk",
    ],
    names: ["Yasmin", "Choudhury", "Thistlewood", "Ravenhill", "Linnet", "Sparrowhawk", "Geneseo", "Pittsford"],
    letter: {
      job: {
        title: "Personal Assistant to the Founder",
        employer: "Sparrowhawk Design",
        advert: {
          uk: `Personal Assistant to the Founder
Sparrowhawk Design, London

Sparrowhawk Design is a furniture and lighting design company with 120 staff, showrooms in London and Milan, and customers in 30 countries.

The role
You will work for our founder, who travels most weeks. You will run her diary, inbox and travel, prepare board papers and organise our trade show stands and launch events.

What we are looking for
- At least 4 years as a personal assistant to a senior leader
- Excellent diary, inbox and travel management
- Experience preparing board papers
- Experience organising events
- Discretion with confidential work

Salary £42,000 to £48,000`,
          us: `Personal Assistant to the Founder
Sparrowhawk Design, Rochester, NY

Sparrowhawk Design is a furniture and lighting design company with 120 employees, showrooms in New York and Milan, and customers in 30 countries.

The role
You will work for our founder, who travels most weeks. You will run her calendar, inbox and travel, prepare board materials and organize our trade show booths and launch events.

What we are looking for
- At least 4 years as a personal assistant to a senior leader
- Excellent calendar, inbox and travel management
- Experience preparing board materials
- Experience organizing events
- Discretion with confidential work

Salary $65,000 to $75,000`,
        },
      },
      reason: "I enjoy planning a busy founder's week, and I want to work for a design company.",
      paragraphs: [
        "I am pleased to apply for the role of Personal Assistant to the Founder at Sparrowhawk Design. I enjoy planning a busy founder's week, and I want to work for a design company.",
        {
          uk: "At Thistlewood Foods I manage the managing director's diary, inbox and travel across 3 sites and 9 export markets, booking around 30 meetings a week. I sort around 180 emails a day into folders for decisions, replies and reading, cutting the managing director's inbox time from 3 hours a day to 1.",
          us: "At Thistlewood Foods I manage the CEO's calendar, inbox and travel across 3 sites and 9 export markets, booking around 30 meetings a week. I sort around 180 emails a day into folders for decisions, replies and reading, cutting the CEO's inbox time from 3 hours a day to 1.",
        },
        {
          uk: "Your advert asks for experience preparing board papers. I prepare and send the papers for 6 board meetings a year, collecting reports from 7 directors and issuing each pack 5 working days ahead. I also plan 25 to 30 trips a year to customers and suppliers in Europe and the Middle East, and in 2025 I cut travel spend by 18% (£21,000) by booking earlier.",
          us: "Your advert asks for experience preparing board materials. I prepare and send the materials for 6 board meetings a year, collecting reports from 7 directors and issuing each packet 5 business days ahead. I also plan 25 to 30 trips a year to customers and suppliers in Europe and the Middle East, and in 2025 I cut travel spend by 18% ($26,000) by booking earlier.",
        },
        {
          uk: "You are also looking for experience organising events. In 2024 I organised the company's 50th anniversary event for 400 staff, customers and suppliers, within a £60,000 budget. I keep confidential files for the managing director, from salary reviews to the sale of a 10% share of the business in 2024, with no breaches in 5 years.",
          us: "You are also looking for experience organizing events. In 2024 I organized the company's 50th anniversary event for 400 employees, customers and suppliers, within a $75,000 budget. I keep confidential files for the CEO, from salary reviews to the sale of a 10% share of the business in 2024, with no breaches in 5 years.",
        },
        "Thank you for your time. I would be glad to meet you to discuss the role.",
      ],
    },
  },
];
