import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** Phase 3, batch 3 (28 Nov 2026): 30 roles added to the industry packs. */
export const MORE_U: ExampleSpec[] = [
  {
    id: "field-sales-rep",
    industry: "sales",
    role: { uk: "Field Sales Representative", us: "Outside Sales Representative" },
    level: "experienced",
    template: "harbour",
    blurb: {
      uk: "A field sales representative with 7 years in pet food, covering 165 pet shops, farm stores and vets and reaching 114% of target in 2025.",
      us: "An outside sales representative with 7 years in pet food, covering 165 pet stores, feed stores and vets and reaching 114% of quota in 2025.",
    },
    person: { name: "Bryony Lathbury", email: "bryony.lathbury@example.com", phone: { uk: "07700 900726", us: "(661) 555-0149" }, location: { uk: "Lincoln", us: "Bakersfield, CA" } },
    profile: {
      uk: "Field sales representative with 7 years in pet food and animal health, the last 4 covering a territory of 165 independent pet shops, farm stores and veterinary practices. Grew territory sales from £1.9 million to £2.6 million in 3 years and reached 114% of target in 2025. Has opened 52 new accounts since 2022 and makes around 32 visits a week, logging each in Salesforce. Ranked first of 14 representatives for new business in 2024.",
      us: "Outside sales representative with 7 years in pet food and animal health, the last 4 covering a territory of 165 independent pet stores, feed stores and veterinary clinics. Grew territory sales from $2.4 million to $3.3 million in 3 years and reached 114% of quota in 2025. Has opened 52 new accounts since 2022 and makes around 32 visits a week, logging each in Salesforce. Ranked first of 14 representatives for new business in 2024.",
    },
    experience: [
      {
        title: { uk: "Field Sales Representative", us: "Outside Sales Representative" },
        org: "Burrowfield Pet Foods",
        location: { uk: "Lincoln", us: "Bakersfield, CA" },
        start: "2022-03",
        current: true,
        bullets: [
          {
            uk: "Cover a territory of 165 independent pet shops, farm stores and veterinary practices across Lincolnshire, Nottinghamshire and South Yorkshire, making around 32 visits a week",
            us: "Cover a territory of 165 independent pet stores, feed stores and veterinary clinics across Kern, Tulare and Kings counties, making around 32 visits a week",
          },
          {
            uk: "Grew territory sales from £1.9 million to £2.6 million in 3 years by moving 40 smaller accounts onto monthly visits and range reviews",
            us: "Grew territory sales from $2.4 million to $3.3 million in 3 years by moving 40 smaller accounts onto monthly visits and shelf reviews",
          },
          {
            uk: "Reached 114% of the yearly sales target in 2025 and 108% in 2024, against a team average of 97%",
            us: "Reached 114% of the yearly sales quota in 2025 and 108% in 2024, against a team average of 97%",
          },
          {
            uk: "Opened 52 new accounts since 2022, including 9 veterinary practices that now stock the full clinical diet range",
            us: "Opened 52 new accounts since 2022, including 9 veterinary clinics that now stock the full prescription diet line",
          },
          "Ran 18 in-store open days and 6 clinic lunch-and-learn talks in 2025, lifting sales at those accounts by an average of 22% in the following 3 months",
          "Logged 1,480 visits and orders in Salesforce in 2025, keeping the monthly territory forecast within 4% of actual sales",
        ],
      },
      {
        title: { uk: "Telesales Executive", us: "Inside Sales Representative" },
        org: "Burrowfield Pet Foods",
        location: { uk: "Lincoln", us: "Bakersfield, CA" },
        start: "2019-06",
        end: "2022-02",
        bullets: [
          {
            uk: "Called around 60 accounts a day, taking repeat orders and selling new lines to 420 pet shops and farm stores across the East Midlands",
            us: "Called around 60 accounts a day, taking repeat orders and selling new lines to 420 pet stores and feed stores across the Central Valley",
          },
          {
            uk: "Raised the average order from £410 to £520 in 18 months by suggesting add-on lines such as treats, bedding and flea collars",
            us: "Raised the average order from $520 to $660 in 18 months by suggesting add-on lines such as treats, bedding and flea collars",
          },
          "Won back 38 lapsed accounts in 2021 by calling each with an offer based on what it had bought before",
          "Covered the territories of 2 field representatives during their leave in 2021, visiting 70 accounts in 6 weeks",
        ],
      },
      {
        title: { uk: "Sales Assistant", us: "Sales Associate" },
        org: "Fulbeck Farm Supplies",
        location: { uk: "Grantham", us: "Delano, CA" },
        start: "2016-09",
        end: "2019-05",
        bullets: [
          {
            uk: "Served around 80 farmers, horse owners and pet owners a day at the trade counter of a busy agricultural merchant",
            us: "Served around 80 farmers, horse owners and pet owners a day at the counter of a busy farm and feed store",
          },
          "Took over the pet food aisle in 2018, reordering 300 product lines each week and cutting out-of-date stock by 30%",
          "Took around 40 phone orders a week from farms and stables, picking each order for collection or delivery",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business Management", us: "Bachelor of Science in Business Administration" },
        org: { uk: "University of Lincoln", us: "California State University, Bakersfield" },
        end: "2016",
        grade: { uk: "2:1", us: "GPA 3.3" },
      },
    ],
    certificates: [
      {
        title: { uk: "Suitably Qualified Person (SQP)", us: "Certified Professional Sales Person (CPSP)" },
        org: { uk: "Animal Medicines Training Regulatory Authority", us: "National Association of Sales Professionals" },
        end: "2023",
      },
    ],
    skills: [
      "Territory sales",
      "New accounts",
      { uk: "Range reviews", us: "Shelf reviews" },
      "Salesforce",
      "Forecast",
      { uk: "Veterinary practices", us: "Veterinary clinics" },
      "In-store open days",
      "Repeat orders",
      "Lapsed accounts",
      "Add-on lines",
    ],
    names: ["Bryony", "Lathbury", "Burrowfield", "Fulbeck", "Thornhay", "Petcare", "Grantham", "Lincolnshire", "Nottinghamshire", "Bakersfield", "Tulare", "Delano"],
    letter: {
      job: {
        title: { uk: "Field Sales Representative", us: "Outside Sales Representative" },
        employer: "Thornhay Petcare",
        advert: {
          uk: `Field Sales Representative
Thornhay Petcare, Lincolnshire and Nottinghamshire

Thornhay Petcare makes natural dog and cat food and is growing its sales to independent pet shops, farm stores and veterinary practices across the East Midlands.

The role
You will manage and grow a territory of around 150 accounts, visiting customers, opening new accounts and running in-store events.

What we are looking for
- At least 3 years in field sales, ideally in pet food or animal health
- A record of hitting and beating sales targets
- Experience winning new business
- Confident using a CRM such as Salesforce
- An SQP qualification, or willingness to work towards one
- A full driving licence

Salary £32,000 to £36,000, plus bonus and a company car`,
          us: `Outside Sales Representative
Thornhay Petcare, Bakersfield, CA

Thornhay Petcare makes natural dog and cat food and is growing its sales to independent pet stores, feed stores and veterinary clinics across the Central Valley.

The role
You will manage and grow a territory of around 150 accounts, visiting customers, opening new accounts and running in-store events.

What we are looking for
- At least 3 years in outside sales, ideally in pet food or animal health
- A record of hitting and beating sales quotas
- Experience winning new business
- Confident using a CRM such as Salesforce
- A valid driver's license and a clean driving record

Salary $58,000 to $64,000, plus commission and a company car`,
        },
      },
      reason: {
        uk: "I want to keep selling to independent pet shops and vets, for a company whose natural food range I can recommend.",
        us: "I want to keep selling to independent pet stores and vets, for a company whose natural food line I can recommend.",
      },
      paragraphs: [
        {
          uk: "Thornhay Petcare is growing its sales to independent pet shops, farm stores and veterinary practices across the East Midlands, and I would like to be part of that as your Field Sales Representative. I want to keep selling to independent pet shops and vets, for a company whose natural food range I can recommend.",
          us: "Thornhay Petcare is growing its sales to independent pet stores, feed stores and veterinary clinics across the Central Valley, and I would like to be part of that as your Outside Sales Representative. I want to keep selling to independent pet stores and vets, for a company whose natural food line I can recommend.",
        },
        {
          uk: "At Burrowfield Pet Foods I cover a territory of 165 independent pet shops, farm stores and veterinary practices across Lincolnshire, Nottinghamshire and South Yorkshire, making around 32 visits a week. Your advert asks for a record of hitting and beating sales targets. I reached 114% of the yearly sales target in 2025 and 108% in 2024, against a team average of 97%. I also grew territory sales from £1.9 million to £2.6 million in 3 years by moving 40 smaller accounts onto monthly visits and range reviews.",
          us: "At Burrowfield Pet Foods I cover a territory of 165 independent pet stores, feed stores and veterinary clinics across Kern, Tulare and Kings counties, making around 32 visits a week. Your advert asks for a record of hitting and beating sales quotas. I reached 114% of the yearly sales quota in 2025 and 108% in 2024, against a team average of 97%. I also grew territory sales from $2.4 million to $3.3 million in 3 years by moving 40 smaller accounts onto monthly visits and shelf reviews.",
        },
        {
          uk: "You are also looking for experience winning new business. I have opened 52 new accounts since 2022, including 9 veterinary practices that now stock the full clinical diet range. I also ran 18 in-store open days and 6 clinic lunch-and-learn talks in 2025, lifting sales at those accounts by an average of 22% in the following 3 months.",
          us: "You are also looking for experience winning new business. I have opened 52 new accounts since 2022, including 9 veterinary clinics that now stock the full prescription diet line. I also ran 18 in-store open days and 6 clinic lunch-and-learn talks in 2025, lifting sales at those accounts by an average of 22% in the following 3 months.",
        },
        {
          uk: "Your advert mentions Salesforce. In 2025 I logged 1,480 visits and orders in Salesforce, keeping the monthly territory forecast within 4% of actual sales. I am also a Suitably Qualified Person (SQP) with the Animal Medicines Training Regulatory Authority.",
          us: "Your advert mentions Salesforce. In 2025 I logged 1,480 visits and orders in Salesforce, keeping the monthly territory forecast within 4% of actual sales. I am also a Certified Professional Sales Person (CPSP) with the National Association of Sales Professionals.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "marketing-executive",
    industry: "marketing",
    role: { uk: "Marketing Executive", us: "Marketing Coordinator" },
    level: "early",
    template: "clearline",
    blurb: {
      uk: "A marketing executive two years into running seasonal campaigns, emails, social media and events for a family-run group of 5 garden centres.",
      us: "A marketing coordinator two years into running seasonal campaigns, emails, social media and events for a family-owned group of 5 garden centers.",
    },
    person: { name: "Eleri Penhaligon", email: "eleri.penhaligon@example.com", phone: { uk: "07700 900727", us: "(805) 555-0150" }, location: { uk: "Exeter", us: "Ventura, CA" } },
    profile: {
      uk: "Marketing executive with 2 years at a family-run group of 5 garden centres, planning seasonal campaigns, a weekly email to 41,000 loyalty club members, social media and around 30 events a year. Grew Instagram followers from 6,200 to 15,800 in 2 years and sold all 2,400 Christmas grotto tickets for the first time in 2025. Updates the event, offer and product pages on the website each week in WordPress. Graduated in Marketing from the University of Plymouth in 2024.",
      us: "Marketing coordinator with 2 years at a family-owned group of 5 garden centers, planning seasonal campaigns, a weekly email to 41,000 rewards club members, social media and around 30 events a year. Grew Instagram followers from 6,200 to 15,800 in 2 years and sold all 2,400 Santa's Workshop tickets for the first time in 2025. Updates the event, offer and product pages on the website each week in WordPress. Graduated in Business from California State University Channel Islands in 2024.",
    },
    experience: [
      {
        title: { uk: "Marketing Executive", us: "Marketing Coordinator" },
        org: { uk: "Hedgecombe Garden Centres", us: "Hedgecombe Garden Centers" },
        location: { uk: "Exeter", us: "Ventura, CA" },
        start: "2024-07",
        current: true,
        bullets: [
          {
            uk: "Plan and run 6 seasonal campaigns a year across email, social media, in-store posters and the website, from spring planting to Christmas",
            us: "Plan and run 6 seasonal campaigns a year across email, social media, in-store posters and the website, from spring planting to the holidays",
          },
          {
            uk: "Write and send a weekly email to 41,000 loyalty club members in Mailchimp, raising the open rate from 24% to 38% by testing subject lines and send times",
            us: "Write and send a weekly email to 41,000 rewards club members in Mailchimp, raising the open rate from 24% to 38% by testing subject lines and send times",
          },
          "Grew Instagram followers from 6,200 to 15,800 and Facebook followers from 11,000 to 17,500 in 2 years, posting 5 times a week, including short plant care videos",
          {
            uk: "Organise around 30 events a year, such as workshops, plant fairs and the Christmas grotto, and sold all 2,400 grotto tickets for the first time in 2025",
            us: "Organize around 30 events a year, such as workshops, plant fairs and Santa's Workshop, and sold all 2,400 Santa's Workshop tickets for the first time in 2025",
          },
          {
            uk: "Update the event, offer and product pages on the WordPress website each week, and added 120 product pages for the click-and-collect launch in 2025",
            us: "Update the event, offer and product pages on the WordPress website each week, and added 120 product pages for the curbside pickup launch in 2025",
          },
          {
            uk: "Report campaign results to the managing director each month, and moved £8,000 of the yearly print budget into social media advertising in 2025 after showing it brought 3 times as many event bookings",
            us: "Report campaign results to the general manager each month, and moved $10,000 of the yearly print budget into social media advertising in 2025 after showing it brought 3 times as many event bookings",
          },
        ],
      },
      {
        title: "Marketing Intern",
        org: "Oxcombe Cider",
        location: { uk: "Crediton", us: "Ojai, CA" },
        start: "2023-06",
        end: "2023-09",
        bullets: [
          "Wrote and scheduled 60 social media posts over 12 weeks for a family cider maker, with engagement up 35% on the same months of 2022",
          "Ran a stand at 4 summer food festivals, signing up 640 people to the mailing list",
          "Updated 25 product pages on the online shop with new photos and tasting notes",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Marketing", us: "Bachelor of Science in Business, Marketing" },
        org: { uk: "University of Plymouth", us: "California State University Channel Islands" },
        end: "2024",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      { title: "Google Analytics Certification", org: "Google", end: "2025" },
      {
        title: { uk: "Level 4 Certificate in Professional Marketing", us: "Email Marketing Certification" },
        org: { uk: "Chartered Institute of Marketing", us: "HubSpot Academy" },
        end: "2025",
      },
    ],
    skills: [
      "Seasonal campaigns",
      "Email campaigns",
      "Mailchimp",
      "Subject line testing",
      "Instagram",
      "Short videos",
      "Events",
      "WordPress",
      "Product pages",
      "Campaign reporting",
    ],
    names: ["Eleri", "Penhaligon", "Hedgecombe", "Oxcombe", "Wetherdown", "Exeter", "Crediton", "Ojai", "Ventura", "WordPress", "HubSpot"],
    letter: {
      job: {
        title: { uk: "Marketing Executive", us: "Marketing Coordinator" },
        employer: "Wetherdown Outdoor",
        advert: {
          uk: `Marketing Executive
Wetherdown Outdoor, Exeter

Wetherdown Outdoor sells outdoor clothing and camping gear from 9 stores across the South West and online.

The role
You will plan and run our seasonal campaigns, write our customer emails, look after our social media and organise in-store events.

What we are looking for
- At least 1 year in a marketing role
- Experience planning campaigns across several channels
- Experience with Mailchimp or a similar email tool
- Confident creating content for Instagram and Facebook
- Experience organising events
- Able to report on results

Salary £25,000 to £28,000`,
          us: `Marketing Coordinator
Wetherdown Outdoor, Ventura, CA

Wetherdown Outdoor sells outdoor clothing and camping gear from 9 stores across Southern California and online.

The role
You will plan and run our seasonal campaigns, write our customer emails, look after our social media and organize in-store events.

What we are looking for
- At least 1 year in a marketing role
- Experience planning campaigns across several channels
- Experience with Mailchimp or a similar email tool
- Confident creating content for Instagram and Facebook
- Experience organizing events
- Able to report on results

Salary $50,000 to $56,000`,
        },
      },
      reason: "I want to run campaigns for a larger retailer, with stores across the region and an online shop.",
      paragraphs: [
        {
          uk: "I am writing in response to your advert for a Marketing Executive at Wetherdown Outdoor. I want to run campaigns for a larger retailer, with stores across the region and an online shop.",
          us: "I am writing in response to your advert for a Marketing Coordinator at Wetherdown Outdoor. I want to run campaigns for a larger retailer, with stores across the region and an online shop.",
        },
        {
          uk: "At Hedgecombe Garden Centres I plan and run 6 seasonal campaigns a year across email, social media, in-store posters and the website, from spring planting to Christmas. Your advert asks for experience with Mailchimp. I write and send a weekly email to 41,000 loyalty club members in Mailchimp, raising the open rate from 24% to 38% by testing subject lines and send times.",
          us: "At Hedgecombe Garden Centers I plan and run 6 seasonal campaigns a year across email, social media, in-store posters and the website, from spring planting to the holidays. Your advert asks for experience with Mailchimp. I write and send a weekly email to 41,000 rewards club members in Mailchimp, raising the open rate from 24% to 38% by testing subject lines and send times.",
        },
        {
          uk: "You are also looking for someone confident creating content for Instagram and Facebook. I grew Instagram followers from 6,200 to 15,800 and Facebook followers from 11,000 to 17,500 in 2 years, posting 5 times a week. I also organise around 30 events a year, such as workshops, plant fairs and the Christmas grotto, and I sold all 2,400 grotto tickets for the first time in 2025.",
          us: "You are also looking for someone confident creating content for Instagram and Facebook. I grew Instagram followers from 6,200 to 15,800 and Facebook followers from 11,000 to 17,500 in 2 years, posting 5 times a week. I also organize around 30 events a year, such as workshops, plant fairs and Santa's Workshop, and I sold all 2,400 Santa's Workshop tickets for the first time in 2025.",
        },
        {
          uk: "Your advert also asks for someone able to report on results. I report campaign results to the managing director each month. In 2025 I moved £8,000 of the yearly print budget into social media advertising after showing it brought 3 times as many event bookings.",
          us: "Your advert also asks for someone able to report on results. I report campaign results to the general manager each month. In 2025 I moved $10,000 of the yearly print budget into social media advertising after showing it brought 3 times as many event bookings.",
        },
        {
          uk: "Thank you for reading my application. My CV is attached, and I would welcome the chance to meet you.",
          us: "Thank you for reading my application. My resume is attached, and I would welcome the chance to meet you.",
        },
      ],
    },
  },
  {
    id: "mobile-developer",
    industry: "software",
    role: "Mobile Developer",
    level: "experienced",
    template: "index",
    blurb: "A mobile developer with 6 years building iOS and Android apps in Swift and Kotlin, who raised a fitness booking app's rating from 3.8 to 4.7 stars.",
    person: { name: "Kamil Wierzbicki", email: "kamil.wierzbicki@example.com", phone: { uk: "07700 900728", us: "(951) 555-0151" }, location: { uk: "Manchester", us: "Riverside, CA" } },
    profile: "Mobile developer with 6 years building iOS and Android apps, the last 3 on a fitness class booking app with 480,000 monthly active users. Writes Swift and SwiftUI on iOS and Kotlin and Jetpack Compose on Android, shipping a release every 2 weeks. Raised the App Store rating from 3.8 to 4.7 in 2 years and crash-free sessions from 98.6% to 99.8% in 18 months. Built 9 client apps in React Native and Flutter at a digital agency before that.",
    experience: [
      {
        title: "Mobile Developer",
        org: "Fettle",
        location: { uk: "Manchester", us: "Riverside, CA" },
        start: "2023-09",
        current: true,
        bullets: [
          "Build and maintain the iOS app in Swift and SwiftUI and the Android app in Kotlin and Jetpack Compose for 480,000 monthly active users booking gym and studio classes",
          "Raised the App Store rating from 3.8 to 4.7 and the Google Play rating from 3.6 to 4.6 in 2 years by fixing the 30 most reported faults and adding in-app feedback",
          "Raised crash-free sessions from 98.6% to 99.8% in 18 months by adding Firebase Crashlytics alerts and fixing the 25 crashes that affected the most users",
          "Cut app start time from 3.4 seconds to 1.3 seconds on older Android phones by loading the timetable in the background and caching images",
          "Moved releases to a 2-week cycle with automated builds in Bitrise and GitHub Actions, shipping 52 releases in 2 years with no rollbacks",
          "Built offline booking and Apple Wallet and Google Wallet passes in 2024, now used by 140,000 members to check in at 260 gyms",
        ],
      },
      {
        title: "Mobile Developer",
        org: "Corlett Digital",
        location: { uk: "Manchester", us: "Irvine, CA" },
        start: "2020-07",
        end: "2023-08",
        bullets: [
          "Built 9 apps for clients in React Native and Flutter, from a dental booking app to a festival guide used by 60,000 people over one weekend",
          {
            uk: "Led the Flutter rebuild of a housing association's repairs app, cutting repair requests sent back for missing details by 40% with photo uploads and a step-by-step form",
            us: "Led the Flutter rebuild of a property management company's maintenance app, cutting repair requests sent back for missing details by 40% with photo uploads and a step-by-step form",
          },
          "Wrote automated tests for 4 apps with Jest and Detox, raising test coverage from 20% to 70%",
          "Prepared 14 app releases for the App Store and Google Play in 2022, each passing Apple's review the first time",
          "Mentored 2 junior developers in their first year, reviewing around 15 pull requests a week and pairing with them on 3 client apps",
        ],
      },
    ],
    projects: [
      {
        title: "Open-source Android library",
        org: "Independent",
        start: "2022-05",
        current: true,
        bullets: [
          "Wrote and maintain a Kotlin library for showing class timetables in Jetpack Compose, with 1,900 stars on GitHub and around 12,000 downloads a month",
          "Reviewed and merged 85 pull requests from 30 outside contributors since 2022, and wrote the setup guide used by new contributors",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Computer Science", us: "Bachelor of Science in Computer Science" },
        org: { uk: "University of Salford", us: "University of California, Riverside" },
        end: "2020",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    skills: ["Swift", "SwiftUI", "Kotlin", "Jetpack Compose", "React Native", "Flutter", "Firebase Crashlytics", "Automated tests", "App Store releases", "GitHub Actions"],
    languages: [
      { name: "Polish", level: "Native" },
      { name: "English", level: "Fluent" },
    ],
    names: ["Kamil", "Wierzbicki", "Fettle", "Corlett", "Tollbar", "iOS", "SwiftUI", "Jetpack", "Crashlytics", "Bitrise", "Detox", "Riverside", "Irvine", "Salford"],
    letter: {
      job: {
        title: "Mobile Developer",
        employer: "Tollbar",
        advert: {
          uk: `Mobile Developer
Tollbar, Manchester (hybrid)

Tollbar is a parking and electric vehicle charging app used by 2.3 million drivers across the UK.

The role
You will build new features for our iOS and Android apps and help us make them faster and more reliable.

What we are looking for
- At least 4 years building mobile apps
- Strong Swift and Kotlin
- Experience with SwiftUI and Jetpack Compose
- A record of improving app stability and app store ratings
- Experience with automated builds and testing

Salary £55,000 to £65,000`,
          us: `Mobile Developer
Tollbar, Riverside, CA (hybrid)

Tollbar is a parking and electric vehicle charging app used by 2.3 million drivers across the US.

The role
You will build new features for our iOS and Android apps and help us make them faster and more reliable.

What we are looking for
- At least 4 years building mobile apps
- Strong Swift and Kotlin
- Experience with SwiftUI and Jetpack Compose
- A record of improving app stability and app store ratings
- Experience with automated builds and testing

Salary $135,000 to $155,000`,
        },
      },
      reason: "I want to work on an app that drivers use every day, and keep making it faster and more stable.",
      paragraphs: [
        "Tollbar's apps are used by 2.3 million drivers, and I would like to help make them faster and more reliable as a Mobile Developer. I want to work on an app that drivers use every day, and keep making it faster and more stable.",
        "At Fettle I build and maintain the iOS app in Swift and SwiftUI and the Android app in Kotlin and Jetpack Compose for 480,000 monthly active users booking gym and studio classes. Your advert asks for a record of improving app stability and app store ratings. I raised the App Store rating from 3.8 to 4.7 and the Google Play rating from 3.6 to 4.6 in 2 years by fixing the 30 most reported faults and adding in-app feedback. I also raised crash-free sessions from 98.6% to 99.8% in 18 months by adding Firebase Crashlytics alerts and fixing the 25 crashes that affected the most users.",
        "You are also looking for experience with automated builds and testing. I moved releases to a 2-week cycle with automated builds in Bitrise and GitHub Actions, shipping 52 releases in 2 years with no rollbacks. At Corlett Digital I wrote automated tests for 4 apps with Jest and Detox, raising test coverage from 20% to 70%.",
        "Your advert also mentions making the apps faster. I cut app start time from 3.4 seconds to 1.3 seconds on older Android phones by loading the timetable in the background and caching images.",
        CLOSE,
      ],
    },
  },
  {
    id: "construction-labourer",
    industry: "construction",
    role: { uk: "Labourer", us: "Construction Laborer" },
    level: "early",
    template: "fieldwork",
    blurb: {
      uk: "A site labourer with 2 years on new-build housing, from drainage trenches and kerbs to keeping 4 bricklayers supplied, with a CSCS Green Card.",
      us: "A construction laborer with 2 years on new home sites, from utility trenches and curb forms to keeping 4 masons supplied, with an OSHA 10 card.",
    },
    person: { name: "Shaun Keogh", email: "shaun.keogh@example.com", phone: { uk: "07700 900729", us: "(575) 555-0152" }, location: { uk: "Norwich", us: "Las Cruces, NM" } },
    profile: {
      uk: "Labourer with 2 years on new-build housing sites for a groundwork contractor, digging drainage trenches, laying kerbs and loading out materials for bricklayers. Keeps up to 4 bricklayers supplied with bricks, blocks and mortar on scaffolds 3 lifts high. Holds a Construction Skills Certification Scheme (CSCS) Green Card and has had no accidents in 2 years on site. Trained to drive a site dumper and use a plate compactor, and acts as traffic marshal for deliveries.",
      us: "Construction laborer with 2 years on new home sites for a site work contractor, digging utility trenches, building curb forms and supplying masons. Keeps up to 4 masons supplied with block, brick and mortar on scaffolding up to 3 levels high. Holds an Occupational Safety and Health Administration (OSHA) 10-Hour Construction card and has had no accidents in 2 years on site. Trained to run a skid steer and a plate compactor, and flags traffic for deliveries.",
    },
    experience: [
      {
        title: { uk: "Labourer", us: "Construction Laborer" },
        org: { uk: "Cantley Earthworks", us: "Cantley Site Works" },
        location: { uk: "Norwich", us: "Las Cruces, NM" },
        start: "2024-10",
        current: true,
        bullets: [
          {
            uk: "Dig drainage trenches and fill them back in for around 6 new homes a week on a 180-home site, working to the levels set by the site engineer",
            us: "Dig utility trenches and fill them back in for around 6 new homes a week on a 180-home subdivision, working to the grades set by the site engineer",
          },
          {
            uk: "Load out bricks, blocks and mortar for up to 4 bricklayers on scaffolds 3 lifts high, keeping each bricklayer supplied without stopping work",
            us: "Supply block, brick and mortar to up to 4 masons on scaffolding up to 3 levels high, keeping each mason working without waiting for materials",
          },
          {
            uk: "Laid around 1,200 metres of kerbs and 900 square metres of block paving for driveways and footpaths in 2025, with no rework needed after the site engineer's checks",
            us: "Built forms for around 4,000 feet of curb and 60 driveways in 2025 with the concrete crew, with no rework needed after the site engineer's checks",
          },
          {
            uk: "Act as traffic marshal for around 15 deliveries a day, guiding lorries in and out of the site with no incidents in 2 years",
            us: "Flag traffic for around 15 deliveries a day at the site entrance, guiding trucks in and out with no incidents in 2 years",
          },
          {
            uk: "Sort site waste into the right skips each day, which cut the number of mixed-waste skips the site needed by 30% in 2025",
            us: "Sort site waste into the right dumpsters each day, which cut the number of mixed-waste dumpster pickups the site needed by 30% in 2025",
          },
          {
            uk: "Drive a 3-tonne site dumper and use a plate compactor after training in 2025, moving around 40 loads of spoil a day",
            us: "Run a skid steer and a plate compactor after training in 2025, moving around 40 loads of dirt a day",
          },
        ],
      },
      {
        title: { uk: "Yard Operative", us: "Yard Associate" },
        org: { uk: "Ingleby Builders Merchants", us: "Ingleby Building Supply" },
        location: { uk: "Norwich", us: "Las Cruces, NM" },
        start: "2022-09",
        end: "2024-09",
        bullets: [
          {
            uk: "Picked and loaded around 30 trade orders a day of timber, aggregates and plasterboard for builders and site deliveries",
            us: "Picked and loaded around 30 contractor orders a day of lumber, gravel and drywall for builders and job site deliveries",
          },
          {
            uk: "Earned a counterbalance forklift licence in 2023 and unloaded around 8 lorries a week",
            us: "Earned forklift certification in 2023 and unloaded around 8 trucks a week",
          },
          "Kept the yard's stock within 1% of the system count at 4 quarterly checks in 2024",
        ],
      },
    ],
    education: [
      {
        title: { uk: "GCSEs", us: "High School Diploma" },
        org: { uk: "Wensum Valley Academy", us: "Chamisa Ridge High School" },
        location: { uk: "Norwich", us: "Las Cruces, NM" },
        end: "2022",
        grade: { uk: "5 at grades 9 to 4, including English and Maths", us: "" },
      },
    ],
    certificates: [
      {
        title: { uk: "CSCS Green Card (Labourer)", us: "OSHA 10-Hour Construction" },
        org: { uk: "Construction Skills Certification Scheme", us: "Occupational Safety and Health Administration" },
        end: "2024",
      },
      {
        title: { uk: "Level 1 Award in Health and Safety in a Construction Environment", us: "Traffic Control Flagging Certification" },
        org: { uk: "Highfield Qualifications", us: "American Traffic Safety Services Association" },
        end: "2024",
      },
    ],
    skills: [
      { uk: "Drainage trenches", us: "Utility trenches" },
      { uk: "Groundwork", us: "Site work" },
      { uk: "Loading out", us: "Supplying masons" },
      { uk: "Kerbs and block paving", us: "Curb forms" },
      { uk: "Traffic marshal", us: "Flagging" },
      { uk: "Site dumper", us: "Skid steer" },
      "Plate compactor",
      "Forklift",
      "Sorting site waste",
      { uk: "Working to levels", us: "Working to grades" },
    ],
    names: ["Shaun", "Keogh", "Cantley", "Ingleby", "Stainby", "Wensum", "Chamisa", "Highfield", "Norfolk", "Cruces"],
    letter: {
      job: {
        title: { uk: "Site Labourer", us: "Construction Laborer" },
        employer: "Stainby Homes",
        advert: {
          uk: `Site Labourer
Stainby Homes, Norwich

Stainby Homes builds around 300 new homes a year across Norfolk and Suffolk, with 5 sites running at any time.

The role
You will keep our bricklayers and groundworkers supplied, help with drainage and kerbs, and keep the site safe and tidy.

What we are looking for
- A CSCS Green Card
- At least 1 year on a building site
- Experience of groundwork, such as drainage and kerbs
- Able to load out materials for bricklayers
- A careful approach to health and safety
- A dumper or forklift ticket would be useful

Pay £13.50 an hour, with overtime available`,
          us: `Construction Laborer
Stainby Homes, Las Cruces, NM

Stainby Homes builds around 300 new homes a year across southern New Mexico, with 5 communities under construction at any time.

The role
You will keep our masons and concrete crews supplied, help with utility trenches and curb forms, and keep the job site safe and clean.

What we are looking for
- An OSHA 10-Hour Construction card
- At least 1 year on a construction site
- Experience with site work, such as trenches and concrete forms
- Able to supply masons with block, brick and mortar
- A careful approach to safety
- Skid steer or forklift experience a plus

Pay $19 an hour, with overtime available`,
        },
      },
      reason: {
        uk: "I want to work for a house builder directly, on a site where I can learn more trades.",
        us: "I want to work for a home builder directly, on a site where I can learn more trades.",
      },
      paragraphs: [
        {
          uk: "After 2 years on new-build housing sites, I would like to apply for the Site Labourer post at Stainby Homes. I want to work for a house builder directly, on a site where I can learn more trades.",
          us: "After 2 years on new home sites, I would like to apply for the Construction Laborer position at Stainby Homes. I want to work for a home builder directly, on a site where I can learn more trades.",
        },
        {
          uk: "At Cantley Earthworks I dig drainage trenches and fill them back in for around 6 new homes a week on a 180-home site, working to the levels set by the site engineer. Your advert asks for experience of groundwork, such as drainage and kerbs. In 2025 I laid around 1,200 metres of kerbs and 900 square metres of block paving for driveways and footpaths, with no rework needed after the site engineer's checks.",
          us: "At Cantley Site Works I dig utility trenches and fill them back in for around 6 new homes a week on a 180-home subdivision, working to the grades set by the site engineer. Your advert asks for experience with site work, such as trenches and concrete forms. In 2025 I built forms for around 4,000 feet of curb and 60 driveways with the concrete crew, with no rework needed after the site engineer's checks.",
        },
        {
          uk: "You also need someone able to load out materials for bricklayers. I load out bricks, blocks and mortar for up to 4 bricklayers on scaffolds 3 lifts high, keeping each bricklayer supplied without stopping work. I also drive a 3-tonne site dumper and use a plate compactor after training in 2025, and I earned a counterbalance forklift licence in 2023.",
          us: "You also need someone able to supply masons with block, brick and mortar. I supply block, brick and mortar to up to 4 masons on scaffolding up to 3 levels high, keeping each mason working without waiting for materials. I also run a skid steer and a plate compactor after training in 2025, and I earned forklift certification in 2023.",
        },
        {
          uk: "I hold a Construction Skills Certification Scheme (CSCS) Green Card and have had no accidents in 2 years on site. I also act as traffic marshal for around 15 deliveries a day, guiding lorries in and out of the site with no incidents in 2 years.",
          us: "I hold an Occupational Safety and Health Administration (OSHA) 10-Hour Construction card and have had no accidents in 2 years on site. I also flag traffic for around 15 deliveries a day at the site entrance, guiding trucks in and out with no incidents in 2 years.",
        },
        {
          uk: "Thank you for considering my application. My CV is attached, and I would welcome the chance to discuss the role.",
          us: "Thank you for considering my application. My resume is attached, and I would welcome the chance to discuss the role.",
        },
      ],
    },
  },
  {
    id: "bricklayer",
    industry: "construction",
    role: { uk: "Bricklayer", us: "Mason" },
    level: "experienced",
    template: "technical",
    blurb: {
      uk: "A bricklayer with 15 years on new homes and listed buildings, who lays around 600 bricks a day, leads a gang of 3 bricklayers and a labourer, and has trained 6 apprentices.",
      us: "A journeyman mason with 15 years on new homes, commercial buildings and historic repairs, who lays around 600 bricks a day and has trained 6 apprentices.",
    },
    person: { name: "Darius Gaskell", email: "darius.gaskell@example.com", phone: { uk: "07700 900730", us: "(254) 555-0153" }, location: { uk: "Peterborough", us: "Waco, TX" } },
    profile: {
      uk: "Bricklayer with 15 years on new-build housing and heritage repairs, holding an NVQ Level 3 Diploma in Trowel Occupations and a Construction Skills Certification Scheme (CSCS) Gold Card. Lays around 600 facing bricks a day and leads a gang of 3 bricklayers and a labourer for a brickwork contractor. Built the brickwork for 380 homes since 2019 with no brickwork defects found at National House Building Council (NHBC) inspections. Has trained 6 apprentices, all of whom passed their NVQ Level 2 the first time.",
      us: "Journeyman mason with 15 years on new homes, commercial buildings and historic repairs, including a 3-year apprenticeship and the National Center for Construction Education and Research (NCCER) Masonry Level 3 credential. Lays around 600 face bricks a day and leads a crew of 3 masons and a mason tender for a masonry contractor. Built the brick veneer for 380 homes since 2019 with no masonry defects found at city inspections. Has trained 6 apprentices, all of whom completed their apprenticeships.",
    },
    experience: [
      {
        title: { uk: "Lead Bricklayer", us: "Lead Mason" },
        org: { uk: "Wansford Brickwork", us: "Wansford Masonry" },
        location: { uk: "Peterborough", us: "Waco, TX" },
        start: "2019-03",
        current: true,
        bullets: [
          {
            uk: "Lead a gang of 3 bricklayers and a labourer on housing sites for 2 house builders, setting out each plot from the drawings",
            us: "Lead a crew of 3 masons and a mason tender on homes and commercial jobs for 4 general contractors, laying out each wall from the plans",
          },
          {
            uk: "Lay around 600 facing bricks a day on house fronts against the contractor's target of 500, keeping joints and courses level and plumb",
            us: "Lay around 600 face bricks a day on home exteriors against the contractor's target of 500, keeping joints and courses level and plumb",
          },
          {
            uk: "Built the brickwork for 380 homes since 2019 with no brickwork defects found at National House Building Council inspections",
            us: "Built the brick veneer for 380 homes since 2019 with no masonry defects found at city inspections",
          },
          {
            uk: "Built 36 chimneys and 22 brick arches on a 64-home village scheme in 2023, matching the planning drawings for the conservation area",
            us: "Laid 18,000 concrete blocks for the walls of 6 commercial buildings since 2021, including a 2-story school gym, with each wall passing third-party inspection",
          },
          {
            uk: "Trained 6 apprentices since 2019 in setting out, cutting and pointing, all of whom passed their NVQ Level 2 the first time",
            us: "Trained 6 apprentices since 2019 in layout, cutting and tooling joints, all of whom completed their apprenticeships",
          },
          {
            uk: "Cut brick waste on the gang's plots from 6% to 3% in 2025 by planning cuts and ordering each plot's bricks from a list",
            us: "Cut brick waste on the crew's homes from 6% to 3% in 2025 by planning cuts and ordering each home's bricks from a list",
          },
        ],
      },
      {
        title: { uk: "Bricklayer", us: "Restoration Mason" },
        org: { uk: "Ashcott Building Restoration", us: "Ashcott Masonry Restoration" },
        location: { uk: "Stamford", us: "Temple, TX" },
        start: "2014-09",
        end: "2019-02",
        bullets: [
          {
            uk: "Re-pointed and repaired brickwork on 45 listed buildings and churches in lime mortar, matching the original bricks and joints",
            us: "Re-pointed and repaired brickwork on 45 historic buildings and churches in lime mortar, matching the original bricks and joints",
          },
          {
            uk: "Rebuilt 120 metres of collapsed garden wall for a country estate in 2017, reusing 80% of the original bricks",
            us: "Rebuilt 400 feet of collapsed garden wall for a historic estate in 2017, reusing 80% of the original bricks",
          },
          {
            uk: "Rebuilt 28 chimney stacks on Victorian terraced houses, matching the original brick details",
            us: "Rebuilt 28 chimneys on homes from the early 1900s, matching the original brick details",
          },
          {
            uk: "Built 6 new brick boundary walls and gate piers for country houses, matching local bricks bought from reclamation yards",
            us: "Built 6 new brick boundary walls and gate piers for country homes, matching local bricks bought from salvage yards",
          },
          "Priced around 40 repair jobs a year from site surveys, winning 25 of them in 2018",
        ],
      },
      {
        title: { uk: "Apprentice Bricklayer", us: "Masonry Apprentice" },
        org: { uk: "Ashcott Building Restoration", us: "Ashcott Masonry Restoration" },
        location: { uk: "Stamford", us: "Temple, TX" },
        start: "2011-09",
        end: "2014-08",
        bullets: [
          {
            uk: "Completed a 3-year apprenticeship with NVQ Level 2 and Level 3 Diplomas in Trowel Occupations, passing each the first time",
            us: "Completed a 3-year apprenticeship with NCCER Masonry Levels 1 to 3, passing each the first time",
          },
          {
            uk: "Laid concrete blocks for foundations and inner walls on around 30 house extensions",
            us: "Laid concrete block for foundations and garden walls on around 30 home additions",
          },
          "Mixed lime mortar and raked out joints for re-pointing on 20 old buildings",
        ],
      },
    ],
    education: [
      {
        title: { uk: "NVQ Level 3 Diploma in Trowel Occupations (Construction)", us: "Certificate in Masonry" },
        org: { uk: "Peterborough College", us: "Texas State Technical College" },
        start: "2011",
        end: "2014",
      },
    ],
    certificates: [
      {
        title: { uk: "CSCS Gold Card (Advanced Craft)", us: "NCCER Masonry Level 3" },
        org: { uk: "Construction Skills Certification Scheme", us: "National Center for Construction Education and Research" },
        end: "2014",
      },
      {
        title: { uk: "Abrasive Wheels Training", us: "OSHA 30-Hour Construction Card" },
        org: { uk: "Construction Industry Training Board", us: "Occupational Safety and Health Administration" },
        end: "2024",
      },
    ],
    skills: [
      { uk: "Facing bricks", us: "Face brick" },
      { uk: "Concrete blocks", us: "Concrete block" },
      { uk: "Setting out", us: "Laying out walls" },
      { uk: "Brick arches", us: "Brick veneer" },
      { uk: "Chimney stacks", us: "Chimneys" },
      "Lime mortar",
      "Re-pointing",
      { uk: "Listed buildings", us: "Historic buildings" },
      { uk: "Leading a gang", us: "Leading a crew" },
      "Training apprentices",
    ],
    names: ["Darius", "Gaskell", "Wansford", "Ashcott", "Kelstern", "Stamford", "Peterborough", "Waco"],
    letter: {
      job: {
        title: { uk: "Bricklayer", us: "Mason" },
        employer: { uk: "Kelstern Homes", us: "Kelstern Builders" },
        advert: {
          uk: `Bricklayer
Kelstern Homes, Peterborough

Kelstern Homes builds around 400 new homes a year across Cambridgeshire and Lincolnshire, including village schemes with detailed brickwork.

The role
You will build house fronts, chimneys and brick details on our housing sites, working to a high standard of finish.

What we are looking for
- An NVQ Level 2 or 3 in bricklaying
- A CSCS Blue or Gold Card
- At least 5 years of bricklaying on new homes
- Experience of decorative details such as arches and chimneys
- Experience leading a gang and training apprentices
- A strong record at NHBC inspections

Pay £24 to £28 an hour`,
          us: `Mason
Kelstern Builders, Waco, TX

Kelstern Builders builds new homes and commercial buildings across Central Texas, with brick and stone on every project.

The role
You will lay brick and block on our homes and commercial jobs, working to a high standard of finish.

What we are looking for
- Journeyman-level masonry skills, through an apprenticeship or equivalent experience
- At least 5 years of masonry on homes or commercial buildings
- Experience with brick veneer and concrete block
- Experience leading a crew and training apprentices
- A strong record at inspections
- An OSHA 10-Hour or 30-Hour card

Pay $28 to $34 an hour`,
        },
      },
      reason: {
        uk: "I want to work directly for a house builder and spend more of my time on detailed brickwork.",
        us: "I want to work directly for a builder and spend more of my time on detailed brickwork.",
      },
      paragraphs: [
        {
          uk: "Detailed brickwork on village schemes is the work I want to do most, so I am applying for the Bricklayer post at Kelstern Homes. I want to work directly for a house builder and spend more of my time on detailed brickwork.",
          us: "Detailed brickwork on homes and commercial buildings is the work I want to do most, so I am applying for the Mason position at Kelstern Builders. I want to work directly for a builder and spend more of my time on detailed brickwork.",
        },
        {
          uk: "At Wansford Brickwork I lead a gang of 3 bricklayers and a labourer on housing sites for 2 house builders, setting out each plot from the drawings. I lay around 600 facing bricks a day on house fronts against the contractor's target of 500, keeping joints and courses level and plumb. Your advert asks for a strong record at NHBC inspections. Since 2019 I have built the brickwork for 380 homes with no brickwork defects found at those inspections.",
          us: "At Wansford Masonry I lead a crew of 3 masons and a mason tender on homes and commercial jobs for 4 general contractors, laying out each wall from the plans. I lay around 600 face bricks a day on home exteriors against the contractor's target of 500, keeping joints and courses level and plumb. Your advert asks for experience with brick veneer and concrete block. Since 2019 I have built the brick veneer for 380 homes with no masonry defects found at city inspections, and since 2021 I have laid 18,000 concrete blocks for the walls of 6 commercial buildings.",
        },
        {
          uk: "You are also looking for experience of decorative details such as arches and chimneys. In 2023 I built 36 chimneys and 22 brick arches on a 64-home village scheme, matching the planning drawings for the conservation area. At Ashcott Building Restoration I rebuilt 28 chimney stacks on Victorian terraced houses, matching the original brick details.",
          us: "You are also looking for experience leading a crew and training apprentices. I have trained 6 apprentices since 2019 in layout, cutting and tooling joints, all of whom completed their apprenticeships. At Ashcott Masonry Restoration I also re-pointed and repaired brickwork on 45 historic buildings and churches in lime mortar, matching the original bricks and joints.",
        },
        {
          uk: "I have trained 6 apprentices since 2019 in setting out, cutting and pointing, all of whom passed their NVQ Level 2 the first time. I hold an NVQ Level 3 Diploma in Trowel Occupations and a Construction Skills Certification Scheme (CSCS) Gold Card.",
          us: "I completed a 3-year apprenticeship with National Center for Construction Education and Research (NCCER) Masonry Levels 1 to 3, and I hold an Occupational Safety and Health Administration (OSHA) 30-Hour Construction card.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "project-engineer",
    industry: "engineering",
    role: "Project Engineer",
    level: "experienced",
    template: "chronicle",
    blurb: {
      uk: "A project engineer with 7 years at a process contractor and a pump maker, who has delivered 16 plant projects and is an Incorporated Engineer.",
      us: "A project engineer with 7 years at a process contractor and a pump manufacturer, who has delivered 16 plant projects and is a registered Engineer in Training.",
    },
    person: { name: "Morven McAleer", email: "morven.mcaleer@example.com", phone: { uk: "07700 900731", us: "(361) 555-0154" }, location: { uk: "Middlesbrough", us: "Corpus Christi, TX" } },
    profile: {
      uk: "Project engineer with 7 years in industrial projects, the last 4 at a process contractor on Teesside running mechanical upgrades for chemical, water and energy clients. Has delivered 16 projects from £150,000 to £4.8 million, 14 of them on or under budget. Manages drawings, technical queries (TQs) and subcontractors, and coordinated up to 60 people on site during a 21-day plant shutdown in 2025. Incorporated Engineer (IEng) with the Institution of Mechanical Engineers (IMechE), working towards Chartered Engineer (CEng) status.",
      us: "Project engineer with 7 years in industrial projects, the last 4 at a process contractor in Corpus Christi running mechanical upgrades for refinery, chemical and water clients. Has delivered 16 projects from $190,000 to $6.2 million, 14 of them on or under budget. Manages drawings, requests for information (RFIs) and subcontractors, and coordinated up to 60 people on site during a 21-day plant turnaround in 2025. Passed the Fundamentals of Engineering exam in 2023 and is a registered Engineer in Training (EIT) in Texas, preparing for the Professional Engineer (PE) exam.",
    },
    experience: [
      {
        title: "Project Engineer",
        org: "Norwell Process Engineering",
        location: { uk: "Middlesbrough", us: "Corpus Christi, TX" },
        start: "2022-04",
        current: true,
        bullets: [
          {
            uk: "Run 3 to 5 mechanical projects at a time for chemical, water and energy clients on Teesside, from scope and estimate to commissioning and handover",
            us: "Run 3 to 5 mechanical projects at a time for refinery, chemical and water clients on the Gulf Coast, from scope and estimate to commissioning and handover",
          },
          {
            uk: "Delivered 11 projects from £250,000 to £4.8 million since 2022, 10 of them on or under budget, by reviewing costs against the plan each week",
            us: "Delivered 11 projects from $310,000 to $6.2 million since 2022, 10 of them on or under budget, by reviewing costs against the plan each week",
          },
          {
            uk: "Coordinated up to 60 people from 6 subcontractors during a 21-day plant shutdown in 2025, replacing 14 pumps and 220 metres of pipework and finishing 2 days early",
            us: "Coordinated up to 60 people from 6 subcontractors during a 21-day plant turnaround in 2025, replacing 14 pumps and 720 feet of piping and finishing 2 days early",
          },
          {
            uk: "Answer around 25 technical queries a month from site and subcontractors, closing 90% within 5 working days",
            us: "Answer around 25 requests for information a month from the field and subcontractors, closing 90% within 5 working days",
          },
          "Keep the drawing register for each project, issuing around 300 drawings a year and checking each revision against the 3D model before it goes to site",
          "Built project schedules in Microsoft Project for all live projects, cutting the average handover delay from 9 days to 2 in 2 years",
        ],
      },
      {
        title: { uk: "Graduate Project Engineer", us: "Associate Project Engineer" },
        org: "Brassington Pumps",
        location: { uk: "Darlington", us: "Victoria, TX" },
        start: "2019-09",
        end: "2022-03",
        bullets: [
          {
            uk: "Managed 5 customer orders for engineered pump packages from £150,000 to £900,000 for oil, gas and water clients, from design review to factory testing",
            us: "Managed 5 customer orders for engineered pump packages from $190,000 to $1.1 million for oil, gas and water clients, from design review to factory testing",
          },
          "Prepared general arrangement drawings and data books for 40 pump skids, and clients accepted 38 of them in the first round of review",
          {
            uk: "Ran factory acceptance tests on 22 pump packages with clients' inspectors, logging and closing 140 snag items before shipping",
            us: "Ran factory acceptance tests on 22 pump packages with clients' inspectors, logging and closing 140 punch list items before shipping",
          },
          "Cut the time from order to shipping for standard pump skids from 18 weeks to 14 weeks in 2021 by ordering long-lead parts at the design review",
          "Wrote operating and maintenance manuals for 22 pump packages, with each client signing off its manual at handover",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BEng (Hons) Mechanical Engineering", us: "Bachelor of Science in Mechanical Engineering" },
        org: { uk: "Teesside University", us: "University of Houston" },
        end: "2019",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Incorporated Engineer (IEng)", us: "Engineer in Training (EIT)" },
        org: { uk: "Institution of Mechanical Engineers", us: "Texas Board of Professional Engineers and Land Surveyors" },
        end: "2023",
      },
      {
        title: { uk: "Project Fundamentals Qualification", us: "Certified Associate in Project Management (CAPM)" },
        org: { uk: "Association for Project Management", us: "Project Management Institute" },
        end: "2022",
      },
      {
        title: { uk: "Site Management Safety Training Scheme (SMSTS)", us: "OSHA 30-Hour Construction" },
        org: { uk: "Construction Industry Training Board", us: "Occupational Safety and Health Administration" },
        end: "2024",
      },
    ],
    skills: [
      "Project delivery",
      "Budgets",
      "Microsoft Project",
      { uk: "Technical queries", us: "Requests for information" },
      "Drawing registers",
      "Coordinating subcontractors",
      { uk: "Plant shutdowns", us: "Plant turnarounds" },
      "Factory acceptance tests",
      "Commissioning",
      { uk: "Pipework", us: "Piping" },
    ],
    names: ["Morven", "McAleer", "Norwell", "Brassington", "Seabrook", "Teesside", "Middlesbrough", "Billingham", "Darlington", "Corpus", "Christi", "BEng", "IEng", "IMechE", "CEng"],
    letter: {
      job: {
        title: "Project Engineer",
        employer: "Seabrook Industrial Services",
        advert: {
          uk: `Project Engineer
Seabrook Industrial Services, Billingham

Seabrook Industrial Services is a mechanical and pipework contractor working on chemical, energy and water plants across Teesside, with 350 staff.

The role
You will run mechanical projects from scope to handover, including work during planned plant shutdowns.

What we are looking for
- A degree in mechanical engineering or a related subject
- At least 4 years as a project engineer with a contractor or manufacturer
- Experience managing budgets and schedules
- Experience handling drawings and technical queries
- Experience coordinating subcontractors on site
- Incorporated or Chartered Engineer, or working towards it

Salary £48,000 to £56,000, plus a car allowance`,
          us: `Project Engineer
Seabrook Industrial Services, Corpus Christi, TX

Seabrook Industrial Services is a mechanical and piping contractor working on refinery, chemical and water plants along the Texas Gulf Coast, with 350 employees.

The role
You will run mechanical projects from scope to handover, including work during planned plant turnarounds.

What we are looking for
- A bachelor's degree in mechanical engineering or a related field
- At least 4 years as a project engineer with a contractor or manufacturer
- Experience managing budgets and schedules
- Experience handling drawings and requests for information
- Experience coordinating subcontractors in the field
- Engineer in Training (EIT) certification, with a Professional Engineer (PE) license preferred

Salary $92,000 to $108,000, plus a truck allowance`,
        },
      },
      reason: {
        uk: "I want to run larger shutdown projects for a contractor that works across more plants on Teesside.",
        us: "I want to run larger turnaround projects for a contractor that works across more plants on the Gulf Coast.",
      },
      paragraphs: [
        {
          uk: "I am a project engineer at a process contractor on Teesside, and I would like to apply for the Project Engineer post at Seabrook Industrial Services. I want to run larger shutdown projects for a contractor that works across more plants on Teesside.",
          us: "I am a project engineer at a process contractor in Corpus Christi, and I would like to apply for the Project Engineer position at Seabrook Industrial Services. I want to run larger turnaround projects for a contractor that works across more plants on the Gulf Coast.",
        },
        {
          uk: "Your advert asks for experience managing budgets and schedules. Since 2022 I have delivered 11 projects from £250,000 to £4.8 million, 10 of them on or under budget, by reviewing costs against the plan each week. I also built project schedules in Microsoft Project for all live projects, cutting the average handover delay from 9 days to 2 in 2 years.",
          us: "Your advert asks for experience managing budgets and schedules. Since 2022 I have delivered 11 projects from $310,000 to $6.2 million, 10 of them on or under budget, by reviewing costs against the plan each week. I also built project schedules in Microsoft Project for all live projects, cutting the average handover delay from 9 days to 2 in 2 years.",
        },
        {
          uk: "You are also looking for experience coordinating subcontractors on site. During a 21-day plant shutdown in 2025 I coordinated up to 60 people from 6 subcontractors, replacing 14 pumps and 220 metres of pipework and finishing 2 days early.",
          us: "You are also looking for experience coordinating subcontractors in the field. During a 21-day plant turnaround in 2025 I coordinated up to 60 people from 6 subcontractors, replacing 14 pumps and 720 feet of piping and finishing 2 days early.",
        },
        {
          uk: "Your advert also asks for experience handling drawings and technical queries. I keep the drawing register for each project, issuing around 300 drawings a year and checking each revision against the 3D model before it goes to site. I answer around 25 technical queries a month from site and subcontractors, closing 90% within 5 working days.",
          us: "Your advert also asks for experience handling drawings and requests for information. I keep the drawing register for each project, issuing around 300 drawings a year and checking each revision against the 3D model before it goes to site. I answer around 25 requests for information a month from the field and subcontractors, closing 90% within 5 working days.",
        },
        {
          uk: "I am an Incorporated Engineer (IEng) with the Institution of Mechanical Engineers (IMechE), working towards Chartered Engineer (CEng) status.",
          us: "I passed the Fundamentals of Engineering exam in 2023 and am a registered Engineer in Training (EIT) in Texas, preparing for the Professional Engineer (PE) exam.",
        },
        CLOSE,
      ],
    },
  },
];
