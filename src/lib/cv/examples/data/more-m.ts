import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** Phase 3, batch 2 (28 Nov 2026): the last nine listed roles, and 21 roles added to the industry packs. */
export const MORE_M: ExampleSpec[] = [
  {
    id: "aircraft-maintenance-engineer",
    industry: "aviation",
    role: { uk: "Aircraft Maintenance Engineer", us: "Aircraft Maintenance Technician" },
    level: "experienced",
    template: "technical",
    blurb: {
      uk: "A B1 licensed aircraft engineer with 9 years on Boeing 737 and Airbus A320 aircraft, from overnight line work to heavy checks.",
      us: "An A&P aircraft maintenance technician with 9 years on Boeing 737 and Airbus A320 aircraft, from overnight line work to heavy checks.",
    },
    person: { name: "Gregor Strachan", email: "gregor.strachan@example.com", phone: { uk: "07700 900678", us: "(907) 555-0101" }, location: { uk: "Prestwick", us: "Anchorage, AK" } },
    profile: {
      uk: "Licensed aircraft maintenance engineer with 9 years on Boeing 737 and Airbus A320 family aircraft, holding a Part-66 B1.1 licence with both type ratings. Certifies line and base maintenance for 3 airline customers, signing around 40 certificates of release to service a month. Led the mechanical work on 14 heavy checks in 2024 and 2025, handing 12 aircraft back on or before the planned date. Has filed 26 safety reports since 2022, 4 of which led to changes in task cards.",
      us: "Aircraft maintenance technician with 9 years on Boeing 737 and Airbus A320 family aircraft, holding a Federal Aviation Administration (FAA) Airframe and Powerplant (A&P) certificate. Inspects and repairs aircraft in line and heavy maintenance for 3 airline customers, closing around 40 work packages a month. Led the mechanical work on 14 heavy checks in 2024 and 2025, returning 12 aircraft to service on or before the planned date. Has filed 26 safety reports since 2022, 4 of which led to changes in task cards.",
    },
    experience: [
      {
        title: { uk: "B1 Licensed Aircraft Engineer", us: "Aircraft Maintenance Technician" },
        org: { uk: "Corsewall Aviation Engineering", us: "Kenai Aviation Services" },
        location: { uk: "Prestwick", us: "Anchorage, AK" },
        start: "2021-03",
        current: true,
        bullets: [
          {
            uk: "Certify line and base maintenance on Boeing 737-800 and Airbus A320 aircraft for 3 airline customers, signing around 40 certificates of release to service a month",
            us: "Inspect and repair Boeing 737-800 and Airbus A320 aircraft in line and heavy maintenance for 3 airline customers, closing around 40 work packages a month",
          },
          {
            uk: "Led the mechanical work on 14 heavy checks in 2024 and 2025, each lasting around 3 weeks, handing 12 of the 14 aircraft back on or before the planned date",
            us: "Led the mechanical work on 14 heavy checks in 2024 and 2025, each lasting around 3 weeks, returning 12 of the 14 aircraft to service on or before the planned date",
          },
          "Found the cause of a recurring bleed air fault on 4 Boeing 737s in a batch of worn valves, cutting repeat defect reports on the fleet by 30% in a year",
          "Cleared overnight defects ahead of the first wave of departures, keeping technical dispatch reliability at 99.2% in 2025 against a target of 98.5%",
          "Attended 22 aircraft on ground (AOG) call-outs at outstations in 2025, returning each aircraft to service in an average of 6 hours",
          "Filed 26 safety reports through the safety management system (SMS) since 2022, 4 of which led to changes in task cards",
        ],
      },
      {
        title: "Aircraft Mechanic",
        org: "Kilbrannan Airways",
        location: { uk: "Glasgow", us: "Anchorage, AK" },
        start: "2017-09",
        end: "2021-02",
        bullets: [
          "Completed daily and weekly checks on up to 6 Boeing 737-800 aircraft a night, from a fleet of 18 based at the airport",
          "Replaced around 30 wheel and brake assemblies a month, with no repeat faults found in 3 quality audits",
          "Performed 40 internal engine inspections on CFM56 engines in 2020, finding 3 damaged blades before they reached their limits",
          "Gained engine run and taxi approval on the Boeing 737 in 2019, after 25 supervised engine runs",
          {
            uk: "Passed the last 4 Part-66 B1.1 modules while working nights, gaining the licence in 2020",
            us: "Trained 4 new mechanics on the airline's daily check task cards in 2020, signing off each one after 6 weeks",
          },
        ],
      },
      {
        title: { uk: "Aircraft Maintenance Apprentice", us: "Line Service Technician" },
        org: { uk: "Kilbrannan Airways", us: "Spenard Aviation" },
        location: { uk: "Glasgow", us: "Anchorage, AK" },
        start: "2015-09",
        end: "2017-08",
        bullets: [
          {
            uk: "Completed a 2-year apprenticeship in the airline's hangar, working on scheduled checks with licensed engineers",
            us: "Fueled, towed and parked around 20 aircraft a day at a fixed-base operator, from light aircraft to business jets",
          },
          {
            uk: "Passed 9 of the 13 Part-66 B1.1 modules during the apprenticeship, with an HNC in Aircraft Engineering",
            us: "Passed the FAA written, oral and practical tests for the A&P certificate in 2017, at the end of the course",
          },
          {
            uk: "Kept tool control records for a store of 1,200 tools, with no tools lost in 2 years",
            us: "Checked fuel quality on 2 fuel trucks each morning, with no findings in 2 airport audits",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "HNC Aircraft Engineering", us: "Associate of Applied Science in Aviation Maintenance Technology" },
        org: { uk: "Ayrshire College", us: "University of Alaska Anchorage" },
        end: "2017",
      },
    ],
    certificates: [
      {
        title: { uk: "Part-66 Aircraft Maintenance Licence, Category B1.1", us: "Airframe and Powerplant certificate" },
        org: { uk: "UK Civil Aviation Authority", us: "Federal Aviation Administration" },
      },
      {
        title: { uk: "Boeing 737-800 (CFM56) type rating", us: "Boeing 737 Next Generation maintenance course" },
        org: { uk: "UK Civil Aviation Authority", us: "Kilbrannan Airways" },
        end: "2020",
      },
      {
        title: { uk: "Airbus A320 family (CFM56) type rating", us: "Airbus A320 family maintenance course" },
        org: { uk: "UK Civil Aviation Authority", us: "Kenai Aviation Services" },
        end: "2021",
      },
      {
        title: { uk: "Human factors and fuel tank safety training", us: "Human factors training" },
        org: { uk: "Corsewall Aviation Engineering", us: "Kenai Aviation Services" },
        end: "2025",
      },
    ],
    skills: [
      "Boeing 737",
      "Airbus A320",
      { uk: "Line and base maintenance", us: "Line and heavy maintenance" },
      "Heavy checks",
      { uk: "Release to service", us: "Work packages" },
      "Repeat defects",
      "Dispatch reliability",
      "Aircraft on ground call-outs",
      "Engine runs",
      "Safety management system",
    ],
    names: ["Gregor", "Strachan", "Corsewall", "Kenai", "Kilbrannan", "Spenard", "Ardnave", "Prestwick", "Ayrshire", "Anchorage", "Aberdeen", "B1", "CFM56", "A320"],
    letter: {
      job: {
        title: { uk: "B1 Licensed Aircraft Engineer", us: "Aircraft Maintenance Technician" },
        employer: { uk: "Ardnave Airways", us: "Ardnave Air Cargo" },
        advert: {
          uk: `B1 Licensed Aircraft Engineer
Ardnave Airways, Glasgow

Ardnave Airways flies a fleet of 28 Boeing 737-800 aircraft from Glasgow and Aberdeen. From 2027 we are bringing our heavy checks in-house, in a new 3-bay hangar at Glasgow.

The role
Join our base maintenance team, certifying heavy checks and defect work on our 737 fleet on a 4-on, 4-off shift pattern.

What we are looking for
- A Part-66 B1.1 licence with a Boeing 737-600/700/800/900 type rating
- At least 3 years of base maintenance experience
- Experience leading the mechanical work on heavy checks
- Sound troubleshooting of repeat defects
- A strong safety culture

Salary £58,000 to £64,000, plus shift allowance`,
          us: `Aircraft Maintenance Technician
Ardnave Air Cargo, Anchorage, AK

Ardnave Air Cargo flies a fleet of 16 Boeing 737-800 freighters across Alaska and the Pacific Northwest. From 2027 we are bringing our heavy checks in-house, in a new 3-bay hangar in Anchorage.

The role
Join our heavy maintenance team, inspecting and repairing our 737 fleet on a rotating shift schedule.

What we are looking for
- An FAA Airframe and Powerplant certificate
- At least 3 years of heavy maintenance experience on Boeing 737 or Airbus A320 aircraft
- Experience leading the mechanical work on heavy checks
- Sound troubleshooting of repeat defects
- A strong safety culture

Pay $46 to $54 an hour, plus shift differential`,
        },
      },
      reason: {
        uk: "I want to work on one airline's own Boeing 737 fleet, where I can follow each aircraft from one heavy check to the next.",
        us: "I want to work on one carrier's own Boeing 737 fleet, where I can follow each aircraft from one heavy check to the next.",
      },
      paragraphs: [
        {
          uk: "When Ardnave Airways brings its heavy checks in-house in 2027, I would like to be on the base maintenance team as a B1 Licensed Aircraft Engineer. I want to work on one airline's own Boeing 737 fleet, where I can follow each aircraft from one heavy check to the next.",
          us: "When Ardnave Air Cargo brings its heavy checks in-house in 2027, I would like to be on the heavy maintenance team as an Aircraft Maintenance Technician. I want to work on one carrier's own Boeing 737 fleet, where I can follow each aircraft from one heavy check to the next.",
        },
        {
          uk: "At Corsewall Aviation Engineering I certify line and base maintenance on Boeing 737-800 and Airbus A320 aircraft for 3 airline customers, signing around 40 certificates of release to service a month. Your advert asks for experience leading the mechanical work on heavy checks. I led the mechanical work on 14 heavy checks in 2024 and 2025, each lasting around 3 weeks, handing 12 of the 14 aircraft back on or before the planned date.",
          us: "At Kenai Aviation Services I inspect and repair Boeing 737-800 and Airbus A320 aircraft in line and heavy maintenance for 3 airline customers, closing around 40 work packages a month. Your advert asks for experience leading the mechanical work on heavy checks. I led the mechanical work on 14 heavy checks in 2024 and 2025, each lasting around 3 weeks, returning 12 of the 14 aircraft to service on or before the planned date.",
        },
        "You are also looking for sound troubleshooting of repeat defects. I found the cause of a recurring bleed air fault on 4 Boeing 737s in a batch of worn valves, cutting repeat defect reports on the fleet by 30% in a year. I also cleared overnight defects ahead of the first wave of departures, keeping technical dispatch reliability at 99.2% in 2025 against a target of 98.5%.",
        {
          uk: "Your advert also asks for a strong safety culture. I have filed 26 safety reports through the safety management system (SMS) since 2022, 4 of which led to changes in task cards. I hold a Part-66 B1.1 licence with type ratings on the Boeing 737 and Airbus A320.",
          us: "Your advert also asks for a strong safety culture. I have filed 26 safety reports through the safety management system (SMS) since 2022, 4 of which led to changes in task cards. I hold a Federal Aviation Administration (FAA) Airframe and Powerplant (A&P) certificate.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "air-traffic-controller",
    industry: "aviation",
    role: "Air Traffic Controller",
    level: "experienced",
    template: "standard",
    blurb: {
      uk: "An approach radar controller with 10 years in air traffic control, a full set of approach ratings and an instructor endorsement.",
      us: "An FAA certified professional controller with 10 years in tower and radar approach control, and 7 controllers trained to certification.",
    },
    person: { name: "Rowena Kerslake", email: "rowena.kerslake@example.com", phone: { uk: "07700 900679", us: "(808) 555-0102" }, location: { uk: "Belfast", us: "Honolulu, HI" } },
    profile: {
      uk: "Air traffic controller with 10 years in aerodrome and approach control, the last 6 as an approach radar controller at a regional airport with around 85,000 movements a year. Holds a UK air traffic controller licence with Aerodrome Control Instrument (ADI), Approach Control Procedural (APP) and Approach Control Surveillance (APS) ratings, a Class 3 medical and an On-the-Job Training Instructor (OJTI) endorsement. Has trained 7 student controllers to validation since 2022. Has filed 18 safety occurrence reports, 3 of which led to changes in unit procedures.",
      us: "Air traffic controller with 10 years in tower and radar approach control, the last 6 as a Federal Aviation Administration (FAA) Certified Professional Controller at a combined approach and en route facility. Separates up to 30 aircraft at a time across 4 radar sectors, from airline jets to military and tour helicopters. Has trained 7 developmental controllers to certification since 2022 as an on-the-job training instructor (OJTI). Has filed 18 safety reports, 3 of which led to changes in facility procedures.",
    },
    experience: [
      {
        title: { uk: "Air Traffic Controller (Approach Radar)", us: "Air Traffic Controller, Certified Professional Controller" },
        org: { uk: "Sandray Air Navigation", us: "Federal Aviation Administration" },
        location: { uk: "Belfast", us: "Honolulu, HI" },
        start: "2020-04",
        current: true,
        bullets: [
          {
            uk: "Provide approach radar control for a regional airport with around 85,000 movements a year, handling up to 18 aircraft on frequency at peak times",
            us: "Control traffic across 4 approach and en route radar sectors, separating up to 30 aircraft at a time, from airline jets to military and tour helicopters",
          },
          {
            uk: "Sequence up to 24 arrivals an hour onto the main runway, keeping average air traffic control delay to under 1 minute per arrival in 2025",
            us: "Sequence up to 40 arrivals an hour onto parallel runways at peak times, keeping average air traffic control delay to under 1 minute per arrival in 2025",
          },
          {
            uk: "Trained 7 student controllers to validation since 2022 as an on-the-job training instructor, logging around 900 hours of instruction",
            us: "Trained 7 developmental controllers to certification since 2022 as an on-the-job training instructor, logging around 900 hours of instruction",
          },
          {
            uk: "Filed 18 safety occurrence reports since 2020, 3 of which led to changes in unit procedures for missed approaches and runway changes",
            us: "Filed 18 voluntary safety reports since 2020, 3 of which led to changes in facility procedures for missed approaches and runway changes",
          },
          {
            uk: "Coordinate around 12 police, air ambulance and military flights a day through the control zone with the area control centre and nearby airfields",
            us: "Coordinate around 12 military flights a day with 3 nearby military bases and the airport tower, from formation arrivals to helicopter crossings",
          },
          {
            uk: "Wrote the unit's 14-page briefing on low visibility procedures in 2024, now used in yearly refresher training for all 22 controllers",
            us: "Wrote the facility's 14-page briefing on hurricane and volcanic ash contingency procedures in 2024, now used in yearly refresher training for all 60 controllers",
          },
        ],
      },
      {
        title: { uk: "Air Traffic Controller (Aerodrome and Approach Procedural)", us: "Air Traffic Controller (Contract Tower)" },
        org: { uk: "Machrie Airports", us: "Kahala Tower Services" },
        location: { uk: "Inverness", us: "Kapolei, HI" },
        start: "2016-10",
        end: "2020-03",
        bullets: [
          {
            uk: "Provided aerodrome and procedural approach control at an airport with around 30,000 movements a year, from airline flights to offshore helicopters",
            us: "Provided tower control at a contract tower with around 60,000 operations a year, from flight training and tour helicopters to military aircraft",
          },
          {
            uk: "Validated on the aerodrome and approach procedural ratings in 5 months, against a unit target of 7",
            us: "Gained the control tower operator certificate and facility rating in 5 months, against a target of 7",
          },
          {
            uk: "Covered the tower alone on night shifts from 2018, handling up to 6 aircraft at a time with no losses of separation",
            us: "Covered local and ground control alone on evening shifts from 2018, handling up to 12 aircraft at a time with no losses of separation",
          },
          {
            uk: "Updated 30 local procedures before 2 Civil Aviation Authority audits of the unit, which found no issues",
            us: "Updated 30 local procedures before 2 FAA evaluations of the tower, which found no issues",
          },
          "Ran the emergency checklist for 9 aircraft emergencies, from bird strikes to an engine failure on departure, each ending in a safe landing",
          {
            uk: "Briefed around 40 airside drivers a year on radio calls and runway crossings for the airport's runway safety team",
            us: "Briefed around 40 airport vehicle drivers a year on radio calls and runway crossings for the airport's runway safety team",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Air Traffic Control Initial Training", us: "Bachelor of Science in Air Traffic Management" },
        org: { uk: "Ardgour Air Traffic College", us: "Embry-Riddle Aeronautical University" },
        end: "2016",
        grade: { uk: "Aerodrome, approach procedural and approach surveillance courses passed", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "UK Air Traffic Controller Licence, ADI, APP and APS ratings", us: "Certified Professional Controller, approach and en route radar" },
        org: { uk: "UK Civil Aviation Authority", us: "Federal Aviation Administration" },
      },
      {
        title: { uk: "On-the-Job Training Instructor endorsement", us: "On-the-job training instructor qualification" },
        org: { uk: "UK Civil Aviation Authority", us: "Federal Aviation Administration" },
        end: "2022",
      },
      {
        title: { uk: "Class 3 medical certificate", us: "Second-class medical certificate" },
        org: { uk: "UK Civil Aviation Authority", us: "Federal Aviation Administration" },
      },
      {
        title: { uk: "English Language Proficiency, Level 6", us: "Control Tower Operator certificate" },
        org: { uk: "UK Civil Aviation Authority", us: "Federal Aviation Administration" },
        end: "2017",
      },
    ],
    skills: [
      { uk: "Approach radar control", us: "Radar approach control" },
      { uk: "Aerodrome control", us: "Tower control" },
      { uk: "Procedural approach control", us: "Ground control" },
      "Arrival sequencing",
      "On-the-job training",
      { uk: "Safety occurrence reports", us: "Safety reports" },
      { uk: "Low visibility procedures", us: "Contingency procedures" },
      "Military flights",
    ],
    names: ["Rowena", "Kerslake", "Sandray", "Machrie", "Kahala", "Ardgour", "Carradale", "Owyhee", "Kapolei", "Inverness", "Embry"],
    letter: {
      job: {
        title: { uk: "Air Traffic Controller (Approach Radar)", us: "Air Traffic Controller" },
        employer: { uk: "Carradale Air Navigation", us: "Owyhee Air Traffic Services" },
        advert: {
          uk: `Air Traffic Controller (Approach Radar)
Carradale Air Navigation, Leeds

Carradale Air Navigation provides air traffic control at 5 UK airports. In April 2027 it takes over approach control at a busy regional airport in Leeds, with around 110,000 movements a year.

The role
You will provide approach radar control as part of a new team of 24 controllers, and help train the controllers who join after you.

What we are looking for
- A UK air traffic controller licence with an APS rating
- A valid Class 3 medical
- At least 3 years of approach radar experience at a busy unit
- An OJTI endorsement, or willingness to gain one
- A strong reporting culture

Salary £72,000 to £86,000, plus shift allowance`,
          us: `Air Traffic Controller
Owyhee Air Traffic Services, Boise, ID

Owyhee Air Traffic Services runs air traffic control at 9 airports in the western US under the FAA Contract Tower Program, including radar approach control at 2 of them.

The role
You will work tower and radar approach positions at our Boise facility, and help train new controllers.

What we are looking for
- FAA certification as a Certified Professional Controller, or a Control Tower Operator certificate with facility ratings
- At least 3 years of radar approach experience
- A current FAA second-class medical
- Experience as an on-the-job training instructor (OJTI)
- A strong safety reporting culture

Pay $38 to $46 an hour, plus shift differential`,
        },
      },
      reason: {
        uk: "I want to move to a busier approach unit and keep training new controllers as an instructor.",
        us: "My family lives in Boise, and I want to work close to home while keeping my radar approach skills.",
      },
      paragraphs: [
        {
          uk: "In April 2027 Carradale Air Navigation takes over approach control at a busy regional airport in Leeds, and I am applying to join its new team as an Air Traffic Controller (Approach Radar). I want to move to a busier approach unit and keep training new controllers as an instructor.",
          us: "My family lives in Boise, and I want to work close to home while keeping my radar approach skills. That is why I am applying for the Air Traffic Controller position at Owyhee Air Traffic Services, working tower and radar approach positions at its Boise facility.",
        },
        {
          uk: "At Sandray Air Navigation I provide approach radar control for a regional airport with around 85,000 movements a year, handling up to 18 aircraft on frequency at peak times. Your advert asks for at least 3 years of approach radar experience at a busy unit. I have 10 years in aerodrome and approach control, the last 6 as an approach radar controller.",
          us: "At the Federal Aviation Administration I control traffic across 4 approach and en route radar sectors, separating up to 30 aircraft at a time, from airline jets to military and tour helicopters. Your advert asks for at least 3 years of radar approach experience. I have 10 years in tower and radar approach control, the last 6 as an FAA Certified Professional Controller.",
        },
        {
          uk: "I sequence up to 24 arrivals an hour onto the main runway, keeping average air traffic control delay to under 1 minute per arrival in 2025. You are also looking for an OJTI endorsement. I have trained 7 student controllers to validation since 2022 as an on-the-job training instructor, logging around 900 hours of instruction.",
          us: "I sequence up to 40 arrivals an hour onto parallel runways at peak times, keeping average air traffic control delay to under 1 minute per arrival in 2025. You are also looking for experience as an on-the-job training instructor (OJTI). I have trained 7 developmental controllers to certification since 2022 as an on-the-job training instructor, logging around 900 hours of instruction.",
        },
        {
          uk: "Your advert also asks for a strong reporting culture. I have filed 18 safety occurrence reports since 2020, 3 of which led to changes in unit procedures for missed approaches and runway changes. I hold a UK air traffic controller licence with ADI, APP and APS ratings, and a Class 3 medical.",
          us: "Your advert also asks for a strong safety reporting culture. I have filed 18 voluntary safety reports since 2020, 3 of which led to changes in facility procedures for missed approaches and runway changes. I also hold an FAA second-class medical certificate.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "airport-operations-officer",
    industry: "aviation",
    role: { uk: "Airport Operations Officer", us: "Airport Operations Specialist" },
    level: "early",
    template: "modern",
    blurb: {
      uk: "An airport operations officer two years into stand planning, airside inspections and disruption, after a start on the check-in desks.",
      us: "An airport operations specialist two years into gate planning, airfield inspections and irregular operations, after a start as an airline customer service agent.",
    },
    person: { name: "Keira Thorley", email: "keira.thorley@example.com", phone: { uk: "07700 900680", us: "(509) 555-0103" }, location: { uk: "Liverpool", us: "Spokane, WA" } },
    profile: {
      uk: "Airport operations officer with 2 years in the operations centre of a regional airport handling 4.2 million passengers a year, after 2 years as a customer service agent. Plans stand allocations for up to 140 flights a day and coordinates airlines, ground handlers and air traffic control during disruption. Cut stand conflicts by 35% in a year and has completed around 600 airside safety inspections. Holds an airside driving permit and a BSc in Aviation Management.",
      us: "Airport operations specialist with 2 years in the operations center of a regional airport handling 4.2 million passengers a year, after 2 years as an airline customer service agent. Plans gate assignments for up to 140 flights a day and coordinates airlines, ground handlers and air traffic control during irregular operations. Cut gate conflicts by 35% in a year and has completed around 600 airfield inspections. Holds a bachelor's degree in aviation management and the Airport Certified Employee (ACE) Operations credential.",
    },
    experience: [
      {
        title: { uk: "Airport Operations Officer", us: "Airport Operations Specialist" },
        org: { uk: "Kestrelmoor Airport", us: "Latah Valley Regional Airport" },
        location: { uk: "Liverpool", us: "Spokane, WA" },
        start: "2024-05",
        current: true,
        bullets: [
          {
            uk: "Plan stand allocations for up to 140 flights a day across 32 stands, updating the plan in real time as flights run early or late",
            us: "Plan gate assignments for up to 140 flights a day across 32 gates, updating the plan in real time as flights run early or late",
          },
          {
            uk: "Cut stand conflicts by 35% in a year by rebuilding the daily stand plan around each airline's turnaround times",
            us: "Cut gate conflicts by 35% in a year by rebuilding the daily gate plan around each airline's turnaround times",
          },
          {
            uk: "Coordinated airlines, ground handlers and air traffic control through 14 disruption events in 2025, from fog and snow to a 3-hour runway closure",
            us: "Coordinated airlines, ground handlers and air traffic control through 14 irregular operations events in 2025, from snow and fog to a 3-hour runway closure",
          },
          {
            uk: "Completed around 600 airside safety inspections of stands, taxiways and the runway, reporting 85 defects for repair",
            us: "Completed around 600 airfield inspections of ramps, taxiways and runways under Federal Aviation Administration (FAA) Part 139 rules, reporting 85 defects",
          },
          "Raised on-time departures from 81% to 86% in 2025 by reviewing every delayed turnaround with the airline and ground handler the next morning",
        ],
      },
      {
        title: "Customer Service Agent",
        org: { uk: "Brightwing Handling", us: "Brightwing Airlines" },
        location: { uk: "Liverpool", us: "Spokane, WA" },
        start: "2022-06",
        end: "2024-04",
        bullets: [
          "Checked in around 150 passengers a shift, from bag drop to special assistance requests",
          "Boarded up to 6 flights a shift, closing 96% of them on time over 2023",
          "Moved around 400 passengers to new flights in a 2-day snow closure, finding hotels for 120 of them",
          "Trained 8 new agents on the check-in and boarding system in 2023",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Aviation Management", us: "Bachelor of Science in Aviation Management" },
        org: { uk: "Buckinghamshire New University", us: "Central Washington University" },
        end: "2022",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Airside Driving Permit (manoeuvring area)", us: "Airport Certified Employee (ACE), Operations" },
        org: { uk: "Kestrelmoor Airport", us: "American Association of Airport Executives" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "Stand planning", us: "Gate planning" },
      { uk: "Disruption", us: "Irregular operations" },
      { uk: "Airside safety inspections", us: "Airfield inspections" },
      "Turnaround times",
      "On-time departures",
      "Passenger check-in",
      "Boarding",
      "Special assistance",
      { uk: "Airside driving", us: "FAA Part 139" },
    ],
    names: ["Keira", "Thorley", "Kestrelmoor", "Latah", "Brightwing", "Glenmorven", "Tamarack", "Spokane", "Buckinghamshire"],
    letter: {
      job: {
        title: { uk: "Airport Operations Officer", us: "Airport Operations Specialist" },
        employer: { uk: "Glenmorven Airport", us: "Tamarack International Airport" },
        advert: {
          uk: `Airport Operations Officer
Glenmorven Airport, Newcastle

Glenmorven Airport handles 6 million passengers a year on 40 stands. We are opening a new 8-stand pier in 2027.

The role
You will work in our airport operations centre on a rotating shift pattern, planning stands, inspecting the airfield and leading our response to disruption.

What we are looking for
- At least 1 year in airport operations
- Experience planning stand allocations
- Knowledge of airside safety
- Calm coordination of airlines, ground handlers and air traffic control in disruption
- An airside driving permit, or willingness to gain one

Salary £31,000 to £35,000, plus shift allowance`,
          us: `Airport Operations Specialist
Tamarack International Airport, Sacramento, CA

Tamarack International Airport serves 7 million passengers a year from 44 gates. We are opening a new 8-gate concourse in 2027.

The role
You will work in our airport operations center on rotating shifts, planning gates, inspecting the airfield and leading our response to irregular operations.

What we are looking for
- At least 1 year in airport operations
- Experience planning gate assignments
- Knowledge of FAA Part 139 airfield inspections
- Calm coordination of airlines, ground handlers and air traffic control during irregular operations
- The AAAE ACE Operations credential, or willingness to earn it

Pay $26 to $31 an hour`,
        },
      },
      reason: {
        uk: "I want to plan stands at a larger airport, and the new pier is a chance to build a stand plan from the start.",
        us: "I want to plan gates at a larger airport, and the new concourse is a chance to build a gate plan from the start.",
      },
      paragraphs: [
        {
          uk: "This is my application for the Airport Operations Officer post at Glenmorven Airport as it opens a new 8-stand pier in 2027. I want to plan stands at a larger airport, and the new pier is a chance to build a stand plan from the start.",
          us: "This is my application for the Airport Operations Specialist position at Tamarack International Airport as it opens a new 8-gate concourse in 2027. I want to plan gates at a larger airport, and the new concourse is a chance to build a gate plan from the start.",
        },
        {
          uk: "At Kestrelmoor Airport I plan stand allocations for up to 140 flights a day across 32 stands, updating the plan in real time as flights run early or late. Your advert asks for experience planning stand allocations. I cut stand conflicts by 35% in a year by rebuilding the daily stand plan around each airline's turnaround times.",
          us: "At Latah Valley Regional Airport I plan gate assignments for up to 140 flights a day across 32 gates, updating the plan in real time as flights run early or late. Your advert asks for experience planning gate assignments. I cut gate conflicts by 35% in a year by rebuilding the daily gate plan around each airline's turnaround times.",
        },
        {
          uk: "You are also looking for calm coordination of airlines, ground handlers and air traffic control in disruption. I coordinated airlines, ground handlers and air traffic control through 14 disruption events in 2025, from fog and snow to a 3-hour runway closure. I also raised on-time departures from 81% to 86% in 2025 by reviewing every delayed turnaround with the airline and ground handler the next morning.",
          us: "You are also looking for calm coordination of airlines, ground handlers and air traffic control during irregular operations. I coordinated airlines, ground handlers and air traffic control through 14 irregular operations events in 2025, from snow and fog to a 3-hour runway closure. I also raised on-time departures from 81% to 86% in 2025 by reviewing every delayed turnaround with the airline and ground handler the next morning.",
        },
        {
          uk: "I have completed around 600 airside safety inspections of stands, taxiways and the runway, reporting 85 defects for repair. I hold an airside driving permit and a BSc in Aviation Management.",
          us: "I have completed around 600 airfield inspections of ramps, taxiways and runways under Federal Aviation Administration (FAA) Part 139 rules, reporting 85 defects. I hold a bachelor's degree in aviation management and the Airport Certified Employee (ACE) Operations credential.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "ground-handling-agent",
    industry: "aviation",
    role: { uk: "Ground Handling Agent", us: "Ramp Agent" },
    level: "early",
    template: "clearline",
    blurb: {
      uk: "A ground handling agent with 3 years on the ramp, from loading and push-backs to deicing, and 97% of flights away on time.",
      us: "A ramp agent with 3 years at a regional airport, from loading and push-backs to deicing, and 97% of flights away on time.",
    },
    person: { name: "Reuben Kwarteng", email: "reuben.kwarteng@example.com", phone: { uk: "07700 900681", us: "(541) 555-0104" }, location: { uk: "Birmingham", us: "Bend, OR" } },
    profile: {
      uk: "Ground handling agent with 3 years on the ramp at a regional airport, turning around up to 8 Airbus A320 and Boeing 737 flights a shift. Loads bags and cargo to the loading instruction report, drives push-back tugs and belt loaders, and has deiced around 260 aircraft over 2 winters. Turned 1,600 flights in 2025, with 97% of departures on time against a 95% target and no ground damage. Holds an airside driving permit and dangerous goods awareness training.",
      us: "Ramp agent with 3 years at a regional airport, turning up to 8 Airbus A320 and Boeing 737 flights a shift. Loads bags and cargo to the loading instructions, drives push-back tugs and belt loaders, and has deiced around 260 aircraft over 2 winters. Turned 1,600 flights in 2025, with 97% of departures on time against a 95% target and no ground damage. Holds a security identification display area (SIDA) badge and dangerous goods awareness training.",
    },
    experience: [
      {
        title: { uk: "Ground Handling Agent", us: "Ramp Agent" },
        org: "Merrivale Ground Services",
        location: { uk: "Birmingham", us: "Redmond, OR" },
        start: "2023-04",
        current: true,
        bullets: [
          {
            uk: "Complete up to 8 aircraft turnarounds a shift on Airbus A320 and Boeing 737 flights, unloading and loading around 150 bags per flight in 25-minute turns",
            us: "Complete up to 8 aircraft turnarounds a shift on Airbus A320 and Boeing 737 flights, unloading and loading around 150 bags per flight in 35-minute turns",
          },
          {
            uk: "Load bags, cargo and mail by belt loader to the loading instruction report, with no load errors found in 6 load audits in 2025",
            us: "Load bags, cargo and mail by belt loader to the weight and balance loading instructions, with no load errors found in 6 load audits in 2025",
          },
          "Drove the push-back tug on around 1,400 departures since 2024, talking to the flight deck by headset, with no ground damage incidents",
          {
            uk: "Deiced around 260 aircraft over 2 winters from the deicing rig, following each airline's fluid and holdover time rules",
            us: "Deiced around 260 aircraft over 2 winters from a deicing truck, following each airline's fluid and holdover time rules",
          },
          {
            uk: "Turned 1,600 flights in 2025, with 97% of departures on time against a 95% target, by having bags and equipment at the stand before each arrival",
            us: "Turned 1,600 flights in 2025, with 97% of departures on time against a 95% target, by having bags and equipment at the gate before each arrival",
          },
          {
            uk: "Reported 9 finds of foreign object debris (FOD) on stands in 2025, each cleared before the next arrival",
            us: "Reported 9 finds of foreign object debris (FOD) at the gates in 2025, each cleared before the next arrival",
          },
        ],
      },
      {
        title: { uk: "Warehouse Operative", us: "Warehouse Associate" },
        org: { uk: "Strathcarron Distribution", us: "Deschutes Distribution" },
        location: { uk: "Coventry", us: "Bend, OR" },
        start: "2021-08",
        end: "2023-03",
        bullets: [
          "Picked and packed around 180 orders a shift at 99.6% accuracy over 2022",
          {
            uk: "Loaded around 12 delivery lorries a shift by forklift, building each load to the route plan",
            us: "Loaded around 12 delivery trucks a shift by forklift, building each load to the route plan",
          },
          {
            uk: "Trained 4 new starters on the warehouse scanners and safe lifting in 2022",
            us: "Trained 4 new hires on the warehouse scanners and safe lifting in 2022",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels", us: "High School Diploma" },
        org: { uk: "Skelbo Sixth Form College", us: "Crooked River High School" },
        end: "2021",
        grade: { uk: "Business, Geography and Physical Education", us: "" },
      },
    ],
    certificates: [
      {
        title: { uk: "Airside Driving Permit", us: "Security Identification Display Area (SIDA) badge" },
        org: { uk: "Birmingham Airport", us: "Redmond Municipal Airport" },
        end: "2023",
      },
      { title: "Dangerous Goods Awareness Training", org: "Merrivale Ground Services", end: "2025" },
      {
        title: { uk: "Counterbalance Forklift Licence", us: "Forklift Operator Certification" },
        org: { uk: "Strathcarron Distribution", us: "Deschutes Distribution" },
        end: "2021",
      },
    ],
    skills: [
      "Aircraft turnarounds",
      { uk: "Loading instruction reports", us: "Loading instructions" },
      "Belt loaders",
      "Push-back tugs",
      "Deicing",
      "On-time departures",
      "Foreign object debris",
      "Forklift loading",
      "Dangerous goods awareness",
    ],
    names: ["Reuben", "Kwarteng", "Merrivale", "Strathcarron", "Deschutes", "Skelbo", "Skerray", "A320"],
    letter: {
      job: {
        title: { uk: "Ground Handling Agent", us: "Ramp Agent" },
        employer: "Skerray Aviation Services",
        advert: {
          uk: `Ground Handling Agent
Skerray Aviation Services, Manchester

Skerray Aviation Services handles 220 flights a day for 14 airlines at Manchester, and is taking on 3 new long-haul airlines in 2027.

The role
Join our ramp team, turning around short-haul and long-haul aircraft in a team of 6 on a 4-on, 4-off shift pattern.

What we are looking for
- At least 1 year of ramp experience
- Experience loading to a loading instruction report
- Push-back and deicing experience, or willingness to train
- An airside driving permit
- A strong safety record

Salary £26,500, plus shift allowance`,
          us: `Ramp Agent
Skerray Aviation Services, Seattle, WA

Skerray Aviation Services handles 220 flights a day for 14 airlines in Seattle, and is taking on 3 new long-haul airlines in 2027.

The role
Join our ramp team, turning narrow-body and wide-body aircraft in a team of 6 on rotating shifts.

What we are looking for
- At least 1 year of ramp experience
- Experience loading to weight and balance instructions
- Push-back and deicing experience, or willingness to train
- The ability to pass a SIDA badge background check
- A strong safety record

Pay $22 an hour, plus shift differential`,
        },
      },
      reason: "I want to move to a busier airport and learn to turn wide-body aircraft.",
      paragraphs: [
        {
          uk: "On every shift at Merrivale Ground Services I complete up to 8 aircraft turnarounds, and I am applying to Skerray Aviation Services as a Ground Handling Agent. I want to move to a busier airport and learn to turn wide-body aircraft.",
          us: "On every shift at Merrivale Ground Services I complete up to 8 aircraft turnarounds, and I am applying to Skerray Aviation Services as a Ramp Agent. I want to move to a busier airport and learn to turn wide-body aircraft.",
        },
        {
          uk: "Your advert asks for experience loading to a loading instruction report. I load bags, cargo and mail by belt loader to the loading instruction report, with no load errors found in 6 load audits in 2025. On Airbus A320 and Boeing 737 flights I unload and load around 150 bags per flight in 25-minute turns.",
          us: "Your advert asks for experience loading to weight and balance instructions. I load bags, cargo and mail by belt loader to the weight and balance loading instructions, with no load errors found in 6 load audits in 2025. On Airbus A320 and Boeing 737 flights I unload and load around 150 bags per flight in 35-minute turns.",
        },
        "You are also looking for push-back and deicing experience. I have driven the push-back tug on around 1,400 departures since 2024, talking to the flight deck by headset, with no ground damage incidents. I have also deiced around 260 aircraft over 2 winters, following each airline's fluid and holdover time rules.",
        {
          uk: "I turned 1,600 flights in 2025, with 97% of departures on time against a 95% target, by having bags and equipment at the stand before each arrival. Your advert also asks for a strong safety record. I reported 9 finds of foreign object debris (FOD) on stands in 2025, each cleared before the next arrival, and I hold an airside driving permit and dangerous goods awareness training.",
          us: "I turned 1,600 flights in 2025, with 97% of departures on time against a 95% target, by having bags and equipment at the gate before each arrival. Your advert also asks for a strong safety record. I reported 9 finds of foreign object debris (FOD) at the gates in 2025, each cleared before the next arrival, and I hold a security identification display area (SIDA) badge and dangerous goods awareness training.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "bi-developer",
    industry: "data",
    role: "Business Intelligence Developer",
    level: "experienced",
    template: "index",
    blurb: "A business intelligence developer with 7 years in Power BI and SQL Server, building data models and dashboards that managers use every week.",
    person: { name: "Nikhil Rao", email: "nikhil.rao@example.com", phone: { uk: "07700 900682", us: "(775) 555-0105" }, location: { uk: "Nottingham", us: "Reno, NV" } },
    profile: {
      uk: "Business intelligence (BI) developer with 7 years building reports and data models, the last 4 in Power BI and SQL Server for a retail group with 240 stores. Builds star-schema data models and dashboards used by around 450 managers each week, from store managers to the board. Cut the nightly data refresh from 3 hours 40 minutes to 55 minutes and replaced 60 spreadsheet reports with 12 Power BI dashboards. Holds the Microsoft Certified: Power BI Data Analyst Associate certification.",
      us: "Business intelligence (BI) developer with 7 years building reports and data models, the last 4 in Power BI and SQL Server for a retail chain with 240 stores. Builds star-schema data models and dashboards used by around 450 managers each week, from store managers to executives. Cut the nightly data refresh from 3 hours 40 minutes to 55 minutes and replaced 60 spreadsheet reports with 12 Power BI dashboards. Holds the Microsoft Certified: Power BI Data Analyst Associate certification.",
    },
    experience: [
      {
        title: "Business Intelligence Developer",
        org: { uk: "Cresswell Retail Group", us: "Sagebrush Outfitters" },
        location: { uk: "Nottingham", us: "Reno, NV" },
        start: "2022-05",
        current: true,
        bullets: [
          {
            uk: "Build and maintain 12 Power BI dashboards on sales, stock and staffing, with 150 Data Analysis Expressions (DAX) measures, used by around 450 managers each week",
            us: "Build and maintain 12 Power BI dashboards on sales, inventory and staffing, with 150 Data Analysis Expressions (DAX) measures, used by around 450 managers each week",
          },
          {
            uk: "Designed a star-schema data model in SQL Server for sales and stock across 240 stores, replacing 60 spreadsheet reports that took 30 hours a week to update",
            us: "Designed a star-schema data model in SQL Server for sales and inventory across 240 stores, replacing 60 spreadsheet reports that took 30 hours a week to update",
          },
          "Cut the nightly data refresh from 3 hours 40 minutes to 55 minutes by moving 18 tables to incremental refresh and rewriting the slowest SQL queries",
          "Added automated data quality checks on 9 source feeds, catching around 25 failed or duplicate loads a month before managers saw the figures",
          "Wrote row-level security rules in Power BI, giving each of 32 area managers a view of their own stores and replacing 32 separate copies of the same report",
          "Trained 40 managers in reading and filtering the dashboards through 8 short workshops in 2025, cutting report requests to the BI team by a third",
        ],
      },
      {
        title: { uk: "Management Information Analyst", us: "Reporting Analyst" },
        org: { uk: "Lenton Building Society", us: "Silverpeak Credit Union" },
        location: { uk: "Derby", us: "Sparks, NV" },
        start: "2019-01",
        end: "2022-04",
        bullets: [
          {
            uk: "Built 20 monthly reports in SQL Server Reporting Services (SSRS) on mortgage arrears, savings and branch sales for the executive team",
            us: "Built 20 monthly reports in SQL Server Reporting Services (SSRS) on loan delinquency, deposits and branch sales for the executive team",
          },
          "Automated 14 Excel reports with SQL and Power Query, saving around 2 days of work a month",
          "Moved the board pack from Excel to Power BI in 2021, cutting the time to prepare it from 4 days to 1",
          {
            uk: "Found and fixed a join error that overstated active members by 3,100 in a quarterly return to the regulator",
            us: "Found and fixed a join error that overstated active members by 3,100 in a quarterly report to the regulator",
          },
          "Wrote a 220-field data dictionary for the finance and risk teams, agreeing one definition for each measure",
          "Met 6 department heads each quarter to agree report changes, cutting one-off requests by 40% in a year",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Mathematics", us: "Bachelor of Science in Mathematics" },
        org: { uk: "University of Nottingham", us: "University of Nevada, Reno" },
        end: "2018",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      { title: "Microsoft Certified: Power BI Data Analyst Associate", org: "Microsoft", end: "2022" },
      { title: "Microsoft Certified: Fabric Analytics Engineer Associate", org: "Microsoft", end: "2025" },
    ],
    skills: [
      "Power BI",
      "SQL Server",
      "Star-schema data models",
      "DAX",
      "Incremental refresh",
      "Data quality checks",
      "Row-level security",
      "SQL Server Reporting Services",
      "Power Query",
      "Dashboard training",
    ],
    names: ["Nikhil", "Rao", "Cresswell", "Sagebrush", "Lenton", "Silverpeak", "Bulwell"],
    letter: {
      job: {
        title: "Business Intelligence Developer",
        employer: "Bulwell Foods",
        advert: {
          uk: `Business Intelligence Developer
Bulwell Foods, Nottingham (hybrid)

Bulwell Foods makes chilled ready meals for 4 supermarket chains from 3 factories. We are moving our reporting from spreadsheets to Power BI, with a new data model for production, waste and orders.

The role
You will design data models and build Power BI dashboards for our factory, supply chain and finance managers.

What we are looking for
- At least 3 years in BI development with Power BI and SQL Server
- Experience designing star-schema data models
- Strong DAX and SQL
- A habit of checking data quality before figures reach managers
- Experience training users

Salary £50,000 to £58,000`,
          us: `Business Intelligence Developer
Bulwell Foods, Reno, NV (hybrid)

Bulwell Foods makes refrigerated ready meals for 4 grocery chains from 3 plants. We are moving our reporting from spreadsheets to Power BI, with a new data model for production, waste and orders.

The role
You will design data models and build Power BI dashboards for our plant, supply chain and finance managers.

What we are looking for
- At least 3 years in BI development with Power BI and SQL Server
- Experience designing star-schema data models
- Strong DAX and SQL
- A habit of checking data quality before figures reach managers
- Experience training users

Salary $95,000 to $110,000`,
        },
      },
      reason: {
        uk: "I want to move a business from spreadsheets to Power BI, and to work closer to the factories and supply chain that the figures describe.",
        us: "I want to move a business from spreadsheets to Power BI, and to work closer to the plants and supply chain that the figures describe.",
      },
      paragraphs: [
        {
          uk: "Having replaced 60 spreadsheet reports with 12 Power BI dashboards at a retail group, I am applying for the Business Intelligence Developer role at Bulwell Foods. I want to move a business from spreadsheets to Power BI, and to work closer to the factories and supply chain that the figures describe.",
          us: "Having replaced 60 spreadsheet reports with 12 Power BI dashboards at a retail chain, I am applying for the Business Intelligence Developer role at Bulwell Foods. I want to move a business from spreadsheets to Power BI, and to work closer to the plants and supply chain that the figures describe.",
        },
        {
          uk: "At Cresswell Retail Group I build and maintain 12 Power BI dashboards on sales, stock and staffing, with 150 Data Analysis Expressions (DAX) measures, used by around 450 managers each week. Your advert asks for experience designing star-schema data models. I designed a star-schema data model in SQL Server for sales and stock across 240 stores, replacing 60 spreadsheet reports that took 30 hours a week to update.",
          us: "At Sagebrush Outfitters I build and maintain 12 Power BI dashboards on sales, inventory and staffing, with 150 Data Analysis Expressions (DAX) measures, used by around 450 managers each week. Your advert asks for experience designing star-schema data models. I designed a star-schema data model in SQL Server for sales and inventory across 240 stores, replacing 60 spreadsheet reports that took 30 hours a week to update.",
        },
        "You are also looking for a habit of checking data quality before figures reach managers. I added automated data quality checks on 9 source feeds, catching around 25 failed or duplicate loads a month before managers saw the figures. I also cut the nightly data refresh from 3 hours 40 minutes to 55 minutes by moving 18 tables to incremental refresh and rewriting the slowest SQL queries.",
        "Your advert also asks for experience training users. I trained 40 managers in reading and filtering the dashboards through 8 short workshops in 2025, cutting report requests to the BI team by a third. I hold the Microsoft Certified: Power BI Data Analyst Associate certification.",
        CLOSE,
      ],
    },
  },
  {
    id: "management-consultant",
    industry: "business",
    role: "Senior Management Consultant",
    level: "senior",
    template: "margin-notes",
    blurb: {
      uk: "A senior management consultant with 13 years in operations and public sector work, leading teams that found £46 million of savings for clients.",
      us: "A senior management consultant with 13 years in operations and public sector work, leading teams that found $58 million in savings for clients.",
    },
    person: { name: "Philippa Fairbairn", email: "philippa.fairbairn@example.com", phone: { uk: "07700 900683", us: "(385) 555-0106" }, location: { uk: "Manchester", us: "Salt Lake City, UT" } },
    profile: {
      uk: "Senior management consultant with 13 years in operations and public sector work, the last 10 years in consulting for NHS trusts, councils and central government. Leads teams of 3 to 6 consultants on projects with fees from £400,000 to £1.8 million, and has found £46 million of savings for clients over 5 years, with £31 million delivered so far. Started out as a business analyst at an NHS trust, modelling theatre capacity and waiting lists. Holds an MBA and is a Chartered Management Consultant (ChMC).",
      us: "Senior management consultant with 13 years in operations and public sector work, the last 10 years in consulting for health systems, state agencies and city governments. Leads teams of 3 to 6 consultants on projects with fees from $500,000 to $2.2 million, and has found $58 million in savings for clients over 5 years, with $39 million delivered so far. Started out as an operations analyst at a health system, modeling operating room capacity and wait times. Holds an MBA and is a Certified Management Consultant (CMC).",
    },
    experience: [
      {
        title: "Senior Management Consultant",
        org: "Halyard Partners",
        location: { uk: "Manchester", us: "Salt Lake City, UT" },
        start: "2021-06",
        current: true,
        bullets: [
          {
            uk: "Lead teams of 3 to 6 consultants on operations and cost projects for NHS trusts, councils and government departments, with fees from £400,000 to £1.8 million",
            us: "Lead teams of 3 to 6 consultants on operations and cost projects for health systems, state agencies and city governments, with fees from $500,000 to $2.2 million",
          },
          {
            uk: "Found £46 million of savings for clients over 5 years, with £31 million delivered so far and checked each month with each client's finance team",
            us: "Found $58 million in savings for clients over 5 years, with $39 million delivered so far and checked each month with each client's finance team",
          },
          {
            uk: "Redesigned outpatient booking for a hospital trust with 600,000 appointments a year, cutting missed appointments from 9% to 6% and saving £2.4 million a year",
            us: "Redesigned outpatient scheduling for a health system with 600,000 appointments a year, cutting no-shows from 9% to 6% and saving $3.0 million a year",
          },
          {
            uk: "Led a review of a county council's home care buying, moving 1,400 care packages to 6 framework providers and saving £3.1 million in the first year",
            us: "Led a review of a state agency's home care purchasing, moving 1,400 care plans to 6 contracted providers and saving $3.9 million in the first year",
          },
          {
            uk: "Built client relationships that led to 7 follow-on projects worth £3.9 million in fees since 2022, through quarterly reviews with each sponsor",
            us: "Built client relationships that led to 7 follow-on projects worth $4.8 million in fees since 2022, through quarterly reviews with each sponsor",
          },
          "Coached 5 consultants to promotion since 2022, and wrote the firm's 30-page guide to public sector cost reviews, now used on every new project",
        ],
      },
      {
        title: "Management Consultant",
        org: "Pentreath Consulting",
        location: { uk: "Leeds", us: "Denver, CO" },
        start: "2016-09",
        end: "2021-05",
        bullets: [
          {
            uk: "Ran the analysis on 14 projects for NHS trusts and councils, from demand modelling to process mapping with front-line staff",
            us: "Ran the analysis on 14 projects for health systems and city governments, from demand modeling to process mapping with front-line staff",
          },
          {
            uk: "Cut on-the-day theatre cancellations at a hospital trust from 11% to 7% by redesigning pre-operative assessment, freeing around 1,900 theatre slots a year",
            us: "Cut same-day operating room cancellations at a hospital from 11% to 7% by redesigning pre-operative testing, freeing around 1,900 operating room slots a year",
          },
          {
            uk: "Built a staffing model for a council's 3 contact centres, cutting agency staff spend by £750,000 a year",
            us: "Built a staffing model for a city's 3 call centers, cutting temporary staffing spend by $950,000 a year",
          },
          "Wrote and presented 20 board papers and business cases for clients, 17 of them approved without changes",
        ],
      },
      {
        title: { uk: "Business Analyst", us: "Operations Analyst" },
        org: { uk: "Calverley NHS Foundation Trust", us: "Wasatch Valley Health" },
        location: { uk: "Leeds", us: "Ogden, UT" },
        start: "2013-09",
        end: "2016-08",
        bullets: [
          {
            uk: "Analysed waiting list data for 14 specialities each week, reporting waits against the 18-week target to the executive team",
            us: "Analyzed wait time data for 14 specialties each week, reporting waits against the 30-day access target to the executive team",
          },
          {
            uk: "Built a capacity model for the trust's 22 operating theatres, used to plan a 3-theatre expansion in 2016",
            us: "Built a capacity model for the system's 22 operating rooms, used to plan a 3-room expansion in 2016",
          },
          "Cut clinic letter turnaround from 14 to 5 days by mapping the process with 30 secretaries and doctors",
        ],
      },
    ],
    education: [
      {
        title: { uk: "MBA", us: "Master of Business Administration (MBA)" },
        org: { uk: "Lancaster University Management School", us: "University of Utah" },
        end: "2019",
        grade: { uk: "Distinction", us: "GPA 3.8" },
      },
      {
        title: { uk: "BSc (Hons) Economics", us: "Bachelor of Science in Economics" },
        org: { uk: "University of Leeds", us: "Utah State University" },
        end: "2013",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Chartered Management Consultant (ChMC)", us: "Certified Management Consultant (CMC)" },
        org: { uk: "Chartered Management Institute", us: "Institute of Management Consultants USA" },
        end: "2022",
      },
      {
        title: { uk: "PRINCE2 Practitioner", us: "Project Management Professional (PMP)" },
        org: { uk: "PeopleCert", us: "Project Management Institute" },
        end: "2017",
      },
      {
        title: "Lean Six Sigma Green Belt",
        org: { uk: "British Quality Foundation", us: "American Society for Quality" },
        end: "2015",
      },
    ],
    skills: [
      "Cost reviews",
      "Savings delivery",
      "Process mapping",
      "Demand modelling",
      "Business cases",
      "Staffing models",
      "Capacity planning",
      "Client relationships",
      "Coaching",
    ],
    names: ["Philippa", "Fairbairn", "Halyard", "Pentreath", "Calverley", "Wasatch", "Lowther", "ChMC", "PeopleCert", "Ogden"],
    letter: {
      job: {
        title: "Senior Management Consultant",
        employer: "Lowther Advisory",
        advert: {
          uk: `Senior Management Consultant, Health and Care
Lowther Advisory, Manchester (hybrid)

Lowther Advisory is a 60-person consultancy working with NHS trusts, councils and government departments on operations and cost. We are growing our health and care practice.

The role
You will lead teams of 3 to 6 consultants on projects for health and care clients, own client relationships and help grow the practice.

What we are looking for
- At least 8 years in management consulting or public sector operations
- A record of finding and delivering savings
- Experience leading teams and coaching consultants
- Strong client relationships at board level
- An MBA or a professional qualification such as ChMC

Salary £95,000 to £110,000, plus bonus`,
          us: `Senior Management Consultant, Health and Human Services
Lowther Advisory, Salt Lake City, UT (hybrid)

Lowther Advisory is a 60-person consulting firm working with health systems, state agencies and city governments on operations and cost. We are growing our health and human services practice.

The role
You will lead teams of 3 to 6 consultants on projects for health and human services clients, own client relationships and help grow the practice.

What we are looking for
- At least 8 years in management consulting or public sector operations
- A record of finding and delivering savings
- Experience leading teams and coaching consultants
- Strong client relationships at the executive level
- An MBA, and CMC certification preferred

Salary $165,000 to $190,000, plus bonus`,
        },
      },
      reason: {
        uk: "I want to focus on health and care clients, where a better booking system or staff rota means patients are seen sooner.",
        us: "I want to focus on health and human services clients, where better scheduling or staffing means patients are seen sooner.",
      },
      paragraphs: [
        {
          uk: "Since 2016 I have worked as a management consultant for NHS trusts, councils and central government, and I am applying for the Senior Management Consultant role at Lowther Advisory. I want to focus on health and care clients, where a better booking system or staff rota means patients are seen sooner.",
          us: "Since 2016 I have worked as a management consultant for health systems, state agencies and city governments, and I am applying for the Senior Management Consultant role at Lowther Advisory. I want to focus on health and human services clients, where better scheduling or staffing means patients are seen sooner.",
        },
        {
          uk: "Your advert asks for a record of finding and delivering savings. I found £46 million of savings for clients over 5 years, with £31 million delivered so far and checked each month with each client's finance team. I also redesigned outpatient booking for a hospital trust with 600,000 appointments a year, cutting missed appointments from 9% to 6% and saving £2.4 million a year.",
          us: "Your advert asks for a record of finding and delivering savings. I found $58 million in savings for clients over 5 years, with $39 million delivered so far and checked each month with each client's finance team. I also redesigned outpatient scheduling for a health system with 600,000 appointments a year, cutting no-shows from 9% to 6% and saving $3.0 million a year.",
        },
        {
          uk: "You are also looking for experience leading teams and coaching consultants. At Halyard Partners I lead teams of 3 to 6 consultants on operations and cost projects for NHS trusts, councils and government departments, with fees from £400,000 to £1.8 million. I have coached 5 consultants to promotion since 2022, and I wrote the firm's 30-page guide to public sector cost reviews, now used on every new project.",
          us: "You are also looking for experience leading teams and coaching consultants. At Halyard Partners I lead teams of 3 to 6 consultants on operations and cost projects for health systems, state agencies and city governments, with fees from $500,000 to $2.2 million. I have coached 5 consultants to promotion since 2022, and I wrote the firm's 30-page guide to public sector cost reviews, now used on every new project.",
        },
        {
          uk: "Your advert also asks for strong client relationships at board level. I built client relationships that led to 7 follow-on projects worth £3.9 million in fees since 2022, through quarterly reviews with each sponsor. I hold an MBA and am a Chartered Management Consultant (ChMC).",
          us: "Your advert also asks for strong client relationships at the executive level. I built client relationships that led to 7 follow-on projects worth $4.8 million in fees since 2022, through quarterly reviews with each sponsor. I hold an MBA and am a Certified Management Consultant (CMC).",
        },
        CLOSE,
      ],
    },
  },
];
