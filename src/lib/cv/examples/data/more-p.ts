import type { ExampleSpec } from "../types";

/** Phase 3, batch 2 (28 Nov 2026): the last nine listed roles, and 21 roles added to the industry packs. */
export const MORE_P: ExampleSpec[] = [
  {
    id: "delivery-driver",
    industry: "logistics",
    role: "Delivery Driver",
    level: "early",
    template: "fieldwork",
    blurb: {
      uk: "A delivery driver on a multi-drop parcel route, with 99.2% of parcels delivered on the first attempt and a clean licence.",
      us: "A delivery driver on a multi-stop package route, with 99.2% of packages delivered on the first attempt and a clean driving record.",
    },
    person: { name: "Kyle Tierney", email: "kyle.tierney@example.com", phone: { uk: "07700 900696", us: "(727) 555-0119" }, location: { uk: "Peterborough", us: "St. Petersburg, FL" } },
    profile: {
      uk: "Delivery driver with 2 years on multi-drop parcel routes, after 2 years delivering grocery orders for a supermarket. Delivers 120 to 150 parcels a day, with 99.2% delivered on the first attempt in 2025 against a depot target of 97%. Holds a clean Category B driving licence and has had no accidents or damage claims in 4 years of driving for work.",
      us: "Delivery driver with 2 years on multi-stop package routes, after 2 years delivering grocery orders for a supermarket. Delivers 120 to 150 packages a day, with 99.2% delivered on the first attempt in 2025 against a station target of 97%. Holds a Florida driver's license with a clean driving record and has had no accidents or damage claims in 4 years of driving for work.",
    },
    experience: [
      {
        title: "Delivery Driver",
        org: { uk: "Fleetwing Parcels", us: "Fleetwing Delivery" },
        location: { uk: "Peterborough", us: "St. Petersburg, FL" },
        start: "2024-03",
        current: true,
        bullets: [
          {
            uk: "Deliver 120 to 150 parcels a day on a 90-mile route from the Peterborough depot, 5 days a week",
            us: "Deliver 120 to 150 packages a day on a 90-mile route from the St. Petersburg station",
          },
          {
            uk: "Delivered 99.2% of parcels on the first attempt in 2025 against a depot target of 97%, by calling ahead for large items and using customers' chosen safe places",
            us: "Delivered 99.2% of packages on the first attempt in 2025 against a station target of 97%, by calling ahead for large items and using customers' chosen safe places",
          },
          {
            uk: "Record each drop on a handheld scanner, with 0.1% of parcels reported missing in 2025",
            us: "Record each stop on a handheld scanner, with 0.1% of packages reported missing in 2025",
          },
          {
            uk: "Cut the time to load the van each morning from 45 to 25 minutes by shelving parcels in drop order",
            us: "Cut the time to load the van each morning from 45 to 25 minutes by shelving packages in stop order",
          },
          "Complete a vehicle check before each shift, with no accidents or damage claims in 2 years",
          "Trained 4 new drivers on the route and scanner in 2025, riding with each for 3 days",
        ],
      },
      {
        title: { uk: "Home Delivery Driver", us: "Grocery Delivery Driver" },
        org: "Granary Fresh",
        location: { uk: "Peterborough", us: "Largo, FL" },
        start: "2022-03",
        end: "2024-02",
        bullets: [
          {
            uk: "Delivered around 18 grocery orders a shift to homes across Peterborough in a chilled van",
            us: "Delivered around 18 grocery orders a shift to homes in Pinellas County in a refrigerated van",
          },
          {
            uk: "Met the 1-hour delivery slot on 98% of orders in 2023 by planning routes around school traffic",
            us: "Met the 1-hour delivery window on 98% of orders in 2023 by planning routes around school traffic",
          },
          "Kept refunds for damaged or missing items under 1% of orders by checking each order at the door",
          {
            uk: "Carried up to 40 crates a shift using safe manual handling methods, with no injuries in 2 years",
            us: "Carried up to 40 crates a shift using safe lifting methods, with no injuries in 2 years",
          },
        ],
      },
      {
        title: { uk: "Customer Assistant", us: "Store Associate" },
        org: "Granary Fresh",
        location: { uk: "Peterborough", us: "Largo, FL" },
        start: "2018-09",
        end: "2022-02",
        bullets: [
          {
            uk: "Served around 200 customers a shift on the tills and self-service checkouts",
            us: "Served around 200 customers a shift on the registers and self-service checkouts",
          },
          "Picked around 60 online grocery orders a week, which led to a move to the driving team in 2022",
          "Won the store's monthly customer service award 3 times in 2021",
        ],
      },
    ],
    education: [
      {
        title: { uk: "GCSEs", us: "High School Diploma" },
        org: { uk: "Netherby Academy", us: "Tarpon Bay High School" },
        location: { uk: "Peterborough", us: "Largo, FL" },
        end: "2018",
        grade: { uk: "6 at grades 9 to 4, including English and Maths", us: "" },
      },
    ],
    certificates: [
      {
        title: { uk: "Category B Driving Licence (clean)", us: "Class E Driver License (clean record)" },
        org: { uk: "Driver and Vehicle Licensing Agency", us: "Florida Department of Highway Safety and Motor Vehicles" },
        end: "2019",
      },
    ],
    skills: [
      { uk: "Multi-drop routes", us: "Multi-stop routes" },
      "Route planning",
      "Handheld scanners",
      "Van loading",
      "Vehicle checks",
      { uk: "Clean driving licence", us: "Clean driving record" },
      "Grocery delivery",
      { uk: "Manual handling", us: "Safe lifting" },
      "Customer service",
      "Training new drivers",
    ],
    names: ["Kyle", "Tierney", "Fleetwing", "Granary", "Netherby", "Tarpon", "Greengage", "Peterborough", "Petersburg", "Pinellas", "Cambridgeshire"],
    letter: {
      job: {
        title: "Delivery Driver",
        employer: "Greengage Grocery",
        advert: {
          uk: `Delivery Driver
Greengage Grocery, Peterborough

Greengage Grocery delivers fresh food ordered online to 30,000 households a week across Cambridgeshire, from its own fleet of 70 vans.

The role
You will join a team of 90 drivers, delivering grocery orders to homes on a set daytime route, 5 days a week.

What we are looking for
- A clean Category B driving licence
- At least 1 year of multi-drop delivery experience
- A record of on-time, first-attempt deliveries
- Experience using a handheld scanner
- Friendly, careful service on the doorstep

Pay £12.90 an hour, with a quarterly bonus for on-time delivery`,
          us: `Delivery Driver
Greengage Grocery, St. Petersburg, FL

Greengage Grocery delivers fresh food ordered online to 30,000 households a week across the Tampa Bay area, from its own fleet of 70 vans.

The role
You will join a team of 90 drivers, delivering grocery orders to homes on a set daytime route, 5 days a week.

What we are looking for
- A valid driver's license with a clean driving record
- At least 1 year of multi-stop delivery experience
- A record of on-time, first-attempt deliveries
- Experience using a handheld scanner
- Friendly, careful service at the door

Pay $17.50 an hour, with a quarterly bonus for on-time delivery`,
        },
      },
      reason: "I want to go back to delivering groceries on a regular daytime route, where I see the same customers each week.",
      paragraphs: [
        {
          uk: "I saw your advert for a Delivery Driver at Greengage Grocery, and I would like to join your team of 90 drivers. I want to go back to delivering groceries on a regular daytime route, where I see the same customers each week.",
          us: "I saw your advert for a Delivery Driver at Greengage Grocery, and I would like to join your team of 90 drivers. I want to go back to delivering groceries on a regular daytime route, where I see the same customers each week.",
        },
        {
          uk: "At Fleetwing Parcels I deliver 120 to 150 parcels a day on a 90-mile route from the Peterborough depot, 5 days a week. Your advert asks for a record of on-time, first-attempt deliveries. I delivered 99.2% of parcels on the first attempt in 2025 against a depot target of 97%, by calling ahead for large items and using customers' chosen safe places.",
          us: "At Fleetwing Delivery I deliver 120 to 150 packages a day on a 90-mile route from the St. Petersburg station. Your advert asks for a record of on-time, first-attempt deliveries. I delivered 99.2% of packages on the first attempt in 2025 against a station target of 97%, by calling ahead for large items and using customers' chosen safe places.",
        },
        {
          uk: "You are also looking for experience using a handheld scanner. I record each drop on a handheld scanner, with 0.1% of parcels reported missing in 2025. That year I also trained 4 new drivers on the route and scanner. I hold a clean Category B driving licence and have had no accidents or damage claims in 4 years of driving for work.",
          us: "You are also looking for experience using a handheld scanner. I record each stop on a handheld scanner, with 0.1% of packages reported missing in 2025. That year I also trained 4 new drivers on the route and scanner. I hold a Florida driver's license with a clean driving record and have had no accidents or damage claims in 4 years of driving for work.",
        },
        {
          uk: "Before that, I delivered around 18 grocery orders a shift to homes across Peterborough for Granary Fresh. I met the 1-hour delivery slot on 98% of orders in 2023 by planning routes around school traffic. I also kept refunds for damaged or missing items under 1% of orders by checking each order at the door.",
          us: "Before that, I delivered around 18 grocery orders a shift to homes in Pinellas County for Granary Fresh. I met the 1-hour delivery window on 98% of orders in 2023 by planning routes around school traffic. I also kept refunds for damaged or missing items under 1% of orders by checking each order at the door.",
        },
        "Thank you for reading my letter. I would welcome the chance to talk about the role.",
      ],
    },
  },
  {
    id: "carpenter",
    industry: "construction",
    role: "Carpenter",
    level: "experienced",
    template: "technical",
    blurb: {
      uk: "A carpenter with 14 years of first and second fix on new-build homes and bespoke joinery in the workshop, who leads a gang of 3.",
      us: "A journeyman carpenter with 14 years of framing and finish carpentry on new homes and custom woodwork in the shop, who leads a crew of 3.",
    },
    person: { name: "Dominic Rawcliffe", email: "dominic.rawcliffe@example.com", phone: { uk: "07700 900697", us: "(251) 555-0120" }, location: { uk: "Preston", us: "Mobile, AL" } },
    profile: {
      uk: "Carpenter with 14 years on site and in the workshop, including a 4-year apprenticeship, holding an NVQ Level 3 Diploma in Site Carpentry and a Construction Skills Certification Scheme (CSCS) Gold Card. Fits first and second fix carpentry in around 30 new-build homes a year, from roof trusses and stud walls to staircases, doors and kitchens. Cut snagging items per house from 9 to 3 on a 120-home scheme in 2025 and leads a gang of 3 carpenters. Built 40 timber sash windows in the workshop for a listed terrace in 2019.",
      us: "Journeyman carpenter with 14 years in residential construction and custom woodwork, including a 4-year registered apprenticeship. Frames walls, floors and roofs and does finish carpentry in around 30 new homes a year, from stairs and doors to trim and cabinets. Cut punch list items per home from 9 to 3 on a 120-home subdivision in 2025 and leads a crew of 3 carpenters. Holds an Occupational Safety and Health Administration (OSHA) 30-Hour card.",
    },
    experience: [
      {
        title: "Carpenter",
        org: "Tarnside Homes",
        location: { uk: "Preston", us: "Mobile, AL" },
        start: "2021-04",
        current: true,
        bullets: [
          {
            uk: "Fitted first and second fix carpentry in 32 new-build homes in 2025, from roof trusses and stud walls to staircases, doors and skirting",
            us: "Framed and trimmed out 32 new homes in 2025, from floor systems, walls and roof trusses to stairs, doors and baseboard",
          },
          {
            uk: "Lead a gang of 3 carpenters, setting out each house from the drawings and checking each stage before the next trade starts",
            us: "Lead a crew of 3 carpenters, marking the layout for each house from the plans and checking each stage before the next trade starts",
          },
          {
            uk: "Cut snagging items per house from 9 to 3 on a 120-home scheme in 2025 by checking doors, skirting and kitchens against a written checklist before handover",
            us: "Cut punch list items per home from 9 to 3 on a 120-home subdivision in 2025 by checking doors, trim and cabinets against a written checklist before closing",
          },
          {
            uk: "Fitted 36 staircases in 2025, each passing building control inspection the first time",
            us: "Built 36 sets of stairs in 2025, each passing city inspection the first time",
          },
          {
            uk: "Installed 45 kitchens in 2025, from wall units and worktops to plinths and end panels, with no callbacks for fit or finish",
            us: "Installed cabinets and counters in 45 kitchens in 2025, with no callbacks for fit or finish",
          },
          {
            uk: "Brought timber waste on the gang's houses down from 9% to 4% of each order in 2025 by cutting from a list for each plot",
            us: "Brought lumber waste on the crew's homes down from 9% to 4% of each order in 2025 by cutting from a list for each house",
          },
        ],
      },
      {
        title: { uk: "Carpenter and Joiner", us: "Finish Carpenter" },
        org: { uk: "Kestwick Joinery", us: "Kestwick Woodwork" },
        location: { uk: "Lancaster", us: "Daphne, AL" },
        start: "2016-09",
        end: "2021-03",
        bullets: [
          {
            uk: "Built 40 timber sash windows in the workshop for a listed terrace in 2019, matching the original 1840s mouldings",
            us: "Built 40 wood sash windows in the shop for a row of historic homes in 2019, matching the original 1850s moldings",
          },
          {
            uk: "Hung doors and fitted skirting and architraves in around 200 homes and flats across 14 refurbishment jobs",
            us: "Hung doors and installed casing and baseboard in around 200 homes and apartments across 14 remodeling jobs",
          },
          {
            uk: "Built and fitted 60 made-to-measure staircases, cutting strings and treads in the workshop from site measurements",
            us: "Built and installed 60 custom staircases, cutting stringers and treads in the shop from site measurements",
          },
          {
            uk: "Read architects' drawings to price around 30 joinery jobs a year, winning 18 of them in 2020",
            us: "Read architects' plans to price around 30 custom woodwork jobs a year, winning 18 of them in 2020",
          },
          {
            uk: "Restored 22 original panelled doors and the staircase of a Georgian townhouse in 2018, splicing in new timber to match the old",
            us: "Restored 22 original paneled doors and the staircase of a Victorian house in 2018, splicing in new wood to match the old",
          },
        ],
      },
      {
        title: { uk: "Apprentice Carpenter", us: "Carpentry Apprentice" },
        org: { uk: "Kestwick Joinery", us: "Kestwick Woodwork" },
        location: { uk: "Lancaster", us: "Daphne, AL" },
        start: "2012-09",
        end: "2016-08",
        bullets: [
          {
            uk: "Completed a 4-year apprenticeship with an NVQ Level 3 Diploma in Site Carpentry, passing the final assessment the first time",
            us: "Completed a 4-year registered apprenticeship with 8,000 hours on the job and 576 hours of classroom training",
          },
          {
            uk: "Hung around 300 internal doors and fitted skirting in new-build homes for 3 house builders",
            us: "Hung around 300 interior doors and installed baseboard in new homes for 3 home builders",
          },
          {
            uk: "Built 12 sets of fitted wardrobes and bookcases in the workshop in the third year",
            us: "Built 12 sets of bookcases and window seats in the shop in the third year",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "NVQ Level 3 Diploma in Site Carpentry", us: "Certificate in Carpentry" },
        org: { uk: "Runshaw College", us: "Bishop State Community College" },
        start: "2012",
        end: "2016",
      },
    ],
    certificates: [
      {
        title: { uk: "CSCS Gold Card (Advanced Craft)", us: "Journeyman Carpenter Certificate" },
        org: { uk: "Construction Skills Certification Scheme", us: "Associated Builders and Contractors" },
        end: "2016",
      },
      {
        title: { uk: "Site Supervisor Safety Training Scheme (SSSTS)", us: "OSHA 30-Hour Construction" },
        org: { uk: "Construction Industry Training Board", us: "Occupational Safety and Health Administration" },
        end: "2023",
      },
    ],
    skills: [
      { uk: "First fix carpentry", us: "Framing" },
      { uk: "Second fix carpentry", us: "Finish carpentry" },
      { uk: "Setting out", us: "Layout" },
      { uk: "Staircases", us: "Stair building" },
      "Sash windows",
      { uk: "Joinery", us: "Custom woodwork" },
      { uk: "Reading drawings", us: "Reading plans" },
      { uk: "Kitchen fitting", us: "Cabinet installation" },
      { uk: "Snagging", us: "Punch lists" },
      { uk: "Leading a gang", us: "Leading a crew" },
    ],
    names: ["Dominic", "Rawcliffe", "Tarnside", "Kestwick", "Fellgate", "Runshaw"],
    letter: {
      job: {
        title: "Carpenter",
        employer: { uk: "Fellgate Construction", us: "Fellgate Builders" },
        advert: {
          uk: `Carpenter
Fellgate Construction, Preston

Fellgate Construction builds new homes and restores listed buildings across Lancashire, with 8 sites running at any time.

The role
You will work on site and in the workshop: first and second fix carpentry on our housing sites, and bespoke joinery for our heritage projects.

What we are looking for
- An NVQ Level 3 in carpentry and joinery, or equivalent
- A CSCS Gold Card
- At least 5 years of first and second fix experience
- Experience making joinery in a workshop, such as windows or staircases
- Experience leading a small gang of carpenters
- A high standard of finish, with few snagging items

Pay £20 to £23 an hour, plus a tool allowance`,
          us: `Carpenter
Fellgate Builders, Mobile, AL

Fellgate Builders builds new homes and restores historic houses across the Gulf Coast, with 8 job sites running at any time.

The role
You will work on job sites and in the shop: framing and finish carpentry on our new homes, and custom woodwork for our restoration projects.

What we are looking for
- Journeyman-level carpentry skills, through an apprenticeship or equivalent experience
- At least 5 years of framing and finish carpentry experience
- Experience building custom woodwork in a shop, such as windows or stairs
- Experience leading a small crew of carpenters
- A high standard of finish, with short punch lists
- An OSHA 10-Hour or 30-Hour card

Pay $24 to $30 an hour, plus a tool allowance`,
        },
      },
      reason: {
        uk: "I want to spend more of my time on heritage joinery, while still working on site.",
        us: "I want to spend more of my time on restoration and custom woodwork, while still working on site.",
      },
      paragraphs: [
        {
          uk: "I hope you will consider me for the Carpenter post at Fellgate Construction. I want to spend more of my time on heritage joinery, while still working on site.",
          us: "I hope you will consider me for the Carpenter position at Fellgate Builders. I want to spend more of my time on restoration and custom woodwork, while still working on site.",
        },
        {
          uk: "At Tarnside Homes I fitted first and second fix carpentry in 32 new-build homes in 2025, from roof trusses and stud walls to staircases, doors and skirting. I lead a gang of 3 carpenters, setting out each house from the drawings and checking each stage before the next trade starts. I also cut snagging items per house from 9 to 3 on a 120-home scheme in 2025 by checking doors, skirting and kitchens against a written checklist before handover.",
          us: "At Tarnside Homes I framed and trimmed out 32 new homes in 2025, from floor systems, walls and roof trusses to stairs, doors and baseboard. I lead a crew of 3 carpenters, marking the layout for each house from the plans and checking each stage before the next trade starts. I also cut punch list items per home from 9 to 3 on a 120-home subdivision in 2025 by checking doors, trim and cabinets against a written checklist before closing.",
        },
        {
          uk: "Your advert asks for experience making joinery in a workshop, such as windows or staircases. At Kestwick Joinery I built 40 timber sash windows in the workshop for a listed terrace in 2019, matching the original 1840s mouldings. I also built and fitted 60 made-to-measure staircases, cutting strings and treads in the workshop from site measurements. In 2018 I restored 22 original panelled doors and the staircase of a Georgian townhouse, splicing in new timber to match the old.",
          us: "Your advert asks for experience building custom woodwork in a shop, such as windows or stairs. At Kestwick Woodwork I built 40 wood sash windows in the shop for a row of historic homes in 2019, matching the original 1850s moldings. I also built and installed 60 custom staircases, cutting stringers and treads in the shop from site measurements. In 2018 I restored 22 original paneled doors and the staircase of a Victorian house, splicing in new wood to match the old.",
        },
        {
          uk: "I completed a 4-year apprenticeship with an NVQ Level 3 Diploma in Site Carpentry, and I hold a Construction Skills Certification Scheme (CSCS) Gold Card.",
          us: "I completed a 4-year registered apprenticeship with 8,000 hours on the job and 576 hours of classroom training. I hold an Occupational Safety and Health Administration (OSHA) 30-Hour card.",
        },
        {
          uk: "My CV is attached. Thank you for your time, and I would welcome the chance to discuss the role.",
          us: "My resume is attached. Thank you for your time, and I would welcome the chance to discuss the role.",
        },
      ],
    },
  },
  {
    id: "hvac-technician",
    industry: "construction",
    role: { uk: "HVAC Engineer", us: "HVAC Technician" },
    level: "experienced",
    template: "framework",
    blurb: {
      uk: "An HVAC engineer who installs and services heat pumps and commercial air conditioning, with a 91% first-time fix rate.",
      us: "An HVAC technician who installs and services heat pumps and commercial air conditioning, with a 91% first-time fix rate.",
    },
    person: { name: "Aidan Stroud", email: "aidan.stroud@example.com", phone: { uk: "07700 900698", us: "(225) 555-0121" }, location: { uk: "Northampton", us: "Baton Rouge, LA" } },
    profile: {
      uk: "Heating, ventilation and air conditioning (HVAC) engineer with 13 years in commercial air conditioning and heat pumps, including a 3-year apprenticeship. Holds F-Gas Category 1 certification and a Level 3 Diploma in Refrigeration, Air Conditioning and Heat Pump Systems. Attends around 5 service and repair calls a day for 60 contract customers, with a first-time fix rate of 91% in 2025 against a company target of 85%. Has installed 140 air source heat pumps since 2022 and led the install of a 24-unit variable refrigerant flow system in 2024.",
      us: "Heating, ventilation and air conditioning (HVAC) technician with 13 years in commercial air conditioning and heat pumps, including a 3-year apprenticeship. Holds Environmental Protection Agency (EPA) Section 608 Universal certification and North American Technician Excellence (NATE) certification in air conditioning and heat pump service. Runs around 5 service and repair calls a day for 60 service agreement customers, with a first-time fix rate of 91% in 2025 against a company target of 85%. Has installed 140 heat pump systems since 2022 and led the install of a 24-unit variable refrigerant flow system in 2024.",
    },
    experience: [
      {
        title: { uk: "HVAC Engineer", us: "HVAC Technician" },
        org: { uk: "Thermacrest Building Services", us: "Thermacrest Mechanical" },
        location: { uk: "Northampton", us: "Baton Rouge, LA" },
        start: "2021-05",
        current: true,
        bullets: [
          {
            uk: "Attend around 5 service and repair calls a day for 60 contract customers, from offices and shops to schools, on air conditioning, heat pumps and ventilation",
            us: "Run around 5 service and repair calls a day for 60 service agreement customers, from offices and stores to schools, on air conditioning, heat pumps and ventilation",
          },
          {
            uk: "Kept a first-time fix rate of 91% in 2025 against a company target of 85% by stocking the van with the 40 parts that fail most often",
            us: "Kept a first-time fix rate of 91% in 2025 against a company target of 85% by stocking the truck with the 40 parts that fail most often",
          },
          {
            uk: "Installed 140 air source heat pumps in homes and small offices since 2022, commissioning each one and showing the owner how to use the controls",
            us: "Installed 140 heat pump systems in homes and small offices since 2022, commissioning each one and showing the owner how to use the controls",
          },
          "Led the install of a 24-unit variable refrigerant flow system across 3 floors of an office in 2024, finishing 1 week early",
          {
            uk: "Tested around 85 systems a year for leaks under the F-Gas rules, finding and repairing 12 leaks in 2025",
            us: "Tested around 85 systems a year for leaks under EPA rules, finding and repairing 12 leaks in 2025",
          },
          "Trained 2 apprentices in brazing, vacuum testing and charging systems since 2023",
        ],
      },
      {
        title: { uk: "Air Conditioning Engineer", us: "HVAC Service Technician" },
        org: { uk: "Coolbrook Air Conditioning", us: "Coolbrook Air" },
        location: { uk: "Leicester", us: "Lafayette, LA" },
        start: "2016-09",
        end: "2021-04",
        bullets: [
          {
            uk: "Serviced around 400 split and cassette air conditioning units a year in shops, restaurants and offices",
            us: "Serviced around 400 split and ductless air conditioning units a year in stores, restaurants and offices",
          },
          {
            uk: "Cut repeat call-outs on the firm's maintenance contracts from 11% to 6% by cleaning coils and clearing drains at each visit",
            us: "Cut repeat callbacks on the company's service agreements from 11% to 6% by cleaning coils and clearing drains at each visit",
          },
          "Replaced around 30 compressors and 50 fan motors a year, finding each fault from pressure and electrical readings",
          {
            uk: "Fitted 60 split systems and 25 rooftop units for new shops and restaurants, all passing commissioning checks the first time",
            us: "Installed 60 split systems and 25 rooftop units for new stores and restaurants, all passing startup checks the first time",
          },
        ],
      },
      {
        title: { uk: "Apprentice Air Conditioning Engineer", us: "HVAC Apprentice" },
        org: { uk: "Coolbrook Air Conditioning", us: "Coolbrook Air" },
        location: { uk: "Leicester", us: "Lafayette, LA" },
        start: "2013-09",
        end: "2016-08",
        bullets: [
          {
            uk: "Completed a 3-year apprenticeship with a Level 3 Diploma in Refrigeration, Air Conditioning and Heat Pump Systems",
            us: "Completed a 3-year apprenticeship with 6,000 hours on the job and 432 hours of classroom training",
          },
          {
            uk: "Fitted pipework, cabling and condensate drains for around 80 split systems in shops and offices",
            us: "Ran line sets, wiring and condensate drains for around 80 split systems in stores and offices",
          },
          {
            uk: "Passed the F-Gas Category 1 assessment in 2015, in the second year of the apprenticeship",
            us: "Passed the EPA Section 608 Universal exam in 2015, in the second year of the apprenticeship",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Level 3 Diploma in Refrigeration, Air Conditioning and Heat Pump Systems", us: "Technical Diploma in Air Conditioning, Refrigeration and Heating" },
        org: { uk: "Leicester College", us: "Baton Rouge Community College" },
        start: "2013",
        end: "2016",
      },
    ],
    certificates: [
      {
        title: { uk: "F-Gas Category 1 Certificate", us: "EPA Section 608 Universal Certification" },
        org: { uk: "City & Guilds", us: "US Environmental Protection Agency" },
        end: "2015",
      },
      {
        title: { uk: "Level 3 Award in Air Source Heat Pump Systems", us: "NATE Certification, Air Conditioning and Heat Pump Service" },
        org: { uk: "BPEC", us: "North American Technician Excellence" },
        end: "2022",
      },
    ],
    skills: [
      "Commercial air conditioning",
      { uk: "Air source heat pumps", us: "Heat pump systems" },
      "Variable refrigerant flow systems",
      "Fault finding",
      "Commissioning",
      "Leak testing",
      "Brazing",
      { uk: "Maintenance contracts", us: "Service agreements" },
      "Training apprentices",
    ],
    names: ["Aidan", "Stroud", "Thermacrest", "Coolbrook", "Brightair", "F-Gas", "BPEC", "Rouge"],
    letter: {
      job: {
        title: { uk: "HVAC Engineer", us: "HVAC Technician" },
        employer: { uk: "Brightair Building Services", us: "Brightair Mechanical" },
        advert: {
          uk: `HVAC Engineer
Brightair Building Services, Northampton

Brightair Building Services installs and maintains heating, ventilation and air conditioning for offices, schools and public buildings across the East Midlands.

The role
You will join our team of 35 engineers, leading installs of heat pumps and commercial air conditioning, and attending service and repair calls for our contract customers.

What we are looking for
- F-Gas Category 1 certification
- At least 5 years of experience with commercial air conditioning
- Experience installing and commissioning air source heat pumps
- A strong first-time fix rate
- Experience with variable refrigerant flow systems

Salary £42,000 to £48,000, plus van, overtime and on-call allowance`,
          us: `HVAC Technician
Brightair Mechanical, Baton Rouge, LA

Brightair Mechanical installs and services heating, ventilation and air conditioning for offices, schools and public buildings across south Louisiana.

The role
You will join our team of 35 technicians, leading installs of heat pumps and commercial air conditioning, and running service and repair calls for our service agreement customers.

What we are looking for
- EPA Section 608 Universal certification
- At least 5 years of experience with commercial air conditioning
- Experience installing and commissioning heat pump systems
- A strong first-time fix rate
- Experience with variable refrigerant flow systems
- NATE certification is a plus

Pay $27 to $34 an hour, plus company truck and on-call pay`,
        },
      },
      reason: "Leading heat pump and air conditioning installs for larger buildings is the next step I want to take.",
      paragraphs: [
        {
          uk: "Leading heat pump and air conditioning installs for larger buildings is the next step I want to take, and the HVAC Engineer role at Brightair Building Services offers that.",
          us: "Leading heat pump and air conditioning installs for larger buildings is the next step I want to take, and the HVAC Technician role at Brightair Mechanical offers that.",
        },
        {
          uk: "At Thermacrest Building Services I attend around 5 service and repair calls a day for 60 contract customers, from offices and shops to schools, on air conditioning, heat pumps and ventilation. Your advert asks for a strong first-time fix rate. I kept a first-time fix rate of 91% in 2025 against a company target of 85% by stocking the van with the 40 parts that fail most often.",
          us: "At Thermacrest Mechanical I run around 5 service and repair calls a day for 60 service agreement customers, from offices and stores to schools, on air conditioning, heat pumps and ventilation. Your advert asks for a strong first-time fix rate. I kept a first-time fix rate of 91% in 2025 against a company target of 85% by stocking the truck with the 40 parts that fail most often.",
        },
        {
          uk: "You are also looking for experience installing and commissioning air source heat pumps. I have installed 140 air source heat pumps in homes and small offices since 2022, commissioning each one and showing the owner how to use the controls. In 2024 I led the install of a 24-unit variable refrigerant flow system across 3 floors of an office, finishing 1 week early.",
          us: "You are also looking for experience installing and commissioning heat pump systems. I have installed 140 heat pump systems in homes and small offices since 2022, commissioning each one and showing the owner how to use the controls. In 2024 I led the install of a 24-unit variable refrigerant flow system across 3 floors of an office, finishing 1 week early.",
        },
        {
          uk: "Before that, at Coolbrook Air Conditioning, I serviced around 400 split and cassette air conditioning units a year in shops, restaurants and offices. I hold F-Gas Category 1 certification and a Level 3 Diploma in Refrigeration, Air Conditioning and Heat Pump Systems, and I train 2 apprentices in brazing, vacuum testing and charging systems.",
          us: "Before that, at Coolbrook Air, I serviced around 400 split and ductless air conditioning units a year in stores, restaurants and offices. I hold Environmental Protection Agency (EPA) Section 608 Universal certification and North American Technician Excellence (NATE) certification in air conditioning and heat pump service, and I train 2 apprentices in brazing, vacuum testing and charging systems.",
        },
        {
          uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time.",
          us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time.",
        },
      ],
    },
  },
  {
    id: "cnc-machinist",
    industry: "manufacturing",
    role: "CNC Machinist",
    level: "experienced",
    template: "index",
    blurb: "A CNC machinist who sets, programs and runs Haas and Fanuc machining centres for aerospace parts, with scrap cut from 3.8% to 1.2%.",
    person: { name: "Aaron Whitcombe", email: "aaron.whitcombe@example.com", phone: { uk: "07700 900699", us: "(918) 555-0122" }, location: { uk: "Derby", us: "Tulsa, OK" } },
    profile: {
      uk: "Computer numerical control (CNC) machinist with 9 years setting, programming and running mills and lathes, after a 4-year engineering apprenticeship. Programs Haas and Fanuc controls at the machine and in Mastercam, making titanium and aluminium aerospace parts to tolerances of ±0.01 mm. Cut the cell's scrap rate from 3.8% to 1.2% in 2 years and passed 99% of first-off inspections in 2025. Holds an NVQ Level 3 in Machining.",
      us: "Computer numerical control (CNC) machinist with 9 years setting, programming and running mills and lathes, after a 4-year registered apprenticeship. Programs Haas and Fanuc controls at the machine and in Mastercam, making titanium and aluminum aerospace parts to tolerances of ±0.0005 inches. Cut the cell's scrap rate from 3.8% to 1.2% in 2 years and passed 99% of first-article inspections in 2025. Holds 4 National Institute for Metalworking Skills (NIMS) credentials.",
    },
    experience: [
      {
        title: "CNC Machinist",
        org: "Hawkstone Precision",
        location: { uk: "Derby", us: "Tulsa, OK" },
        start: "2021-01",
        current: true,
        bullets: [
          "Set, program and run 3 Haas and 2 Fanuc machining centres, including a 5-axis mill, making titanium and aluminium aerospace parts in batches of 5 to 200",
          "Write and prove around 15 new programs a month in Mastercam and at the control, cutting cycle times by an average of 18% on 40 repeat parts",
          "Cut the cell's scrap rate from 3.8% to 1.2% in 2 years by adding in-process probing and changing tools at a set count",
          {
            uk: "Passed 99% of first-off inspections in 2025, checking each first part against the drawing with micrometers, bore gauges and the coordinate measuring machine",
            us: "Passed 99% of first-article inspections in 2025, checking each first part against the drawing with micrometers, bore gauges and the coordinate measuring machine",
          },
          {
            uk: "Read engineering drawings with geometric tolerances such as position and flatness, holding ±0.01 mm on bores and faces",
            us: "Read engineering drawings with geometric tolerances such as position and flatness, holding ±0.0005 inches on bores and faces",
          },
          "Trained 3 machine operators to load parts, change inserts and check parts at the machine, giving setters 6 more hours a week for new jobs",
        ],
      },
      {
        title: { uk: "CNC Setter-Operator", us: "CNC Operator" },
        org: "Brassmoor Engineering",
        location: { uk: "Burton upon Trent", us: "Broken Arrow, OK" },
        start: "2017-09",
        end: "2020-12",
        bullets: [
          {
            uk: "Ran 2 Fanuc lathes and a Haas mill on a 2-shift pattern, setting each job and making pump and valve parts for the oil and gas industry",
            us: "Ran 2 Fanuc lathes and a Haas mill on a 2-shift schedule, setting each job and making pump and valve parts for the oil and gas industry",
          },
          "Cut changeover times from 90 to 40 minutes by building standard fixtures and tool lists for the 25 most common parts",
          "Tested inserts from 2 tool suppliers in 2019, cutting tool cost per part by 22% on the lathes",
          "Inspected around 60 parts a shift with micrometers and height gauges, logging each result for the quality team",
        ],
      },
      {
        title: { uk: "Engineering Apprentice", us: "Machinist Apprentice" },
        org: "Brassmoor Engineering",
        location: { uk: "Burton upon Trent", us: "Broken Arrow, OK" },
        start: "2013-09",
        end: "2017-08",
        bullets: [
          {
            uk: "Completed a 4-year engineering apprenticeship with an NVQ Level 3 in Machining, passing the end-point assessment with a distinction",
            us: "Completed a 4-year registered apprenticeship of 8,000 hours, earning 4 National Institute for Metalworking Skills (NIMS) credentials",
          },
          "Machined around 2,000 parts on manual lathes and mills in the first 2 years, before moving onto the CNC machines",
          {
            uk: "Wrote 12 set-up sheets for repeat parts, still in use on the shop floor",
            us: "Wrote 12 setup sheets for repeat parts, still in use on the shop floor",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Level 3 Diploma in Advanced Manufacturing Engineering", us: "Certificate in Machining Technology" },
        org: { uk: "Burton and South Derbyshire College", us: "Tulsa Technology Center" },
        start: "2013",
        end: "2017",
      },
    ],
    certificates: [
      {
        title: { uk: "NVQ Level 3 Extended Diploma in Machining", us: "NIMS Machining Level I: CNC Milling and Turning" },
        org: { uk: "EAL", us: "National Institute for Metalworking Skills" },
        end: "2017",
      },
      { title: "Mastercam Certified Professional (Mill)", org: "Mastercam", end: "2022" },
    ],
    skills: [
      "CNC setting",
      "CNC programming",
      "Haas",
      "Fanuc",
      "Mastercam",
      "5-axis machining",
      "Engineering drawings",
      "Geometric tolerances",
      { uk: "First-off inspections", us: "First-article inspections" },
      "Scrap rate",
    ],
    names: ["Aaron", "Whitcombe", "Hawkstone", "Brassmoor", "Kelsall", "Fanuc", "Mastercam", "Derbyshire"],
    letter: {
      job: {
        title: "CNC Machinist",
        employer: "Kelsall Aerospace",
        advert: {
          uk: `CNC Machinist
Kelsall Aerospace, Derby

Kelsall Aerospace makes precision parts for aircraft engines and landing gear, with 140 staff and 30 CNC machines.

The role
You will set, program and run 5-axis machining centres on day shifts, making titanium and nickel alloy parts in small batches.

What we are looking for
- At least 5 years setting and programming CNC mills
- Experience with Fanuc or Haas controls, and CAM software such as Mastercam
- Experience reading engineering drawings and working to tight tolerances
- A record of low scrap and parts right first time
- An engineering apprenticeship or NVQ Level 3

Salary £38,000 to £44,000, plus shift allowance`,
          us: `CNC Machinist
Kelsall Aerospace, Tulsa, OK

Kelsall Aerospace makes precision parts for aircraft engines and landing gear, with 140 employees and 30 CNC machines.

The role
You will set, program and run 5-axis machining centers on day shift, making titanium and nickel alloy parts in small batches.

What we are looking for
- At least 5 years setting and programming CNC mills
- Experience with Fanuc or Haas controls, and CAM software such as Mastercam
- Experience reading engineering drawings and working to tight tolerances
- A record of low scrap and parts right the first time
- A registered apprenticeship or NIMS credentials

Pay $30 to $37 an hour, plus shift differential`,
        },
      },
      reason: "I want to spend more of my time on 5-axis work and programming for aircraft engine parts.",
      paragraphs: [
        {
          uk: "The CNC Machinist post at Kelsall Aerospace would give me the chance to spend more of my time on 5-axis work and programming for aircraft engine parts. I have set, programmed and run mills and lathes for 9 years, after a 4-year engineering apprenticeship.",
          us: "The CNC Machinist position at Kelsall Aerospace would give me the chance to spend more of my time on 5-axis work and programming for aircraft engine parts. I have set, programmed and run mills and lathes for 9 years, after a 4-year registered apprenticeship.",
        },
        "At Hawkstone Precision I set, program and run 3 Haas and 2 Fanuc machining centres, including a 5-axis mill, making titanium and aluminium aerospace parts in batches of 5 to 200. I write and prove around 15 new programs a month in Mastercam and at the control, cutting cycle times by an average of 18% on 40 repeat parts.",
        {
          uk: "Your advert asks for a record of low scrap and parts right first time. I cut the cell's scrap rate from 3.8% to 1.2% in 2 years by adding in-process probing and changing tools at a set count. I also passed 99% of first-off inspections in 2025, checking each first part against the drawing with micrometers, bore gauges and the coordinate measuring machine.",
          us: "Your advert asks for a record of low scrap and parts right the first time. I cut the cell's scrap rate from 3.8% to 1.2% in 2 years by adding in-process probing and changing tools at a set count. I also passed 99% of first-article inspections in 2025, checking each first part against the drawing with micrometers, bore gauges and the coordinate measuring machine.",
        },
        {
          uk: "You are also looking for experience reading engineering drawings and working to tight tolerances. I read engineering drawings with geometric tolerances such as position and flatness, holding ±0.01 mm on bores and faces. I completed a 4-year engineering apprenticeship with an NVQ Level 3 in Machining.",
          us: "You are also looking for experience reading engineering drawings and working to tight tolerances. I read engineering drawings with geometric tolerances such as position and flatness, holding ±0.0005 inches on bores and faces. I completed a 4-year registered apprenticeship of 8,000 hours, earning 4 National Institute for Metalworking Skills (NIMS) credentials.",
        },
        {
          uk: "Thank you for considering my application. My CV is attached, and I would welcome the chance to discuss the role.",
          us: "Thank you for considering my application. My resume is attached, and I would welcome the chance to discuss the role.",
        },
      ],
    },
  },
  {
    id: "firefighter",
    industry: "public-sector",
    role: "Firefighter",
    level: "experienced",
    template: "standard",
    blurb: {
      uk: "A full-time firefighter with 8 years on a busy watch, from house fires and road traffic collisions to water rescues and home fire safety visits.",
      us: "A firefighter and EMT with 8 years at a busy station, from structure fires and medical calls to swift water rescues and smoke alarm installs.",
    },
    person: { name: "Stuart Ainsworth", email: "stuart.ainsworth@example.com", phone: { uk: "07700 900700", us: "(915) 555-0123" }, location: { uk: "Carlisle", us: "El Paso, TX" } },
    profile: {
      uk: "Full-time firefighter with 8 years at Solway Fire and Rescue Service, after 3 years as an on-call firefighter. Attends around 280 incidents a year from a 2-pump station, from house fires and road traffic collisions to water rescues and flooding. Drives fire engines under blue lights, with no collisions in 5 years, and plans the watch's training drills on water rescue and casualty care. Completed 410 home fire safety visits in 2025, fitting 520 smoke alarms in the homes of people most at risk of fire.",
      us: "Firefighter and emergency medical technician (EMT) with 8 years at the Mesquite Hills Fire Department, after 3 years as a volunteer firefighter. Responds to around 650 calls a year from a 2-company station, about 70% of them medical, from structure fires and vehicle crashes to swift water rescues. Holds Firefighter II certification from the Texas Commission on Fire Protection and drives the station's engine as a certified driver/operator, with no collisions in 5 years. Installed 520 smoke alarms in 410 homes in 2025 through the department's free smoke alarm program.",
    },
    experience: [
      {
        title: "Firefighter",
        org: { uk: "Solway Fire and Rescue Service", us: "Mesquite Hills Fire Department" },
        location: { uk: "Carlisle", us: "El Paso, TX" },
        start: "2018-04",
        current: true,
        bullets: [
          {
            uk: "Attend around 280 incidents a year on a watch of 12 at a 2-pump station, from house fires and road traffic collisions to water rescues and flooding",
            us: "Respond to around 650 calls a year from a 2-company station on 24-hour shifts, from structure fires and vehicle crashes to swift water rescues",
          },
          {
            uk: "Entered burning buildings in breathing apparatus at 46 fires since 2020, rescuing 7 people from 5 house fires",
            us: "Entered burning buildings wearing self-contained breathing apparatus at 46 fires since 2020, rescuing 7 people from 5 house fires",
          },
          {
            uk: "Cut casualties free from vehicles at around 30 road traffic collisions a year with hydraulic rescue tools",
            us: "Gave emergency medical care as an EMT on around 450 medical calls a year, including cardiopulmonary resuscitation at 9 cardiac arrests in 2025",
          },
          {
            uk: "Drove fire engines to around 600 emergency calls since 2021 after passing the emergency response driving course, with no collisions",
            us: "Drove the station's engine to around 600 emergency calls since 2021 as a certified driver/operator, with no collisions",
          },
          {
            uk: "Plan and run 2 training drills a month for the watch, on water rescue, working at height and casualty care, keeping all 12 firefighters in date on core skills",
            us: "Plan and run 2 training drills a month for the shift, on swift water rescue, rope rescue and patient care, keeping all 12 firefighters current on core skills",
          },
          {
            uk: "Completed 410 home fire safety visits in 2025, fitting 520 smoke alarms in the homes of people most at risk of fire",
            us: "Installed 520 smoke alarms in 410 homes in 2025 through the department's free smoke alarm program",
          },
        ],
      },
      {
        title: { uk: "On-call Firefighter", us: "Volunteer Firefighter" },
        org: { uk: "Solway Fire and Rescue Service", us: "Cottonwood Flats Volunteer Fire Department" },
        location: { uk: "Brampton", us: "Canutillo, TX" },
        start: "2015-03",
        end: "2018-03",
        bullets: [
          {
            uk: "Answered around 90 calls a year from a 1-pump on-call station in a market town, reaching the station within 5 minutes of each pager alert",
            us: "Answered around 90 calls a year from a 1-engine volunteer station, reaching the station within 5 minutes of each pager alert",
          },
          {
            uk: "Gave 120 hours a week of on-call cover for 3 years, while holding a full-time day job as a bricklayer",
            us: "Covered 2 overnight shifts a week at the station for 3 years, while holding a full-time day job in construction",
          },
          {
            uk: "Completed the initial course and 3 years of weekly drill nights, gaining competent firefighter status in 2017",
            us: "Completed fire academy training and 3 years of weekly drill nights, gaining Texas firefighter certification in 2018",
          },
          {
            uk: "Wore breathing apparatus at 14 fires, including 3 house fires, after passing the breathing apparatus course in 2016",
            us: "Wore self-contained breathing apparatus at 14 fires, including 3 house fires, after passing the breathing apparatus course in 2016",
          },
          {
            uk: "Gave 12 fire safety talks at schools and village halls, reaching around 600 people",
            us: "Gave 12 fire safety talks at schools and community centers, reaching around 600 people",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BTEC Level 3 Extended Diploma in Uniformed Protective Services", us: "Associate of Applied Science in Fire Technology" },
        org: { uk: "Carlisle College", us: "El Paso Community College" },
        start: "2012",
        end: "2014",
        grade: { uk: "Distinction", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Firefighter Development Programme", us: "Basic Structure Fire Protection (Firefighter I and II)" },
        org: { uk: "Solway Fire and Rescue Service", us: "Texas Commission on Fire Protection" },
        end: "2018",
      },
      {
        title: { uk: "Immediate Emergency Care", us: "Emergency Medical Technician, Nationally Registered" },
        org: { uk: "Solway Fire and Rescue Service", us: "National Registry of Emergency Medical Technicians" },
        end: "2018",
      },
      {
        title: { uk: "Emergency Response Driving (Fire Engines)", us: "Driver/Operator, Pumper" },
        org: { uk: "Solway Fire and Rescue Service", us: "Texas Commission on Fire Protection" },
        end: "2021",
      },
      {
        title: "Swift Water Rescue Technician",
        org: { uk: "Rescue 3 Europe", us: "Rescue 3 International" },
        end: "2022",
      },
    ],
    skills: [
      { uk: "Firefighting", us: "Structure firefighting" },
      { uk: "Breathing apparatus", us: "Self-contained breathing apparatus" },
      { uk: "Road traffic collisions", us: "Emergency medical care" },
      { uk: "Hydraulic rescue tools", us: "Cardiopulmonary resuscitation" },
      { uk: "Water rescue", us: "Swift water rescue" },
      { uk: "Emergency response driving", us: "Driver/operator" },
      { uk: "Casualty care", us: "Patient care" },
      "Training drills",
      { uk: "Home fire safety visits", us: "Smoke alarm installs" },
      { uk: "Smoke alarms", us: "Rope rescue" },
    ],
    names: ["Stuart", "Ainsworth", "Solway", "Lunesdale", "Sunmesa", "Canutillo", "Carlisle", "El", "Paso"],
    letter: {
      job: {
        title: { uk: "Firefighter (Transferee)", us: "Firefighter (Lateral Entry)" },
        employer: { uk: "Lunesdale Fire and Rescue Service", us: "Sunmesa Fire Department" },
        advert: {
          uk: `Firefighter (Transferee)
Lunesdale Fire and Rescue Service, Lancaster

We protect 320,000 people across Lancaster and the Lune valley from 11 fire stations, and we welcome firefighters who want to transfer from another fire and rescue service.

The role
You will join a watch at our busiest full-time station, responding to fires, road traffic collisions, water rescues and flooding, and carrying out home fire safety visits.

What we are looking for
- Serving full-time firefighters who are competent in role
- Experience in breathing apparatus and road traffic collision rescue
- An emergency response driving qualification
- Water rescue experience
- Experience of community fire safety work`,
          us: `Firefighter (Lateral Entry)
Sunmesa Fire Department, San Antonio, TX

We serve 280,000 residents from 14 stations, and we welcome firefighters who want to make a lateral transfer from another department.

The role
You will join an engine company, responding to fires, medical calls, vehicle crashes and water rescues, and taking part in community risk reduction.

What we are looking for
- Basic Structure Fire Protection certification from the Texas Commission on Fire Protection
- Current EMT-Basic certification or higher
- At least 3 years as a career firefighter
- Driver/operator experience
- Swift water rescue training`,
        },
      },
      reason: {
        uk: "My family is moving to Lancaster, and I want to keep working as a full-time firefighter.",
        us: "My family is moving to San Antonio, and I want to keep working as a career firefighter.",
      },
      paragraphs: [
        {
          uk: "My family is moving to Lancaster, and I want to keep working as a full-time firefighter. I am applying to transfer to Lunesdale Fire and Rescue Service as a Firefighter on one of its watches.",
          us: "My family is moving to San Antonio, and I want to keep working as a career firefighter. I am applying for a lateral transfer to the Sunmesa Fire Department as a Firefighter in one of its engine companies.",
        },
        {
          uk: "I am a full-time firefighter with 8 years at Solway Fire and Rescue Service, after 3 years as an on-call firefighter. I attend around 280 incidents a year on a watch of 12 at a 2-pump station, from house fires and road traffic collisions to water rescues and flooding.",
          us: "I am a firefighter and emergency medical technician (EMT) with 8 years at the Mesquite Hills Fire Department, after 3 years as a volunteer firefighter. I respond to around 650 calls a year from a 2-company station, about 70% of them medical, from structure fires and vehicle crashes to swift water rescues.",
        },
        {
          uk: "Your advert asks for experience in breathing apparatus and road traffic collision rescue. Since 2020 I have entered burning buildings in breathing apparatus at 46 fires, rescuing 7 people from 5 house fires. I also cut casualties free from vehicles at around 30 road traffic collisions a year with hydraulic rescue tools.",
          us: "Your advert asks for Basic Structure Fire Protection certification and current EMT-Basic certification. I hold Firefighter II certification from the Texas Commission on Fire Protection. As an EMT I give emergency medical care on around 450 medical calls a year, including cardiopulmonary resuscitation at 9 cardiac arrests in 2025.",
        },
        {
          uk: "You are also looking for an emergency response driving qualification. I have driven fire engines to around 600 emergency calls since 2021 after passing the emergency response driving course, with no collisions. In 2025 I completed 410 home fire safety visits, fitting 520 smoke alarms in the homes of people most at risk of fire. I also plan and run 2 training drills a month for the watch, on water rescue, working at height and casualty care.",
          us: "You are also looking for driver/operator experience. I have driven the station's engine to around 600 emergency calls since 2021 as a certified driver/operator, with no collisions. In 2025 I also installed 520 smoke alarms in 410 homes through the department's free smoke alarm program. Each month I plan and run 2 training drills for the shift, on swift water rescue, rope rescue and patient care.",
        },
        "Thank you for considering my application. I would welcome the chance to discuss the transfer with you.",
      ],
    },
  },
  {
    id: "nursery-practitioner",
    industry: "education",
    role: { uk: "Nursery Practitioner", us: "Preschool Teacher" },
    level: "early",
    template: "chalkboard",
    blurb: {
      uk: "A nursery practitioner who is key person for 8 pre-school children, with a Level 3 Early Years Educator qualification.",
      us: "A preschool teacher who leads a classroom of 16 children aged 3 to 5, with a Child Development Associate credential.",
    },
    person: { name: "Poppy Lennox", email: "poppy.lennox@example.com", phone: { uk: "07700 900701", us: "(559) 555-0124" }, location: { uk: "Coventry", us: "Fresno, CA" } },
    profile: {
      uk: "Nursery practitioner with 2 years in the pre-school room of a 62-place day nursery, after a 2-year apprenticeship in the baby and toddler rooms. Holds a Level 3 Early Years Educator qualification and a paediatric first aid certificate. Works as key person for 8 children aged 3 to 4, planning activities and tracking progress against the Early Years Foundation Stage (EYFS). Raised parents' use of the nursery's online learning journal from 55% to 90% of families in a year.",
      us: "Preschool teacher with 2 years leading a classroom of 16 children aged 3 to 5, after 2 years as an assistant teacher with infants and toddlers. Holds a Child Development Associate (CDA) credential and pediatric first aid certification. Plans activities around the California Preschool Learning Foundations and tracks progress with the Desired Results Developmental Profile. Raised parents' use of the center's family app from 55% to 90% of families in a year.",
    },
    experience: [
      {
        title: { uk: "Nursery Practitioner", us: "Preschool Teacher" },
        org: { uk: "Conker Tree Day Nursery", us: "Sunflower Hill Child Development Center" },
        location: { uk: "Coventry", us: "Fresno, CA" },
        start: "2024-09",
        current: true,
        bullets: [
          {
            uk: "Plan activities for 8 key children aged 3 to 4 from their interests and next steps, across the 7 areas of learning in the Early Years Foundation Stage",
            us: "Plan activities for a classroom of 16 children aged 3 to 5 from their interests, across the domains of the California Preschool Learning Foundations",
          },
          {
            uk: "Record observations and progress for each key child in the online learning journal, with 7 of 8 at expected levels or above in summer 2026",
            us: "Record observations for each child and complete the Desired Results Developmental Profile twice a year, with 14 of 16 at or above the expected level in spring 2026",
          },
          {
            uk: "Raised parents' use of the online learning journal from 55% to 90% of families in a year by posting 2 photos and a short update for each child every week",
            us: "Raised parents' use of the center's family app from 55% to 90% of families in a year by posting 2 photos and a short update for each child every week",
          },
          {
            uk: "Prepared 10 children for Reception in 2025 with 3 visits from their new teachers and a photo booklet for each",
            us: "Prepared 12 children for kindergarten in 2025 with 3 teacher visits and a photo booklet for each",
          },
          {
            uk: "Spotted speech delays in 3 key children in 2025 and shared concerns with parents and the special educational needs coordinator, leading to 3 speech and language referrals",
            us: "Spotted speech delays in 3 children in 2025 and shared concerns with parents and the center director, leading to 3 speech and language evaluations",
          },
        ],
      },
      {
        title: { uk: "Apprentice Nursery Practitioner", us: "Assistant Teacher" },
        org: { uk: "Conker Tree Day Nursery", us: "Sunflower Hill Child Development Center" },
        location: { uk: "Coventry", us: "Fresno, CA" },
        start: "2022-09",
        end: "2024-08",
        bullets: [
          {
            uk: "Completed a Level 3 Early Years Educator apprenticeship in 2 years, with a distinction in the end-point assessment",
            us: "Earned the Child Development Associate (CDA) credential in 2024 after 120 hours of training",
          },
          {
            uk: "Cared for babies and toddlers aged 6 months to 2 years in rooms of 9 and 12, following each child's feeding, nappy and sleep routines",
            us: "Cared for infants and toddlers in rooms of 8 and 12, following each child's routines",
          },
          "Planned and led 2 messy play and sensory sessions a week for the toddler room",
        ],
      },
    ],
    education: [
      {
        title: { uk: "Level 3 Early Years Educator (Apprenticeship)", us: "Associate of Arts in Early Childhood Education" },
        org: { uk: "Coventry College", us: "Fresno City College" },
        start: "2022-09",
        end: "2024-06",
        grade: { uk: "Distinction", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Paediatric First Aid (12 hours)", us: "CDA Credential (Preschool)" },
        org: { uk: "St John Ambulance", us: "Council for Professional Recognition" },
        end: "2024",
      },
      {
        title: { uk: "Safeguarding Children, Level 2", us: "Pediatric First Aid and CPR" },
        org: { uk: "Coventry Safeguarding Children Partnership", us: "American Red Cross" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "Early Years Foundation Stage", us: "California Preschool Learning Foundations" },
      { uk: "Key person", us: "Desired Results Developmental Profile" },
      "Activity planning",
      "Observations",
      { uk: "Online learning journals", us: "Family app updates" },
      "Parent updates",
      { uk: "Preparing for Reception", us: "Preparing for kindergarten" },
      "Speech and language",
      "Sensory play",
      { uk: "Paediatric first aid", us: "Pediatric first aid" },
    ],
    names: ["Poppy", "Lennox", "Conker", "Hazelnut", "Ofsted", "Fresno"],
    letter: {
      job: {
        title: { uk: "Nursery Practitioner (Pre-school Room)", us: "Preschool Teacher" },
        employer: { uk: "Hazelnut House Day Nursery", us: "Hazelnut House Preschool" },
        advert: {
          uk: `Nursery Practitioner (Pre-school Room)
Hazelnut House Day Nursery, Coventry

Hazelnut House is an independent day nursery for 40 children aged 3 months to 5 years, rated Good by Ofsted.

The role
You will join our pre-school room team, working as key person for a group of children aged 3 to 4 and helping them get ready for school.

What we are looking for
- A full and relevant Level 3 early years qualification
- At least 1 year of experience in a pre-school room
- Good knowledge of the EYFS
- Confident, regular communication with parents
- A current paediatric first aid certificate

Salary £24,500 to £26,000, plus a childcare discount`,
          us: `Preschool Teacher
Hazelnut House Preschool, Fresno, CA

Hazelnut House is a licensed preschool for 48 children aged 2 to 5, with 3 classrooms.

The role
You will join our teaching team and lead a classroom of 16 children aged 3 to 5 with an assistant teacher, helping them get ready for kindergarten.

What we are looking for
- A CDA credential or at least 12 units in early childhood education
- At least 1 year of experience as a preschool teacher
- Knowledge of the California Preschool Learning Foundations and the DRDP
- Regular, friendly communication with families
- Current pediatric first aid and CPR certification

Pay $20 to $23 an hour`,
        },
      },
      reason: {
        uk: "I want to work in a smaller nursery where I can get to know every family well.",
        us: "I want to work at a smaller preschool where I can get to know every family well.",
      },
      paragraphs: [
        {
          uk: "I am keen to join Hazelnut House as a Nursery Practitioner in its pre-school room. I want to work in a smaller nursery where I can get to know every family well.",
          us: "I am keen to join Hazelnut House Preschool as a Preschool Teacher. I want to work at a smaller preschool where I can get to know every family well.",
        },
        {
          uk: "At Conker Tree Day Nursery I plan activities for 8 key children aged 3 to 4 from their interests and next steps, across the 7 areas of learning in the Early Years Foundation Stage. I record observations and progress for each key child in the online learning journal, with 7 of 8 at expected levels or above in summer 2026.",
          us: "At Sunflower Hill Child Development Center I plan activities for a classroom of 16 children aged 3 to 5 from their interests, across the domains of the California Preschool Learning Foundations. I record observations for each child and complete the Desired Results Developmental Profile twice a year, with 14 of 16 at or above the expected level in spring 2026.",
        },
        {
          uk: "Your advert asks for confident, regular communication with parents. I raised parents' use of the online learning journal from 55% to 90% of families in a year by posting 2 photos and a short update for each child every week. When I spotted speech delays in 3 key children in 2025, I shared concerns with parents and the special educational needs coordinator, leading to 3 speech and language referrals.",
          us: "Your advert asks for regular, friendly communication with families. I raised parents' use of the center's family app from 55% to 90% of families in a year by posting 2 photos and a short update for each child every week. When I spotted speech delays in 3 children in 2025, I shared concerns with parents and the center director, leading to 3 speech and language evaluations.",
        },
        {
          uk: "I hold a Level 3 Early Years Educator qualification and a paediatric first aid certificate. As an apprentice in the baby and toddler rooms, I cared for babies and toddlers aged 6 months to 2 years in rooms of 9 and 12. I also planned and led 2 messy play and sensory sessions a week for the toddler room.",
          us: "I hold a Child Development Associate (CDA) credential and pediatric first aid certification. Before leading a classroom, I cared for infants and toddlers in rooms of 8 and 12 as an assistant teacher. I also planned and led 2 messy play and sensory sessions a week for the toddler room.",
        },
        "Thank you for your time. I would welcome the chance to visit and meet the team.",
      ],
    },
  },
];
