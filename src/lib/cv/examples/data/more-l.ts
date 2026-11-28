import type { ExampleSpec } from "../types";

/** Phase 3, batch 1 (28 Nov 2026): roles the industry packs list that had no example. */
export const MORE_L: ExampleSpec[] = [
  {
    id: "business-development-rep",
    industry: "sales",
    role: { uk: "Business Development Representative", us: "Sales Development Representative" },
    level: "early",
    template: "modern",
    blurb: {
      uk: "A business development representative two years into booking meetings for a software company, after a start in customer service.",
      us: "A sales development representative two years into booking meetings for a software company, after a start in customer service.",
    },
    person: { name: "Ewan Blackwood", email: "ewan.blackwood@example.com", phone: { uk: "07700 900671", us: "(602) 555-0196" }, location: { uk: "Manchester", us: "Phoenix, AZ" } },
    profile: {
      uk: "Business development representative with 2 years at a software company that sells staff scheduling software to care homes and home care agencies. Makes around 300 cold calls and sends 250 emails a week, booking an average of 14 qualified meetings a month in 2025 against a target of 10. Created £1.9 million of sales pipeline in 2025, of which account executives closed £420,000 in new yearly contracts. Works in Salesforce and HubSpot, and wrote 6 email sequences that raised the reply rate from 3% to 7%.",
      us: "Sales development representative with 2 years at a software company that sells staff scheduling software to senior living communities and home care agencies. Makes around 300 cold calls and sends 250 emails a week, booking an average of 14 qualified meetings a month in 2025 against a quota of 10. Created $2.4 million in sales pipeline in 2025, of which account executives closed $530,000 in new annual contracts. Works in Salesforce and HubSpot, and wrote 6 email sequences that raised the reply rate from 3% to 7%.",
    },
    experience: [
      {
        title: { uk: "Business Development Representative", us: "Sales Development Representative" },
        org: "Shiftwell Software",
        location: { uk: "Manchester", us: "Phoenix, AZ" },
        start: "2024-09",
        current: true,
        bullets: [
          {
            uk: "Make around 300 cold calls and send 250 emails a week to operations managers and finance directors at care providers with 50 to 500 staff",
            us: "Make around 300 cold calls and send 250 emails a week to operations and finance leaders at senior living and home care providers with 50 to 500 employees",
          },
          {
            uk: "Booked an average of 14 qualified meetings a month in 2025 against a target of 10, ranking 2nd of 9 in the team",
            us: "Booked an average of 14 qualified meetings a month in 2025 against a quota of 10, ranking 2nd of 9 on the team",
          },
          {
            uk: "Created £1.9 million of sales pipeline in 2025, of which account executives closed £420,000 in new yearly contracts",
            us: "Created $2.4 million in sales pipeline in 2025, of which account executives closed $530,000 in new annual contracts",
          },
          "Wrote 6 email sequences in HubSpot for different job titles, raising the reply rate from 3% to 7%",
          "Research around 40 target accounts a week on LinkedIn and company websites, logging contacts and notes in Salesforce for 4 account executives",
          "Built a call guide for handling the 8 most common objections, now used by all 9 representatives",
        ],
      },
      {
        title: { uk: "Customer Service Adviser", us: "Customer Service Representative" },
        org: "Kilnworth Energy",
        location: { uk: "Salford", us: "Tempe, AZ" },
        start: "2023-07",
        end: "2024-08",
        bullets: [
          "Answered around 60 calls a day on bills, meter readings and payment plans, with a customer satisfaction score of 91%",
          {
            uk: "Sold 140 smart meter installations by phone in 2024, the most of anyone in a team of 12",
            us: "Sold 140 smart meter installations by phone in 2024, the most of anyone on a team of 12",
          },
          "Arranged around 25 payment plans a week for customers behind on their bills",
          "Won the team's monthly customer service award 3 times in 14 months",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business Management", us: "Bachelor of Science in Business" },
        org: { uk: "Liverpool John Moores University", us: "Grand Canyon University" },
        end: "2023",
        grade: { uk: "2:1", us: "GPA 3.3" },
      },
    ],
    certificates: [{ title: "HubSpot Inbound Sales Certification", org: "HubSpot Academy", end: "2024" }],
    skills: ["Cold calling", "Email sequences", "Salesforce", "HubSpot", "LinkedIn", "Account research", "Objection handling", "Sales pipeline", "Customer service"],
    names: ["Ewan", "Blackwood", "Shiftwell", "Kilnworth", "Kitesmith", "Salford", "Tempe", "Moores"],
    letter: {
      job: {
        title: { uk: "Business Development Representative", us: "Sales Development Representative" },
        employer: "Kitesmith",
        advert: {
          uk: `Business Development Representative
Kitesmith, Manchester (hybrid)

Kitesmith makes purchasing software for mid-sized manufacturers and distributors, with 700 customers across the UK and Ireland.

The role
You will join a sales team of 20, opening conversations with new prospects by phone, email and LinkedIn, and booking qualified meetings for our account executives.

What we are looking for
- At least 1 year in outbound prospecting, ideally selling software
- A record of meeting or beating a meetings target
- Experience with Salesforce or HubSpot
- Clear, persuasive writing for emails
- The resilience to make a high number of calls every day

Base salary £28,000, with on-target earnings of £38,000`,
          us: `Sales Development Representative
Kitesmith, Phoenix, AZ (hybrid)

Kitesmith makes purchasing software for mid-sized manufacturers and distributors, with 700 customers across the US and Canada.

The role
You will join a sales team of 20, opening conversations with new prospects by phone, email and LinkedIn, and booking qualified meetings for our account executives.

What we are looking for
- At least 1 year in outbound prospecting, ideally selling software
- A record of meeting or beating a meetings quota
- Experience with Salesforce or HubSpot
- Clear, persuasive writing for emails
- The drive to make a high number of calls every day

Base salary $52,000, with on-target earnings of $75,000`,
        },
      },
      reason: "I want to sell to larger companies with longer sales cycles, and in time move into an account executive role.",
      paragraphs: [
        {
          uk: "I would like to join Kitesmith as a Business Development Representative. I want to sell to larger companies with longer sales cycles, and in time move into an account executive role.",
          us: "I would like to join Kitesmith as a Sales Development Representative. I want to sell to larger companies with longer sales cycles, and in time move into an account executive role.",
        },
        {
          uk: "At Shiftwell Software I make around 300 cold calls and send 250 emails a week to operations managers and finance directors at care providers with 50 to 500 staff. I also built a call guide for handling the 8 most common objections, now used by all 9 representatives. Before that, I sold 140 smart meter installations by phone in 2024 at Kilnworth Energy, the most of anyone in a team of 12.",
          us: "At Shiftwell Software I make around 300 cold calls and send 250 emails a week to operations and finance leaders at senior living and home care providers with 50 to 500 employees. I also built a call guide for handling the 8 most common objections, now used by all 9 representatives. Before that, I sold 140 smart meter installations by phone in 2024 at Kilnworth Energy, the most of anyone on a team of 12.",
        },
        {
          uk: "Your advert asks for a record of meeting or beating a meetings target. In 2025 I booked an average of 14 qualified meetings a month against a target of 10, ranking 2nd of 9 in the team. I created £1.9 million of sales pipeline that year, of which account executives closed £420,000 in new yearly contracts.",
          us: "Your advert asks for a record of meeting or beating a meetings quota. In 2025 I booked an average of 14 qualified meetings a month against a quota of 10, ranking 2nd of 9 on the team. I created $2.4 million in sales pipeline that year, of which account executives closed $530,000 in new annual contracts.",
        },
        "You are also looking for experience with Salesforce or HubSpot. I wrote 6 email sequences in HubSpot for different job titles, raising the reply rate from 3% to 7%. Each week I research around 40 target accounts on LinkedIn and company websites, logging contacts and notes in Salesforce for 4 account executives.",
        "Thank you for your time and consideration. I would welcome the chance to discuss the role.",
      ],
    },
  },
  {
    id: "scrum-master",
    industry: "projects",
    role: "Scrum Master",
    level: "experienced",
    template: "margin-notes",
    blurb: "A scrum master who supports 3 product teams at an online travel company, with sprint goals met rising from 55% to 85%.",
    person: { name: "Helena Marwick", email: "helena.marwick@example.com", phone: { uk: "07700 900673", us: "(617) 555-0197" }, location: { uk: "Edinburgh", us: "Boston, MA" } },
    profile: {
      uk: "Scrum master with 8 years in software delivery, including 4 years supporting 3 product teams of 24 engineers, designers and testers at an online travel company. Raised the share of sprint goals met from 55% to 85% and cut median cycle time from 9 days to 4 in 18 months. Runs sprint planning, stand-up meetings, reviews and retrospectives, and coaches product owners on backlog refinement. Holds the Professional Scrum Master and Kanban Management Professional certificates.",
      us: "Scrum master with 8 years in software delivery, including 4 years supporting 3 product teams of 24 engineers, designers and testers at an online travel company. Raised the share of sprint goals met from 55% to 85% and cut median cycle time from 9 days to 4 in 18 months. Runs sprint planning, stand-up meetings, reviews and retrospectives, and coaches product owners on backlog refinement. Holds the Certified ScrumMaster (CSM) and Advanced Certified ScrumMaster (A-CSM) credentials.",
    },
    experience: [
      {
        title: "Scrum Master",
        org: "Cobaltline Travel",
        location: { uk: "Edinburgh", us: "Boston, MA" },
        start: "2022-06",
        current: true,
        bullets: [
          "Support 3 product teams of 24 engineers, designers and testers working on search, booking and the mobile app, in 2-week sprints",
          "Raised the share of sprint goals met from 55% to 85% in 18 months by limiting work in progress and helping product owners split stories smaller",
          "Cut median cycle time from 9 days to 4 by setting up Kanban boards in Jira that show where work waits",
          "Run sprint planning, stand-up meetings, reviews and retrospectives for all 3 teams, closing 90% of retrospective actions within the following sprint",
          "Coached 3 product owners on backlog refinement, so each team now starts a sprint with 2 sprints of ready stories",
          "Set up a dependency meeting every 2 weeks across the 3 teams, cutting stories blocked by another team from 14 a sprint to 4",
        ],
      },
      {
        title: "Scrum Master",
        org: "Gildmore Finance",
        location: { uk: "Glasgow", us: "Cambridge, MA" },
        start: "2020-01",
        end: "2022-05",
        bullets: [
          "Ran Scrum for a team of 8 developers and testers building the online loan application, after moving across from project coordination",
          "Agreed a definition of done with the developers and testers, cutting bugs found after release from 12 a quarter to 3",
          "Moved the team from quarterly releases to a release every 2 weeks within 9 months, working with the platform engineers on automated tests",
          "Trained 30 staff from finance, risk and operations in Scrum basics through 4 half-day workshops",
        ],
      },
      {
        title: "Project Coordinator",
        org: "Gildmore Finance",
        location: { uk: "Glasgow", us: "Cambridge, MA" },
        start: "2018-06",
        end: "2019-12",
        bullets: [
          {
            uk: "Kept the plan, risk log and issue log for a 14-month online banking upgrade with a budget of £2.1 million",
            us: "Kept the plan, risk log and issue log for a 14-month online banking upgrade with a budget of $2.7 million",
          },
          "Organised weekly progress meetings for the 6 teams on the upgrade, sending actions to 25 people within a day",
          "Reported spending against budget each month to the steering group, and the upgrade finished 3% under budget",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Business Information Systems", us: "Bachelor of Science in Information Systems" },
        org: { uk: "University of Strathclyde", us: "University of Massachusetts Boston" },
        end: "2018",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Professional Scrum Master I (PSM I)", us: "Certified ScrumMaster (CSM)" },
        org: { uk: "Scrum.org", us: "Scrum Alliance" },
        end: "2020",
      },
      {
        title: { uk: "Kanban Management Professional (KMP I)", us: "Advanced Certified ScrumMaster (A-CSM)" },
        org: { uk: "Kanban University", us: "Scrum Alliance" },
        end: "2023",
      },
    ],
    skills: ["Scrum", "Kanban", "Jira", "Sprint planning", "Retrospectives", "Backlog refinement", "Cycle time", "Definition of done", "Coaching product owners", "Workshops"],
    names: ["Helena", "Marwick", "Cobaltline", "Gildmore", "Quenby", "Strathclyde", "ScrumMaster"],
    letter: {
      job: {
        title: "Scrum Master",
        employer: "Quenby Health",
        advert: {
          uk: `Scrum Master
Quenby Health, Edinburgh (hybrid)

Quenby Health builds booking and video appointment software used by 400 GP practices and 2 million patients.

The role
You will support 2 product teams of 9 people each, run Scrum events and help the teams deliver more predictably.

What we are looking for
- Experience as a scrum master for more than one team
- A record of improving delivery predictability
- Experience with Jira and Kanban
- Coaching product owners on backlog refinement
- A Scrum certification such as PSM I or CSM

Salary £58,000 to £65,000`,
          us: `Scrum Master
Quenby Health, Boston, MA (hybrid)

Quenby Health builds booking and video appointment software used by 400 clinics and 2 million patients.

The role
You will support 2 product teams of 9 people each, run Scrum events and help the teams deliver more predictably.

What we are looking for
- Experience as a scrum master for more than one team
- A record of improving delivery predictability
- Experience with Jira and Kanban
- Coaching product owners on backlog refinement
- A Scrum certification such as CSM or PSM I

Salary $125,000 to $140,000`,
        },
      },
      reason: "I want to work on software that patients and clinicians rely on, and I enjoy finding what slows a team down.",
      paragraphs: [
        "For 4 years I have supported 3 product teams as a scrum master at an online travel company. I would now like to bring that work to Quenby Health as its Scrum Master. I want to work on software that patients and clinicians rely on, and I enjoy finding what slows a team down.",
        "At Cobaltline Travel I support 3 product teams of 24 engineers, designers and testers working on search, booking and the mobile app, in 2-week sprints. Your advert asks for a record of improving delivery predictability. I raised the share of sprint goals met from 55% to 85% in 18 months by limiting work in progress and helping product owners split stories smaller.",
        "You are also looking for experience with Jira and Kanban. I cut median cycle time from 9 days to 4 by setting up Kanban boards in Jira that show where work waits. I also set up a dependency meeting every 2 weeks across the 3 teams, cutting stories blocked by another team from 14 a sprint to 4.",
        {
          uk: "Your advert mentions coaching product owners on backlog refinement. I coached 3 product owners on backlog refinement, so each team now starts a sprint with 2 sprints of ready stories. I hold the Professional Scrum Master and Kanban Management Professional certificates.",
          us: "Your advert mentions coaching product owners on backlog refinement. I coached 3 product owners on backlog refinement, so each team now starts a sprint with 2 sprints of ready stories. I hold the Certified ScrumMaster (CSM) and Advanced Certified ScrumMaster (A-CSM) credentials.",
        },
        "Thank you for considering my application. I would welcome the chance to discuss the role with you.",
      ],
    },
  },
  {
    id: "communications-officer",
    industry: "media",
    role: { uk: "Communications Officer", us: "Communications Specialist" },
    level: "early",
    template: "minimal",
    blurb: {
      uk: "A communications officer at a wildlife charity who writes the press releases, runs the social channels and edits the members' newsletter.",
      us: "A communications specialist at a wildlife nonprofit who writes the press releases, runs the social channels and edits the members' newsletter.",
    },
    person: { name: "Aisling Byrne", email: "aisling.byrne@example.com", phone: { uk: "07700 900674", us: "(215) 555-0198" }, location: { uk: "Norwich", us: "Philadelphia, PA" } },
    profile: {
      uk: "Communications officer with 2 years at a regional wildlife charity with 18,000 members, after 18 months as a communications assistant at a housing association. Writes around 4 press releases a month, which gained 140 pieces of media coverage in 2025, up from 85 in 2024. Edits the monthly members' newsletter and runs 4 social media channels, growing followers by 38% to 41,000 in 18 months.",
      us: "Communications specialist with 2 years at a regional wildlife nonprofit with 18,000 members, after 18 months as a communications assistant at a housing nonprofit. Writes around 4 press releases a month, which gained 140 pieces of media coverage in 2025, up from 85 in 2024. Edits the monthly members' newsletter and runs 4 social media channels, growing followers by 38% to 41,000 in 18 months.",
    },
    experience: [
      {
        title: { uk: "Communications Officer", us: "Communications Specialist" },
        org: { uk: "Brackwater Wildlife Trust", us: "Brackwater Wildlife Alliance" },
        location: { uk: "Norwich", us: "Philadelphia, PA" },
        start: "2024-05",
        current: true,
        bullets: [
          "Write around 4 press releases a month on nature reserves, wildlife and campaigns, gaining 140 pieces of media coverage in 2025, up from 85 in 2024",
          {
            uk: "Pitched a story on beavers returning to the county's rivers that ran on BBC regional television and in 3 national newspapers",
            us: "Pitched a story on returning beavers that ran on 2 local TV stations and in 3 national newspapers",
          },
          "Edit the monthly email newsletter for 18,000 members in Mailchimp, raising the open rate from 31% to 44% in a year",
          {
            uk: "Run the charity's Instagram, Facebook, LinkedIn and TikTok accounts, growing followers by 38% to 41,000 in 18 months",
            us: "Run the nonprofit's Instagram, Facebook, LinkedIn and TikTok accounts, growing followers by 38% to 41,000 in 18 months",
          },
          "Took over internal communications in 2025, starting a weekly email that 80% of the 120 staff open",
          {
            uk: "Designed the charity's 24-page annual review in Canva in 2025, sent to all 18,000 members",
            us: "Designed the nonprofit's 24-page annual report in Canva in 2025, sent to all 18,000 members",
          },
        ],
      },
      {
        title: "Communications Assistant",
        org: { uk: "Ormesby Homes", us: "Ormesby Housing Partnership" },
        location: { uk: "Ipswich", us: "Camden, NJ" },
        start: "2022-11",
        end: "2024-04",
        bullets: [
          {
            uk: "Wrote and sent 3 tenant newsletters a year to 9,000 households by post and email",
            us: "Wrote and sent 3 resident newsletters a year to 9,000 households by mail and email",
          },
          {
            uk: "Posted daily on 3 social media channels and answered around 50 tenant messages a week, replying to 95% within a working day",
            us: "Posted daily on 3 social media channels and answered around 50 resident messages a week, replying to 95% within a business day",
          },
          "Wrote 30 news stories for the website in 2023 on repairs, rent changes and community events",
          "Photographed 12 community events for the website and the annual report",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) English Literature and Media", us: "Bachelor of Arts in Communication" },
        org: { uk: "University of Kent", us: "Drexel University" },
        end: "2022",
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
    skills: ["Press releases", "Media coverage", "Story pitching", "Newsletters", "Mailchimp", "Social media", "Instagram", "Internal communications", "Canva"],
    names: ["Aisling", "Byrne", "Brackwater", "Ormesby", "Wexcombe", "Instagram", "Facebook", "TikTok", "Drexel", "Norwich", "Ipswich"],
    letter: {
      job: {
        title: { uk: "Communications Officer", us: "Communications Specialist" },
        employer: { uk: "Wexcombe District Council", us: "Wexcombe County" },
        advert: {
          uk: `Communications Officer
Wexcombe District Council, Wexcombe (hybrid)

Wexcombe District Council serves 130,000 residents across 2 market towns and 40 villages.

The role
You will write press releases and news stories, run our social media channels and residents' newsletter, and keep 900 staff informed through our internal communications.

What we are looking for
- Experience writing press releases and securing media coverage
- Experience running social media channels for an organisation
- Experience writing newsletters or internal communications
- Clear, plain writing for a wide audience
- Design skills in Canva or similar

Salary £31,500 to £34,800`,
          us: `Communications Specialist
Wexcombe County, PA (hybrid)

Wexcombe County serves 130,000 residents across 2 boroughs and 40 townships.

The role
You will write press releases and news stories, run our social media channels and residents' newsletter, and keep 900 employees informed through our internal communications.

What we are looking for
- Experience writing press releases and securing media coverage
- Experience running social media channels for an organization
- Experience writing newsletters or internal communications
- Clear, plain writing for a wide audience
- Design skills in Canva or similar

Salary $58,000 to $66,000`,
        },
      },
      reason: "I want to write about the local services that residents use every day, across press, social media and staff news.",
      paragraphs: [
        {
          uk: "Please consider my application for the Communications Officer post at Wexcombe District Council. I want to write about the local services that residents use every day, across press, social media and staff news.",
          us: "Please consider my application for the Communications Specialist position at Wexcombe County. I want to write about the local services that residents use every day, across press, social media and staff news.",
        },
        {
          uk: "Your advert asks for experience writing press releases and securing media coverage. At Brackwater Wildlife Trust I write around 4 press releases a month on nature reserves, wildlife and campaigns, gaining 140 pieces of media coverage in 2025, up from 85 in 2024. A story I pitched on beavers returning to the county's rivers ran on BBC regional television and in 3 national newspapers.",
          us: "Your advert asks for experience writing press releases and securing media coverage. At Brackwater Wildlife Alliance I write around 4 press releases a month on nature reserves, wildlife and campaigns, gaining 140 pieces of media coverage in 2025, up from 85 in 2024. A story I pitched on returning beavers ran on 2 local TV stations and in 3 national newspapers.",
        },
        {
          uk: "You also ask for experience running social media channels. I run the charity's Instagram, Facebook, LinkedIn and TikTok accounts, growing followers by 38% to 41,000 in 18 months. I also designed the charity's 24-page annual review in Canva in 2025, sent to all 18,000 members.",
          us: "You also ask for experience running social media channels. I run the nonprofit's Instagram, Facebook, LinkedIn and TikTok accounts, growing followers by 38% to 41,000 in 18 months. I also designed the nonprofit's 24-page annual report in Canva in 2025, sent to all 18,000 members.",
        },
        "Your advert also asks for experience writing newsletters or internal communications. I edit the monthly email newsletter for 18,000 members in Mailchimp, raising the open rate from 31% to 44% in a year. I took over internal communications in 2025, starting a weekly email that 80% of the 120 staff open.",
        "Thank you for taking the time to read my letter. I would welcome the chance to talk about the role.",
      ],
    },
  },
  {
    id: "civil-servant",
    industry: "public-sector",
    role: { uk: "Civil Servant (Executive Officer)", us: "Program Analyst (Federal)" },
    level: "experienced",
    template: "standard",
    blurb: {
      uk: "An Executive Officer who leads a grants casework team of 6, with 96% of claims decided on time and fewer errors.",
      us: "A federal program analyst who monitors a $50 million grant program and leads its program reviews and performance reports.",
    },
    person: { name: "Ruth Abernethy", email: "ruth.abernethy@example.com", phone: { uk: "07700 900675", us: "(202) 555-0199" }, location: { uk: "Newport", us: "Washington, DC" } },
    profile: {
      uk: "Civil servant at Executive Officer grade with 7 years in central government, the last 3 leading a team of 6 on casework for a £40 million small business energy grant fund. Kept 96% of claims within the 15-working-day target in 2025 and cut the error rate found in quality checks from 6% to 2% in a year. Drafts replies to around 30 letters a month from MPs and the public, and briefings for senior civil servants. Referred 38 suspected fraudulent claims to the counter fraud team in 2025, stopping £610,000 of payments.",
      us: "Program analyst at General Schedule (GS) grade 12 with 7 years in federal service, the last 3 monitoring a $50 million a year small business energy grant program with 220 active grants. Led 14 program reviews of grantees in 2025 that found $1.2 million in questioned costs. Writes the program's quarterly performance reports for agency leadership, and built a Tableau dashboard that cut the time to prepare each report from 5 days to 2. Drafts around 30 responses a month to congressional and public inquiries.",
    },
    experience: [
      {
        title: { uk: "Executive Officer, Grants Casework", us: "Program Analyst (GS-12)" },
        org: { uk: "Government department", us: "Federal agency" },
        location: { uk: "Newport", us: "Washington, DC" },
        start: "2023-05",
        current: true,
        bullets: [
          {
            uk: "Lead a team of 6 Administrative Officers assessing claims against the rules of a £40 million small business energy grant fund, reporting to a Higher Executive Officer",
            us: "Monitor 220 active grants in a $50 million a year small business energy grant program, reporting to the branch chief",
          },
          {
            uk: "Kept 96% of around 450 claims a month within the 15-working-day target in 2025, against a service standard of 90%",
            us: "Led 14 program reviews of grantees in 2025, finding $1.2 million in questioned costs and resolving 80% of them with grantees by year end",
          },
          {
            uk: "Cleared a backlog of 1,100 claims in 4 months in 2024 by moving work between caseworkers each week, using case management reports in Excel",
            us: "Write the program's quarterly performance reports for agency leadership, tracking 8 performance measures against yearly targets",
          },
          {
            uk: "Check 10% of each caseworker's decisions every month, cutting the error rate found in quality checks from 6% to 2% in a year",
            us: "Built a Tableau dashboard from grants management system data, cutting the time to prepare each quarterly report from 5 days to 2",
          },
          {
            uk: "Referred 38 suspected fraudulent claims to the counter fraud team in 2025, stopping £610,000 of payments",
            us: "Referred 38 suspected cases of grant fraud to the Office of Inspector General in 2025, stopping $790,000 in payments",
          },
          {
            uk: "Draft replies to around 30 letters a month from MPs and the public, and wrote 12 briefings for senior civil servants in 2025 on claim numbers, fraud and spending",
            us: "Draft around 30 responses a month to congressional and public inquiries, with 98% sent within the 15-business-day deadline",
          },
        ],
      },
      {
        title: { uk: "Executive Officer, Ministerial Correspondence", us: "Management Analyst (GS-9/11)" },
        org: { uk: "Government department", us: "Federal agency" },
        location: { uk: "Cardiff", us: "Washington, DC" },
        start: "2021-03",
        end: "2023-04",
        bullets: [
          {
            uk: "Drafted around 60 replies a month to letters from MPs, peers and the public on business grants, for ministers and officials to sign",
            us: "Drafted around 60 responses a month to congressional and public letters on small business programs, for agency leaders to sign",
          },
          {
            uk: "Raised the unit's on-time rate from 78% to 95% in a year by setting up a weekly tracker of cases due",
            us: "Raised the office's on-time response rate from 78% to 95% in a year by setting up a weekly tracker of cases due",
          },
          {
            uk: "Wrote 8 standard replies on common topics with policy teams, cutting drafting time per case by about a third",
            us: "Analyzed processing times for 5 grant programs and recommended 6 changes, which cut the average time to award from 120 to 85 days",
          },
          {
            uk: "Trained 9 new correspondence officers on the department's style guide and case system",
            us: "Trained 9 new staff on the agency's correspondence style guide and case system",
          },
        ],
      },
      {
        title: { uk: "Administrative Officer, Grants Casework", us: "Program Support Specialist (GS-7)" },
        org: { uk: "Government department", us: "Federal agency" },
        location: { uk: "Newport", us: "Washington, DC" },
        start: "2019-09",
        end: "2021-02",
        bullets: [
          {
            uk: "Processed around 25 grant claims a day for a £12 million farm business grant scheme, checking each against invoices and eligibility rules",
            us: "Processed around 25 grant payment requests a day for a $15 million rural business grant program, checking invoices against approved budgets",
          },
          {
            uk: "Answered around 40 calls a day from applicants during the 2020 application window, with a quality score of 94%",
            us: "Answered around 40 calls a day from grantees during the 2020 application period, with a quality score of 94%",
          },
          {
            uk: "Spotted a pattern of duplicate invoices across 6 claims in 2020, which led to the scheme's first fraud referrals",
            us: "Spotted a pattern of duplicate invoices across 6 payment requests in 2020, which led to the program's first fraud referrals",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Politics", us: "Bachelor of Arts in Political Science" },
        org: { uk: "Swansea University", us: "American University" },
        end: "2019",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 3 Certificate in Leadership and Management", us: "Certified Grants Management Specialist (CGMS)" },
        org: { uk: "Institute of Leadership and Management", us: "National Grants Management Association" },
        end: "2024",
      },
    ],
    skills: [
      { uk: "Casework", us: "Program reviews" },
      { uk: "Grant claims", us: "Questioned costs" },
      { uk: "Quality checks", us: "Performance reports" },
      { uk: "Backlogs", us: "Performance measures" },
      { uk: "Case management", us: "Grants management" },
      { uk: "Fraud referrals", us: "Fraud referrals" },
      { uk: "Correspondence", us: "Congressional inquiries" },
      { uk: "Briefings", us: "Correspondence" },
      { uk: "Excel", us: "Tableau" },
    ],
    names: ["Ruth", "Abernethy", "Swansea"],
    letter: {
      job: {
        title: { uk: "Executive Officer, Grant Assurance", us: "Program Analyst (GS-0343-12)" },
        employer: { uk: "Department for Regional Growth", us: "Regional Growth Administration" },
        advert: {
          uk: `Executive Officer, Grant Assurance
Department for Regional Growth, Newport (hybrid)

The Grant Assurance team checks that the department's £300 million of yearly business grants are spent as agreed.

The role
You will lead a team of 4 Administrative Officers carrying out assurance checks on grant recipients, and write reports for senior civil servants.

Behaviours we will assess
- Making Effective Decisions
- Delivering at Pace
- Leadership
- Communicating and Influencing

Experience we are looking for
- Grant or benefit casework in government
- Leading a small team
- Spotting and referring possible fraud
- Clear written briefings

Salary £32,500 to £35,200`,
          us: `Program Analyst (GS-0343-12)
Regional Growth Administration, Washington, DC

The Office of Program Review checks that the administration's $400 million in yearly business grants deliver their intended results.

Duties
- Plan and lead program reviews of grant recipients
- Analyze performance data and write reports for agency leadership
- Respond to congressional and public inquiries

Specialized experience
- One year at the GS-11 level or above in grants management or program analysis
- Experience conducting program reviews or audits of grantees
- Experience presenting data to leadership in dashboards or reports

Salary $104,000 to $135,000 (GS-12)`,
        },
      },
      reason: {
        uk: "I want to move into grant assurance, checking that public money reaches the businesses it is meant for.",
        us: "I want to review grant programs across a whole agency, checking that federal money reaches the businesses it is meant for.",
      },
      paragraphs: [
        {
          uk: "I was pleased to see the Executive Officer, Grant Assurance vacancy at the Department for Regional Growth. I want to move into grant assurance, checking that public money reaches the businesses it is meant for.",
          us: "I was pleased to see the Program Analyst (GS-0343-12) vacancy at the Regional Growth Administration. I want to review grant programs across a whole agency, checking that federal money reaches the businesses it is meant for.",
        },
        {
          uk: "As an Executive Officer I lead a team of 6 Administrative Officers assessing claims against the rules of a £40 million small business energy grant fund. One of the behaviours in your advert is Delivering at Pace. In 2025 I kept 96% of around 450 claims a month within the 15-working-day target, against a service standard of 90%. In 2024 I cleared a backlog of 1,100 claims in 4 months by moving work between caseworkers each week.",
          us: "As a program analyst I monitor 220 active grants in a $50 million a year small business energy grant program, reporting to the branch chief. Your advert asks for experience conducting program reviews or audits of grantees. I led 14 program reviews of grantees in 2025, finding $1.2 million in questioned costs and resolving 80% of them with grantees by year end.",
        },
        {
          uk: "Another behaviour in your advert is Making Effective Decisions. I check 10% of each caseworker's decisions every month, cutting the error rate found in quality checks from 6% to 2% in a year. In 2025 I referred 38 suspected fraudulent claims to the counter fraud team, stopping £610,000 of payments.",
          us: "You are also looking for experience presenting data to leadership in dashboards or reports. I write the program's quarterly performance reports for agency leadership, tracking 8 performance measures against yearly targets. I built a Tableau dashboard from grants management system data, cutting the time to prepare each quarterly report from 5 days to 2.",
        },
        {
          uk: "Your advert also asks for clear written briefings. I draft replies to around 30 letters a month from MPs and the public, and wrote 12 briefings for senior civil servants in 2025 on claim numbers, fraud and spending. Before this, I raised the unit's on-time rate from 78% to 95% in a year by setting up a weekly tracker of cases due.",
          us: "In 2025 I referred 38 suspected cases of grant fraud to the Office of Inspector General, stopping $790,000 in payments. I also draft around 30 responses a month to congressional and public inquiries, with 98% sent within the 15-business-day deadline.",
        },
        "Thank you for considering my application. I would welcome the chance to discuss the role at interview.",
      ],
    },
  },
  {
    id: "career-changer",
    industry: "early-career",
    role: "Junior Data Analyst",
    level: "early",
    template: "graduate",
    blurb: {
      uk: "A maths teacher moving into data analysis, with a data analytics course, a portfolio project and 3 years as a school's data lead.",
      us: "A math teacher moving into data analysis, with a data analytics course, a portfolio project and 3 years as a school's data lead.",
    },
    person: { name: "Ben Thackeray", email: "ben.thackeray@example.com", phone: { uk: "07700 900676", us: "(612) 555-0168" }, location: { uk: "Nottingham", us: "Minneapolis, MN" } },
    profile: {
      uk: "Secondary school maths teacher moving into data analysis after 6 years in the classroom, the last 3 also as the maths department's data lead. Built the department's Excel tracker for 900 students, which cut the time to prepare reports each term from 3 days to half a day. Completed a 16-week part-time data analytics course in SQL, Python and Tableau in 2026, with a final project on 1.2 million bike-share journeys.",
      us: "High school math teacher moving into data analysis after 6 years in the classroom, the last 3 also as the math department's data lead. Built the department's Excel tracker for 750 students, which cut the time to prepare quarterly reports from 3 days to half a day. Completed a 16-week part-time data analytics course in SQL, Python and Tableau in 2026, with a final project on 1.2 million bike-share trips.",
    },
    experience: [
      {
        title: { uk: "Maths Teacher and Department Data Lead", us: "Math Teacher and Department Data Lead" },
        org: { uk: "Colwick Vale Academy", us: "Colwick Vale High School" },
        location: { uk: "Nottingham", us: "Minneapolis, MN" },
        start: "2020-09",
        current: true,
        bullets: [
          {
            uk: "Teach maths to around 170 students aged 11 to 16 in 6 classes, including 2 GCSE classes",
            us: "Teach algebra and geometry to around 150 students in grades 9 to 11 across 5 classes each year",
          },
          {
            uk: "Built the department's Excel tracker for 900 students, pulling test scores from the school's data system and cutting the time to prepare reports each term from 3 days to half a day",
            us: "Built the department's Excel tracker for 750 students, pulling test scores from the school's data system and cutting the time to prepare quarterly reports from 3 days to half a day",
          },
          {
            uk: "Analyse mock exam results question by question for around 180 Year 11 students, choosing the 5 weakest topics for revision classes each spring",
            us: "Analyze practice test results question by question for around 250 grade 10 students, choosing the 5 weakest topics for review classes each spring",
          },
          {
            uk: "Raised the GCSE maths pass rate at grade 4 or above from 68% to 77% in 2 years through targeted revision classes",
            us: "Raised the share of students meeting the state math standard from 52% to 61% in 2 years through review classes",
          },
          {
            uk: "Present a 6-page data report each term to the head of maths and 4 senior leaders",
            us: "Present a 6-page data report each quarter to the department chair and principal",
          },
          "Trained 40 teachers to read the new tracking dashboard in 2 after-school sessions",
        ],
      },
    ],
    projects: [
      {
        title: "Bike-share demand analysis",
        org: "Northfold Data School",
        start: "2026-05",
        end: "2026-06",
        bullets: [
          {
            uk: "Cleaned 1.2 million bike-share journeys from open data and joined them to weather records",
            us: "Cleaned 1.2 million bike-share trips from open data and joined them to weather records",
          },
          {
            uk: "Built a Tableau dashboard of journeys by hour, station and weather, showing rain cut use by 31%",
            us: "Built a Tableau dashboard of trips by hour, station and weather, showing rain cut use by 31%",
          },
          "Recommended moving 40 bikes from 6 quiet stations to 4 busy ones on weekday mornings",
        ],
      },
    ],
    education: [
      {
        title: "Data Analytics Certificate (part-time)",
        org: "Northfold Data School",
        start: "2026-02",
        end: "2026-06",
        bullets: [
          "Covered SQL, Python, Excel, Tableau and statistics in 160 hours of evening and weekend study",
          "Scored 94% on the final SQL assessment, the highest of 18 students in the group",
        ],
      },
      {
        title: { uk: "BSc (Hons) Mathematics", us: "Bachelor of Science in Mathematics" },
        org: { uk: "University of Hull", us: "Hamline University" },
        end: "2019",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    skills: ["SQL", "Python", "Excel", "Tableau", "Data cleaning", "Dashboards", "Statistics", "Data reporting"],
    names: ["Thackeray", "Colwick", "Northfold", "Slatehouse", "Hamline", "Minneapolis"],
    letter: {
      job: {
        title: "Junior Data Analyst",
        employer: "Slatehouse Learning",
        advert: {
          uk: `Junior Data Analyst
Slatehouse Learning, Nottingham (hybrid)

Slatehouse Learning makes maths homework software used by 1,400 schools, with 600,000 students answering questions on it each week.

The role
You will join our data team of 5, building reports and dashboards for our product and schools teams, and answering questions from the data.

What we are looking for
- Good SQL and Excel
- Some Python or R
- Experience building dashboards in Tableau or Power BI
- The ability to explain findings to people without a data background
- An understanding of schools is a plus

Salary £30,000 to £34,000`,
          us: `Junior Data Analyst
Slatehouse Learning, Minneapolis, MN (hybrid)

Slatehouse Learning makes math practice software used by 1,400 schools, with 600,000 students answering questions on it each week.

The role
You will join our data team of 5, building reports and dashboards for our product and schools teams, and answering questions from the data.

What we are looking for
- Good SQL and Excel
- Some Python or R
- Experience building dashboards in Tableau or Power BI
- The ability to explain findings to people without a data background
- An understanding of schools is a plus

Salary $62,000 to $70,000`,
        },
      },
      reason: {
        uk: "After 6 years of teaching maths, I want to work with data full time while staying close to schools.",
        us: "After 6 years of teaching math, I want to work with data full time while staying close to schools.",
      },
      paragraphs: [
        {
          uk: "After 6 years of teaching maths, I want to work with data full time while staying close to schools. That is why I would like to join Slatehouse Learning as a Junior Data Analyst.",
          us: "After 6 years of teaching math, I want to work with data full time while staying close to schools. That is why I would like to join Slatehouse Learning as a Junior Data Analyst.",
        },
        {
          uk: "Your advert asks for good SQL and Excel. I completed a 16-week part-time data analytics course in SQL, Python and Tableau in 2026, and scored 94% on the final SQL assessment, the highest of 18 students in the group. As the maths department's data lead, I built an Excel tracker for 900 students, cutting the time to prepare reports each term from 3 days to half a day.",
          us: "Your advert asks for good SQL and Excel. I completed a 16-week part-time data analytics course in SQL, Python and Tableau in 2026, and scored 94% on the final SQL assessment, the highest of 18 students in the group. As the math department's data lead, I built an Excel tracker for 750 students, cutting the time to prepare quarterly reports from 3 days to half a day.",
        },
        {
          uk: "You are also looking for experience building dashboards in Tableau or Power BI. For my course project I cleaned 1.2 million bike-share journeys from open data and joined them to weather records. I then built a Tableau dashboard of journeys by hour, station and weather, showing rain cut use by 31%. From that I recommended moving 40 bikes from 6 quiet stations to 4 busy ones on weekday mornings.",
          us: "You are also looking for experience building dashboards in Tableau or Power BI. For my course project I cleaned 1.2 million bike-share trips from open data and joined them to weather records. I then built a Tableau dashboard of trips by hour, station and weather, showing rain cut use by 31%. From that I recommended moving 40 bikes from 6 quiet stations to 4 busy ones on weekday mornings.",
        },
        {
          uk: "Your advert also asks for the ability to explain findings to people without a data background. Each term I present a 6-page data report to the head of maths and 4 senior leaders. I also trained 40 teachers to read the new tracking dashboard in 2 after-school sessions.",
          us: "Your advert also asks for the ability to explain findings to people without a data background. Each quarter I present a 6-page data report to the department chair and principal. I also trained 40 teachers to read the new tracking dashboard in 2 after-school sessions.",
        },
        "Thank you for your time and consideration. I would welcome the chance to talk about the role.",
      ],
    },
  },
  {
    id: "claims-handler",
    industry: "banking",
    role: { uk: "Claims Handler", us: "Claims Adjuster" },
    level: "early",
    template: "harbour",
    blurb: {
      uk: "A motor claims handler two years into settling accident, theft and windscreen claims for a direct insurer.",
      us: "An auto claims adjuster two years into settling collision, theft and glass claims for a direct insurer.",
    },
    person: { name: "Leah Ndlovu", email: "leah.ndlovu@example.com", phone: { uk: "07700 900677", us: "(816) 555-0169" }, location: { uk: "Peterborough", us: "Kansas City, MO" } },
    profile: {
      uk: "Motor claims handler with 2 years at a direct insurer, after 2 years taking first notice of loss calls for a home insurer. Manages around 120 open claims and settles around 35 a week, with an average settlement time of 21 days in 2025 against a team average of 28. Spotted fraud indicators on 26 claims in 2025, 19 of them confirmed, stopping £310,000 of payments. Kept a customer satisfaction score of 92% in 2025 and holds the Certificate in Insurance from the Chartered Insurance Institute (CII).",
      us: "Auto claims adjuster with 2 years at a direct insurer, after 2 years taking first notice of loss calls for a home insurer. Manages around 120 open claims and settles around 35 a week, with an average settlement time of 21 days in 2025 against a team average of 28. Spotted fraud indicators on 26 claims in 2025, 19 of them confirmed, stopping $390,000 in payments. Kept a customer satisfaction score of 92% in 2025 and holds a Texas all-lines adjuster license.",
    },
    experience: [
      {
        title: { uk: "Motor Claims Handler", us: "Auto Claims Adjuster" },
        org: "Kinsley Direct",
        location: { uk: "Peterborough", us: "Kansas City, MO" },
        start: "2024-06",
        current: true,
        bullets: [
          {
            uk: "Manage around 120 open motor claims for accident damage, theft and windscreen damage from first notice of loss to settlement, using Guidewire ClaimCenter",
            us: "Manage around 120 open auto claims for collision, theft and glass damage from first notice of loss to settlement, using Guidewire ClaimCenter",
          },
          "Settle around 35 claims a week, with an average settlement time of 21 days in 2025 against a team average of 28",
          {
            uk: "Decide liability on around 15 disputed accidents a month from photos, police reports and witness statements",
            us: "Determine liability on around 15 disputed accidents a month from photos, police reports and witness statements",
          },
          {
            uk: "Spotted fraud indicators on 26 claims in 2025 and referred them to the fraud team, with 19 confirmed and £310,000 of payments stopped",
            us: "Spotted fraud indicators on 26 claims in 2025 and referred them to the special investigations unit, with 19 confirmed and $390,000 in payments stopped",
          },
          {
            uk: "Challenged 60 repair estimates from garages in 2025 that were above guide prices, saving £48,000",
            us: "Challenged 60 body shop estimates in 2025 that were above market rates, saving $62,000",
          },
          {
            uk: "Recovered £1.1 million from other insurers on non-fault claims in 2025",
            us: "Recovered $1.4 million from other carriers on not-at-fault claims in 2025",
          },
        ],
      },
      {
        title: { uk: "Claims Adviser (First Notice of Loss)", us: "Claims Representative (First Notice of Loss)" },
        org: "Rookwood Home Insurance",
        location: { uk: "Peterborough", us: "Overland Park, KS" },
        start: "2022-07",
        end: "2024-05",
        bullets: [
          {
            uk: "Took around 45 calls a day from customers reporting home claims for escape of water, storm damage and theft",
            us: "Took around 45 calls a day from homeowners reporting water damage, storm damage and theft",
          },
          {
            uk: "Booked loss adjusters and emergency repairs for around 30 claims a week, often on the same call",
            us: "Assigned field adjusters and emergency repairs for around 30 claims a week, often on the same call",
          },
          "Kept call quality scores above 95% in 12 monthly audits",
          "Flagged 9 claims with signs of fraud in 2023, such as a policy started days before the loss",
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels in Business, Maths and Psychology", us: "Associate of Arts in Business Administration" },
        org: { uk: "Netherton Sixth Form College", us: "Brush Creek Community College" },
        end: "2022",
        grade: { uk: "B, B, C", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Certificate in Insurance", us: "Texas All-Lines Adjuster License" },
        org: { uk: "Chartered Insurance Institute", us: "Texas Department of Insurance" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "Motor claims", us: "Auto claims" },
      "First notice of loss",
      "Settlement",
      "Liability",
      "Fraud indicators",
      { uk: "Repair estimates", us: "Body shop estimates" },
      "Recoveries",
      "Customer satisfaction",
      "Guidewire ClaimCenter",
    ],
    names: ["Leah", "Ndlovu", "Kinsley", "Rookwood", "Netherton", "Oxwich", "Guidewire", "ClaimCenter", "Peterborough"],
    letter: {
      job: {
        title: { uk: "Motor Claims Handler", us: "Auto Claims Adjuster" },
        employer: "Oxwich Insurance",
        advert: {
          uk: `Motor Claims Handler
Oxwich Insurance, Peterborough (hybrid)

Oxwich Insurance covers 650,000 drivers and is bringing more of its motor claims handling in-house.

The role
You will join a team of 30 claims handlers and manage your own caseload of motor claims from first notice of loss to settlement, deciding liability and agreeing repair costs.

What we are looking for
- At least 1 year handling motor claims
- A record of settling claims quickly and fairly
- An eye for signs of fraud
- High customer satisfaction scores
- The Certificate in Insurance, or willingness to study for it

Salary £27,000 to £31,000`,
          us: `Auto Claims Adjuster
Oxwich Insurance, Kansas City, MO (hybrid)

Oxwich Insurance covers 650,000 drivers and is bringing more of its auto claims handling in-house.

The role
You will join a team of 30 adjusters and manage your own caseload of auto claims from first notice of loss to settlement, determining liability and negotiating repair costs.

What we are looking for
- At least 1 year handling auto claims
- A record of settling claims quickly and fairly
- An eye for signs of fraud
- High customer satisfaction scores
- An active adjuster license, such as a Texas all-lines license

Salary $50,000 to $58,000`,
        },
      },
      reason: {
        uk: "I want to handle a wider range of motor claims, including more disputed liability cases.",
        us: "I want to handle a wider range of auto claims, including more disputed liability cases.",
      },
      paragraphs: [
        {
          uk: "I hope to join Oxwich Insurance as a Motor Claims Handler. I want to handle a wider range of motor claims, including more disputed liability cases.",
          us: "I hope to join Oxwich Insurance as an Auto Claims Adjuster. I want to handle a wider range of auto claims, including more disputed liability cases.",
        },
        {
          uk: "At Kinsley Direct I manage around 120 open motor claims for accident damage, theft and windscreen damage from first notice of loss to settlement, using Guidewire ClaimCenter. Your advert asks for a record of settling claims quickly and fairly. I settle around 35 claims a week, with an average settlement time of 21 days in 2025 against a team average of 28.",
          us: "At Kinsley Direct I manage around 120 open auto claims for collision, theft and glass damage from first notice of loss to settlement, using Guidewire ClaimCenter. Your advert asks for a record of settling claims quickly and fairly. I settle around 35 claims a week, with an average settlement time of 21 days in 2025 against a team average of 28.",
        },
        {
          uk: "You are also looking for an eye for signs of fraud. In 2025 I spotted fraud indicators on 26 claims and referred them to the fraud team, with 19 confirmed and £310,000 of payments stopped. I also decide liability on around 15 disputed accidents a month from photos, police reports and witness statements.",
          us: "You are also looking for an eye for signs of fraud. In 2025 I spotted fraud indicators on 26 claims and referred them to the special investigations unit, with 19 confirmed and $390,000 in payments stopped. I also determine liability on around 15 disputed accidents a month from photos, police reports and witness statements.",
        },
        {
          uk: "Your advert also asks for high customer satisfaction scores. I kept a customer satisfaction score of 92% in 2025, and I challenged 60 repair estimates from garages that were above guide prices, saving £48,000. I also recovered £1.1 million from other insurers on non-fault claims in 2025. I hold the Certificate in Insurance from the Chartered Insurance Institute (CII).",
          us: "Your advert also asks for high customer satisfaction scores. I kept a customer satisfaction score of 92% in 2025, and I challenged 60 body shop estimates that were above market rates, saving $62,000. I also recovered $1.4 million from other carriers on not-at-fault claims in 2025. I hold a Texas all-lines adjuster license.",
        },
        "Thank you for reading my letter. I would welcome the chance to discuss the role.",
      ],
    },
  },
];
