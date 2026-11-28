import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** Phase 3, batch 3 (28 Nov 2026): 30 roles added to the industry packs. */
export const MORE_T: ExampleSpec[] = [
  {
    id: "housekeeper",
    industry: "hospitality",
    role: { uk: "Room Attendant", us: "Housekeeper" },
    level: "early",
    template: "standard",
    blurb: {
      uk: "A room attendant at a 120-bedroom seaside hotel who cleans 14 to 16 rooms a shift, averages 97% in room inspections and trains new starters.",
      us: "A housekeeper at a 120-room resort hotel who cleans 14 to 16 rooms a shift, averages 97% in room inspections and trains new hires.",
    },
    person: { name: "Daniela Popescu", email: "daniela.popescu@example.com", phone: { uk: "07700 900720", us: "(307) 555-0143" }, location: { uk: "Torquay", us: "Jackson, WY" } },
    profile: {
      uk: "Room attendant with 4 years in housekeeping, the last 2 at a 120-bedroom seaside hotel, cleaning and resetting 14 to 16 rooms a shift. Averaged 97% in the head housekeeper's room inspections in 2025 against a target of 92%. Keeps the linen and guest supplies stock for 3 floors and has trained 6 new starters on the hotel's 40-point room checklist. Holds a Level 2 Award in Health and Safety in the Workplace.",
      us: "Housekeeper with 4 years in housekeeping, the last 2 at a 120-room resort hotel, cleaning and resetting 14 to 16 rooms a shift. Averaged 97% in the executive housekeeper's room inspections in 2025 against a target of 92%. Keeps the linen and guest supplies stock for 3 floors and has trained 6 new hires on the 40-point room checklist. Holds the Certified Guest Room Attendant (CGRA) credential.",
    },
    experience: [
      {
        title: { uk: "Room Attendant", us: "Housekeeper" },
        org: "Valewood Hotel",
        location: { uk: "Torquay", us: "Jackson, WY" },
        start: "2024-03",
        current: true,
        bullets: [
          {
            uk: "Clean and reset 14 to 16 rooms a shift in a 120-bedroom seaside hotel",
            us: "Clean and reset 14 to 16 rooms a shift in a 120-room resort hotel",
          },
          {
            uk: "Averaged 97% in the head housekeeper's room inspections in 2025 against a target of 92%, working to the hotel's 40-point room checklist",
            us: "Averaged 97% in the executive housekeeper's room inspections in 2025 against a target of 92%, working to the hotel's 40-point room checklist",
          },
          "Earned 26 mentions by name in online guest reviews since 2024",
          "Keep the linen and guest supplies stock for 3 floors, cutting emergency linen orders from 6 to 1 a month by counting stock at the end of each shift",
          {
            uk: "Trained 6 new starters on the 40-point room checklist, each cleaning a section alone within 2 weeks",
            us: "Trained 6 new hires on the 40-point room checklist, each cleaning a section alone within 2 weeks",
          },
          {
            uk: "Report around 30 maintenance faults a month on the hotel's maintenance system, from dripping taps to broken lamps, before the guest arrives",
            us: "Report around 30 maintenance faults a month on the hotel's maintenance system, from dripping faucets to broken lamps, before the guest arrives",
          },
        ],
      },
      {
        title: { uk: "Housekeeping Assistant", us: "Housekeeping Attendant" },
        org: { uk: "Nidbrook Holiday Park", us: "Nidbrook Cabin Resort" },
        location: { uk: "Paignton", us: "Wilson, WY" },
        start: "2022-05",
        end: "2024-02",
        bullets: [
          {
            uk: "Cleaned and changed over 8 to 10 holiday lodges each Friday and Saturday, ready for new guests by 4pm",
            us: "Cleaned and turned over 8 to 10 cabins each Friday and Saturday, ready for new guests by 4pm",
          },
          {
            uk: "Washed, dried and folded linen for 60 lodges in the park's laundry during the summer season",
            us: "Washed, dried and folded linen for 60 cabins in the resort's laundry during the summer season",
          },
          {
            uk: "Logged and returned around 15 items of lost property a month, from phones to car keys",
            us: "Logged and returned around 15 lost and found items a month, from phones to car keys",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "GCSEs", us: "High School Diploma" },
        org: { uk: "Coombeside Academy", us: "Sagebrook High School" },
        location: { uk: "Torquay", us: "Jackson, WY" },
        end: "2021",
        grade: { uk: "6 at grades 9 to 4, including English and Maths", us: "" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 2 Award in Health and Safety in the Workplace", us: "Certified Guest Room Attendant (CGRA)" },
        org: { uk: "Highfield Qualifications", us: "American Hotel and Lodging Educational Institute" },
        end: "2024",
      },
    ],
    skills: [
      "Room cleaning",
      "Room inspections",
      "Room checklist",
      "Linen stock",
      "Guest supplies",
      { uk: "Training new starters", us: "Training new hires" },
      "Maintenance faults",
      "Laundry",
      { uk: "Lost property", us: "Lost and found" },
    ],
    languages: [{ name: "Romanian", level: "Native" }],
    names: ["Daniela", "Popescu", "Valewood", "Nidbrook", "Coombeside", "Sagebrook", "Marlbeck", "Torquay", "Paignton", "Highfield"],
    letter: {
      job: {
        title: { uk: "Senior Room Attendant", us: "Lead Housekeeper" },
        employer: "Marlbeck Hotel",
        advert: {
          uk: `Senior Room Attendant
Marlbeck Hotel, Torquay

Marlbeck Hotel is a 160-bedroom hotel on the Torquay seafront, open all year, with a busy wedding and conference trade.

The role
You will clean and prepare rooms to our standard, check rooms after newer team members, and train new starters in the housekeeping team.

What we are looking for
- At least 2 years as a room attendant or housekeeper
- High scores in room inspections
- Care with linen and guest supplies
- Experience training new team members
- Good guest feedback

Pay £12.95 an hour`,
          us: `Lead Housekeeper
Marlbeck Hotel, Jackson, WY

Marlbeck Hotel is a 160-room resort hotel in Jackson, open all year, with a busy wedding and ski season trade.

The role
You will clean and prepare rooms to our standard, check rooms after newer team members, and train new hires in the housekeeping team.

What we are looking for
- At least 2 years as a housekeeper or room attendant
- High scores in room inspections
- Care with linen and guest supplies
- Experience training new team members
- Good guest feedback

Pay $21.50 an hour, plus tips`,
        },
      },
      reason: {
        uk: "I want to move up to senior room attendant, checking rooms and training new starters as well as cleaning them.",
        us: "I want to move up to lead housekeeper, checking rooms and training new hires as well as cleaning them.",
      },
      paragraphs: [
        {
          uk: "Would you consider me for the Senior Room Attendant role at Marlbeck Hotel? I want to move up to senior room attendant, checking rooms and training new starters as well as cleaning them.",
          us: "Would you consider me for the Lead Housekeeper role at Marlbeck Hotel? I want to move up to lead housekeeper, checking rooms and training new hires as well as cleaning them.",
        },
        {
          uk: "At Valewood Hotel I clean and reset 14 to 16 rooms a shift in a 120-bedroom seaside hotel. Your advert asks for high scores in room inspections. I averaged 97% in the head housekeeper's room inspections in 2025 against a target of 92%, working to the hotel's 40-point room checklist.",
          us: "At Valewood Hotel I clean and reset 14 to 16 rooms a shift in a 120-room resort hotel. Your advert asks for high scores in room inspections. I averaged 97% in the executive housekeeper's room inspections in 2025 against a target of 92%, working to the hotel's 40-point room checklist.",
        },
        "You are also looking for care with linen and guest supplies. I keep the linen and guest supplies stock for 3 floors, cutting emergency linen orders from 6 to 1 a month by counting stock at the end of each shift. You also mention good guest feedback, and I have earned 26 mentions by name in online guest reviews since 2024.",
        {
          uk: "I have trained 6 new starters on the 40-point room checklist, each cleaning a section alone within 2 weeks. I also report around 30 maintenance faults a month on the hotel's maintenance system, from dripping taps to broken lamps, before the guest arrives. I hold a Level 2 Award in Health and Safety in the Workplace.",
          us: "I have trained 6 new hires on the 40-point room checklist, each cleaning a section alone within 2 weeks. I also report around 30 maintenance faults a month on the hotel's maintenance system, from dripping faucets to broken lamps, before the guest arrives. I hold the Certified Guest Room Attendant (CGRA) credential.",
        },
        {
          uk: "I have attached my CV and would be glad to talk about the role. Thank you for considering my application.",
          us: "I have attached my resume and would be glad to talk about the role. Thank you for considering my application.",
        },
      ],
    },
  },
  {
    id: "customer-service-team-leader",
    industry: "customer-service",
    role: { uk: "Customer Service Team Leader", us: "Customer Service Supervisor" },
    level: "experienced",
    template: "modern",
    blurb: {
      uk: "A customer service team leader who runs a team of 14 advisers for an online outdoor clothing retailer, with customer satisfaction up from 82% to 91%.",
      us: "A customer service supervisor who runs a team of 14 agents for an online outdoor clothing retailer, with customer satisfaction up from 82% to 91%.",
    },
    person: { name: "Jodie Hargreaves", email: "jodie.hargreaves@example.com", phone: { uk: "07700 900721", us: "(208) 555-0144" }, location: { uk: "Scarborough", us: "Meridian, ID" } },
    profile: {
      uk: "Customer service team leader with 9 years in contact centres, the last 4 leading a team of 14 advisers who handle around 9,000 calls, emails and chats a month for an online outdoor clothing retailer. Raised customer satisfaction from 82% to 91% in 18 months and cut the average email reply time from 26 hours to 5. Has met the service level of 80% of calls answered within 30 seconds in 22 of the last 24 months. Coaches each adviser every month and has promoted 4 advisers to senior adviser since 2022.",
      us: "Customer service supervisor with 9 years in contact centers, the last 4 leading a team of 14 agents who handle around 9,000 calls, emails and chats a month for an online outdoor clothing retailer. Raised customer satisfaction from 82% to 91% in 18 months and cut the average email reply time from 26 hours to 5. Has met the service level of 80% of calls answered within 30 seconds in 22 of the last 24 months. Coaches each agent every month and has promoted 4 agents to senior agent since 2022.",
    },
    experience: [
      {
        title: { uk: "Customer Service Team Leader", us: "Customer Service Supervisor" },
        org: "Fellrunner Outdoor",
        location: { uk: "Scarborough", us: "Meridian, ID" },
        start: "2022-09",
        current: true,
        bullets: [
          {
            uk: "Lead a team of 14 advisers handling around 9,000 calls, emails and chats a month for an online outdoor clothing retailer with 380,000 customers",
            us: "Lead a team of 14 agents handling around 9,000 calls, emails and chats a month for an online outdoor clothing retailer with 380,000 customers",
          },
          "Raised customer satisfaction from 82% to 91% in 18 months by calling back every customer who gave a score of 1 or 2 out of 5 and fixing the top 3 causes with the warehouse team",
          "Cut the average email reply time from 26 hours to 5 by sorting emails by topic each morning and writing 40 reply templates with the team",
          {
            uk: "Met the service level of 80% of calls answered within 30 seconds in 22 of the last 24 months by planning weekly rotas from 2 years of call data",
            us: "Met the service level of 80% of calls answered within 30 seconds in 22 of the last 24 months by planning weekly schedules from 2 years of call data",
          },
          {
            uk: "Coach each adviser every month by listening to 4 of their calls with them, and promoted 4 advisers to senior adviser since 2022",
            us: "Coach each agent every month by listening to 4 of their calls with them, and promoted 4 agents to senior agent since 2022",
          },
          {
            uk: "Handle around 60 escalated complaints a month, resolving 88% within 5 working days and cutting complaints passed to the head of service from 12 to 3 a month",
            us: "Handle around 60 escalated complaints a month, resolving 88% within 5 business days and cutting complaints passed to the director of service from 12 to 3 a month",
          },
        ],
      },
      {
        title: { uk: "Senior Customer Service Adviser", us: "Senior Customer Service Agent" },
        org: "Fellrunner Outdoor",
        location: { uk: "Scarborough", us: "Meridian, ID" },
        start: "2020-03",
        end: "2022-08",
        bullets: [
          {
            uk: "Resolved around 900 calls, emails and chats a month, and took the escalated calls for a team of 12 advisers",
            us: "Resolved around 900 calls, emails and chats a month, and took the escalated calls for a team of 12 agents",
          },
          "Kept a customer satisfaction score of 94% across 2 years, the highest on the team in 2021",
          {
            uk: "Ran 2-week training for 15 new advisers on the order and returns systems",
            us: "Ran 2-week training for 15 new agents on the order and returns systems",
          },
          "Wrote the returns and refunds guide for the team, cutting refund mistakes in quality checks by 40% in a year",
        ],
      },
      {
        title: { uk: "Customer Service Adviser", us: "Customer Service Representative" },
        org: "Saltwick Broadband",
        location: { uk: "York", us: "Boise, ID" },
        start: "2017-06",
        end: "2020-02",
        bullets: [
          {
            uk: "Answered around 70 calls a day from broadband and phone customers about bills, faults and moving home",
            us: "Answered around 70 calls a day from internet and phone customers about bills, outages and moving",
          },
          "Kept an average call time of 6 minutes against a target of 7, with a first-contact resolution rate of 81%",
          {
            uk: "Won the centre's adviser of the quarter award twice in 2019, out of 120 advisers",
            us: "Won the center's representative of the quarter award twice in 2019, out of 120 representatives",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BTEC Level 3 Extended Diploma in Business", us: "Associate of Arts in Business" },
        org: { uk: "Croftway College", us: "College of Western Idaho" },
        location: { uk: "Scarborough", us: "Nampa, ID" },
        end: "2017",
        grade: { uk: "Distinction, Distinction, Merit", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 3 Certificate in Leadership and Management", us: "Certified Customer Experience Professional (CCXP)" },
        org: { uk: "Institute of Leadership and Management", us: "Customer Experience Professionals Association" },
        end: "2023",
      },
    ],
    skills: [
      "Customer satisfaction",
      "Service levels",
      { uk: "Rota planning", us: "Schedule planning" },
      "Coaching",
      "Escalated complaints",
      "Reply templates",
      "Quality checks",
      "Returns and refunds",
      { uk: "Training new advisers", us: "Training new agents" },
      "First-contact resolution",
    ],
    names: ["Jodie", "Hargreaves", "Fellrunner", "Saltwick", "Croftway", "Wykeham", "Scarborough", "Nampa"],
    letter: {
      job: {
        title: "Customer Service Manager",
        employer: "Wykeham Home",
        advert: {
          uk: `Customer Service Manager
Wykeham Home, York

Wykeham Home sells furniture and home accessories online, with 250,000 customers and a contact centre in York open 7 days a week.

The role
You will lead 3 team leaders and 30 advisers across calls, email, chat and social media, and report to the head of operations.

What we are looking for
- At least 3 years leading a customer service team
- A record of raising customer satisfaction
- Experience planning rotas against service levels
- Strong complaint handling and coaching skills
- Experience developing advisers into senior roles

Salary £36,000 to £40,000`,
          us: `Customer Service Manager
Wykeham Home, Boise, ID

Wykeham Home sells furniture and home decor online, with 250,000 customers and a contact center in Boise open 7 days a week.

The role
You will lead 3 supervisors and 30 agents across phone, email, chat and social media, and report to the director of operations.

What we are looking for
- At least 3 years leading a customer service team
- A record of raising customer satisfaction
- Experience planning schedules against service levels
- Strong complaint handling and coaching skills
- Experience developing agents into senior roles

Salary $62,000 to $70,000`,
        },
      },
      reason: {
        uk: "I want to lead a larger contact centre, with team leaders reporting to me, and keep raising customer satisfaction.",
        us: "I want to lead a larger contact center, with supervisors reporting to me, and keep raising customer satisfaction.",
      },
      paragraphs: [
        {
          uk: "Wykeham Home is looking for a Customer Service Manager to lead 3 team leaders and 30 advisers, and I would like to be considered for the role. I want to lead a larger contact centre, with team leaders reporting to me, and keep raising customer satisfaction.",
          us: "Wykeham Home is looking for a Customer Service Manager to lead 3 supervisors and 30 agents, and I would like to be considered for the role. I want to lead a larger contact center, with supervisors reporting to me, and keep raising customer satisfaction.",
        },
        {
          uk: "At Fellrunner Outdoor I lead a team of 14 advisers handling around 9,000 calls, emails and chats a month for an online outdoor clothing retailer with 380,000 customers. Your advert asks for a record of raising customer satisfaction. I raised customer satisfaction from 82% to 91% in 18 months by calling back every customer who gave a score of 1 or 2 out of 5 and fixing the top 3 causes with the warehouse team. I also cut the average email reply time from 26 hours to 5 by sorting emails by topic each morning and writing 40 reply templates with the team.",
          us: "At Fellrunner Outdoor I lead a team of 14 agents handling around 9,000 calls, emails and chats a month for an online outdoor clothing retailer with 380,000 customers. Your advert asks for a record of raising customer satisfaction. I raised customer satisfaction from 82% to 91% in 18 months by calling back every customer who gave a score of 1 or 2 out of 5 and fixing the top 3 causes with the warehouse team. I also cut the average email reply time from 26 hours to 5 by sorting emails by topic each morning and writing 40 reply templates with the team.",
        },
        {
          uk: "You are also looking for experience planning rotas against service levels. I met the service level of 80% of calls answered within 30 seconds in 22 of the last 24 months by planning weekly rotas from 2 years of call data.",
          us: "You are also looking for experience planning schedules against service levels. I met the service level of 80% of calls answered within 30 seconds in 22 of the last 24 months by planning weekly schedules from 2 years of call data.",
        },
        {
          uk: "Your advert also asks for strong complaint handling and coaching skills. I handle around 60 escalated complaints a month, resolving 88% within 5 working days. I coach each adviser every month by listening to 4 of their calls with them, and I have promoted 4 advisers to senior adviser since 2022. I also hold a Level 3 Certificate in Leadership and Management.",
          us: "Your advert also asks for strong complaint handling and coaching skills. I handle around 60 escalated complaints a month, resolving 88% within 5 business days. I coach each agent every month by listening to 4 of their calls with them, and I have promoted 4 agents to senior agent since 2022. I am also a Certified Customer Experience Professional (CCXP).",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "data-entry-clerk",
    industry: "admin",
    role: "Data Entry Clerk",
    level: "early",
    template: "index",
    blurb: "A data entry clerk at a mail-order plant nursery who keys in around 350 orders a day at 99.8% accuracy and merged 4,200 duplicate customer records.",
    person: { name: "Harpreet Sandhu", email: "harpreet.sandhu@example.com", phone: { uk: "07700 900722", us: "(360) 555-0145" }, location: { uk: "Spalding", us: "Olympia, WA" } },
    profile: {
      uk: "Data entry clerk with 4 years in office work, the last 3 at a mail-order plant nursery, keying in around 350 paper order forms, phone orders and address changes a day. Holds an accuracy rate of 99.8% in weekly checks and types at 70 words per minute. Merged around 4,200 duplicate customer records in Salesforce over 6 months, saving around £5,000 a year in catalogue printing and postage. Holds the Microsoft Office Specialist: Excel Associate certification.",
      us: "Data entry clerk with 4 years in office work, the last 3 at a mail-order plant nursery, keying in around 350 paper order forms, phone orders and address changes a day. Holds an accuracy rate of 99.8% in weekly checks and types at 70 words per minute. Merged around 4,200 duplicate customer records in Salesforce over 6 months, saving around $6,500 a year in catalog printing and postage. Holds the Microsoft Office Specialist: Excel Associate certification.",
    },
    experience: [
      {
        title: "Data Entry Clerk",
        org: "Greenspire Plants",
        location: { uk: "Spalding", us: "Olympia, WA" },
        start: "2023-10",
        current: true,
        bullets: [
          {
            uk: "Key in around 350 paper order forms, phone orders and address changes a day for a mail-order plant catalogue with 85,000 customers",
            us: "Key in around 350 paper order forms, phone orders and address changes a day for a mail-order plant catalog with 85,000 customers",
          },
          "Hold an accuracy rate of 99.8% in the office supervisor's weekly checks of 50 random orders, across 2024 and 2025",
          {
            uk: "Merged around 4,200 duplicate customer records in Salesforce over 6 months, saving around £5,000 a year in catalogue printing and postage",
            us: "Merged around 4,200 duplicate customer records in Salesforce over 6 months, saving around $6,500 a year in catalog printing and postage",
          },
          {
            uk: "Built an Excel order sheet with data validation that flags missing postcodes and plant codes, cutting order errors by 40% in a year",
            us: "Built an Excel order sheet with data validation that flags missing zip codes and plant codes, cutting order errors by 40% in a year",
          },
          "Clear the order inbox of around 120 emails a day, typing each order into Salesforce within 24 hours",
          "Entered up to 600 orders a day in the March and April peak of 2025, with no backlog of more than 1 day",
        ],
      },
      {
        title: { uk: "Temporary Administrator", us: "Temporary Office Assistant" },
        org: "Welland Staffing",
        location: { uk: "Peterborough", us: "Lacey, WA" },
        start: "2022-07",
        end: "2023-09",
        bullets: [
          {
            uk: "Keyed in around 1,200 parking permit applications for a district council over 3 months, with no complaints about wrong details",
            us: "Keyed in around 1,200 parking permit applications for a county office over 3 months, with no complaints about wrong details",
          },
          {
            uk: "Scanned and indexed around 8,000 paper patient files for a dental practice moving to digital records",
            us: "Scanned and indexed around 8,000 paper patient files for a dental office moving to digital records",
          },
          "Covered reception and data entry at 4 local businesses, answering phones and updating customer lists in Excel",
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels", us: "High School Diploma" },
        org: { uk: "Pinchbeck Sixth Form College", us: "Cedarwater High School" },
        location: { uk: "Spalding", us: "Olympia, WA" },
        end: "2022",
        grade: { uk: "Business (B), Information Technology (B), English Literature (C)", us: "GPA 3.4" },
      },
    ],
    certificates: [{ title: "Microsoft Office Specialist: Excel Associate", org: "Microsoft", end: "2024" }],
    skills: [
      "Data entry",
      "Typing",
      "Accuracy checks",
      "Duplicate records",
      "Salesforce",
      "Excel",
      "Data validation",
      "Digital records",
      "Order forms",
    ],
    languages: [{ name: "Punjabi", level: "Fluent" }],
    names: ["Harpreet", "Sandhu", "Greenspire", "Welland", "Pinchbeck", "Cedarwater", "Tansley", "Spalding", "Tumwater", "Lacey", "Peterborough"],
    letter: {
      job: {
        title: { uk: "Data Administrator", us: "Data Entry Specialist" },
        employer: "Tansley Medical Supplies",
        advert: {
          uk: `Data Administrator
Tansley Medical Supplies, Spalding

Tansley Medical Supplies delivers dressings, gloves and care products to 1,400 care homes and pharmacies across the East of England.

The role
You will enter orders and customer records, keep our customer database clean and accurate, and work with the sales and warehouse teams on order queries.

What we are looking for
- Fast, accurate data entry
- Good working knowledge of Excel
- Experience with a CRM system such as Salesforce
- Experience removing duplicate records
- Care with detail

Salary £24,500`,
          us: `Data Entry Specialist
Tansley Medical Supplies, Tumwater, WA

Tansley Medical Supplies delivers dressings, gloves and care products to 1,400 nursing homes and pharmacies across Washington and Oregon.

The role
You will enter orders and customer records, keep our customer database clean and accurate, and work with the sales and warehouse teams on order questions.

What we are looking for
- Fast, accurate data entry
- Good working knowledge of Excel
- Experience with a CRM system such as Salesforce
- Experience removing duplicate records
- Care with detail

Pay $22 to $24 an hour`,
        },
      },
      reason: "I want to look after a whole customer database as well as key in orders, and learn how a supplier keeps its records.",
      paragraphs: [
        {
          uk: "I type at 70 words per minute with an accuracy rate of 99.8%, and I would like to bring that to Tansley Medical Supplies as its Data Administrator. I want to look after a whole customer database as well as key in orders, and learn how a supplier keeps its records.",
          us: "I type at 70 words per minute with an accuracy rate of 99.8%, and I would like to bring that to Tansley Medical Supplies as its Data Entry Specialist. I want to look after a whole customer database as well as key in orders, and learn how a supplier keeps its records.",
        },
        {
          uk: "At Greenspire Plants I key in around 350 paper order forms, phone orders and address changes a day for a mail-order plant catalogue with 85,000 customers. I hold an accuracy rate of 99.8% in the office supervisor's weekly checks of 50 random orders, across 2024 and 2025. I also clear the order inbox of around 120 emails a day, typing each order into Salesforce within 24 hours. I entered up to 600 orders a day in the March and April peak of 2025, with no backlog of more than 1 day.",
          us: "At Greenspire Plants I key in around 350 paper order forms, phone orders and address changes a day for a mail-order plant catalog with 85,000 customers. I hold an accuracy rate of 99.8% in the office supervisor's weekly checks of 50 random orders, across 2024 and 2025. I also clear the order inbox of around 120 emails a day, typing each order into Salesforce within 24 hours. I entered up to 600 orders a day in the March and April peak of 2025, with no backlog of more than 1 day.",
        },
        {
          uk: "Your advert asks for experience removing duplicate records. I merged around 4,200 duplicate customer records in Salesforce over 6 months, saving around £5,000 a year in catalogue printing and postage. You also ask for a good working knowledge of Excel. I built an Excel order sheet with data validation that flags missing postcodes and plant codes, cutting order errors by 40% in a year. I hold the Microsoft Office Specialist: Excel Associate certification.",
          us: "Your advert asks for experience removing duplicate records. I merged around 4,200 duplicate customer records in Salesforce over 6 months, saving around $6,500 a year in catalog printing and postage. You also ask for a good working knowledge of Excel. I built an Excel order sheet with data validation that flags missing zip codes and plant codes, cutting order errors by 40% in a year. I hold the Microsoft Office Specialist: Excel Associate certification.",
        },
        {
          uk: "Thank you for reading my application. My CV is attached, and I would be happy to meet to discuss the role.",
          us: "Thank you for reading my application. My resume is attached, and I would be happy to meet to discuss the role.",
        },
      ],
    },
  },
  {
    id: "accounts-payable-clerk",
    industry: "finance",
    role: { uk: "Purchase Ledger Clerk", us: "Accounts Payable Clerk" },
    level: "early",
    template: "ledger",
    blurb: {
      uk: "A purchase ledger clerk who processes 1,800 supplier invoices a month for a group of 14 veterinary practices and cut late payments from 14% to 3%.",
      us: "An accounts payable clerk who processes 1,800 vendor invoices a month for a group of 14 veterinary clinics and cut late payments from 14% to 3%.",
    },
    person: { name: "Courtney Ollerton", email: "courtney.ollerton@example.com", phone: { uk: "07700 900723", us: "(253) 555-0146" }, location: { uk: "Lichfield", us: "Kent, WA" } },
    profile: {
      uk: "Purchase ledger clerk with 4 years in finance teams, the last 2 processing around 1,800 supplier invoices a month for a group of 14 veterinary practices. Matches each invoice to its purchase order and delivery note in Xero, and prepares a weekly payment run of around £180,000. Cut late payments to suppliers from 14% to 3% of invoices in a year, and stopped 2 attempted payment frauds in 2025 by calling back to check changes to bank details. Holds the Level 3 Advanced Diploma in Accounting from the Association of Accounting Technicians (AAT).",
      us: "Accounts payable clerk with 4 years in accounting teams, the last 2 processing around 1,800 vendor invoices a month for 14 veterinary clinics. Matches each invoice to its purchase order and receiving report in NetSuite, and prepares a weekly payment run of around $230,000. Cut late payments to vendors from 14% to 3% of invoices in a year, and stopped 2 attempted payment frauds in 2025 by calling back to check changes to bank details. Holds the Certified Accounts Payable Specialist (CAPS) credential.",
    },
    experience: [
      {
        title: { uk: "Purchase Ledger Clerk", us: "Accounts Payable Clerk" },
        org: "Parkvale Veterinary Group",
        location: { uk: "Lichfield", us: "Kent, WA" },
        start: "2024-08",
        current: true,
        bullets: [
          {
            uk: "Process around 1,800 supplier invoices a month for 14 veterinary practices, matching each to its purchase order and delivery note in Xero",
            us: "Process around 1,800 vendor invoices a month for 14 veterinary clinics, matching each to its purchase order and receiving report in NetSuite",
          },
          {
            uk: "Prepare the weekly payment run of around £180,000 for the finance manager to approve, paying around 220 suppliers by bank transfer",
            us: "Prepare the weekly payment run of around $230,000 for 220 vendors, for the finance manager to approve",
          },
          {
            uk: "Reconcile around 60 supplier statements a month, clearing £24,000 of old credit notes and duplicate invoices from the ledger in 2025",
            us: "Reconcile around 60 vendor statements a month, clearing $31,000 of old credit memos and duplicate invoices from the ledger in 2025",
          },
          {
            uk: "Cut late payments to suppliers from 14% to 3% of invoices in a year by chasing practice managers for invoice approvals every Monday",
            us: "Cut late payments to vendors from 14% to 3% of invoices in a year by chasing clinic managers for invoice approvals every Monday",
          },
          {
            uk: "Check every change to supplier bank details by calling back on a known number, stopping 2 attempted payment frauds worth £38,000 in 2025",
            us: "Check every change to vendor bank details by calling back on a known number, stopping 2 attempted payment frauds worth $49,000 in 2025",
          },
          {
            uk: "Answer around 50 supplier queries a week by phone and email, most within 1 working day",
            us: "Answer around 50 vendor questions a week by phone and email, most within 1 business day",
          },
        ],
      },
      {
        title: { uk: "Accounts Assistant", us: "Accounting Clerk" },
        org: { uk: "Moxley Fixings", us: "Moxley Fasteners" },
        location: { uk: "Cannock", us: "Auburn, WA" },
        start: "2022-07",
        end: "2024-07",
        bullets: [
          {
            uk: "Entered around 600 purchase invoices a month on the purchase ledger in Sage 50, for a fixings wholesaler with 300 suppliers",
            us: "Entered around 600 vendor invoices a month into accounts payable in QuickBooks Online, for a fastener distributor with 300 vendors",
          },
          {
            uk: "Checked and coded around 120 staff expense claims a month against the expenses policy",
            us: "Checked and coded around 120 employee expense reports a month against the expense policy",
          },
          "Scanned around 7,000 past invoices onto a shared drive before the 2023 audit, so the auditors could find any invoice in minutes",
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels", us: "Associate of Applied Science in Accounting" },
        org: { uk: "Walton Brook Sixth Form College", us: "Green River College" },
        location: { uk: "Lichfield", us: "Auburn, WA" },
        end: "2022",
        grade: { uk: "Business (B), Maths (C), Geography (C)", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 3 Advanced Diploma in Accounting", us: "Certified Accounts Payable Specialist (CAPS)" },
        org: { uk: "Association of Accounting Technicians", us: "Institute of Finance and Management" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "Purchase ledger", us: "Accounts payable" },
      "Invoice matching",
      "Purchase orders",
      "Payment runs",
      { uk: "Supplier statements", us: "Vendor statements" },
      { uk: "Xero", us: "NetSuite" },
      { uk: "Sage 50", us: "QuickBooks Online" },
      "Payment fraud",
      { uk: "Expense claims", us: "Expense reports" },
      { uk: "Credit notes", us: "Credit memos" },
    ],
    names: ["Courtney", "Ollerton", "Parkvale", "Moxley", "Walton", "Haverbrook", "Cannock", "Lichfield", "Staffordshire", "Auburn"],
    letter: {
      job: {
        title: { uk: "Senior Purchase Ledger Clerk", us: "Senior Accounts Payable Clerk" },
        employer: "Haverbrook Foods",
        advert: {
          uk: `Senior Purchase Ledger Clerk
Haverbrook Foods, Lichfield

Haverbrook Foods makes ice cream and frozen desserts for UK supermarkets from 2 sites in Staffordshire, with around 650 suppliers.

The role
You will run the purchase ledger day to day, prepare the weekly payment run and train 2 purchase ledger clerks.

What we are looking for
- At least 2 years of purchase ledger experience
- Experience matching invoices to purchase orders
- Supplier statement reconciliations
- Care with payment controls and supplier bank details
- Xero or Sage experience
- AAT study, or willingness to start it

Salary £28,000 to £31,000`,
          us: `Senior Accounts Payable Clerk
Haverbrook Foods, Kent, WA

Haverbrook Foods makes ice cream and frozen desserts for grocery chains from 2 plants in Washington, with around 650 vendors.

The role
You will run accounts payable day to day, prepare the weekly payment run and train 2 accounts payable clerks.

What we are looking for
- At least 2 years of accounts payable experience
- Experience matching invoices to purchase orders
- Vendor statement reconciliations
- Care with payment controls and vendor bank details
- NetSuite or QuickBooks experience
- CAPS certification, or willingness to pursue it

Pay $25 to $28 an hour`,
        },
      },
      reason: {
        uk: "I want to run a purchase ledger day to day and start training other clerks.",
        us: "I want to run accounts payable day to day and start training other clerks.",
      },
      paragraphs: [
        {
          uk: "Your advert for a Senior Purchase Ledger Clerk at Haverbrook Foods asks for the work I do every day at Parkvale Veterinary Group. I want to run a purchase ledger day to day and start training other clerks.",
          us: "Your advert for a Senior Accounts Payable Clerk at Haverbrook Foods asks for the work I do every day at Parkvale Veterinary Group. I want to run accounts payable day to day and start training other clerks.",
        },
        {
          uk: "At Parkvale Veterinary Group I process around 1,800 supplier invoices a month for 14 veterinary practices, matching each to its purchase order and delivery note in Xero. I prepare the weekly payment run of around £180,000 for the finance manager to approve, paying around 220 suppliers by bank transfer. I also reconcile around 60 supplier statements a month, clearing £24,000 of old credit notes and duplicate invoices from the ledger in 2025.",
          us: "At Parkvale Veterinary Group I process around 1,800 vendor invoices a month for 14 veterinary clinics, matching each to its purchase order and receiving report in NetSuite. I prepare the weekly payment run of around $230,000 for 220 vendors, for the finance manager to approve. I also reconcile around 60 vendor statements a month, clearing $31,000 of old credit memos and duplicate invoices from the ledger in 2025.",
        },
        {
          uk: "You are also looking for care with payment controls and supplier bank details. I check every change to supplier bank details by calling back on a known number, stopping 2 attempted payment frauds worth £38,000 in 2025. I also cut late payments to suppliers from 14% to 3% of invoices in a year by chasing practice managers for invoice approvals every Monday. I answer around 50 supplier queries a week by phone and email, most within 1 working day.",
          us: "You are also looking for care with payment controls and vendor bank details. I check every change to vendor bank details by calling back on a known number, stopping 2 attempted payment frauds worth $49,000 in 2025. I also cut late payments to vendors from 14% to 3% of invoices in a year by chasing clinic managers for invoice approvals every Monday. I answer around 50 vendor questions a week by phone and email, most within 1 business day.",
        },
        {
          uk: "I hold the Level 3 Advanced Diploma in Accounting from the Association of Accounting Technicians (AAT).",
          us: "I hold the Certified Accounts Payable Specialist (CAPS) credential.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "finance-manager",
    industry: "finance",
    role: "Finance Manager",
    level: "senior",
    template: "executive",
    blurb: {
      uk: "A finance manager who leads a team of 7 at a £48 million manufacturer, with the month-end close cut from 12 working days to 5.",
      us: "A finance manager who leads a team of 7 at a $61 million manufacturer, with the month-end close cut from 12 business days to 5.",
    },
    person: { name: "Neil Etherington", email: "neil.etherington@example.com", phone: { uk: "07700 900724", us: "(971) 555-0147" }, location: { uk: "Kettering", us: "Hillsboro, OR" } },
    profile: {
      uk: "Finance manager with 13 years in accountancy, the last 5 leading a finance team of 7 at a manufacturer with £48 million in sales and 310 staff. Cut the month-end close from 12 working days to 5 and built a rolling 12-month forecast with 9 department heads. Freed £2.3 million of working capital in 2024 by cutting debtor days from 61 to 45 and stock by 18%. Member of the Association of Chartered Certified Accountants (ACCA) since 2016.",
      us: "Finance manager with 13 years in accounting, the last 5 leading a finance team of 7 at a manufacturer with $61 million in sales and 310 employees. Cut the month-end close from 12 business days to 5 and built a rolling 12-month forecast with 9 department heads. Freed $2.9 million of working capital in 2024 by cutting days sales outstanding from 61 to 45 and inventory by 18%. Certified Public Accountant (CPA) licensed in Oregon since 2016.",
    },
    experience: [
      {
        title: "Finance Manager",
        org: "Stonegrove Surfaces",
        location: { uk: "Kettering", us: "Hillsboro, OR" },
        start: "2021-05",
        current: true,
        bullets: [
          {
            uk: "Lead a finance team of 7 for a maker of stone and quartz kitchen worktops with £48 million in sales in 2025, 2 factories and 310 staff, reporting to the finance director",
            us: "Lead a finance team of 7 for a maker of stone and quartz kitchen counters with $61 million in sales in 2025, 2 plants and 310 employees, reporting to the chief financial officer",
          },
          {
            uk: "Cut the month-end close from 12 working days to 5 in 18 months by moving accruals and bank reconciliations into Sage Intacct and giving each team member a close calendar",
            us: "Cut the month-end close from 12 business days to 5 in 18 months by moving accruals and bank reconciliations into Sage Intacct and giving each team member a close calendar",
          },
          "Build the annual budget and a rolling 12-month forecast with 9 department heads, with full-year profit within 3% of forecast in each of the last 3 years",
          {
            uk: "Freed £2.3 million of working capital in 2024 by cutting debtor days from 61 to 45 and reducing stock by 18% with the operations director",
            us: "Freed $2.9 million of working capital in 2024 by cutting days sales outstanding from 61 to 45 and reducing inventory by 18% with the vice president of operations",
          },
          "Led the year-end audit for 4 years, with no audit adjustments in 2024 or 2025 and the audit finishing 6 weeks earlier than in 2021",
          {
            uk: "Manage a £6 million revolving credit facility and a 13-week cash forecast, staying within every bank covenant each quarter since 2021",
            us: "Manage an $8 million revolving line of credit and a 13-week cash forecast, staying within every bank covenant each quarter since 2021",
          },
        ],
      },
      {
        title: { uk: "Management Accountant", us: "Senior Accountant" },
        org: "Islebrook Precision",
        location: { uk: "Northampton", us: "Beaverton, OR" },
        start: "2016-09",
        end: "2021-04",
        bullets: [
          {
            uk: "Produced monthly management accounts for a precision engineering group of 3 companies with £30 million in sales in 2020, ready by working day 7",
            us: "Prepared monthly financial statements for a precision engineering group of 3 companies with $38 million in sales in 2020, ready by business day 7",
          },
          {
            uk: "Built a product costing model in Excel for 1,400 parts, which showed 60 parts selling below cost and led to price rises worth £400,000 a year",
            us: "Built a product costing model in Excel for 1,400 parts, which showed 60 parts selling below cost and led to price increases worth $520,000 a year",
          },
          {
            uk: "Prepared quarterly Value Added Tax (VAT) returns for the 3 companies, with no errors found in a 2019 inspection by His Majesty's Revenue and Customs",
            us: "Prepared quarterly sales and use tax returns for the 3 companies across 5 states, with no errors found in a 2019 state tax audit",
          },
          "Trained 40 budget holders to read their monthly cost reports, cutting finance queries after each month-end by around half",
        ],
      },
      {
        title: "Audit Senior",
        org: "Ranby Hale LLP",
        location: { uk: "Leicester", us: "Portland, OR" },
        start: "2013-09",
        end: "2016-08",
        bullets: [
          {
            uk: "Led audits of around 15 manufacturing and wholesale clients a year in the East Midlands, with sales of £5 million to £40 million",
            us: "Led audits of around 15 manufacturing and wholesale clients a year in the Portland area, with sales of $6 million to $50 million",
          },
          "Supervised teams of 2 to 4 junior auditors on site and reviewed their working papers before partner review",
          {
            uk: "Passed all remaining ACCA exams at the first attempt by 2016, after exemptions from the degree, while working full time",
            us: "Passed all 4 sections of the CPA exam at the first attempt by 2016, while working full time",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Accounting and Finance", us: "Bachelor of Science in Accounting" },
        org: { uk: "De Montfort University", us: "Portland State University" },
        end: "2013",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Member of the Association of Chartered Certified Accountants (ACCA)", us: "Certified Public Accountant (CPA)" },
        org: { uk: "Association of Chartered Certified Accountants", us: "Oregon Board of Accountancy" },
        end: "2016",
      },
    ],
    skills: [
      "Month-end close",
      "Budgets and forecasts",
      "Cash forecasts",
      "Working capital",
      "Year-end audit",
      { uk: "Management accounts", us: "Financial statements" },
      "Product costing",
      "Sage Intacct",
      "Bank covenants",
      { uk: "VAT returns", us: "Sales and use tax" },
    ],
    names: ["Neil", "Etherington", "Stonegrove", "Islebrook", "Ranby", "Ambervale", "Intacct", "Kettering", "Hillsboro", "Beaverton", "De", "Montfort"],
    letter: {
      job: {
        title: { uk: "Financial Controller", us: "Controller" },
        employer: "Ambervale Bakeries",
        advert: {
          uk: `Financial Controller
Ambervale Bakeries, Northampton

Ambervale Bakeries makes bread, rolls and cakes for supermarkets and coffee shops, with £75 million in sales, 3 bakeries and 520 staff. We open a fourth bakery in 2027.

The role
You will lead a finance team of 9, run the month-end close, budget and forecasts, and manage cash and banking as we grow.

What we are looking for
- A qualified accountant (ACA, ACCA or CIMA)
- Experience leading a finance team in manufacturing
- A record of speeding up month-end reporting
- Strong budgeting, forecasting and cash management
- Experience running a year-end audit

Salary £78,000 to £85,000, plus bonus`,
          us: `Controller
Ambervale Bakeries, Portland, OR

Ambervale Bakeries makes bread, rolls and cakes for grocery chains and coffee shops, with $95 million in sales, 3 bakeries and 520 employees. We open a fourth bakery in 2027.

The role
You will lead an accounting team of 9, run the month-end close, budget and forecasts, and manage cash and banking as we grow.

What we are looking for
- A Certified Public Accountant (CPA)
- Experience leading a finance team in manufacturing
- A record of speeding up month-end reporting
- Strong budgeting, forecasting and cash management
- Experience running a year-end audit

Salary $150,000 to $165,000, plus bonus`,
        },
      },
      reason: "I want to lead a larger finance team at a manufacturer that is opening new sites.",
      paragraphs: [
        {
          uk: "As Ambervale Bakeries opens a fourth bakery in 2027, I would like to apply for the role of Financial Controller. I want to lead a larger finance team at a manufacturer that is opening new sites.",
          us: "As Ambervale Bakeries opens a fourth bakery in 2027, I would like to apply for the role of Controller. I want to lead a larger finance team at a manufacturer that is opening new sites.",
        },
        {
          uk: "At Stonegrove Surfaces I lead a finance team of 7 for a maker of stone and quartz kitchen worktops with £48 million in sales in 2025, 2 factories and 310 staff, reporting to the finance director. Your advert asks for a record of speeding up month-end reporting. I cut the month-end close from 12 working days to 5 in 18 months by moving accruals and bank reconciliations into Sage Intacct and giving each team member a close calendar.",
          us: "At Stonegrove Surfaces I lead a finance team of 7 for a maker of stone and quartz kitchen counters with $61 million in sales in 2025, 2 plants and 310 employees, reporting to the chief financial officer. Your advert asks for a record of speeding up month-end reporting. I cut the month-end close from 12 business days to 5 in 18 months by moving accruals and bank reconciliations into Sage Intacct and giving each team member a close calendar.",
        },
        {
          uk: "You are also looking for strong budgeting, forecasting and cash management. I build the annual budget and a rolling 12-month forecast with 9 department heads, with full-year profit within 3% of forecast in each of the last 3 years. I freed £2.3 million of working capital in 2024 by cutting debtor days from 61 to 45 and reducing stock by 18% with the operations director. I also manage a £6 million revolving credit facility and a 13-week cash forecast.",
          us: "You are also looking for strong budgeting, forecasting and cash management. I build the annual budget and a rolling 12-month forecast with 9 department heads, with full-year profit within 3% of forecast in each of the last 3 years. I freed $2.9 million of working capital in 2024 by cutting days sales outstanding from 61 to 45 and reducing inventory by 18% with the vice president of operations. I also manage an $8 million revolving line of credit and a 13-week cash forecast.",
        },
        {
          uk: "I have led the year-end audit for 4 years, with no audit adjustments in 2024 or 2025. I have been a member of the Association of Chartered Certified Accountants (ACCA) since 2016.",
          us: "I have led the year-end audit for 4 years, with no audit adjustments in 2024 or 2025. I have been a Certified Public Accountant (CPA) licensed in Oregon since 2016.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "branch-manager",
    industry: "banking",
    role: "Branch Manager",
    level: "senior",
    template: "margin-notes",
    blurb: {
      uk: "A branch manager who runs a building society's largest branch, with mortgage lending up 26% in 2 years and 41 scam payments stopped in 2025.",
      us: "A branch manager who runs a credit union's largest branch, with loan volume up 26% in 2 years and 41 scam payments stopped in 2025.",
    },
    person: { name: "Wendy Ellacott", email: "wendy.ellacott@example.com", phone: { uk: "07700 900725", us: "(530) 555-0148" }, location: { uk: "Hereford", us: "Chico, CA" } },
    profile: {
      uk: "Branch manager with 15 years in retail banking, the last 6 running the largest of 22 branches at a building society, with a team of 12 and around 11,000 members. Grew mortgage lending from the branch by 26% in 2 years to £41 million in 2025, and raised savings balances by £19 million in 2025. Stopped 41 scam payments worth £286,000 in 2025 by training the team in fraud prevention. Holds the Certificate in Mortgage Advice and Practice (CeMAP).",
      us: "Branch manager with 15 years in retail banking, the last 6 running the largest of 22 branches at a credit union, with a team of 12 and around 11,000 members. Grew loan volume from the branch by 26% in 2 years to $52 million in 2025, and grew deposits by $24 million in 2025. Stopped 41 scam payments worth $362,000 in 2025 by training the team in fraud prevention. Registered mortgage loan originator with the Nationwide Multistate Licensing System and Registry (NMLS).",
    },
    experience: [
      {
        title: "Branch Manager",
        org: { uk: "Harrowden Building Society", us: "Harrowden Credit Union" },
        location: { uk: "Hereford", us: "Chico, CA" },
        start: "2020-06",
        current: true,
        bullets: [
          {
            uk: "Run the largest of 22 branches, with a team of 12, around 11,000 members and £168 million in savings and mortgage balances",
            us: "Run the largest of 22 branches, with a team of 12, around 11,000 members and $212 million in deposit and loan balances",
          },
          {
            uk: "Grew mortgage lending from the branch by 26% in 2 years to £41 million in 2025, by offering a mortgage review at every savings appointment",
            us: "Grew loan volume from the branch by 26% in 2 years to $52 million in 2025, by offering a loan review at every account opening",
          },
          {
            uk: "Raised savings balances by £19 million in 2025 by calling 1,800 members whose fixed-rate bonds were due to mature",
            us: "Grew deposits by $24 million in 2025 by calling 1,800 members whose certificates of deposit were due to mature",
          },
          {
            uk: "Stopped 41 scam payments worth £286,000 in 2025 by training the team in fraud prevention and calling the police under the Banking Protocol",
            us: "Stopped 41 scam payments worth $362,000 in 2025 by training the team in fraud prevention and reporting suspected elder financial abuse to Adult Protective Services",
          },
          {
            uk: "Cut complaints from 34 to 15 a year and resolved 92% within 3 working days, by letting 4 team members refund fees up to £50",
            us: "Cut complaints from 34 to 15 a year and resolved 92% within 3 business days, by letting 4 team members refund fees up to $75",
          },
          "Raised the branch's member satisfaction score from 84% to 95% in 3 years, the highest of the 22 branches in 2025",
        ],
      },
      {
        title: "Assistant Branch Manager",
        org: "Wyeford Bank",
        location: { uk: "Worcester", us: "Redding, CA" },
        start: "2015-03",
        end: "2020-05",
        bullets: [
          {
            uk: "Managed the counter and cash team of 6, balancing the branch's cash to the penny on all but 3 days in 5 years",
            us: "Managed the teller and cash team of 6, balancing the branch's cash to the cent on all but 3 days in 5 years",
          },
          {
            uk: "Coached 3 cashiers into mortgage adviser roles, each passing CeMAP within a year",
            us: "Coached 3 tellers into loan officer roles, each registering with the NMLS within a year",
          },
          "Led the branch through 6 compliance reviews in 5 years with no high-risk findings",
          "Ran the branch for 5 months in 2019 while the branch manager was on leave, meeting every lending and savings target",
        ],
      },
      {
        title: { uk: "Mortgage Adviser", us: "Mortgage Loan Officer" },
        org: "Wyeford Bank",
        location: { uk: "Worcester", us: "Redding, CA" },
        start: "2011-04",
        end: "2015-02",
        bullets: [
          {
            uk: "Advised around 20 customers a month on mortgages and remortgages, completing around £24 million of lending a year over 4 years",
            us: "Advised around 20 borrowers a month on purchase and refinance loans, closing around $30 million of loans a year over 4 years",
          },
          "Scored 98% in mortgage file checks by the compliance team over 4 years",
          {
            uk: "Built referrals from 6 local estate agents, bringing in around 8 new mortgage customers a month",
            us: "Built referrals from 6 local real estate agents, bringing in around 8 new mortgage customers a month",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business Management", us: "Bachelor of Science in Business Administration" },
        org: { uk: "University of Worcester", us: "California State University, Chico" },
        end: "2010",
        grade: { uk: "2:1", us: "GPA 3.3" },
      },
    ],
    certificates: [
      {
        title: { uk: "Certificate in Mortgage Advice and Practice (CeMAP)", us: "Registered Mortgage Loan Originator" },
        org: { uk: "London Institute of Banking & Finance", us: "Nationwide Multistate Licensing System and Registry" },
        end: "2011",
      },
      {
        title: { uk: "International Certificate in Anti Money Laundering", us: "Certified Anti-Money Laundering Specialist (CAMS)" },
        org: { uk: "International Compliance Association", us: "Association of Certified Anti-Money Laundering Specialists" },
        end: "2021",
      },
    ],
    skills: [
      { uk: "Mortgage lending", us: "Loan reviews" },
      { uk: "Savings", us: "Deposits" },
      "Fraud prevention",
      { uk: "Banking Protocol", us: "Elder financial abuse" },
      "Complaints",
      "Member satisfaction",
      "Coaching",
      "Compliance reviews",
      "Cash management",
      { uk: "Estate agent referrals", us: "Real estate agent referrals" },
    ],
    names: ["Wendy", "Ellacott", "Harrowden", "Wyeford", "Clunbridge", "Hereford", "Chico", "CeMAP", "Multistate"],
    letter: {
      job: {
        title: "Branch Manager",
        employer: { uk: "Clunbridge Building Society", us: "Clunbridge Credit Union" },
        advert: {
          uk: `Branch Manager
Clunbridge Building Society, Worcester

Clunbridge Building Society is a mutual with 30 branches across the West Midlands and Wales. Our Worcester branch has a team of 15 and around 14,000 members.

The role
You will lead the branch team, grow mortgage and savings business, and keep members safe from fraud and scams.

What we are looking for
- Experience managing a bank or building society branch
- A record of growing mortgage lending and savings
- Strong fraud prevention and complaint handling
- Experience coaching a team, including mortgage advisers
- CeMAP or an equivalent mortgage qualification

Salary £48,000 to £54,000, plus bonus`,
          us: `Branch Manager
Clunbridge Credit Union, Sacramento, CA

Clunbridge Credit Union is a member-owned credit union with 30 branches across Northern California. Our Sacramento branch has a team of 15 and around 14,000 members.

The role
You will lead the branch team, grow lending and deposits, and keep members safe from fraud and scams.

What we are looking for
- Experience managing a bank or credit union branch
- A record of growing loans and deposits
- Strong fraud prevention and complaint handling
- Experience coaching a team, including loan officers
- NMLS registration, or the ability to register

Salary $88,000 to $98,000, plus bonus`,
        },
      },
      reason: {
        uk: "I want to run a larger branch for a mutual, where lending and savings both have room to grow.",
        us: "I want to run a larger branch for a member-owned credit union, where lending and deposits both have room to grow.",
      },
      paragraphs: [
        {
          uk: "Since 2020 I have run the largest of 22 branches at Harrowden Building Society, and I would like to apply for the Branch Manager role at Clunbridge Building Society in Worcester. I want to run a larger branch for a mutual, where lending and savings both have room to grow.",
          us: "Since 2020 I have run the largest of 22 branches at Harrowden Credit Union, and I would like to apply for the Branch Manager role at Clunbridge Credit Union in Sacramento. I want to run a larger branch for a member-owned credit union, where lending and deposits both have room to grow.",
        },
        {
          uk: "My branch has a team of 12, around 11,000 members and £168 million in savings and mortgage balances. Your advert asks for a record of growing mortgage lending and savings. I grew mortgage lending from the branch by 26% in 2 years to £41 million in 2025, by offering a mortgage review at every savings appointment. I also raised savings balances by £19 million in 2025 by calling 1,800 members whose fixed-rate bonds were due to mature.",
          us: "My branch has a team of 12, around 11,000 members and $212 million in deposit and loan balances. Your advert asks for a record of growing loans and deposits. I grew loan volume from the branch by 26% in 2 years to $52 million in 2025, by offering a loan review at every account opening. I also grew deposits by $24 million in 2025 by calling 1,800 members whose certificates of deposit were due to mature.",
        },
        {
          uk: "You are also looking for strong fraud prevention and complaint handling. I stopped 41 scam payments worth £286,000 in 2025 by training the team in fraud prevention and calling the police under the Banking Protocol. I cut complaints from 34 to 15 a year and resolved 92% within 3 working days, by letting 4 team members refund fees up to £50.",
          us: "You are also looking for strong fraud prevention and complaint handling. I stopped 41 scam payments worth $362,000 in 2025 by training the team in fraud prevention and reporting suspected elder financial abuse to Adult Protective Services. I cut complaints from 34 to 15 a year and resolved 92% within 3 business days, by letting 4 team members refund fees up to $75.",
        },
        {
          uk: "As assistant branch manager I coached 3 cashiers into mortgage adviser roles, each passing CeMAP within a year. I hold the Certificate in Mortgage Advice and Practice (CeMAP).",
          us: "As assistant branch manager I coached 3 tellers into loan officer roles, each registering with the NMLS within a year. I am a registered mortgage loan originator with the Nationwide Multistate Licensing System and Registry (NMLS).",
        },
        CLOSE,
      ],
    },
  },
];
