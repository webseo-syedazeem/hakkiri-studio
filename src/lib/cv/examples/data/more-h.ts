import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** Phase 3, batch 1 (28 Nov 2026): roles the industry packs list that had no example. */
export const MORE_H: ExampleSpec[] = [
  {
    id: "office-manager",
    industry: "admin",
    role: "Office Manager",
    level: "experienced",
    template: "ledger",
    blurb: {
      uk: "An office manager who runs the office of a 42-person architecture practice, from suppliers and budgets to onboarding and health and safety.",
      us: "An office manager who runs the office of a 42-person architecture firm, from vendors and budgets to onboarding and workplace safety.",
    },
    person: { name: "Lorna Kilbride", email: "lorna.kilbride@example.com", phone: { uk: "07700 900646", us: "(720) 555-0168" }, location: { uk: "Nottingham", us: "Denver, CO" } },
    profile: {
      uk: "Office manager with 11 years in office administration, the last 7 running the office of a 42-person architecture practice. Manages a £210,000 yearly office budget, 2 office assistants, 30 supplier contracts, the building, onboarding, and health and safety. Saved £18,400 a year by renegotiating 9 supplier contracts and moved the practice to a new studio over one weekend without losing a working day. Holds a Level 4 Certificate in Facilities Management and the Institution of Occupational Safety and Health (IOSH) Managing Safely certificate.",
      us: "Office manager with 11 years in office administration, the last 7 running the office of a 42-person architecture firm. Manages a $265,000 yearly office budget, 2 office assistants, 30 vendor contracts, the building, onboarding and workplace safety. Saved $23,000 a year by renegotiating 9 vendor contracts and moved the firm to a new studio over one weekend without losing a workday. Holds the Facility Management Professional (FMP) credential from the International Facility Management Association (IFMA).",
    },
    experience: [
      {
        title: "Office Manager",
        org: "Thackray Ingram Architects",
        location: { uk: "Nottingham", us: "Denver, CO" },
        start: "2019-04",
        current: true,
        bullets: [
          {
            uk: "Run the office for 42 architects and support staff across 2 floors, managing 2 office assistants who cover the front desk, post and meeting rooms",
            us: "Run the office for 42 architects and support staff across 2 floors, managing 2 office assistants who cover the front desk, mail and meeting rooms",
          },
          {
            uk: "Manage an office budget of £210,000 a year for rent, service charges, supplies and IT contracts, finishing within budget in each of the last 4 years",
            us: "Manage an office budget of $265,000 a year for rent, utilities, supplies and IT contracts, finishing within budget in each of the last 4 years",
          },
          {
            uk: "Renegotiated 9 of the practice's 30 supplier contracts in 2024, including cleaning, printing and stationery, saving £18,400 a year",
            us: "Renegotiated 9 of the firm's 30 vendor contracts in 2024, including cleaning, printing and office supplies, saving $23,000 a year",
          },
          {
            uk: "Planned and ran the office move to a new 9,000 square foot studio in 2022 with the landlord, fit-out contractor and IT provider, over one weekend without losing a working day",
            us: "Planned and ran the office move to a new 9,000 square foot studio in 2022 with the landlord, build-out contractor and IT provider, over one weekend without losing a workday",
          },
          {
            uk: "Built an onboarding checklist for IT accounts, building passes and the first week, used for all 26 new starters since 2023",
            us: "Built an onboarding checklist for IT accounts, building passes and the first week, used for all 26 new hires since 2023",
          },
          {
            uk: "Lead health and safety for the office, running fire risk assessments and 4 fire drills a year, with no lost-time accidents in 6 years",
            us: "Lead workplace safety for the office, running safety inspections and 4 fire drills a year, with no lost-time injuries in 6 years",
          },
        ],
      },
      {
        title: "Office Administrator",
        org: "Loxley Recruitment",
        location: { uk: "Nottingham", us: "Aurora, CO" },
        start: "2015-08",
        end: "2019-03",
        bullets: [
          {
            uk: "Ran the front desk and post room for an office of 25 consultants, answering around 80 calls a day",
            us: "Ran the front desk and mail room for an office of 25 recruiters, answering around 80 calls a day",
          },
          {
            uk: "Booked travel and hotels for 12 consultants, cutting travel spend by 15% in a year by moving all bookings to one travel management company",
            us: "Booked travel and hotels for 12 recruiters, cutting travel spend by 15% in a year by moving all bookings to one travel management company",
          },
          "Created a stock list for stationery and kitchen supplies, cutting rush orders from about 10 a month to 2",
          "Planned 6 client events a year for up to 120 guests, from venues and catering to name badges, keeping each within its budget",
          {
            uk: "Took on facilities work for the 2 floors in 2017, arranging repairs, cleaning and building passes with the landlord's agent",
            us: "Took on facilities work for the 2 floors in 2017, arranging repairs, cleaning and building access with the property manager",
          },
          {
            uk: "Trained as the office's fire marshal and first aid lead, keeping the fire safety and first aid records for 25 staff up to date",
            us: "Trained as the office's fire warden and first aid lead, keeping the safety and first aid records for 25 staff up to date",
          },
        ],
      },
      {
        title: { uk: "Weekend Receptionist", us: "Weekend Front Desk Agent" },
        org: "Lindum House Hotel",
        location: { uk: "Lincoln", us: "Denver, CO" },
        start: "2013-10",
        end: "2015-06",
        bullets: [
          "Ran the front desk on weekend shifts at a 60-room hotel while studying, checking in around 40 guests a shift",
          {
            uk: "Took around 25 phone and email bookings a shift and settled guests' bills at check-out, with no till errors in 2 years",
            us: "Took around 25 phone and email reservations a shift and settled guests' bills at check-out, with no cash drawer errors in 2 years",
          },
          "Answered guests' questions on rooms, restaurants and travel, and logged around 15 maintenance requests a weekend for the day team",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business Management", us: "Bachelor of Science in Business Administration" },
        org: { uk: "University of Lincoln", us: "Metropolitan State University of Denver" },
        end: "2015",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 4 Certificate in Facilities Management", us: "Facility Management Professional (FMP)" },
        org: { uk: "Institute of Workplace and Facilities Management", us: "International Facility Management Association" },
        end: "2021",
      },
      {
        title: { uk: "IOSH Managing Safely", us: "OSHA 30-Hour General Industry" },
        org: { uk: "Institution of Occupational Safety and Health", us: "Occupational Safety and Health Administration" },
        end: "2020",
      },
    ],
    skills: [
      "Office budgets",
      { uk: "Supplier contracts", us: "Vendor contracts" },
      { uk: "Facilities management", us: "Facility management" },
      "Office moves",
      "Onboarding",
      { uk: "Health and safety", us: "Workplace safety" },
      { uk: "Fire risk assessments", us: "Safety inspections" },
      "Travel booking",
      "Event planning",
    ],
    names: ["Lorna", "Kilbride", "Thackray", "Ingram", "Loxley", "Lindum", "Pellbrook"],
    letter: {
      job: {
        title: "Office Manager",
        employer: "Pellbrook Engineering",
        advert: {
          uk: `Office Manager
Pellbrook Engineering, Nottingham

Pellbrook Engineering is a structural and civil engineering consultancy of 70 staff, moving to a larger office in the city centre next year.

The role
You will run our office and lead a team of 3, looking after suppliers, facilities, the office budget, onboarding and health and safety.

What we are looking for
- Experience running an office of 40 or more people
- A record of managing an office budget and supplier contracts
- Experience planning an office move or refurbishment
- A health and safety qualification, such as IOSH Managing Safely
- A friendly, organised welcome for new starters and visitors

Salary £38,000 to £42,000`,
          us: `Office Manager
Pellbrook Engineering, Denver, CO

Pellbrook Engineering is a structural and civil engineering firm of 70 employees, moving to a larger office downtown next year.

The role
You will run our office and lead a team of 3, looking after vendors, facilities, the office budget, onboarding and workplace safety.

What we are looking for
- Experience running an office of 40 or more people
- A record of managing an office budget and vendor contracts
- Experience planning an office move or renovation
- Workplace safety training, such as OSHA 30
- A friendly, organized welcome for new hires and visitors

Salary $68,000 to $76,000`,
        },
      },
      reason: "I want to run a larger office and lead a bigger team, and I would enjoy planning another office move.",
      paragraphs: [
        {
          uk: "Pellbrook Engineering is moving to a larger office next year, and I would like to see that move through as your Office Manager. I want to run a larger office and lead a bigger team, and I would enjoy planning another office move.",
          us: "Pellbrook Engineering is moving to a larger office downtown next year, and I would like to see that move through as your Office Manager. I want to run a larger office and lead a bigger team, and I would enjoy planning another office move.",
        },
        {
          uk: "At Thackray Ingram Architects I run the office for 42 architects and support staff, managing 2 office assistants who cover the front desk, post and meeting rooms. Your advert asks for a record of managing an office budget and supplier contracts. I manage an office budget of £210,000 a year, finishing within budget in each of the last 4 years. In 2024 I renegotiated 9 of the practice's 30 supplier contracts, including cleaning, printing and stationery, saving £18,400 a year.",
          us: "At Thackray Ingram Architects I run the office for 42 architects and support staff, managing 2 office assistants who cover the front desk, mail and meeting rooms. Your advert asks for a record of managing an office budget and vendor contracts. I manage an office budget of $265,000 a year, finishing within budget in each of the last 4 years. In 2024 I renegotiated 9 of the firm's 30 vendor contracts, including cleaning, printing and office supplies, saving $23,000 a year.",
        },
        {
          uk: "You are also looking for experience planning an office move. In 2022 I planned and ran the office move to a new 9,000 square foot studio with the landlord, fit-out contractor and IT provider, over one weekend without losing a working day. I also built an onboarding checklist for IT accounts, building passes and the first week, used for all 26 new starters since 2023.",
          us: "You are also looking for experience planning an office move. In 2022 I planned and ran the office move to a new 9,000 square foot studio with the landlord, build-out contractor and IT provider, over one weekend without losing a workday. I also built an onboarding checklist for IT accounts, building passes and the first week, used for all 26 new hires since 2023.",
        },
        {
          uk: "I lead health and safety for the office, running fire risk assessments and 4 fire drills a year, with no lost-time accidents in 6 years. I hold the IOSH Managing Safely certificate and a Level 4 Certificate in Facilities Management.",
          us: "I lead workplace safety for the office, running safety inspections and 4 fire drills a year, with no lost-time injuries in 6 years. I hold the Facility Management Professional (FMP) credential from the International Facility Management Association (IFMA), and OSHA 30-Hour General Industry training from the Occupational Safety and Health Administration.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "receptionist",
    industry: "admin",
    role: "Receptionist",
    level: "early",
    template: "minimal",
    blurb: {
      uk: "A receptionist two years into running the front desk of a busy physiotherapy clinic, after two years in a coffee shop.",
      us: "A receptionist two years into running the front desk of a busy physical therapy clinic, after two years in a coffee shop.",
    },
    person: { name: "Keeley Marsden", email: "keeley.marsden@example.com", phone: { uk: "07700 900648", us: "(504) 555-0169" }, location: { uk: "Harrogate", us: "New Orleans, LA" } },
    profile: {
      uk: "Receptionist with 2 years at the front desk of a physiotherapy clinic with 14 practitioners, after 2 years serving customers in a busy coffee shop. Answers around 90 phone calls a day, greets around 120 patients and books around 400 appointments a week in Cliniko. Cut missed appointments from 9% to 4% in 6 months by setting up text reminders. Holds an Emergency First Aid at Work certificate.",
      us: "Receptionist with 2 years at the front desk of a physical therapy clinic with 14 therapists, after 2 years in a busy coffee shop. Answers around 90 phone calls a day, checks in around 120 patients and schedules around 400 appointments a week in Cliniko. Cut no-shows from 9% to 4% in 6 months with text reminders. Certified in first aid by the American Red Cross.",
    },
    experience: [
      {
        title: "Receptionist",
        org: { uk: "Dunstall Physiotherapy", us: "Dunstall Physical Therapy" },
        location: { uk: "Harrogate", us: "New Orleans, LA" },
        start: "2024-09",
        current: true,
        bullets: [
          {
            uk: "Answer around 90 phone calls a day and greet around 120 patients at a clinic with 14 physiotherapists and sports therapists",
            us: "Answer around 90 phone calls a day and check in around 120 patients for 14 physical therapists",
          },
          {
            uk: "Book, move and cancel around 400 appointments a week in Cliniko, keeping the diaries of 14 practitioners over 90% full",
            us: "Schedule around 400 appointments a week in Cliniko, keeping 14 therapists over 90% booked",
          },
          {
            uk: "Cut missed appointments from 9% to 4% in 6 months by setting up text reminders 2 days before each appointment",
            us: "Cut no-shows from 9% to 4% in 6 months by setting up text reminders 2 days before each visit",
          },
          {
            uk: "Take around £3,000 a day in card payments and check insurance authorisation codes, balancing the takings to the end-of-day report each evening",
            us: "Collect around $3,500 a day in co-pays and card payments, balancing the cash drawer nightly",
          },
          {
            uk: "Set up online booking with the clinic manager in 2025, which now takes 35% of new bookings",
            us: "Set up online scheduling in 2025, which now takes 35% of new appointments",
          },
          "Wrote a 2-page front desk guide, used to train 2 new receptionists in 2025",
        ],
      },
      {
        title: "Barista",
        org: "Morland Coffee House",
        location: { uk: "Harrogate", us: "Metairie, LA" },
        start: "2022-07",
        end: "2024-08",
        bullets: [
          {
            uk: "Served around 250 customers a day at a busy town centre counter, taking orders and card and cash payments",
            us: "Served around 250 customers a day at a busy downtown counter, taking orders and payments",
          },
          {
            uk: "Opened the shop alone 3 mornings a week, setting up the counter and the till float for a 7am start",
            us: "Opened the shop alone 3 mornings a week, setting up the counter and cash drawer by 7am",
          },
          {
            uk: "Settled around 10 customer complaints a week, such as wrong orders and long waits, before they reached the manager",
            us: "Settled around 10 customer complaints a week, from wrong orders to long waits, on the spot",
          },
          {
            uk: "Kept the shop's food hygiene rating at 5 through 2 inspections by following the cleaning and temperature logs on each shift",
            us: "Passed 2 health inspections with no violations, keeping the temperature logs each shift",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels", us: "High School Diploma" },
        org: { uk: "Wetherdale Sixth Form College", us: "Wetherdale High School" },
        location: { uk: "Harrogate", us: "Metairie, LA" },
        end: "2022",
        grade: { uk: "English Language (B), Business (B), Psychology (C)", us: "" },
      },
    ],
    certificates: [
      {
        title: { uk: "Emergency First Aid at Work", us: "Adult First Aid/CPR/AED" },
        org: { uk: "St John Ambulance", us: "American Red Cross" },
        end: "2025",
      },
    ],
    skills: [
      "Front desk",
      "Phone calls",
      { uk: "Appointment booking", us: "Appointment scheduling" },
      "Cliniko",
      "Text reminders",
      "Card payments",
      { uk: "Online booking", us: "Online scheduling" },
      "Customer complaints",
      "First aid",
    ],
    names: ["Keeley", "Marsden", "Dunstall", "Morland", "Wetherdale", "Eskdale", "Cliniko", "Harrogate", "Metairie"],
    letter: {
      job: {
        title: "Receptionist",
        employer: { uk: "Eskdale Dental Care", us: "Eskdale Dental" },
        advert: {
          uk: `Receptionist
Eskdale Dental Care, Harrogate

Eskdale Dental Care is a private and NHS practice with 9 dentists and hygienists, seeing around 150 patients a day.

The role
You will run our front desk with 2 other receptionists: answering calls, booking appointments, greeting patients and taking payments.

What we are looking for
- At least 1 year on a front desk, ideally in a clinic or practice
- Experience with an appointment booking system
- A clear, friendly phone manner
- Confidence taking payments and balancing the till
- A calm approach at busy times

Salary £23,500 to £25,000`,
          us: `Receptionist
Eskdale Dental, New Orleans, LA

Eskdale Dental is a family dental practice with 9 dentists and hygienists, seeing around 150 patients a day.

The role
You will run our front desk with 2 other receptionists: answering calls, scheduling appointments, checking in patients and collecting payments.

What we are looking for
- At least 1 year on a front desk, ideally in a clinic or medical office
- Experience with an appointment scheduling system
- A clear, friendly phone manner
- Confidence collecting co-pays and balancing the cash drawer
- A calm approach at busy times

Pay $17 to $19 an hour`,
        },
      },
      reason: "I want to work at a larger practice where I can take on more of the front desk, and I enjoy being the first person patients speak to.",
      paragraphs: [
        {
          uk: "I would like to apply for the Receptionist position at Eskdale Dental Care. I want to work at a larger practice where I can take on more of the front desk, and I enjoy being the first person patients speak to.",
          us: "I would like to apply for the Receptionist position at Eskdale Dental. I want to work at a larger practice where I can take on more of the front desk, and I enjoy being the first person patients speak to.",
        },
        {
          uk: "At Dunstall Physiotherapy I answer around 90 phone calls a day and greet around 120 patients at a clinic with 14 physiotherapists and sports therapists. Your advert asks for experience with an appointment booking system. I book, move and cancel around 400 appointments a week in Cliniko, keeping the diaries of 14 practitioners over 90% full.",
          us: "At Dunstall Physical Therapy I answer around 90 phone calls a day and check in around 120 patients for 14 physical therapists. Your posting asks for experience with an appointment scheduling system. I schedule around 400 appointments a week in Cliniko, keeping 14 therapists over 90% booked.",
        },
        {
          uk: "I also cut missed appointments from 9% to 4% in 6 months by setting up text reminders 2 days before each appointment. In 2025 I set up online booking with the clinic manager, which now takes 35% of new bookings. I also wrote a 2-page front desk guide, used to train 2 new receptionists in 2025.",
          us: "I also cut no-shows from 9% to 4% in 6 months by setting up text reminders 2 days before each visit. In 2025 I set up online scheduling, which now takes 35% of new appointments. I also wrote a 2-page front desk guide, used to train 2 new receptionists in 2025.",
        },
        {
          uk: "You are also looking for confidence taking payments. I take around £3,000 a day in card payments and check insurance authorisation codes, balancing the takings to the end-of-day report each evening. Before the clinic, I served around 250 customers a day at Morland Coffee House, taking orders and card and cash payments at a busy town centre counter.",
          us: "You are also looking for confidence collecting co-pays. I collect around $3,500 a day in co-pays and card payments, balancing the cash drawer nightly. Before the clinic, I served around 250 customers a day at Morland Coffee House, taking orders and payments at a busy downtown counter.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "bookkeeper",
    industry: "finance",
    role: "Bookkeeper",
    level: "experienced",
    template: "compact",
    blurb: {
      uk: "A bookkeeper who keeps the books for 18 small businesses at an accountancy practice, from VAT returns to month-end.",
      us: "A bookkeeper who keeps the books for 18 small businesses at an accounting firm, from sales tax returns to month-end.",
    },
    person: { name: "Alison Treharne", email: "alison.treharne@example.com", phone: { uk: "07700 900649", us: "(513) 555-0170" }, location: { uk: "Shrewsbury", us: "Cincinnati, OH" } },
    profile: {
      uk: "Bookkeeper with 11 years in small business accounts, the last 6 keeping the books for 18 clients of an accountancy practice in Xero and QuickBooks. Files quarterly VAT returns for 14 clients under Making Tax Digital, with no late filings or penalties in 4 years. Runs the month-end for 12 clients and cut the time spent on supplier bills by around 40% by moving 10 clients onto Dext. Holds the Level 4 Diploma in Professional Accounting from the Association of Accounting Technicians (AAT).",
      us: "Bookkeeper with 11 years in small business accounts, the last 6 keeping the books for 18 clients of an accounting firm in QuickBooks Online and Xero. Files sales and use tax returns for 11 clients in Ohio and Kentucky, with no late filings or penalties in 4 years. Runs the month-end for 12 clients and cut the time spent on vendor bills by around 40% by moving 10 clients onto Dext. A Certified Bookkeeper (CB) with the American Institute of Professional Bookkeepers and a QuickBooks Online Certified ProAdvisor.",
    },
    experience: [
      {
        title: "Bookkeeper",
        org: { uk: "Wolsey Accountancy", us: "Wolsey Accounting Group" },
        location: { uk: "Shrewsbury", us: "Cincinnati, OH" },
        start: "2020-09",
        current: true,
        bullets: [
          {
            uk: "Keep the books for 18 small business clients in Xero and QuickBooks, from restaurants and builders to a dental practice, with turnover from £90,000 to £2.4 million",
            us: "Keep the books for 18 small business clients in QuickBooks Online and Xero, from restaurants and contractors to a dental practice, with revenue from $110,000 to $3 million",
          },
          {
            uk: "Prepare and file quarterly VAT returns for 14 clients under Making Tax Digital, with no late filings or penalties in 4 years",
            us: "Prepare and file monthly and quarterly sales and use tax returns for 11 clients in Ohio and Kentucky, with no late filings or penalties in 4 years",
          },
          {
            uk: "Run the month-end for 12 clients by the 8th working day: bank and card reconciliations, accruals, prepayments and a management accounts pack",
            us: "Run the month-end for 12 clients by the 8th business day: bank and credit card reconciliations, accruals, prepaid expenses and a monthly financial report",
          },
          {
            uk: "Moved 10 clients onto Dext for capturing receipts and bills, cutting the time spent on supplier bills by around 40%",
            us: "Moved 10 clients onto Dext for capturing receipts and bills, cutting the time spent on vendor bills by around 40%",
          },
          {
            uk: "Reconciled a 14-month backlog of bank transactions for a new client in 6 weeks, finding £11,200 of VAT the client had not reclaimed",
            us: "Reconciled a 14-month backlog of bank transactions for a new client in 6 weeks, finding $8,600 of duplicate vendor payments that the client then recovered",
          },
          {
            uk: "Run monthly payroll in Xero for 5 clients with 60 employees in total, including Real Time Information (RTI) submissions and pension contributions",
            us: "Run biweekly payroll in QuickBooks Online for 5 clients with 60 employees in total, including payroll tax deposits and quarterly filings",
          },
        ],
      },
      {
        title: "Accounts Assistant",
        org: { uk: "Hexley Timber", us: "Hexley Lumber" },
        location: { uk: "Shrewsbury", us: "Florence, KY" },
        start: "2015-08",
        end: "2020-08",
        bullets: [
          {
            uk: "Processed around 600 purchase invoices a month in Sage 50, matching each to its order and delivery note before payment",
            us: "Processed around 600 vendor invoices a month in QuickBooks Desktop, matching each to its purchase order and delivery receipt before payment",
          },
          {
            uk: "Ran credit control for 400 trade accounts, cutting debts over 60 days from £48,000 to £19,000 in a year with weekly calls",
            us: "Ran collections for 400 contractor accounts, cutting receivables over 60 days from $60,000 to $24,000 in a year with weekly calls",
          },
          {
            uk: "Reconciled 3 bank accounts and the supplier ledger each month, clearing a backlog of 90 unmatched items in the first quarter",
            us: "Reconciled 3 bank accounts and the accounts payable ledger each month, clearing a backlog of 90 unmatched items in the first quarter",
          },
          {
            uk: "Prepared the monthly aged debt report and cash flow forecast for the 2 directors",
            us: "Prepared the monthly receivables aging report and cash flow forecast for the 2 owners",
          },
          {
            uk: "Matched around 150 supplier statements a month to the purchase ledger, clearing 30 disputed invoices with suppliers in the first year",
            us: "Matched around 150 vendor statements a month to the accounts payable ledger, clearing 30 disputed invoices with vendors in the first year",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels", us: "Associate of Applied Business in Accounting" },
        org: { uk: "Severnbank Sixth Form College", us: "Cincinnati State Technical and Community College" },
        end: "2015",
        grade: { uk: "Maths (A), Business (B), Geography (B)", us: "GPA 3.5" },
      },
    ],
    volunteering: [
      {
        title: "Volunteer Treasurer",
        org: { uk: "Pengwern Community Choir", us: "Mill Creek Community Choir" },
        location: { uk: "Shrewsbury", us: "Cincinnati, OH" },
        start: "2019-01",
        current: true,
        bullets: [
          {
            uk: "Keep the accounts of a 60-member choir in Xero and prepare its yearly accounts for the independent examiner",
            us: "Keep the books of a 60-member choir in QuickBooks Online and prepare its yearly financial report for the board",
          },
          {
            uk: "Set up Gift Aid claims on members' donations, adding around £900 a year to the choir's income",
            us: "Set up online ticket sales for 3 concerts a year, cutting the cash taken at the door from about $2,000 to $500 a concert",
          },
        ],
      },
    ],
    certificates: [
      {
        title: { uk: "Level 4 Diploma in Professional Accounting", us: "Certified Bookkeeper (CB)" },
        org: { uk: "Association of Accounting Technicians", us: "American Institute of Professional Bookkeepers" },
        end: "2019",
      },
      {
        title: { uk: "Xero Certification", us: "QuickBooks Online Certified ProAdvisor" },
        org: { uk: "Xero", us: "Intuit" },
        end: "2021",
      },
    ],
    skills: [
      "Xero",
      "QuickBooks",
      { uk: "VAT returns", us: "Sales and use tax" },
      { uk: "Making Tax Digital", us: "Accounts payable" },
      "Month-end",
      "Bank reconciliations",
      { uk: "Management accounts", us: "Monthly financial reports" },
      "Dext",
      { uk: "Credit control", us: "Collections" },
      { uk: "Sage 50", us: "QuickBooks Desktop" },
    ],
    names: ["Alison", "Treharne", "Wolsey", "Hexley", "Severnbank", "Rendcombe", "Dext", "ProAdvisor", "Intuit", "Pengwern", "Shrewsbury", "Shropshire"],
    letter: {
      job: {
        title: "Senior Bookkeeper",
        employer: { uk: "Rendcombe Accountants", us: "Rendcombe CPAs" },
        advert: {
          uk: `Senior Bookkeeper
Rendcombe Accountants, Shrewsbury (hybrid)

Rendcombe Accountants looks after 300 small businesses and sole traders across Shropshire and mid Wales.

The role
You will keep the books for around 25 clients and check the work of 2 junior bookkeepers.

What we are looking for
- At least 5 years of bookkeeping for small businesses
- Strong Xero skills, with QuickBooks a bonus
- Experience preparing VAT returns under Making Tax Digital
- Experience running month-end and management accounts
- AAT Level 4 or similar

Salary £30,000 to £34,000`,
          us: `Senior Bookkeeper
Rendcombe CPAs, Cincinnati, OH (hybrid)

Rendcombe CPAs serves 300 small businesses across Ohio and Northern Kentucky.

The role
You will keep the books for around 25 clients and review the work of 2 junior bookkeepers.

What we are looking for
- At least 5 years of bookkeeping for small businesses
- Strong QuickBooks Online skills, with Xero a plus
- Experience filing sales and use tax returns
- Experience running month-end and monthly financial reports
- Certified Bookkeeper or QuickBooks ProAdvisor certification

Salary $55,000 to $62,000`,
        },
      },
      reason: "I want to take on a larger client list and start checking the work of newer bookkeepers.",
      paragraphs: [
        {
          uk: "I would welcome the chance to keep the books for around 25 clients as Senior Bookkeeper at Rendcombe Accountants. I want to take on a larger client list and start checking the work of newer bookkeepers.",
          us: "I would welcome the chance to keep the books for around 25 clients as Senior Bookkeeper at Rendcombe CPAs. I want to take on a larger client list and start checking the work of newer bookkeepers.",
        },
        {
          uk: "At Wolsey Accountancy I keep the books for 18 small business clients in Xero and QuickBooks, with turnover from £90,000 to £2.4 million. I run the month-end for 12 clients by the 8th working day, from bank and card reconciliations to a management accounts pack. I also moved 10 clients onto Dext, cutting the time spent on supplier bills by around 40%.",
          us: "At Wolsey Accounting Group I keep the books for 18 small business clients in QuickBooks Online and Xero, with revenue from $110,000 to $3 million. I run the month-end for 12 clients by the 8th business day, from bank and credit card reconciliations to a monthly financial report. I also moved 10 clients onto Dext, cutting the time spent on vendor bills by around 40%.",
        },
        {
          uk: "Your advert asks for experience preparing VAT returns under Making Tax Digital. I prepare and file quarterly VAT returns for 14 clients under Making Tax Digital, with no late filings or penalties in 4 years. I also reconciled a 14-month backlog of bank transactions for a new client in 6 weeks, finding £11,200 of VAT the client had not reclaimed.",
          us: "Your posting asks for experience filing sales and use tax returns. I prepare and file monthly and quarterly sales and use tax returns for 11 clients in Ohio and Kentucky, with no late filings or penalties in 4 years. I also reconciled a 14-month backlog of bank transactions for a new client in 6 weeks, finding $8,600 of duplicate vendor payments that the client then recovered.",
        },
        {
          uk: "Before Wolsey, I was an accounts assistant at Hexley Timber, where I ran credit control for 400 trade accounts and cut debts over 60 days from £48,000 to £19,000 in a year. I hold the Level 4 Diploma in Professional Accounting from the Association of Accounting Technicians (AAT).",
          us: "Before Wolsey, I was an accounts assistant at Hexley Lumber, where I ran collections for 400 contractor accounts and cut receivables over 60 days from $60,000 to $24,000 in a year. I am a Certified Bookkeeper (CB) with the American Institute of Professional Bookkeepers.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "payroll-officer",
    industry: "finance",
    role: { uk: "Payroll Officer", us: "Payroll Specialist" },
    level: "early",
    template: "index",
    blurb: {
      uk: "A payroll officer two years into running weekly and monthly payrolls for a hotel group of 780 staff, after starting at a payroll bureau.",
      us: "A payroll specialist two years into running multi-state payroll for a hotel group of 820 employees, after starting at a payroll services firm.",
    },
    person: { name: "Kofi Boateng", email: "kofi.boateng@example.com", phone: { uk: "07700 900650", us: "(571) 555-0171" }, location: { uk: "Milton Keynes", us: "Reston, VA" } },
    profile: {
      uk: "Payroll officer with 4 years in payroll, the last 2 running weekly and monthly payrolls for 780 staff across 11 hotels in Sage Payroll. Handles Pay As You Earn (PAYE), Real Time Information (RTI) submissions to His Majesty's Revenue and Customs (HMRC), pension auto-enrolment and year-end. Cut payroll errors from 1.8% to 0.4% of payslips in a year by adding a time sheet check with hotel managers. Holds the Payroll Technician Certificate from the Chartered Institute of Payroll Professionals (CIPP).",
      us: "Payroll specialist with 4 years in payroll, the last 2 running biweekly payroll for 820 employees across 9 hotels in Virginia, Maryland and Delaware in ADP Workforce Now. Handles multi-state tax withholding, wage garnishments, benefit deductions and year-end W-2s. Cut payroll errors from 1.8% to 0.4% of paychecks in a year by adding a time sheet check with hotel managers. Holds the Fundamental Payroll Certification (FPC) from PayrollOrg.",
    },
    experience: [
      {
        title: { uk: "Payroll Officer", us: "Payroll Specialist" },
        org: "Stanmoor Hotels",
        location: { uk: "Milton Keynes", us: "Reston, VA" },
        start: "2024-04",
        current: true,
        bullets: [
          {
            uk: "Run weekly and monthly payrolls for 780 staff across 11 hotels in Sage Payroll, paying staff on time on all 165 pay days since April 2024",
            us: "Run biweekly payroll for 820 employees across 9 hotels in Virginia, Maryland and Delaware in ADP Workforce Now, paying staff on time on all 68 paydays since April 2024",
          },
          {
            uk: "Send Real Time Information (RTI) submissions to HMRC on or before each pay day, with no late filing penalties in 2 years",
            us: "Set up state and local tax withholding for around 45 new hires a month, including staff who live in one state and work in another",
          },
          {
            uk: "Assess around 45 new starters a month for pension auto-enrolment, adding eligible staff to the scheme and processing opt-outs and refunds within the legal time limits",
            us: "Process around 35 wage garnishments, child support orders and tax levies each month, checking each order against the state's rules",
          },
          {
            uk: "Cut payroll errors from 1.8% to 0.4% of payslips in a year by adding a time sheet check with the 11 hotel managers before each cut-off",
            us: "Cut payroll errors from 1.8% to 0.4% of paychecks in a year by adding a time sheet check with the 9 hotel managers before each cutoff",
          },
          {
            uk: "Apply around 60 tax code changes, student loan deductions and attachment of earnings orders each month from HMRC and court notices",
            us: "File quarterly federal Form 941 and state unemployment tax returns for 3 states, with no late filing penalties in 2 years",
          },
          {
            uk: "Prepared P60s for 790 staff and expenses and benefits returns (P11D) for 35 managers at the 2025 year end, with no corrections from HMRC",
            us: "Prepared W-2s for 1,290 employees for 2025, with 2 corrected forms needed after filing",
          },
        ],
      },
      {
        title: { uk: "Payroll Administrator", us: "Payroll Clerk" },
        org: "Coldmere Payroll Services",
        location: { uk: "Northampton", us: "Sterling, VA" },
        start: "2022-07",
        end: "2024-03",
        bullets: [
          {
            uk: "Ran monthly payrolls for 25 small business clients with 5 to 60 employees each in BrightPay",
            us: "Ran payrolls for 25 small business clients with 5 to 60 employees each in Gusto",
          },
          "Transferred the payrolls of 14 new clients from their old providers, entering year-to-date figures and checking the opening pay run with each owner",
          {
            uk: "Answered around 30 pay queries a day from clients by phone and email, on tax codes, pensions and pay",
            us: "Answered around 30 pay queries a day from clients by phone and email, on tax withholding, benefit deductions and pay",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Accounting and Finance", us: "Bachelor of Science in Accounting" },
        org: { uk: "University of Northampton", us: "James Madison University" },
        end: "2022",
        grade: { uk: "2:1", us: "GPA 3.3" },
      },
    ],
    certificates: [
      {
        title: { uk: "Payroll Technician Certificate", us: "Fundamental Payroll Certification (FPC)" },
        org: { uk: "Chartered Institute of Payroll Professionals", us: "PayrollOrg" },
        end: "2024",
      },
    ],
    skills: [
      { uk: "Weekly and monthly payroll", us: "Multi-state payroll" },
      { uk: "Sage Payroll", us: "ADP Workforce Now" },
      { uk: "PAYE", us: "Tax withholding" },
      { uk: "Real Time Information", us: "Wage garnishments" },
      { uk: "Pension auto-enrolment", us: "Benefit deductions" },
      { uk: "Year-end", us: "W-2s" },
      "Time sheet checks",
      { uk: "Tax codes", us: "Quarterly tax filings" },
      { uk: "BrightPay", us: "Gusto" },
      "Pay queries",
    ],
    names: ["Kofi", "Boateng", "Stanmoor", "Coldmere", "Wrexley", "BrightPay", "Gusto", "PayrollOrg", "ADP", "Keynes", "Reston"],
    letter: {
      job: {
        title: { uk: "Payroll Officer", us: "Payroll Specialist" },
        employer: { uk: "Wrexley College", us: "Wrexley Community College" },
        advert: {
          uk: `Payroll Officer
Wrexley College, Milton Keynes

Wrexley College teaches 9,000 students and employs 1,100 staff, including 300 hourly-paid tutors.

The role
You will run the monthly payroll and the hourly-paid tutors' claims with a team of 3, and answer pay queries from staff.

What we are looking for
- At least 2 years running payrolls of 500 staff or more
- Strong knowledge of PAYE, RTI and pension auto-enrolment
- Experience of year-end, P60s and P11D forms
- Accuracy, and a clear way of explaining pay to staff
- A CIPP qualification, or working towards one

Salary £29,000 to £32,000`,
          us: `Payroll Specialist
Wrexley Community College, Reston, VA

Wrexley Community College serves 12,000 students and employs 1,100 faculty and staff, including 300 adjunct instructors who live in Virginia, Maryland and Washington, DC.

The role
You will process semimonthly payroll and adjunct pay with a team of 3, and answer pay questions from employees.

What we are looking for
- At least 2 years processing payroll for 500 employees or more
- Experience with multi-state tax withholding
- Experience with ADP Workforce Now
- Experience with year-end and W-2s
- FPC or CPP certification, or working towards one

Salary $58,000 to $64,000`,
        },
      },
      reason: {
        uk: "I want to run a larger payroll in a team where I can keep learning, and I enjoy explaining pay to staff.",
        us: "I want to process a larger payroll on a team where I can keep learning, and I enjoy explaining pay to employees.",
      },
      paragraphs: [
        {
          uk: "I am writing to apply for the Payroll Officer post at Wrexley College. I want to run a larger payroll in a team where I can keep learning, and I enjoy explaining pay to staff.",
          us: "I am writing to apply for the Payroll Specialist position at Wrexley Community College. I want to process a larger payroll on a team where I can keep learning, and I enjoy explaining pay to employees.",
        },
        {
          uk: "At Stanmoor Hotels I run weekly and monthly payrolls for 780 staff across 11 hotels in Sage Payroll, paying staff on time on all 165 pay days since April 2024. Your advert asks for strong knowledge of PAYE, RTI and pension auto-enrolment. I send Real Time Information (RTI) submissions to HMRC on or before each pay day, with no late filing penalties in 2 years. I also assess around 45 new starters a month for pension auto-enrolment, processing opt-outs and refunds within the legal time limits.",
          us: "At Stanmoor Hotels I run biweekly payroll for 820 employees across 9 hotels in Virginia, Maryland and Delaware in ADP Workforce Now, paying staff on time on all 68 paydays since April 2024. Your posting asks for experience with multi-state tax withholding. I set up state and local tax withholding for around 45 new hires a month, including staff who live in one state and work in another. I also process around 35 wage garnishments, child support orders and tax levies each month.",
        },
        {
          uk: "You are also looking for accuracy. I cut payroll errors from 1.8% to 0.4% of payslips in a year by adding a time sheet check with the 11 hotel managers before each cut-off. At the 2025 year end I prepared P60s for 790 staff and expenses and benefits returns (P11D) for 35 managers, with no corrections from HMRC.",
          us: "Your posting also asks for experience with year-end and W-2s. I prepared W-2s for 1,290 employees for 2025, with 2 corrected forms needed after filing. I also cut payroll errors from 1.8% to 0.4% of paychecks in a year by adding a time sheet check with the 9 hotel managers before each cutoff.",
        },
        {
          uk: "Before Stanmoor, I ran monthly payrolls for 25 small business clients at Coldmere Payroll Services and answered around 30 pay queries a day by phone and email. I hold the Payroll Technician Certificate from the Chartered Institute of Payroll Professionals (CIPP).",
          us: "Before Stanmoor, I ran payrolls for 25 small business clients at Coldmere Payroll Services and answered around 30 pay queries a day by phone and email. I hold the Fundamental Payroll Certification (FPC) from PayrollOrg.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "auditor",
    industry: "finance",
    role: "Senior Auditor",
    level: "experienced",
    template: "framework",
    blurb: {
      uk: "A senior auditor at a mid-size firm who leads around 12 external audits a year of owner-managed businesses, ACCA qualified.",
      us: "A senior auditor at a regional CPA firm who leads around 12 external audits a year of privately held companies, licensed as a CPA in Texas.",
    },
    person: { name: "Vikram Joshi", email: "vikram.joshi@example.com", phone: { uk: "07700 900651", us: "(210) 555-0172" }, location: { uk: "Birmingham", us: "San Antonio, TX" } },
    profile: {
      uk: "Audit senior with 8 years in external audit at a mid-size firm, leading around 12 audits a year of owner-managed businesses with turnover from £4m to £45m. Plans each audit from risk assessment to sign-off and reviews the work of teams of 2 to 4. Brought 10 of 12 audits in on budget in 2025, up from 7 of 12 in 2023, by agreeing document request lists with clients 4 weeks before fieldwork. Member of the Association of Chartered Certified Accountants (ACCA) since 2021.",
      us: "Senior auditor with 8 years in external audit at a regional CPA firm, leading around 12 audits a year of privately held companies with revenue from $5M to $55M. Plans each audit from risk assessment to the audit report and reviews the work of teams of 2 to 4. Brought 10 of 12 audits in on budget in 2025, up from 7 of 12 in 2023, by agreeing document request lists with clients 4 weeks before fieldwork. Certified public accountant (CPA), licensed in Texas since 2021.",
    },
    experience: [
      {
        title: { uk: "Audit Senior", us: "Senior Auditor" },
        org: "Kersey Pargeter LLP",
        location: { uk: "Birmingham", us: "San Antonio, TX" },
        start: "2022-09",
        current: true,
        bullets: [
          {
            uk: "Lead around 12 external audits a year of owner-managed businesses and groups with turnover from £4m to £45m, mostly in manufacturing, property and wholesale",
            us: "Lead around 12 external audits a year of privately held companies with revenue from $5M to $55M, mostly in manufacturing, real estate and distribution",
          },
          {
            uk: "Plan each audit from risk assessment to sign-off, setting testing thresholds and sample sizes, and reviewing the working papers of teams of 2 to 4",
            us: "Plan each audit from risk assessment to the audit report, setting testing thresholds and sample sizes, and reviewing the working papers of teams of 2 to 4",
          },
          "Brought 10 of 12 audits in on budget in 2025, up from 7 of 12 in 2023, by agreeing document request lists with clients 4 weeks before fieldwork",
          {
            uk: "Found £640,000 of sales recorded in the wrong year at a manufacturing client through cut-off testing, which the directors corrected before sign-off",
            us: "Found $800,000 of revenue recorded in the wrong year at a manufacturing client through cutoff testing, which management corrected before the audit report",
          },
          {
            uk: "Introduced data analytics software on 8 audits in 2025, testing whole journal populations instead of samples and cutting journal testing time by about 30%",
            us: "Introduced data analytics software on 8 audits in 2025, testing whole journal entry populations instead of samples and cutting that testing time by about 30%",
          },
          {
            uk: "Raised 48 control points in 2024 management letters, of which clients had fixed 36 by the next year's audit",
            us: "Wrote 48 internal control recommendations in 2024 management letters, of which clients had fixed 36 by the next year's audit",
          },
        ],
      },
      {
        title: { uk: "Audit Trainee", us: "Staff Auditor" },
        org: "Kersey Pargeter LLP",
        location: { uk: "Birmingham", us: "San Antonio, TX" },
        start: "2018-09",
        end: "2022-08",
        bullets: [
          {
            uk: "Tested revenue, purchases, payroll and fixed assets on around 20 audits a year, mostly for owner-managed businesses and charities",
            us: "Tested revenue, expenses, payroll and fixed assets on around 20 audits a year, mostly for privately held companies and nonprofit organizations",
          },
          {
            uk: "Drafted the statutory accounts of around 15 smaller audit clients a year under Financial Reporting Standard (FRS) 102, ready for manager review",
            us: "Drafted financial statements and notes under generally accepted accounting principles (GAAP) for around 15 smaller audit clients a year",
          },
          {
            uk: "Sent and chased around 150 bank, debtor and creditor confirmations a year, with replies for over 90% before fieldwork ended",
            us: "Sent and followed up around 150 bank, receivable and payable confirmations a year, with replies for over 90% before fieldwork ended",
          },
          {
            uk: "Built the firm's checklist for testing grant income at charities, used on 15 charity audits a year",
            us: "Built the firm's checklist for testing grant revenue at nonprofit organizations, used on 15 nonprofit audits a year",
          },
          {
            uk: "Passed the remaining 9 ACCA exams in 3 years while working full-time, after exemptions for an accounting degree",
            us: "Passed the 4 parts of the CPA exam between 2019 and 2020 while working full-time",
          },
          {
            uk: "Coached 4 new trainees on the firm's CaseWare audit files during the 2021 busy season",
            us: "Coached 4 new staff auditors on the firm's CaseWare audit files during the 2021 busy season",
          },
        ],
      },
      {
        title: { uk: "Audit Intern", us: "Audit Intern" },
        org: "Kersey Pargeter LLP",
        location: { uk: "Birmingham", us: "San Antonio, TX" },
        start: "2017-06",
        end: "2017-08",
        bullets: [
          {
            uk: "Tested bank, cash and payroll balances on 6 audits of owner-managed businesses during a 3-month summer placement",
            us: "Tested cash and payroll balances on 6 audits of privately held companies during a 3-month summer internship",
          },
          {
            uk: "Attended 2 year-end stock counts, testing around 150 items and writing up the count notes for the audit file",
            us: "Attended 2 year-end inventory counts, testing around 150 items and writing up the count notes for the audit file",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Accounting", us: "Master of Accountancy" },
        org: { uk: "Birmingham City University", us: "Texas State University" },
        end: "2018",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Chartered Certified Accountant (ACCA)", us: "Certified Public Accountant (CPA), Texas" },
        org: { uk: "Association of Chartered Certified Accountants", us: "Texas State Board of Public Accountancy" },
        end: "2021",
      },
    ],
    skills: [
      "External audit",
      "Audit planning",
      "Risk assessment",
      "Audit sampling",
      { uk: "Cut-off testing", us: "Cutoff testing" },
      "Data analytics",
      "Working paper review",
      "Management letters",
      { uk: "FRS 102", us: "US GAAP" },
      { uk: "Charity audits", us: "Nonprofit audits" },
    ],
    names: ["Vikram", "Joshi", "Kersey", "Pargeter", "Askew", "Thorne", "CaseWare"],
    letter: {
      job: {
        title: { uk: "Assistant Audit Manager", us: "Audit Supervisor" },
        employer: "Askew Thorne LLP",
        advert: {
          uk: `Assistant Audit Manager
Askew Thorne LLP, Birmingham

Askew Thorne is an independent firm of accountants with 14 partners, auditing owner-managed businesses, groups and charities across the West Midlands.

The role
Join our audit team to run a portfolio of around 15 audits, manage audit seniors and trainees, and be the main contact for clients' finance directors. This is a step up for an audit senior who is ready to manage.

What we are looking for
- ACCA or ACA qualified
- At least 2 years as an audit senior
- Experience planning audits and leading audit teams
- A record of bringing audits in on budget
- An interest in using data analytics on audits

Salary £52,000 to £58,000`,
          us: `Audit Supervisor
Askew Thorne LLP, San Antonio, TX

Askew Thorne is an independent CPA firm with 14 partners, auditing privately held companies and nonprofit organizations across South Texas.

The role
Join our audit team to run a portfolio of around 15 audits, supervise seniors and staff auditors, and be the main contact for clients' finance leaders. This is a step up for a senior auditor who is ready to supervise.

What we are looking for
- An active Texas CPA license
- At least 2 years as a senior auditor
- Experience planning audits and leading audit teams
- A record of bringing audits in on budget
- An interest in using data analytics on audits

Salary $95,000 to $108,000`,
        },
      },
      reason: {
        uk: "I want to step up from leading audits to managing a portfolio of them, and to develop the seniors and trainees who run them.",
        us: "I want to step up from leading audits to managing a portfolio of them, and to develop the seniors and staff auditors who run them.",
      },
      paragraphs: [
        {
          uk: "The Assistant Audit Manager post at Askew Thorne LLP is the step up I want to take, from leading audits to managing a portfolio of them. I also want to develop the seniors and trainees who run them.",
          us: "The Audit Supervisor position at Askew Thorne LLP is the step up I want to take, from leading audits to managing a portfolio of them. I also want to develop the seniors and staff auditors who run them.",
        },
        {
          uk: "At Kersey Pargeter LLP I lead around 12 external audits a year of owner-managed businesses and groups with turnover from £4m to £45m, mostly in manufacturing, property and wholesale. I plan each audit from risk assessment to sign-off, setting testing thresholds and sample sizes, and reviewing the working papers of teams of 2 to 4.",
          us: "At Kersey Pargeter LLP I lead around 12 external audits a year of privately held companies with revenue from $5M to $55M, mostly in manufacturing, real estate and distribution. I plan each audit from risk assessment to the audit report, setting testing thresholds and sample sizes, and reviewing the working papers of teams of 2 to 4.",
        },
        {
          uk: "Your advert asks for a record of bringing audits in on budget. I brought 10 of 12 audits in on budget in 2025, up from 7 of 12 in 2023, by agreeing document request lists with clients 4 weeks before fieldwork. I also raised 48 control points in 2024 management letters, of which clients had fixed 36 by the next year's audit.",
          us: "Your posting asks for a record of bringing audits in on budget. I brought 10 of 12 audits in on budget in 2025, up from 7 of 12 in 2023, by agreeing document request lists with clients 4 weeks before fieldwork. I also wrote 48 internal control recommendations in 2024 management letters, of which clients had fixed 36 by the next year's audit.",
        },
        {
          uk: "You also mention an interest in using data analytics on audits. I introduced data analytics software on 8 audits in 2025, testing whole journal populations instead of samples and cutting journal testing time by about 30%. I have been a member of the Association of Chartered Certified Accountants (ACCA) since 2021.",
          us: "You also mention an interest in using data analytics on audits. I introduced data analytics software on 8 audits in 2025, testing whole journal entry populations instead of samples and cutting that testing time by about 30%. I am a certified public accountant (CPA), licensed in Texas since 2021.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "legal-secretary",
    industry: "legal",
    role: { uk: "Legal Secretary", us: "Legal Assistant" },
    level: "experienced",
    template: "margin-notes",
    blurb: {
      uk: "A legal secretary in a family law team who runs dictation, diaries and court bundles for 3 solicitors, after starting out in residential conveyancing.",
      us: "A legal assistant in a family law practice who runs dictation, calendars and court filings for 2 attorneys, after starting out in real estate law.",
    },
    person: { name: "Bernadette Quinlan", email: "bernadette.quinlan@example.com", phone: { uk: "07700 900652", us: "(317) 555-0173" }, location: { uk: "Chester", us: "Indianapolis, IN" } },
    profile: {
      uk: "Legal secretary with 11 years in law firms, the last 6 in a family law team working for 3 solicitors and a trainee with around 120 open cases, after starting in residential conveyancing. Types around 25 digital dictations a day in BigHand and keeps files, key dates and court deadlines in Proclaim. Prepares court bundles for around 8 Family Court hearings a month, with none returned by the court in 4 years. Holds the Legal Secretaries Diploma from the Institute of Legal Secretaries and PAs (ILSPA) and types at 75 words a minute.",
      us: "Legal assistant with 11 years in law firms, the last 6 in a family law practice working for 2 attorneys and a paralegal with around 110 open cases, after starting in real estate law. Transcribes around 20 dictations a day in BigHand and keeps files, calendars and court deadlines in Clio. E-files around 60 pleadings and motions a month with the Marion County courts, with no filings rejected in 2025. An Accredited Legal Professional (ALP) with NALS who types at 75 words a minute.",
    },
    experience: [
      {
        title: { uk: "Legal Secretary, Family Law", us: "Legal Assistant, Family Law" },
        org: { uk: "Loxwood Haigh Solicitors", us: "Loxwood Haigh LLP" },
        location: { uk: "Chester", us: "Indianapolis, IN" },
        start: "2020-06",
        current: true,
        bullets: [
          {
            uk: "Manage the diaries and caseloads of 3 family solicitors and a trainee, with around 120 open cases in divorce, finances and child arrangements",
            us: "Manage the calendars and caseloads of 2 family law attorneys and a paralegal, with around 110 open cases in divorce, custody and support",
          },
          {
            uk: "Type around 25 digital dictations a day in BigHand, returning 95% within the same working day",
            us: "Transcribe around 20 dictations a day in BigHand, returning 95% within the same business day",
          },
          {
            uk: "Prepare and paginate court bundles for around 8 Family Court hearings a month, with none returned by the court in 4 years",
            us: "E-file around 60 pleadings, motions and proposed orders a month with the Marion County courts, with no filings rejected in 2025",
          },
          {
            uk: "Submit around 40 applications and documents a month through the MyHMCTS portal, serving copies on the other side by the court's deadlines",
            us: "Prepare hearing and mediation binders with indexed exhibits for around 8 hearings a month, serving copies on opposing counsel by the court's deadlines",
          },
          {
            uk: "Keep the team's key dates and court deadlines in Proclaim, with no missed deadline in 6 years",
            us: "Keep the firm's case files, court dates and filing deadlines in Clio, with no missed deadline in 6 years",
          },
          {
            uk: "Cut the typing backlog from 3 days to same-day in 2023 by setting up a shared dictation queue with the team's 2 other secretaries",
            us: "Cut the transcription backlog from 3 days to same-day in 2023 by setting up a shared dictation queue with the firm's 2 other legal assistants",
          },
        ],
      },
      {
        title: { uk: "Legal Secretary, Residential Property", us: "Legal Assistant, Real Estate" },
        org: { uk: "Eskridge & Co Solicitors", us: "Eskridge Law Group" },
        location: { uk: "Wrexham", us: "Carmel, IN" },
        start: "2017-09",
        end: "2020-05",
        bullets: [
          {
            uk: "Ordered searches and prepared draft contracts for around 90 live sales and purchases for 2 property solicitors",
            us: "Ordered title work and prepared draft purchase agreements for around 90 open real estate closings for 2 attorneys",
          },
          {
            uk: "Prepared around 35 completion statements a month and sent requests for funds to lenders and clients on time",
            us: "Prepared around 35 settlement statements a month and sent wire instructions to lenders and buyers on time",
          },
          {
            uk: "Registered around 20 completed purchases a month with the Land Registry, cutting requisitions from 12 to 3 a year with a pre-submission checklist",
            us: "Recorded around 50 deeds and mortgages a month with the Hamilton County Recorder, cutting rejected recordings from 12 to 3 a year with a pre-filing checklist",
          },
          "Opened around 15 new client files a month, running identity and conflict checks on each before work started",
          {
            uk: "Kept the completion diary for around 35 completions a month, with no missed completion dates",
            us: "Kept the closing calendar for around 35 closings a month, with no missed closing dates",
          },
        ],
      },
      {
        title: { uk: "Junior Legal Secretary", us: "Legal Receptionist" },
        org: { uk: "Eskridge & Co Solicitors", us: "Eskridge Law Group" },
        location: { uk: "Wrexham", us: "Carmel, IN" },
        start: "2015-09",
        end: "2017-08",
        bullets: [
          {
            uk: "Answered around 70 calls a day and greeted clients for a 4-partner firm, booking appointments for 9 solicitors",
            us: "Answered around 70 calls a day and greeted clients for a 4-partner firm, scheduling appointments for 9 attorneys",
          },
          "Typed around 30 letters and forms a day from handwritten notes, reaching 75 words a minute by 2017",
          "Scanned and indexed around 400 closed files onto the firm's document system in 2016, freeing a storage room",
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels", us: "Associate of Applied Science in Paralegal Studies" },
        org: { uk: "Marlston Sixth Form College", us: "Ivy Tech Community College" },
        end: "2015",
        grade: { uk: "English Literature (A), History (B), Law (B)", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Legal Secretaries Diploma", us: "Accredited Legal Professional (ALP)" },
        org: { uk: "Institute of Legal Secretaries and PAs", us: "NALS, the Association for Legal Professionals" },
        end: "2017",
      },
    ],
    skills: [
      { uk: "Digital dictation", us: "Dictation" },
      "BigHand",
      { uk: "Proclaim", us: "Clio" },
      { uk: "Court bundles", us: "Hearing binders" },
      { uk: "MyHMCTS", us: "E-filing" },
      "Family law",
      { uk: "Diary management", us: "Calendar management" },
      { uk: "Conveyancing", us: "Real estate closings" },
      "Typing at 75 words a minute",
      { uk: "Court deadlines", us: "Filing deadlines" },
    ],
    names: ["Bernadette", "Quinlan", "Loxwood", "Haigh", "Eskridge", "Haverleigh", "Marlston", "BigHand", "Clio", "MyHMCTS", "NALS", "ILSPA", "Wrexham", "Carmel"],
    letter: {
      job: {
        title: { uk: "Senior Legal Secretary, Family", us: "Senior Legal Assistant, Family Law" },
        employer: { uk: "Haverleigh Solicitors", us: "Haverleigh Law" },
        advert: {
          uk: `Senior Legal Secretary, Family
Haverleigh Solicitors, Chester

Haverleigh Solicitors is a firm of 60 people with a family team of 6 solicitors, covering divorce, finances and children matters.

The role
You will work for 2 partners in the family team, manage their diaries and caseloads, and lead the team's 3 secretaries.

What we are looking for
- At least 5 years as a legal secretary, ideally in family law
- Fast, accurate audio typing, with experience of digital dictation
- Experience preparing court bundles
- Experience with a case management system
- A calm, organised approach to court deadlines

Salary £27,000 to £30,000`,
          us: `Senior Legal Assistant, Family Law
Haverleigh Law, Indianapolis, IN

Haverleigh Law is a firm of 60 people with a family law group of 6 attorneys, covering divorce, custody and support.

The role
You will work for 2 partners in the family law group, manage their calendars and caseloads, and lead the group's 3 legal assistants.

What we are looking for
- At least 5 years as a legal assistant, ideally in family law
- Fast, accurate typing, with experience transcribing dictation
- Experience e-filing with Indiana courts
- Experience with Clio or a similar case management system
- A calm, organized approach to court deadlines

Salary $48,000 to $55,000`,
        },
      },
      reason: {
        uk: "I want a senior role where I can organise the work of a whole family team and help newer secretaries.",
        us: "I want a senior role in a larger family law group, where I can organize the work of the whole group.",
      },
      paragraphs: [
        {
          uk: "Haverleigh Solicitors needs a Senior Legal Secretary to lead the 3 secretaries in its family team, and I would like to take on that role. I want a senior role where I can organise the work of a whole family team and help newer secretaries.",
          us: "Haverleigh Law needs a Senior Legal Assistant to lead the 3 legal assistants in its family law group, and I would like to take on that role. I want a senior role in a larger family law group, where I can organize the work of the whole group.",
        },
        {
          uk: "At Loxwood Haigh Solicitors I manage the diaries and caseloads of 3 family solicitors and a trainee, with around 120 open cases in divorce, finances and child arrangements. Your advert asks for experience of digital dictation. I type around 25 digital dictations a day in BigHand, returning 95% within the same working day. In 2023 I cut the typing backlog from 3 days to same-day by setting up a shared dictation queue with the team's 2 other secretaries.",
          us: "At Loxwood Haigh LLP I manage the calendars and caseloads of 2 family law attorneys and a paralegal, with around 110 open cases in divorce, custody and support. Your posting asks for experience transcribing dictation. I transcribe around 20 dictations a day in BigHand, returning 95% within the same business day. In 2023 I cut the transcription backlog from 3 days to same-day by setting up a shared dictation queue with the firm's 2 other legal assistants.",
        },
        {
          uk: "You are also looking for experience preparing court bundles. I prepare and paginate court bundles for around 8 Family Court hearings a month, with none returned by the court in 4 years. I keep the team's key dates and court deadlines in Proclaim, with no missed deadline in 6 years.",
          us: "You are also looking for experience e-filing with Indiana courts. I e-file around 60 pleadings, motions and proposed orders a month with the Marion County courts, with no filings rejected in 2025. I keep the firm's case files, court dates and filing deadlines in Clio, with no missed deadline in 6 years.",
        },
        {
          uk: "Before Loxwood Haigh, I worked in residential property at Eskridge & Co Solicitors, where I registered around 20 completed purchases a month with the Land Registry. I hold the Legal Secretaries Diploma from the Institute of Legal Secretaries and PAs (ILSPA).",
          us: "Before Loxwood Haigh, I worked in real estate law at Eskridge Law Group, where I recorded around 50 deeds and mortgages a month with the Hamilton County Recorder. I am an Accredited Legal Professional (ALP) with NALS.",
        },
        CLOSE,
      ],
    },
  },
];
