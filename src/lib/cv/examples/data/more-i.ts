import type { ExampleSpec } from "../types";

/** Phase 3, batch 1 (28 Nov 2026): roles the industry packs list that had no example. */
export const MORE_I: ExampleSpec[] = [
  {
    id: "call-centre-agent",
    industry: "customer-service",
    role: { uk: "Call Centre Agent", us: "Call Center Agent" },
    level: "early",
    template: "clearline",
    blurb: {
      uk: "A call centre agent two and a half years into answering home and motor insurance calls, with first contact resolution and quality scores above target.",
      us: "A call center agent two and a half years into answering home and auto insurance calls, with first contact resolution and quality scores above target.",
    },
    person: { name: "Shannon Dunmore", email: "shannon.dunmore@example.com", phone: { uk: "07700 900653", us: "(520) 555-0175" }, location: { uk: "Sunderland", us: "Tucson, AZ" } },
    profile: {
      uk: "Call centre agent with two and a half years at a home and motor insurer, answering 70 to 80 inbound calls a day about claims, renewals and policy changes. Keeps a first contact resolution rate of 86% against a centre target of 80%, and has averaged 94% in monthly call quality checks. Handles around 10 complaints a week and holds the Award in General Insurance from the Chartered Insurance Institute. Before that, took bookings and payments by phone and in person at a busy leisure centre.",
      us: "Call center agent with two and a half years at a home and auto insurer, answering 70 to 80 inbound calls a day about claims, renewals and policy changes. Keeps a first contact resolution rate of 86% against a center target of 80%, and has averaged 94% in monthly call quality reviews. Handles around 10 complaints a week and holds an Arizona property and casualty insurance license. Before that, took bookings and payments by phone and in person at a busy recreation center.",
    },
    experience: [
      {
        title: { uk: "Call Centre Agent", us: "Call Center Agent" },
        org: "Cresthaven Insurance",
        location: { uk: "Sunderland", us: "Tucson, AZ" },
        start: "2024-05",
        current: true,
        bullets: [
          {
            uk: "Answer 70 to 80 inbound calls a day from home and motor insurance customers about claims, renewals and policy changes, for 400,000 policyholders",
            us: "Answer 70 to 80 inbound calls a day from home and auto insurance customers about claims, renewals and policy changes, for 400,000 policyholders",
          },
          "Resolve 86% of calls at first contact, against a centre target of 80%, by making policy changes and claim updates during the call instead of passing them to the back office",
          {
            uk: "Averaged 94% in monthly call quality checks over 18 months against a pass mark of 85%, with 2 calls used as examples in training for new starters",
            us: "Averaged 94% in monthly call quality reviews over 18 months against a passing score of 85%, with 2 calls used as examples in training for new hires",
          },
          {
            uk: "Open 15 to 20 new motor claims a day, booking recovery trucks, repairs and hire cars before the call ends",
            us: "Open 15 to 20 new auto claims a day, booking tow trucks, repairs and rental cars before the call ends",
          },
          {
            uk: "Take around 10 complaints a week, closing 7 in 10 within 3 working days and passing the rest to the complaints team with full notes",
            us: "Take around 10 complaints a week, closing 7 in 10 within 3 business days and passing the rest to the complaints team with full notes",
          },
          {
            uk: "Cut average handling time from 8.5 to 6.5 minutes in a year by building notes templates in the policy system, with quality scores staying above 90%",
            us: "Cut average handle time from 8.5 to 6.5 minutes in a year by building notes templates in the policy system, with quality scores staying above 90%",
          },
        ],
      },
      {
        title: { uk: "Leisure Centre Receptionist", us: "Front Desk Associate" },
        org: { uk: "Hollinsworth Leisure Centre", us: "Hollinsworth Recreation Center" },
        location: { uk: "Sunderland", us: "Tucson, AZ" },
        start: "2022-09",
        end: "2024-04",
        bullets: [
          "Answered around 40 phone calls a day about class bookings, memberships and swimming lessons",
          {
            uk: "Took payments of up to £3,000 a day by card and cash, balancing the till at close with no unexplained differences in 18 months",
            us: "Took payments of up to $3,500 a day by card and cash, balancing the register at close with no shortages in 18 months",
          },
          {
            uk: "Signed up 8 to 10 new members a week, beating the monthly sales target in 14 of 20 months",
            us: "Signed up 8 to 10 new members a week, beating the monthly sales goal in 14 of 20 months",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BTEC Level 3 National Extended Diploma in Business", us: "High School Diploma" },
        org: { uk: "Marshfield College", us: "Marshfield High School" },
        location: { uk: "Sunderland", us: "Tucson, AZ" },
        end: "2022",
        grade: { uk: "Distinction, Distinction, Merit", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Award in General Insurance", us: "Property and Casualty Insurance License" },
        org: { uk: "Chartered Insurance Institute", us: "Arizona Department of Insurance and Financial Institutions" },
        end: "2024",
      },
    ],
    skills: [
      "Inbound calls",
      "First contact resolution",
      "Call quality",
      { uk: "Motor claims", us: "Auto claims" },
      "Policy changes",
      "Renewals",
      "Complaints",
      { uk: "Average handling time", us: "Average handle time" },
      "Card and cash payments",
    ],
    names: ["Shannon", "Dunmore", "Cresthaven", "Hollinsworth", "Marshfield", "Larchway", "Sunderland", "Tucson"],
    letter: {
      job: {
        title: { uk: "Claims Call Centre Agent", us: "Claims Call Center Agent" },
        employer: "Larchway Mutual",
        advert: {
          uk: `Claims Call Centre Agent
Larchway Mutual, Sunderland

Larchway Mutual insures 250,000 homes and cars across the north of England and is owned by its members.

The role
Join our claims team to take first notification of loss calls from members after a car accident, a flood or a break-in, and keep them updated until the claim is settled.

What we are looking for
- At least 1 year in an insurance call centre
- A strong record of resolving calls at first contact
- High call quality scores
- Experience handling complaints
- The CII Award in General Insurance, or willingness to study for it

Pay £24,800 a year, with hybrid working after training`,
          us: `Claims Call Center Agent
Larchway Mutual, Tucson, AZ

Larchway Mutual insures 250,000 homes and cars across Arizona and New Mexico and is owned by its policyholders.

The role
Join our claims team to take first notice of loss calls from policyholders after a car accident, a flood or a break-in, and keep them updated until the claim is settled.

What we are looking for
- At least 1 year in an insurance call center
- A strong record of resolving calls at first contact
- High call quality scores
- Experience handling complaints
- An Arizona property and casualty license, or willingness to obtain one

Pay $21.50 an hour, with a hybrid schedule after training`,
        },
      },
      reason: "I want to spend all my time on claims calls, because helping someone just after a car accident or a flood is the part of my job I value most.",
      paragraphs: [
        {
          uk: "Helping someone just after a car accident or a flood is the part of my job I value most. That is why I would like to join Larchway Mutual as a Claims Call Centre Agent, where I could spend all my time on claims calls.",
          us: "Helping someone just after a car accident or a flood is the part of my job I value most. That is why I would like to join Larchway Mutual as a Claims Call Center Agent, where I could spend all my time on claims calls.",
        },
        {
          uk: "At Cresthaven Insurance I answer 70 to 80 inbound calls a day from home and motor insurance customers about claims, renewals and policy changes. I resolve 86% of calls at first contact, against a centre target of 80%, by making policy changes and claim updates during the call instead of passing them to the back office.",
          us: "At Cresthaven Insurance I answer 70 to 80 inbound calls a day from home and auto insurance customers about claims, renewals and policy changes. I resolve 86% of calls at first contact, against a center target of 80%, by making policy changes and claim updates during the call instead of passing them to the back office.",
        },
        {
          uk: "Your advert asks for high call quality scores. I have averaged 94% in monthly call quality checks over 18 months against a pass mark of 85%, with 2 calls used as examples in training for new starters. I also cut average handling time from 8.5 to 6.5 minutes in a year by building notes templates in the policy system.",
          us: "Your advert asks for high call quality scores. I have averaged 94% in monthly call quality reviews over 18 months against a passing score of 85%, with 2 calls used as examples in training for new hires. I also cut average handle time from 8.5 to 6.5 minutes in a year by building notes templates in the policy system.",
        },
        {
          uk: "You are also looking for experience handling complaints. I take around 10 complaints a week, closing 7 in 10 within 3 working days and passing the rest to the complaints team with full notes. Each day I also open 15 to 20 new motor claims, booking recovery trucks, repairs and hire cars before the call ends. I hold the Award in General Insurance from the Chartered Insurance Institute.",
          us: "You are also looking for experience handling complaints. I take around 10 complaints a week, closing 7 in 10 within 3 business days and passing the rest to the complaints team with full notes. Each day I also open 15 to 20 new auto claims, booking tow trucks, repairs and rental cars before the call ends. I hold an Arizona property and casualty insurance license.",
        },
        {
          uk: "Thank you for considering my application. My CV is attached, and I would be glad to talk more about the role.",
          us: "Thank you for considering my application. My resume is attached, and I would be glad to talk more about the role.",
        },
      ],
    },
  },
  {
    id: "bartender",
    industry: "hospitality",
    role: "Bartender",
    level: "student",
    template: "sapling",
    blurb: {
      uk: "A final-year history student who works Friday and Saturday nights in a busy cocktail bar and holds a personal licence.",
      us: "A third-year history student who works Friday and Saturday nights in a busy cocktail bar and holds TIPS certification.",
    },
    person: { name: "Theo Ogunbiyi", email: "theo.ogunbiyi@example.com", phone: { uk: "07700 900654", us: "(480) 555-0176" }, location: { uk: "Nottingham", us: "Tempe, AZ" } },
    profile: {
      uk: "Final-year history student with two years of part-time bar work, now one of 4 bartenders on Friday and Saturday nights at a busy 120-capacity cocktail bar that serves up to 400 guests a night. Makes up to 150 cocktails a shift from a menu of 20, and created 2 drinks for the autumn menu that sold 900 in 10 weeks. Holds a personal licence, checks ID under the bar's Challenge 25 policy and balances the tills at close.",
      us: "Third-year history student with two years of part-time bar work, now one of 4 bartenders on Friday and Saturday nights at a busy 120-capacity cocktail bar that serves up to 400 guests a night. Makes up to 150 cocktails a shift from a menu of 20, and created 2 drinks for the fall menu that sold 900 in 10 weeks. Holds Training for Intervention Procedures (TIPS) certification, checks ID and balances the registers at close.",
    },
    education: [
      {
        title: { uk: "BA (Hons) History", us: "Bachelor of Arts in History" },
        org: { uk: "University of Nottingham", us: "Arizona State University" },
        start: "2024-09",
        current: true,
        grade: { uk: "Second-year average of 67%", us: "GPA 3.6" },
      },
      {
        title: { uk: "A levels in History, English Literature and Economics", us: "High School Diploma" },
        org: { uk: "Holmefield Sixth Form College", us: "Holmefield High School" },
        location: { uk: "Lincoln", us: "Flagstaff, AZ" },
        end: "2024",
        grade: { uk: "A, A, B", us: "GPA 3.8" },
      },
    ],
    experience: [
      {
        title: "Bartender (part-time)",
        org: "The Gilded Still",
        location: { uk: "Nottingham", us: "Tempe, AZ" },
        start: "2024-10",
        current: true,
        bullets: [
          "Make up to 150 cocktails a shift from a menu of 20, to the bar's recipes and in under 3 minutes a drink at peak",
          {
            uk: "Created 2 drinks for the autumn menu with the bar manager, which sold 900 in 10 weeks",
            us: "Created 2 drinks for the fall menu with the bar manager, which sold 900 in 10 weeks",
          },
          {
            uk: "Check ID under the Challenge 25 policy, refusing around 15 people a month, with no sales to under-18s in 2 test purchases by Trading Standards",
            us: "Check the ID of every guest who looks under 30, refusing around 15 people a month, with no sales to minors in 2 compliance checks by the state liquor department",
          },
          {
            uk: "Count and balance 2 tills at close, handling up to £6,000 in takings on a Saturday night with no unexplained differences in 12 months",
            us: "Count and balance 2 registers at close, handling up to $7,500 in sales on a Saturday night with no shortages in 12 months",
          },
          {
            uk: "Count around 180 lines of spirits, wine and beer with the bar manager each Sunday, and pour every spirit with a measure, which cut stock losses from 4% to 2% in a year",
            us: "Count around 180 bottles of spirits, wine and beer with the bar manager each Sunday, and pour every spirit with a jigger, which cut inventory losses from 4% to 2% in a year",
          },
        ],
      },
      {
        title: { uk: "Waiter (part-time)", us: "Server (part-time)" },
        org: "Basil and Thyme",
        location: { uk: "Lincoln", us: "Flagstaff, AZ" },
        start: "2023-05",
        end: "2024-08",
        bullets: [
          {
            uk: "Served 8 to 10 tables a shift at weekend lunchtimes in a 70-cover family restaurant",
            us: "Served 8 to 10 tables a shift at weekend lunches in a 70-seat family restaurant",
          },
          {
            uk: "Raised the average bill per table from £38 to £44 in 6 months by upselling desserts and coffees",
            us: "Raised the average check per table from $46 to $53 in 6 months by upselling desserts and coffee",
          },
          {
            uk: "Trained 3 new waiters on the menu, allergens and handheld ordering, each working alone within 3 shifts",
            us: "Trained 3 new servers on the menu, allergens and handheld ordering, each working alone within 3 shifts",
          },
        ],
      },
    ],
    certificates: [
      {
        title: { uk: "Personal Licence", us: "TIPS On-Premise Certification" },
        org: { uk: "Nottingham City Council", us: "Health Communications Inc" },
        end: "2025",
      },
      {
        title: { uk: "Level 2 Award in Food Safety in Catering", us: "Title 4 Basic Liquor Law Training" },
        org: { uk: "Highfield Qualifications", us: "Arizona Department of Liquor Licenses and Control" },
        end: "2024",
      },
    ],
    skills: [
      "Cocktails",
      "Spirits",
      { uk: "Till balancing", us: "Register balancing" },
      { uk: "Challenge 25 ID checks", us: "ID checks" },
      { uk: "Stock counts", us: "Inventory counts" },
      "Drink recipes",
      "Allergens",
      { uk: "Training new waiters", us: "Training new servers" },
      "Upselling",
    ],
    names: ["Theo", "Ogunbiyi", "Gilded", "Holmefield", "Wyvern", "Nottingham", "Lincoln", "Tempe", "Flagstaff", "Highfield"],
    letter: {
      job: {
        title: "Weekend Bartender (part-time)",
        employer: "The Wyvern Rooms",
        advert: {
          uk: `Weekend Bartender (part-time)
The Wyvern Rooms, Nottingham

The Wyvern Rooms is a 200-capacity cocktail bar in Nottingham city centre, open until 2am on Fridays and Saturdays.

The role
You will make cocktails and serve guests on Friday and Saturday nights, with shifts that fit around study. Shortlisted applicants will be invited to a paid trial shift.

What we are looking for
- At least 1 year of bar work in a busy venue
- Confidence making classic and house cocktails at speed
- A personal licence, or willingness to gain one
- Careful cash handling and ID checks under Challenge 25
- Help with weekly stock counts

Pay £12.60 an hour, plus an equal share of tips`,
          us: `Weekend Bartender (part-time)
The Wyvern Rooms, Tempe, AZ

The Wyvern Rooms is a 200-capacity cocktail bar in downtown Tempe, open until 2am on Fridays and Saturdays.

The role
You will make cocktails and serve guests on Friday and Saturday nights, with shifts that fit around classes. Shortlisted applicants will be invited to a paid trial shift.

What we are looking for
- At least 1 year of bar experience in a busy venue
- Confidence making classic and house cocktails at speed
- TIPS certification and Arizona Title 4 training
- Careful cash handling and ID checks
- Help with weekly inventory counts

Pay $16.00 an hour, plus tips`,
        },
      },
      reason: {
        uk: "I want weekend bar work that fits around my final year, in a bigger cocktail bar where I can make a wider range of drinks.",
        us: "I want weekend bar work that fits around my classes, in a bigger cocktail bar where I can make a wider range of drinks.",
      },
      paragraphs: [
        {
          uk: "With two years of Friday and Saturday nights at a busy cocktail bar, I would like to be considered for the Weekend Bartender role at The Wyvern Rooms. I want weekend bar work that fits around my final year, in a bigger cocktail bar where I can make a wider range of drinks.",
          us: "With two years of Friday and Saturday nights at a busy cocktail bar, I would like to be considered for the Weekend Bartender role at The Wyvern Rooms. I want weekend bar work that fits around my classes, in a bigger cocktail bar where I can make a wider range of drinks.",
        },
        {
          uk: "At The Gilded Still I am one of 4 bartenders on Friday and Saturday nights at a busy 120-capacity cocktail bar that serves up to 400 guests a night. I make up to 150 cocktails a shift from a menu of 20, to the bar's recipes and in under 3 minutes a drink at peak. I also created 2 drinks for the autumn menu with the bar manager, which sold 900 in 10 weeks.",
          us: "At The Gilded Still I am one of 4 bartenders on Friday and Saturday nights at a busy 120-capacity cocktail bar that serves up to 400 guests a night. I make up to 150 cocktails a shift from a menu of 20, to the bar's recipes and in under 3 minutes a drink at peak. I also created 2 drinks for the fall menu with the bar manager, which sold 900 in 10 weeks.",
        },
        {
          uk: "Your advert asks for careful cash handling and ID checks under Challenge 25. I check ID under the Challenge 25 policy, refusing around 15 people a month, with no sales to under-18s in 2 test purchases by Trading Standards. At close I count and balance 2 tills, handling up to £6,000 in takings on a Saturday night with no unexplained differences in 12 months. I also hold a personal licence.",
          us: "Your advert asks for careful cash handling and ID checks. I check the ID of every guest who looks under 30, refusing around 15 people a month, with no sales to minors in 2 compliance checks by the state liquor department. At close I count and balance 2 registers, handling up to $7,500 in sales on a Saturday night with no shortages in 12 months. I also hold Training for Intervention Procedures (TIPS) certification and Title 4 Basic Liquor Law Training from the Arizona Department of Liquor Licenses and Control.",
        },
        {
          uk: "You also mention help with weekly stock counts. Each Sunday I count around 180 lines of spirits, wine and beer with the bar manager. I also pour every spirit with a measure, which cut stock losses from 4% to 2% in a year.",
          us: "You also mention help with weekly inventory counts. Each Sunday I count around 180 bottles of spirits, wine and beer with the bar manager. I also pour every spirit with a jigger, which cut inventory losses from 4% to 2% in a year.",
        },
        {
          uk: "My CV is attached, and I would welcome a trial shift. Thank you for your time.",
          us: "My resume is attached, and I would welcome a trial shift. Thank you for your time.",
        },
      ],
    },
  },
  {
    id: "visual-merchandiser",
    industry: "retail",
    role: "Visual Merchandiser",
    level: "experienced",
    template: "portfolio",
    blurb: {
      uk: "A visual merchandiser with 9 years in fashion and home furnishings, who plans the floor sets and windows for a 45-store fashion chain.",
      us: "A visual merchandiser with 9 years in fashion and home decor, who plans the floor sets and windows for a 45-store fashion chain.",
    },
    person: {
      name: "Nisha Kapoor",
      email: "nisha.kapoor@example.com",
      phone: { uk: "07700 900655", us: "(734) 555-0177" },
      location: { uk: "Manchester", us: "Ann Arbor, MI" },
      links: ["portfolio.example.com/nishakapoor"],
    },
    profile: {
      uk: "Visual merchandiser with 9 years in fashion and home furnishings retail, the last 4 planning floor sets and window schemes for a 45-store fashion chain. Writes the guide that stores follow for each of 8 floor sets a year, and checks it on around 60 store visits. Raised denim sales by 18% in 6 weeks in 2025 with a layout that moved denim to the front of each store. Leads 45 store visual merchandising champions and manages a prop budget of £85,000 a year.",
      us: "Visual merchandiser with 9 years in fashion and home decor retail, the last 4 planning floor sets and window displays for a 45-store fashion chain. Writes the guide that stores follow for each of 8 floor sets a year, and checks it on around 60 store visits. Raised denim sales by 18% in 6 weeks in 2025 with a layout that moved denim to the front of each store. Leads 45 store visual merchandising champions and manages a prop budget of $110,000 a year.",
    },
    experience: [
      {
        title: "Senior Visual Merchandiser",
        org: "Hensley & Vane",
        location: { uk: "Manchester", us: "Ann Arbor, MI" },
        start: "2022-08",
        current: true,
        bullets: [
          "Plan 8 floor sets a year for 45 stores, from mannequin looks to fixture layouts drawn in SketchUp, working 12 weeks ahead with the buying and planning teams",
          "Write a visual merchandising guide of 30 to 40 pages in Adobe InDesign for each floor set, so stores can complete the change in one night",
          "Raised denim sales by 18% in 6 weeks in 2025 by moving denim from the back wall to the front of each store",
          {
            uk: "Designed 24 window schemes in 4 years on a prop budget of £85,000 a year, reusing around 40% of props between schemes",
            us: "Designed 24 window displays in 4 years on a prop budget of $110,000 a year, reusing around 40% of props between displays",
          },
          "Visit around 60 stores a year to check floor sets, raising average compliance scores from 78% to 92% in 2 years",
          "Lead 45 store visual merchandising champions, with 2 training days a year and a monthly video call",
        ],
      },
      {
        title: "Visual Merchandiser, Flagship Store",
        org: "Hensley & Vane",
        location: { uk: "Manchester", us: "Detroit, MI" },
        start: "2019-03",
        end: "2022-07",
        bullets: [
          "Changed the flagship windows every 4 weeks and set each floor set across 3 floors and 18,000 square feet",
          "Built the model floor set each season, photographed for the guides sent to around 40 stores",
          {
            uk: "Raised sales of accessories by 22% in a year by moving them beside the fitting rooms and tills",
            us: "Raised sales of accessories by 22% in a year by moving them beside the fitting rooms and registers",
          },
        ],
      },
      {
        title: { uk: "Visual Merchandising Assistant", us: "Visual Merchandising Associate" },
        org: "Oriel Home",
        location: { uk: "Stockport", us: "Novi, MI" },
        start: "2017-07",
        end: "2019-02",
        bullets: [
          "Changed 6 room sets of furniture, lighting and tableware each quarter in a 25,000 square foot store",
          "Raised Christmas range sales by 15% on the year before with a themed table display at the entrance",
          "Updated price and promotion signs for around 400 products a week, with no pricing errors in 4 audits",
        ],
      },
    ],
    projects: [
      {
        title: { uk: "Christmas Window Scheme", us: "Holiday Window Displays" },
        org: "Hensley & Vane",
        end: "2025",
        bullets: [
          "Designed a winter forest window scheme in 3 kit sizes for 45 stores, so each store could fit it to its own windows",
          {
            uk: "Kept the scheme to £22,000 against a budget of £30,000 by reusing branches and lighting from the year before",
            us: "Kept the displays to $28,000 against a budget of $38,000 by reusing branches and lighting from the year before",
          },
          {
            uk: "Tracked a 9% rise in footfall in the 6 weeks after launch, compared with the same weeks in 2024",
            us: "Tracked a 9% rise in foot traffic in the 6 weeks after launch, compared with the same weeks in 2024",
          },
        ],
      },
      {
        title: { uk: "Flagship Store Refit", us: "Flagship Store Remodel" },
        org: "Hensley & Vane",
        end: "2024",
        bullets: [
          {
            uk: "Planned the new layout of the 3-floor flagship with the store design team, moving the fitting rooms to the centre of each floor",
            us: "Planned the new layout of the 3-floor flagship with the store design team, moving the fitting rooms to the center of each floor",
          },
          "Installed the new floor sets over 4 nights, so the store stayed open every day of the refit",
          "Raised sales per square foot by 12% in the 6 months after the refit, compared with the same months a year before",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Fashion Promotion", us: "Bachelor of Science in Fashion Merchandising and Design" },
        org: { uk: "Manchester Metropolitan University", us: "Central Michigan University" },
        end: "2017",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    skills: [
      "Floor sets",
      { uk: "Window schemes", us: "Window displays" },
      "Visual merchandising guides",
      "Fixture layouts",
      "SketchUp",
      "Adobe InDesign",
      "Prop budgets",
      "Store visits",
      "Mannequins",
      "Room sets",
    ],
    names: ["Nisha", "Kapoor", "Hensley", "Vane", "Oriel", "Thistledown", "SketchUp", "InDesign", "Stockport", "Novi", "Arbor"],
    letter: {
      job: {
        title: "Senior Visual Merchandiser",
        employer: "Thistledown Home",
        advert: {
          uk: `Senior Visual Merchandiser
Thistledown Home, Manchester (head office, with store travel)

Thistledown Home sells furniture, lighting and tableware from 60 stores across the UK.

The role
You will plan the room sets, floor layouts and windows for all 60 stores, write the guides that store teams follow, and visit stores to check each launch.

What we are looking for
- At least 5 years in visual merchandising for a retail chain
- Experience planning floor sets across a group of stores
- Clear written visual merchandising guides
- A record of layouts that raise sales
- Experience training store teams

Please include a portfolio of your work with your application.

Salary £38,000 to £42,000, plus a car allowance`,
          us: `Senior Visual Merchandiser
Thistledown Home, Ann Arbor, MI (headquarters, with store travel)

Thistledown Home sells furniture, lighting and tableware from 60 stores across the Midwest.

The role
You will plan the room sets, floor layouts and windows for all 60 stores, write the guides that store teams follow, and visit stores to check each launch.

What we are looking for
- At least 5 years in visual merchandising for a retail chain
- Experience planning floor sets across a group of stores
- Clear written visual merchandising guides
- A record of layouts that raise sales
- Experience training store teams

Please include a portfolio of your work with your application.

Salary $68,000 to $76,000, plus a car allowance`,
        },
      },
      reason: {
        uk: "I want to return to home furnishings, where room sets show customers how products work together at home, and keep planning floor sets for a whole chain.",
        us: "I want to return to home decor, where room sets show customers how products work together at home, and keep planning floor sets for a whole chain.",
      },
      paragraphs: [
        {
          uk: "For the last 4 years I have planned the floor sets and window schemes for 45 stores at Hensley & Vane, and I would like to bring that work to Thistledown Home as its Senior Visual Merchandiser. I want to return to home furnishings, where room sets show customers how products work together at home.",
          us: "For the last 4 years I have planned the floor sets and window displays for 45 stores at Hensley & Vane, and I would like to bring that work to Thistledown Home as its Senior Visual Merchandiser. I want to return to home decor, where room sets show customers how products work together at home.",
        },
        "Your advert asks for experience planning floor sets across a group of stores. At Hensley & Vane I plan 8 floor sets a year for 45 stores, from mannequin looks to fixture layouts drawn in SketchUp, working 12 weeks ahead with the buying and planning teams. For each one I write a visual merchandising guide of 30 to 40 pages in Adobe InDesign, so stores can complete the change in one night.",
        {
          uk: "You are also looking for a record of layouts that raise sales. In 2025 I raised denim sales by 18% in 6 weeks by moving denim from the back wall to the front of each store. In the flagship store I raised sales of accessories by 22% in a year by moving them beside the fitting rooms and tills.",
          us: "You are also looking for a record of layouts that raise sales. In 2025 I raised denim sales by 18% in 6 weeks by moving denim from the back wall to the front of each store. In the flagship store I raised sales of accessories by 22% in a year by moving them beside the fitting rooms and registers.",
        },
        "Your advert also asks for experience training store teams. I lead 45 store visual merchandising champions, with 2 training days a year and a monthly video call. I also visit around 60 stores a year to check floor sets, raising average compliance scores from 78% to 92% in 2 years. Before that, at Oriel Home, I changed 6 room sets of furniture, lighting and tableware each quarter in a 25,000 square foot store.",
        {
          uk: "My CV and portfolio are attached, and I would welcome the chance to talk you through my work. Thank you for your time.",
          us: "My resume and portfolio are attached, and I would welcome the chance to talk you through my work. Thank you for your time.",
        },
      ],
    },
  },
  {
    id: "support-worker",
    industry: "care",
    role: { uk: "Support Worker", us: "Direct Support Professional" },
    level: "early",
    template: "ward",
    blurb: {
      uk: "A support worker three years into supporting adults with learning disabilities and autism in a supported living house.",
      us: "A direct support professional three years into supporting adults with intellectual and developmental disabilities in a group home.",
    },
    person: { name: "Kwame Asante", email: "kwame.asante@example.com", phone: { uk: "07700 900656", us: "(952) 555-0178" }, location: { uk: "Norwich", us: "Bloomington, MN" } },
    profile: {
      uk: "Support worker with 3 years in supported living for adults with learning disabilities and autism, and key worker for 2 of the 4 tenants in a shared house. Gives medication to 4 tenants twice a day, with no errors found in 6 audits over 18 months. Coached one tenant into a volunteering role 2 days a week, and cut another tenant's incidents of distress from around 12 to 3 a month. Holds the Care Certificate and a Level 2 Diploma in Care, and is working towards the Level 3 Diploma in Adult Care.",
      us: "Direct support professional with 3 years in a group home for adults with intellectual and developmental disabilities, and lead staff member for 2 of its 4 residents. Passes medication to 4 residents twice a day, with no errors found in 6 audits over 18 months. Coached one resident into a volunteer job 2 days a week, and cut another resident's incidents of distress from around 12 to 3 a month. Certified in first aid and cardiopulmonary resuscitation (CPR), with an associate degree in human services.",
    },
    experience: [
      {
        title: { uk: "Support Worker", us: "Direct Support Professional" },
        org: { uk: "Cobbleway Supported Living", us: "Cobbleway Community Services" },
        location: { uk: "Norwich", us: "Bloomington, MN" },
        start: "2023-09",
        current: true,
        bullets: [
          {
            uk: "Support 4 adults with learning disabilities and autism in a shared house with cooking, budgeting, personal care and trips out, on days, evenings and 1 sleep-in night a week",
            us: "Support 4 adults with intellectual and developmental disabilities in a group home with cooking, budgeting, personal care and outings, on day, evening and overnight shifts",
          },
          {
            uk: "Give medication to 4 tenants twice a day and record it on medication administration records, with no errors found in 6 audits over 18 months",
            us: "Pass medication to 4 residents twice a day and chart it on medication administration records, with no errors found in 6 audits over 18 months",
          },
          {
            uk: "Review the support plans of 2 tenants as their key worker every 3 months, with them and their families, setting 5 new goals in 2025",
            us: "Review the support plans of 2 residents as their lead staff member every 3 months, with them and their families, setting 5 new goals in 2025",
          },
          {
            uk: "Cut incidents of distress for one tenant from around 12 to 3 a month in 6 months, using the positive behaviour support plan and a picture timetable",
            us: "Cut incidents of distress for one resident from around 12 to 3 a month in 6 months, using the positive behavior support plan and a picture schedule",
          },
          {
            uk: "Coached one tenant to find and start a volunteering role at a garden centre 2 days a week, then gave 8 weeks of travel training so the tenant now takes the bus there alone",
            us: "Coached one resident to find and start a volunteer job at a garden center 2 days a week, then gave 8 weeks of travel training so the resident now rides the bus there alone",
          },
          {
            uk: "Trained 4 new support workers on medication and the tenants' support plans, over 3 shadow shifts each",
            us: "Trained 4 new direct support professionals on medication and the residents' support plans, over 3 shadow shifts each",
          },
        ],
      },
      {
        title: { uk: "Activities Assistant (part-time)", us: "Program Aide (part-time)" },
        org: { uk: "Yarebridge Day Centre", us: "Yarebridge Adult Day Center" },
        location: { uk: "Norwich", us: "Bloomington, MN" },
        start: "2021-10",
        end: "2023-08",
        bullets: [
          {
            uk: "Ran art, music and cooking sessions for groups of 6 to 8 adults with learning disabilities, 2 days a week",
            us: "Ran art, music and cooking sessions for groups of 6 to 8 adults with intellectual disabilities, 2 days a week",
          },
          "Started a weekly walking group that grew from 4 to 11 members in 6 months",
          "Wrote session notes for around 20 people a week, shared with their families and support staff",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BTEC Level 3 National Extended Diploma in Health and Social Care", us: "Associate of Applied Science in Human Services" },
        org: { uk: "Wyndham College", us: "Wyndham Community College" },
        location: { uk: "Norwich", us: "Bloomington, MN" },
        end: "2023",
        grade: { uk: "Distinction, Distinction, Merit", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Care Certificate", us: "Direct Support Professional Certification" },
        org: { uk: "Skills for Care", us: "National Alliance for Direct Support Professionals" },
        end: "2024",
      },
      {
        title: { uk: "Level 2 Diploma in Care", us: "First Aid and CPR" },
        org: { uk: "City and Guilds", us: "American Red Cross" },
        end: "2025",
      },
    ],
    skills: [
      "Support plans",
      "Positive behaviour support",
      "Medication administration records",
      { uk: "Picture timetables", us: "Picture schedules" },
      "Travel training",
      "Cooking",
      "Budgeting",
      "Personal care",
      "Group sessions",
    ],
    names: ["Kwame", "Asante", "Cobbleway", "Yarebridge", "Wyndham", "Highmoor", "Norwich", "Bloomington"],
    letter: {
      job: {
        title: { uk: "Senior Support Worker", us: "Lead Direct Support Professional" },
        employer: { uk: "Highmoor Support", us: "Highmoor Community Living" },
        advert: {
          uk: `Senior Support Worker
Highmoor Support, Norwich

Highmoor Support runs supported living services for 90 adults with learning disabilities and autism across Norfolk. We are recruiting for our new supported living service in Norwich, a house for 5 young adults moving out of the family home.

The role
You will support tenants with daily living, health and activities in the community, lead shifts and train new support workers.

What we are looking for
- At least 2 years in supported living or a similar service
- Experience following support plans and positive behaviour support plans
- Experience giving medication and keeping accurate records
- Experience training or mentoring new staff
- A Level 2 Diploma in Care, or higher

Pay £13.90 an hour, plus a sleep-in allowance`,
          us: `Lead Direct Support Professional
Highmoor Community Living, Bloomington, MN

Highmoor Community Living runs group homes for 90 adults with intellectual and developmental disabilities across the Twin Cities. We are recruiting for our new group home in Bloomington, a house for 5 young adults moving out of the family home.

The role
You will support residents with daily living, health and activities in the community, lead shifts and train new direct support professionals.

What we are looking for
- At least 2 years as a direct support professional
- Experience following support plans and positive behavior support plans
- Experience passing medication and keeping accurate records
- Experience training or mentoring new staff
- Current CPR and first aid certification

Pay $22.50 an hour`,
        },
      },
      reason: {
        uk: "I want to help open a new supported living service and take on more responsibility, such as leading shifts and training new support workers.",
        us: "I want to help open a new home for young adults and take on more responsibility, such as leading shifts and training new direct support professionals.",
      },
      paragraphs: [
        {
          uk: "I was pleased to see that Highmoor Support is recruiting a Senior Support Worker for its new supported living service in Norwich. I want to help open a new supported living service and take on more responsibility, such as leading shifts and training new support workers.",
          us: "I was pleased to see that Highmoor Community Living is recruiting a Lead Direct Support Professional for its new group home in Bloomington. I want to help open a new home for young adults and take on more responsibility, such as leading shifts and training new direct support professionals.",
        },
        {
          uk: "At Cobbleway Supported Living I support 4 adults with learning disabilities and autism in a shared house with cooking, budgeting, personal care and trips out. As key worker for 2 tenants, I review their support plans with them and their families every 3 months, setting 5 new goals in 2025.",
          us: "At Cobbleway Community Services I support 4 adults with intellectual and developmental disabilities in a group home with cooking, budgeting, personal care and outings. As lead staff member for 2 residents, I review their support plans with them and their families every 3 months, setting 5 new goals in 2025.",
        },
        {
          uk: "Your advert asks for experience following positive behaviour support plans. I cut incidents of distress for one tenant from around 12 to 3 a month in 6 months, using the positive behaviour support plan and a picture timetable. I also coached another tenant to find and start a volunteering role at a garden centre 2 days a week, then gave 8 weeks of travel training so the tenant now takes the bus there alone.",
          us: "Your advert asks for experience following positive behavior support plans. I cut incidents of distress for one resident from around 12 to 3 a month in 6 months, using the positive behavior support plan and a picture schedule. I also coached another resident to find and start a volunteer job at a garden center 2 days a week, then gave 8 weeks of travel training so the resident now rides the bus there alone.",
        },
        {
          uk: "You are also looking for experience giving medication and keeping accurate records. I give medication to 4 tenants twice a day and record it on medication administration records, with no errors found in 6 audits over 18 months. I have trained 4 new support workers on medication and the tenants' support plans, over 3 shadow shifts each. I hold the Care Certificate and a Level 2 Diploma in Care, and I am working towards the Level 3 Diploma in Adult Care.",
          us: "You are also looking for experience passing medication and keeping accurate records. I pass medication to 4 residents twice a day and chart it on medication administration records, with no errors found in 6 audits over 18 months. I have trained 4 new direct support professionals on medication and the residents' support plans, over 3 shadow shifts each. I am certified in first aid and cardiopulmonary resuscitation (CPR).",
        },
        {
          uk: "Thank you for reading my application. My CV is attached, and I would welcome the chance to meet you and discuss the role.",
          us: "Thank you for reading my application. My resume is attached, and I would welcome the chance to meet you and discuss the role.",
        },
      ],
    },
  },
  {
    id: "physiotherapist",
    industry: "healthcare",
    role: { uk: "Physiotherapist", us: "Physical Therapist" },
    level: "experienced",
    template: "chronicle",
    blurb: {
      uk: "A Band 6 musculoskeletal physiotherapist with 7 years in the NHS, running outpatient clinics, a back pain class and phone triage.",
      us: "A licensed physical therapist with 7 years in hospital and outpatient care, now treating sports injuries and joint replacements in an orthopedic clinic.",
    },
    person: { name: "Siobhan Kearney", email: "siobhan.kearney@example.com", phone: { uk: "07700 900657", us: "(865) 555-0179" }, location: { uk: "Sheffield", us: "Knoxville, TN" } },
    profile: {
      uk: "Band 6 musculoskeletal (MSK) physiotherapist with 7 years in the NHS, the last 4 in outpatients at a Sheffield teaching hospital. Sees 10 to 12 patients a day with back, neck, knee and shoulder problems, and raised their Musculoskeletal Health Questionnaire scores by an average of 9 points in 2025. Set up phone triage that cut the wait for a first routine appointment from 14 to 8 weeks, and runs a weekly back pain class. Registered with the Health and Care Professions Council (HCPC), and completed Stage 1 of the first contact practitioner roadmap in 2025.",
      us: "Physical therapist with 7 years in hospital and outpatient care, the last 4 in outpatient orthopedics at a Knoxville sports and spine clinic. Sees 12 to 14 patients a day after joint replacements, sports injuries and back pain, and raised their Lower Extremity Functional Scale scores by an average of 18 points in 2025. Set up same-week screening visits that cut the wait for a first visit from 3 weeks to 8 days, and runs a weekly back pain class. Doctor of Physical Therapy, licensed in Tennessee and certified in dry needling.",
    },
    experience: [
      {
        title: { uk: "Band 6 Musculoskeletal Physiotherapist", us: "Physical Therapist" },
        org: { uk: "Loxdale Teaching Hospitals NHS Foundation Trust", us: "Thornecrest Sports and Spine" },
        location: { uk: "Sheffield", us: "Knoxville, TN" },
        start: "2022-04",
        current: true,
        bullets: [
          {
            uk: "Assess and treat 10 to 12 outpatients a day with back, neck, knee and shoulder problems, managing a caseload of around 60 patients",
            us: "Evaluate and treat 12 to 14 patients a day after joint replacements, sports injuries and back pain, managing a caseload of around 70 patients",
          },
          {
            uk: "Raised patients' Musculoskeletal Health Questionnaire scores by an average of 9 points over a course of treatment in 2025, against a service average of 7",
            us: "Raised patients' Lower Extremity Functional Scale scores by an average of 18 points over a plan of care in 2025, against a clinic average of 14",
          },
          {
            uk: "Set up phone triage for new referrals with 2 colleagues, cutting the wait for a first routine appointment from 14 to 8 weeks in a year",
            us: "Set up same-week screening visits for new patients with 2 colleagues, cutting the wait for a first visit from 3 weeks to 8 days in a year",
          },
          {
            uk: "Run a 6-week back pain class for groups of up to 10 patients, with 85% finishing the course in 2025 and 70% needing no further one-to-one sessions",
            us: "Run a 6-week back pain class for groups of up to 8 patients, with 85% finishing the course in 2025 and 70% needing no further one-on-one visits",
          },
          {
            uk: "Cut missed appointments in the clinic from 11% to 6% by moving patients onto text reminders and offering 2 evening clinics a week",
            us: "Treat around 12 patients a week with dry needling and exercise, mostly for neck, shoulder and lower back pain",
          },
          {
            uk: "Supervise 2 Band 5 physiotherapists and teach 4 students a year on clinical placements from Sheffield Hallam University",
            us: "Supervise 2 physical therapist assistants and teach 3 Doctor of Physical Therapy students a year on 8-week clinical rotations",
          },
        ],
      },
      {
        title: { uk: "Band 5 Rotational Physiotherapist", us: "Staff Physical Therapist" },
        org: { uk: "Loxdale Teaching Hospitals NHS Foundation Trust", us: "Loxdale Regional Medical Center" },
        location: { uk: "Sheffield", us: "Knoxville, TN" },
        start: "2019-09",
        end: "2022-03",
        bullets: [
          {
            uk: "Completed 6 rotations of 4 to 5 months on the respiratory, orthopaedic, stroke, elderly care and outpatient teams",
            us: "Completed 6 rotations of 4 to 5 months in acute care, orthopedics, the stroke unit, inpatient rehabilitation and outpatients",
          },
          "Mobilised 6 to 8 patients a day after hip and knee replacements, with 9 in 10 walking on the day of surgery or the day after",
          {
            uk: "Ran discharge assessments for around 20 patients a week, ordering equipment such as walking frames and grab rails",
            us: "Ran discharge evaluations for around 20 patients a week, ordering equipment such as walkers and grab bars",
          },
          {
            uk: "Covered 2 respiratory on-call shifts a month, giving chest physiotherapy out of hours to around 4 patients a shift",
            us: "Covered 2 weekend shifts a month in the intensive care unit, treating around 10 patients a shift",
          },
          {
            uk: "Started a twice-weekly exercise class for up to 8 patients on the stroke unit, adding 40 minutes of therapy a week for each patient",
            us: "Started a twice-weekly exercise class for up to 8 patients on the stroke unit, adding 40 minutes of therapy a week for each patient",
          },
          {
            uk: "Taught 6 healthcare assistants on the orthopaedic ward to walk patients safely after surgery, so patients could practise walking at weekends",
            us: "Taught 6 nursing assistants on the orthopedic floor to walk patients safely after surgery, so patients could practice walking on weekends",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "MSc Physiotherapy (Pre-registration)", us: "Doctor of Physical Therapy" },
        org: { uk: "Sheffield Hallam University", us: "University of Tennessee at Chattanooga" },
        end: "2019",
        grade: { uk: "Distinction", us: "GPA 3.8" },
      },
      {
        title: { uk: "BSc (Hons) Sport and Exercise Science", us: "Bachelor of Science in Exercise Science" },
        org: { uk: "Loughborough University", us: "University of Tennessee, Knoxville" },
        end: "2016",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Registered Physiotherapist", us: "Licensed Physical Therapist" },
        org: { uk: "Health and Care Professions Council", us: "Tennessee Board of Physical Therapy" },
        end: "2019",
      },
      {
        title: { uk: "First Contact Practitioner Roadmap, Stage 1", us: "Dry Needling Certification" },
        org: { uk: "NHS England", us: "Myopain Seminars" },
        end: "2025",
      },
      {
        title: "Member",
        org: { uk: "Chartered Society of Physiotherapy", us: "American Physical Therapy Association" },
        end: "2019",
      },
    ],
    skills: [
      { uk: "Outpatient assessment", us: "Outpatient orthopedics" },
      { uk: "Phone triage", us: "Screening visits" },
      "Back pain classes",
      "Caseload management",
      { uk: "Text reminders", us: "Dry needling" },
      "Clinical teaching",
      "Hip and knee replacements",
      { uk: "Discharge assessments", us: "Discharge evaluations" },
      { uk: "Chest physiotherapy", us: "Intensive care" },
    ],
    names: ["Siobhan", "Kearney", "Loxdale", "Thornecrest", "Quaybury", "Oakmere", "Hallam", "Loughborough", "Chattanooga", "Knoxville", "Myopain", "Sheffield"],
    letter: {
      job: {
        title: { uk: "First Contact Physiotherapist (Band 7)", us: "Physical Therapist, Sports Medicine" },
        employer: { uk: "Quaybury Primary Care Network", us: "Oakmere Sports Medicine" },
        advert: {
          uk: `First Contact Physiotherapist (Band 7)
Quaybury Primary Care Network, Sheffield

Quaybury Primary Care Network brings together 6 GP practices serving 58,000 patients in south Sheffield.

The role
You will see patients with back, neck and joint problems at their first appointment in general practice, without a GP referral, and give advice, exercises and onward referral where needed.

What we are looking for
- Registration with the Health and Care Professions Council
- At least 5 years as a physiotherapist, with recent experience in MSK outpatients
- Stage 1 of the first contact practitioner roadmap, completed or nearly completed
- Experience of triage and of running group classes
- Experience supervising junior staff and students

Salary £47,800 to £54,700 (Agenda for Change band 7)`,
          us: `Physical Therapist, Sports Medicine
Oakmere Sports Medicine, Knoxville, TN

Oakmere Sports Medicine runs 4 outpatient clinics in East Tennessee for athletes and active adults, from high school teams to weekend runners.

The role
You will evaluate and treat patients after sports injuries and orthopedic surgery, and help us start a running injury clinic.

What we are looking for
- A Doctor of Physical Therapy degree and a Tennessee license
- At least 3 years in outpatient orthopedics
- Dry needling certification, or willingness to obtain it
- Experience starting new programs or classes
- Experience supervising assistants and students

Salary $88,000 to $98,000`,
        },
      },
      reason: {
        uk: "I want to see patients at their first appointment in general practice, so they get the right advice and exercises sooner.",
        us: "I want to treat more athletes and active patients, and keep using dry needling and exercise together.",
      },
      paragraphs: [
        {
          uk: "Please consider me for the First Contact Physiotherapist post at Quaybury Primary Care Network. I want to see patients at their first appointment in general practice, so they get the right advice and exercises sooner, and in 2025 I completed Stage 1 of the first contact practitioner roadmap.",
          us: "Please consider me for the Physical Therapist, Sports Medicine position at Oakmere Sports Medicine. I want to treat more athletes and active patients, and keep using dry needling and exercise together.",
        },
        {
          uk: "At Loxdale Teaching Hospitals NHS Foundation Trust I assess and treat 10 to 12 outpatients a day with back, neck, knee and shoulder problems, managing a caseload of around 60 patients. In 2025 I raised patients' Musculoskeletal Health Questionnaire scores by an average of 9 points over a course of treatment, against a service average of 7.",
          us: "At Thornecrest Sports and Spine I evaluate and treat 12 to 14 patients a day after joint replacements, sports injuries and back pain, managing a caseload of around 70 patients. In 2025 I raised patients' Lower Extremity Functional Scale scores by an average of 18 points over a plan of care, against a clinic average of 14. I also treat around 12 patients a week with dry needling and exercise.",
        },
        {
          uk: "Your advert asks for experience of triage and of running group classes. With 2 colleagues I set up phone triage for new referrals, cutting the wait for a first routine appointment from 14 to 8 weeks in a year. I also run a 6-week back pain class for groups of up to 10 patients, with 85% finishing the course in 2025 and 70% needing no further one-to-one sessions.",
          us: "Your advert asks for experience starting new programs or classes. I run a 6-week back pain class for groups of up to 8 patients, with 85% finishing the course in 2025 and 70% needing no further one-on-one visits. With 2 colleagues I also set up same-week screening visits for new patients, cutting the wait for a first visit from 3 weeks to 8 days in a year.",
        },
        {
          uk: "You are also looking for experience supervising junior staff and students. I supervise 2 Band 5 physiotherapists and teach 4 students a year on clinical placements from Sheffield Hallam University. I have been registered with the Health and Care Professions Council (HCPC) since 2019.",
          us: "You are also looking for experience supervising assistants and students. I supervise 2 physical therapist assistants and teach 3 Doctor of Physical Therapy students a year on 8-week clinical rotations. I graduated with a Doctor of Physical Therapy from the University of Tennessee at Chattanooga in 2019, and I am licensed in Tennessee.",
        },
        {
          uk: "My CV is attached, and I would welcome the chance to discuss the post. Thank you for your time.",
          us: "My resume is attached, and I would welcome the chance to discuss the position. Thank you for your time.",
        },
      ],
    },
  },
  {
    id: "send-teacher",
    industry: "education",
    role: { uk: "Special Educational Needs Teacher", us: "Special Education Teacher" },
    level: "experienced",
    template: "chalkboard",
    blurb: {
      uk: "A special educational needs teacher with 8 years in teaching, the last 5 at a special school for autistic pupils, with QTS and the National Award for SEN Co-ordination.",
      us: "A special education teacher with 8 years in teaching, the last 5 in a self-contained middle school classroom for students with autism and intellectual disabilities.",
    },
    person: { name: "Bronwen Featherstone", email: "bronwen.featherstone@example.com", phone: { uk: "07700 900658", us: "(425) 555-0180" }, location: { uk: "Shrewsbury", us: "Bellevue, WA" } },
    profile: {
      uk: "Special educational needs (SEN) teacher with 8 years in teaching, the last 5 at a special school for pupils aged 7 to 16 with autism and moderate learning difficulties. Teaches a Key Stage 4 class of 9 pupils with 3 teaching assistants, and writes the annual review report for each pupil's Education, Health and Care Plan (EHCP). In 2026, 8 of 9 pupils in the class passed Entry Level Certificates in English and maths. Holds Qualified Teacher Status (QTS) and the National Award for SEN Co-ordination.",
      us: "Special education teacher with 8 years in teaching, the last 5 in a self-contained middle school classroom for students with autism and intellectual disabilities. Teaches 10 students in grades 6 to 8 with 3 instructional assistants, and is case manager for the Individualized Education Program (IEP) of each of 14 students. Students met 82% of their IEP goals in the 2025-26 school year, up from 64% in 2022-23. Holds a Washington teaching certificate with endorsements in special education and elementary education.",
    },
    experience: [
      {
        title: { uk: "Class Teacher (Key Stage 4)", us: "Special Education Teacher" },
        org: { uk: "Brambleside School", us: "Brambleside Middle School" },
        location: { uk: "Shrewsbury", us: "Bellevue, WA" },
        start: "2021-09",
        current: true,
        bullets: [
          {
            uk: "Teach a Key Stage 4 class of 9 pupils aged 14 to 16 with autism and moderate learning difficulties, and lead a team of 3 teaching assistants",
            us: "Teach a self-contained class of 10 students in grades 6 to 8 with autism and intellectual disabilities, and lead a team of 3 instructional assistants",
          },
          {
            uk: "Write annual review reports for 9 Education, Health and Care Plans a year, setting 4 to 6 outcomes for each pupil with parents and therapists",
            us: "Manage 14 Individualized Education Programs as case manager, writing goals with parents, therapists and general education teachers and running 14 annual meetings a year",
          },
          {
            uk: "Prepared pupils for Entry Level Certificates in English and maths, with 8 of 9 passing both in 2026, up from 5 of 8 in 2024",
            us: "Raised the share of IEP goals met by students from 64% in 2022-23 to 82% in 2025-26 by tracking each goal every 2 weeks",
          },
          {
            uk: "Introduced a sensory circuit before morning lessons, cutting recorded incidents in the class from around 20 to 8 a month over a term",
            us: "Introduced sensory breaks and visual schedules, cutting recorded behavior incidents in the class from around 20 to 8 a month in a semester",
          },
          {
            uk: "Trained 40 staff in Makaton signing as the school's communication lead, and set up symbol-based communication books for 12 pupils",
            us: "Trained 25 staff in augmentative and alternative communication as the school's communication lead, and set up speech devices for 8 students",
          },
          {
            uk: "Arranged weekly work experience placements for 6 pupils at 4 local employers, including a bakery and a garden centre",
            us: "Set up a weekly community job program for 6 eighth graders at 4 local businesses, including a bakery and a grocery store",
          },
        ],
      },
      {
        title: { uk: "Class Teacher (Year 3)", us: "Second Grade Teacher" },
        org: { uk: "Marchwood Primary School", us: "Marchwood Elementary School" },
        location: { uk: "Telford", us: "Redmond, WA" },
        start: "2018-09",
        end: "2021-08",
        bullets: [
          {
            uk: "Taught a Year 3 class of 28 pupils, 7 of them with special educational needs, planning lessons with the special educational needs coordinator (SENCo)",
            us: "Taught a second grade class of 26 students, 6 of them with IEPs, planning lessons with the school's special education teacher",
          },
          {
            uk: "Ran daily reading catch-up groups for 6 pupils, raising their reading ages by an average of 14 months in a year",
            us: "Ran daily reading intervention groups for 6 students, raising their reading levels by an average of 1.4 grade levels in a year",
          },
          {
            uk: "Wrote termly support plans for 7 pupils with special educational needs with the SENCo, and met each family 3 times a year to review them",
            us: "Wrote quarterly progress reports on IEP goals for 6 students with the special education teacher, and met each family 3 times a year to review them",
          },
          {
            uk: "Raised the share of pupils working at the expected standard in maths from 61% to 79% in a year, using daily 10-minute fluency sessions",
            us: "Raised the share of students meeting grade-level benchmarks in math from 61% to 79% in a year, using daily 10-minute fluency practice",
          },
          {
            uk: "Created a calm corner and visual timetables in the classroom, cutting time out of class for 2 autistic pupils from 6 to 2 hours a week",
            us: "Created a calm corner and visual schedules in the classroom, cutting time out of class for 2 students with autism from 6 to 2 hours a week",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "PGCE Primary", us: "Master of Education" },
        org: { uk: "University of Worcester", us: "University of Washington" },
        end: "2018",
      },
      {
        title: { uk: "BA (Hons) Psychology", us: "Bachelor of Arts in Psychology" },
        org: { uk: "University of Birmingham", us: "Washington State University" },
        end: "2017",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Qualified Teacher Status", us: "Residency Teacher Certificate, Special Education and Elementary Education" },
        org: { uk: "Teaching Regulation Agency", us: "Washington Office of Superintendent of Public Instruction" },
        end: "2018",
      },
      {
        title: { uk: "National Award for Special Educational Needs Co-ordination", us: "Nonviolent Crisis Intervention" },
        org: { uk: "Bath Spa University", us: "Crisis Prevention Institute" },
        end: "2025",
      },
      {
        title: { uk: "Makaton Level 4", us: "Certified Autism Specialist" },
        org: { uk: "The Makaton Charity", us: "International Board of Credentialing and Continuing Education Standards" },
        end: "2023",
      },
    ],
    skills: [
      { uk: "Education, Health and Care Plans", us: "Individualized Education Programs" },
      { uk: "Annual reviews", us: "Annual meetings" },
      { uk: "Entry Level Certificates", us: "Goal tracking" },
      { uk: "Sensory circuits", us: "Sensory breaks" },
      { uk: "Visual timetables", us: "Visual schedules" },
      { uk: "Makaton", us: "Augmentative and alternative communication" },
      { uk: "Work experience placements", us: "Community job programs" },
      { uk: "Leading teaching assistants", us: "Leading instructional assistants" },
      "Reading groups",
      "Autism",
    ],
    names: ["Bronwen", "Featherstone", "Brambleside", "Marchwood", "Kingsbridge", "Makaton", "Shrewsbury", "Telford", "Worcester", "Bellevue", "Redmond"],
    letter: {
      job: {
        title: { uk: "Lead Teacher, Autism Resource Base", us: "Special Education Teacher, Life Skills Program" },
        employer: { uk: "Kingsbridge Academy", us: "Evergreen Hollow School District" },
        advert: {
          uk: `Lead Teacher, Autism Resource Base
Kingsbridge Academy, Shrewsbury

Kingsbridge Academy is an 11 to 16 secondary school of 1,100 pupils. In September 2027 we plan to open an autism resource base for 16 pupils with Education, Health and Care Plans, who will learn in the base and in mainstream lessons.

The role
You will set up and lead the resource base with 4 teaching assistants, teach its pupils, and support subject teachers to adapt their lessons.

What we are looking for
- Qualified Teacher Status and at least 4 years of teaching
- Experience teaching autistic pupils, ideally in a special school or resource base
- Experience writing Education, Health and Care Plan reviews with families
- Experience training staff
- The National Award for SEN Co-ordination, or willingness to complete it

Salary on the main or upper pay range, plus a SEN allowance of £2,800 to £5,500`,
          us: `Special Education Teacher, Life Skills Program
Evergreen Hollow School District, Bellevue, WA

Evergreen Hollow School District serves 19,000 students. In fall 2027 we plan to open a life skills program for 12 high school students with autism and intellectual disabilities, who will learn in the program and in general education classes.

The role
You will set up and teach the program with 3 instructional assistants, manage your students' IEPs, and support general education teachers to adapt their lessons.

What we are looking for
- A Washington teaching certificate with a special education endorsement
- At least 4 years of teaching students with autism or intellectual disabilities
- Experience writing and managing IEPs with families
- Experience training staff
- Experience setting up community-based learning

Salary $78,000 to $121,000 on the district schedule`,
        },
      },
      reason: {
        uk: "I want to set up a resource base so that autistic pupils can learn in a mainstream school with the right support.",
        us: "I want to set up a new program that helps students with autism learn alongside their peers with the right support.",
      },
      paragraphs: [
        {
          uk: "Kingsbridge Academy's plan to open an autism resource base for 16 pupils is the reason I am applying for the post of Lead Teacher. I want to set up a resource base so that autistic pupils can learn in a mainstream school with the right support.",
          us: "Evergreen Hollow School District's plan to open a life skills program for 12 high school students is why I am applying for the Special Education Teacher position. I want to set up a new program that helps students with autism learn alongside their peers with the right support.",
        },
        {
          uk: "At Brambleside School I teach a Key Stage 4 class of 9 pupils aged 14 to 16 with autism and moderate learning difficulties, and I lead a team of 3 teaching assistants. In 2026, 8 of 9 pupils in the class passed Entry Level Certificates in English and maths. I introduced a sensory circuit before morning lessons, cutting recorded incidents in the class from around 20 to 8 a month over a term.",
          us: "At Brambleside Middle School I teach a self-contained class of 10 students in grades 6 to 8 with autism and intellectual disabilities, and I lead a team of 3 instructional assistants. I raised the share of IEP goals met by students from 64% in 2022-23 to 82% in 2025-26 by tracking each goal every 2 weeks. I also introduced sensory breaks and visual schedules, cutting recorded behavior incidents in the class from around 20 to 8 a month in a semester.",
        },
        {
          uk: "Your advert asks for experience writing Education, Health and Care Plan reviews with families. I write annual review reports for 9 Education, Health and Care Plans a year, setting 4 to 6 outcomes for each pupil with parents and therapists. Before Brambleside, I taught a Year 3 class of 28 pupils at Marchwood Primary School, 7 of them with special educational needs.",
          us: "Your advert asks for experience writing and managing IEPs with families. As case manager for 14 Individualized Education Programs, I write goals with parents, therapists and general education teachers and run 14 annual meetings a year. Before Brambleside, I taught a second grade class of 26 students at Marchwood Elementary School, 6 of them with IEPs.",
        },
        {
          uk: "You are also looking for experience training staff. As the school's communication lead, I trained 40 staff in Makaton signing and set up symbol-based communication books for 12 pupils. I hold Qualified Teacher Status (QTS) and completed the National Award for SEN Co-ordination in 2025.",
          us: "You are also looking for experience training staff and setting up community-based learning. As the school's communication lead, I trained 25 staff in augmentative and alternative communication and set up speech devices for 8 students. I also set up a weekly community job program for 6 eighth graders at 4 local businesses, including a bakery and a grocery store. I hold a Washington teaching certificate with endorsements in special education and elementary education.",
        },
        {
          uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for considering my application.",
          us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for considering my application.",
        },
      ],
    },
  },
];
