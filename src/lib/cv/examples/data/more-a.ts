import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** More examples, added 27 Nov 2026 to fill gaps by level and industry. */
export const MORE_A: ExampleSpec[] = [
  {
    id: "graduate",
    industry: "early-career",
    role: { uk: "Graduate Management Trainee", us: "Management Trainee" },
    level: "student",
    template: "sapling",
    blurb: {
      uk: "A business management graduate with a weekend team leader job and a student society role.",
      us: "A business administration graduate with a shift supervisor job and a student club role.",
    },
    person: { name: "Sophie Lawrence", email: "sophie.lawrence@example.com", phone: { uk: "07700 900601", us: "(312) 555-0105" }, location: { uk: "Leeds", us: "Chicago, IL" } },
    profile: {
      uk: "Business management graduate with a 2:1 from the University of Leeds and three years of part-time work in a busy supermarket. Leads a team of 6 on weekend shifts, and cut average queue times at the tills from 6 to 4 minutes. Raised £4,500 from 6 local sponsors as events officer of a 220-member enterprise society. Looking for a graduate management scheme in retail or operations.",
      us: "Business administration graduate with a 3.5 GPA from the University of Illinois Chicago and three years of part-time work in a busy grocery store. Leads a team of 6 on weekend shifts, and cut average checkout wait times from 6 to 4 minutes. Raised $4,500 from 6 local sponsors as vice president of events for a 220-member entrepreneurship club. Looking for a management trainee program in retail or operations.",
    },
    education: [
      {
        title: { uk: "BSc (Hons) Business Management", us: "Bachelor of Science in Business Administration" },
        org: { uk: "University of Leeds", us: "University of Illinois Chicago" },
        end: "2026-06",
        grade: { uk: "2:1", us: "GPA 3.5" },
        bullets: [
          {
            uk: "Dissertation: surveyed 140 shoppers in 3 supermarkets and analysed the results in Excel, graded 72%",
            us: "Senior thesis: surveyed 140 shoppers in 3 grocery stores and analyzed the results in Excel, graded A",
          },
          {
            uk: "Top modules out of 18: operations management (74%) and leading people (71%)",
            us: "Top courses out of 40: operations management and organizational behavior, both graded A",
          },
        ],
      },
    ],
    experience: [
      {
        title: { uk: "Weekend Team Leader", us: "Shift Supervisor" },
        org: "Hartwell Foods",
        location: { uk: "Leeds", us: "Chicago, IL" },
        start: "2025-04",
        current: true,
        bullets: [
          {
            uk: "Lead a team of 6 customer assistants on Saturday and Sunday shifts in a store serving around 4,000 shoppers a weekend",
            us: "Lead a team of 6 cashiers and clerks on weekend shifts, serving around 4,000 shoppers a weekend",
          },
          {
            uk: "Cut average queue times at the tills from 6 to 4 minutes by planning staff breaks around the 3 busiest hours",
            us: "Cut checkout wait times from 6 to 4 minutes by planning staff breaks around the 3 busiest hours",
          },
          "Reduced bakery waste by 15% in 6 months by matching baking times to hourly sales",
          {
            uk: "Count and balance 4 tills at the end of each shift, with no unexplained differences in 12 months",
            us: "Count and balance 4 registers at the end of each shift, with no cash shortages in 12 months",
          },
        ],
      },
      {
        title: { uk: "Customer Assistant", us: "Cashier" },
        org: "Hartwell Foods",
        location: { uk: "Leeds", us: "Chicago, IL" },
        start: "2023-10",
        end: "2025-03",
        bullets: [
          {
            uk: "Served around 300 customers a shift on the tills and at the customer service desk",
            us: "Served around 300 customers a shift at the registers and the customer service desk",
          },
          {
            uk: "Trained 9 new starters on the tills, stock rotation and age-restricted sales, each signed off within 2 weeks",
            us: "Trained 9 new hires on registers, stock rotation and ID checks, each signed off within 2 weeks",
          },
          {
            uk: "Checked dates on chilled stock in 2 aisles each morning, with no out-of-date items found in 6 store audits",
            us: "Checked dates on refrigerated stock in 2 aisles each morning, with no expired items in 6 audits",
          },
        ],
      },
      {
        title: { uk: "Events Officer", us: "Vice President of Events" },
        org: { uk: "Enterprise Society, University of Leeds", us: "Entrepreneurship Club, University of Illinois Chicago" },
        location: { uk: "Leeds", us: "Chicago, IL" },
        start: "2024-09",
        end: "2026-06",
        bullets: [
          {
            uk: "Planned 9 events in a year, from a careers fair to talks by 5 local founders, for a 220-member society",
            us: "Planned 9 events in a year, from a career fair to talks by 5 local founders, for a 220-member club",
          },
          {
            uk: "Raised £4,500 from 6 local sponsors by writing a 2-page sponsorship pack and pitching to each in person",
            us: "Raised $4,500 from 6 local sponsors with a 2-page sponsorship pack, pitched to each in person",
          },
          "Grew average attendance from 35 to 60 students an event by moving talks to lunchtime and promoting them on 3 social media accounts",
        ],
      },
    ],
    skills: [
      "Customer service",
      { uk: "Training new starters", us: "Training new hires" },
      "Staff planning",
      { uk: "Till balancing", us: "Register balancing" },
      "Reducing waste",
      "Event planning",
      "Sponsorship",
      "Excel",
      "Operations management",
      "Surveys",
    ],
    names: ["Hartwell", "Marlowe", "Lawrence"],
    letter: {
      job: {
        title: { uk: "Graduate Management Trainee", us: "Management Trainee" },
        employer: "Marlowe Stores",
        advert: {
          uk: `Graduate Management Trainee
Marlowe Stores, Leeds

Marlowe Stores runs 120 food and home stores across the north of England.

The role
On our 2-year scheme you will work in 4 placements across stores and head office, then run a department of your own. Starting salary £28,000.

What we are looking for
- A degree in any subject, finished by summer 2026
- Experience of working in retail or with customers
- Experience of leading a team or organising events
- Good with numbers and data`,
          us: `Management Trainee
Marlowe Stores, Chicago, IL

Marlowe Stores runs 120 grocery and home stores across the Midwest.

The role
In our 2-year program you will complete 4 rotations across stores and the corporate office, then manage a department of your own. Starting salary $55,000.

What we are looking for
- A bachelor's degree in any subject, completed by summer 2026
- Experience working in retail or with customers
- Experience leading a team or organizing events
- Comfortable with numbers and data`,
        },
      },
      reason: {
        uk: "I want a career in retail management, and I would like to train in stores and at head office.",
        us: "I want a career in retail management, and I would like to train in stores and at the corporate office.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Graduate Management Trainee at Marlowe Stores. I want a career in retail management, and I would like to train in stores and at head office.",
          us: "I am applying for the role of Management Trainee at Marlowe Stores. I want a career in retail management, and I would like to train in stores and at the corporate office.",
        },
        {
          uk: "At Hartwell Foods I lead a team of 6 customer assistants on Saturday and Sunday shifts, in a store serving around 4,000 shoppers a weekend. I cut average queue times at the tills from 6 to 4 minutes by planning staff breaks around the 3 busiest hours. I also reduced bakery waste by 15% in 6 months by matching baking times to hourly sales.",
          us: "At Hartwell Foods I lead a team of 6 cashiers and clerks on weekend shifts, serving around 4,000 shoppers a weekend. I cut checkout wait times from 6 to 4 minutes by planning staff breaks around the 3 busiest hours. I also reduced bakery waste by 15% in 6 months by matching baking times to hourly sales.",
        },
        {
          uk: "Your advert asks for experience of leading a team or organising events. As a customer assistant I trained 9 new starters on the tills, stock rotation and age-restricted sales, each signed off within 2 weeks. As events officer of a 220-member enterprise society, I planned 9 events in a year, from a careers fair to talks by 5 local founders. I raised £4,500 from 6 local sponsors by writing a 2-page sponsorship pack and pitching to each in person.",
          us: "Your advert asks for experience leading a team or organizing events. As a cashier I trained 9 new hires on registers, stock rotation and ID checks, each signed off within 2 weeks. As vice president of events for a 220-member entrepreneurship club, I planned 9 events in a year, from a career fair to talks by 5 local founders. I raised $4,500 from 6 local sponsors with a 2-page sponsorship pack, pitched to each in person.",
        },
        {
          uk: "Your advert also asks for someone good with numbers and data. For my dissertation I surveyed 140 shoppers in 3 supermarkets and analysed the results in Excel. I also count and balance 4 tills at the end of each shift, with no unexplained differences in 12 months.",
          us: "Your advert also asks for someone comfortable with numbers and data. For my senior thesis I surveyed 140 shoppers in 3 grocery stores and analyzed the results in Excel. I also count and balance 4 registers at the end of each shift, with no cash shortages in 12 months.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "school-leaver",
    industry: "early-career",
    role: { uk: "Office Junior", us: "Office Assistant" },
    level: "student",
    template: "graduate",
    blurb: {
      uk: "A school leaver with A levels, a Saturday job at a garden centre and weekly food bank volunteering.",
      us: "A high school graduate with a weekend job at a garden center and weekly food pantry volunteering.",
    },
    person: { name: "Callum Reid", email: "callum.reid@example.com", phone: { uk: "07700 900602", us: "(415) 555-0106" }, location: { uk: "Derby", us: "San Francisco, CA" } },
    profile: {
      uk: "School leaver with A levels in business, English literature and psychology, and 8 GCSEs including English and maths. Has worked Saturdays for two years at a garden centre, serving customers on the till and taking phone orders. Built a call-back log in Excel there that cut missed customer call-backs from about 10 a week to 2. Volunteers every Wednesday at a community food bank, packing food parcels and keeping the stock spreadsheet up to date.",
      us: "High school graduate with a 3.6 GPA and classes in business, computer applications and English. Has worked weekends for two years at a garden center, serving customers at the register and taking phone orders. Built a call-back log in Excel there that cut missed customer call-backs from about 10 a week to 2. Volunteers every Wednesday at a community food pantry, packing food boxes and keeping the stock spreadsheet up to date.",
    },
    education: [
      {
        title: { uk: "A levels in Business, English Literature and Psychology", us: "High School Diploma" },
        org: { uk: "Ashbrook Sixth Form College", us: "Mission Ridge High School" },
        end: "2026-06",
        grade: { uk: "B, B, C", us: "GPA 3.6" },
        bullets: [
          {
            uk: "GCSEs: 8 at grades 9 to 5 at Ashbrook Academy in 2024, including English (7) and maths (6)",
            us: "Honor roll for 3 semesters, with classes in business, computer applications and English",
          },
          {
            uk: "Business coursework: planned and ran a coffee stall at the summer fair, selling 220 drinks for a £180 profit",
            us: "Business class project: planned and ran a coffee stand at the spring fair, selling 220 drinks for a $220 profit",
          },
        ],
      },
    ],
    experience: [
      {
        title: { uk: "Saturday Sales Assistant", us: "Weekend Sales Associate" },
        org: { uk: "Fernside Garden Centre", us: "Fernside Garden Center" },
        location: { uk: "Derby", us: "San Francisco, CA" },
        start: "2024-09",
        current: true,
        bullets: [
          {
            uk: "Serve around 150 customers each Saturday on the till, handling cash and card payments with no errors in 12 months",
            us: "Serve around 150 customers each Saturday at the register, handling cash and card payments with no errors in 12 months",
          },
          "Answer customer service calls and take around 25 phone orders a day for plants and garden furniture",
          "Built a shared call-back log in Excel that cut missed customer call-backs from about 10 a week to 2",
          "File around 200 delivery notes a month by date, so any order can be found in under a minute",
          {
            uk: "Trained 2 new Saturday staff on the till and phone orders in their first month",
            us: "Trained 2 new weekend staff on the register and phone orders in their first month",
          },
        ],
      },
    ],
    volunteering: [
      {
        title: "Volunteer",
        org: { uk: "Oakwell Community Food Bank", us: "Oakwell Community Food Pantry" },
        location: { uk: "Derby", us: "San Francisco, CA" },
        start: "2024-03",
        current: true,
        bullets: [
          {
            uk: "Pack around 60 food parcels every Wednesday evening with a team of 8 volunteers",
            us: "Pack around 60 food boxes every Wednesday evening with a team of 8 volunteers",
          },
          "Took on data entry for donations in 2025, logging around 400 items a week in the stock spreadsheet",
          {
            uk: "Typed up weekly rotas for 30 volunteers in Word, cutting last-minute gaps from 4 a month to 1",
            us: "Typed up weekly schedules for 30 volunteers in Word, cutting last-minute gaps from 4 a month to 1",
          },
        ],
      },
    ],
    skills: [
      "Customer service",
      "Phone orders",
      "Cash handling",
      "Excel",
      "Word",
      "Data entry",
      "Filing",
      { uk: "Rotas", us: "Scheduling" },
      "Training new staff",
    ],
    names: ["Callum", "Reid", "Ashbrook", "Fernside", "Oakwell", "Penrose"],
    letter: {
      job: {
        title: { uk: "Office Junior", us: "Office Assistant" },
        employer: { uk: "Penrose Accountants", us: "Penrose Accounting" },
        advert: {
          uk: `Office Junior
Penrose Accountants, Derby

Penrose Accountants is a team of 25 looking after 600 local businesses.

The role
You will answer the phones, greet clients, keep our files in order and enter data into our systems. Full training is given. Salary £21,500.

What we are looking for
- Good GCSEs in English and maths
- Experience of answering the phone or serving customers
- Confident with Word and Excel
- Careful and organised, with good attention to detail`,
          us: `Office Assistant
Penrose Accounting, San Francisco, CA

Penrose Accounting is a team of 25 serving 600 local businesses.

The role
You will answer phones, greet clients, keep our files in order and enter data into our systems. Full training is provided. Pay is $22 an hour.

What we are looking for
- A high school diploma or equivalent
- Experience answering phones or serving customers
- Comfortable with Word and Excel
- Careful and organized, with strong attention to detail`,
        },
      },
      reason: {
        uk: "I want to start my career in an office, and I would like to learn how an accountancy firm works.",
        us: "I want to start my career in an office, and I would like to learn how an accounting firm works.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Office Junior at Penrose Accountants. I want to start my career in an office, and I would like to learn how an accountancy firm works.",
          us: "I am applying for the role of Office Assistant at Penrose Accounting. I want to start my career in an office, and I would like to learn how an accounting firm works.",
        },
        {
          uk: "Your advert asks for good GCSEs in English and maths. I have 8 GCSEs at grades 9 to 5, including English (7) and maths (6). I also have A levels in business, English literature and psychology from Ashbrook Sixth Form College.",
          us: "Your advert asks for a high school diploma or equivalent. I have a high school diploma from Mission Ridge High School, with a 3.6 GPA. I was on the honor roll for 3 semesters, with classes in business, computer applications and English.",
        },
        {
          uk: "Your advert also asks for experience of answering the phone or serving customers. At Fernside Garden Centre I serve around 150 customers each Saturday on the till, handling cash and card payments with no errors in 12 months. I answer customer service calls and take around 25 phone orders a day for plants and garden furniture.",
          us: "Your advert also asks for experience answering phones or serving customers. At Fernside Garden Center I serve around 150 customers each Saturday at the register, handling cash and card payments with no errors in 12 months. I answer customer service calls and take around 25 phone orders a day for plants and garden furniture.",
        },
        {
          uk: "You also ask for someone confident with Word and Excel. At Fernside I built a shared call-back log in Excel that cut missed customer call-backs from about 10 a week to 2. At the food bank I typed up weekly rotas for 30 volunteers in Word, cutting last-minute gaps from 4 a month to 1.",
          us: "You also ask for someone comfortable with Word and Excel. At Fernside I built a shared call-back log in Excel that cut missed customer call-backs from about 10 a week to 2. At the food pantry I typed up weekly schedules for 30 volunteers in Word, cutting last-minute gaps from 4 a month to 1.",
        },
        {
          uk: "Finally, you ask for someone careful and organised. I file around 200 delivery notes a month by date, so any order can be found in under a minute. I also took on data entry for donations at the food bank, logging around 400 items a week in the stock spreadsheet.",
          us: "Finally, you ask for someone careful and organized. I file around 200 delivery notes a month by date, so any order can be found in under a minute. I also took on data entry for donations at the food pantry, logging around 400 items a week in the stock spreadsheet.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "apprentice",
    industry: "early-career",
    role: { uk: "Engineering Apprentice", us: "Manufacturing Apprentice" },
    level: "student",
    template: "technical",
    blurb: {
      uk: "A college engineering student with workshop projects and a part-time warehouse job, applying for an apprenticeship.",
      us: "A manufacturing technology student with machine shop projects and a part-time warehouse job, applying for an apprenticeship.",
    },
    person: { name: "Rory Fletcher", email: "rory.fletcher@example.com", phone: { uk: "07700 900603", us: "(617) 555-0107" }, location: { uk: "Coventry", us: "Boston, MA" } },
    profile: {
      uk: "Engineering student in the second year of a BTEC Level 3 extended diploma, predicted a distinction, with 120 hours of workshop time. Machined a working bench vice to within 0.05 mm and built a robot that placed 2nd of 9 teams. Works 16 hours a week in a car parts warehouse, picking orders at 99.6% accuracy. Looking for an engineering apprenticeship in manufacturing.",
      us: "Machine tool technology student in the second year of an associate degree, with a 3.7 GPA and 120 hours of shop time. Machined a working bench vise to within 0.05 mm and built a robot that placed 2nd of 9 teams. Works 16 hours a week in an auto parts warehouse, picking orders at 99.6% accuracy. Looking for a registered apprenticeship in manufacturing.",
    },
    education: [
      {
        title: { uk: "BTEC Level 3 National Extended Diploma in Engineering", us: "Associate Degree in Machine Tool Technology" },
        org: { uk: "Kingsway College", us: "Harborview Community College" },
        start: "2025-09",
        current: true,
        grade: { uk: "Predicted grade: Distinction", us: "GPA 3.7" },
        bullets: [
          {
            uk: "Passed 6 first-year units at distinction, including engineering principles and mechanical design",
            us: "Completed 10 courses with a 3.7 GPA, including machining and blueprint reading",
          },
          {
            uk: "Logged 120 hours in the college workshop on lathes, milling machines and welding equipment",
            us: "Logged 120 hours in the college machine shop on lathes, milling machines and welding equipment",
          },
        ],
      },
      {
        title: { uk: "GCSEs, including maths, physics and English", us: "High School Diploma" },
        org: { uk: "Stoneleigh Park Academy", us: "Dorchester High School" },
        end: "2025-06",
        grade: { uk: "7 at grades 9 to 4", us: "GPA 3.4" },
      },
    ],
    projects: [
      {
        title: { uk: "Bench vice", us: "Bench vise" },
        org: { uk: "Kingsway College", us: "Harborview Community College" },
        start: "2025-10",
        end: "2026-01",
        bullets: [
          {
            uk: "Machined a working bench vice from 14 parts on a manual lathe and milling machine, each within 0.05 mm",
            us: "Machined a working bench vise from 14 parts on a manual lathe and milling machine, each within 0.05 mm",
          },
          "Drew all 14 parts using Fusion 360 and produced a full set of technical drawings, marked 92%",
          {
            uk: "Planned 30 machining steps on a job sheet, finishing the vice 2 weeks ahead of the deadline",
            us: "Planned 30 machining steps on a job sheet, finishing the vise 2 weeks ahead of the deadline",
          },
        ],
      },
      {
        title: "Line-following robot",
        org: { uk: "Kingsway College", us: "Harborview Community College" },
        start: "2026-02",
        end: "2026-05",
        bullets: [
          "Built a line-following robot with 2 classmates, wiring the motors, sensors and a controller board",
          "Wrote the control code in Python, tuning the steering to finish a 12-metre track in 19 seconds",
          "Placed 2nd of 9 teams in the college robot race, 4 seconds behind the winning team",
        ],
      },
    ],
    experience: [
      {
        title: { uk: "Warehouse Operative (part-time)", us: "Warehouse Associate (part-time)" },
        org: "Castlegate Auto Parts",
        location: { uk: "Coventry", us: "Boston, MA" },
        start: "2025-03",
        current: true,
        bullets: [
          "Pick and pack around 120 orders a shift, with a picking accuracy of 99.6% over 6 months",
          {
            uk: "Unload 4 lorries a week with a counterbalance forklift, after passing in-house forklift training",
            us: "Unload 4 trucks a week with a counterbalance forklift, after passing in-house forklift training",
          },
          "Found a shelf label error behind 15 wrong picks a month, and fixed it with the team leader",
          {
            uk: "Trained 3 new starters on the handheld scanners and safe lifting in their first week",
            us: "Trained 3 new hires on the handheld scanners and safe lifting in their first week",
          },
        ],
      },
    ],
    skills: ["Manual lathe", "Milling", "Welding", "Technical drawings", "Fusion 360", "Python", "Wiring", "Order picking", "Forklift"],
    names: ["Rory", "Fletcher", "Kingsway", "Harborview", "Castlegate", "Holloway", "Stoneleigh", "Dorchester"],
    letter: {
      job: {
        title: { uk: "Engineering Apprentice", us: "Manufacturing Apprentice" },
        employer: "Holloway Precision",
        advert: {
          uk: `Engineering Apprentice
Holloway Precision, Coventry

Holloway Precision makes machined parts for aircraft and racing cars.

The role
A 4-year Level 3 apprenticeship in machining, with day release to college. You will learn to set and run lathes and milling machines, then move on to computer-controlled machines. Starting pay £9.50 an hour.

What we are looking for
- GCSEs at grade 4 or above in maths and English
- Hands-on experience with tools or machines
- Able to read technical drawings
- Reliable, with a good record of attendance`,
          us: `Manufacturing Apprentice
Holloway Precision, Boston, MA

Holloway Precision makes machined parts for aircraft and race cars.

The role
A 4-year registered apprenticeship in machining, with paid classes at a local college. You will learn to set up and run lathes and milling machines, then move on to computer-controlled machines. Starting pay $20 an hour.

What we are looking for
- A high school diploma or equivalent
- Hands-on experience with tools or machines
- Able to read blueprints and technical drawings
- Reliable, with a good attendance record`,
        },
      },
      reason: "I want to train as a machinist, and I enjoy making precise parts from a drawing.",
      paragraphs: [
        {
          uk: "I am applying for the role of Engineering Apprentice at Holloway Precision. I want to train as a machinist, and I enjoy making precise parts from a drawing.",
          us: "I am applying for the role of Manufacturing Apprentice at Holloway Precision. I want to train as a machinist, and I enjoy making precise parts from a drawing.",
        },
        {
          uk: "I am in the second year of a BTEC Level 3 National Extended Diploma in Engineering at Kingsway College, and I am predicted a distinction. I have logged 120 hours in the college workshop on lathes, milling machines and welding equipment.",
          us: "I am in the second year of an associate degree in machine tool technology at Harborview Community College, with a 3.7 GPA. I have logged 120 hours in the college machine shop on lathes, milling machines and welding equipment.",
        },
        {
          uk: "Your advert asks for hands-on experience with tools or machines. At Kingsway College I machined a working bench vice from 14 parts on a manual lathe and milling machine, each within 0.05 mm. I planned 30 machining steps on a job sheet, finishing the vice 2 weeks ahead of the deadline.",
          us: "Your advert asks for hands-on experience with tools or machines. At Harborview Community College I machined a working bench vise from 14 parts on a manual lathe and milling machine, each within 0.05 mm. I planned 30 machining steps on a job sheet, finishing the vise 2 weeks ahead of the deadline.",
        },
        {
          uk: "Your advert also asks for someone able to read technical drawings. I drew all 14 parts of the vice using Fusion 360 and produced a full set of technical drawings, marked 92%. I also built a line-following robot with 2 classmates, wiring the motors, sensors and a controller board.",
          us: "Your advert also asks for someone able to read blueprints and technical drawings. I drew all 14 parts of the vise using Fusion 360 and produced a full set of technical drawings, marked 92%. I also built a line-following robot with 2 classmates, wiring the motors, sensors and a controller board.",
        },
        {
          uk: "You also ask for someone reliable. At Castlegate Auto Parts I pick and pack around 120 orders a shift, with a picking accuracy of 99.6% over 6 months. I also trained 3 new starters on the handheld scanners and safe lifting in their first week.",
          us: "You also ask for someone reliable. At Castlegate Auto Parts I pick and pack around 120 orders a shift, with a picking accuracy of 99.6% over 6 months. I also trained 3 new hires on the handheld scanners and safe lifting in their first week.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "intern",
    industry: "early-career",
    role: "Marketing Intern",
    level: "student",
    template: "clearline",
    blurb: {
      uk: "A second-year marketing student who runs a society's social media, looking for a summer internship.",
      us: "A sophomore marketing student who runs a club's social media, looking for a summer internship.",
    },
    person: { name: "Freya Holland", email: "freya.holland@example.com", phone: { uk: "07700 900604", us: "(206) 555-0114" }, location: { uk: "Cardiff", us: "Seattle, WA" } },
    profile: {
      uk: "Second-year marketing student at Cardiff Metropolitan University with a first-year average of 68%, looking for a summer internship in 2027. Runs Instagram and TikTok for a 400-member hiking society, and grew its Instagram followers from 600 to 1,900 in a year. Led a team of 4 on a marketing plan for a family bakery, whose email campaign brought in 38 cake orders. Works weekends as a barista, where a loyalty card trial lifted repeat visits by 14%.",
      us: "Sophomore marketing student at Seattle University with a 3.7 GPA, looking for a summer internship in 2027. Runs Instagram and TikTok for a 400-member hiking club, and grew its Instagram followers from 600 to 1,900 in a year. Led a team of 4 on a marketing plan for a family bakery, whose email campaign brought in 38 cake orders. Works weekends as a barista, where a loyalty card trial lifted repeat visits by 14%.",
    },
    experience: [
      {
        title: { uk: "Social Media Officer", us: "Social Media Chair" },
        org: { uk: "Hiking Society, Cardiff Metropolitan University", us: "Hiking Club, Seattle University" },
        location: { uk: "Cardiff", us: "Seattle, WA" },
        start: "2025-10",
        current: true,
        bullets: [
          {
            uk: "Run the society's Instagram and TikTok accounts, posting 4 times a week for 400 members",
            us: "Run the club's Instagram and TikTok accounts, posting 4 times a week for 400 members",
          },
          "Grew Instagram followers from 600 to 1,900 in 12 months with weekly trail videos and member stories",
          "Filled 3 beginner hikes in under 24 hours each with a countdown series of 5 short videos",
          "Track reach and sign-ups in a monthly Excel report that the 8-person committee uses to plan events",
        ],
      },
      {
        title: "Barista (part-time)",
        org: "Blackbird Coffee",
        location: { uk: "Cardiff", us: "Seattle, WA" },
        start: "2025-10",
        current: true,
        bullets: [
          {
            uk: "Serve around 200 customers a shift at weekends in a busy city-centre coffee shop",
            us: "Serve around 200 customers a shift on weekends in a busy downtown coffee shop",
          },
          "Suggested a loyalty card trial to the manager, which lifted repeat visits by 14% in 3 months",
          "Took over the shop's weekly Instagram posts, growing its followers from 900 to 1,400 in 6 months",
        ],
      },
    ],
    projects: [
      {
        title: "Marketing plan for a family bakery",
        org: { uk: "Digital marketing module, Cardiff Metropolitan University", us: "Digital marketing course, Seattle University" },
        start: "2026-02",
        end: "2026-05",
        bullets: [
          {
            uk: "Led a team of 4 to research and write a 20-page marketing plan for a family bakery with 2 shops",
            us: "Led a team of 4 to research and write a 20-page marketing plan for a family bakery with 2 stores",
          },
          {
            uk: "Surveyed 85 customers in the 2 shops and found that 53 of them wanted to order cakes online",
            us: "Surveyed 85 customers in the 2 stores and found that 53 of them wanted to order cakes online",
          },
          "Designed a 6-week email campaign in Mailchimp that brought in 38 cake orders when the owner ran it in June 2026",
          {
            uk: "Presented the plan to the owner and 2 lecturers, graded 76%, the highest mark in a cohort of 60",
            us: "Presented the plan to the owner and 2 professors, graded A, the highest mark in a class of 60",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Marketing Management", us: "Bachelor of Arts in Marketing" },
        org: { uk: "Cardiff Metropolitan University", us: "Seattle University" },
        start: "2025-09",
        current: true,
        grade: { uk: "First-year average: 68%", us: "GPA 3.7" },
        bullets: [
          {
            uk: "Top first-year modules out of 6: digital marketing (74%) and consumer behaviour (71%)",
            us: "Top freshman courses out of 8: digital marketing and consumer behavior, both graded A",
          },
        ],
      },
    ],
    skills: ["Instagram", "TikTok", "Short videos", "Mailchimp", "Email campaigns", "Surveys", "Marketing plans", "Excel", "Presenting"],
    names: ["Freya", "Holland", "Blackbird", "Tidewater", "Instagram", "TikTok"],
    letter: {
      job: {
        title: "Marketing Intern",
        employer: "Tidewater Outdoor",
        advert: {
          uk: `Marketing Intern (summer 2027)
Tidewater Outdoor, Cardiff

Tidewater Outdoor makes walking and camping gear, sold online and in 14 shops.

The role
A paid 10-week internship in our marketing team from June 2027. You will plan social media posts, help with email campaigns and report on what works. Pay £12.60 an hour.

What we are looking for
- A student in the second year of a degree
- Experience running social media accounts
- Experience with email marketing or customer research
- An interest in the outdoors`,
          us: `Marketing Intern (summer 2027)
Tidewater Outdoor, Seattle, WA

Tidewater Outdoor makes hiking and camping gear, sold online and in 14 stores.

The role
A paid 10-week internship on our marketing team starting in June 2027. You will plan social media posts, help with email campaigns and report on what works. Pay $22 an hour.

What we are looking for
- A sophomore or junior in a bachelor's program
- Experience running social media accounts
- Experience with email marketing or customer research
- An interest in the outdoors`,
        },
      },
      reason: "I enjoy hiking, and I want to learn how an outdoor brand plans its social media and email marketing.",
      paragraphs: [
        "I am applying for the role of Marketing Intern at Tidewater Outdoor for summer 2027. I enjoy hiking, and I want to learn how an outdoor brand plans its social media and email marketing.",
        {
          uk: "Your advert asks for experience running social media accounts. As social media officer of a 400-member hiking society, I run the Instagram and TikTok accounts and post 4 times a week. I grew Instagram followers from 600 to 1,900 in 12 months with weekly trail videos and member stories, and I filled 3 beginner hikes in under 24 hours each with a countdown series of 5 short videos.",
          us: "Your advert asks for experience running social media accounts. As social media chair of a 400-member hiking club, I run the Instagram and TikTok accounts and post 4 times a week. I grew Instagram followers from 600 to 1,900 in 12 months with weekly trail videos and member stories, and I filled 3 beginner hikes in under 24 hours each with a countdown series of 5 short videos.",
        },
        {
          uk: "Your advert also asks for experience with email marketing or customer research. For my digital marketing module I led a team of 4 to research and write a 20-page marketing plan for a family bakery with 2 shops. I surveyed 85 customers in the 2 shops and found that 53 of them wanted to order cakes online. I then designed a 6-week email campaign in Mailchimp that brought in 38 cake orders when the owner ran it in June 2026.",
          us: "Your advert also asks for experience with email marketing or customer research. For my digital marketing course I led a team of 4 to research and write a 20-page marketing plan for a family bakery with 2 stores. I surveyed 85 customers in the 2 stores and found that 53 of them wanted to order cakes online. I then designed a 6-week email campaign in Mailchimp that brought in 38 cake orders when the owner ran it in June 2026.",
        },
        "At Blackbird Coffee I suggested a loyalty card trial to the manager, which lifted repeat visits by 14% in 3 months. I also took over the shop's weekly Instagram posts, growing its followers from 900 to 1,400 in 6 months.",
        CLOSE,
      ],
    },
  },
  {
    id: "data-analyst",
    industry: "data",
    role: { uk: "Graduate Data Analyst", us: "Junior Data Analyst" },
    level: "student",
    template: "index",
    blurb: {
      uk: "An economics graduate with a placement year in data analysis and a dissertation built on household data.",
      us: "An economics graduate with a year-long data analytics co-op and a senior thesis built on household data.",
    },
    person: { name: "Adam Kowalski", email: "adam.kowalski@example.com", phone: { uk: "07700 900605", us: "(303) 555-0121" }, location: { uk: "Birmingham", us: "Denver, CO" } },
    profile: {
      uk: "Economics graduate (2:1, University of Birmingham) with a 12-month placement as a data analyst at an energy supplier. Built 6 Tableau dashboards and SQL reports there, and found the 3 billing errors behind 40% of customer complaints. Dissertation used Python to model how energy price rises changed spending in 12,000 households. Looking for a graduate data analyst role.",
      us: "Economics graduate with a 3.6 GPA from the University of Colorado Denver and a 12-month co-op as a data analytics intern at an energy company. Built 6 Tableau dashboards and SQL reports there, and found the 3 billing errors behind 40% of customer complaints. Senior thesis used Python to model how energy price rises changed spending in 12,000 households. Looking for a junior data analyst role.",
    },
    education: [
      {
        title: { uk: "BSc (Hons) Economics with a Placement Year", us: "Bachelor of Science in Economics" },
        org: { uk: "University of Birmingham", us: "University of Colorado Denver" },
        start: "2022-09",
        end: "2026-06",
        grade: { uk: "2:1", us: "GPA 3.6" },
        bullets: [
          {
            uk: "Highest marks out of 24 modules: econometrics (72%) and programming for economists (75%)",
            us: "Top grades out of 40 courses: econometrics and programming for economists, both graded A",
          },
        ],
      },
    ],
    projects: [
      {
        title: { uk: "Dissertation: energy prices and household spending", us: "Senior thesis: energy prices and household spending" },
        org: { uk: "University of Birmingham", us: "University of Colorado Denver" },
        start: "2025-09",
        end: "2026-04",
        bullets: [
          "Modelled how energy price rises from 2021 to 2024 changed spending in 12,000 households, using public survey data",
          "Cleaned and joined 4 data sets in Python and ran regression models to compare income groups",
          "Found that households in the lowest income band cut food spending by 9%, against 3% for the top band",
          {
            uk: "Wrote up the results in a 10,000-word dissertation, graded 74%",
            us: "Wrote up the results in a 40-page senior thesis, graded A",
          },
        ],
      },
    ],
    experience: [
      {
        title: { uk: "Data Analyst (Placement Year)", us: "Data Analytics Intern (Co-op)" },
        org: "Brightmere Energy",
        location: { uk: "Solihull", us: "Denver, CO" },
        start: "2024-07",
        end: "2025-06",
        bullets: [
          "Built 6 Tableau dashboards on customer complaints, used by 14 managers in every weekly service review",
          "Wrote SQL queries joining billing and complaints data for 220,000 customers, replacing a 2-day monthly Excel report",
          "Found that 40% of complaints came from 3 billing errors; the billing team fixed them, cutting complaints by 18% in 4 months",
          "Cleaned 3 years of smart meter data in Python, fixing 12,000 duplicate and missing records before a pricing review",
          "Presented findings to the head of customer service each month in a 15-minute summary",
        ],
      },
      {
        title: "Maths Tutor (part-time)",
        org: "Brightpath Tutoring",
        location: { uk: "Birmingham", us: "Denver, CO" },
        start: "2022-10",
        end: "2024-06",
        bullets: [
          {
            uk: "Explained algebra and statistics to 6 pupils a week in online lessons, raising their average mock exam grade from 4 to 6",
            us: "Explained algebra and statistics to 6 high school students a week in online lessons, raising their average test score from 68% to 81%",
          },
          "Wrote 30 practice worksheets on statistics and algebra, now used by 4 other tutors",
          {
            uk: "Tracked each pupil's progress in a shared spreadsheet and sent a short report to parents every 4 weeks",
            us: "Tracked each student's progress in a shared spreadsheet and sent a short report to parents every 4 weeks",
          },
        ],
      },
    ],
    skills: ["SQL", "Python", "Tableau", "Excel", "Dashboards", "Data cleaning", "Regression", "Econometrics", "Statistics", "Presenting findings"],
    names: ["Kowalski", "Brightmere", "Brightpath", "Larkspur", "Solihull"],
    letter: {
      job: {
        title: { uk: "Graduate Data Analyst", us: "Junior Data Analyst" },
        employer: "Larkspur Water",
        advert: {
          uk: `Graduate Data Analyst
Larkspur Water, Birmingham

Larkspur Water supplies water to 1.8 million homes across the Midlands.

The role
You will join our customer insight team of 8, building reports and dashboards that help us cut complaints and fix problems faster. Salary £30,000.

What we are looking for
- A degree in economics, maths, statistics or a related subject
- Skills in SQL and Python
- Experience building dashboards in Tableau or a similar tool
- Able to explain findings to people without a technical background`,
          us: `Junior Data Analyst
Larkspur Water, Denver, CO

Larkspur Water supplies water to 1.8 million people across the Denver area.

The role
You will join our customer insights team of 8, building reports and dashboards that help us cut complaints and fix problems faster. Salary $68,000.

What we are looking for
- A bachelor's degree in economics, math, statistics or a related field
- Skills in SQL and Python
- Experience building dashboards in Tableau or a similar tool
- Able to explain findings to people without a technical background`,
        },
      },
      reason: {
        uk: "I enjoyed finding the causes of customer complaints on my placement, and I want to keep working on problems like that.",
        us: "I enjoyed finding the causes of customer complaints on my co-op, and I want to keep working on problems like that.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Graduate Data Analyst at Larkspur Water. I enjoyed finding the causes of customer complaints on my placement, and I want to keep working on problems like that.",
          us: "I am applying for the role of Junior Data Analyst at Larkspur Water. I enjoyed finding the causes of customer complaints on my co-op, and I want to keep working on problems like that.",
        },
        {
          uk: "I have a 2:1 in economics from the University of Birmingham, with my highest marks in econometrics (72%) and programming for economists (75%). In my placement year at Brightmere Energy I wrote SQL queries joining billing and complaints data for 220,000 customers, replacing a 2-day monthly Excel report.",
          us: "I have a Bachelor of Science in Economics from the University of Colorado Denver, with a 3.6 GPA. My top grades were in econometrics and programming for economists, both graded A. As a data analytics intern at Brightmere Energy, I wrote SQL queries joining billing and complaints data for 220,000 customers, replacing a 2-day monthly Excel report.",
        },
        "Your advert asks for experience building dashboards. I built 6 Tableau dashboards on customer complaints, used by 14 managers in every weekly service review. I also found that 40% of complaints came from 3 billing errors; the billing team fixed them, cutting complaints by 18% in 4 months. I also cleaned 3 years of smart meter data in Python, fixing 12,000 duplicate and missing records before a pricing review.",
        {
          uk: "Your advert also asks for someone able to explain findings to people without a technical background. I presented findings to the head of customer service each month in a 15-minute summary. As a part-time maths tutor, I explained algebra and statistics to 6 pupils a week in online lessons. For my dissertation I used Python to model how energy price rises from 2021 to 2024 changed spending in 12,000 households.",
          us: "Your advert also asks for someone able to explain findings to people without a technical background. I presented findings to the head of customer service each month in a 15-minute summary. As a part-time math tutor, I explained algebra and statistics to 6 high school students a week in online lessons. For my senior thesis I used Python to model how energy price rises from 2021 to 2024 changed spending in 12,000 households.",
        },
        CLOSE,
      ],
    },
  },
];
