import type { ExampleSpec } from "../types";

/** Phase 3, batch 2 (28 Nov 2026): the last nine listed roles, and 21 roles added to the industry packs. */
export const MORE_O: ExampleSpec[] = [
  {
    id: "waiter",
    industry: "hospitality",
    role: { uk: "Waiter", us: "Server" },
    level: "early",
    template: "clearline",
    blurb: {
      uk: "A waiter with 3 years at a busy 140-cover brasserie, who raised spend per guest, keeps allergen orders safe and trains new waiters.",
      us: "A server with 3 years at a busy 140-seat restaurant, who raised the average check per guest, keeps allergy orders safe and trains new servers.",
    },
    person: { name: "Ruairi Doherty", email: "ruairi.doherty@example.com", phone: { uk: "07700 900690", us: "(859) 555-0113" }, location: { uk: "Canterbury", us: "Lexington, KY" } },
    profile: {
      uk: "Waiter with 5 years in hospitality, the last 3 serving a section of up to 90 guests a night at a busy 140-cover brasserie. Raised the average spend per guest from £31 to £36 in a year by upselling starters, wines by the glass and desserts. Checks every allergen order against the kitchen's allergen matrix, with no allergen incidents in 3 years, and has trained 7 new waiters. Named in 41 five-star online reviews since 2024, the most of any waiter on the team.",
      us: "Server with 5 years in restaurants and hotels, the last 3 serving a section of up to 90 guests a night at a busy 140-seat restaurant. Raised the average check per guest from $38 to $44 in a year by upselling appetizers, wines by the glass and desserts. Checks every allergy order against the kitchen's allergen matrix, with no allergen incidents in 3 years, and has trained 7 new servers. Named in 41 five-star online reviews since 2024, the most of any server on the team.",
    },
    experience: [
      {
        title: { uk: "Waiter", us: "Server" },
        org: "Brasserie Marchand",
        location: { uk: "Canterbury", us: "Lexington, KY" },
        start: "2023-08",
        current: true,
        bullets: [
          {
            uk: "Serve a section of 6 to 8 tables and up to 90 guests a night on Fridays and Saturdays in a 140-cover brasserie",
            us: "Serve a section of 6 to 8 tables and up to 90 guests a night on Fridays and Saturdays in a 140-seat restaurant",
          },
          {
            uk: "Raised the average spend per guest from £31 to £36 in a year by upselling starters, wines by the glass and desserts",
            us: "Raised the average check per guest from $38 to $44 in a year by upselling appetizers, wines by the glass and desserts",
          },
          {
            uk: "Check every allergen order against the kitchen's allergen matrix and confirm each dish with the chef at the pass, with no allergen incidents in 3 years",
            us: "Check every allergy order against the kitchen's allergen matrix and confirm each plate with the chef before it goes out, with no allergen incidents in 3 years",
          },
          "Keep table turnover to an average of 85 minutes at weekend peaks against a target of 90, by clearing and resetting tables as each course finishes",
          {
            uk: "Named in 41 five-star online reviews since 2024, the most of any waiter on the team",
            us: "Named in 41 five-star online reviews since 2024, the most of any server on the team",
          },
          {
            uk: "Trained 7 new waiters on the menu, allergens and the till system, each running a section alone within 4 shifts",
            us: "Trained 7 new servers on the menu, allergens and the point-of-sale system, each running a section alone within 4 shifts",
          },
        ],
      },
      {
        title: { uk: "Food and Beverage Assistant", us: "Banquet and Breakfast Server" },
        org: "Wyebridge Hotel",
        location: { uk: "Whitstable", us: "Georgetown, KY" },
        start: "2021-09",
        end: "2023-07",
        bullets: [
          "Served breakfast to up to 120 hotel guests a morning across 2 sittings",
          {
            uk: "Carried 3-course meals to up to 200 guests at around 30 weddings a year, following each couple's table plan",
            us: "Carried 3-course meals to up to 200 guests at around 30 weddings a year, following each couple's seating chart",
          },
          {
            uk: "Moved to the restaurant floor after 9 months, covering 3 evening shifts a week as a waiter",
            us: "Moved to the restaurant floor after 9 months, covering 3 dinner shifts a week as a server",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "GCSEs", us: "High School Diploma" },
        org: { uk: "Hollowmede Academy", us: "Hollowmede High School" },
        location: { uk: "Canterbury", us: "Lexington, KY" },
        end: "2021",
        grade: { uk: "7 at grades 9 to 4, including English and Maths", us: "" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 2 Award in Food Safety in Catering", us: "ServSafe Food Handler Certificate" },
        org: { uk: "Chartered Institute of Environmental Health", us: "National Restaurant Association" },
        end: "2023",
      },
      {
        title: { uk: "Food Allergy and Intolerance Training", us: "ServSafe Allergens Certificate" },
        org: { uk: "Food Standards Agency", us: "National Restaurant Association" },
        end: "2024",
      },
    ],
    skills: [
      "Upselling",
      "Allergen matrix",
      "Table turnover",
      "Wines by the glass",
      "Online reviews",
      { uk: "Training new waiters", us: "Training new servers" },
      { uk: "Till system", us: "Point-of-sale system" },
      "Weddings",
      { uk: "Table plans", us: "Seating charts" },
    ],
    names: ["Ruairi", "Doherty", "Marchand", "Wyebridge", "Hollowmede", "Weathervane", "Canterbury", "Whitstable", "Lexington", "Georgetown", "ServSafe"],
    letter: {
      job: {
        title: { uk: "Senior Waiter", us: "Lead Server" },
        employer: "The Weathervane Kitchen",
        advert: {
          uk: `Senior Waiter
The Weathervane Kitchen, Canterbury

The Weathervane Kitchen is a 160-cover restaurant in the centre of Canterbury, serving seasonal food from Kent farms 7 days a week.

The role
You will run a section on our busiest nights, look after guests from greeting to payment and train our newer waiters. Shortlisted applicants are invited to a paid trial shift.

What we are looking for
- At least 2 years of waiting experience in a busy restaurant
- Confident recommending dishes and wine
- Careful with allergens and dietary needs
- Experience training new team members
- Strong guest reviews

Pay £12.90 an hour, plus an equal share of tips`,
          us: `Lead Server
The Weathervane Kitchen, Lexington, KY

The Weathervane Kitchen is a 160-seat restaurant in downtown Lexington, serving seasonal food from Kentucky farms 7 days a week.

The role
You will run a section on our busiest nights, look after guests from greeting to payment and train our newer servers. Shortlisted applicants are invited to a paid trial shift.

What we are looking for
- At least 2 years of serving experience in a busy restaurant
- Confident recommending dishes and wine
- Careful with food allergies and dietary needs
- Experience training new team members
- Strong guest reviews

Pay $5.50 an hour, plus tips`,
        },
      },
      reason: {
        uk: "I want to take on more responsibility as a senior waiter, running a section on the busiest nights and training newer waiters.",
        us: "I want to take on more responsibility as a lead server, running a section on the busiest nights and training newer servers.",
      },
      paragraphs: [
        {
          uk: "I noticed that The Weathervane Kitchen is looking for a Senior Waiter, and I would like to apply. I want to take on more responsibility as a senior waiter, running a section on the busiest nights and training newer waiters.",
          us: "I noticed that The Weathervane Kitchen is looking for a Lead Server, and I would like to apply. I want to take on more responsibility as a lead server, running a section on the busiest nights and training newer servers.",
        },
        {
          uk: "At Brasserie Marchand I serve a section of 6 to 8 tables and up to 90 guests a night on Fridays and Saturdays in a 140-cover brasserie. I keep table turnover to an average of 85 minutes at weekend peaks against a target of 90, by clearing and resetting tables as each course finishes. Since 2024 I have been named in 41 five-star online reviews, the most of any waiter on the team.",
          us: "At Brasserie Marchand I serve a section of 6 to 8 tables and up to 90 guests a night on Fridays and Saturdays in a 140-seat restaurant. I keep table turnover to an average of 85 minutes at weekend peaks against a target of 90, by clearing and resetting tables as each course finishes. Since 2024 I have been named in 41 five-star online reviews, the most of any server on the team.",
        },
        {
          uk: "Your advert asks for someone confident recommending dishes and wine. I raised the average spend per guest from £31 to £36 in a year by upselling starters, wines by the glass and desserts. You also need someone careful with allergens. I check every allergen order against the kitchen's allergen matrix and confirm each dish with the chef at the pass, with no allergen incidents in 3 years.",
          us: "Your advert asks for someone confident recommending dishes and wine. I raised the average check per guest from $38 to $44 in a year by upselling appetizers, wines by the glass and desserts. You also need someone careful with food allergies. I check every allergy order against the kitchen's allergen matrix and confirm each plate with the chef before it goes out, with no allergen incidents in 3 years.",
        },
        {
          uk: "I have trained 7 new waiters on the menu, allergens and the till system, each running a section alone within 4 shifts. I also hold a Level 2 Award in Food Safety in Catering.",
          us: "I have trained 7 new servers on the menu, allergens and the point-of-sale system, each running a section alone within 4 shifts. I also hold the ServSafe Food Handler and ServSafe Allergens certificates.",
        },
        {
          uk: "Thank you for considering my application. My CV is attached, and I would be glad to work a trial shift.",
          us: "Thank you for considering my application. My resume is attached, and I would be glad to work a trial shift.",
        },
      ],
    },
  },
  {
    id: "barista",
    industry: "hospitality",
    role: "Barista",
    level: "student",
    template: "sapling",
    blurb: {
      uk: "A final-year psychology student who works 16 hours a week as a barista, makes up to 70 drinks an hour and opens and closes the shop alone.",
      us: "A third-year psychology student who works 16 hours a week as a barista, makes up to 70 drinks an hour and opens and closes the shop alone.",
    },
    person: { name: "Ines Carvalho", email: "ines.carvalho@example.com", phone: { uk: "07700 900691", us: "(423) 555-0114" }, location: { uk: "Winchester", us: "Johnson City, TN" } },
    profile: {
      uk: "Final-year psychology student at the University of Winchester with 2 years as a part-time barista, working 16 hours a week in a busy independent coffee shop. Makes up to 70 drinks an hour at the morning peak and pours latte art on around 200 milk drinks a day. Runs opening and closing shifts alone 3 days a week, and cut milk waste by 20% in 6 months through weekly stock orders.",
      us: "Third-year psychology student at East Tennessee State University with 2 years as a part-time barista, working 16 hours a week in a busy independent coffee shop. Makes up to 70 drinks an hour at the morning rush and pours latte art on around 200 milk drinks a day. Runs opening and closing shifts alone 3 days a week, and cut milk waste by 20% in 6 months through weekly stock orders.",
    },
    education: [
      {
        title: { uk: "BSc (Hons) Psychology", us: "Bachelor of Science in Psychology" },
        org: { uk: "University of Winchester", us: "East Tennessee State University" },
        start: "2024-09",
        current: true,
        grade: { uk: "Second-year average of 66%", us: "GPA 3.5" },
      },
      {
        title: { uk: "A levels in Psychology, Biology and English Language", us: "High School Diploma" },
        org: { uk: "Avonbury Sixth Form College", us: "Avonbury High School" },
        location: { uk: "Salisbury", us: "Kingsport, TN" },
        end: "2024",
        grade: { uk: "A, B, B", us: "GPA 3.7" },
      },
    ],
    experience: [
      {
        title: "Barista (part-time)",
        org: "Little Ember Coffee",
        location: { uk: "Winchester", us: "Johnson City, TN" },
        start: "2024-10",
        current: true,
        bullets: [
          {
            uk: "Make up to 70 drinks an hour at the weekday morning peak, keeping the average wait under 4 minutes",
            us: "Make up to 70 drinks an hour at the weekday morning rush, keeping the average wait under 4 minutes",
          },
          "Pour latte art on around 200 milk drinks a day, and won 3 of 6 staff latte art competitions in 2025",
          "Run opening and closing shifts alone 3 days a week, from grinder calibration to espresso machine cleaning",
          {
            uk: "Balance the till at close, handling around £900 in cash and card takings a day with no differences in 2 years",
            us: "Balance the register at close, handling around $1,100 in cash and card sales a day with no shortages in 2 years",
          },
          "Place weekly stock orders with 3 suppliers, cutting milk waste by 20% in 6 months by matching orders to sales",
          "Created a honey and cardamom latte from customer feedback that now sells around 40 a day",
        ],
      },
      {
        title: { uk: "Saturday Sales Assistant", us: "Bakery Clerk (part-time)" },
        org: "Mabel's Bakehouse",
        location: { uk: "Salisbury", us: "Kingsport, TN" },
        start: "2022-06",
        end: "2024-08",
        bullets: [
          "Served around 150 customers on a Saturday, selling bread, cakes and hot drinks from a busy counter",
          "Prepared around 60 coffees a Saturday on the bakery's espresso machine after 2 weeks of training",
          {
            uk: "Packed around 40 cake and bread orders a week for collection, with no missed orders in 2 years",
            us: "Packed around 40 cake and bread orders a week for pickup, with no missed orders in 2 years",
          },
        ],
      },
    ],
    certificates: [
      { title: "Barista Skills Foundation", org: "Specialty Coffee Association", end: "2025" },
      {
        title: { uk: "Level 2 Award in Food Safety in Catering", us: "ServSafe Food Handler Certificate" },
        org: { uk: "Royal Society for Public Health", us: "National Restaurant Association" },
        end: "2024",
      },
    ],
    skills: [
      "Latte art",
      "Espresso machine",
      "Opening and closing shifts",
      "Grinder calibration",
      { uk: "Till balancing", us: "Register balancing" },
      "Cash handling",
      "Stock orders",
      "Customer feedback",
    ],
    names: ["Ines", "Carvalho", "Ember", "Mabel", "Bakehouse", "Heronbrook", "Avonbury", "Winchester", "Salisbury", "Kingsport", "ServSafe", "Specialty"],
    letter: {
      job: {
        title: "Barista (part-time)",
        employer: "Heronbrook Coffee Roasters",
        advert: {
          uk: `Barista (part-time)
Heronbrook Coffee Roasters, Winchester

Heronbrook Coffee Roasters roasts its own speciality coffee and runs 2 cafés in Winchester, serving around 600 customers a day.

The role
You will make espresso drinks and filter coffee on 3 or 4 shifts a week, including early opening shifts and weekends, with hours that fit around study.

What we are looking for
- At least 1 year as a barista in a busy coffee shop
- Good latte art and consistent espresso
- Confidence opening and closing on your own
- Careful cash handling
- Barista Skills Foundation, or willingness to train for it

Pay £12.60 an hour, plus tips and free barista training`,
          us: `Barista (part-time)
Heronbrook Coffee Roasters, Johnson City, TN

Heronbrook Coffee Roasters roasts its own specialty coffee and runs 2 cafes in Johnson City, serving around 600 customers a day.

The role
You will make espresso drinks and filter coffee on 3 or 4 shifts a week, including early opening shifts and weekends, with hours that fit around classes.

What we are looking for
- At least 1 year as a barista in a busy coffee shop
- Good latte art and consistent espresso
- Confidence opening and closing on your own
- Careful cash handling
- Barista Skills Foundation, or willingness to train for it

Pay $11.00 an hour, plus tips and free barista training`,
        },
      },
      reason: {
        uk: "I want to work at a speciality coffee roaster where I can learn more about coffee, on shifts that fit around my final year.",
        us: "I want to work at a specialty coffee roaster where I can learn more about coffee, on shifts that fit around my classes.",
      },
      paragraphs: [
        {
          uk: "I hope you will consider me for the part-time Barista role at Heronbrook Coffee Roasters. I want to work at a speciality coffee roaster where I can learn more about coffee, on shifts that fit around my final year.",
          us: "I hope you will consider me for the part-time Barista role at Heronbrook Coffee Roasters. I want to work at a specialty coffee roaster where I can learn more about coffee, on shifts that fit around my classes.",
        },
        {
          uk: "At Little Ember Coffee I make up to 70 drinks an hour at the weekday morning peak, keeping the average wait under 4 minutes. I pour latte art on around 200 milk drinks a day, and I won 3 of 6 staff latte art competitions in 2025. Previously, at Mabel's Bakehouse, I served around 150 customers on a Saturday, selling bread, cakes and hot drinks from a busy counter.",
          us: "At Little Ember Coffee I make up to 70 drinks an hour at the weekday morning rush, keeping the average wait under 4 minutes. I pour latte art on around 200 milk drinks a day, and I won 3 of 6 staff latte art competitions in 2025. Previously, at Mabel's Bakehouse, I served around 150 customers on a Saturday, selling bread, cakes and hot drinks from a busy counter.",
        },
        {
          uk: "Your advert asks for confidence opening and closing on your own. I run opening and closing shifts alone 3 days a week, from grinder calibration to espresso machine cleaning. At close I also balance the till, handling around £900 in cash and card takings a day with no differences in 2 years.",
          us: "Your advert asks for confidence opening and closing on your own. I run opening and closing shifts alone 3 days a week, from grinder calibration to espresso machine cleaning. At close I also balance the register, handling around $1,100 in cash and card sales a day with no shortages in 2 years.",
        },
        "I also place weekly stock orders with 3 suppliers, cutting milk waste by 20% in 6 months by matching orders to sales. I created a honey and cardamom latte from customer feedback that now sells around 40 a day.",
        {
          uk: "My CV is attached, and I would be glad to talk about shifts. Thank you for your time.",
          us: "My resume is attached, and I would be glad to talk about shifts. Thank you for your time.",
        },
      ],
    },
  },
  {
    id: "cashier",
    industry: "retail",
    role: "Cashier",
    level: "early",
    template: "graduate",
    blurb: {
      uk: "A supermarket cashier who scans 22 items a minute, runs a bank of self-checkouts and has passed every Challenge 25 test purchase.",
      us: "A grocery store cashier who scans 22 items a minute, runs a bank of self-checkouts and has passed every underage compliance check.",
    },
    person: { name: "Abbie Pickering", email: "abbie.pickering@example.com", phone: { uk: "07700 900692", us: "(843) 555-0115" }, location: { uk: "Carlisle", us: "Charleston, SC" } },
    profile: {
      uk: "Cashier with 4 years on supermarket and cinema tills, the last 2 at a busy Carlisle supermarket serving around 350 customers a shift. Scans at an average of 22 items a minute against a store target of 18, with a cash accuracy score of 99.9% in 6 internal audits. Covers a bank of 8 self-checkouts at peak times and checks ID under the Challenge 25 policy, passing 3 test purchases by Trading Standards since 2024. Signed up 410 customers to the store's loyalty app in 2025 and has trained 5 new cashiers.",
      us: "Cashier with 4 years at grocery and movie theater registers, the last 2 at a busy Charleston grocery store serving around 350 customers a shift. Scans at an average of 22 items a minute against a store target of 18, with a cash accuracy score of 99.9% in 6 internal audits. Covers a bank of 8 self-checkouts at peak times and checks ID for alcohol and tobacco, passing 3 underage compliance checks by local police since 2024. Signed up 410 customers to the store's loyalty app in 2025 and has trained 5 new cashiers.",
    },
    experience: [
      {
        title: "Cashier",
        org: { uk: "Greenacre Foods", us: "Greenacre Market" },
        location: { uk: "Carlisle", us: "Charleston, SC" },
        start: "2024-05",
        current: true,
        bullets: [
          {
            uk: "Serve around 350 customers a shift on a busy main till, scanning at an average of 22 items a minute against a store target of 18",
            us: "Serve around 350 customers a shift on a busy main register, scanning at an average of 22 items a minute against a store target of 18",
          },
          {
            uk: "Count and balance the till at the end of each shift, handling around £6,500 a day, with a cash accuracy score of 99.9% in 6 internal audits",
            us: "Count and balance the register at the end of each shift, handling around $8,000 a day, with a cash accuracy score of 99.9% in 6 internal audits",
          },
          "Cover a bank of 8 self-checkouts at peak times, clearing around 60 alerts an hour, from age checks to unexpected items in the bagging area",
          {
            uk: "Check ID for alcohol, tobacco and knives under the Challenge 25 policy, passing 3 test purchases by Trading Standards since 2024",
            us: "Check ID for alcohol and tobacco sales to anyone who looks under 40, passing 3 underage compliance checks by local police since 2024",
          },
          "Signed up 410 customers to the store's loyalty app in 2025, the second most among 38 cashiers in the store",
          "Trained 5 new cashiers on refunds, price checks and age-restricted sales over 2 shifts each",
        ],
      },
      {
        title: { uk: "Kiosk Assistant", us: "Concessions Attendant" },
        org: { uk: "Starline Cinema", us: "Starline Cinemas" },
        location: { uk: "Carlisle", us: "Summerville, SC" },
        start: "2022-09",
        end: "2024-04",
        bullets: [
          {
            uk: "Sold tickets, popcorn and drinks to up to 400 customers on a Saturday at a 6-screen cinema",
            us: "Sold tickets, popcorn and drinks to up to 400 customers on a Saturday at a 6-screen movie theater",
          },
          "Raised sales of popcorn and drink deals by 15% in 3 months by offering one with each ticket order",
          "Cleaned and restocked 6 screens between showings, turning each around in under 15 minutes",
        ],
      },
    ],
    education: [
      {
        title: { uk: "GCSEs", us: "High School Diploma" },
        org: { uk: "Highgill Academy", us: "Highgill High School" },
        location: { uk: "Carlisle", us: "Summerville, SC" },
        end: "2022",
        grade: { uk: "6 at grades 9 to 4, including English and Maths", us: "" },
      },
    ],
    skills: [
      "Scanning",
      { uk: "Till balancing", us: "Register balancing" },
      "Cash accuracy",
      "Self-checkouts",
      { uk: "Challenge 25", us: "ID checks" },
      "Age-restricted sales",
      "Loyalty app",
      "Refunds",
      "Price checks",
      "Training new cashiers",
    ],
    names: ["Abbie", "Pickering", "Greenacre", "Starline", "Highgill", "Fairbrook", "Carlisle", "Charleston", "Summerville"],
    letter: {
      job: {
        title: "Senior Cashier",
        employer: { uk: "Fairbrook Supermarkets", us: "Fairbrook Market" },
        advert: {
          uk: `Senior Cashier
Fairbrook Supermarkets, Carlisle

Fairbrook Supermarkets runs 85 stores across the north of England and southern Scotland. Our Carlisle store serves around 25,000 customers a week.

The role
You will run the checkouts and self-checkouts on your shift, balance the tills, deal with refunds and train new cashiers.

What we are looking for
- At least 1 year of till experience in a busy store
- Fast, accurate scanning and cash handling
- Confidence running a bank of self-checkouts
- A firm approach to Challenge 25
- Experience training new team members

Pay £12.90 an hour, plus a 10% staff discount`,
          us: `Senior Cashier
Fairbrook Market, Charleston, SC

Fairbrook Market runs 85 grocery stores across the Carolinas and Georgia. Our Charleston store serves around 25,000 customers a week.

The role
You will run the registers and self-checkouts on your shift, balance the registers, handle refunds and train new cashiers.

What we are looking for
- At least 1 year of register experience in a busy store
- Fast, accurate scanning and cash handling
- Confidence running a bank of self-checkouts
- Careful ID checks for alcohol and tobacco
- Experience training new team members

Pay $15.50 an hour, plus a 10% employee discount`,
        },
      },
      reason: {
        uk: "I want to take the next step to senior cashier, where I can run the checkouts on a shift and train new starters.",
        us: "I want to take the next step to senior cashier, where I can run the registers on a shift and train new hires.",
      },
      paragraphs: [
        {
          uk: "I saw the Senior Cashier vacancy at Fairbrook Supermarkets in Carlisle, and I hope to be considered. I want to take the next step to senior cashier, where I can run the checkouts on a shift and train new starters.",
          us: "I saw the Senior Cashier vacancy at Fairbrook Market in Charleston, and I hope to be considered. I want to take the next step to senior cashier, where I can run the registers on a shift and train new hires.",
        },
        {
          uk: "At Greenacre Foods I serve around 350 customers a shift on a busy main till, scanning at an average of 22 items a minute against a store target of 18. I count and balance the till at the end of each shift, handling around £6,500 a day, with a cash accuracy score of 99.9% in 6 internal audits.",
          us: "At Greenacre Market I serve around 350 customers a shift on a busy main register, scanning at an average of 22 items a minute against a store target of 18. I count and balance the register at the end of each shift, handling around $8,000 a day, with a cash accuracy score of 99.9% in 6 internal audits.",
        },
        {
          uk: "Your advert asks for confidence running a bank of self-checkouts. I cover a bank of 8 self-checkouts at peak times, clearing around 60 alerts an hour, from age checks to unexpected items in the bagging area. I also check ID for alcohol, tobacco and knives under the Challenge 25 policy, passing 3 test purchases by Trading Standards since 2024.",
          us: "Your advert asks for confidence running a bank of self-checkouts. I cover a bank of 8 self-checkouts at peak times, clearing around 60 alerts an hour, from age checks to unexpected items in the bagging area. I also check ID for alcohol and tobacco sales to anyone who looks under 40, passing 3 underage compliance checks by local police since 2024.",
        },
        "You also want experience training new team members. I have trained 5 new cashiers on refunds, price checks and age-restricted sales over 2 shifts each. In 2025 I signed up 410 customers to the store's loyalty app, the second most among 38 cashiers in the store.",
        {
          uk: "My CV is attached. Thank you for your time, and I hope to hear from you.",
          us: "My resume is attached. Thank you for your time, and I hope to hear from you.",
        },
      ],
    },
  },
  {
    id: "dental-nurse",
    industry: "healthcare",
    role: { uk: "Dental Nurse", us: "Dental Assistant" },
    level: "early",
    template: "ward",
    blurb: {
      uk: "A registered dental nurse with 3 years qualified, who sterilises for 4 surgeries, takes X-rays and runs the practice's infection control audit.",
      us: "A certified dental assistant with 3 years in a busy family practice, who sterilizes for 4 treatment rooms, takes X-rays and runs the practice's infection control audit.",
    },
    person: { name: "Tamsin Trevithick", email: "tamsin.trevithick@example.com", phone: { uk: "07700 900693", us: "(912) 555-0116" }, location: { uk: "Truro", us: "Savannah, GA" } },
    profile: {
      uk: "Dental nurse registered with the General Dental Council (GDC), with 3 years qualified after 2 years of training in practice. Assists 2 dentists with four-handed dentistry for around 25 patients a day, and sterilises around 300 instruments a day with no failed autoclave tests in 3 years. Qualified in dental radiography in 2024, and raised the practice's infection control audit score from 92% to 98% since 2023.",
      us: "Certified Dental Assistant (CDA) with 3 years in a busy family practice, after 2 years of training on the job. Assists 2 dentists with four-handed dentistry for around 25 patients a day, and sterilizes around 300 instruments a day with no failed spore tests in 3 years. Completed a dental radiology certificate in 2024, and raised the practice's infection control audit score from 92% to 98% since 2023.",
    },
    experience: [
      {
        title: { uk: "Dental Nurse", us: "Dental Assistant" },
        org: { uk: "Penmarrow Dental Practice", us: "Penmarrow Family Dentistry" },
        location: { uk: "Truro", us: "Savannah, GA" },
        start: "2023-07",
        current: true,
        bullets: [
          {
            uk: "Assist 2 dentists with four-handed dentistry for around 25 patients a day, from check-ups to root canal treatment",
            us: "Assist 2 dentists with four-handed dentistry for around 25 patients a day, from exams to root canals",
          },
          {
            uk: "Sterilise around 300 instruments a day in the decontamination room for 4 surgeries, with no failed autoclave tests in 3 years",
            us: "Sterilize around 300 instruments a day for 4 treatment rooms, with no failed spore tests in 3 years",
          },
          "Take around 40 dental X-rays a week, with 97% graded acceptable in the practice's 2025 X-ray audit",
          "Run the practice's infection control audit twice a year, raising the score from 92% to 98% since 2023",
          {
            uk: "Write clinical notes and charting for around 25 patients a day in Dentally, for the dentist to check and sign",
            us: "Enter clinical notes and charting for around 25 patients a day in Dentrix, for the dentist to review and sign",
          },
          {
            uk: "Trained 2 trainee dental nurses in decontamination, both passing the National Diploma first time",
            us: "Trained 2 new dental assistants in sterilization and four-handed dentistry over 6 weeks each",
          },
        ],
      },
      {
        title: { uk: "Trainee Dental Nurse", us: "Dental Assistant Trainee" },
        org: "Lowenna Dental Care",
        location: { uk: "Falmouth", us: "Pooler, GA" },
        start: "2021-09",
        end: "2023-06",
        bullets: [
          {
            uk: "Prepared surgeries and mixed materials for up to 20 patients a day while studying for the National Diploma",
            us: "Prepared treatment rooms and mixed materials for up to 20 patients a day while studying in the evenings",
          },
          "Checked in around 20 patients a day and updated their medical histories before each appointment",
          {
            uk: "Passed the National Diploma in Dental Nursing at the first attempt in 2023, after 21 months of training",
            us: "Passed the Certified Dental Assistant exam at the first attempt in 2023, after 21 months of training",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "National Diploma in Dental Nursing", us: "Dental Assisting Diploma" },
        org: { uk: "National Examining Board for Dental Nurses", us: "Marshgrove Technical College" },
        end: "2023",
      },
      {
        title: { uk: "A levels in Biology, Chemistry and Psychology", us: "High School Diploma" },
        org: { uk: "Tremorvah College", us: "Oglethorpe Ridge High School" },
        location: { uk: "Truro", us: "Savannah, GA" },
        end: "2021",
        grade: { uk: "B, B, C", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Registered Dental Nurse", us: "Certified Dental Assistant (CDA)" },
        org: { uk: "General Dental Council", us: "Dental Assisting National Board" },
        end: "2023",
      },
      {
        title: { uk: "Certificate in Dental Radiography", us: "Dental Radiology Certificate" },
        org: { uk: "National Examining Board for Dental Nurses", us: "Marshgrove Technical College" },
        end: "2024",
      },
      {
        title: "Basic Life Support",
        org: { uk: "Resuscitation Council UK", us: "American Heart Association" },
        end: "2025",
      },
    ],
    skills: [
      "Four-handed dentistry",
      { uk: "Decontamination", us: "Sterilization" },
      "Infection control",
      "Dental X-rays",
      { uk: "Autoclave testing", us: "Spore testing" },
      "Clinical notes",
      { uk: "Dentally", us: "Dentrix" },
      "Medical histories",
      "Mixing materials",
      { uk: "Training dental nurses", us: "Training dental assistants" },
    ],
    names: ["Tamsin", "Trevithick", "Penmarrow", "Lowenna", "Bramblecombe", "Tremorvah", "Marshgrove", "Oglethorpe", "Dentally", "Dentrix", "Truro", "Falmouth", "Pooler", "Savannah"],
    letter: {
      job: {
        title: { uk: "Dental Nurse", us: "Dental Assistant" },
        employer: "Bramblecombe Dental Care",
        advert: {
          uk: `Dental Nurse
Bramblecombe Dental Care, Truro

Bramblecombe Dental Care is a 7-surgery mixed NHS and private practice in Truro, with 6 dentists, 2 hygienists and a team of 10 dental nurses.

The role
You will work with our dentists on four-handed dentistry, take X-rays and help run our decontamination room.

What we are looking for
- Registration with the General Dental Council
- At least 2 years of experience as a qualified dental nurse
- Strong infection control and decontamination practice
- A radiography qualification, or willingness to gain one
- Experience with Dentally

Salary £24,500 to £27,000, plus a uniform allowance`,
          us: `Dental Assistant
Bramblecombe Dental Care, Savannah, GA

Bramblecombe Dental Care is a 7-chair general dental practice in Savannah, with 6 dentists, 2 hygienists and a team of 10 dental assistants.

The role
You will work with our dentists on four-handed dentistry, take X-rays and help run our sterilization area.

What we are looking for
- Certified Dental Assistant (CDA), or willingness to gain it
- At least 2 years of experience as a dental assistant
- Strong infection control and sterilization practice
- Georgia radiology certification
- Experience with Dentrix

Pay $21 to $25 an hour, plus benefits`,
        },
      },
      reason: "I want to work in a larger practice where I can take X-rays every day and learn from a bigger team.",
      paragraphs: [
        {
          uk: "I am keen to work at Bramblecombe Dental Care as a Dental Nurse. I want to work in a larger practice where I can take X-rays every day and learn from a bigger team.",
          us: "I am keen to work at Bramblecombe Dental Care as a Dental Assistant. I want to work in a larger practice where I can take X-rays every day and learn from a bigger team.",
        },
        {
          uk: "At Penmarrow Dental Practice I assist 2 dentists with four-handed dentistry for around 25 patients a day, from check-ups to root canal treatment. I also write clinical notes and charting for around 25 patients a day in Dentally, for the dentist to check and sign. As a trainee, I prepared surgeries and mixed materials for up to 20 patients a day while studying for the National Diploma.",
          us: "At Penmarrow Family Dentistry I assist 2 dentists with four-handed dentistry for around 25 patients a day, from exams to root canals. I also enter clinical notes and charting for around 25 patients a day in Dentrix, for the dentist to review and sign. As a trainee, I prepared treatment rooms and mixed materials for up to 20 patients a day while studying in the evenings.",
        },
        {
          uk: "Your advert asks for strong infection control and decontamination practice. I sterilise around 300 instruments a day in the decontamination room for 4 surgeries, with no failed autoclave tests in 3 years. I also run the practice's infection control audit twice a year, raising the score from 92% to 98% since 2023. I have trained 2 trainee dental nurses in decontamination, both passing the National Diploma first time.",
          us: "Your advert asks for strong infection control and sterilization practice. I sterilize around 300 instruments a day for 4 treatment rooms, with no failed spore tests in 3 years. I also run the practice's infection control audit twice a year, raising the score from 92% to 98% since 2023. I have trained 2 new dental assistants in sterilization and four-handed dentistry over 6 weeks each.",
        },
        {
          uk: "I take around 40 dental X-rays a week, with 97% graded acceptable in the practice's 2025 X-ray audit. I am registered with the General Dental Council (GDC), and I hold the Certificate in Dental Radiography.",
          us: "I take around 40 dental X-rays a week, with 97% graded acceptable in the practice's 2025 X-ray audit. I passed the Dental Assisting National Board's Certified Dental Assistant exam at the first attempt in 2023, and I hold a Dental Radiology Certificate.",
        },
        {
          uk: "Thank you for considering my application. My CV is attached, and I would be pleased to meet you to discuss the role.",
          us: "Thank you for considering my application. My resume is attached, and I would be pleased to meet you to discuss the role.",
        },
      ],
    },
  },
  {
    id: "pharmacy-technician",
    industry: "healthcare",
    role: "Pharmacy Technician",
    level: "experienced",
    template: "chronicle",
    blurb: {
      uk: "A Band 6 hospital pharmacy technician with 11 years in community and hospital pharmacy, who leads medicines reconciliation on 3 medical wards and is an accredited checker.",
      us: "A certified pharmacy technician with 11 years in retail and hospital pharmacy, who takes medication histories for new admissions and keeps 14 dispensing cabinets stocked.",
    },
    person: { name: "Faisal Qureshi", email: "faisal.qureshi@example.com", phone: { uk: "07700 900694", us: "(850) 555-0117" }, location: { uk: "Shrewsbury", us: "Tallahassee, FL" } },
    profile: {
      uk: "Pharmacy technician registered with the General Pharmaceutical Council (GPhC), with 11 years in community and hospital pharmacy, the last 4 as a Band 6 senior technician on 3 medical wards. Completes medicines reconciliation for around 25 newly admitted patients a day, and checks the final accuracy of around 600 dispensed items a day with an error rate of 0.02% in 2025. Cut the average wait for discharge medicines on 3 wards from 3.5 to 2 hours in 2024. Has supervised 8 trainee pharmacy technicians since 2022, 7 of whom passed their course first time.",
      us: "Certified pharmacy technician (CPhT) with 11 years in retail and hospital pharmacy, the last 4 as a senior technician on 3 medical floors of a 420-bed hospital. Takes medication histories for around 25 newly admitted patients a day, and restocks 14 automated dispensing cabinets with around 600 doses a day with an error rate of 0.02% in 2025. Cut the average wait for discharge medications on 3 floors from 3.5 to 2 hours in 2024. Has trained 8 new pharmacy technicians since 2022, 7 of whom passed the Pharmacy Technician Certification Board (PTCB) exam within 6 months.",
    },
    experience: [
      {
        title: { uk: "Senior Pharmacy Technician (Band 6)", us: "Senior Pharmacy Technician" },
        org: { uk: "Severnvale Hospitals NHS Trust", us: "Tallow Creek Medical Center" },
        location: { uk: "Shrewsbury", us: "Tallahassee, FL" },
        start: "2022-04",
        current: true,
        bullets: [
          {
            uk: "Complete medicines reconciliation for around 25 newly admitted patients a day on 3 medical wards, freeing around 10 hours a week of pharmacist time",
            us: "Take medication histories for around 25 newly admitted patients a day on 3 medical floors, freeing around 10 hours a week of pharmacist time",
          },
          {
            uk: "Check the final accuracy of around 600 dispensed items a day as an accredited checking pharmacy technician, with an error rate of 0.02% in 2025 against a trust limit of 0.05%",
            us: "Restock 14 automated dispensing cabinets with around 600 doses a day, with an error rate of 0.02% in 2025 against a hospital limit of 0.05%",
          },
          {
            uk: "Cut the average wait for discharge medicines on 3 medical wards from 3.5 to 2 hours in 2024 by checking take-home prescriptions on the ward",
            us: "Cut the average wait for discharge medications on 3 medical floors from 3.5 to 2 hours in 2024 through bedside delivery of discharge prescriptions",
          },
          {
            uk: "Assess patients' own medicines for reuse on admission, saving around £28,000 a year on the 3 wards in 2025",
            us: "Reduced missed-dose calls from nurses on the 3 floors by 35% in 2025 by restocking cabinets before each shift's medication pass",
          },
          {
            uk: "Wrote 12 standard operating procedures for ward-based technician work, from medicines reconciliation to patients' own medicines checks, adopted across 9 wards",
            us: "Wrote 12 standard operating procedures for technician work on the floors, from medication histories to cabinet restocking, now used on 9 units",
          },
          {
            uk: "Supervised 8 pre-registration trainee pharmacy technicians since 2022, 7 of whom passed their course first time",
            us: "Trained 8 new pharmacy technicians since 2022, 7 of whom passed the national certification exam within 6 months of starting",
          },
        ],
      },
      {
        title: { uk: "Pharmacy Technician (Band 5)", us: "Inpatient Pharmacy Technician" },
        org: { uk: "Severnvale Hospitals NHS Trust", us: "Tallow Creek Medical Center" },
        location: { uk: "Shrewsbury", us: "Tallahassee, FL" },
        start: "2019-03",
        end: "2022-03",
        bullets: [
          {
            uk: "Dispensed around 250 inpatient and outpatient items a day in the hospital dispensary, with an error rate of 0.04% over 3 years",
            us: "Prepared around 250 inpatient medication orders a day in the central pharmacy, with an error rate of 0.04% over 3 years",
          },
          {
            uk: "Ran stock control for 1,800 product lines, cutting the value of stock held by £45,000 in a year by lowering reorder levels on slow-moving lines",
            us: "Managed inventory for 1,800 products, cutting the value of stock on hand by $60,000 in a year by lowering par levels on slow-moving items",
          },
          {
            uk: "Prepared around 40 aseptic doses a day in the clean room during a 6-month rotation, with no failed environmental monitoring results",
            us: "Compounded around 40 sterile intravenous doses a day in the clean room, with no failed sterility tests in 3 years",
          },
        ],
      },
      {
        title: { uk: "Pre-registration Trainee, then Pharmacy Technician", us: "Pharmacy Technician" },
        org: { uk: "Shapcott Pharmacy", us: "Shapcott Drugs" },
        location: { uk: "Telford", us: "Tallahassee, FL" },
        start: "2015-09",
        end: "2019-02",
        bullets: [
          {
            uk: "Dispensed and labelled around 300 prescription items a day in a busy community pharmacy, with no dispensing errors reaching patients in 3 years",
            us: "Filled around 300 prescriptions a day in a busy retail pharmacy, with no filling errors reaching patients in 3 years",
          },
          {
            uk: "Ran the repeat prescription service for around 900 patients, cutting uncollected items from 6% to 2% in a year by texting patients when items were ready",
            us: "Ran the auto-refill program for around 900 patients, cutting prescriptions not picked up from 6% to 2% in a year by texting patients when they were ready",
          },
          {
            uk: "Qualified as a pharmacy technician in 2017 after 2 years of training in the pharmacy and at college, then registered with the General Pharmaceutical Council",
            us: "Passed the Pharmacy Technician Certification Board exam in 2017 after 2 years of training in the pharmacy and at college",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Level 3 Diploma in the Principles and Practice for Pharmacy Technicians", us: "Pharmacy Technician Certificate" },
        org: { uk: "Coalbrook College", us: "Canopy Road Technical College" },
        location: { uk: "Telford", us: "Tallahassee, FL" },
        end: "2017",
      },
    ],
    certificates: [
      {
        title: { uk: "Registered Pharmacy Technician", us: "Certified Pharmacy Technician (CPhT)" },
        org: { uk: "General Pharmaceutical Council", us: "Pharmacy Technician Certification Board" },
        end: "2017",
      },
      {
        title: { uk: "Accredited Checking Pharmacy Technician", us: "Compounded Sterile Preparation Technician (CSPT)" },
        org: { uk: "NHS England", us: "Pharmacy Technician Certification Board" },
        end: "2021",
      },
      {
        title: { uk: "Medicines Reconciliation Accreditation", us: "Medication History Technician Training" },
        org: { uk: "Severnvale Hospitals NHS Trust", us: "Tallow Creek Medical Center" },
        end: "2022",
      },
    ],
    skills: [
      { uk: "Medicines reconciliation", us: "Medication histories" },
      { uk: "Accuracy checking", us: "Automated dispensing cabinets" },
      { uk: "Discharge medicines", us: "Discharge medications" },
      { uk: "Patients' own medicines", us: "Bedside delivery" },
      { uk: "Dispensing", us: "Prescription filling" },
      { uk: "Stock control", us: "Inventory management" },
      { uk: "Aseptic preparation", us: "Sterile compounding" },
      "Standard operating procedures",
      { uk: "Supervising trainees", us: "Training technicians" },
      { uk: "Repeat prescriptions", us: "Auto-refill" },
    ],
    names: ["Faisal", "Qureshi", "Severnvale", "Tallow", "Shapcott", "Coalbrook", "Hallowfield", "Canopy", "GPhC", "CPhT", "Shrewsbury", "Telford", "Tallahassee"],
    letter: {
      job: {
        title: { uk: "Lead Pharmacy Technician, Medicines Optimisation (Band 7)", us: "Lead Pharmacy Technician" },
        employer: { uk: "Hallowfield Hospitals NHS Trust", us: "Hallowfield Health" },
        advert: {
          uk: `Lead Pharmacy Technician, Medicines Optimisation (Band 7)
Hallowfield Hospitals NHS Trust, Shrewsbury

Hallowfield Hospitals NHS Trust runs 2 hospitals with 780 beds. Our ward pharmacy team of 16 technicians covers 24 wards, and we are recruiting a lead technician for our medicines optimisation service.

The role
You will lead the ward-based pharmacy technician service, manage a team of 6 Band 5 and Band 6 technicians and bring medicines reconciliation to more wards.

What we are looking for
- Registration with the GPhC
- Experience of medicines reconciliation on hospital wards
- Accredited checking pharmacy technician status
- Experience supervising or training pharmacy staff
- Experience writing standard operating procedures

Salary £47,810 to £54,710 a year`,
          us: `Lead Pharmacy Technician
Hallowfield Health, Tallahassee, FL

Hallowfield Health runs 2 hospitals with 780 beds in North Florida. Our pharmacy team of 40 technicians covers inpatient units, the emergency department and 3 outpatient pharmacies, and we are recruiting a lead technician for our inpatient units.

The role
You will lead the technicians who take medication histories and stock our automated dispensing cabinets, train new technicians and write procedures for the team.

What we are looking for
- PTCB certification and an active Florida pharmacy technician registration
- At least 5 years of hospital pharmacy experience
- Experience taking medication histories
- Experience training or supervising technicians
- Experience writing standard operating procedures

Pay $25 to $31 an hour`,
        },
      },
      reason: {
        uk: "I want to lead a team of ward pharmacy technicians and bring medicines reconciliation to more wards.",
        us: "I want to lead a team of pharmacy technicians and take medication histories for patients on more units.",
      },
      paragraphs: [
        {
          uk: "I am interested in the Lead Pharmacy Technician post at Hallowfield Hospitals NHS Trust. I want to lead a team of ward pharmacy technicians and bring medicines reconciliation to more wards.",
          us: "I am interested in the Lead Pharmacy Technician position at Hallowfield Health. I want to lead a team of pharmacy technicians and take medication histories for patients on more units.",
        },
        {
          uk: "At Severnvale Hospitals NHS Trust I complete medicines reconciliation for around 25 newly admitted patients a day on 3 medical wards, freeing around 10 hours a week of pharmacist time. As an accredited checking pharmacy technician, I check the final accuracy of around 600 dispensed items a day, with an error rate of 0.02% in 2025 against a trust limit of 0.05%.",
          us: "At Tallow Creek Medical Center I take medication histories for around 25 newly admitted patients a day on 3 medical floors, freeing around 10 hours a week of pharmacist time. I also restock 14 automated dispensing cabinets with around 600 doses a day, with an error rate of 0.02% in 2025 against a hospital limit of 0.05%.",
        },
        {
          uk: "Your advert asks for experience supervising or training pharmacy staff. I have supervised 8 pre-registration trainee pharmacy technicians since 2022, 7 of whom passed their course first time. I also wrote 12 standard operating procedures for ward-based technician work, from medicines reconciliation to patients' own medicines checks, adopted across 9 wards.",
          us: "Your advert asks for experience training or supervising technicians. I have trained 8 new pharmacy technicians since 2022, 7 of whom passed the national certification exam within 6 months of starting. I also wrote 12 standard operating procedures for technician work on the floors, from medication histories to cabinet restocking, now used on 9 units.",
        },
        {
          uk: "In 2024 I cut the average wait for discharge medicines on 3 medical wards from 3.5 to 2 hours by checking take-home prescriptions on the ward. I also assess patients' own medicines for reuse on admission, saving around £28,000 a year on the 3 wards in 2025. I am registered with the General Pharmaceutical Council (GPhC).",
          us: "In 2024 I cut the average wait for discharge medications on 3 medical floors from 3.5 to 2 hours through bedside delivery of discharge prescriptions. I also reduced missed-dose calls from nurses on the 3 floors by 35% in 2025 by restocking cabinets before each shift's medication pass. I am a Certified Pharmacy Technician (CPhT) and a Compounded Sterile Preparation Technician (CSPT).",
        },
        {
          uk: "My CV is attached, and I would welcome the chance to discuss the post. Thank you for your time and consideration.",
          us: "My resume is attached, and I would welcome the chance to discuss the position. Thank you for your time and consideration.",
        },
      ],
    },
  },
  {
    id: "occupational-therapist",
    industry: "healthcare",
    role: "Occupational Therapist",
    level: "experienced",
    template: "ward",
    blurb: {
      uk: "A Band 6 community occupational therapist with 8 years in the NHS, who assesses people at home after a hospital stay or a fall and halved the wait for a first visit.",
      us: "A licensed occupational therapist with 8 years in acute care and home health, who evaluates patients at home after a hospital stay or a fall and halved falls on the caseload.",
    },
    person: { name: "Orla Fitzsimons", email: "orla.fitzsimons@example.com", phone: { uk: "07700 900695", us: "(321) 555-0118" }, location: { uk: "Ipswich", us: "Orlando, FL" } },
    profile: {
      uk: "Band 6 occupational therapist registered with the Health and Care Professions Council (HCPC), with 8 years in the NHS on acute wards and in community rehabilitation. Holds a caseload of around 22 adults at home after hospital discharge or a fall, and completes around 8 home assessments a week. Cut the average wait for a first home visit from 12 to 6 working days in 2024, and raised patients' average Canadian Occupational Performance Measure (COPM) scores by 2.8 points in 2025. Supervises 2 occupational therapists and 3 rehabilitation assistants, and educates 3 students a year on placement.",
      us: "Licensed occupational therapist with 8 years in acute care and home health in the Orlando area, the last 3 seeing patients in their own homes. Carries a caseload of around 22 home health patients after hospital discharge or a fall, and completes around 8 home safety evaluations a week. Cut falls among high-risk patients on the caseload from 18% to 9% in 2024, and raised patients' average Canadian Occupational Performance Measure (COPM) scores by 2.8 points in 2025. Supervises 2 certified occupational therapy assistants and teaches 3 students a year on fieldwork.",
    },
    experience: [
      {
        title: { uk: "Occupational Therapist (Band 6), Community Rehabilitation", us: "Occupational Therapist, Home Health" },
        org: { uk: "Saxmere Community Health NHS Trust", us: "Saxmere Home Health" },
        location: { uk: "Ipswich", us: "Orlando, FL" },
        start: "2023-02",
        current: true,
        bullets: [
          {
            uk: "Hold a caseload of around 22 adults at home after hospital discharge or a fall, seeing 5 to 6 patients a day across Ipswich and east Suffolk",
            us: "Carry a caseload of around 22 home health patients after hospital discharge or a fall, seeing 5 to 6 patients a day across Orange and Seminole counties",
          },
          {
            uk: "Complete around 8 home assessments a week, ordering equipment such as stair rails, shower chairs and hoists, with 94% of urgent orders delivered within 48 hours",
            us: "Complete around 8 home safety evaluations a week, ordering equipment such as grab bars, shower chairs and hospital beds, with 94% of urgent orders delivered within 48 hours",
          },
          {
            uk: "Cut the average wait for a first home visit from 12 to 6 working days in 2024 through phone triage of new referrals within 24 hours",
            us: "Cut falls among high-risk patients on the caseload from 18% to 9% in 2024 by adding a falls screen and home exercise plan to each first visit",
          },
          {
            uk: "Raised patients' average Canadian Occupational Performance Measure (COPM) scores by 2.8 points for performance in 2025, against a team average of 2.1",
            us: "Raised patients' average Canadian Occupational Performance Measure (COPM) scores by 2.8 points for performance in 2025, against an agency average of 2.1",
          },
          {
            uk: "Wrote 14 reports for major adaptations such as level-access showers and stair lifts in 2025, with 13 approved for Disabled Facilities Grants",
            us: "Wrote home modification plans for 14 patients in 2025, such as ramps and walk-in showers, with 12 completed through local grants and family funding",
          },
          {
            uk: "Supervise 2 occupational therapists and 3 rehabilitation assistants, and educate 3 occupational therapy students a year on 10-week placements",
            us: "Supervise 2 certified occupational therapy assistants, and teach 3 occupational therapy students a year on 12-week fieldwork placements",
          },
        ],
      },
      {
        title: { uk: "Occupational Therapist, Acute Medicine and Frailty", us: "Occupational Therapist, Acute Care" },
        org: { uk: "Gippeswyk Hospital NHS Foundation Trust", us: "Citrus Crown Medical Center" },
        location: { uk: "Ipswich", us: "Orlando, FL" },
        start: "2018-09",
        end: "2023-01",
        bullets: [
          {
            uk: "Assessed around 8 patients a day on 2 acute medical wards and the frailty unit, planning safe discharges home or to care homes",
            us: "Evaluated around 8 patients a day on medical, orthopedic and stroke units, planning discharge home, to inpatient rehabilitation or to a skilled nursing facility",
          },
          {
            uk: "Cut the average length of stay on the frailty unit from 9 to 7 days in 2022 with the ward team, by starting assessments on the day of admission",
            us: "Cut the average length of stay on the geriatric unit from 6 to 5 days in 2022 with the unit team, by starting evaluations on the day of admission",
          },
          {
            uk: "Led around 3 home access visits a week with patients before discharge, arranging equipment for the day they went home",
            us: "Taught safe patient handling to around 40 new nurses a year in 2-hour sessions at the hospital's nursing orientation",
          },
          {
            uk: "Completed 4 rotations in acute medicine, orthopaedics, stroke and the emergency department from 2018 to 2021, then moved to Band 6 in acute medicine",
            us: "Rotated through orthopedics, stroke, intensive care and the emergency department from 2018 to 2020, then moved to the medical units",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Occupational Therapy", us: "Master of Science in Occupational Therapy" },
        org: { uk: "University of Essex", us: "Florida Gulf Coast University" },
        end: "2018",
        grade: { uk: "First", us: "GPA 3.8" },
      },
    ],
    certificates: [
      {
        title: { uk: "Registered Occupational Therapist", us: "Occupational Therapist, Registered (OTR)" },
        org: { uk: "Health and Care Professions Council", us: "National Board for Certification in Occupational Therapy" },
        end: "2018",
      },
      {
        title: { uk: "Professional Member", us: "Licensed Occupational Therapist" },
        org: { uk: "Royal College of Occupational Therapists", us: "Florida Board of Occupational Therapy" },
        end: "2018",
      },
      {
        title: { uk: "Accreditation of Practice Placement Educators", us: "Certified Aging in Place Specialist (CAPS)" },
        org: { uk: "Royal College of Occupational Therapists", us: "National Association of Home Builders" },
        end: "2022",
      },
    ],
    skills: [
      { uk: "Home assessments", us: "Home safety evaluations" },
      "Equipment",
      { uk: "Phone triage", us: "Falls screening" },
      "Canadian Occupational Performance Measure",
      { uk: "Major adaptations", us: "Home modification plans" },
      { uk: "Disabled Facilities Grants", us: "Safe patient handling" },
      "Discharge planning",
      { uk: "Frailty", us: "Orthopedics" },
      { uk: "Access visits", us: "Fieldwork placements" },
      { uk: "Student placements", us: "Inpatient rehabilitation" },
    ],
    names: ["Orla", "Fitzsimons", "Saxmere", "Gippeswyk", "Breckmoor", "Ipswich", "Suffolk", "Orlando", "Seminole"],
    letter: {
      job: {
        title: { uk: "Senior Occupational Therapist (Band 7), Community Rehabilitation", us: "Lead Occupational Therapist, Home Health" },
        employer: { uk: "Breckmoor Health NHS Trust", us: "Breckmoor Home Care" },
        advert: {
          uk: `Senior Occupational Therapist (Band 7), Community Rehabilitation
Breckmoor Health NHS Trust, Ipswich

Breckmoor Health NHS Trust provides community health services across Suffolk. Our community rehabilitation team of 30 sees adults at home after a hospital stay or a fall, so they can stay safe and independent.

The role
You will hold a complex caseload, lead a team of 4 occupational therapists and 3 rehabilitation assistants, and help us cut waiting times for a first visit.

What we are looking for
- Registration with the HCPC
- At least 5 years as an occupational therapist, including community work
- Experience of home assessments, equipment and major adaptations
- Evidence of improving outcomes or waiting times
- Experience supervising staff and students

Salary £47,810 to £54,710 a year`,
          us: `Lead Occupational Therapist, Home Health
Breckmoor Home Care, Orlando, FL

Breckmoor Home Care is a home health agency serving 1,200 patients across Orange, Seminole and Osceola counties.

The role
You will carry a caseload of home health patients, lead a team of 5 occupational therapists and 4 occupational therapy assistants, and grow our falls prevention program.

What we are looking for
- A Florida occupational therapy license and NBCOT certification
- At least 5 years as an occupational therapist, including home health
- Experience with home safety evaluations, equipment and home modifications
- Evidence of improving patient outcomes or reducing falls
- Experience supervising assistants and fieldwork students

Pay $95,000 to $108,000 a year`,
        },
      },
      reason: {
        uk: "I want to lead a community rehabilitation team and keep working with people in their own homes.",
        us: "I want to lead a home health therapy team and keep working with patients in their own homes.",
      },
      paragraphs: [
        {
          uk: "I was glad to read that Breckmoor Health NHS Trust is looking for a Senior Occupational Therapist for its community rehabilitation team. I want to lead a community rehabilitation team and keep working with people in their own homes.",
          us: "I was glad to read that Breckmoor Home Care is looking for a Lead Occupational Therapist for its home health team. I want to lead a home health therapy team and keep working with patients in their own homes.",
        },
        {
          uk: "At Saxmere Community Health NHS Trust I hold a caseload of around 22 adults at home after hospital discharge or a fall, seeing 5 to 6 patients a day across Ipswich and east Suffolk. I complete around 8 home assessments a week, ordering equipment such as stair rails, shower chairs and hoists, with 94% of urgent orders delivered within 48 hours. In 2025 I wrote 14 reports for major adaptations such as level-access showers and stair lifts, with 13 approved for Disabled Facilities Grants.",
          us: "At Saxmere Home Health I carry a caseload of around 22 home health patients after hospital discharge or a fall, seeing 5 to 6 patients a day across Orange and Seminole counties. I complete around 8 home safety evaluations a week, ordering equipment such as grab bars, shower chairs and hospital beds, with 94% of urgent orders delivered within 48 hours. In 2025 I wrote home modification plans for 14 patients, such as ramps and walk-in showers, with 12 completed through local grants and family funding.",
        },
        {
          uk: "Your advert asks for evidence of improving outcomes or waiting times. In 2024 I cut the average wait for a first home visit from 12 to 6 working days through phone triage of new referrals within 24 hours. I also raised patients' average Canadian Occupational Performance Measure (COPM) scores by 2.8 points for performance in 2025, against a team average of 2.1.",
          us: "Your advert asks for evidence of improving patient outcomes or reducing falls. In 2024 I cut falls among high-risk patients on the caseload from 18% to 9% by adding a falls screen and home exercise plan to each first visit. I also raised patients' average Canadian Occupational Performance Measure (COPM) scores by 2.8 points for performance in 2025, against an agency average of 2.1.",
        },
        {
          uk: "You are also looking for experience supervising staff and students. I supervise 2 occupational therapists and 3 rehabilitation assistants, and I educate 3 occupational therapy students a year on 10-week placements. I am registered with the Health and Care Professions Council (HCPC).",
          us: "You are also looking for experience supervising assistants and fieldwork students. I supervise 2 certified occupational therapy assistants, and I teach 3 occupational therapy students a year on 12-week fieldwork placements. I am licensed in Florida.",
        },
        {
          uk: "My CV is attached. Thank you for your time, and I would be glad to meet you to discuss the post.",
          us: "My resume is attached. Thank you for your time, and I would be glad to meet you to discuss the position.",
        },
      ],
    },
  },
];
